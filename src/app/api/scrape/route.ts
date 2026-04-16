import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer, header elements
    $('script, style, nav, footer, header, aside, .ads, .advertisement, .sidebar, .menu, .navigation').remove();

    // Try to find main content
    let content = '';

    // Try common article selectors
    const articleSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.content',
      '#content',
    ];

    for (const selector of articleSelectors) {
      const el = $(selector);
      if (el.length) {
        content = el.text().trim();
        if (content.length > 200) break;
      }
    }

    // Fallback: get body text
    if (!content || content.length < 200) {
      content = $('body').text().trim();
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();

    // Limit content length
    content = content.slice(0, 10000);

    return NextResponse.json({ content, url });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
  }
}
