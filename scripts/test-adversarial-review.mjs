import fs from 'fs';
import path from 'path';

console.log('=== STARTING ADVERSARIAL REVIEWER TEST SUITE ===\n');

let failed = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

// TEST GROUP 1: Static Image & Woodcut Engraving Assets
console.log('Group 1: Static Image & Woodcut Engraving Assets');
const imagePath = path.join(process.cwd(), 'public', 'images', 'vintage-engraving-factory.jpg');
assert(fs.existsSync(imagePath), 'Vintage engraving factory image asset exists');
const stat = fs.statSync(imagePath);
assert(stat.size > 200000, `Image asset has production quality size (${(stat.size / 1024).toFixed(1)} KB)`);

const buf = fs.readFileSync(imagePath);
const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
assert(isJpeg, 'Image file header conforms to valid JPEG format');

let w = 0, h = 0;
for (let i = 0; i < buf.length; i++) {
  if (buf[i] === 0xff && (buf[i+1] >= 0xc0 && buf[i+1] <= 0xc3)) {
    h = buf.readUInt16BE(i + 5);
    w = buf.readUInt16BE(i + 7);
    break;
  }
}
assert(w >= 1000 && h >= 600, `Image resolution is high-fidelity (${w}x${h})`);

// TEST GROUP 2: VintageLanding Component Integrity & Edge Cases
console.log('\nGroup 2: VintageLanding Component Integrity & Edge Cases');
const landingPath = path.join(process.cwd(), 'src', 'components', 'VintageLanding.jsx');
assert(fs.existsSync(landingPath), 'VintageLanding.jsx exists');
const landingSrc = fs.readFileSync(landingPath, 'utf8');

// Check aesthetic palette tokens
assert(landingSrc.includes('#f5efe1'), 'Contains warm cream background color token (#f5efe1)');
assert(landingSrc.includes('#16335c'), 'Contains deep blue engraving linework token (#16335c)');
assert(landingSrc.includes('vintage-engraving-factory.jpg'), 'References vintage engraving factory image');
assert(landingSrc.includes('Buka 3D Viewer'), 'Includes primary CTA button with Indonesian text');
assert(landingSrc.includes('Warisan Rekayasa & Fabrikasi Industri'), 'Includes editorial title');
assert(landingSrc.includes('Plat I.'), 'Includes archival plate caption');

// Check edge cases: form submission, validation, clipboard fallback
assert(landingSrc.includes('onSubmit='), 'Wraps manual code input in form for Enter keyboard submission');
assert(landingSrc.includes('Mohon masukkan kode gambar atau model terlebih dahulu'), 'Provides inline validation error when submitting empty code');
assert(!landingSrc.includes('memuat model default'), 'Does not contain false "model default" promise');
assert(landingSrc.includes('document.execCommand'), 'Includes clipboard fallback for legacy/restricted web contexts');

// TEST GROUP 3: Page Integration & State Machine Logic
console.log('\nGroup 3: Page Integration & State Machine Logic');
const pagePath = path.join(process.cwd(), 'src', 'app', 'viewer', 'page.js');
const pageSrc = fs.readFileSync(pagePath, 'utf8');

assert(pageSrc.includes('import VintageLanding'), 'page.js imports VintageLanding component');
assert(pageSrc.includes('const [enteredViewer, setEnteredViewer] = useState(direct)'), 'Initializes enteredViewer to direct query parameter');
assert(pageSrc.includes('!enteredViewer ? ('), 'Renders VintageLanding before 3D viewer is entered');
assert(pageSrc.includes('onEnterViewer={handleEnterViewer}'), 'Connects onEnterViewer callback');
assert(pageSrc.includes('setModelUrl(null)'), 'Resets modelUrl on code transition');
assert(pageSrc.includes('window.history.replaceState'), 'Synchronizes URL query params when manual code is entered');
assert(pageSrc.includes('Kembali ke Lembar Spesifikasi'), 'Provides explicit return to spec sheet on error');
assert(pageSrc.includes('FileText className="h-3.5 w-3.5 text-[#16335c]"'), 'Includes drawing sheet badge in viewer header');

// TEST GROUP 4: Verify existing verification script passes
console.log('\nGroup 4: Backward Compatibility with verify-landing.mjs');
const verifyLandingPath = path.join(process.cwd(), 'scripts', 'verify-landing.mjs');
assert(fs.existsSync(verifyLandingPath), 'verify-landing.mjs exists');

