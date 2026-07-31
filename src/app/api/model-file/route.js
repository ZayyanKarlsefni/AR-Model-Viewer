import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
const FALLBACK_BLOB_TOKEN = 'vercel_blob_rw_dseMKFu73Lcnk2XU_avJhCkA7p8uvfc1R4QvJtEM7GOke5n';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const cleanCode = code.trim().toLowerCase();
    const token = process.env.BLOB_READ_WRITE_TOKEN || FALLBACK_BLOB_TOKEN;

    if (token) {
      const { blobs } = await list({ prefix: 'models/', token });
      if (blobs && blobs.length > 0) {
        const matchingBlobs = blobs.filter(b => b.pathname.toLowerCase().includes(cleanCode));
        if (matchingBlobs.length > 0) {
          const targetBlob = matchingBlobs.find(b => b.pathname.includes('_compressed')) || matchingBlobs[0];
          const blobResponse = await fetch(targetBlob.url);
          const buffer = await blobResponse.arrayBuffer();

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': 'model/gltf-binary',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      }
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const matchingFile = files.find(f => f.toLowerCase().includes(cleanCode));
      if (matchingFile) {
        const filePath = path.join(uploadsDir, matchingFile);
        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'model/gltf-binary',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    }

    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
