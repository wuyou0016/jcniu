import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { isDemoEntry } from './demo-filter';

type ProviderEntry = CollectionEntry<'providers'>;
type TestRecordEntry = CollectionEntry<'tests'>;

// Provider.editorial 各字段在 Schema 中是必填的，但允许空字符串/空数组，
// 所以"是否存在真实编辑结论"不能只看字段是否存在，要看内容是否非空。
function hasSubstantiveEditorial(provider: ProviderEntry): boolean {
  const { editorial } = provider.data;
  return editorial.summary.trim().length > 0 && (editorial.pros.length > 0 || editorial.cons.length > 0);
}

export function hasRealTestRecord(provider: ProviderEntry, tests: TestRecordEntry[]): boolean {
  return tests.some((test) => !isDemoEntry(test.id) && test.data.providerId.id === provider.id);
}

// 发布门槛：B（厂商公开信息）+ C（本站测试）或 B + E（实质性编辑结论）。
// 仅有 B 不允许生成独立 Provider 页面。
export function isProviderPublishable(provider: ProviderEntry, tests: TestRecordEntry[]): boolean {
  if (isDemoEntry(provider.id)) return false;

  const hasVendorInfo = Boolean(provider.data.vendor.officialWebsite && provider.data.vendor.description);
  if (!hasVendorInfo) return false;

  return hasRealTestRecord(provider, tests) || hasSubstantiveEditorial(provider);
}

export async function getPublishableProviders(): Promise<ProviderEntry[]> {
  const [providers, tests] = await Promise.all([
    getCollection('providers', ({ id }) => !isDemoEntry(id)),
    getCollection('tests', ({ id }) => !isDemoEntry(id)),
  ]);

  return providers.filter((provider) => isProviderPublishable(provider, tests));
}
