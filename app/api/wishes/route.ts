import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const WISHES_FILE = path.join(process.cwd(), 'data', 'wishes.json');

function readWishes() {
  if (!fs.existsSync(WISHES_FILE)) {
    fs.writeFileSync(WISHES_FILE, '[]');
  }
  return JSON.parse(fs.readFileSync(WISHES_FILE, 'utf8'));
}

function writeWishes(wishes: unknown[]) {
  fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2));
}

export async function GET() {
  const wishes = readWishes();
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
    // Convert to ArrayBuffer first — passing File directly can hang in Node.js runtime
    const arrayBuffer = await file.arrayBuffer();
    const blob = await put(blobName, arrayBuffer, {
      access: 'public',
      contentType: file.type,
    });
    media.push({ url: blob.url, mimetype: file.type, originalname: file.name });
  }

  const wish = {
    id: uuidv4(),
    name,
    text,
    media,
    createdAt: new Date().toISOString(),
  };

  const wishes = readWishes();
  wishes.unshift(wish);
  writeWishes(wishes);

  return NextResponse.json(wish);
}
