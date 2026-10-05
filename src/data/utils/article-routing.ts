import type { CollectionEntry } from 'astro:content';

// Article 的 URL 前缀由 type 字段决定，全站统一从这里取值。
// 关键词页（guide）用拼音/英文关键词 slug，一词一页，见 docs/keyword-registry.md。
export const articleBasePathByType: Record<CollectionEntry<'articles'>['data']['type'], string> = {
  guide: '/guides/',
  client: '/clients/',
  knowledge: '/knowledge/',
  tutorial: '/tutorials/',
  troubleshooting: '/troubleshooting/',
  warning: '/warnings/',
};

export const articleTypeLabel: Record<CollectionEntry<'articles'>['data']['type'], string> = {
  guide: '选购指南',
  client: '客户端',
  knowledge: '知识库',
  tutorial: '教程',
  troubleshooting: '故障排查',
  warning: '避坑预警',
};

export function getArticleHref(article: CollectionEntry<'articles'>): string {
  return `${articleBasePathByType[article.data.type]}${article.id}/`;
}
