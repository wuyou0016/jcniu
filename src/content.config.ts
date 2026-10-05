import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { withProviderRefCheck } from './data/utils/with-provider-ref-check.js';

// ---------------------------------------------------------------------------
// 共享子 Schema
// ---------------------------------------------------------------------------

// 见 Content & Data Architecture v1.0 第 5 节：来源必须分组标注，
// 不允许把厂商信息 / 本站测试 / 第三方资料 / 编辑观点混成一个事实。
const sourceMetaSchema = z.object({
  type: z.enum(['vendor', 'in-house', 'third-party', 'editorial']),
  sourceUrl: z.url().optional(),
  retrievedAt: z.coerce.date(),
  publishedAt: z.coerce.date().optional(),
  verifiedAt: z.coerce.date().optional(),
  claim: z.string(),
  evidence: z.string().optional(),
});

const pricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  billingCycle: z.string().optional(),
  trafficQuota: z.string().optional(),
});

const thirdPartyNoteSchema = z.object({
  source: z.string(),
  sourceUrl: z.url().optional(),
  claim: z.string(),
  date: z.coerce.date(),
});

// ---------------------------------------------------------------------------
// providers（Data Collection）
// ---------------------------------------------------------------------------

const providerSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  aliases: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'discontinued', 'watch']),
  vendor: z.object({
    officialWebsite: z.url(),
    description: z.string(),
    pricing: z.array(pricingPlanSchema).optional(),
    traffic: z.string().optional(),
    devices: z.number().optional(),
    protocols: z.array(z.string()).optional(),
    routes: z.array(z.string()).optional(),
    regions: z.array(z.string()).optional(),
    clientSupport: z.array(z.string()).optional(),
    support: z.array(z.string()).optional(),
    source: sourceMetaSchema,
  }),
  thirdPartyNotes: z.array(thirdPartyNoteSchema).optional(),
  editorial: z.object({
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    suitableFor: z.array(z.string()),
    notSuitableFor: z.array(z.string()),
    summary: z.string(),
    source: sourceMetaSchema,
  }),
  lastVerified: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const providers = defineCollection({
  loader: file('src/data/providers/providers.json'),
  schema: providerSchema,
});

// ---------------------------------------------------------------------------
// tests（Data Collection，TestRecord，独立于 Provider，通过 providerId 关联）
// ---------------------------------------------------------------------------

const testEnvironmentSchema = z.object({
  location: z.string(),
  network: z.string(),
  client: z.string(),
  protocol: z.string(),
});

const streamingResultSchema = z.object({
  platform: z.string(),
  unlocked: z.boolean(),
  notes: z.string().optional(),
});

const aiServiceResultSchema = z.object({
  service: z.string(),
  accessible: z.boolean(),
  notes: z.string().optional(),
});

const testRecordSchema = z.object({
  id: z.string(),
  providerId: reference('providers'),
  date: z.coerce.date(),
  methodology: z.string(),
  environment: testEnvironmentSchema,
  // results 全部 optional：不强制每次测试覆盖所有指标，不得为凑 Schema 造假数据。
  results: z
    .object({
      downloadMbps: z.number().optional(),
      uploadMbps: z.number().optional(),
      latencyMs: z.number().optional(),
      packetLossPercent: z.number().optional(),
      stabilityScore: z.number().optional(),
      streaming: z.array(streamingResultSchema).optional(),
      aiServicesAccess: z.array(aiServiceResultSchema).optional(),
    })
    .optional(),
  tester: z.string().optional(),
  notes: z.string().optional(),
});

const tests = defineCollection({
  loader: withProviderRefCheck(file('src/data/tests/tests.json'), (data) => [data.providerId]),
  schema: testRecordSchema,
});

// ---------------------------------------------------------------------------
// board（机场牛"夯到拉"分档榜：档位定义 + 每家品牌的名次、档位与一句话理由）
// ---------------------------------------------------------------------------

const tierSchema = z.object({
  id: z.string(),
  label: z.string(),
  tagline: z.string(),
  rule: z.string(),
});

const boardEntrySchema = z.object({
  providerId: reference('providers'),
  tier: z.string(),
  rank: z.number().int().min(1),
  reason: z.string(),
});

const fallenSchema = z.object({
  name: z.string(),
  status: z.string(),
  source: z.string(),
  markedAt: z.coerce.date(),
  note: z.string(),
});

const boardSchema = z.object({
  title: z.string(),
  description: z.string(),
  methodology: z.string(),
  snapshotAt: z.coerce.date(),
  tiers: z.array(tierSchema),
  entries: z.array(boardEntrySchema),
  // 拉完了名单：站长标注已跑路的服务商。没有 providers 资料，只记录名称、状态、来源与标注日期。
  fallen: z.array(fallenSchema).default([]),
});

const board = defineCollection({
  loader: withProviderRefCheck(file('src/data/board/board.json'), (data) => {
    const entries = (data.entries as Array<{ providerId: unknown }>) ?? [];
    return entries.map((entry) => entry.providerId);
  }),
  schema: boardSchema,
});

// ---------------------------------------------------------------------------
// articles（Content Collection：按 type 分栏目路由，见 data/utils/article-routing.ts）
// ---------------------------------------------------------------------------

const faqPairSchema = z.object({ q: z.string(), a: z.string() });

const articleSchema = z.object({
  type: z.enum(['guide', 'client', 'knowledge', 'tutorial', 'troubleshooting', 'warning']),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  // 一词一页：每篇文章登记 1 个主关键词，次关键词最多 3 个（见 docs/keyword-registry.md）。
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()).max(4).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  author: z.string().optional(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // 文末"当前资料里……的品牌"数据块：由页面按 providers 真实字段筛选生成，
  // 不在正文里手写品牌结论。none = 不显示。
  rankBlock: z.enum(['overall', 'dedicated', 'cheap', 'monthly', 'clash', 'overseas', 'none']).default('none'),
  rankBlockHeading: z.string().optional(),
  relatedTopics: z.array(z.string()).optional(),
  // 本文自己的常见问题：页面可见文字 = FAQPage JSON-LD 文字（纯文本）。
  faqs: z.array(faqPairSchema).max(8).optional(),
  symptom: z.string().optional(),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: articleSchema,
});

// ---------------------------------------------------------------------------
// glossary（Content Collection）
// ---------------------------------------------------------------------------

const glossarySchema = z.object({
  term: z.string(),
  definition: z.string(),
  extendedExplanation: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  relatedTerms: z.array(z.string()).optional(),
  relatedArticles: z.array(z.string()).optional(),
  updatedAt: z.coerce.date(),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/glossary' }),
  schema: glossarySchema,
});

export const collections = {
  providers,
  tests,
  board,
  articles,
  glossary,
};
