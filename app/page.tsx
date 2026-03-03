'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

export default function VideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localSrc, setLocalSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  function handleLocalFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalSrc(url);
    setHasError(false);
  }

  // When server video fails to load, show placeholder
  const serverSrc = '/birthday-video.mp4';
  const showVideo = localSrc || (!hasError);

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

          {localSrc ? (
            <video
              ref={videoRef}
              className="video-el"
              src={localSrc}
              controls
              autoPlay
            />
          ) : hasError ? (
            <div className="video-placeholder">
              <span className="placeholder-icon">🎬</span>
              <p className="placeholder-title">ТУТ БУДЕТ ВИДОС</p>
              <p className="placeholder-sub">
                Положи видео в <code>public/birthday-video.mp4</code><br />
                или загрузи прямо сейчас ↓
              </p>
              <label className="local-upload-btn">
                📁 ЗАГРУЗИТЬ ВИДОС
                <input type="file" accept="video/*" onChange={handleLocalFile} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="video-el"
              src={serverSrc}
              controls
              onError={() => setHasError(true)}
            />
          )}

          <div className="video-deco-bar">🍆 🍆 🍆 🎉 С ДНЁМ РОЖДЕНИЯ 🎉 🍆 🍆 🍆</div>
        </div>

        {hasError && !localSrc && (
          <></>
        )}

        {!hasError && !localSrc && (
          <label className="local-upload-btn" style={{ marginTop: 16 }}>
            📁 Загрузить другой видос
            <input type="file" accept="video/*" onChange={handleLocalFile} style={{ display: 'none' }} />
          </label>
        )}

        <Link href="/wishes" className="go-wishes-btn">
          💌 ПОЧИТАТЬ ПОЖЕЛАШКИ 💌
        </Link>
      </div>
    </main>
  );
}
