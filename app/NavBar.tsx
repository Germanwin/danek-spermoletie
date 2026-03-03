'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="nav-bar">
      <Link href="/" className={`nav-link${pathname === '/' ? ' active' : ''}`}>
        🎬 ВИДОС
      </Link>
      <Link href="/wishes" className={`nav-link${pathname === '/wishes' ? ' active' : ''}`}>
        💌 ПОЖЕЛАШКИ
      </Link>
    </nav>
  );
}
