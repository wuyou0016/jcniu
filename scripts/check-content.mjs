// 内容校验：node scripts/check-content.mjs [slug ...]
// 校验 src/content/articles 与 src/content/glossary 里的文件是否符合 docs/content-plan.json 与写作规范。
// 不传参数 = 校验全部已存在的文件；传 slug = 只校验这几篇（文章或术语）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/content-plan.json'), 'utf8'));
const providers = JSON.parse(fs.readFileSync(path.join(root, 'src/data/providers/providers.json'), 'utf8'));

const BASE = { guide: '/guides/', client: '/clients/', knowledge: '/knowledge/', tutorial: '/tutorials/', troubleshooting: '/troubleshooting/', warning: '/warnings/' };
const planBySlug = new Map(plan.articles.map((a) => [a.slug, a]));
const glossarySlugs = new Set(plan.glossary.map((g) => g.slug));

const STATIC_PAGES = new Set([
  '/', '/rankings/', '/rankings/cheap/', '/rankings/best-value/', '/rankings/dedicated-line/', '/rankings/monthly/', '/rankings/stable/',
  '/airports/', '/compare/', '/coupons/', '/airport-warnings/', '/free-airport/', '/about/', '/faq/', '/tag/', '/glossary/', '/tools/',
  '/tools/cost-calculator/', '/tools/client-picker/', '/tools/airport-checklist/', '/guides/', '/clients/', '/knowledge/', '/tutorials/',
  '/troubleshooting/', '/warnings/', '/changelog/', '/privacy/',
]);
for (const p of providers) STATIC_PAGES.add(`/airports/${p.slug}/`);
for (const a of plan.articles) STATIC_PAGES.add(a.href);
for (const g of plan.glossary) STATIC_PAGES.add(`/glossary/${g.slug}/`);

const brandNames = providers.flatMap((p) => [p.name, ...(p.aliases ?? [])]).filter((n) => n.length >= 2);
const BANNED_UNQUOTED = ['最稳', '最快', '最好用', '秒开', '永不掉线', '100%', '绝对', '保证', '官方认证', '我们实测', '本站实测', '实测显示', '实测速度', '实测数据', '亲测'];
const ALLOWED_EXTERNAL = /^https:\/\/github\.com\/(clash-verge-rev\/clash-verge-rev|MetaCubeX\/mihomo|mihomo-party-org\/mihomo-party|2dust\/v2rayN|2dust\/v2rayNG|SagerNet\/sing-box|chen08209\/FlClash)/;

function splitFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { fm: yaml.load(m[1]), body: m[2] };
}
const strip = (s) => s.replace(/\s+/g, '');
const stripQuoted = (s) => s.replace(/“[^”]*”|「[^」]*」|"[^"]*"/g, '');

const errors = [];
const warnings = [];
let checked = 0;
const RICH = process.argv.includes('--rich');
const only = new Set(process.argv.slice(2).filter((a) => !a.startsWith('--')));

function err(file, msg) { errors.push(`${file}: ${msg}`); }
function warn(file, msg) { warnings.push(`${file}: ${msg}`); }

function linksIn(body) {
  const out = [];
  for (const m of body.matchAll(/\]\(([^)\s]+)\)/g)) out.push(m[1]);
  for (const m of body.matchAll(/href="([^"]+)"/g)) out.push(m[1]);
  return out;
}

