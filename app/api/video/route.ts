import { del, list, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VIDEO_BLOB_PATH = 'config/main-video.json';
const VIDEO_LOCAL_FILE = path.join(process.cwd(), 'data', 'video.json');

async function readVideoUrl(): Promise<string | null> {
  // In development, use local filesystem (faster, no network issues)
  if (process.env.NODE_ENV !== 'production') {
    try {
      if (fs.existsSync(VIDEO_LOCAL_FILE)) {
        const data = JSON.parse(fs.readFileSync(VIDEO_LOCAL_FILE, 'utf8'));
        if (data.url) return data.url;
      }
    } catch {
      // Fall through to blob storage
    }
  }

  // In production or as fallback, use Vercel Blob
  try {
    const { blobs } = await list({ prefix: VIDEO_BLOB_PATH });
    if (blobs.length === 0) return null;
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const url = await readVideoUrl();
  return NextResponse.json({ url });
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Нет URL' }, { status: 400 });
  }

  // In development, write to local filesystem
  if (process.env.NODE_ENV !== 'production') {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(VIDEO_LOCAL_FILE, JSON.stringify({ url }, null, 2));
    } catch (e) {
      console.error('Failed to write video config to local file:', e);
    }
  }

  // In production, update Vercel Blob
  if (process.env.NODE_ENV === 'production') {
    const { blobs } = await list({ prefix: VIDEO_BLOB_PATH });
    if (blobs.length > 0) {
      await del(blobs.map(b => b.url));
    }

    await put(VIDEO_BLOB_PATH, JSON.stringify({ url }), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  }

  return NextResponse.json({ ok: true });
}
