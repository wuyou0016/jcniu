// 品牌页"直答区"：机场牛的品牌档案里，每一问都只用 providers.json 里真实存在的字段拼出来。
// 没有字段支撑的问题不生成；没有价格资料时只说"没查到可核实的公开价格"，绝不补一个数字。
// 速度、稳定性、解锁这类没有测试记录的指标，统一回答"实时检测中"。
// 每个问题备了三种问法和三种答法，按品牌 slug 的哈希固定挑一种：同一品牌每次构建结果一致，
// 28 个品牌页读起来又不会像同一个模子刻出来的。页面可见文字即 FAQPage JSON-LD 文字，所以只产出纯文本。
import type { CollectionEntry } from 'astro:content';

export interface QA {
  q: string;
  a: string;
}

type ProviderEntry = CollectionEntry<'providers'>;

// 来源类型的叫法与品牌页的来源徽章保持一致
const SOURCE_LABEL: Record<string, string> = {
  vendor: '官方公开信息',
  'third-party': '第三方资料',
  editorial: '站长或编辑确认的内容',
  'in-house': '机场牛自测数据',
};

const CYCLE_LABEL: Record<string, string> = {
  monthly: '按月付费',
  yearly: '按年付费',
};

const STATUS_LABEL: Record<string, string> = {
  active: '运营中',
  inactive: '暂停服务',
  discontinued: '已停运',
  watch: '观察中',
};

const MAX_ITEMS = 7;

function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

