// 关键词标签体系：每个标签对应一个"关键词落地页"（/tag/{slug}/），聚合相关文章、
// 相关问答和（有真实字段支撑时）相关品牌。
//
// 设计上刻意不改文章 frontmatter（所有站的文章 schema 保持不变）：
// - 文章 → 标签：按标题+简介+分类里是否出现标签关键词自动归类
// - 问答 → 标签：问答数据里显式标注
// - 品牌 → 标签：只看 providers 里真实存在的 routes / protocols / clientSupport 字段，
//   没有字段支撑的标签（便宜、稳定、解锁等主观维度）不给品牌贴标，只给榜单入口
import type { CollectionEntry } from 'astro:content';
import { FAQ_ITEMS } from './faq-data';
import type { FaqItem } from './seo-types';
import { TAG_COPY } from './site-copy';

export interface SeoTag {
  slug: string;
  name: string;
  blurb: string;
  intro: string;
  angle: string;
  keywords: string[];
  links: { label: string; href: string }[];
}

interface TagStruct {
  slug: string;
  keywords: string[];
  links: { label: string; href: string }[];
}

const BEST_VALUE = { label: '机场入门价格参考榜', href: '/rankings/best-value/' };
const MOST_STABLE = { label: '机场稳定性参考榜', href: '/rankings/stable/' };
const FOR_BEGINNERS = { label: '新手友好机场参考', href: '/guides/xinshou-jichang-tuijian/' };
const RANKINGS = { label: '全部榜单', href: '/rankings/' };
const AIRPORTS = { label: '全部收录品牌', href: '/airports/' };
const KNOWLEDGE = { label: '机场代理知识库', href: '/knowledge/' };
const TUTORIALS = { label: '机场教程', href: '/tutorials/' };
const TROUBLE = { label: '故障排查', href: '/troubleshooting/' };

const TAG_STRUCT: TagStruct[] = [
  { slug: 'cheap-airport', keywords: ['便宜', '低价', '入门价格', '隐藏成本'], links: [BEST_VALUE, FOR_BEGINNERS] },
  { slug: 'value-airport', keywords: ['性价比', '单价', '每GB', '每 GB', '比价'], links: [BEST_VALUE, RANKINGS] },
  { slug: 'stable-airport', keywords: ['稳定', '丢包', '晚高峰', '掉线', '卡顿'], links: [MOST_STABLE, RANKINGS] },
  { slug: 'dedicated-line-airport', keywords: ['专线', 'IPLC', 'IEPL', '中转'], links: [AIRPORTS, RANKINGS] },
  { slug: 'beginner-airport', keywords: ['新手', '入门知识', '第一次', '刚接触', '基础概念'], links: [FOR_BEGINNERS, KNOWLEDGE] },
  { slug: 'airport-recommendation', keywords: ['推荐', '榜单', '排行', '怎么选', '选择', '机场选择'], links: [RANKINGS, AIRPORTS] },
  { slug: 'airport-speedtest', keywords: ['测速', '带宽', '延迟', '速度'], links: [MOST_STABLE, KNOWLEDGE] },
  { slug: 'airport-scam', keywords: ['跑路', '避坑', '预警', '套路', '不透明', '红旗', '隐藏成本'], links: [BEST_VALUE, KNOWLEDGE] },
  { slug: 'clash', keywords: ['Clash'], links: [TUTORIALS, KNOWLEDGE] },
  { slug: 'shadowrocket', keywords: ['Shadowrocket', '小火箭'], links: [TUTORIALS, KNOWLEDGE] },
  { slug: 'v2rayn', keywords: ['v2rayN', 'V2Ray'], links: [TUTORIALS, KNOWLEDGE] },
  { slug: 'iplc', keywords: ['IPLC'], links: [AIRPORTS, KNOWLEDGE] },
  { slug: 'iepl', keywords: ['IEPL'], links: [AIRPORTS, KNOWLEDGE] },
  { slug: 'streaming-unlock', keywords: ['流媒体', '解锁', 'Netflix', 'Disney'], links: [MOST_STABLE, KNOWLEDGE] },
  { slug: 'ai-tools', keywords: ['ChatGPT', 'Claude', 'AI工具', 'AI 工具', 'AI服务', 'AI 服务'], links: [KNOWLEDGE, AIRPORTS] },
  { slug: 'node', keywords: ['节点'], links: [KNOWLEDGE, AIRPORTS] },
  { slug: 'subscription', keywords: ['订阅'], links: [TUTORIALS, TROUBLE] },
  { slug: 'protocol', keywords: ['协议', 'VLESS', 'Trojan', 'Hysteria', 'Shadowsocks'], links: [KNOWLEDGE, TUTORIALS] },
  { slug: 'ladder-tool', keywords: ['梯子', '梯子工具'], links: [KNOWLEDGE, AIRPORTS] },
  { slug: 'client', keywords: ['客户端', 'Clash', '小火箭', 'v2rayN', 'Shadowrocket'], links: [TUTORIALS, KNOWLEDGE] },
  { slug: 'troubleshooting', keywords: ['连不上', '故障', '排查', '没网', '无法连接', '失败'], links: [TROUBLE, TUTORIALS] },
  { slug: 'coupon', keywords: ['优惠', '试用', '折扣'], links: [BEST_VALUE, KNOWLEDGE] },
];

