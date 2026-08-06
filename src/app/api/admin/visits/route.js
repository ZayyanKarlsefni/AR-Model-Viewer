import { list, put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { logVisitTurso, listVisitsTurso } from '@/lib/db';

export const dynamic = 'force-dynamic';

const LOG_PATHNAME = 'logs/visits.json';
const MAX_RECORDS = 100;
const MAX_RETRIES = 3;

function parseDevice(userAgent) {
  if (!userAgent) return 'Unknown Device';
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iPhone / iOS';
  if (ua.includes('android')) return 'Android Mobile';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac Desktop';
  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('linux')) return 'Linux PC';
  return 'Mobile / Desktop';
}

async function readVisits(token) {
  const { blobs } = await list({ prefix: LOG_PATHNAME, token });
  if (!blobs || blobs.length === 0) return { visits: [], blobUrl: null };
  const blob = blobs[0];
  try {
    const res = await fetch(blob.url);
    if (!res.ok) return { visits: [], blobUrl: blob.url };
    const visits = await res.json();
    return { visits: Array.isArray(visits) ? visits : [], blobUrl: blob.url };
  } catch {
    return { visits: [], blobUrl: blob.url };
  }
}

export async function GET(request) {
  const authError = verifyAdminSession(request);
  if (authError) return authError;

  try {
    const turso = await listVisitsTurso();
    if (turso) {
      return NextResponse.json({ visits: turso }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured' }, { status: 500 });
    }
    const { visits } = await readVisits(token);
    return NextResponse.json({ visits }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { code, isAr } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured' }, { status: 500 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const device = parseDevice(userAgent);

    const newRecord = {
      code,
      device,
      timestamp: new Date().toISOString(),
      isAr: !!isAr
    };

    // Prefer Turso (concurrency-safe). Fall back to blob JSON log if unavailable.
    const loggedTurso = await logVisitTurso(code, userAgent, !!isAr).catch(() => false);
    if (loggedTurso) {
      return NextResponse.json({ success: true }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    // Atomic-ish write: retry read-modify-write to mitigate concurrent races
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const { visits, blobUrl } = await readVisits(token);
        const next = [newRecord, ...visits].slice(0, MAX_RECORDS);

        // Replace previous blob to avoid duplicates (Vercel Blob has no conditional PUT)
        if (blobUrl) {
          await del(blobUrl, { token }).catch(() => {});
        }

        await put(LOG_PATHNAME, JSON.stringify(next), {
          access: 'public',
          addRandomSuffix: false,
          token
        });

        return NextResponse.json({ success: true }, {
          headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
      } catch (err) {
        lastError = err;
        await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
      }
    }

    console.error('Error logging visit after retries:', lastError);
    return NextResponse.json({ error: lastError?.message || 'Failed to log visit' }, { status: 500 });
  } catch (error) {
    console.error('Error logging visit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
