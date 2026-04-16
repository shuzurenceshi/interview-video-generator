import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = '/tmp/interview-audio';
const VOICES: Record<string, string> = {
  host: 'zh-CN-YunxiNeural',
  guest: 'zh-CN-XiaoxiaoNeural',
};

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function generateTTS(text: string, voice: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('edge-tts', [
      '--text', text,
      '--voice', voice,
      '--write-media', outputPath,
    ]);
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`edge-tts failed: ${stderr}`));
    });
    proc.on('error', reject);
  });
}

async function concatAudio(inputFiles: string[], outputPath: string): Promise<void> {
  const listFile = outputPath + '.list.txt';
  const lines = inputFiles.map(f => `file '${f}'`).join('\n');
  await writeFile(listFile, lines);

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-c', 'copy',
      outputPath,
    ]);
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      unlink(listFile).catch(() => {});
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg concat failed: ${stderr}`));
    });
    proc.on('error', reject);
  });
}

export async function POST(req: NextRequest) {
  try {
    const { script } = await req.json();
    if (!script || !Array.isArray(script) || script.length === 0) {
      return NextResponse.json({ error: 'script required' }, { status: 400 });
    }

    await ensureDir(OUTPUT_DIR);
    const sessionId = Date.now().toString(36);
    const audioFiles: string[] = [];

    for (let i = 0; i < script.length; i++) {
      const turn = script[i];
      const voice = VOICES[turn.role] || VOICES.guest;
      const audioPath = path.join(OUTPUT_DIR, `${sessionId}_${i}.mp3`);

      // Add small pause between turns
      const textWithPause = turn.text + '。';
      await generateTTS(textWithPause, voice, audioPath);
      audioFiles.push(audioPath);
    }

    const finalPath = path.join(OUTPUT_DIR, `${sessionId}_final.mp3`);
    await concatAudio(audioFiles, finalPath);

    // Clean up individual files
    for (const f of audioFiles) {
      await unlink(f).catch(() => {});
    }

    // Read and return as base64
    const fs = await import('fs');
    const buffer = fs.readFileSync(finalPath);
    const base64 = buffer.toString('base64');

    await unlink(finalPath).catch(() => {});

    return NextResponse.json({
      audio: `data:audio/mp3;base64,${base64}`,
      duration: script.length * 5, // rough estimate
    });
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json({ error: 'Audio generation failed' }, { status: 500 });
  }
}
