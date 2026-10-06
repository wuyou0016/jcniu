// 全站审计：node scripts/audit-dist.mjs
// 对 dist/ 里的每个页面检查：title/description 长度与重复、H1 数量、canonical、JSON-LD 可解析、
// 内链死链、图片 alt、FAQPage 与可见文字一致、sitemap 覆盖。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const BASE = 'https://jcniu.com';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const pages = walk(dist).filter((f) => f.endsWith('index.html') || f.endsWith('404.html'));
const toRoute = (f) => {
  const rel = path.relative(dist, path.dirname(f)).replace(/\\/g, '/');
  return rel ? `/${rel}/` : '/';
};
const routeSet = new Set(pages.map(toRoute));
const problems = [];
const titles = new Map();
const descs = new Map();
const stats = { pages: pages.length, jsonld: 0, links: 0 };

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const textOf = (html) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '')).replace(/\s+/g, '');
const norm = (s) => s.replace(/\s+/g, '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

for (const f of pages) {
  const route = toRoute(f);
  const html = fs.readFileSync(f, 'utf8');
  const is404 = f.endsWith('404.html');
  if (is404) continue;

  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? '');
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1] ?? '');
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) ?? [])[1] ?? '';
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;

  if (!title) problems.push(`${route}: 缺 title`);
  if (title.length > 66) problems.push(`${route}: title 过长 ${title.length}`);
  if (route !== '/' && title.length < 14) problems.push(`${route}: title 过短 ${title.length}`);
  if (!desc) problems.push(`${route}: 缺 description`);
  else {
    if (desc.length > 155) problems.push(`${route}: description 过长 ${desc.length}（Bing 上限约 160）`);
    if (desc.length < 60) problems.push(`${route}: description 过短 ${desc.length}`);
  }
  if (canonical !== `${BASE}${route}`) problems.push(`${route}: canonical 不符 ${canonical}`);
  if (h1s !== 1) problems.push(`${route}: H1 数量 ${h1s}`);
  titles.set(title, [...(titles.get(title) ?? []), route]);
  if (desc) descs.set(desc, [...(descs.get(desc) ?? []), route]);

  // JSON-LD
  const visible = norm(textOf(html));
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    stats.jsonld++;
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch (e) {
      problems.push(`${route}: JSON-LD 无法解析`);
      continue;
    }
    if (data['@type'] === 'FAQPage') {
      for (const q of data.mainEntity) {
        if (!visible.includes(norm(q.name)) || !visible.includes(norm(q.acceptedAnswer.text))) problems.push(`${route}: FAQPage 文字与页面可见内容不一致：${q.name}`);
      }
    }
    if (data['@type'] === 'Product' && ('offers' in data || 'aggregateRating' in data || 'review' in data)) problems.push(`${route}: Product 含禁用字段`);
  }
  const faqCount = (html.match(/"@type":"FAQPage"/g) ?? []).length;
  if (faqCount > 1) problems.push(`${route}: FAQPage 重复 ${faqCount}`);

  // 内链
  for (const m of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#|\/\/)/.test(href) || /['+]/.test(href)) continue;
    stats.links++;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    if (!routeSet.has(clean) && !fs.existsSync(path.join(dist, clean.replace(/^\//, '')))) problems.push(`${route}: 死链 ${href}`);
  }
  // 图片 alt
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) problems.push(`${route}: img 缺 alt`);
  // 外链 rel
  for (const m of html.matchAll(/<a [^>]*href="(https?:\/\/[^"]+)"[^>]*>/g)) {
    const tag = m[0];
    if (!/jcniu\.com/.test(m[1]) && !/rel="[^"]*noopener/.test(tag)) problems.push(`${route}: 外链缺 rel=noopener ${m[1]}`);
  }
  // 品牌官网链接必须带 nofollow sponsored
  for (const m of html.matchAll(/<a [^>]*href="(https:\/\/[^"]*(?:aff|#\/\?code=)[^"]*)"[^>]*>/g)) {
    if (!/nofollow/.test(m[0]) || !/sponsored/.test(m[0])) problems.push(`${route}: 推广链接缺 nofollow sponsored`);
  }
}

for (const [t, rs] of titles) if (rs.length > 1) problems.push(`重复 title「${t.slice(0, 30)}」：${rs.join(' ')}`);
for (const [d, rs] of descs) if (rs.length > 1) problems.push(`重复 description「${d.slice(0, 30)}」：${rs.join(' ')}`);

// sitemap 覆盖
const sm = fs.readFileSync(path.join(dist, 'sitemap-0.xml'), 'utf8');
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const expected = [...routeSet].filter((r) => r !== '/404/');
for (const r of expected) if (!urls.includes(`${BASE}${r}`)) problems.push(`sitemap 缺 ${r}`);
stats.sitemapUrls = urls.length;

// 无忧链接铁律
const w = fs.readFileSync(path.join(dist, 'airports/wuyou-lianjie/index.html'), 'utf8');
if (!w.includes('https://vip02.worryfreeaff.com/#/?code=XT1WDPvr')) problems.push('无忧链接官网跳转地址缺失或被改');
if (/¥79\/年/.test(textOf(w))) problems.push('无忧链接页出现 ¥79/年');
const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!/badge--gold/.test(home)) problems.push('首页缺少金色徽章');
if ((fs.readFileSync(path.join(dist, 'index.html'), 'utf8').match(/t\.me\/wyolink/g) ?? []).length !== 1) problems.push('页脚 Telegram 链接数量不是 1');

console.log(JSON.stringify(stats));
console.log(`problems=${problems.length}`);
for (const p of problems.slice(0, 60)) console.log(' -', p);
process.exit(problems.length ? 1 : 0);