// 同一个 slug + 同一个题号永远得到同一个数字，保证构建结果稳定
function bucket(slug: string, salt: number, size: number): number {
  let h = 5381 + salt * 977;
  for (let i = 0; i < slug.length; i += 1) {
    h = ((h << 5) + h + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % size;
}

function pick<T>(slug: string, salt: number, variants: T[]): T {
  return variants[bucket(slug, salt, variants.length)];
}

// 去掉“（第三方资料）”这类括号后缀并去重，来源信息在答案里单独交代
function tidy(values: string[] | undefined): string[] {
  const out: string[] = [];
  for (const value of values ?? []) {
    const label = value.replace(/（[^）]*）/g, '').trim();
    if (label && !out.includes(label)) out.push(label);
  }
  return out;
}

export function buildProviderFaq(provider: ProviderEntry, testCount: number): QA[] {
  const { name, vendor, thirdPartyNotes, status, lastVerified } = provider.data;
  const slug = provider.data.slug;
  const sourceLabel = SOURCE_LABEL[vendor.source.type] ?? vendor.source.type;
  const statusLabel = STATUS_LABEL[status] ?? status;
  const noteCount = thirdPartyNotes?.length ?? 0;
  const verifiedOn = formatDate(lastVerified);

  const routes = tidy(vendor.routes);
  const protocols = tidy(vendor.protocols);
  const regions = vendor.regions ?? [];
  const clients = vendor.clientSupport ?? [];
  const hasPricing = !!vendor.pricing && vendor.pricing.length > 0;

  const items: QA[] = [];

  // ---- 价格：先给价目，再提醒以结算页为准 ----
  if (hasPricing) {
    const planText = vendor
      .pricing!.map((plan) => {
        // 价格文案里已经写了年付/月付的，不再重复追加计费周期
        const cycleRaw = plan.billingCycle ? (CYCLE_LABEL[plan.billingCycle] ?? plan.billingCycle) : '';
        const cycle = /年付|月付/.test(plan.price) ? '' : cycleRaw;
        const traffic = plan.trafficQuota ? `，流量 ${plan.trafficQuota}` : '';
        return `${plan.name}：${plan.price}${cycle ? `（${cycle}）` : ''}${traffic}`;
      })
      .join('；');
    items.push({
      q: pick(slug, 1, [`${name}多少钱？几档套餐怎么收费？`, `${name}的套餐价目表，先看哪几列？`, `买${name}之前，价格和流量怎么核对？`]),
      a: pick(slug, 11, [
        `价目表摘抄如下：${planText}。资料口径是${sourceLabel}，只代表获取资料时的页面；金额、优惠、续费规则以官网结算页为准，机场牛的摘抄不是报价单。`,
        `档案里登记的套餐有：${planText}。出处属于${sourceLabel}，读的时候先对计费周期和流量，再去官网结算页核一遍，续费价要单独问。`,
        `套餐摆给你：${planText}。信息出自${sourceLabel}，摘抄结果不等于当前报价，下单金额以结算页为准，退款和续费条款也别忘了读。`,
      ]),
    });
  } else {
    items.push({
      q: pick(slug, 1, [`${name}的价格公开吗？`, `${name}要花多少钱？`, `哪里能查到${name}的价格？`]),
      a: pick(slug, 11, [
        `这一栏是空白：机场牛没查到可核实的公开价格，宁可空着也不估个数。真想知道，去官网结算页看，并留意首购价和续费价会不会不一样。`,
        `价格这块目前是空的：没查到可核实的公开价格，机场牛不编数字凑数。要买的话，以官网下单页的实际显示为准，退款条款也一并读掉。`,
        `${name}的价格资料是空白的，机场牛没查到可核实的公开价格，不会给出任何金额。需要了解价格，请去官网查看，或者向客服确认。`,
      ]),
    });
  }

  // ---- 线路类型 ----
  if (routes.length > 0) {
    const routeText = routes.join('、');
    const rawRoutes = (vendor.routes ?? []).join('');
    const routeNote = /第三方|转述/.test(rawRoutes) ? '带第三方标注的部分属于转述，机场牛没有独立核实。' : '';
    items.push({
      q: pick(slug, 2, [`${name}走专线还是中转？`, `${name}属于哪种线路？`, `${name}是 IPLC、IEPL 还是别的线路？`]),
      a: pick(slug, 12, [
        `线路栏的说法是${routeText}，来源属于${sourceLabel}。${routeNote}这只是线索，真实表现要靠自己试用、做路由追踪来验证，机场牛不对线路质量做担保。`,
        `${routeText}，这是档案里登记的线路类型，来源：${sourceLabel}。${routeNote}想验证名不名副其实，先买短周期，再用路由追踪看看路径。`,
        `按${sourceLabel}的记录，这家的线路类型为${routeText}。${routeNote}专线和中转的原理，机场知识库里有讲；这一家的实际体验如何，以你自己用出来的为准。`,
      ]),
    });
  }

  // ---- 协议与客户端 ----
  if (protocols.length > 0 || clients.length > 0) {
    const protoPart = protocols.length > 0 ? `协议栏写的是${protocols.join('、')}` : '协议这一栏没有可核实的资料';
    const clientPart = clients.length > 0 ? `客户端栏写的是${clients.join('、')}` : '客户端支持这一栏没有可核实的资料';
    items.push({
      q: pick(slug, 3, [`${name}支持哪些协议和客户端？`, `${name}的订阅能直接导进主流客户端吗？`, `${name}的协议这一项，买之前该核对什么？`]),
      a: pick(slug, 13, [
        `${protoPart}；${clientPart}。导入订阅之前，先确认自己的客户端版本读得懂这些协议，不然只会卡在“无法解析”。`,
        `${clientPart}；${protoPart}。设备、客户端、协议三样只要有一样对不上，订阅就导不通，买之前核对最省事。`,
        `资料标注如下：${protoPart}，${clientPart}。标注不等于实测，客户端版本太旧也会不兼容，报错先升级再排查。`,
      ]),
    });
  }

  // ---- 节点地区 ----
  if (regions.length > 0) {
    const regionText = regions.join('、');
    items.push({
      q: pick(slug, 4, [`${name}的节点开在哪些地区？`, `想要特定地区的节点，${name}有吗？`, `${name}的节点覆盖哪些地方？`]),
      a: pick(slug, 14, [
        `节点地区栏写到：${regionText}。服务商随时可能增减节点，最终能选哪些，要看订阅更新后客户端里实际出现的列表。`,
        `资料提到的节点地区有${regionText}。如果你要访问有地区限制的服务，请先确认订阅里确有对应节点，宣传页上的说法不算数。`,
        `地区信息登记为${regionText}，属于获取资料当天的快照。节点列表后来有没有变，以你手里的订阅为准。`,
      ]),
    });
  }

  // ---- 设备数 ----
  let devicesItem: QA | null = null;
  if (typeof vendor.devices === 'number') {
    devicesItem = {
      q: pick(slug, 5, [`${name}能几台设备一起登录？`, `${name}的设备数上限是多少？`, `手机电脑一起用，${name}够吗？`]),
      a: pick(slug, 15, [
        `设备栏登记的上限是 ${vendor.devices} 台。至于怎么计数，是按同时在线的连接还是按出口地址，每家口径不同，请看官网套餐页或直接问客服。`,
        `资料写明可同时在线 ${vendor.devices} 台设备。手机、电脑、平板一起上之前，先弄懂对方怎么算设备，免得半夜被判超限断线。`,
        `按档案，设备上限是 ${vendor.devices} 台。实际规定以官网套餐说明为准，设备多的用户下单前最好先问清算法。`,
      ]),
    };
    items.push(devicesItem);
  }

  // ---- 速度、稳定性、解锁：没有测试记录就写实时检测中 ----
  items.push({
    q: pick(slug, 6, [`${name}的速度和稳定性怎么样？`, `${name}晚高峰表现如何？`, `${name}能解锁流媒体和 AI 工具吗？`]),
    a:
      testCount > 0
        ? pick(slug, 16, [
            `机场牛手里有 ${testCount} 条这家的测试记录，但单条记录代表不了长期表现，要结合测试时间和网络环境来读。流媒体和 AI 工具的可用性同样会变，下单前建议自己复核。`,
            `这家目前登记了 ${testCount} 条测试记录。速度和稳定性只对测试当时有效，晚高峰、换网络都可能不一样，解锁结果更是天天在变，请当参考而不是承诺。`,
            `测试记录有 ${testCount} 条，读的时候先看日期和环境，再看结论。速度、稳定性、解锁都是动态结果，机场牛不会据此给任何长期保证。`,
          ])
        : pick(slug, 16, [
            `这一项机场牛写的是实时检测中：目前没有这家的测试记录，所以不给速度和稳定性的结论，也不转抄任何带数字的截图。想判断，请自己月付试一轮，分时段记录。`,
            `实话实说：晚高峰、稳定性、流媒体和 AI 工具可用性这几项，机场牛手里没有测试记录，统一标注实时检测中。没有时间、没有环境说明的好评截图，别信。`,
            `没有记录就不下结论。这家的速度、稳定性、解锁表现目前都是实时检测中，机场牛不拿猜测凑数。要验证，就用自己的网络、固定节点、固定时段测几天。`,
          ]),
  });

  // ---- 资料来源 ----
  const noteText = noteCount > 0 ? `另有 ${noteCount} 条第三方说法可以对照` : '暂时没有第三方说法可以对照';
  items.push({
    q: pick(slug, 7, [`${name}这页的资料是谁说的？`, `${name}的价格和线路资料从哪来？`, `${name}的档案可信吗？依据是什么？`]),
    a: pick(slug, 17, [
      `来源栏登记的类型是「${sourceLabel}」，${noteText}。机场牛把官方说法、第三方转述、编辑判断各记各的，就是要让你看得出哪句话谁说的；转述归转述，不会被写成官方结论。`,
      `这页的价格、线路这类字段，出处主要是${sourceLabel}，${noteText}。只有一个来源，和多个来源互相对得上，在榜单里是两种待遇，没核实的内容不会被写成定论。`,
      `出处写的是：${sourceLabel}；${noteText}。查不到就留白，不拿猜测填格子，这是机场牛写档案的底线。`,
    ]),
  });

  // ---- 状态与核对日期 ----
  const watchNote = status === 'watch' ? '观察中表示资料里有对不上或待核实的地方，机场牛先不下结论，下单前建议多核对一步。' : '';
  items.push({
    q: pick(slug, 8, [`${name}现在还在运营吗？资料是哪天核对的？`, `${name}的状态是什么？资料新不新？`, `${name}这页资料更新到哪天了？`]),
    a: pick(slug, 18, [
      `状态栏登记的是「${statusLabel}」，资料核对日期为 ${verifiedOn}。${watchNote}这个日期之后发生了什么，机场牛看不到，付款前请以官网为准。`,
      `状态栏写着「${statusLabel}」，对应的核对日是 ${verifiedOn}。${watchNote}这是一次性核对，不是实时监控，想知道今天的情况，官网和客服更靠谱。`,
      `登记状态：${statusLabel}，核对日期：${verifiedOn}。${watchNote}资料会随更新记录调整，别把这个日期当成实时状态。`,
    ]),
  });

  // ---- 资料缺口：条数还有富余时，把空白项直接点出来（放在最前面，先说结论） ----
  const missing: string[] = [];
  if (!hasPricing) missing.push('价格');
  if (routes.length === 0) missing.push('线路类型');
  if (protocols.length === 0) missing.push('协议');
  if (regions.length === 0) missing.push('节点地区');
  if (clients.length === 0) missing.push('客户端支持');
  if (missing.length > 0 && items.length < MAX_ITEMS) {
    const missingText = missing.join('、');
    items.unshift({
      q: pick(slug, 9, [`${name}这页还缺哪几块资料？`, `${name}的资料齐不齐，缺口在哪？`, `看${name}之前，先知道哪些信息是空白`]),
      a: pick(slug, 19, [
        `直说：${missingText}这几项目前没有可核实的资料，档案里就留白，机场牛不拿猜测填格子。缺口多，意味着下单前要多问客服、多看官网，别指望这一页替你把风险都挡住。`,
        `资料缺口在这里：${missingText}。这些栏目找不到来源，机场牛宁可空着也不编。空白项越多，你越要在付款前自己向官网或客服核实，先问清楚再下单。`,
        `没有来源的内容机场牛不写，所以${missingText}目前是空白。空白不等于不好，只代表没法核对；想用的话，先到官网或客服那里把这几项逐个问清。`,
      ]),
    });
  }

  // 超过上限时，先舍掉设备数这一问（目前没有品牌填了这个字段）
  const trimmed = items.length > MAX_ITEMS && devicesItem ? items.filter((item) => item !== devicesItem) : items;
  return trimmed.slice(0, MAX_ITEMS);
}

export function buildProductJsonLd(provider: ProviderEntry, url: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: provider.data.name,
    description,
    url,
    category: '机场（代理订阅服务）',
    brand: { '@type': 'Brand', name: provider.data.name },
  };
}
