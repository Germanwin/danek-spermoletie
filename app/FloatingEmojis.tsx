'use client';

import { useEffect } from 'react';

const EMOJIS = ['💩', '🍆', '🎉', '🎂', '🍑', '💦', '🎈', '🔥', '💫', '🌈', '👅', '🥳'];

export default function FloatingEmojis() {
  useEffect(() => {
    const container = document.body;
    const spawned: HTMLElement[] = [];

    function spawn() {
      const el = document.createElement('div');
      el.className = 'floating-emoji';
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.bottom = '-60px';
      el.style.fontSize = (1.5 + Math.random() * 2.5) + 'rem';
      const dur = 6 + Math.random() * 10;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = '0s';
      container.appendChild(el);
      spawned.push(el);
      setTimeout(() => {
        el.remove();
        spawned.splice(spawned.indexOf(el), 1);
      }, dur * 1000);
    }

    const interval = setInterval(spawn, 600);
    return () => {
      clearInterval(interval);
      spawned.forEach(el => el.remove());
    };
  }, []);

  return null;
}
