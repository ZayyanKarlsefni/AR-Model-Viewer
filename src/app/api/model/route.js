import { list, put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { prune, dedup, quantize } from '@gltf-transform/functions';
import { KHRMeshQuantization, KHRTextureTransform } from '@gltf-transform/extensions';

// Fallback token to guarantee Blob access even if environment variable is missing on Vercel
const FALLBACK_BLOB_TOKEN = 'vercel_blob_rw_dseMKFu73Lcnk2XU_avJhCkA7p8uvfc1R4QvJtEM7GOke5n';

// Initialize glTF-Transform IO with registered extensions
const io = new NodeIO().registerExtensions([KHRMeshQuantization, KHRTextureTransform]);

// Helper function to compress GLB file buffer
async function compressGlb(buffer) {
  const doc = await io.readBinary(new Uint8Array(buffer));
  await doc.transform(
    prune(),
    dedup(),
    quantize({
      quantizePosition: 14,
      quantizeNormal: 10,
      quantizeTexcoord: 12,
      quantizeColor: 8
    })
  );
  return await io.writeBinary(doc);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const cleanCode = code.trim().toLowerCase();
    const token = process.env.BLOB_READ_WRITE_TOKEN || FALLBACK_BLOB_TOKEN;

    // 1. Production Mode: Vercel Blob Storage
    if (token) {
      // List all model blobs under models/ prefix
      const { blobs } = await list({ 
        prefix: 'models/',
        token: token
      });
      
      if (blobs && blobs.length > 0) {
        // Filter blobs that match the code (supports full GUID or 8-char short ID)
        const matchingBlobs = blobs.filter(b => b.pathname.toLowerCase().includes(cleanCode));
        
        if (matchingBlobs.length > 0) {
          // Check if a compressed version exists
          const compressedBlob = matchingBlobs.find(b => b.pathname.includes('_compressed'));
          if (compressedBlob) {
            return NextResponse.json({ url: compressedBlob.url });
          }

          // If only the original uncompressed model exists
          const originalBlob = matchingBlobs.find(b => !b.pathname.includes('_compressed'));
          if (originalBlob) {
            console.log(`[Compression] Starting on-the-fly optimization for model: ${cleanCode}`);
            
            try {
              const fileResponse = await fetch(originalBlob.url);
              if (!fileResponse.ok) {
                throw new Error('Failed to download original model from Vercel Blob');
              }
              const arrayBuffer = await fileResponse.arrayBuffer();

              // Compress the model
              const compressedBuffer = await compressGlb(arrayBuffer);

              // Upload compressed model
              const newBlob = await put(`models/${cleanCode}_compressed.glb`, Buffer.from(compressedBuffer), {
                access: 'public',
                addRandomSuffix: false,
                token: token
              });

              // Delete original model to save storage space
              try {
                await del(originalBlob.url, { token: token });
              } catch (delErr) {
                console.error('[Compression] Warning: could not delete original blob:', delErr);
              }

              console.log(`[Compression] Completed for ${cleanCode}. Savings: ${((1 - compressedBuffer.byteLength / arrayBuffer.byteLength) * 100).toFixed(2)}%`);
              return NextResponse.json({ url: newBlob.url });
            } catch (compressErr) {
              console.error('[Compression] Optimization failed, fallback to original model:', compressErr);
              return NextResponse.json({ url: originalBlob.url });
            }
          }
        }
      }
    }

    // 2. Development Mode: Local Filesystem Fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const matchingFile = files.find(f => f.toLowerCase().includes(cleanCode));
      if (matchingFile) {
        return NextResponse.json({ url: `/uploads/${matchingFile}` });
      }
    }

    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
