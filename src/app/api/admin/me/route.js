import { NextResponse } from 'next/server';
import { isSessionValid } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return NextResponse.json(
    { authenticated: isSessionValid(request) },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
