import { list, put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { prune, dedup, quantize } from '@gltf-transform/functions';
import { KHRMeshQuantization, KHRTextureTransform } from '@gltf-transform/extensions';

// Initialize glTF-Transform IO with registered extensions
const io = new NodeIO().registerExtensions([KHRMeshQuantization, KHRTextureTransform]);

// Helper function to compress GLB file buffer
async function compressGlb(buffer) {
  // Read GLB file
  const doc = await io.readBinary(new Uint8Array(buffer));
  
  // Apply optimizations
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
  
  // Write back compressed GLB
  return await io.writeBinary(doc);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    // 1. Production Mode: Vercel Blob Storage
    if (token) {
      const { blobs } = await list({ 
        prefix: `models/${code}`,
        token: token
      });
      
      if (blobs && blobs.length > 0) {
        // Check if the compressed version already exists
        const compressedBlob = blobs.find(b => b.pathname.endsWith('_compressed.glb'));
        if (compressedBlob) {
          return NextResponse.json({ url: compressedBlob.url });
        }

        // If only the original exists, compress it on-the-fly
        const originalBlob = blobs.find(b => b.pathname.endsWith(`${code}.glb`));
        if (originalBlob) {
          console.log(`[Compression] Starting on-the-fly optimization for model: ${code}`);
          
          try {
            // Download the original GLB from Vercel Blob
            const fileResponse = await fetch(originalBlob.url);
            if (!fileResponse.ok) {
              throw new Error('Failed to download original model from Vercel Blob');
            }
            const arrayBuffer = await fileResponse.arrayBuffer();

            // Compress the model
            const compressedBuffer = await compressGlb(arrayBuffer);

            // Upload compressed model
            const newBlob = await put(`models/${code}_compressed.glb`, Buffer.from(compressedBuffer), {
              access: 'public',
              addRandomSuffix: false,
              token: token
            });

            // Delete original model to save storage space
            await del(originalBlob.url, { token: token });

            console.log(`[Compression] Completed for ${code}. New size: ${(compressedBuffer.byteLength / 1024).toFixed(2)} KB. Savings: ${((1 - compressedBuffer.byteLength / arrayBuffer.byteLength) * 100).toFixed(2)}%`);
            return NextResponse.json({ url: newBlob.url });
          } catch (compressErr) {
            console.error('[Compression] Optimization failed, fallback to original model:', compressErr);
            return NextResponse.json({ url: originalBlob.url });
          }
        }
      }
    }

    // 2. Development Mode: Local Filesystem Fallback
    const localCompressedPath = path.join(process.cwd(), 'public', 'uploads', `${code}_compressed.glb`);
    if (fs.existsSync(localCompressedPath)) {
      return NextResponse.json({ url: `/uploads/${code}_compressed.glb` });
    }

    const localPath = path.join(process.cwd(), 'public', 'uploads', `${code}.glb`);
    if (fs.existsSync(localPath)) {
      try {
        console.log(`[Local Compression] Quantizing model locally: ${code}`);
        const fileData = fs.readFileSync(localPath);
        const compressedBuffer = await compressGlb(fileData.buffer);
        
        fs.writeFileSync(localCompressedPath, Buffer.from(compressedBuffer));
        
        // Remove original file
        try {
          fs.unlinkSync(localPath);
        } catch (e) {
          // ignore error if unlink fails
        }
        
        return NextResponse.json({ url: `/uploads/${code}_compressed.glb` });
      } catch (localCompressErr) {
        console.error('[Local Compression] Failed, fallback to original:', localCompressErr);
        return NextResponse.json({ url: `/uploads/${code}.glb` });
      }
    }

    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
