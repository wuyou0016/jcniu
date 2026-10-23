// 官网可访问性检测：逐家请求 providers.json 里的官网入口，记录能否收到响应、状态码与耗时。
// 结果写入 src/data/live/monitor.json，并滚动保留最近 365 天的每日统计。
// 只证明"检测点当时能不能打开官网入口"，不代表节点可用，也不代表中国大陆网络下的情况。
// 用法：node scripts/monitor.mjs [检测点说明]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const providers = JSON.parse(fs.readFileSync(path.join(root, 'src/data/providers/providers.json'), 'utf8'));
const outFile = path.join(root, 'src/data/live/monitor.json');
const prev = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : { history: {} };
const vantage = process.argv[2] ?? process.env.MONITOR_VANTAGE ?? '海外检测点';
const now = new Date();
const day = now.toISOString().slice(0, 10);

async function probe(url) {
  const target = new URL(url);
  target.hash = '';
  const started = Date.now();
  try {
    const res = await fetch(target.origin + '/', {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; jcniu-monitor/1.0; +https://jcniu.com/)' },
    });
    const ms = Date.now() - started;
    // 2xx/3xx = 正常打开；401/403/429 = 服务器有响应但拦截了自动请求（记为"有响应"）；5xx = 服务器报错
    const state = res.status < 400 ? 'up' : res.status < 500 ? 'guarded' : 'error';
    return { state, status: res.status, ms };
  } catch (e) {
    return { state: 'down', status: 0, ms: Date.now() - started, error: String(e.cause?.code ?? e.name ?? e.message).slice(0, 40) };
  }
}

const results = [];
for (const p of providers) {
  const r = await probe(p.vendor.officialWebsite);
  results.push({ id: p.id, host: new URL(p.vendor.officialWebsite).hostname, ...r });
  console.log(`${p.id.padEnd(18)} ${r.state.padEnd(8)} ${String(r.status).padEnd(4)} ${r.ms}ms ${r.error ?? ''}`);
}

const history = prev.history ?? {};
for (const r of results) {
  const list = (history[r.id] ??= []);
  let today = list.find((d) => d.day === day);
  if (!today) {
    today = { day, checks: 0, reachable: 0 };
    list.push(today);
  }
  today.checks += 1;
  if (r.state === 'up' || r.state === 'guarded') today.reachable += 1;
  history[r.id] = list.filter((d) => (now - new Date(d.day)) / 86400000 <= 365);
}
const firstCheckedAt = prev.firstCheckedAt ?? now.toISOString();
fs.writeFileSync(outFile, JSON.stringify({ checkedAt: now.toISOString(), firstCheckedAt, vantage, results, history }, null, 2) + '\n');
console.log(`done: ${results.filter((r) => r.state === 'up').length} up, ${results.filter((r) => r.state === 'guarded').length} guarded, ${results.filter((r) => r.state === 'error').length} error, ${results.filter((r) => r.state === 'down').length} down`);
