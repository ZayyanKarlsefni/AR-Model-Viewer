import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { put } from '@vercel/blob';

// Initialize S3 Client for Cloudflare R2 / AWS S3 / Supabase Storage
const r2AccountAccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME || 'cad-step-models';

let s3Client = null;
if (r2AccountAccountId && r2AccessKeyId && r2SecretAccessKey) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${r2AccountAccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
    },
  });
}

/**
 * Upload a CAD STEP / GLB file to Cloudflare R2 or Vercel Blob fallback
 */
export async function uploadCadFile(filename, buffer, contentType = 'application/x-step') {
  if (s3Client) {
    const key = `models/${filename}`;
    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await s3Client.send(command);
    const publicUrl = process.env.R2_PUBLIC_DOMAIN 
      ? `${process.env.R2_PUBLIC_DOMAIN}/${key}`
      : `https://${r2BucketName}.${r2AccountAccountId}.r2.cloudflarestorage.com/${key}`;
    return { url: publicUrl, isR2: true };
  }

  // Fallback to Vercel Blob
  const blob = await put(`models/${filename}`, buffer, {
    access: 'public',
    addRandomSuffix: false,
  });
  return { url: blob.url, isR2: false };
}
