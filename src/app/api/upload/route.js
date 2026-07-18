import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('upload');
    const code = formData.get('code');

    if (!file || !code) {
      return NextResponse.json({ error: 'Missing upload file or code' }, { status: 400 });
    }

    // Check if Vercel Blob Token is configured
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    if (hasToken) {
      // Upload to Vercel Blob
      const blob = await put(`models/${code}.glb`, file, {
        access: 'public',
        addRandomSuffix: false,
      });
      return NextResponse.json({ success: true, url: blob.url }, { status: 201 });
    } else {
      // Local development fallback: Save to public/uploads/
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, `${code}.glb`);
      fs.writeFileSync(filePath, buffer);

      const localUrl = `/uploads/${code}.glb`;
      return NextResponse.json({ success: true, url: localUrl, isLocal: true }, { status: 201 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
