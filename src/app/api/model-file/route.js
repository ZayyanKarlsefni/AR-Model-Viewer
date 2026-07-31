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
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const cleanCode = code.trim().toLowerCase();

    // 1. Check Cloudflare R2 Storage First (10 GB Free Storage)
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
        });

        const listCommand = new ListObjectsV2Command({
          Bucket: r2BucketName,
          Prefix: 'models/'
        });

        const r2Data = await s3Client.send(listCommand);
        if (r2Data.Contents && r2Data.Contents.length > 0) {
          const matchingObj = r2Data.Contents.find(item => item.Key.toLowerCase().includes(cleanCode));
          if (matchingObj) {
            const getCommand = new GetObjectCommand({
              Bucket: r2BucketName,
              Key: matchingObj.Key
            });

            const objectData = await s3Client.send(getCommand);
            const byteArray = await objectData.Body.transformToByteArray();
            const isStep = matchingObj.Key.toLowerCase().endsWith('.step') || matchingObj.Key.toLowerCase().endsWith('.stp');
            const contentType = isStep ? 'application/x-step' : 'model/gltf-binary';

            return new NextResponse(byteArray, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'public, max-age=3600'
              }
            });
          }
        }
      } catch (r2Err) {
        console.warn('Cloudflare R2 stream note:', r2Err);
      }
    }

    // 2. Fallback to Vercel Blob Storage
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

    // 3. Fallback to Local Storage
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
