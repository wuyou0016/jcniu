// 部署后手动运行：node scripts/indexnow.mjs
// 把 dist/sitemap-0.xml 里的全部 URL 一次性提交给 IndexNow（Bing/Yandex 等共用）。
// key 文件已在 public/0175f9ea32311ab38b30219e61520f7b.txt（全站群统一）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = 'jcniu.com';
const key = '0175f9ea32311ab38b30219e61520f7b';
const sitemap = fs.readFileSync(path.join(root, 'dist/sitemap-0.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} URLs -> HTTP ${res.status}`);