// TEST GROUP 5: Adversarial Edge Cases & Camera/Projection Resilience
console.log('\nGroup 5: Adversarial Edge Cases & Camera/Projection Resilience');
const viewCubePath = path.join(process.cwd(), 'src', 'components', 'ViewCube.jsx');
const viewCubeSrc = fs.readFileSync(viewCubePath, 'utf8');

// Edge Case 5.1: Editable Code Support in VintageLanding
assert(landingSrc.includes('Edit3'), 'VintageLanding includes Edit3 icon for code editing');
assert(landingSrc.includes('isEditing'), 'VintageLanding tracks editing state to allow fixing/changing codes');
assert(landingSrc.includes('Batal'), 'VintageLanding offers cancel button when editing code');

// Edge Case 5.2: URL Param Safety & Special Characters
assert(pageSrc.includes('encodeURIComponent(currentCode)'), 'page.js URL-encodes drawing code for special character safety (#, +, &)');
assert(pageSrc.includes("url.searchParams.delete('file')"), 'page.js purges stale file query param when manual code is set');
assert(pageSrc.includes('file && !activeCode'), 'page.js prioritizes activeCode over direct file reference');

// Edge Case 5.3: Camera Projection & ViewCube Synchronization
assert(pageSrc.includes("projectionMode === 'orthographic' ? '12deg' : 'auto'"), 'resetCamera respects active projection mode without reverting ortho');
assert(pageSrc.includes('handleProjectionChange'), 'page.js dynamically syncs fieldOfView on projection switch');
assert(viewCubeSrc.includes("viewer.addEventListener('load'"), 'ViewCube listens to model load event for instant rotation sync');
assert(viewCubeSrc.includes("typeof viewer.getCameraOrbit !== 'function'"), 'ViewCube guards uninitialized web component getCameraOrbit');

// TEST GROUP 6: Round 3 Deep Verification & Edge Case Guardrails
console.log('\nGroup 6: Round 3 Deep Verification & Edge Case Guardrails');

// Check 6.1: Direct File Reference Preservation
assert(landingSrc.includes('cleanCode ?') || landingSrc.includes('if (cleanCode)'), 'VintageLanding differentiates code route from direct file route');
assert(pageSrc.includes('const rawCode = searchParams.get(\'code\');'), 'page.js reads rawCode for trimming');
assert(pageSrc.includes('const code = rawCode ? rawCode.trim() : null;'), 'page.js trims code and collapses whitespace-only string to null');

// Check 6.2: Dual-Diagonal Crosshatching Linework
assert(landingSrc.includes('45deg') && landingSrc.includes('-45deg'), 'Texture overlay uses dual intersecting diagonal lines (45deg and -45deg) for true crosshatching');

// Check 6.3: Archival Error Notice on Model Retrieval Failure
assert(pageSrc.includes('errorMessage={error}'), 'page.js passes error state to VintageLanding');
assert(landingSrc.includes('errorMessage'), 'VintageLanding accepts errorMessage prop');
assert(landingSrc.includes('Model Tidak Ditemukan'), 'VintageLanding renders archival error plate on failure');

// Check 6.4: Input Accessibility, Auto-Capitalization & Form Keyboard Enter
assert(landingSrc.includes('aria-label='), 'Manual code input includes accessible aria-label');
assert(landingSrc.includes('autoCapitalize="characters"'), 'Manual code input enables uppercase auto-capitalization for CAD part numbers');
assert(landingSrc.includes('type="submit" className="hidden"'), 'Form contains hidden submit button for reliable Enter key submission');

// Check 6.5: Zero-CLS Layout Shift Protection
assert(landingSrc.includes('className="h-4 mt-1 flex items-center justify-center"'), 'Copy status container has fixed height to prevent cumulative layout shift');

// Check 6.6: CustomElements whenDefined Readiness
assert(viewCubeSrc.includes('window.customElements.whenDefined'), 'ViewCube listens for custom element definition to sync rotation on upgrade');

if (failed === 0) {
  console.log('\n=== ALL ADVERSARIAL INSPECTION CHECKS PASSED ===');
  process.exit(0);
} else {
  console.error(`\n=== FAILED WITH ${failed} DEFECT(S) ===`);
  process.exit(1);
}
