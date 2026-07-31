import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const ext = searchParams.get('ext') || 'step';

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const r2AccountAccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
    const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2BucketName = process.env.R2_BUCKET_NAME || 'cad-step-model';

    if (!r2AccountAccountId || !r2AccessKeyId || !r2SecretAccessKey) {
      return NextResponse.json({ error: 'R2 credentials missing on Vercel' }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountAccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
      forcePathStyle: true,
    });

    const cleanExt = ext.replace('.', '').toLowerCase();
    const key = `models/${code}.${cleanExt}`;
    const contentType = cleanExt === 'step' || cleanExt === 'stp' ? 'application/x-step' : 'model/gltf-binary';

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `https://${r2BucketName}.${r2AccountAccountId}.r2.cloudflarestorage.com/${key}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
      bucket: r2BucketName
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating R2 presigned URL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
