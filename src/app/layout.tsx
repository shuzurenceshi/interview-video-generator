import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '访谈视频生成器',
  description: 'AI 驱动的访谈视频自动生成工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="antialiased bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
