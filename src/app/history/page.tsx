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
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition mr-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-bold text-lg">历史记录</span>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button onClick={clearAll} className="text-sm text-gray-500 hover:text-red-400 transition">
                清空全部
              </button>
            )}
            <button
              onClick={() => router.push('/create')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              新建
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {history.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold mb-2">暂无历史记录</h2>
            <p className="text-gray-400 mb-8">创建你的第一个访谈视频吧</p>
            <button
              onClick={() => router.push('/create')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-bold transition"
            >
              开始创建
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map(item => (
              <div key={item.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition">
                {/* Cover */}
                <div className="aspect-video bg-gray-800 relative">
                  {item.coverUrl && (
                    <img src={item.coverUrl} alt={item.topic} className="w-full h-full object-cover" />
                  )}
                  {item.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition">
                      <div className="text-5xl">▶️</div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold mb-1 truncate">{item.topic}</h3>
                  <p className="text-sm text-gray-500 mb-3">{formatDate(item.createdAt)}</p>
                  <p className="text-sm text-gray-400 mb-3">{item.script.length} 轮对话</p>

                  <div className="flex gap-2">
                    {item.videoUrl && (
                      <a
                        href={item.videoUrl}
                        download={`访谈_${item.topic}_${item.id}.mp4`}
                        className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition flex-1 text-center"
                      >
                        ⬇️ 下载
                      </a>
                    )}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 text-sm px-3 py-2 rounded-lg transition"
                    >
                      🗑️
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