function checkArticle(file) {
  const slug = path.basename(file, '.md');
  const spec = planBySlug.get(slug);
  const rel = `articles/${slug}.md`;
  if (!spec) return err(rel, '不在 content-plan.json 里（slug 必须来自计划）');
  const parsed = splitFrontmatter(fs.readFileSync(file, 'utf8'));
  if (!parsed) return err(rel, 'frontmatter 解析失败');
  const { fm, body } = parsed;
  checked++;

  for (const k of ['type', 'title', 'description', 'category', 'primaryKeyword', 'publishedAt', 'updatedAt', 'rankBlock']) {
    if (fm[k] === undefined || fm[k] === null || fm[k] === '') err(rel, `缺少 frontmatter 字段 ${k}`);
  }
  if (fm.type !== spec.type) err(rel, `type 应为 ${spec.type}`);
  if (fm.title !== spec.title) err(rel, `title 必须与计划一致：${spec.title}`);
  if (fm.primaryKeyword !== spec.primaryKeyword) err(rel, `primaryKeyword 必须是 ${spec.primaryKeyword}`);
  if (fm.rankBlock !== spec.rankBlock) err(rel, `rankBlock 必须是 ${spec.rankBlock}`);
  if (fm.category !== spec.category) err(rel, `category 必须是 ${spec.category}`);
  if (fm.difficulty !== spec.difficulty) warn(rel, `difficulty 建议为 ${spec.difficulty}`);
  const sec = fm.secondaryKeywords ?? [];
  for (const k of spec.secondaryKeywords) if (!sec.includes(k)) err(rel, `secondaryKeywords 缺少 ${k}`);

  const desc = fm.description ?? '';
  if (desc.length < 100 || desc.length > 155) err(rel, `description 长度 ${desc.length}，应在 100–155 字`);
  if (!desc.includes(spec.primaryKeyword)) err(rel, 'description 必须包含主关键词');
  const kwHit = [spec.primaryKeyword, ...spec.secondaryKeywords].filter((k) => desc.toLowerCase().includes(k.toLowerCase())).length;
  if (kwHit < 3) err(rel, `description 只命中 ${kwHit} 个关键词（主+次），至少 3 个`);

  const flat = strip(body);
  const light = ['troubleshooting', 'warning'].includes(spec.type);
  const min = RICH ? (light ? 4000 : 4800) : light ? 1500 : 1800;
  if (flat.length < min) err(rel, `正文只有 ${flat.length} 字，至少 ${min}`);
  if (flat.length > (RICH ? 9500 : 7000)) err(rel, `正文 ${flat.length} 字过长（上限 ${RICH ? 9500 : 7000}）`);
  if (/^# /m.test(body)) err(rel, '正文里不要写 H1（标题由页面生成）');
  const h2 = (body.match(/^## /gm) ?? []).length;
  if (h2 < 4) err(rel, `H2 只有 ${h2} 个，至少 4 个`);
  if (!body.slice(0, 220).includes(spec.primaryKeyword)) err(rel, '前 220 字内必须出现主关键词');
  const occ = body.split(spec.primaryKeyword).length - 1;
  const density = (occ * spec.primaryKeyword.length) / flat.length;
  if (density > 0.03) err(rel, `主关键词密度 ${(density * 100).toFixed(1)}% 超过 3%，请用同义说法稀释`);
  if (occ < 3) warn(rel, `主关键词只出现 ${occ} 次`);
  const h2Texts = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  if (!h2Texts.some((t) => t.includes(spec.primaryKeyword) || spec.secondaryKeywords.some((k) => t.includes(k)))) {
    warn(rel, '没有任何 H2 含有主/次关键词');
  }

  // 禁用词与品牌名
  const unquoted = stripQuoted(body);
  for (const w of BANNED_UNQUOTED) if (unquoted.includes(w)) err(rel, `出现禁用表述“${w}”（只能出现在引号里作为被拆解的宣传话术）`);
  for (const n of brandNames) if (body.includes(n) || (fm.faqs ?? []).some((f) => `${f.q}${f.a}`.includes(n))) err(rel, `正文/FAQ 里不能出现品牌名“${n}”（品牌信息只通过页面数据块展示）`);

  // 链接
  const links = linksIn(body);
  const seen = new Set();
  for (const l of links) {
    if (l.startsWith('http')) {
      if (!ALLOWED_EXTERNAL.test(l)) err(rel, `不允许的外链：${l}`);
      continue;
    }
    const clean = l.split('#')[0];
    if (!clean) continue;
    if (!STATIC_PAGES.has(clean)) err(rel, `内链指向不存在的页面：${l}`);
    seen.add(clean);
  }
  const wanted = spec.links.map((s) => plan.aliases[s] ?? planBySlug.get(s)?.href).filter(Boolean);
  const hit = wanted.filter((h) => seen.has(h)).length;
  if (hit < Math.min(3, wanted.length)) err(rel, `计划内链至少要链到 ${Math.min(3, wanted.length)} 个，目前 ${hit}：${wanted.join(' ')}`);
  if (![...seen].some((h) => h.startsWith('/rankings/') || h === '/airports/' || h === '/compare/')) err(rel, '至少链接一个榜单或机场库页面（/rankings/… /compare/ /airports/）');
  if (seen.size < 4) err(rel, `内链只有 ${seen.size} 个不同页面，至少 4 个`);
  if ([...seen].some((h) => h === spec.href)) err(rel, '不要链接到自己');
  for (const l of links) if (/^\/[^#]*[^/#]$/.test(l) && l !== '/') err(rel, `内链必须以 / 结尾：${l}`);

  // FAQ
  const faqs = fm.faqs ?? [];
  if (faqs.length < (RICH ? 4 : 3) || faqs.length > 6) err(rel, `faqs 需要 ${RICH ? 4 : 3}–6 条，目前 ${faqs.length}`);
  for (const f of faqs) {
    if (!f.q || !f.a) { err(rel, 'faq 缺 q 或 a'); continue; }
    if (f.a.length < 50 || f.a.length > 320) err(rel, `faq 答案长度 ${f.a.length}（50–320）：${f.q}`);
    if (/[\n<>*`]|\]\(/.test(f.a) || /[<>*`]/.test(f.q)) err(rel, `faq 必须是纯文本（无 markdown/换行/HTML）：${f.q}`);
  }
  const qs = faqs.map((f) => f.q);
  if (new Set(qs).size !== qs.length) err(rel, 'faq 问题重复');

  // 空洞/模板痕迹
  if (/\bTODO\b|待补充|此处省略|lorem/i.test(body)) err(rel, '含占位文字');
  const paras = body.split(/\n\n+/).map((p) => strip(p)).filter((p) => p.length > 40);
  if (new Set(paras).size !== paras.length) err(rel, '有重复段落');
}

function checkGlossary(file) {
  const slug = path.basename(file, '.md');
  const rel = `glossary/${slug}.md`;
  if (!glossarySlugs.has(slug)) return err(rel, '不在 content-plan.json 的术语列表里');
  const parsed = splitFrontmatter(fs.readFileSync(file, 'utf8'));
  if (!parsed) return err(rel, 'frontmatter 解析失败');
  checked++;
  const { fm, body } = parsed;
  const spec = plan.glossary.find((g) => g.slug === slug);
  if (fm.term !== spec.term) err(rel, `term 必须是 ${spec.term}`);
  if (!fm.definition || fm.definition.length < 15 || fm.definition.length > 90) err(rel, 'definition 15–90 字，一句话说清');
  if (!fm.extendedExplanation || fm.extendedExplanation.length < 60) err(rel, 'extendedExplanation 至少 60 字');
  if (!fm.updatedAt) err(rel, '缺 updatedAt');
  const flat = strip(body);
  if (flat.length < 500) err(rel, `正文只有 ${flat.length} 字，至少 500`);
  if (flat.length > 2500) err(rel, `正文 ${flat.length} 字过长（上限 2500）`);
  if ((body.match(/^## /gm) ?? []).length < 3) err(rel, 'H2 至少 3 个');
  for (const t of fm.relatedTerms ?? []) if (!glossarySlugs.has(t)) err(rel, `relatedTerms 里不存在：${t}`);
  for (const a of fm.relatedArticles ?? []) if (!planBySlug.has(a)) err(rel, `relatedArticles 里不存在：${a}`);
  if ((fm.relatedTerms ?? []).length < 2) err(rel, 'relatedTerms 至少 2 个');
  if ((fm.relatedArticles ?? []).length < 2) err(rel, 'relatedArticles 至少 2 个');
  const unquoted = stripQuoted(body);
  for (const w of BANNED_UNQUOTED) if (unquoted.includes(w)) err(rel, `出现禁用表述“${w}”`);
  for (const n of brandNames) if (body.includes(n)) err(rel, `不能出现品牌名“${n}”`);
  for (const l of linksIn(body)) {
    const clean = l.split('#')[0];
    if (l.startsWith('http')) { if (!ALLOWED_EXTERNAL.test(l)) err(rel, `不允许的外链：${l}`); continue; }
    if (clean && !STATIC_PAGES.has(clean)) err(rel, `内链指向不存在的页面：${l}`);
  }
}

for (const [dir, fn] of [['articles', checkArticle], ['glossary', checkGlossary]]) {
  const full = path.join(root, 'src/content', dir);
  if (!fs.existsSync(full)) continue;
  for (const f of fs.readdirSync(full).filter((x) => x.endsWith('.md'))) {
    const slug = path.basename(f, '.md');
    if (only.size && !only.has(slug)) continue;
    fn(path.join(full, f));
  }
}

const missing = [];
if (!only.size) {
  for (const a of plan.articles) if (!fs.existsSync(path.join(root, 'src/content/articles', `${a.slug}.md`))) missing.push(a.slug);
  for (const g of plan.glossary) if (!fs.existsSync(path.join(root, 'src/content/glossary', `${g.slug}.md`))) missing.push(`glossary:${g.slug}`);
}
for (const w of warnings) console.log('warn ', w);
for (const e of errors) console.log('ERROR', e);
console.log(`checked ${checked} files, ${errors.length} errors, ${warnings.length} warnings${missing.length ? `, missing ${missing.length}` : ''}`);
if (missing.length && process.argv.includes('--list-missing')) console.log('missing:', missing.join(' '));
process.exit(errors.length ? 1 : 0);
