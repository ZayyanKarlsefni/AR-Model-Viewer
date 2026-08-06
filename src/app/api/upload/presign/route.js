import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { verifyPluginKey, validateUploadMeta } from '@/lib/plugin-auth';

export const dynamic = 'force-dynamic';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB
const PRESIGN_TTL_SECONDS = 900; // 15 minutes

export async function POST(request) {
  const authError = verifyPluginKey(request);
  if (authError) return authError;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { code, extension, fileSize } = body || {};
  const cleanExt = String(extension || '').replace('.', '').toLowerCase();

  const meta = validateUploadMeta({ code, ext: cleanExt });
  if (meta.error) {
    return NextResponse.json({ error: meta.error }, { status: 400 });
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File size exceeds limit (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)` },
      { status: 400 }
    );
  }

  const r2AccountAccountId = process.env.R2_ACCOUNT_ID;
  const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2BucketName = process.env.R2_BUCKET_NAME || 'cad-step-model';

  if (!r2AccountAccountId || !r2AccessKeyId || !r2SecretAccessKey) {
    return NextResponse.json({ error: 'R2 credentials missing on server' }, { status: 500 });
  }

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

    const key = `models/${code}.${cleanExt}`;
    const contentType = cleanExt === 'glb' ? 'model/gltf-binary' : 'application/x-step';

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: PRESIGN_TTL_SECONDS });

    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
      bucket: r2BucketName
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating R2 presigned URL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}