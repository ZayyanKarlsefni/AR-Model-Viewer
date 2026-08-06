import { NextResponse } from 'next/server';

const PLUGIN_KEY_HEADER = 'x-plugin-key';
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_EXTS = new Set(['glb', 'step', 'stp']);

export function getPluginKey() {
  return process.env.PLUGIN_UPLOAD_KEY || null;
}

export function verifyPluginKey(request) {
  const expected = getPluginKey();
  if (!expected) {
    return NextResponse.json(
      { error: 'PLUGIN_UPLOAD_KEY not configured on server' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const provided = request.headers.get(PLUGIN_KEY_HEADER);
  if (!provided || provided.length !== expected.length) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  // timing-safe compare
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  let diff = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a[i] || 0) ^ (b[i] || 0);
  }
  if (diff !== 0) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  return null;
}

export function validateUploadMeta({ code, ext }) {
  if (!code || !/^[a-zA-Z0-9_-]+$/.test(code)) {
    return { error: 'Invalid code' };
  }
  const cleanExt = String(ext || '').replace('.', '').toLowerCase();
  if (!ALLOWED_EXTS.has(cleanExt)) {
    return { error: `Extension .${cleanExt} not allowed` };
  }
  const contentLengthOk = true; // checked against content-length header separately
  return { cleanExt, ok: true };
}

export function checkContentLength(request) {
  const cl = Number(request.headers.get('content-length') || 0);
  if (cl > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Upload too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)` },
      { status: 413, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  return null;
}

export { MAX_UPLOAD_BYTES, ALLOWED_EXTS };
