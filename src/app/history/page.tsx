'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { HistoryItem } from '@/lib/types';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem('interview_history') || '[]'));
  }, []);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function deleteItem(id: string) {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('interview_history', JSON.stringify(updated));
  }

  function clearAll() {
    setHistory([]);
    localStorage.removeItem('interview_history');
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-pink-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <span className="font-bold text-base tracking-wide">历史记录</span>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/5"
              >
                清空全部
              </button>
            )}
            <button
              onClick={() => router.push('/create')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-semibold shadow-lg shadow-pink-500/20 transition-all duration-200 hover:shadow-pink-500/40 hover:scale-105"
            >
              新建
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Empty state */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            {/* Empty state illustration */}
            <div className="relative mb-10">
              <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 glass-card flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75zM15.75 9a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V9zm-3 0a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V9z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                <span className="text-pink-400 text-lg">✦</span>
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-purple-500/20" />
            </div>

            <h2 className="text-2xl font-bold mb-3 tracking-tight">暂无历史记录</h2>
            <p className="text-gray-500 mb-10 max-w-sm leading-relaxed">
              还没有创建过访谈视频，<br />快去制作你的第一个作品吧
            </p>
            <button
              onClick={() => router.push('/create')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              开始创建
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, idx) => (
              <div
                key={item.id}
                className="group glass-card rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
              >
                {/* Cover */}
                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt={item.topic}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m14.25 0h1.5" /></svg>
                    </div>
                  )
                  }
                  {/* Play overlay */}
                  {item.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 scale-75 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  )}
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent" />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold mb-1.5 truncate text-white/90 leading-tight">{item.topic}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                    <span className="text-gray-700">·</span>
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <p className="text-xs text-gray-500">{item.script.length} 轮对话</p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {item.videoUrl && (
                      <a
                        href={item.videoUrl}
                        download={`访谈_${item.topic}_${item.id}.mp4`}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 text-center shadow-md hover:shadow-pink-500/20 flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3 3m-3-3H6.75" /></svg>
                        下载
                      </a>
                    )}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-500/20 text-sm px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
