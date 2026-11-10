const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function captureLandingMobile() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9230',
    '--window-size=390,844',
    'http://localhost:3000/viewer?code=INV-2026-001'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9230/json', (res) => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', () => {
      const list = JSON.parse(raw);
      const page = list.find(t => t.url.includes('INV-2026-001'));
      if (!page) { edge.kill(); return; }

      const ws = new WebSocket(page.webSocketDebuggerUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({
          id: 1,
          method: 'Emulation.setDeviceMetricsOverride',
          params: {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true
          }
        }));
      };
      ws.onmessage = (event) => {
        const resp = JSON.parse(event.data);
        if (resp.id === 1) {
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 1500);
        } else if (resp.id === 2) {
          const buf = Buffer.from(resp.result.data, 'base64');
          fs.writeFileSync('public/images/landing-en-mobile.png', buf);
          console.log('Successfully captured landing-en-mobile.png with real mobile viewport! Size:', buf.length);
          ws.close();
          edge.kill();
        }
      };
    });
  });
}
captureLandingMobile();
