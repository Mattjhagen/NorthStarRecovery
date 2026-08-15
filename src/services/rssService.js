import { RSS_FEED_SOURCES, CACHED_HEALTH_ARTICLES } from '../constants/rssFeeds';

function cleanHtml(html = '') {
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseXmlItems(xmlText, sourceName, category) {
  const items = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (let i = 0; i < Math.min(itemMatches.length, 10); i++) {
    const itemStr = itemMatches[i];
    const titleMatch = itemStr.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || itemStr.match(/<title>(.*?)<\/title>/i);
    const linkMatch = itemStr.match(/<link>(.*?)<\/link>/i);
    const descMatch = itemStr.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) || itemStr.match(/<description>(.*?)<\/description>/i);
    const pubDateMatch = itemStr.match(/<pubDate>(.*?)<\/pubDate>/i);

    const title = titleMatch ? cleanHtml(titleMatch[1]) : 'Recovery Article';
    const link = linkMatch ? linkMatch[1].trim() : 'https://sobernation.com';
    const rawDesc = descMatch ? cleanHtml(descMatch[1]) : '';
    const pubDate = pubDateMatch ? pubDateMatch[1].split(' ').slice(0, 4).join(' ') : 'Recent';

    if (title) {
      items.push({
        id: `rss-${sourceName}-${i}-${Date.now()}`,
        source: sourceName,
        title,
        category,
        publishedDate: pubDate,
        readTime: '3 min read',
        summary: rawDesc.slice(0, 160) + (rawDesc.length > 160 ? '…' : ''),
        body: rawDesc || 'Read the complete article on the publisher website.',
        url: link,
      });
    }
  }
  return items;
}

export const rssService = {
  async fetchLiveFeed(source) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(source.url, {
        headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        const parsed = parseXmlItems(text, source.name, source.category);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async getAllFeeds() {
    try {
      const promises = RSS_FEED_SOURCES.map(s => this.fetchLiveFeed(s));
      const results = await Promise.allSettled(promises);
      const liveItems = [];

      for (const res of results) {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          liveItems.push(...res.value);
        }
      }

      if (liveItems.length >= 3) {
        return [...liveItems, ...CACHED_HEALTH_ARTICLES];
      }
    } catch {
      // Return cached library
    }
    return CACHED_HEALTH_ARTICLES;
  },
};
