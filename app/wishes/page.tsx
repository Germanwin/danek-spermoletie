'use client';

import { useEffect, useRef, useState } from 'react';

interface MediaItem {
  url: string;
  mimetype: string;
  originalname: string;
}

interface Wish {
  id: string;
  name: string;
  text: string;
  media: MediaItem[];
  createdAt: string;
}

const CARD_COLORS = ['card-color-0', 'card-color-1', 'card-color-2', 'card-color-3', 'card-color-4', 'card-color-5'];
const CARD_DECOS = ['💩', '🍆', '🎉', '🎂', '🥳', '💦', '🔥', '💫', '🍑', '👅'];

// ── Wish Card ──────────────────────────────────────────────────────────────
function WishCard({ wish, onDelete }: { wish: Wish; onDelete: (id: string) => void }) {
  const colorIdx = wish.id.charCodeAt(0) % CARD_COLORS.length;
  const decoIdx  = wish.id.charCodeAt(1) % CARD_DECOS.length;

  const date = new Date(wish.createdAt).toLocaleString('ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  async function handleDelete() {
    if (!confirm('Точно удалить пожелание?')) return;
    await fetch(`/api/wishes/${wish.id}`, { method: 'DELETE' });
    onDelete(wish.id);
  }

  return (
    <div className={`wish-card ${CARD_COLORS[colorIdx]}`}>
      <span className="card-deco">{CARD_DECOS[decoIdx]}</span>
      <div className="card-name">✍️ {wish.name}</div>
      <p className="card-text">{wish.text}</p>

      {wish.media.length > 0 && (
        <div className="card-media">
          {wish.media.map((m) =>
            m.mimetype.startsWith('image/') ? (
              <img
                key={m.url}
                src={m.url}
                alt={m.originalname}
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.retried) {
                    img.dataset.retried = '1';
                    img.src = m.url + '?retry=' + Date.now();
                  } else {
                    img.style.display = 'none';
                  }
                }}
              />
            ) : (
              <video
                key={m.url}
                src={m.url}
                controls
                playsInline
                preload="metadata"
                onError={(e) => {
                  const vid = e.currentTarget;
                  if (!vid.dataset.retried) {
                    vid.dataset.retried = '1';
                    vid.src = m.url + '?retry=' + Date.now();
                  }
                }}
              />
            )
          )}
        </div>
      )}

      <div className="card-date">📅 {date}</div>
      <button className="card-delete-btn" onClick={handleDelete} title="Удалить">✖</button>
    </div>
  );
}

