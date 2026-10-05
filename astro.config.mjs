// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
    }),
  ],
});
