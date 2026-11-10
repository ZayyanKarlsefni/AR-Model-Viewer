const fs = require('fs');
const path = require('path');

const positions = new Float32Array([
  // Front face
  -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,
  // Back face
  -1, -1, -1,  -1,  1, -1,   1,  1, -1,   1, -1, -1,
  // Top face
  -1,  1, -1,  -1,  1,  1,   1,  1,  1,   1,  1, -1,
  // Bottom face
  -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
  // Right face
   1, -1, -1,   1,  1, -1,   1,  1,  1,   1, -1,  1,
  // Left face
  -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1
]);

const indices = new Uint16Array([
   0,  1,  2,   0,  2,  3,
   4,  5,  6,   4,  6,  7,
   8,  9, 10,   8, 10, 11,
  12, 13, 14,  12, 14, 15,
  16, 17, 18,  16, 18, 19,
  20, 21, 22,  20, 22, 23
]);

const posBytes = Buffer.from(positions.buffer);
const idxBytes = Buffer.from(indices.buffer);

const padIdx = (4 - (idxBytes.length % 4)) % 4;
const paddedIdxBytes = Buffer.concat([idxBytes, Buffer.alloc(padIdx)]);

const binBuffer = Buffer.concat([paddedIdxBytes, posBytes]);

const gltf = {
  asset: { version: '2.0', generator: 'MinimalCube' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0 }],
  meshes: [{
    primitives: [{
      attributes: { POSITION: 1 },
      indices: 0,
      mode: 4
    }]
  }],
  buffers: [{ byteLength: binBuffer.length }],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: idxBytes.length, target: 34963 },
    { buffer: 0, byteOffset: paddedIdxBytes.length, byteLength: posBytes.length, target: 34962 }
  ],
  accessors: [
    { bufferView: 0, byteOffset: 0, componentType: 5123, count: indices.length, type: 'SCALAR', min: [0], max: [23] },
    { bufferView: 1, byteOffset: 0, componentType: 5126, count: 24, type: 'VEC3', min: [-1, -1, -1], max: [1, 1, 1] }
  ]
};

const jsonStr = JSON.stringify(gltf);
const jsonBuffer = Buffer.from(jsonStr, 'utf8');
const padJson = (4 - (jsonBuffer.length % 4)) % 4;
const paddedJson = Buffer.concat([jsonBuffer, Buffer.alloc(padJson, 0x20)]);

const totalLength = 12 + 8 + paddedJson.length + 8 + binBuffer.length;

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546C67, 0); // magic glTF
header.writeUInt32LE(2, 4);          // version 2
header.writeUInt32LE(totalLength, 8); // total length

const chunk0Header = Buffer.alloc(8);
chunk0Header.writeUInt32LE(paddedJson.length, 0);
chunk0Header.writeUInt32LE(0x4E4F534A, 4); // JSON

const chunk1Header = Buffer.alloc(8);
chunk1Header.writeUInt32LE(binBuffer.length, 0);
chunk1Header.writeUInt32LE(0x004E4942, 4); // BIN

const finalGlb = Buffer.concat([header, chunk0Header, paddedJson, chunk1Header, binBuffer]);

fs.mkdirSync('public/models', { recursive: true });
fs.writeFileSync('public/models/sample-cube.glb', finalGlb);
console.log('Successfully created public/models/sample-cube.glb, size:', finalGlb.length);
