import crypto from 'crypto';
import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// In-memory rate limiter (per IP, resets per serverless instance)
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return secret;
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // constant-time-ish: still compare to avoid early exit leaks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  return timingSafeEqual(password, expected);
}

function signSession(payload) {
  const secret = getSecret();
  if (!secret) return null;
  const data = Buffer.from(JSON.stringify(payload));
  const key = crypto.createHash('sha256').update(String(secret)).digest();
  const sig = crypto.createHmac('sha256', key).update(data).digest('base64url');
  return `${data.toString('base64url')}.${sig}`;
}

export function verifySession(token) {
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [dataB64, sigB64] = parts;
  try {
    const data = Buffer.from(dataB64, 'base64url');
    const key = crypto.createHash('sha256').update(String(secret)).digest();
    const expectedSig = crypto.createHmac('sha256', key).update(data).digest('base64url');
    if (!timingSafeEqual(sigB64, expectedSig)) return null;
    const payload = JSON.parse(data.toString());
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionCookie() {
  const exp = Date.now() + SESSION_TTL_MS;
  const token = signSession({ exp });
  if (!token) return null;
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  };
}

function getRequestIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export function checkLoginRateLimit(request) {
  const ip = getRequestIp(request);
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, firstAt: now };
  if (now - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.firstAt = now;
  }
  entry.count += 1;
  loginAttempts.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return { limited: true, retryAfterMs: RATE_LIMIT_WINDOW_MS - (now - entry.firstAt) };
  }
  return { limited: false };
}

export function isSessionValid(request) {
  const cookies = request.cookies.get(SESSION_COOKIE);
  return verifySession(cookies?.value) !== null;
}

export function verifyAdminSession(request) {
  if (!isSessionValid(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  return null;
}
