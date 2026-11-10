import fs from 'fs';
import path from 'path';

console.log('=== VERIFYING VINTAGE ENGRAVING INTERSTITIAL LANDING PAGE ===\n');

// 1. Verify Image Asset
const imagePath = path.join(process.cwd(), 'public', 'images', 'vintage-engraving-factory.jpg');
if (!fs.existsSync(imagePath)) {
  console.error('FAIL: Missing public/images/vintage-engraving-factory.jpg');
  process.exit(1);
}
const imgStat = fs.statSync(imagePath);
const buf = fs.readFileSync(imagePath);
const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
if (!isJpeg || imgStat.size < 50000) {
  console.error('FAIL: Invalid image asset or size too small');
  process.exit(1);
}
console.log(`✓ Image Asset: Verified vintage-engraving-factory.jpg (${(imgStat.size / 1024).toFixed(1)} KB, valid JPEG)`);

// 2. Verify Component Source Code
const landingSrcPath = path.join(process.cwd(), 'src', 'components', 'VintageLanding.jsx');
const landingSrc = fs.readFileSync(landingSrcPath, 'utf8');

const requiredTokens = [
  '#f5efe1', // Warm cream background
  '#16335c', // Deep blue ink
  'Buka 3D Viewer', // Primary action button
  'vintage-engraving-factory.jpg', // Vintage engraving illustration
  'displayCode', // Model / drawing code display
  'onEnterViewer', // Transition handler
  'Warisan Rekayasa & Fabrikasi Industri', // Editorial title
  'Plat I.', // Engraving caption plate
];

for (const token of requiredTokens) {
  if (!landingSrc.includes(token)) {
    console.error(`FAIL: VintageLanding.jsx missing required token: "${token}"`);
    process.exit(1);
  }
}
console.log('✓ Source Verification: VintageLanding.jsx contains all aesthetic, visual, and functional tokens');

// 3. Verify Integration in Viewer Page
const viewerPagePath = path.join(process.cwd(), 'src', 'app', 'viewer', 'page.js');
const viewerSrc = fs.readFileSync(viewerPagePath, 'utf8');

const integrationTokens = [
  "import VintageLanding from '@/components/VintageLanding'",
  'const [enteredViewer, setEnteredViewer] = useState(direct)',
  '!enteredViewer ? (',
  '<VintageLanding',
  'onEnterViewer={handleEnterViewer}',
];

for (const token of integrationTokens) {
  if (!viewerSrc.includes(token)) {
    console.error(`FAIL: page.js missing integration token: "${token}"`);
    process.exit(1);
  }
}
console.log('✓ Integration Verification: viewer/page.js conditionally mounts VintageLanding and defers 3D viewer');

// 4. Verify Next.js Compiled Production Chunks
const chunksDir = path.join(process.cwd(), '.next', 'static', 'chunks');
let foundChunk = false;

function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Buka 3D Viewer') && content.includes('vintage-engraving-factory.jpg')) {
        console.log(`✓ Compiled Bundle: Found in chunk "${entry.name}"`);
        foundChunk = true;
      }
    }
  }
}

scanDir(chunksDir);

if (!foundChunk) {
  console.error('FAIL: VintageLanding was not found in static chunks!');
  process.exit(1);
}

console.log('\n=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
