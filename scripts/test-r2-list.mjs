import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const r2AccountAccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME || 'cad-step-model';

async function listR2Objects() {
  if (!r2AccountAccountId) {
    console.error('Missing env: R2_ACCOUNT_ID');
    process.exit(1);
  }
  if (!r2AccessKeyId || !r2SecretAccessKey) {
    console.error('Missing env: R2_ACCESS_KEY_ID and/or R2_SECRET_ACCESS_KEY');
    console.error('Load .env.local first:  node --env-file=.env.local scripts/test-r2-list.mjs');
    process.exit(1);
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

  try {
    const command = new ListObjectsV2Command({ Bucket: r2BucketName });
    const data = await s3Client.send(command);
    console.log('--- R2 BUCKET CONTENTS ---');
    console.log('Bucket Name:', r2BucketName);
    console.log('Total Objects:', data.Contents ? data.Contents.length : 0);
    if (data.Contents) {
      data.Contents.forEach((item) => {
        console.log(`- Key: ${item.Key}, Size: ${item.Size} bytes, LastModified: ${item.LastModified}`);
      });
    }
  } catch (err) {
    console.error('Error listing R2 bucket:', err);
    process.exit(1);
  }
}

listR2Objects();
