import Link from 'next/link';

export default function VideoPage() {
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

          <video
            className="video-el"
            src="/video.mp4"
            controls
            preload="auto"
          />

          <div className="video-deco-bar">🍆 🍆 🍆 🎉 С ДНЁМ РОЖДЕНИЯ 🎉 🍆 🍆 🍆</div>
        </div>

        <Link href="/wishes" className="go-wishes-btn">
          💌 ПОЧИТАТЬ ПОЖЕЛАШКИ 💌
        </Link>
      </div>
    </main>
  );
}
