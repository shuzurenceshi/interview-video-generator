'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { InputMode, InterviewConfig, DialogueTurn, HistoryItem } from '@/lib/types';

const STEPS = ['输入内容', '访谈设置', '编辑访谈稿', '生成音频', '生成视频'];

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
      // Simulate progress
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
      // First generate cover
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

      // Then generate video
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

      // Save to history
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
    // Re-parse the edited script
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
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition mr-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-bold text-lg">创建访谈视频</span>
          </div>
          <div className="text-sm text-gray-500">步骤 {step + 1} / {STEPS.length}</div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  i < step ? 'bg-purple-600 text-white' :
                  i === step ? 'bg-pink-500 text-white' :
                  'bg-gray-800 text-gray-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-sm hidden sm:block ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${i < step ? 'bg-purple-600' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* ===== STEP 0: Input Content ===== */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">输入访谈内容</h2>
            <p className="text-gray-400 mb-8">选择一种方式提供你想转化为访谈视频的内容</p>

            {/* Mode selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { id: 'direct', label: '直接输入', icon: '✏️', desc: '手动粘贴或输入文案' },
                { id: 'scrape', label: '链接采集', icon: '🔗', desc: '输入文章URL自动抓取' },
                { id: 'reference', label: '参考素材', icon: '📄', desc: '粘贴参考文章或视频描述' },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setInputMode(mode.id as InputMode)}
                  className={`p-5 rounded-2xl border-2 text-left transition ${
                    inputMode === mode.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{mode.icon}</div>
                  <div className="font-semibold mb-1">{mode.label}</div>
                  <div className="text-sm text-gray-500">{mode.desc}</div>
                </button>
              ))}
            </div>

            {/* Direct input */}
            {inputMode === 'direct' && (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="在这里粘贴或输入你想转化为访谈内容的文字..."
                className="w-full h-64 bg-gray-900 border border-gray-800 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-pink-500 transition"
              />
            )}

            {/* Scrape URL */}
            {inputMode === 'scrape' && (
              <div>
                <div className="flex gap-3 mb-4">
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="输入文章URL，例如 https://..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
                  />
                  <button
                    onClick={handleScrape}
                    disabled={scraping || !url}
                    className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-medium transition"
                  >
                    {scraping ? '采集中...' : '采集'}
                  </button>
                </div>
                {scrapeError && <p className="text-red-400 text-sm mb-4">{scrapeError}</p>}
                {content && (
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="采集到的内容会显示在这里..."
                    className="w-full h-64 bg-gray-900 border border-gray-800 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-pink-500 transition"
                  />
                )}
              </div>
            )}

            {/* Reference */}
            {inputMode === 'reference' && (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="粘贴参考文章内容、视频描述、或者任何你想作为访谈素材的内容..."
                className="w-full h-64 bg-gray-900 border border-gray-800 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-pink-500 transition"
              />
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(1)}
                disabled={!content.trim()}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-bold transition"
              >
                下一步：访谈设置 →
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 1: Interview Config ===== */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">访谈设置</h2>
            <p className="text-gray-400 mb-8">配置访谈的基本信息和风格</p>

            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">访谈主题</label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={e => setConfig({ ...config, topic: e.target.value })}
                  placeholder="例如：AI时代的职业选择"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">主持人姓名</label>
                  <input
                    type="text"
                    value={config.hostName}
                    onChange={e => setConfig({ ...config, hostName: e.target.value })}
                    placeholder="主持人"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">嘉宾姓名</label>
                  <input
                    type="text"
                    value={config.guestName}
                    onChange={e => setConfig({ ...config, guestName: e.target.value })}
                    placeholder="嘉宾"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">对话风格</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'casual', label: '轻松随意', desc: '自然对话，节奏轻松' },
                    { id: 'formal', label: '正式严谨', desc: '措辞规范，适合专业话题' },
                  ].map(tone => (
                    <button
                      key={tone.id}
                      onClick={() => setConfig({ ...config, tone: tone.id as 'casual' | 'formal' })}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        config.tone === tone.id
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                      }`}
                    >
                      <div className="font-semibold mb-1">{tone.label}</div>
                      <div className="text-sm text-gray-500">{tone.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(0)} className="text-gray-400 hover:text-white transition px-6 py-3">
                ← 上一步
              </button>
              <button
                onClick={async () => {
                  await handleGenerateScript();
                  if (!scriptError) setStep(2);
                }}
                disabled={!config.topic.trim() || generatingScript}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-bold transition flex items-center gap-2"
              >
                {generatingScript ? (
                  <>
                    <span className="animate-spin">⏳</span> AI 生成中...
                  </>
                ) : (
                  '生成访谈稿 →'
                )}
              </button>
            </div>

            {generatingScript && (
              <div className="mt-6 max-w-xl">
                <ProgressBar label="AI 正在分析内容并生成访谈稿..." />
              </div>
            )}

            {scriptError && (
              <p className="text-red-400 mt-4">{scriptError}</p>
            )}
          </div>
        )}

        {/* ===== STEP 2: Edit Script ===== */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">编辑访谈稿</h2>
            <p className="text-gray-400 mb-2">AI 已生成访谈稿，你可以直接在下方编辑</p>
            <p className="text-gray-500 text-sm mb-4">
              格式：<code className="bg-gray-800 px-1 rounded">HOST:</code> 主持人台词 / <code className="bg-gray-800 px-1 rounded">GUEST:</code> 嘉宾台词
            </p>

            <textarea
              value={editingScript}
              onChange={e => setEditingScript(e.target.value)}
              className="w-full h-80 bg-gray-900 border border-gray-800 rounded-xl p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-pink-500 transition"
            />

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white transition px-6 py-3">
                ← 上一步
              </button>
              <button
                onClick={() => {
                  handleEditScript();
                  setStep(3);
                }}
                className="bg-pink-500 hover:bg-pink-600 px-8 py-3 rounded-xl font-bold transition"
              >
                确认并生成音频 →
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Generate Audio ===== */}
        {step === 3 && !audioUrl && (
          <div>
            <h2 className="text-2xl font-bold mb-2">生成对话音频</h2>
            <p className="text-gray-400 mb-8">
              将访谈稿转化为双人对话音频，使用 Edge-TTS 合成
            </p>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 max-w-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl">🎙️</div>
                <div>
                  <div className="font-semibold">主持人：{config.hostName}</div>
                  <div className="text-sm text-gray-500">音色：zh-CN-YunxiNeural</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center text-xl">🎙️</div>
                <div>
                  <div className="font-semibold">嘉宾：{config.guestName}</div>
                  <div className="text-sm text-gray-500">音色：zh-CN-XiaoxiaoNeural</div>
                </div>
              </div>
            </div>

            <div className="mt-6 max-w-xl">
              <ProgressBar label={generatingAudio ? '正在合成音频...' : '准备就绪'} />
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white transition px-6 py-3">
                ← 上一步
              </button>
              <button
                onClick={async () => {
                  await handleGenerateAudio();
                }}
                disabled={generatingAudio}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-bold transition"
              >
                {generatingAudio ? '⏳ 生成中...' : '开始生成音频'}
              </button>
            </div>

            {audioError && <p className="text-red-400 mt-4">{audioError}</p>}
          </div>
        )}

        {/* ===== STEP 3b: Audio Preview ===== */}
        {step === 3 && audioUrl && (
          <div>
            <h2 className="text-2xl font-bold mb-2">音频已生成 ✓</h2>
            <p className="text-gray-400 mb-8">可以先试听一下效果，确认后继续生成视频</p>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 max-w-xl">
              <audio controls src={audioUrl} className="w-full" />
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white transition px-6 py-3">
                ← 重新编辑
              </button>
              <button
                onClick={() => setStep(4)}
                className="bg-pink-500 hover:bg-pink-600 px-8 py-3 rounded-xl font-bold transition"
              >
                生成视频 →
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Generate Video ===== */}
        {step === 4 && !videoUrl && (
          <div>
            <h2 className="text-2xl font-bold mb-2">生成访谈视频</h2>
            <p className="text-gray-400 mb-8">将封面图和音频合成为完整的 MP4 视频</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-xl">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                {coverUrl && <img src={coverUrl} alt="封面预览" className="w-full" />}
                <div className="p-3 text-sm text-gray-400">封面预览</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center">
                {audioUrl && <audio controls src={audioUrl} className="w-full" />}
                <div className="text-sm text-gray-400 mt-3">音频轨道</div>
              </div>
            </div>

            <div className="mt-6 max-w-xl">
              <ProgressBar label={generatingVideo ? '正在合成视频...' : '准备就绪'} />
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(3)} className="text-gray-400 hover:text-white transition px-6 py-3">
                ← 上一步
              </button>
              <button
                onClick={async () => {
                  await handleGenerateVideo();
                }}
                disabled={generatingVideo}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-bold transition"
              >
                {generatingVideo ? '⏳ 生成中...' : '生成视频'}
              </button>
            </div>

            {videoError && <p className="text-red-400 mt-4">{videoError}</p>}
          </div>
        )}

        {/* ===== STEP 5: Download ===== */}
        {step === 4 && videoUrl && (
          <div>
            <h2 className="text-2xl font-bold mb-6">视频已生成 ✓</h2>
            <p className="text-gray-400 mb-8">恭喜！访谈视频已生成完毕，可以下载了</p>

            <div className="max-w-2xl">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>

            <div className="flex gap-4 mt-8">
              <a
                href={videoUrl}
                download={`访谈_${config.topic}_${Date.now()}.mp4`}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition"
              >
                ⬇️ 下载视频
              </a>
              <button
                onClick={() => router.push('/history')}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-bold transition"
              >
                查看历史记录
              </button>
              <button
                onClick={() => {
                  setStep(0);
                  setContent('');
                  setScript([]);
                  setAudioUrl('');
                  setVideoUrl('');
                  setCoverUrl('');
                  setEditingScript('');
                }}
                className="text-gray-400 hover:text-white transition px-6 py-3"
              >
                再做一期
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
