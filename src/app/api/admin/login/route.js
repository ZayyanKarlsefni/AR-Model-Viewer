import { NextResponse } from 'next/server';
import {
  verifyPassword,
  checkLoginRateLimit,
  createSessionCookie,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rate = checkLoginRateLimit(request);
  if (rate.limited) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': Math.ceil(rate.retryAfterMs / 1000) } }
    );
  }

  let password;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const cookie = createSessionCookie();
  if (!cookie) {
    return NextResponse.json({ error: 'Server secret not configured' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie);
  return res;
}
