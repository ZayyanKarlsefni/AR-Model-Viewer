import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const r2AccountAccountId = process.env.R2_ACCOUNT_ID || 'fbbaf18891be4bb8839e42832fcbaf13';
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME || 'cad-step-model';

async function listR2Objects() {
  if (!r2AccessKeyId || !r2SecretAccessKey) {
    console.error('Please pass R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY');
    return;
  }

  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${r2AccountAccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
    },
  });

  try {
    const command = new ListObjectsV2Command({ Bucket: r2BucketName });
    const data = await s3Client.send(command);
    console.log('--- R2 BUCKET CONTENTS ---');
    console.log('Bucket Name:', r2BucketName);
    console.log('Total Objects:', data.Contents ? data.Contents.length : 0);
    if (data.Contents) {
      data.Contents.forEach(item => {
        console.log(`- Key: ${item.Key}, Size: ${item.Size} bytes, LastModified: ${item.LastModified}`);
      });
    }
  } catch (err) {
    console.error('Error listing R2 bucket:', err);
  }
}

listR2Objects();
