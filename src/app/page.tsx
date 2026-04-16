'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="font-bold text-lg">访谈视频生成器</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-400">
            <button onClick={() => router.push('/history')} className="hover:text-white transition">历史记录</button>
            <button onClick={() => router.push('/create')} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition">
              开始创建
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-purple-400 text-sm mb-6">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            AI 驱动 · 全自动 · 几分钟完成
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
          一键生成专业访谈视频
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mb-12">
          输入文章链接、手动粘贴内容或提供参考素材，AI 自动生成访谈稿，<br />
          转化为双人对话音频，最后合成带封面的完整视频。
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-3xl mb-16">
          {[
            { step: '01', title: '输入内容', desc: '链接采集 / 直接输入 / 参考素材' },
            { step: '02', title: '生成访谈稿', desc: 'AI 将内容转化为双人对话格式' },
            { step: '03', title: '合成语音', desc: 'Edge-TTS 双人主播音频' },
            { step: '04', title: '生成视频', desc: '封面 + 音频 = 完整访谈视频' },
          ].map((item) => (
            <div key={item.step} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 text-left hover:border-gray-700 transition">
              <div className="text-3xl font-bold text-purple-400 mb-2">{item.step}</div>
              <div className="font-semibold mb-1">{item.step === '01' ? '输入内容' : item.step === '02' ? '生成访谈稿' : item.step === '03' ? '合成语音' : '生成视频'}</div>
              <div className="text-sm text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/create')}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-10 py-4 rounded-2xl font-bold shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
        >
          立即开始创建
        </button>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-gray-600 text-sm">
        访谈视频生成器 · 仅供个人学习使用
      </footer>
    </div>
  );
}
