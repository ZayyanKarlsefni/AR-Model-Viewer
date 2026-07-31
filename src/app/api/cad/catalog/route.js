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
          const keys = r2Data.Contents.map(i => i.Key);

          r2Data.Contents.forEach((item) => {
            const fileName = path.basename(item.Key);
            const ext = path.extname(item.Key).toLowerCase();
            const stem = item.Key.substring(0, item.Key.length - ext.length);
            const downloadPath = `/api/cad/download?file=${encodeURIComponent(item.Key)}`;
            const fullDownloadUrl = `${originUrl}${downloadPath}`;

            if (ext === '.step' || ext === '.stp') {
              const matchingGlbKey = keys.find(k => k.toLowerCase() === `${stem.toLowerCase()}.glb`);
              const glbDownloadUrl = matchingGlbKey
                ? `${originUrl}/api/cad/download?file=${encodeURIComponent(matchingGlbKey)}`
                : fullDownloadUrl;

              entries.push({
                file: item.Key,
                name: fileName,
                sourceKind: 'step',
                kind: 'step',
                stepFile: item.Key,
                assetFile: matchingGlbKey || item.Key,
                glbUrl: glbDownloadUrl,
                url: glbDownloadUrl,
                outputUrl: glbDownloadUrl,
                stepUrl: fullDownloadUrl,
                downloadUrl: fullDownloadUrl,
                size: item.Size,
                lastModified: item.LastModified
              });
            } else if (ext === '.glb') {
              entries.push({
                file: item.Key,
                name: fileName,
                sourceKind: 'glb',
                kind: 'glb',
                assetFile: item.Key,
                url: fullDownloadUrl,
                outputUrl: fullDownloadUrl,
                downloadUrl: fullDownloadUrl,
                size: item.Size,
                lastModified: item.LastModified
              });
            }
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
            const pathnames = blobs.map(b => b.pathname);
            blobs.forEach((b) => {
              const fileName = path.basename(b.pathname);
              const ext = path.extname(b.pathname).toLowerCase();
              const stem = b.pathname.substring(0, b.pathname.length - ext.length);
              const downloadPath = `/api/cad/download?file=${encodeURIComponent(b.pathname)}`;
              const fullDownloadUrl = `${originUrl}${downloadPath}`;

              if (ext === '.step' || ext === '.stp') {
                const matchingGlb = pathnames.find(p => p.toLowerCase() === `${stem.toLowerCase()}.glb`);
                const glbDownloadUrl = matchingGlb
                  ? `${originUrl}/api/cad/download?file=${encodeURIComponent(matchingGlb)}`
                  : fullDownloadUrl;

                entries.push({
                  file: b.pathname,
                  name: fileName,
                  sourceKind: 'step',
                  kind: 'step',
                  stepFile: b.pathname,
                  assetFile: matchingGlb || b.pathname,
                  glbUrl: glbDownloadUrl,
                  url: glbDownloadUrl,
                  outputUrl: glbDownloadUrl,
                  stepUrl: fullDownloadUrl,
                  downloadUrl: fullDownloadUrl,
                  size: b.size
                });
              } else if (ext === '.glb') {
                entries.push({
                  file: b.pathname,
                  name: fileName,
                  sourceKind: 'glb',
                  kind: 'glb',
                  assetFile: b.pathname,
                  url: fullDownloadUrl,
                  outputUrl: fullDownloadUrl,
                  downloadUrl: fullDownloadUrl,
                  size: b.size
                });
              }
            });
          }
        } catch (blobErr) {
          console.warn('Blob catalog warning:', blobErr);
        }
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
