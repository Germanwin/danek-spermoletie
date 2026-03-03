import type { Metadata } from 'next';
import './globals.css';
import NavBar from './NavBar';
import FloatingEmojis from './FloatingEmojis';

export const metadata: Metadata = {
  title: '💩 ДЕНЬ СПЕРМОЛЕТИЯ ДАНЕЧКИ 💩',
  description: 'С днём рождения, Даниил Спермоед!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <NavBar />
        <FloatingEmojis />
        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
