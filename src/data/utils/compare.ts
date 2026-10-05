import type { BoardRow } from './board';
import { cheapestMonthly, cleanLabel, hasMonthlyPlan, planFacts } from './provider-facts';

// 两两对比页覆盖榜单前 N 名之间的所有组合（N=8 → 28 对）。
export const PAIR_COUNT_TOP = 8;

export function pairSlug(a: string, b: string): string {
  return `${a}-vs-${b}`;
}

const uniq = (list: string[]) => [...new Set(list)];

export interface PairSummary {
  sentences: string[];
  verdictHint: string;
}

/** 只根据资料里真实存在的字段生成差异句；缺失的字段会说明"资料空白"，不会替商家补。 */
export function summarizePair(a: BoardRow, b: BoardRow): PairSummary {
  const na = a.provider.data.name;
  const nb = b.provider.data.name;
  const out: string[] = [];

  const pa = cheapestMonthly(a.provider);
  const pb = cheapestMonthly(b.provider);
  if (pa && pb) {
    if (pa.monthly === pb.monthly) {
      out.push(`价格：两家资料里能读出的最低月均价都是 ¥${pa.monthly}/月，差别主要在流量和付费周期。`);
    } else {
      const [cheap, dear, cp, dp] = pa.monthly < pb.monthly ? [na, nb, pa, pb] : [nb, na, pb, pa];
      out.push(
        `价格：${cheap}资料里最低一档折合 ¥${cp.monthly}/月（${cp.plan.name}${cp.plan.cycle ? `，${cp.plan.cycle}` : ''}），${dear}是 ¥${dp.monthly}/月（${dp.plan.name}${dp.plan.cycle ? `，${dp.plan.cycle}` : ''}），差 ¥${Math.abs(pa.monthly - pb.monthly).toFixed(1)}/月；月均价是折算值，实际付款周期不同。`,
      );
    }
  } else if (pa || pb) {
    const [has, lack] = pa ? [na, nb] : [nb, na];
    out.push(`价格：只有${has}在资料里留下了可读出的每月价格，${lack}目前没有可核实的价格资料，无法在价格上直接比较。`);
  } else {
    out.push('价格：两家都没有可核实的价格资料，需要到官网确认后再比。');
  }

  const ma = hasMonthlyPlan(a.provider);
  const mb = hasMonthlyPlan(b.provider);
  if (ma !== mb) {
    out.push(`付费周期：资料里${ma ? na : nb}记录了按月付费套餐，${ma ? nb : na}没有，想先试一个月的话这一点有参考价值。`);
  } else if (ma && mb) {
    out.push('付费周期：两家资料里都记录了按月付费套餐，试错成本相近。');
  }

  const ra = (a.provider.data.vendor.routes ?? []).map(cleanLabel).filter(Boolean);
  const rb = (b.provider.data.vendor.routes ?? []).map(cleanLabel).filter(Boolean);
  if (ra.length && rb.length) {
    out.push(
      uniq(ra).join('、') === uniq(rb).join('、')
        ? `线路：两家资料里都记录为${uniq(ra).join('、')}，线路类型上没有拉开差距。`
        : `线路：${na}记录为${uniq(ra).join('、')}，${nb}记录为${uniq(rb).join('、')}，线路类型描述不同，具体表现要自己试。`,
    );
  } else if (ra.length || rb.length) {
    out.push(`线路：只有${ra.length ? na : nb}写明了线路类型（${(ra.length ? ra : rb).join('、')}），${ra.length ? nb : na}的线路资料空白。`);
  } else {
    out.push('线路：两家的线路类型资料都是空白。');
  }

  const pra = a.provider.data.vendor.protocols ?? [];
  const prb = b.provider.data.vendor.protocols ?? [];
  if (pra.length && prb.length) {
    const sa = uniq(pra.map(cleanLabel));
    const sb = uniq(prb.map(cleanLabel));
    const common = sa.filter((x) => sb.includes(x));
    out.push(`协议：${common.length ? `共同支持${common.join('、')}` : '没有共同的协议记录'}；${na}记录${sa.join('、')}，${nb}记录${sb.join('、')}。`);
  } else if (pra.length || prb.length) {
    out.push(`协议：只有${pra.length ? na : nb}写明了协议（${uniq((pra.length ? pra : prb).map(cleanLabel)).join('、')}）。`);
  }

  const ga = a.provider.data.vendor.regions ?? [];
  const gb = b.provider.data.vendor.regions ?? [];
  if (ga.length && gb.length) {
    const onlyA = ga.filter((x) => !gb.includes(x));
    const onlyB = gb.filter((x) => !ga.includes(x));
    out.push(
      `节点地区：${na}记录${ga.join('、')}，${nb}记录${gb.join('、')}${onlyA.length || onlyB.length ? `；${onlyA.length ? `只有${na}写了${onlyA.join('、')}` : ''}${onlyA.length && onlyB.length ? '，' : ''}${onlyB.length ? `只有${nb}写了${onlyB.join('、')}` : ''}` : '，两家覆盖的地区一致'}。`,
    );
  } else if (ga.length || gb.length) {
    out.push(`节点地区：只有${ga.length ? na : nb}记录了节点地区，另一家的地区资料空白。`);
  }

  const ca = a.provider.data.vendor.clientSupport ?? [];
  const cb = b.provider.data.vendor.clientSupport ?? [];
  if (ca.length || cb.length) {
    out.push(`客户端：${ca.length ? `${na}写明支持${ca.join('、')}` : `${na}没有写客户端支持`}，${cb.length ? `${nb}写明支持${cb.join('、')}` : `${nb}没有写客户端支持`}。`);
  }

  void planFacts;
  return {
    sentences: out,
    verdictHint:
      a.rank < b.rank
        ? `在机场牛的夯到拉榜里，${na}（第 ${a.rank} 名）排在${nb}（第 ${b.rank} 名）前面，原因是资料透明度更高，不是速度更快。`
        : `在机场牛的夯到拉榜里，${nb}（第 ${b.rank} 名）排在${na}（第 ${a.rank} 名）前面，原因是资料透明度更高，不是速度更快。`,
  };
}
