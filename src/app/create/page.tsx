'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { InputMode, InterviewConfig, DialogueTurn, HistoryItem } from '@/lib/types';

const STEPS = ['输入内容', '访谈设置', '编辑访谈稿', '生成音频', '生成视频'];

const STEP_ICONS = [
  <svg key="0" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  <svg key="1" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.125 1.125 0 01-1.125-1.125M15.75 12a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25m2.625-5.25a3 3 0 01-3-3m0 5.25a3 3 0 003 3m-3 0a3 3 0 01-3-3" /></svg>,
  <svg key="2" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>,
  <svg key="3" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  <svg key="4" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m14.25 0h1.5" /></svg>,
];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>('direct');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  const [config, setConfig] = useState<InterviewConfig>({
    topic: '',
    hostName: '主持人',
    guestName: '嘉宾',
    tone: 'casual',
  });

  const [script, setScript] = useState<DialogueTurn[]>([]);
  const [rawScript, setRawScript] = useState('');
  const [editingScript, setEditingScript] = useState('');
  const [generatingScript, setGeneratingScript] = useState(false);
  const [scriptError, setScriptError] = useState('');

  const [audioUrl, setAudioUrl] = useState('');
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');

  const [coverUrl, setCoverUrl] = useState('');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  const [progress, setProgress] = useState(0);

  // Step 1: Scrape URL
  async function handleScrape() {
    if (!url) return;
    setScraping(true);
    setScrapeError('');
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContent(data.content);
    } catch (e: any) {
      setScrapeError(e.message || '采集失败');
    } finally {
      setScraping(false);
    }
  }

  // Step 2: Generate script
  async function handleGenerateScript() {
    if (!content.trim() || !config.topic.trim()) return;
    setGeneratingScript(true);
    setScriptError('');
    setProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 80));
      }, 300);

      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, config }),
      });
      const data = await res.json();
      clearInterval(progressInterval);
      setProgress(100);

      if (data.error) throw new Error(data.error);
      setScript(data.script);
      setRawScript(data.raw);
      setEditingScript(data.raw);
    } catch (e: any) {
      setScriptError(e.message || '生成失败');
    } finally {
      setGeneratingScript(false);
    }
  }

  // Step 3: Generate audio
  async function handleGenerateAudio() {
    if (script.length === 0) return;
    setGeneratingAudio(true);
    setAudioError('');
    setProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 5, 90));
      }, 500);

      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      clearInterval(progressInterval);
      setProgress(100);

      if (data.error) throw new Error(data.error);
      setAudioUrl(data.audio);
    } catch (e: any) {
      setAudioError(e.message || '音频生成失败');
    } finally {
      setGeneratingAudio(false);
    }
  }

  // Step 4: Generate cover and video
  async function handleGenerateVideo() {
    if (!audioUrl) return;
    setGeneratingVideo(true);
    setVideoError('');
    setProgress(0);
    try {
      setProgress(20);
      const coverRes = await fetch('/api/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const coverData = await coverRes.json();
      if (coverData.error) throw new Error(coverData.error);
      setCoverUrl(coverData.cover);
      setProgress(50);

      const videoRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audioUrl,
          coverBase64: coverData.cover,
        }),
      });
      const videoData = await videoRes.json();
      setProgress(100);

      if (videoData.error) throw new Error(videoData.error);
      setVideoUrl(videoData.video);

      const history: HistoryItem[] = JSON.parse(localStorage.getItem('interview_history') || '[]');
      const newItem: HistoryItem = {
        id: Date.now().toString(36),
        topic: config.topic,
        script,
        audioUrl,
        videoUrl: videoData.video,
        coverUrl: coverData.cover,
        createdAt: new Date().toISOString(),
      };
      history.unshift(newItem);
      localStorage.setItem('interview_history', JSON.stringify(history.slice(0, 50)));

    } catch (e: any) {
      setVideoError(e.message || '视频生成失败');
    } finally {
      setGeneratingVideo(false);
    }
  }

  function handleEditScript() {
    const turns: DialogueTurn[] = [];
    const lines = editingScript.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const match = line.match(/^(HOST|主持人)[:：]\s*(.+)/);
      if (match) {
        turns.push({ role: 'host', speaker: config.hostName, text: match[2].trim() });
      } else {
        const guestMatch = line.match(/^(GUEST|嘉宾|客人)[:：]\s*(.+)/);
        if (guestMatch) {
          turns.push({ role: 'guest', speaker: config.guestName, text: guestMatch[2].trim() });
        }
      }
    }
    if (turns.length > 0) {
      setScript(turns);
    }
  }

  function ProgressBar({ label }: { label: string }) {
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-400 mb-2.5 font-medium">
          <span>{label}</span>
          <span className="text-pink-400">{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-800/60 rounded-full overflow-hidden backdrop-blur">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)',
              boxShadow: '0 0 12px oklch(70% 0.22 340 / 0.5)',
            }}
          />
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-gray-900/70 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200";
  const btnPrimary = "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-200 flex items-center gap-2";
  const btnGhost = "text-gray-400 hover:text-white hover:bg-white/5 px-5 py-3 rounded-xl transition-all duration-200";

  return (
    <div className="min-h-screen text-white relative">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-pink-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <span className="font-bold text-base tracking-wide">创建访谈视频</span>
          </div>
          <div className="text-sm text-gray-500 font-medium">步骤 {step + 1} / {STEPS.length}</div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-0 flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i < step
                      ? 'bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : i === step
                      ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 scale-110'
                      : 'bg-gray-800/60 text-gray-500 backdrop-blur glass-card'
                  }`}>
                    {i < step ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    ) : (
                      <span className={i === step ? 'animate-pulse' : ''}>{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block transition-colors duration-200 ${
                    i === step ? 'text-white' : i < step ? 'text-purple-400' : 'text-gray-500'
                  }`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                    i < step
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-500/30'
                      : 'bg-gray-800/60'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">

        {/* ===== STEP 0: Input Content ===== */}
        {step === 0 && (
          <div>
            <div className="mb-2">
              <h2 className="text-2xl font-bold tracking-tight">输入访谈内容</h2>
              <p className="text-gray-500 mt-1.5">选择一种方式提供你想转化为访谈视频的内容</p>
            </div>

            {/* Mode selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                {
                  id: 'direct', label: '直接输入', icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                  ),
                  desc: '手动粘贴或输入文案', color: 'pink',
                },
                {
                  id: 'scrape', label: '链接采集', icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                  ),
                  desc: '输入文章URL自动抓取', color: 'purple',
                },
                {
                  id: 'reference', label: '参考素材', icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  ),
                  desc: '粘贴参考文章或视频描述', color: 'violet',
                },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setInputMode(mode.id as InputMode)}
                  className={`group relative p-5 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 overflow-hidden ${
                    inputMode === mode.id
                      ? mode.color === 'pink'
                        ? 'border-pink-500/60 bg-pink-500/10 shadow-lg shadow-pink-500/10'
                        : mode.color === 'purple'
                        ? 'border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                        : 'border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                      : 'border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/8'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    inputMode === mode.id
                      ? mode.color === 'pink' ? 'bg-pink-500/20 text-pink-400'
                        : mode.color === 'purple' ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-violet-500/20 text-violet-400'
                      : 'bg-white/8 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                  }`}>
                    {mode.icon}
                  </div>
                  <div className="font-semibold mb-1">{mode.label}</div>
                  <div className="text-sm text-gray-500">{mode.desc}</div>
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={
                  inputMode === 'direct'
                    ? '在这里粘贴或输入你想转化为访谈内容的文字...'
                    : inputMode === 'scrape'
                    ? '采集到的内容会显示在这里...'
                    : '粘贴参考文章内容、视频描述、或者任何你想作为访谈素材的内容...'
                }
                className="w-full h-64 bg-gray-900/60 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/15 transition-all duration-200 backdrop-blur"
              />
              {content && (
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {content.length} 字符
                </div>
              )}
            </div>

            {/* Scrape URL input */}
            {inputMode === 'scrape' && (
              <div className="mt-4">
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="输入文章URL，例如 https://..."
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    onClick={handleScrape}
                    disabled={scraping || !url}
                    className={btnPrimary + ' !px-6 !py-3 !text-sm'}
                  >
                    {scraping ? (
                      <><span className="animate-spin">◌</span> 采集中...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> 采集</>
                    )}
                  </button>
                </div>
                {scrapeError && <p className="text-red-400 text-sm mt-3 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> {scrapeError}</p>}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(1)}
                disabled={!content.trim()}
                className={btnPrimary}
              >
                下一步：访谈设置
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 1: Interview Config ===== */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">访谈设置</h2>
              <p className="text-gray-500 mt-1.5">配置访谈的基本信息和风格</p>
            </div>

            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">访谈主题</label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={e => setConfig({ ...config, topic: e.target.value })}
                  placeholder="例如：AI时代的职业选择"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">主持人姓名</label>
                  <input
                    type="text"
                    value={config.hostName}
                    onChange={e => setConfig({ ...config, hostName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">嘉宾姓名</label>
                  <input
                    type="text"
                    value={config.guestName}
                    onChange={e => setConfig({ ...config, guestName: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">对话风格</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      id: 'casual', label: '轻松随意', desc: '自然对话，节奏轻松',
                      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>,
                    },
                    {
                      id: 'formal', label: '正式严谨', desc: '措辞规范，适合专业话题',
                      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.