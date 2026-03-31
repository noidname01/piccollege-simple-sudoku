import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sudoku Game',
  description: 'A single-player Sudoku game built with Next.js and Material UI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>{children}</body>
    </html>
  );
}