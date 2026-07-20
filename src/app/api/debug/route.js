import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

const FALLBACK_BLOB_TOKEN = 'vercel_blob_rw_dseMKFu73Lcnk2XU_avJhCkA7p8uvfc1R4QvJtEM7GOke5n';

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN || FALLBACK_BLOB_TOKEN;
    const { blobs } = await list({ token });
    return NextResponse.json({ 
      hasEnvToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobsCount: blobs.length,
      blobs: blobs.map(b => ({ pathname: b.pathname, url: b.url }))
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
