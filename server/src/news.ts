import { XMLParser } from 'fast-xml-parser';
import type { Category, NewsItem } from './types.js';

const fallback: NewsItem[] = [
  ['General AI', 'Development sample: connect RSS feeds to load live AI updates'],
  ['AI Research', 'Development sample: source-backed AI research summaries'],
  ['AI Companies', 'Development sample: company announcements appear here'],
  ['AI Technology', 'Development sample: emerging AI technology briefing'],
  ['AI Startups', 'Development sample: AI startup funding and launches'],
  ['AI Products', 'Development sample: new AI product releases'],
  ['Global AI News', 'Development sample: global AI developments'],
  ['AI Business', 'Development sample: AI business and market news'],
  ['AI Regulations', 'Development sample: AI regulation and policy news'],
  ['AI Science', 'Development sample: AI science and discovery news'],
].map(([category, title], index) => ({
  id: `dev-${index}`, title, summary: 'This clearly labelled sample appears only when no live RSS source can be reached. Configure trusted feeds in server/.env before production. Live cards always retain their publisher link.', category: category as Category, sourceName: 'AI World Daily development data', sourceUrl: 'https://example.com', publishedAt: new Date(Date.now() - index * 3600000).toISOString(), importanceScore: 1, isMock: true,
}));

const words = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3);
export function categoryFor(text: string): Category {
  const t = text.toLowerCase();
  if (/regulat|policy|law|government|eu |copyright/.test(t)) return 'AI Regulations';
  if (/research|paper|benchmark|science|study/.test(t)) return 'AI Research';
  if (/startup|funding|venture/.test(t)) return 'AI Startups';
  if (/product|launch|release|chatgpt|gemini|copilot/.test(t)) return 'AI Products';
  if (/revenue|business|earnings|market/.test(t)) return 'AI Business';
  if (/openai|google|microsoft|anthropic|meta|nvidia|apple|amazon|tesla|xai/.test(t)) return 'AI Companies';
  return 'AI Technology';
}
export function deduplicate(items: NewsItem[]): NewsItem[] {
  const result: NewsItem[] = [];
  for (const item of items.sort((a, b) => b.importanceScore - a.importanceScore)) {
    const candidate = new Set(words(item.title));
    const match = result.find(existing => { const e = new Set(words(existing.title)); const overlap = [...candidate].filter(w => e.has(w)).length; return overlap / Math.max(candidate.size, e.size, 1) >= .55; });
    if (match) match.coveredBy = (match.coveredBy || 1) + 1; else result.push(item);
  }
  return result;
}
export async function collectNews(): Promise<NewsItem[]> {
  const feeds = (process.env.RSS_FEEDS || '').split(',').map(x => x.trim()).filter(Boolean);
  const parser = new XMLParser({ ignoreAttributes: false }); const collected: NewsItem[] = [];
  await Promise.all(feeds.map(async feed => {
    try {
      const response = await fetch(feed, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'AI-World-Daily/1.0' } });
      if (!response.ok) return;
      const xml = parser.parse(await response.text()); const channel = xml?.rss?.channel || xml?.feed;
      const entries = channel?.item || channel?.entry || [];
      for (const raw of (Array.isArray(entries) ? entries : [entries]).slice(0, 30)) {
        const title = String(raw.title?.['#text'] || raw.title || '').trim(); const url = String(raw.link?.['@_href'] || raw.link || '').trim();
        if (!title || !url) continue;
        const published = raw.pubDate || raw.published || raw.updated || new Date().toISOString(); const description = String(raw.description || raw.summary || '').replace(/<[^>]+>/g, '').trim();
        collected.push({ id: Buffer.from(url).toString('base64url'), title, summary: summarise(description, title), category: categoryFor(`${title} ${description}`), sourceName: new URL(url).hostname.replace('www.', ''), sourceUrl: url, publishedAt: new Date(published).toISOString(), importanceScore: score(title, description) });
      }
    } catch { /* Individual unreliable feeds must not fail the dashboard. */ }
  }));
  return collected.length ? deduplicate(collected).sort((a,b) => b.importanceScore - a.importanceScore || +new Date(b.publishedAt) - +new Date(a.publishedAt)) : fallback;
}
function score(title: string, description: string) { const t = `${title} ${description}`.toLowerCase(); return 10 + ['announces','launches','releases','model','regulation','research','funding'].filter(x => t.includes(x)).length * 5; }
function summarise(description: string, title: string) { const text = description || title; return text.length > 360 ? `${text.slice(0, 357)}...` : text; }
