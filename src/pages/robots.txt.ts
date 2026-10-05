import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';

// robots.txt 只负责 crawl policy（谁能抓取什么），不负责 indexability——
// 是否被收录由各页面自己的 meta robots / X-Robots-Tag 决定（见 src/config/seo.ts）。
// 因此这里不 Disallow 任何真实内容路径，也不用它代替 noindex。
export const GET: APIRoute = () => {
  const sitemapUrl = `${siteConfig.url}/sitemap-index.xml`;

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
