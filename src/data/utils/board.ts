import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { getPublishableProviders } from './provider-publish-gate';

type ProviderEntry = CollectionEntry<'providers'>;

export interface BoardRow {
  rank: number;
  tier: string;
  reason: string;
  provider: ProviderEntry;
}

export interface FallenEntry {
  name: string;
  status: string;
  source: string;
  markedAt: Date;
  note: string;
}

export interface BoardTier {
  id: string;
  label: string;
  tagline: string;
  rule: string;
  rows: BoardRow[];
  fallen: FallenEntry[];
}

export interface BoardData {
  title: string;
  description: string;
  methodology: string;
  snapshotAt: Date;
  tiers: BoardTier[];
  rows: BoardRow[];
  fallen: FallenEntry[];
}

/** 读取"夯到拉"分档榜：只保留通过发布门槛的品牌，按名次排序，再按档位分组。 */
export async function getBoard(): Promise<BoardData> {
  const [boards, providers] = await Promise.all([getCollection('board'), getPublishableProviders()]);
  const board = boards[0];
  if (!board) throw new Error('[board] 缺少 src/data/board/board.json');
  const byId = new Map(providers.map((p) => [p.id, p]));

  const rows: BoardRow[] = board.data.entries
    .map((entry) => {
      const provider = byId.get(entry.providerId.id);
      return provider ? { rank: entry.rank, tier: entry.tier, reason: entry.reason, provider } : null;
    })
    .filter((row): row is BoardRow => row !== null)
    .sort((a, b) => a.rank - b.rank);

  const tiers: BoardTier[] = board.data.tiers.map((tier) => ({
    ...tier,
    rows: rows.filter((row) => row.tier === tier.id),
    fallen: tier.id === 'laliao' ? board.data.fallen : [],
  }));

  return {
    title: board.data.title,
    description: board.data.description,
    methodology: board.data.methodology,
    snapshotAt: board.data.snapshotAt,
    tiers,
    rows,
    fallen: board.data.fallen,
  };
}
