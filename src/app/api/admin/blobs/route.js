import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

function toModelEntry(key, sizeBytes, uploadedAt, storage, deleteRef) {
  const pathname = key;
  const code = pathname
    .replace(/^models\//, '')
    .replace(/\.(glb|step|stp)$/i, '')
    .replace(/_compressed$/, '');
  return {
    pathname,
    url: deleteRef || key, // R2 -> key, Blob -> http URL
    size: (sizeBytes / 1024 / 1024).toFixed(2),
    uploadedAt,
    code,
    storage,
  };
}

export async function GET(request) {
  const authError = verifyAdminSession(request);
  if (authError) return authError;

  try {
    const models = [];
    const bucket = process.env.R2_BUCKET_NAME || 'cad-step-model';

    // 1. Cloudflare R2 (primary upload target)
    const s3 = getR2Client();
    if (s3) {
      try {
        const cmd = new ListObjectsV2Command({ Bucket: bucket, Prefix: 'models/', MaxKeys: 500 });
        const data = await s3.send(cmd);
        (data.Contents || []).forEach((item) => {
          models.push(toModelEntry(item.Key, item.Size, item.LastModified, 'r2', item.Key));
        });
      } catch (err) {
        console.warn('R2 admin list warning:', err);
      }
    }

    // 2. Vercel Blob (fallback storage)
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      try {
        const { blobs } = await list({ prefix: 'models/', token });
        blobs.forEach((b) => {
          models.push(toModelEntry(b.pathname, b.size, b.uploadedAt, 'blob', b.url));
        });
      } catch (err) {
        console.warn('Blob admin list warning:', err);
      }
    }

    return NextResponse.json({ models }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authError = verifyAdminSession(request);
  if (authError) return authError;

  try {
    const { url, key } = await request.json();
    if (!url && !key) {
      return NextResponse.json({ error: 'Missing url or key parameter' }, { status: 400 });
    }

    const bucket = process.env.R2_BUCKET_NAME || 'cad-step-model';
    const targetKey = key || (url && !url.startsWith('http') ? url : null);

    if (targetKey) {
      // Delete from Cloudflare R2
      const s3 = getR2Client();
      if (!s3) {
        return NextResponse.json({ error: 'R2 credentials not configured' }, { status: 500 });
      }
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: targetKey }));
      return NextResponse.json({ success: true, storage: 'r2' }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    // Delete from Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured' }, { status: 500 });
    }
    await del(url, { token });
    return NextResponse.json({ success: true, storage: 'blob' }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}