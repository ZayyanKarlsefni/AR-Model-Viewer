import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    // 1. Check Vercel Blob with explicit token passing and wider prefix match
    if (token) {
      const { blobs } = await list({ 
        prefix: `models/${code}`,
        token: token
      });
      
      if (blobs && blobs.length > 0) {
        return NextResponse.json({ url: blobs[0].url });
      }
    }

    // 2. Check local filesystem fallback
    const localPath = path.join(process.cwd(), 'public', 'uploads', `${code}.glb`);
    if (fs.existsSync(localPath)) {
      return NextResponse.json({ url: `/uploads/${code}.glb` });
    }

    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
