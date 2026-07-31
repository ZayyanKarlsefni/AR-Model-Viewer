import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const FALLBACK_BLOB_TOKEN = 'vercel_blob_rw_dseMKFu73Lcnk2XU_avJhCkA7p8uvfc1R4QvJtEM7GOke5n';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file') || searchParams.get('path') || searchParams.get('code');

    if (!file) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
    }

    const rawFile = file.trim();
    const cleanFile = rawFile.replace(/^models\//i, '').toLowerCase();

    // 1. Fetch from Cloudflare R2
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
            const isStep = targetKey.toLowerCase().endsWith('.step') || targetKey.toLowerCase().endsWith('.stp');
            const contentType = isStep ? 'application/x-step' : 'model/gltf-binary';
            const fileName = path.basename(targetKey);

            return new NextResponse(byteArray, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
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
            const isStep = matchingObj.Key.toLowerCase().endsWith('.step') || matchingObj.Key.toLowerCase().endsWith('.stp');
            const contentType = isStep ? 'application/x-step' : 'model/gltf-binary';
            const fileName = path.basename(matchingObj.Key);

            return new NextResponse(byteArray, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
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

    // 2. Fallback to Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN || FALLBACK_BLOB_TOKEN;
    if (token) {
      const { blobs } = await list({ prefix: 'models/', token });
      if (blobs && blobs.length > 0) {
        const matchingBlob = blobs.find(b => 
          b.pathname.toLowerCase() === rawFile.toLowerCase() ||
          b.pathname.toLowerCase().includes(cleanFile)
        );

        if (matchingBlob) {
          const blobResponse = await fetch(matchingBlob.url);
          const buffer = await blobResponse.arrayBuffer();
          const fileName = path.basename(matchingBlob.pathname);
          const isStep = fileName.toLowerCase().endsWith('.step') || fileName.toLowerCase().endsWith('.stp');

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': isStep ? 'application/x-step' : 'model/gltf-binary',
              'Content-Disposition': `attachment; filename="${fileName}"`,
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      }
    }

    // 3. Fallback to local files
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const matchingFile = files.find(f => f.toLowerCase().includes(cleanFile));
      if (matchingFile) {
        const filePath = path.join(uploadsDir, matchingFile);
        const fileBuffer = fs.readFileSync(filePath);
        const isStep = matchingFile.toLowerCase().endsWith('.step') || matchingFile.toLowerCase().endsWith('.stp');

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': isStep ? 'application/x-step' : 'model/gltf-binary',
            'Content-Disposition': `attachment; filename="${matchingFile}"`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    }

    return NextResponse.json({ error: 'File asset not found' }, { status: 404 });
  } catch (error) {
    console.error('Error downloading file asset:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
