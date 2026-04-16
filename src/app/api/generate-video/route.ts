import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { readFileSync } from 'fs';

const OUTPUT_DIR = '/tmp/interview-video';

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const { audioBase64, coverBase64, duration } = await req.json();

    if (!audioBase64 || !coverBase64) {
      return NextResponse.json({ error: 'audio and cover required' }, { status: 400 });
    }

    await ensureDir(OUTPUT_DIR);
    const sessionId = Date.now().toString(36);

    // Decode base64 and save files
    const audioData = audioBase64.replace(/^data:audio\/[^;]+;base64,/, '');
    const coverData = coverBase64.replace(/^data:image\/[^;]+;base64,/, '');

    const audioPath = path.join(OUTPUT_DIR, `${sessionId}_audio.mp3`);
    const coverPath = path.join(OUTPUT_DIR, `${sessionId}_cover.png`);
    const videoPath = path.join(OUTPUT_DIR, `${sessionId}_video.mp4`);

    await writeFile(audioPath, Buffer.from(audioData, 'base64'));
    await writeFile(coverPath, Buffer.from(coverData, 'base64'));

    // Estimate duration from audio if not provided
    const dur = duration || 60;

    // Generate video: static image + audio
    // Use loop_mode to loop the image for the full duration
    const videoDuration = Math.max(dur + 2, 5);

    await new Promise<void>((resolve, reject) => {
      const ffmpegArgs = [
        '-loop', '1',
        '-i', coverPath,
        '-i', audioPath,
        '-c:v', 'libx264',
        '-t', String(videoDuration),
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        '-y',
        videoPath,
      ];

      const proc = spawn('ffmpeg', ffmpegArgs);
      let stderr = '';
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg failed: ${stderr.slice(-500)}`));
      });
      proc.on('error', reject);
    });

    // Clean up temp files
    await unlink(audioPath).catch(() => {});
    await unlink(coverPath).catch(() => {});

    // Read video as base64
    const videoBuffer = readFileSync(videoPath);
    const videoBase64 = videoBuffer.toString('base64');

    await unlink(videoPath).catch(() => {});

    return NextResponse.json({
      video: `data:video/mp4;base64,${videoBase64}`,
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json({ error: 'Video generation failed' }, { status: 500 });
  }
}
