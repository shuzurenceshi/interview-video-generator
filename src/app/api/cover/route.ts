import { NextRequest, NextResponse } from 'next/server';

const MINIMAX_API_KEY = 'sk-cp-47ggy2oM53bhg0vJgUgr7Rvs7OMam9puM9MhElv8Ojw6eZXSW2O4FCwop12BNjHBU21XFRbpq76wv4MRz58J6Lq_Pmr46znCwDDNDk_WOU_myGZhQCuIcFc';
const MINIMAX_API_URL = 'https://api.minimaxi.com/v1/image_generation';

function buildFunnyPrompt(topic: string, hostName: string, guestName: string): string {
  // Extract keywords from topic for customization
  const keywords = topic.replace(/[？?。，！!,.、]/g, ' ').trim().split(/\s+/).slice(0, 5).join(' ');
  
  return `A hilarious cartoon interview show cover illustration, ${keywords}. Two funny cartoon characters having a lively conversation - one male host sitting on the left with a silly surprised expression and a tiny hat, one female guest on the right facepalming or laughing with hand gestures. Comic book style with bold outlines, bright vibrant colors, confetti and stars around them, exaggerated expressions, comedy show atmosphere, funny memes style, 16:9 horizontal format, high quality cartoon illustration`;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, hostName, guestName } = await req.json();

    const prompt = buildFunnyPrompt(
      topic || '有趣的话题',
      hostName || '主持人',
      guestName || '嘉宾'
    );

    // Call MiniMax image generation API
    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'image-01',
        prompt,
        aspect_ratio: '16:9',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax image API error:', response.status, errorText);
      return NextResponse.json({ error: 'Cover generation failed' }, { status: 500 });
    }

    const data = await response.json();

    if (data.base_resp?.status_code !== 0) {
      console.error('MiniMax image error:', data.base_resp?.status_msg);
      return NextResponse.json({ error: 'Cover generation failed: ' + data.base_resp?.status_msg }, { status: 500 });
    }

    const imageUrl = data.data?.image_urls?.[0];
    if (!imageUrl) {
      console.error('No image URL in response:', JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ error: 'Cover generation failed - no image URL' }, { status: 500 });
    }

    // Download the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to download generated image' }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');

    return NextResponse.json({
      cover: `data:image/jpeg;base64,${base64}`,
      imageUrl,
    });
  } catch (error) {
    console.error('Cover generation error:', error);
    return NextResponse.json({ error: 'Cover generation failed' }, { status: 500 });
  }
}
