import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    schemaVersion: 1,
    app: "cad-viewer",
    backend: "vercel-blob",
    rootDir: "",
    stepArtifactGenerationAvailable: false
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