// 标签的可见文案（名称、简介、角度段落）全部来自各站自己的 site-copy.ts，
// 这里只保留标签的结构：slug、文章匹配关键词、站内入口链接。
export const SEO_TAGS: SeoTag[] = TAG_STRUCT.map((struct) => {
  const copy = TAG_COPY[struct.slug];
  return {
    ...struct,
    name: copy.name,
    blurb: copy.blurb,
    intro: copy.intro,
    angle: copy.angle,
    links: struct.links.map((link, index) => ({ ...link, label: copy.linkLabels?.[index] ?? link.label })),
  };
});

export function getTag(slug: string): SeoTag | undefined {
  return SEO_TAGS.find((tag) => tag.slug === slug);
}

type ArticleEntry = CollectionEntry<'articles'>;

function articleHaystack(article: ArticleEntry): string {
  return `${article.data.title} ${article.data.description} ${article.data.category}`;
}

export function articleMatchesTag(article: ArticleEntry, tag: SeoTag): boolean {
  const text = articleHaystack(article).toLowerCase();
  return tag.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function getTagsForArticle(article: ArticleEntry): SeoTag[] {
  return SEO_TAGS.filter((tag) => articleMatchesTag(article, tag));
}

export function getArticlesForTag(tag: SeoTag, articles: ArticleEntry[]): ArticleEntry[] {
  return articles.filter((article) => articleMatchesTag(article, tag));
}

export function getFaqForTag(tag: SeoTag): FaqItem[] {
  return FAQ_ITEMS.filter((item) => item.tags.includes(tag.slug));
}

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// 给文章挑相关问答：按标签重合数排序，同分的用"文章 id + 问题"哈希打散，
// 这样同标签的不同文章不会全部拿到同一组问答。
export function getRelatedFaq(tagSlugs: string[], seed: string, limit = 3): FaqItem[] {
  const scored = FAQ_ITEMS.map((item) => ({
    item,
    score: item.tags.filter((tag) => tagSlugs.includes(tag)).length,
  })).filter((entry) => entry.score > 0);
  scored.sort((a, b) => b.score - a.score || hash(seed + a.item.q) - hash(seed + b.item.q));
  return scored.slice(0, limit).map((entry) => entry.item);
}

type ProviderEntry = CollectionEntry<'providers'>;

const listHas = (list: string[] | undefined, pattern: RegExp) => (list ?? []).some((value) => pattern.test(value));

const PROVIDER_MATCHERS: Record<string, (provider: ProviderEntry) => boolean> = {
  'dedicated-line-airport': (p) => listHas(p.data.vendor.routes, /IPLC|IEPL/i),
  iplc: (p) => listHas(p.data.vendor.routes, /IPLC/i),
  iepl: (p) => listHas(p.data.vendor.routes, /IEPL/i),
  clash: (p) => listHas(p.data.vendor.clientSupport, /clash/i),
  shadowrocket: (p) => listHas(p.data.vendor.clientSupport, /shadowrocket|小火箭/i),
  v2rayn: (p) => listHas(p.data.vendor.clientSupport, /v2ray/i),
  client: (p) => (p.data.vendor.clientSupport ?? []).length > 0,
  protocol: (p) => (p.data.vendor.protocols ?? []).length > 0,
  node: (p) => (p.data.vendor.regions ?? []).length > 0,
};

export function providerMatchesTag(provider: ProviderEntry, tag: SeoTag): boolean {
  const matcher = PROVIDER_MATCHERS[tag.slug];
  return matcher ? matcher(provider) : false;
}

export function tagHasProviderSupport(tag: SeoTag): boolean {
  return tag.slug in PROVIDER_MATCHERS;
}

export function getTagsForProvider(provider: ProviderEntry): SeoTag[] {
  return SEO_TAGS.filter((tag) => providerMatchesTag(provider, tag));
}
