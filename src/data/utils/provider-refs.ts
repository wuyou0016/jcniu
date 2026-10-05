import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

interface MinimalProviderRecord {
  id: string;
}

const PROVIDERS_FILE = fileURLToPath(new URL('../providers/providers.json', import.meta.url));

/**
 * Providers 是所有跨集合引用校验的事实来源，直接读取源 JSON 而不是
 * 通过 Astro 的 store，避免依赖 collection 之间不确定的加载顺序。
 */
export function loadValidProviderIds(): Set<string> {
  const raw = readFileSync(PROVIDERS_FILE, 'utf-8');
  const providers = JSON.parse(raw) as MinimalProviderRecord[];
  return new Set(providers.map((provider) => provider.id));
}

export function extractProviderRefId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: unknown }).id);
  }
  throw new Error(`无法解析 Provider 引用: ${JSON.stringify(value)}`);
}
