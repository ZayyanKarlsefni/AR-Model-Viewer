import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function isStepKey(key) {
  return key.toLowerCase().endsWith('.step') || key.toLowerCase().endsWith('.stp');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file') || searchParams.get('path') || searchParams.get('code') || searchParams.get('key');

    if (!file) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
    }

    const rawFile = file.trim();
    const cleanFile = rawFile.replace(/^models\//i, '').toLowerCase();

    // STEP files hold confidential CAD history/parameters -> require internal auth.
    if (isStepKey(cleanFile)) {
      const cookieToken = request.cookies?.get('admin_session')?.value;
      const paramToken = searchParams.get('token');
      if (!verifySession(cookieToken || paramToken)) {
        return NextResponse.json(
          { error: 'Access Denied: Internal CAD files require authorization' },
          { status: 403 }
        );
      }
    }

    // 1. Fetch uncompressed GLB / STEP directly from Cloudflare R2
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

        // Try direct key get first (Fastest)
        const possibleKeys = [
          rawFile,
          `models/${cleanFile}`,
          cleanFile
        ];

        for (const targetKey of possibleKeys) {
          try {
            const getCommand = new GetObjectCommand({
              Bucket: r2BucketName,
              Key: targetKey
            });
            const objectData = await s3Client.send(getCommand);
            const byteArray = await objectData.Body.transformToByteArray();
            const isStep = isStepKey(targetKey);
            const contentType = isStep ? 'application/x-step' : 'model/gltf-binary';
            const fileName = path.basename(targetKey);

            return new NextResponse(byteArray, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${fileName}"`,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'public, max-age=3600'
              }
            });
          } catch (keyErr) {
            // Continue trying next key
          }
        }

        // List fallback
        const listCommand = new ListObjectsV2Command({
          Bucket: r2BucketName,
          Prefix: 'models/'
        });

        const r2Data = await s3Client.send(listCommand);
        if (r2Data.Contents && r2Data.Contents.length > 0) {
          const matchingObj = r2Data.Contents.find(item => 
            item.Key.toLowerCase() === rawFile.toLowerCase() ||
            item.Key.toLowerCase().includes(cleanFile)
          );

          if (matchingObj) {
            const getCommand = new GetObjectCommand({
              Bucket: r2BucketName,
              Key: matchingObj.Key
            });

            const objectData = await s3Client.send(getCommand);
            const byteArray = await objectData.Body.transformToByteArray();
            const isStep = isStepKey(matchingObj.Key);
            const contentType = isStep ? 'application/x-step' : 'model/gltf-binary';
            const fileName = path.basename(matchingObj.Key);

            return new NextResponse(byteArray, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${fileName}"`,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'public, max-age=3600'
              }
            });
          }
        }
      } catch (r2Err) {
        console.warn('Cloudflare R2 download warning:', r2Err);
      }
    }

    // 2. Development Mode: Local Filesystem Fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const matchingFile = files.find(f => f.toLowerCase().includes(cleanFile));
      if (matchingFile) {
        const filePath = path.join(uploadsDir, matchingFile);
        const fileBuffer = fs.readFileSync(filePath);
        const isStep = isStepKey(matchingFile);

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': isStep ? 'application/x-step' : 'model/gltf-binary',
            'Content-Disposition': `inline; filename="${matchingFile}"`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    }

    return NextResponse.json({ error: 'File asset not found in Cloudflare R2' }, { status: 404 });
  } catch (error) {
    console.error('Error downloading file asset:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
