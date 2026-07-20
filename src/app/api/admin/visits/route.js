import { list, put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_BLOB_TOKEN = 'vercel_blob_rw_dseMKFu73Lcnk2XU_avJhCkA7p8uvfc1R4QvJtEM7GOke5n';
const LOG_PATHNAME = 'logs/visits.json';

// Helper to determine device type from User-Agent string
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

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN || FALLBACK_BLOB_TOKEN;
    const { blobs } = await list({ prefix: LOG_PATHNAME, token });

    if (blobs && blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      if (res.ok) {
        const visits = await res.json();
        return NextResponse.json({ visits }, {
          headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
      }
    }

    return NextResponse.json({ visits: [] }, {
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

    const token = process.env.BLOB_READ_WRITE_TOKEN || FALLBACK_BLOB_TOKEN;
    const userAgent = request.headers.get('user-agent') || '';
    const device = parseDevice(userAgent);

    const newRecord = {
      code,
      device,
      timestamp: new Date().toISOString(),
      isAr: !!isAr
    };

    // Retrieve existing logs
    let visits = [];
    const { blobs } = await list({ prefix: LOG_PATHNAME, token });

    if (blobs && blobs.length > 0) {
      try {
        const res = await fetch(blobs[0].url);
        if (res.ok) {
          visits = await res.json();
        }
      } catch (e) {
        // ignore read error
      }
    }

    // Append new record to the top, keep max 100 recent records
    visits.unshift(newRecord);
    if (visits.length > 100) {
      visits = visits.slice(0, 100);
    }

    // Save back to Vercel Blob
    await put(LOG_PATHNAME, JSON.stringify(visits), {
      access: 'public',
      addRandomSuffix: false,
      token
    });

    return NextResponse.json({ success: true }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error) {
    console.error('Error logging visit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
