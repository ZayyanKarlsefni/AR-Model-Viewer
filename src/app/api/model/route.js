import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const cleanCode = code.trim().toLowerCase();

    // 1. Fetch uncompressed GLB model directly from Cloudflare R2
    const r2AccountAccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
    const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2BucketName = process.env.R2_BUCKET_NAME || 'cad-step-model';

    if (r2AccountAccountId && r2AccessKeyId && r2SecretAccessKey) {
      try {
        const s3Client = new S3Client({
          region: 'auto',
          endpoint: `https://${r2AccountAccountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: r2AccessKeyId,
            secretAccessKey: r2SecretAccessKey,
          },
          forcePathStyle: true,
        });

        const command = new ListObjectsV2Command({
          Bucket: r2BucketName,
          Prefix: 'models/'
        });

        const r2Data = await s3Client.send(command);
        if (r2Data.Contents && r2Data.Contents.length > 0) {
          const matchingObjs = r2Data.Contents.filter(item => item.Key.toLowerCase().includes(cleanCode));
          if (matchingObjs.length > 0) {
            const matchingGlb = matchingObjs.find(item => item.Key.toLowerCase().endsWith('.glb'));
            const targetObj = matchingGlb || matchingObjs[0];

            const publicUrl = `/api/cad/download?file=${encodeURIComponent(targetObj.Key)}`;
            
            return NextResponse.json({ url: publicUrl, storage: 'cloudflare-r2', key: targetObj.Key }, {
              headers: { 'Cache-Control': 'no-store, max-age=0' }
            });
          }
        }
      } catch (r2Err) {
        console.warn('Cloudflare R2 list note:', r2Err);
      }
    }

    // 2. Development Mode: Local Filesystem Fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const matchingFile = files.find(f => f.toLowerCase().includes(cleanCode));
      if (matchingFile) {
        return NextResponse.json({ url: `/uploads/${matchingFile}`, storage: 'local', key: `models/${matchingFile}` }, {
          headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
      }
    }

    return NextResponse.json({ error: 'Model not found in Cloudflare R2 storage' }, { 
      status: 404,
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
