import type { Loader, LoaderContext } from 'astro/loaders';
import { extractProviderRefId, loadValidProviderIds } from './provider-refs.js';

/**
 * 包装一个已有 Loader，在其完成加载后，对指定字段中的 providerId
 * 引用做构建期存在性校验。引用不存在时抛出错误，中断 astro build，
 * 而不是静默生成指向空 Provider 的页面。
 */
export function withProviderRefCheck(
  loader: Loader,
  extractRefs: (data: Record<string, unknown>) => unknown[],
): Loader {
  return {
    name: `${loader.name}:provider-ref-check`,
    load: async (context: LoaderContext) => {
      await loader.load(context);

      const validProviderIds = loadValidProviderIds();
      for (const [entryId, entry] of context.store.entries()) {
        const refs = extractRefs(entry.data as Record<string, unknown>);
        for (const rawRef of refs) {
          const refId = extractProviderRefId(rawRef);
          if (!validProviderIds.has(refId)) {
            throw new Error(
              `[content-integrity] Collection "${context.collection}" 中条目 "${entryId}" ` +
                `引用了不存在的 providerId "${refId}"。请检查 src/data/providers/providers.json。`,
            );
          }
        }
      }
    },
  };
}

/**
 * 校验同一个 providerId 在集合中最多只出现一次。
 * 用于强制 "一个 Provider 最多一个 canonical Review" 的规则。
 */
export function withUniqueProviderPerEntry(loader: Loader): Loader {
  return {
    name: `${loader.name}:unique-provider-check`,
    load: async (context: LoaderContext) => {
      await loader.load(context);

      const seenBy = new Map<string, string>();
      for (const [entryId, entry] of context.store.entries()) {
        const data = entry.data as Record<string, unknown>;
        const refId = extractProviderRefId(data.providerId);
        const existingEntryId = seenBy.get(refId);
        if (existingEntryId) {
          throw new Error(
            `[content-integrity] Collection "${context.collection}" 中 Provider "${refId}" ` +
              `已存在评测 "${existingEntryId}"，检测到重复评测 "${entryId}"。` +
              `每个 Provider 最多只能有一篇 canonical Review。`,
          );
        }
        seenBy.set(refId, entryId);
      }
    },
  };
}
