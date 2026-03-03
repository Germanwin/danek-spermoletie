import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const WISHES_FILE = path.join(process.cwd(), 'data', 'wishes.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

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
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const formData = await req.formData();
  const name = (formData.get('name') as string)?.trim();
  const text = (formData.get('text') as string)?.trim();
  const files = formData.getAll('media') as File[];

  if (!name || !text) {
    return NextResponse.json({ error: 'Нужны имя и текст' }, { status: 400 });
  }

  const media: { filename: string; mimetype: string; originalname: string }[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;
    const ext = path.extname(file.name) || '';
    const filename = uuidv4() + ext;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
    media.push({ filename, mimetype: file.type, originalname: file.name });
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
