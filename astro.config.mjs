// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INDEXABLE_TAGS } from './src/config/indexable-tags.mjs';


// sitemap 的 lastmod 取内容 frontmatter 里的 updatedAt（文章、术语），其余页面用整站最近一次整体更新日；不使用构建时间。
const SITE_REVISION = '2026-10-05';
const root = path.dirname(fileURLToPath(import.meta.url));
/** @type {Map<string, string>} */
const lastmodByPath = new Map();
const typeBase = { guide: '/guides/', client: '/clients/', knowledge: '/knowledge/', tutorial: '/tutorials/', troubleshooting: '/troubleshooting/', warning: '/warnings/' };
/** @param {string} dir @param {(id: string, type?: string) => string | null} toPath */
function collect(dir, toPath) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(name)) continue;
    const raw = fs.readFileSync(path.join(dir, name), 'utf8');
    const fm = (raw.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
    const date = (fm.match(/^updatedAt:\s*"?(\d{4}-\d{2}-\d{2})/m) || [])[1];
    const type = (fm.match(/^type:\s*"?(\w+)"?/m) || [])[1];
    const p = toPath(name.replace(/\.mdx?$/, ''), type);
    if (p && date) lastmodByPath.set(p, date);
  }
}
collect(path.join(root, 'src/content/articles'), (id, type) => (type && typeBase[type] ? `${typeBase[type]}${id}/` : null));
collect(path.join(root, 'src/content/glossary'), (id) => `/glossary/${id}/`);

// Sitemap inclusion policy（见 JichangNiu Crawl / Indexability Foundation v1.0）：
// - 排除 404 页面（不是可索引内容）
// - 排除任何带 query string 的 URL（canonical 不含 query，sitemap 也不应包含）
// - 排除任何路径片段命中 demo/mock 关键词的 URL（开发占位数据的防御性兜底，
//   正式发布门槛应在页面生成阶段就不产出这些路径，这里是第二道防线）
// - 排除分页类路径（/page/ 或 ?page=），除非该分页本身是独立有价值的 canonical 页面
// - 排除 /internal-stats（站内数据面板，robots noindex，不应出现在 sitemap 里）
/** @param {string} pageUrl @returns {boolean} */
function isSitemapExcluded(pageUrl) {
  const url = new URL(pageUrl);

  if (url.pathname === '/404' || url.pathname === '/404/' || url.pathname === '/404.html') {
    return true;
  }
  if (url.search) {
    return true;
  }
  if (/\/(demo|mock)(-|\/|$)/i.test(url.pathname)) {
    return true;
  }
  if (/\/page\/\d+\/?$/.test(url.pathname)) {
    return true;
  }
  // 标签页：只有 INDEXABLE_TAGS 里的可索引（其余 noindex，不进 sitemap）；标签总览页也不进 sitemap。
  if (url.pathname === '/tag/' || url.pathname === '/tag') {
    return true;
  }
  const tagMatch = url.pathname.match(/^\/tag\/([^/]+)\/?$/);
  if (tagMatch && !INDEXABLE_TAGS.includes(tagMatch[1])) {
    return true;
  }
  if (url.pathname === '/internal-stats' || url.pathname === '/internal-stats/') {
    return true;
  }
  return false;
}

// https://astro.build/config
export default defineConfig({
  // sitemap 需要绝对域名才能生成 canonical 绝对 URL，正式 canonical host 见 CLAUDE.md / SEO Foundation。
  site: 'https://jcniu.com',
  integrations: [
    sitemap({
      filter: (page) => !isSitemapExcluded(page),
      serialize(item) {
        item.lastmod = lastmodByPath.get(new URL(item.url).pathname) ?? SITE_REVISION;
        return item;
      },
    }),
  ],
});
