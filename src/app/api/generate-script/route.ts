import { NextRequest, NextResponse } from 'next/server';

const ZHIPU_API_KEY = '33721c7103894e9f9f247e0191d279b4.ipAygQQA5rrhurkW';
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { content, config } = await req.json();

    if (!content || !config) {
      return NextResponse.json({ error: 'content and config required' }, { status: 400 });
    }

    const tone_instruction = config.tone === 'formal'
      ? '保持专业、正式的风格，措辞严谨。'
      : '保持轻松、随意的风格，对话自然流畅。';

    const system_prompt = `你是一个专业的访谈节目文稿助手。用户会给你一段内容（可能是一篇文章、一个主题描述、或者一段文字），你需要把它转换成一个访谈对话稿。

要求：
1. 格式：HOST（主持人）和 GUEST（嘉宾）的交替对话
2. ${tone_instruction}
3. 对话要有深度，涵盖内容的核心要点
4. 主持人负责引导话题、提问、过渡
5. 嘉宾负责展开讨论、分享观点和见解
6. 每个对话轮次不要太长，一般2-5句话
7. 生成8-15轮对话比较合适
8. 只输出对话内容，不要有其他说明

输出格式：
HOST: [主持人的话]
GUEST: [嘉宾的话]
HOST: [主持人的话]
...`;

    const user_prompt = `主题：${config.topic}\n\n内容：\n${content}\n\n请根据以上内容，生成一个访谈对话稿。`;

    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          { role: 'system', content: system_prompt },
          { role: 'user', content: user_prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zhipu API error:', response.status, errorText);
      return NextResponse.json({ error: 'Script generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const raw_script = data.choices?.[0]?.message?.content || '';

    // Parse the script into structured dialogue
    const turns: { role: 'host' | 'guest'; speaker: string; text: string }[] = [];
    const lines = raw_script.split('\n').filter((l: string) => l.trim());

    for (const line of lines) {
      const match = line.match(/^(HOST|GUEST)[:：]\s*(.+)/);
      if (match) {
        const role = match[1].toLowerCase() === 'host' ? 'host' : 'guest';
        const speaker = role === 'host' ? config.hostName : config.guestName;
        turns.push({ role, speaker, text: match[2].trim() });
      }
    }

    // Fallback if parsing fails
    if (turns.length === 0) {
      // Try to parse with Chinese labels
      for (const line of lines) {
        const match = line.match(/^(主持人|嘉賓|嘉宾)[:：]\s*(.+)/);
        if (match) {
          turns.push({ role: 'host', speaker: config.hostName, text: match[2].trim() });
        } else {
          const guestMatch = line.match(/^(嘉宾|客人)[:：]\s*(.+)/);
          if (guestMatch) {
            turns.push({ role: 'guest', speaker: config.guestName, text: guestMatch[2].trim() });
          }
        }
      }
    }

    if (turns.length === 0) {
      return NextResponse.json({ error: 'Failed to parse script' }, { status: 500 });
    }

    return NextResponse.json({ script: turns, raw: raw_script });
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json({ error: 'Script generation failed' }, { status: 500 });
  }
}
