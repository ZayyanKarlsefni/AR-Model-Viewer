import { NextResponse } from 'next/server';

const FALLBACK_BLOB_TOKEN = 'vercel_blob_rw_dseMKFu73Lcnk2XU_avJhCkA7p8uvfc1R4QvJtEM7GOke5n';

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN || FALLBACK_BLOB_TOKEN;
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
