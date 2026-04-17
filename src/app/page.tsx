'use client';

import { useRouter } from 'next/navigation';

const STEPS = [
  {
    num: '01',
    title: '输入内容',
    desc: '链接采集 / 直接输入 / 参考素材',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
    iconColor: 'text-pink-400',
    glow: 'hover:shadow-pink-500/20',
  },
  {
    num: '02',
    title: '生成访谈稿',
    desc: 'AI 将内容转化为双人对话格式',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    iconColor: 'text-purple-400',
    glow: 'hover:shadow-purple-500/20',
  },
  {
    num: '03',
    title: '合成语音',
    desc: 'Edge-TTS 双人主播音频',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20',
    iconColor: 'text-violet-400',
    glow: 'hover:shadow-violet-500/20',
  },
  {
    num: '04',
    title: '生成视频',
    desc: '封面 + 音频 = 完整访谈视频',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m14.25 0h1.5" />
      </svg>
    ),
    color: 'from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/20',
    iconColor: 'text-fuchsia-400',
    glow: 'hover:shadow-fuchsia-500/20',
  },
];

const DECORATIONS = [
  { size: 180, top: '8%', left: '5%', delay: '0s', duration: '22s' },
  { size: 140, top: '60%', right: '8%', delay: '3s', duration: '26s' },
  { size: 100, bottom: '15%', left: '12%', delay: '6s', duration: '19s' },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Geometric decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {DECORATIONS.map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 blur-3xl"
            style={{
              width: d.size,
              height: d.size,
              top: d.top,
              left: d.left,
              right: d.right,
              bottom: d.bottom,
              background: i % 2 === 0
                ? 'radial-gradient(circle, oklch(70% 0.25 340) 0%, transparent 70%)'
                : 'radial-gradient(circle, oklch(65% 0.22 300) 0%, transparent 70%)',
              animation: `blob-drift-${(i % 3) + 1} ${d.duration} ease-in-out ${d.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-pink-500/30 to-purple-500/30 blur-md -z-10" />
            </div>
            <span className="font-bold text-lg tracking-wide">访谈视频生成器</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <button
              onClick={() => router.push('/history')}
              className="text-gray-400 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              历史记录
            </button>
            <button
              onClick={() => router.push('/create')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-semibold shadow-lg shadow-pink-500/20 transition-all duration-200 hover:shadow-pink-500/40 hover:scale-105"
            >
              开始创建
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center relative z-10">
        {/* Badge */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <span className="text-purple-300/90 font-medium">AI 驱动 · 全自动 · 几分钟完成</span>
          </div>
        </div>

        {/* Hero icon */}
        <div className="relative mb-10 animate-float">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-xl -z-10" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-400 animate-ping opacity-60" />
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          <span className="text-gradient-white">一键生成</span>
          <br />
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            专业访谈视频
          </span>
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mb-16 leading-relaxed">
          输入文章链接、手动粘贴内容或提供参考素材，AI 自动生成访谈稿，
          <br className="hidden md:block" />
          转化为双人对话音频，最后合成带封面的完整视频。
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-20">
          {STEPS.map((item, i) => (
            <div
              key={item.num}
              className={`group relative glass-card rounded-2xl p-5 text-left transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${item.glow} overflow-hidden`}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
              {/* Top glow line */}
              <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-${item.iconColor.split('-')[0]}-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 ${item.iconColor}`}>
                {item.icon}
              </div>
              <div className="text-2xl font-black text-white/10 absolute top-4 right-5 select-none">
                {item.num}
              </div>
              <div className="font-bold mb-1 text-white/90">{item.title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative">
          <button
            onClick={() => router.push('/create')}
            className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-fuchsia-500 hover:from-pink-600 hover:via-purple-600 hover:to-fuchsia-600 text-white text-lg px-12 py-4 rounded-2xl font-extrabold shadow-2xl shadow-purple-500/30 transition-all duration-200 hover:scale-105 hover:shadow-purple-500/50"
          >
            立即开始创建
          </button>
          {/* Glow ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500/0 via-purple-500/40 to-fuchsia-500/0 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-gray-600 text-sm">
        <span>访谈视频生成器 · 仅供个人学习使用</span>
      </footer>
    </div>
  );
}
