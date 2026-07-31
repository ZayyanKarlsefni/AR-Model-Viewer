import { NextResponse } from 'next/server';
import { uploadCadFile } from '@/lib/r2Storage';
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || `${code}.step`;
    const isStep = fileName.toLowerCase().endsWith('.step') || fileName.toLowerCase().endsWith('.stp');
    const contentType = isStep ? 'application/x-step' : 'model/gltf-binary';
    const ext = isStep ? (fileName.toLowerCase().endsWith('.stp') ? 'stp' : 'step') : 'glb';

    // Upload to Cloudflare R2 / Vercel Blob
    try {
      const result = await uploadCadFile(`${code}.${ext}`, buffer, contentType);
      return NextResponse.json({ success: true, url: result.url, isR2: result.isR2 }, { status: 201 });
    } catch (storageErr) {
      console.warn('Cloud storage upload warning, saving to local fallback:', storageErr);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, `${code}.${ext}`);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({ success: true, url: `/uploads/${code}.${ext}`, isLocal: true }, { status: 201 });
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
