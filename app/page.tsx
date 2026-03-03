'use client';

import { upload } from '@vercel/blob/client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function VideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetch('/api/video')
      .then(r => r.json())
      .then(data => { if (data.url) setVideoUrl(data.url); })
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploading(true);
    setUploadProgress(0);

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      });

      await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blob.url }),
      });

      setVideoUrl(blob.url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Ошибка загрузки 💥');
    } finally {
      setUploading(false);
    }
  }

  return (
    <main>
      {/* HERO */}
      <section className="hero-section">
        <span className="emoji-strip">💩🍆💩🍆💩🍆💩🍆💩🍆💩🍆💩🍆💩</span>
        <h1 className="main-title">ДЕНЬ СПЕРМОЛЕТИЯ</h1>
        <h2 className="subtitle">🎉 ДАНИИЛ СПЕРМОЕД 🎉</h2>
        <p className="tagline">ЕМУ УЖЕ ДОХУЯ ЛЕТ И ОН ВСЁ ЕЩЁ СПЕРМОЕД 💦</p>
        <span className="emoji-strip">🍆💩🍆💩🍆💩🍆💩🍆💩🍆💩🍆💩🍆💩</span>
      </section>

      {/* VIDEO */}
      <div className="video-outer">
        <div className="video-frame">
          <div className="video-deco-bar">💩 💩 💩 🎂 ВИДОС ДЛЯ ДАНЕЧКИ 🎂 💩 💩 💩</div>

          {loading ? (
            <div className="video-placeholder">
              <span className="placeholder-icon">⏳</span>
              <p className="placeholder-title">ЗАГРУЖАЕМ...</p>
            </div>
          ) : videoUrl ? (
            <video
              ref={videoRef}
              className="video-el"
              src={videoUrl}
              controls
              autoPlay
            />
          ) : (
            <div className="video-placeholder">
              <span className="placeholder-icon">🎬</span>
              <p className="placeholder-title">ТУТ БУДЕТ ВИДОС</p>
              <p className="placeholder-sub">Загрузи видео — оно сохранится навсегда ↓</p>
            </div>
          )}

          <div className="video-deco-bar">🍆 🍆 🍆 🎉 С ДНЁМ РОЖДЕНИЯ 🎉 🍆 🍆 🍆</div>
        </div>

        {uploading ? (
          <div className="upload-progress-wrap">
            <p className="upload-progress-text">⏳ ЗАКАЧИВАЕМ... {uploadProgress}%</p>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <label className="local-upload-btn" style={{ marginTop: 16 }}>
            📁 {videoUrl ? 'Заменить видос' : 'ЗАГРУЗИТЬ ВИДОС'}
            <input type="file" accept="video/*" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
        )}

        <Link href="/wishes" className="go-wishes-btn">
          💌 ПОЧИТАТЬ ПОЖЕЛАШКИ 💌
        </Link>
      </div>
    </main>
  );
}
