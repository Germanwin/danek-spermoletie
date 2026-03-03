import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const WISHES_FILE = path.join(process.cwd(), 'data', 'wishes.json');

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!fs.existsSync(WISHES_FILE)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let wishes: { id: string; media: { url: string }[] }[] = JSON.parse(
    fs.readFileSync(WISHES_FILE, 'utf8')
  );

  const wish = wishes.find((w) => w.id === params.id);
  if (!wish) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }

  const blobUrls = (wish.media ?? []).map((m) => m.url).filter(Boolean);
  if (blobUrls.length > 0) {
    await del(blobUrls);
  }

  wishes = wishes.filter((w) => w.id !== params.id);
  fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2));

  return NextResponse.json({ ok: true });
}
