import { NextRequest, NextResponse } from 'next/server';
import { del, put, list } from '@vercel/blob';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const WISHES_BLOB_PATH = 'wishes-data/wishes.json';
const WISHES_LOCAL_FILE = path.join(process.cwd(), 'data', 'wishes.json');

interface Wish {
  id: string;
  media: { url: string }[];
}

async function readWishes(): Promise<Wish[]> {
  if (process.env.NODE_ENV !== 'production') {
    try {
      if (fs.existsSync(WISHES_LOCAL_FILE)) {
        return JSON.parse(fs.readFileSync(WISHES_LOCAL_FILE, 'utf8'));
      }
    } catch {}
    return [];
  }

  try {
    const { blobs } = await list({ prefix: WISHES_BLOB_PATH });
    if (blobs.length === 0) return [];
    const response = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

async function writeWishes(wishes: Wish[]): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(WISHES_LOCAL_FILE, JSON.stringify(wishes, null, 2));
    } catch (e) {
      console.error('Failed to write to local file:', e);
    }
    return;
  }

  await put(WISHES_BLOB_PATH, JSON.stringify(wishes), {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const wishes = await readWishes();

  const wish = wishes.find((w) => w.id === params.id);
  if (!wish) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }

  // Delete media blobs only in production
  if (process.env.NODE_ENV === 'production') {
    const blobUrls = (wish.media ?? []).map((m) => m.url).filter(Boolean);
    if (blobUrls.length > 0) {
      await del(blobUrls);
    }
  }

  const updated = wishes.filter((w) => w.id !== params.id);
  await writeWishes(updated);

  return NextResponse.json({ ok: true });
}
