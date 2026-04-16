import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

async function generateCoverSvg(topic: string, hostName: string, guestName: string): Promise<Buffer> {
  const svg = `
  <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0f3460;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#e94560;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#533483;stop-opacity:1" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="1280" height="720" fill="url(#bg)" />

    <!-- Decorative circles -->
    <circle cx="100" cy="100" r="300" fill="#e94560" opacity="0.05" />
    <circle cx="1180" cy="620" r="250" fill="#533483" opacity="0.08" />
    <circle cx="640" cy="360" r="400" fill="#0f3460" opacity="0.3" />

    <!-- Top accent bar -->
    <rect x="0" y="0" width="1280" height="8" fill="url(#accent)" />

    <!-- Left decorative line -->
    <rect x="60" y="120" width="6" height="480" rx="3" fill="url(#accent)" opacity="0.6" />

    <!-- Microphone icon (simple SVG) -->
    <g transform="translate(580, 200)" opacity="0.15">
      <rect x="-15" y="0" width="30" height="60" rx="15" fill="white"/>
      <path d="M-30 30 Q-30 80 0 80 Q30 80 30 30" stroke="white" stroke-width="4" fill="none"/>
      <line x1="0" y1="80" x2="0" y2="110" stroke="white" stroke-width="4"/>
      <line x1="-20" y1="110" x2="20" y2="110" stroke="white" stroke-width="4"/>
    </g>

    <!-- Main title -->
    <text x="640" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">
      ${escapeXml(topic.length > 25 ? topic.slice(0, 25) + '...' : topic)}
    </text>

    <!-- Subtitle / topic label -->
    <text x="640" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#e94560" text-anchor="middle" dominant-baseline="middle" font-weight="500">
      访谈节目
    </text>

    <!-- Separator -->
    <line x1="440" y1="440" x2="840" y2="440" stroke="url(#accent)" stroke-width="2" opacity="0.6" />

    <!-- Speakers -->
    <text x="640" y="490" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#a0a0a0" text-anchor="middle" dominant-baseline="middle">
      ${escapeXml(hostName)} · ${escapeXml(guestName)}
    </text>

    <!-- Bottom decorative bar -->
    <rect x="0" y="700" width="1280" height="20" fill="url(#accent)" opacity="0.3" />

    <!-- Bottom text -->
    <text x="640" y="680" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#666" text-anchor="middle" dominant-baseline="middle">
      AI 访谈视频生成器
    </text>
  </svg>
  `;

  return Buffer.from(svg);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function POST(req: NextRequest) {
  try {
    const { topic, hostName, guestName } = await req.json();

    const svg = await generateCoverSvg(
      topic || '访谈节目',
      hostName || '主持人',
      guestName || '嘉宾'
    );

    const png = await sharp(svg)
      .png()
      .toBuffer();

    const base64 = png.toString('base64');
    return NextResponse.json({ cover: `data:image/png;base64,${base64}` });
  } catch (error) {
    console.error('Cover generation error:', error);
    return NextResponse.json({ error: 'Cover generation failed' }, { status: 500 });
  }
}
