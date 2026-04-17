import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '访谈视频生成器',
  description: 'AI 驱动的访谈视频自动生成工具',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body
        className="antialiased min-h-screen text-white"
        style={{ fontFamily: 'var(--font-noto-sans-sc), var(--font-inter), ui-sans-serif, system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
