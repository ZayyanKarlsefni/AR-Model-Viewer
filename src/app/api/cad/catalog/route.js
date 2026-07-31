import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const FALLBACK_BLOB_TOKEN = 'vercel_blob_rw_dseMKFu73Lcnk2XU_avJhCkA7p8uvfc1R4QvJtEM7GOke5n';

export async function GET(request) {
  try {
    const originUrl = request ? new URL(request.url).origin : '';
    const entries = [];

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

        const command = new ListObjectsV2Command({
          Bucket: r2BucketName,
          Prefix: 'models/'
        });

        const r2Data = await s3Client.send(command);
        if (r2Data.Contents && r2Data.Contents.length > 0) {
          r2Data.Contents.forEach((item) => {
            const fileName = path.basename(item.Key);
            const isStep = fileName.toLowerCase().endsWith('.step') || fileName.toLowerCase().endsWith('.stp');
            const kind = isStep ? 'step' : 'glb';
            const downloadPath = `/api/cad/download?file=${encodeURIComponent(item.Key)}`;
            const fullDownloadUrl = `${originUrl}${downloadPath}`;

            entries.push({
              file: item.Key,
              name: fileName,
              sourceKind: kind,
              stepFile: item.Key,
              assetFile: item.Key,
              url: fullDownloadUrl,
              outputUrl: fullDownloadUrl,
              stepUrl: fullDownloadUrl,
              downloadUrl: fullDownloadUrl,
              size: item.Size,
              lastModified: item.LastModified
            });
          });
        }
      } catch (r2Err) {
        console.warn('R2 catalog fetch warning:', r2Err);
      }
    }

    // 2. Fallback to Vercel Blob if R2 had no entries
    if (entries.length === 0) {
      const token = process.env.BLOB_READ_WRITE_TOKEN || FALLBACK_BLOB_TOKEN;
      if (token) {
        try {
          const { blobs } = await list({ prefix: 'models/', token });
          if (blobs && blobs.length > 0) {
            blobs.forEach((b) => {
              const fileName = path.basename(b.pathname);
              const isStep = fileName.toLowerCase().endsWith('.step') || fileName.toLowerCase().endsWith('.stp');
              const downloadPath = `/api/cad/download?file=${encodeURIComponent(b.pathname)}`;
              const fullDownloadUrl = `${originUrl}${downloadPath}`;

              entries.push({
                file: b.pathname,
                name: fileName,
                sourceKind: isStep ? 'step' : 'glb',
                stepFile: b.pathname,
                assetFile: b.pathname,
                url: fullDownloadUrl,
                outputUrl: fullDownloadUrl,
                stepUrl: fullDownloadUrl,
                downloadUrl: fullDownloadUrl,
                size: b.size
              });
            });
          }
        } catch (blobErr) {
          console.warn('Blob catalog warning:', blobErr);
        }
      }
    }

    // 3. Fallback to local uploads
    if (entries.length === 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        files.forEach((f) => {
          const isStep = f.toLowerCase().endsWith('.step') || f.toLowerCase().endsWith('.stp');
          const downloadPath = `/api/cad/download?file=${encodeURIComponent(`models/${f}`)}`;
          const fullDownloadUrl = `${originUrl}${downloadPath}`;

          entries.push({
            file: `models/${f}`,
            name: f,
            sourceKind: isStep ? 'step' : 'glb',
            stepFile: `models/${f}`,
            assetFile: `models/${f}`,
            url: fullDownloadUrl,
            outputUrl: fullDownloadUrl,
            stepUrl: fullDownloadUrl,
            downloadUrl: fullDownloadUrl
          });
        });
      }
    }

    const catalog = {
      schemaVersion: 4,
      generatedAt: new Date().toISOString(),
      entries: entries
    };

    return NextResponse.json(catalog, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error generating CAD catalog:', error);
    return NextResponse.json({
      schemaVersion: 4,
      generatedAt: new Date().toISOString(),
      entries: []
    }, { status: 200 });
  }
}
