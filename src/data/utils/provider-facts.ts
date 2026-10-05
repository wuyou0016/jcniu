// 品牌事实筛选：所有"专线机场 / 月付机场 / 海外节点"之类的专项榜单都从 providers.json
// 的真实字段筛选，不引入任何自造分数。没有字段支撑的品牌不会出现在对应专项里。
import type { CollectionEntry } from 'astro:content';
import type { BoardRow } from './board';

type ProviderEntry = CollectionEntry<'providers'>;

const PRICE_PATTERN = /(\d+(?:\.\d+)?)\s*(?:元)?\s*\/\s*月/;
const GB_PATTERN = /(\d+(?:\.\d+)?)\s*GB/i;

/** 套餐文案里能直接读出的"每月价格"（如 "¥6.6/月"、"年付¥99（约¥8.3/月）"）；读不出返回 null。 */
export function monthlyPrice(price: string): number | null {
  const match = price.match(PRICE_PATTERN);
  return match ? Number(match[1]) : null;
}

export function trafficGb(quota: string | undefined): number | null {
  if (!quota) return null;
  const match = quota.match(GB_PATTERN);
  return match ? Number(match[1]) : null;
}

export interface PlanFact {
  name: string;
  price: string;
  cycle: string;
  quota: string;
  monthly: number | null;
}

const CYCLE_LABEL: Record<string, string> = { yearly: '按年付费', monthly: '按月付费' };

export function planFacts(provider: ProviderEntry): PlanFact[] {
  return (provider.data.vendor.pricing ?? []).map((plan) => ({
    name: plan.name,
    price: plan.price,
    cycle: plan.billingCycle ? (CYCLE_LABEL[plan.billingCycle] ?? plan.billingCycle) : '',
    quota: plan.trafficQuota ?? '',
    monthly: monthlyPrice(plan.price),
  }));
}

/** 最便宜的一档"每月价格"（读不出任何价格则为 null）。 */
export function cheapestMonthly(provider: ProviderEntry): { plan: PlanFact; monthly: number } | null {
  let best: { plan: PlanFact; monthly: number } | null = null;
  for (const plan of planFacts(provider)) {
    if (plan.monthly === null) continue;
    if (!best || plan.monthly < best.monthly) best = { plan, monthly: plan.monthly };
  }
  return best;
}

/** 清掉 "（第三方资料）" 这类括号来源后缀，页面上的来源标注由单独的徽章给出。 */
export function cleanLabel(value: string): string {
  return value.replace(/（[^）]*）/g, '').trim();
}

export function hasDedicatedRoute(provider: ProviderEntry): boolean {
  return (provider.data.vendor.routes ?? []).some((route) => /IPLC|IEPL|专线/i.test(route));
}

export function hasMonthlyPlan(provider: ProviderEntry): boolean {
  return (provider.data.vendor.pricing ?? []).some((plan) => plan.billingCycle === 'monthly');
}

export function hasClashSupport(provider: ProviderEntry): boolean {
  return (provider.data.vendor.clientSupport ?? []).some((client) => /clash/i.test(client));
}

export function hasRegion(provider: ProviderEntry, names: string[]): boolean {
  const regions = provider.data.vendor.regions ?? [];
  return names.some((name) => regions.includes(name));
}

export type RankBlockKind = 'overall' | 'dedicated' | 'cheap' | 'monthly' | 'clash' | 'overseas';

export interface RankBlockMeta {
  heading: string;
  intro: string;
  link: { label: string; href: string };
}

export const RANK_BLOCK_META: Record<RankBlockKind, RankBlockMeta> = {
  overall: {
    heading: '机场牛当前排名靠前的几家',
    intro: '下面是机场牛分档榜的前几名，档位只反映资料透明度，不代表速度和稳定性。',
    link: { label: '看完整的夯到拉排行榜', href: '/rankings/' },
  },
  dedicated: {
    heading: '资料里标注了专线线路的机场',
    intro: '下面是资料中明确记录了 IPLC、IEPL 或企业级专线的品牌，线路类型来自官方或第三方资料，不是本站测出来的。',
    link: { label: '看专线机场推荐榜', href: '/rankings/dedicated-line/' },
  },
  cheap: {
    heading: '月均价最低的几家（按资料里的价格折算）',
    intro: '下面按套餐文案里能读出的每月价格从低到高排，价格来自官网或第三方资料，下单前请以结算页为准。',
    link: { label: '看便宜机场推荐榜', href: '/rankings/cheap/' },
  },
  monthly: {
    heading: '资料里有月付套餐的机场',
    intro: '月付试错成本低。下面是资料里明确记录了按月付费套餐的品牌，价格与流量按资料原样列出。',
    link: { label: '看月付机场推荐榜', href: '/rankings/monthly/' },
  },
  clash: {
    heading: '资料里明确标注支持 Clash 的机场',
    intro: '目前资料里把 Clash 写进客户端支持的品牌很少，没有标注不等于不能用，只是没有可核实的说明。',
    link: { label: '看 Clash 机场推荐', href: '/guides/clash-jichang-tuijian/' },
  },
  overseas: {
    heading: '资料里记录了日本、新加坡或美国节点的机场',
    intro: '访问 ChatGPT、Claude 这类对出口地区有限制的服务时，节点所在地区比品牌名更重要。下面是资料里记录了这些地区的品牌。',
    link: { label: '看机场推荐总榜', href: '/rankings/' },
  },
};

export function filterRows(kind: RankBlockKind, rows: BoardRow[]): BoardRow[] {
  switch (kind) {
    case 'overall':
      return rows.slice(0, 7);
    case 'dedicated':
      return rows.filter((row) => hasDedicatedRoute(row.provider));
    case 'cheap':
      return rows
        .map((row) => ({ row, best: cheapestMonthly(row.provider) }))
        .filter((item): item is { row: BoardRow; best: { plan: PlanFact; monthly: number } } => item.best !== null)
        .sort((a, b) => a.best.monthly - b.best.monthly || a.row.rank - b.row.rank)
        .map((item) => item.row);
    case 'monthly':
      return rows.filter((row) => hasMonthlyPlan(row.provider));
    case 'clash':
      return rows.filter((row) => hasClashSupport(row.provider));
    case 'overseas':
      return rows.filter((row) => hasRegion(row.provider, ['日本', '新加坡', '美国']));
  }
}
