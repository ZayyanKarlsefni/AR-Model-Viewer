const { spawn } = require('child_process');

function runMcpBatch(batchCommands) {
  return new Promise((resolve, reject) => {
    const proc = spawn('C:\\Program Files\\ArtCraft\\FigCraft\\figcraft-cli.exe', ['mcp', '--attach', '7979']);
    let responseData = '';
    
    proc.stdout.on('data', d => {
      responseData += d.toString();
    });

    proc.stderr.on('data', d => {
      // ignore or log
    });

    proc.on('close', code => {
      resolve(responseData);
    });

    proc.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'antigravity-designer', version: '1.0' }
      }
    }) + '\n');

    setTimeout(() => {
      proc.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'batch',
          arguments: {
            commands: batchCommands
          }
        }
      }) + '\n');
    }, 400);

    setTimeout(() => {
      proc.kill();
    }, 4000);
  });
}

async function main() {
  console.log('Connecting to FigCraft desktop on 7979...');

  const steps = [
    // 1. Create Desktop Frame (1440 x 900)
    {
      as: 'desktopFrame',
      command: 'node.create',
      params: {
        type: 'frame',
        name: 'Desktop — Vintage Engraving Landing Page',
        x: 100,
        y: 100,
        width: 1440,
        height: 900,
        props: {
          fill: '#F4EFE6',
          clip: true
        }
      }
    },

    // 2. Outer Ornamental Border on Desktop Frame
    {
      as: 'outerBorder',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'rectangle',
        name: 'Plate Border Outer',
        x: 32,
        y: 32,
        width: 1376,
        height: 836,
        props: {
          fill: 'none',
          stroke: '#16335C',
          strokeWeight: 2
        }
      }
    },
    {
      as: 'innerBorder',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'rectangle',
        name: 'Plate Border Inner',
        x: 40,
        y: 40,
        width: 1360,
        height: 820,
        props: {
          fill: 'none',
          stroke: '#16335C',
          strokeWeight: 0.75,
          opacity: 0.6
        }
      }
    },

    // 3. Header Bar
    {
      as: 'brandHeader',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'text',
        name: 'Brand Header',
        x: 64,
        y: 60,
        text: 'CADIMAGO  •  ARCHIVAL SPECIFICATION ARCHIVE',
        props: {
          fontSize: 13,
          fill: '#16335C',
          letterSpacing: 2
        }
      }
    },
    {
      as: 'plateNumber',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'text',
        name: 'Plate Number',
        x: 1180,
        y: 60,
        text: 'PLATE N° INV-2026-001',
        props: {
          fontSize: 13,
          fill: '#16335C',
          letterSpacing: 1.5
        }
      }
    },
    {
      as: 'dividerLine',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'line',
        name: 'Header Divider',
        x: 64,
        y: 88,
        width: 1312,
        height: 0,
        props: {
          stroke: '#16335C',
          strokeWeight: 1,
          opacity: 0.4
        }
      }
    },

    // 4. Hero Title & Narrative
    {
      as: 'heroEyebrow',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'text',
        name: 'Hero Eyebrow',
        x: 64,
        y: 130,
        text: 'TECHNICAL ARTIFACT & ARCHITECTURAL HERITAGE',
        props: {
          fontSize: 12,
          fill: '#5A6F8C',
          letterSpacing: 2
        }
      }
    },
    {
      as: 'heroTitle',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'text',
        name: 'Hero Title',
        x: 64,
        y: 155,
        text: 'INDUSTRIAL HERITAGE & 3D RECONSTRUCTION',
        props: {
          fontSize: 34,
          fill: '#16335C',
          letterSpacing: 0.5
        }
      }
    },
    {
      as: 'heroSubtitle',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'text',
        name: 'Hero Subtitle',
        x: 64,
        y: 205,
        text: 'Customer QR Verification successful. Below is the historical copperplate engraving specification of the volumetric CAD assembly. Inspect details or enter the interactive WebGL spatial canvas.',
        props: {
          fontSize: 14,
          fill: '#2C405E',
          width: 800
        }
      }
    },

    // 5. Engraving Centerpiece Artwork Card
    {
      as: 'artCard',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'frame',
        name: 'Centerpiece Artwork Card',
        x: 64,
        y: 260,
        width: 880,
        height: 480,
        props: {
          fill: '#EFE8D8',
          stroke: '#16335C',
          strokeWeight: 1.5,
          clip: true
        }
      }
    },
    {
      as: 'artCardInnerBorder',
      command: 'node.create',
      params: {
        parent: { $ref: 'artCard' },
        type: 'rectangle',
        name: 'Artwork Inner Rule',
        x: 8,
        y: 8,
        width: 864,
        height: 464,
        props: {
          fill: 'none',
          stroke: '#16335C',
          strokeWeight: 0.5,
          opacity: 0.5
        }
      }
    },
    {
      as: 'artCardPlaceholderText',
      command: 'node.create',
      params: {
        parent: { $ref: 'artCard' },
        type: 'text',
        name: 'Engraving Caption Overlay',
        x: 28,
        y: 440,
        text: 'FIG. 1 — PERSPECTIVE VIEW OF INDUSTRIAL WORKSHOP & TRUSS ASSEMBLY • COPPERPLATE ETCHING 1888',
        props: {
          fontSize: 10,
          fill: '#16335C',
          letterSpacing: 1.5
        }
      }
    },

    // 6. Right Sidebar: Specifications & Technical Meta
    {
      as: 'specCard',
      command: 'node.create',
      params: {
        parent: { $ref: 'desktopFrame' },
        type: 'frame',
        name: 'Technical Specifications Card',
        x: 968,
        y: 260,
        width: 408,
        height: 480,
        props: {
          fill: '#FAF7F0',
          stroke: '#16335C',
          strokeWeight: 1.5,
          padding: 24,
          layout: 'vertical',
          gap: 16
        }
      }
    },
    {
      as: 'specCardTitle',
      command: 'node.create',
      params: {
        parent: { $ref: 'specCard' },
        type: 'text',
        name: 'Spec Title',
        text: 'SPECIFICATION REGISTRATION',
        props: {
          fontSize: 13,
          fill: '#16335C',
          letterSpacing: 1.5
        }
      }
    },
    {
      as: 'specCodeBox',
      command: 'node.create',
      params: {
        parent: { $ref: 'specCard' },
        type: 'frame',
        name: 'Model Code Box',
        width: 360,
        height: 60,
        props: {
          fill: '#F4EFE6',
          stroke: '#16335C',
          strokeWeight: 1,
          padding: 12,
          layout: 'horizontal',
          mainAlign: 'spaceBetween',
          crossAlign: 'center'
        }
      }
    },
    {
      as: 'specCodeLabel',
      command: 'node.create',
      params: {
        parent: { $ref: 'specCodeBox' },
        type: 'text',
        name: 'Model Code Text',
        text: 'INV-2026-001',
        props: {
          fontSize: 18,
          fill: '#16335C',
          letterSpacing: 1
        }
      }
    },
    {
      as: 'copyBadge',
      command: 'node.create',
      params: {
        parent: { $ref: 'specCodeBox' },
        type: 'frame',
        name: 'Copy Chip',
        width: 68,
        height: 28,
        props: {
          fill: '#16335C',
          cornerRadius: 3,
          layout: 'horizontal',
          mainAlign: 'center',
          crossAlign: 'center'
        }
      }
    },
    {
      as: 'copyBadgeText',
      command: 'node.create',
      params: {
        parent: { $ref: 'copyBadge' },
        type: 'text',
        name: 'Copy Label',
        text: 'SALIN',
        props: {
          fontSize: 10,
          fill: '#FFFFFF',
          letterSpacing: 1
        }
      }
    },

    // Metadata lines in SpecCard
    {
      as: 'metaSpecs',
      command: 'node.create',
      params: {
        parent: { $ref: 'specCard' },
        type: 'text',
        name: 'Specifications Details',
        text: 'FORMAT: Autodesk Inventor / glTF Volumetric\nTOLERANCE: ±0.05 mm Precision Grade\nDATUM ORIGIN: Center [0, 0, 0] WCS\nAR READINESS: QuickLook (USDZ) & WebXR\nSECURITY: SHA-256 Verified Payload',
        props: {
          fontSize: 11,
          fill: '#2C405E',
          lineHeight: 20
        }
      }
    },

    // 7. Motion & Interaction Callout in SpecCard
    {
      as: 'motionBox',
      command: 'node.create',
      params: {
        parent: { $ref: 'specCard' },
        type: 'frame',
        name: 'Motion Feature Callout',
        width: 360,
        height: 80,
        props: {
          fill: '#EBE3D0',
          stroke: '#9C7A3C',
          strokeWeight: 1,
          padding: 12,
          layout: 'vertical',
          gap: 6
        }
      }
    },
    {
      as: 'motionBoxTitle',
      command: 'node.create',
      params: {
        parent: { $ref: 'motionBox' },
        type: 'text',
        name: 'Motion Title',
        text: '✦ MOTION: MECHANICAL SHUTTER REVEAL',
        props: {
          fontSize: 10,
          fill: '#5A4315',
          letterSpacing: 1
        }
      }
    },
    {
      as: 'motionBoxDesc',
      command: 'node.create',
      params: {
        parent: { $ref: 'motionBox' },
        type: 'text',
        name: 'Motion Description',
        text: 'Upon pressing the entry trigger, the linework etches dynamically and an analog aperture iris reveals the live 3D canvas.',
        props: {
          fontSize: 10,
          fill: '#5A4315'
        }
      }
    },

    // 8. Primary Action Button (BUKA 3D VIEWER)
    {
      as: 'ctaButton',
      command: 'node.create',
      params: {
        parent: { $ref: 'specCard' },
        type: 'frame',
        name: 'Primary CTA Button',
        width: 360,
        height: 52,
        props: {
          fill: '#16335C',
          stroke: '#D2C4A7',
          strokeWeight: 1.5,
          cornerRadius: 2,
          layout: 'horizontal',
          mainAlign: 'center',
          crossAlign: 'center'
        }
      }
    },
    {
      as: 'ctaButtonText',
      command: 'node.create',
      params: {
        parent: { $ref: 'ctaButton' },
        type: 'text',
        name: 'CTA Button Text',
        text: 'BUKA 3D VIEWER  ➔',
        props: {
          fontSize: 13,
          fill: '#F4EFE6',
          letterSpacing: 1.5
        }
      }
    },

    // 9. Mobile Artboard (390 x 844)
    {
      as: 'mobileFrame',
      command: 'node.create',
      params: {
        type: 'frame',
        name: 'Mobile — QR Customer Scan View',
        x: 1600,
        y: 100,
        width: 390,
        height: 844,
        props: {
          fill: '#F4EFE6',
          clip: true
        }
      }
    },
    {
      as: 'mobileBorder',
      command: 'node.create',
      params: {
        parent: { $ref: 'mobileFrame' },
        type: 'rectangle',
        name: 'Mobile Border Outer',
        x: 16,
        y: 16,
        width: 358,
        height: 812,
        props: {
          fill: 'none',
          stroke: '#16335C',
          strokeWeight: 1.5
        }
      }
    },
    {
      as: 'mobileHeader',
      command: 'node.create',
      params: {
        parent: { $ref: 'mobileFrame' },
        type: 'text',
        name: 'Mobile Brand',
        x: 32,
        y: 36,
        text: 'CADIMAGO  •  N° INV-2026-001',
        props: {
          fontSize: 11,
          fill: '#16335C',
          letterSpacing: 1.5
        }
      }
    },
    {
      as: 'mobileTitle',
      command: 'node.create',
      params: {
        parent: { $ref: 'mobileFrame' },
        type: 'text',
        name: 'Mobile Title',
        x: 32,
        y: 65,
        text: 'INDUSTRIAL HERITAGE',
        props: {
          fontSize: 22,
          fill: '#16335C'
        }
      }
    },
    {
      as: 'mobileArt',
      command: 'node.create',
      params: {
        parent: { $ref: 'mobileFrame' },
        type: 'frame',
        name: 'Mobile Engraving Frame',
        x: 32,
        y: 110,
        width: 326,
        height: 280,
        props: {
          fill: '#EFE8D8',
          stroke: '#16335C',
          strokeWeight: 1
        }
      }
    },
    {
      as: 'mobileSpecBlock',
      command: 'node.create',
      params: {
        parent: { $ref: 'mobileFrame' },
        type: 'frame',
        name: 'Mobile Specs Block',
        x: 32,
        y: 410,
        width: 326,
        height: 260,
        props: {
          fill: '#FAF7F0',
          stroke: '#16335C',
          strokeWeight: 1,
          padding: 16,
          layout: 'vertical',
          gap: 12
        }
      }
    },
    {
      as: 'mobileCta',
      command: 'node.create',
      params: {
        parent: { $ref: 'mobileFrame' },
        type: 'frame',
        name: 'Mobile Sticky CTA',
        x: 32,
        y: 740,
        width: 326,
        height: 54,
        props: {
          fill: '#16335C',
          cornerRadius: 3,
          layout: 'horizontal',
          mainAlign: 'center',
          crossAlign: 'center'
        }
      }
    },
    {
      as: 'mobileCtaText',
      command: 'node.create',
      params: {
        parent: { $ref: 'mobileCta' },
        type: 'text',
        name: 'Mobile CTA Text',
        text: 'BUKA 3D VIEWER',
        props: {
          fontSize: 13,
          fill: '#F4EFE6',
          letterSpacing: 1.5
        }
      }
    }
  ];

  const result = await runMcpBatch(steps);
  console.log('Batch result:', result);
}

main().catch(console.error);
