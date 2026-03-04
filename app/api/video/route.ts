import { del, list, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const VIDEO_BLOB_PATH = 'config/main-video.json';
const VIDEO_LOCAL_FILE = path.join(process.cwd(), 'data', 'video.json');

async function readVideoUrl(): Promise<string | null> {
  if (process.env.NODE_ENV !== 'production') {
    try {
      if (fs.existsSync(VIDEO_LOCAL_FILE)) {
        const data = JSON.parse(fs.readFileSync(VIDEO_LOCAL_FILE, 'utf8'));
        if (data.url) return data.url;
      }
    } catch {}
    return null;
  }

  try {
    const { blobs } = await list({ prefix: VIDEO_BLOB_PATH });
    if (blobs.length === 0) return null;
    const res = await fetch(blobs[0].url + '?t=' + Date.now());
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
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Нет файла' }, { status: 400 });
    }

    let url: string;

    if (process.env.NODE_ENV !== 'production') {
      // Save locally in development
      const ext = file.name.split('.').pop() || 'mp4';
      const fileName = `main-video.${ext}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(uploadsDir, fileName),
        Buffer.from(await file.arrayBuffer()),
      );
      url = `/uploads/${fileName}`;
    } else {
      // Upload to Vercel Blob server-side
      const blob = await put(`video/${file.name}`, file, {
        access: 'public',
        contentType: file.type,
      });
      url = blob.url;
    }

    // Save video URL to config
    if (process.env.NODE_ENV !== 'production') {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(VIDEO_LOCAL_FILE, JSON.stringify({ url }, null, 2));
    } else {
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

    return NextResponse.json({ url });
  } catch (e) {
    console.error('POST /api/video error:', e);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}
