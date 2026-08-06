import { uploadCadFile } from '../src/lib/r2Storage.js';
import fs from 'fs';

const filePath = process.argv[2];

async function testUpload() {
  if (!filePath) {
    console.error('Usage: node --env-file=.env.local scripts/test-r2-upload.mjs <path-to-step-file>');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error('STEP file not found at:', filePath);
    process.exit(1);
  }

  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID) {
    console.error('Missing R2 env vars. Load .env.local first:');
    console.error('  node --env-file=.env.local scripts/test-r2-upload.mjs <path>');
    process.exit(1);
  }

  console.log('Testing Cloudflare R2 upload...');
  const buffer = fs.readFileSync(filePath);
  console.log('File size:', buffer.byteLength, 'bytes');

  try {
    const res = await uploadCadFile('test_roller.step', buffer, 'application/x-step');
    console.log('Upload result:', res);
  } catch (err) {
    console.error('Upload error:', err);
    process.exit(1);
  }
}

testUpload();