// ── Wish Form ──────────────────────────────────────────────────────────────
function WishForm({ onClose, onAdded }: { onClose: () => void; onAdded: (w: Wish) => void }) {
  const [name, setName]         = useState('');
  const [text, setText]         = useState('');
  const [files, setFiles]       = useState<File[]>([]);
  const [status, setStatus]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading]   = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef            = useRef<HTMLInputElement>(null);

  const MAX_FILES = 3;

  const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const all = Array.from(incoming);
    const allowed = all.filter(f => {
      if (f.type.startsWith('image/')) return true;
      if (f.type.startsWith('video/') && SUPPORTED_VIDEO_TYPES.includes(f.type)) return true;
      return false;
    });
    if (allowed.length < all.length) {
      const rejected = all.length - allowed.length;
      setStatus({ msg: `⚠️ ${rejected} файл(ов) отклонено. Видео: только MP4, WebM, MOV`, ok: false });
    }
    setFiles(prev => {
      const merged = [...prev, ...allowed];
      if (merged.length > MAX_FILES) {
        setStatus({ msg: `⚠️ Максимум ${MAX_FILES} файла!`, ok: false });
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      setStatus({ msg: 'Заполни имя и текст, ну!', ok: false });
      return;
    }
    setLoading(true);
    setStatus(null);

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('text', text.trim());
    files.forEach(f => fd.append('media', f));

    try {
      const res = await fetch('/api/wishes', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const wish = await res.json() as Wish;
      setStatus({ msg: '🎉 Пожелание отправлено!', ok: true });
      onAdded(wish);
      setTimeout(onClose, 1000);
    } catch {
      setStatus({ msg: '💥 Ошибка! Попробуй ещё раз.', ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✖</button>
        <h2 className="modal-title">💩 НАПИШИ ДАНЕЧКЕ 💩</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">😎 ТЫ КТО ТАКОЙ?</label>
            <input
              className="form-input"
              type="text"
              placeholder="Твоё имя..."
              maxLength={100}
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">💬 ЧТО ХОЧЕШЬ СКАЗАТЬ?</label>
            <textarea
              className="form-textarea"
              placeholder="Пиши пожелания тут, не стесняйся..."
              rows={5}
              maxLength={2000}
              value={text}
              onChange={e => setText(e.target.value)}
              required
            />
            <span className="char-count">{text.length} / 2000</span>
          </div>

          <div className="form-group">
            <label className="form-label">📎 ФОТКИ / ВИДОСЫ (необязательно, макс. 3)</label>
            <div
              className={`file-drop-zone${dragOver ? ' drag-over' : ''}${files.length >= MAX_FILES ? ' drop-zone-disabled' : ''}`}
              onClick={() => files.length < MAX_FILES && fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); if (files.length < MAX_FILES) setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            >
              <span className="file-drop-icon">📁</span>
              {files.length >= MAX_FILES ? (
                <p>Лимит достигнут ({MAX_FILES}/{MAX_FILES})</p>
              ) : (
                <>
                  <p>Перетащи или нажми чтобы выбрать</p>
                  <p className="file-drop-sub">Только фото и видео · макс. {MAX_FILES} файла · до 100МБ каждый</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm,video/quicktime"
                style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="file-preview">
                {files.map((f, i) => (
                  <div key={i} className="preview-item">
                    {f.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(f)} alt={f.name} />
                    ) : (
                      <video src={URL.createObjectURL(f)} />
                    )}
                    <button type="button" className="remove-file" onClick={() => removeFile(i)}>✖</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? '⏳ ОТПРАВЛЯЕМ...' : '🚀 ОТПРАВИТЬ 🚀'}
          </button>

          {status && (
            <p className={`form-status ${status.ok ? 'status-ok' : 'status-err'}`}>
              {status.msg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function WishesPage() {
  const [wishes, setWishes]       = useState<Wish[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);

  useEffect(() => {
    fetch('/api/wishes')
      .then(r => r.json())
      .then((data: Wish[]) => setWishes(data))
      .finally(() => setLoading(false));
  }, []);

  function handleAdded(w: Wish) {
    setWishes(prev => [w, ...prev]);
  }

  function handleDeleted(id: string) {
    setWishes(prev => prev.filter(w => w.id !== id));
  }

  return (
    <main>
      <section className="hero-section wishes-header">
        <span className="emoji-strip">💌🍑💌🍑💌🍑💌🍑💌🍑💌🍑💌🍑💌🍑</span>
        <h1 className="main-title">ПОЖЕЛАШКИ</h1>
        <h2 className="subtitle">от самых любимых людей 💖</h2>
        <span className="emoji-strip">🍑💌🍑💌🍑💌🍑💌🍑💌🍑💌🍑💌🍑💌🍑</span>
      </section>

      <div className="add-btn-wrap">
        <button className="add-wish-btn" onClick={() => setShowForm(true)}>
          ✍️ НАПИСАТЬ ПОЖЕЛАНИЕ ✍️
        </button>
      </div>

      {showForm && (
        <WishForm onClose={() => setShowForm(false)} onAdded={handleAdded} />
      )}

      {loading ? (
        <span className="loading-state">💩</span>
      ) : (
        <div className="wishes-grid">
          {wishes.length === 0 ? (
            <div className="empty-state">
              <span className="big">😢</span>
              Пока никто ничего не написал...<br />Будь первым, пидор!
            </div>
          ) : (
            wishes.map(w => (
              <WishCard key={w.id} wish={w} onDelete={handleDeleted} />
            ))
          )}
        </div>
      )}
    </main>
  );
}
