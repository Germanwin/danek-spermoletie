import { del, list, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOCAL_CONFIG = path.join(process.cwd(), 'data', 'video.json');
const BLOB_CONFIG_PREFIX = 'config/main-video';

export async function GET() {
  // Try local file first (works in dev; on Vercel only if pre-committed)
  try {
    if (fs.existsSync(LOCAL_CONFIG)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_CONFIG, 'utf8'));
      if (data.url) return NextResponse.json({ url: data.url });
    }
  } catch {}

  // Try Vercel Blob config file
  try {
    const { blobs } = await list({ prefix: BLOB_CONFIG_PREFIX });
    if (blobs.length > 0) {
      const latest = blobs.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )[0];
      const res = await fetch(latest.url + '?nocache=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data.url) return NextResponse.json({ url: data.url });
      }
    }
  } catch (e) {
    console.error('Failed to read blob config:', e);
  }

  return NextResponse.json({ url: null });
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Нет URL' }, { status: 400 });
  }

  // Save to local file (works in dev)
  try {
    fs.writeFileSync(LOCAL_CONFIG, JSON.stringify({ url }, null, 2));
  } catch {}

  // Save to Vercel Blob (persistent in production)
  try {
    const { blobs } = await list({ prefix: BLOB_CONFIG_PREFIX });
    if (blobs.length > 0) {
      await del(blobs.map(b => b.url));
    }
    await put('config/main-video.json', JSON.stringify({ url }), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } catch (e) {
    console.error('Failed to save to blob:', e);
  }

  return NextResponse.json({ ok: true });
}
