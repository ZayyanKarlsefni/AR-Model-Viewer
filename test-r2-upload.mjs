import { uploadCadFile } from './src/lib/r2Storage.js';
import fs from 'fs';

async function testUpload() {
  console.log('Testing Cloudflare R2 upload...');
  const stepPath = 'D:/Plugin/Text-To-CAD/models/Through_Roller_87x500x550mm.stp';
  if (!fs.existsSync(stepPath)) {
    console.error('STEP file not found at:', stepPath);
    return;
  }

  const buffer = fs.readFileSync(stepPath);
  console.log('File size:', buffer.byteLength, 'bytes');

  try {
    const res = await uploadCadFile('test_roller.step', buffer, 'application/x-step');
    console.log('Upload result:', res);
  } catch (err) {
    console.error('Upload error:', err);
  }
}

testUpload();
