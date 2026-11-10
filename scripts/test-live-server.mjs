async function run() {
  console.log('=== TESTING LIVE HTTP ENDPOINTS ON PORT 3005 ===\n');
  let failed = 0;

  async function check(name, url, predicate) {
    try {
      const res = await fetch(url);
      const pass = await predicate(res);
      if (pass) {
        console.log(`  ✓ PASS: ${name} (${res.status} ${res.statusText})`);
      } else {
        console.error(`  ✗ FAIL: ${name} (${res.status} ${res.statusText})`);
        failed++;
      }
    } catch (err) {
      console.error(`  ✗ FAIL: ${name} - Exception: ${err.message}`);
      failed++;
    }
  }

  // 1. Static asset: factory engraving image
  await check('Static JPEG Asset', 'http://localhost:3005/images/vintage-engraving-factory.jpg', async (res) => {
    const len = Number(res.headers.get('content-length') || 0);
    const type = res.headers.get('content-type') || '';
    return res.status === 200 && type.includes('image/jpeg') && len > 500000;
  });

  // 2. Next.js Image Optimization route
  await check('Next.js Image Optimizer Endpoint', 'http://localhost:3005/_next/image?url=%2Fimages%2Fvintage-engraving-factory.jpg&w=750&q=75', async (res) => {
    return res.status === 200;
  });

  // 3. Model route with code: /viewer?code=DWG-2024-X9
  await check('Viewer with Model Code parameter', 'http://localhost:3005/viewer?code=DWG-2024-X9', async (res) => {
    const text = await res.text();
    return res.status === 200 && text.includes('CADimago');
  });

  // 4. Viewer root without parameter
  await check('Viewer without code parameter', 'http://localhost:3005/viewer', async (res) => {
    const text = await res.text();
    return res.status === 200 && text.includes('CADimago');
  });

  // 5. Viewer with direct parameter: /viewer?direct=true&code=TEST
  await check('Viewer direct bypass parameter', 'http://localhost:3005/viewer?direct=true&code=TEST', async (res) => {
    return res.status === 200;
  });

  // 6. Home route
  await check('Home landing page', 'http://localhost:3005/', async (res) => {
    return res.status === 200;
  });

  if (failed === 0) {
    console.log('\n=== ALL LIVE HTTP ENDPOINT CHECKS PASSED ===');
    process.exit(0);
  } else {
    console.error(`\n=== FAILED WITH ${failed} HTTP ERRORS ===`);
    process.exit(1);
  }
}

run();
