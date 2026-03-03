import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { put, list } from '@vercel/blob';
import path from 'path';
import fs from 'fs';

const WISHES_BLOB_PATH = 'wishes-data/wishes.json';
const WISHES_LOCAL_FILE = path.join(process.cwd(), 'data', 'wishes.json');

interface Wish {
  id: string;
  name: string;
  text: string;
  media: { url: string; mimetype: string; originalname: string }[];
  createdAt: string;
}

async function readWishes(): Promise<Wish[]> {
  // In development, use local filesystem (faster, no network issues)
  if (process.env.NODE_ENV !== 'production') {
    try {
      if (fs.existsSync(WISHES_LOCAL_FILE)) {
        return JSON.parse(fs.readFileSync(WISHES_LOCAL_FILE, 'utf8'));
      }
    } catch {
      // Fall through to blob storage
    }
  }

  // In production or as fallback, use Vercel Blob
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
  // In development, also write to local filesystem
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
  }

  // Also update Vercel Blob if not in development
  if (process.env.NODE_ENV === 'production') {
    await put(WISHES_BLOB_PATH, JSON.stringify(wishes), {
      access: 'public',
      allowOverwrite: true,
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  }
}

export async function GET() {
  const wishes = await readWishes();
  return NextResponse.json(wishes);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = (formData.get('name') as string)?.trim();
  const text = (formData.get('text') as string)?.trim();
  const files = formData.getAll('media') as File[];

  if (!name || !text) {
    return NextResponse.json({ error: 'Нужны имя и текст' }, { status: 400 });
  }

  const realFiles = files.filter(f => f instanceof File && f.size > 0);

  if (realFiles.length > 3) {
    return NextResponse.json({ error: 'Максимум 3 медиафайла' }, { status: 400 });
  }

  for (const file of realFiles) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Разрешены только фото и видео' }, { status: 400 });
    }
  }

  const media: { url: string; mimetype: string; originalname: string }[] = [];

  for (const file of realFiles) {
    if (!(file instanceof File) || file.size === 0) continue;
    const ext = path.extname(file.name) || '';
    const blobName = `wishes/${uuidv4()}${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const blob = await put(blobName, arrayBuffer, {
      access: 'public',
      contentType: file.type,
    });
    media.push({ url: blob.url, mimetype: file.type, originalname: file.name });
  }

  const wish: Wish = {
    id: uuidv4(),
    name,
    text,
    media,
    createdAt: new Date().toISOString(),
  };

  const wishes = await readWishes();
  wishes.unshift(wish);
  await writeWishes(wishes);

  return NextResponse.json(wish);
}
