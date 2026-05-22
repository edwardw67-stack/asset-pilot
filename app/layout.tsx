import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Asset Pilot',
  description: 'Portfolio tracking and ATR trailing stop decision system.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
