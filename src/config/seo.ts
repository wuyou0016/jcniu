// SEO 基础类型与最小工具函数。只建立能力，不实现页面组件，
// 不生成 JSON-LD（留到后续 Structured Data 阶段，且必须与页面真实内容匹配）。

import { siteConfig } from './site.js';

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

// 默认品牌后缀。不同页面类型（Provider / Ranking / Comparison 等）的具体
// title 文案由页面自行决定，这里只提供最基础、通用的拼接方式。
export const BRAND_TITLE_SUFFIX = `｜${siteConfig.brandName}`;

export function withBrandSuffix(title: string): string {
  return `${title}${BRAND_TITLE_SUFFIX}`;
}

// ---------------------------------------------------------------------------
// Canonical / Trailing Slash
// ---------------------------------------------------------------------------

// 正式 canonical host：HTTPS、non-www、无 trailing 之外的多余部分。
export const CANONICAL_HOST = siteConfig.url;

/**
 * 把任意路径规整为统一的 canonical 绝对 URL：
 * - 去掉 query string / hash（不含无意义参数）
 * - 强制以 "/" 开头、以 "/" 结尾（全站统一 trailing slash）
 * - 折叠重复斜杠
 */
export function resolveCanonicalUrl(pathname: string): string {
  let path = pathname.split('?')[0]!.split('#')[0]!.trim();
  if (!path.startsWith('/')) path = `/${path}`;
  if (!path.endsWith('/')) path = `${path}/`;
  path = path.replace(/\/{2,}/g, '/');
  return `${CANONICAL_HOST}${path}`;
}

// ---------------------------------------------------------------------------
// Robots
// ---------------------------------------------------------------------------

export interface RobotsDirective {
  index: boolean;
  follow: boolean;
  noarchive?: boolean;
}

export const DEFAULT_ROBOTS: RobotsDirective = { index: true, follow: true };

export function robotsToString(robots: RobotsDirective = DEFAULT_ROBOTS): string {
  const parts = [robots.index ? 'index' : 'noindex', robots.follow ? 'follow' : 'nofollow'];
  if (robots.noarchive) parts.push('noarchive');
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// Open Graph / Twitter Card
// ---------------------------------------------------------------------------

export const defaultOpenGraph = {
  siteName: siteConfig.brandName,
  locale: 'zh_CN',
  type: 'website' as const,
};

export const TWITTER_CARD_TYPE = 'summary_large_image';

// ---------------------------------------------------------------------------
// 页面级 SEO 数据形状
// ---------------------------------------------------------------------------

// publishedTime / modifiedTime 必须由调用方从 Content/Data Layer 的
// publishedAt / updatedAt 传入，禁止在这里默认取当前构建时间。
export interface PageSeo {
  title: string;
  description: string;
  canonical: string;
  robots?: RobotsDirective;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
}
