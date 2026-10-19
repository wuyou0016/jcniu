// 2026-10-19 “收敛要被抓取的页面”规则（Bing 复查 10/19 的建议 B6/B9）。
//
// 背景：新站 8–16 天里只被抓取首页，其余页面从未被抓取；近重复页（配对对比页最高相似度 0.60）和薄页（工具页 170–480 字、更新日志 82 字）
// 会拉低整站质量信号。做法：这些页面保留在站内，只加 noindex,follow 并移出 sitemap；不删除、不重定向。
// 本文件同时被 astro.config.mjs（sitemap 过滤）与 SEOHead / FaqBlock（运行时）使用，改规则只改这一处。
// （标签页的可索引名单仍由 indexable-tags.mjs 管理，这里不重复。）

/** 整个栏目 noindex（含栏目首页） */
const NOINDEX_SECTIONS = [
  '/tools/', // 工具页：正文很薄（170–480 字）
  '/changelog/', // 更新日志：正文 82 字
];

/** 单页 noindex：6 个“A vs B”配对对比页（互相相似度 0.5–0.6，入链仅 1 个）；/compare/ 总览页保留索引 */
const NOINDEX_PATHS = new Set([
  '/compare/feimao-cloud-vs-firefly/',
  '/compare/feimao-cloud-vs-weifeng-network/',
  '/compare/weifeng-network-vs-firefly/',
  '/compare/wuyou-lianjie-vs-feimao-cloud/',
  '/compare/wuyou-lianjie-vs-firefly/',
  '/compare/wuyou-lianjie-vs-weifeng-network/',
]);

/** @param {string} pathname */
export function isNoindexPath(pathname) {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (NOINDEX_PATHS.has(p)) return true;
  return NOINDEX_SECTIONS.some((s) => p === s || p.startsWith(s));
}

/**
 * 页面底部的“常见问题”区块（及对应的 FAQPage 结构化数据）只在真有问答意图的栏目显示：
 * 首页、/faq/ 总页、指南、客户端、知识、教程、排障、预警，以及两个本身就是问答口径的单页。
 * 机场档案（28 页）、榜单、对比、术语、标签、工具等不再每页硬塞 FAQ。
 */
const FAQ_SECTIONS = ['/guides/', '/clients/', '/knowledge/', '/tutorials/', '/troubleshooting/', '/warnings/'];
const FAQ_EXACT = new Set(['/', '/faq/', '/airport-warnings/', '/free-airport/']);

/** @param {string} pathname */
export function faqAllowed(pathname) {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (FAQ_EXACT.has(p)) return true;
  return FAQ_SECTIONS.some((s) => p.startsWith(s) && p !== s);
}
