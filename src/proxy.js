import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'admin_session';

const PUBLIC_API_ADMIN_POST = new Set(['/api/admin/visits', '/api/admin/login', '/api/admin/logout']);
const PUBLIC_API_ADMIN_GET = new Set(['/api/admin/me', '/api/admin/login']);

function readCookie(request, name) {
  const cookieHeader = request.headers.get('cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

async function verifyTokenSafe(token) {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
    if (!secret || !token) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [dataB64, sigB64] = parts;

    const enc = new TextEncoder();
    const keyData = await crypto.subtle.digest('SHA-256', enc.encode(String(secret)));
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const dataBytes = Uint8Array.from(Buffer.from(dataB64, 'base64url'));
    const sigBytes = Uint8Array.from(Buffer.from(sigB64, 'base64url'));
    const ok = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
    if (!ok) return false;

    const payload = JSON.parse(Buffer.from(dataBytes).toString());
    if (!payload.exp || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Protect /admin pages (except the login page itself)
  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && pathname !== '/admin/login') {
    const token = readCookie(request, SESSION_COOKIE);
    const valid = token ? await verifyTokenSafe(token) : false;
    if (!valid) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin/')) {
    const method = request.method.toUpperCase();
    const allowList = method === 'GET' ? PUBLIC_API_ADMIN_GET : PUBLIC_API_ADMIN_POST;
    if (allowList.has(pathname)) {
      return NextResponse.next();
    }
    const token = readCookie(request, SESSION_COOKIE);
    const valid = token ? await verifyTokenSafe(token) : false;
    if (!valid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
