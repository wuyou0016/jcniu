// 构建后处理：Markdown 正文里的外链（如官方 GitHub 仓库）统一补 rel="noopener nofollow" 与新窗口打开。
// Astro 7 默认使用 Sätteri 渲染 Markdown，不支持旧的 rehype 插件，所以放在构建之后做。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
let patched = 0;
for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const out = html.replace(/<a ([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/g, (tag, before, href, after) => {
    if (href.startsWith('https://jcniu.com')) return tag;
    const attrs = `${before}${after}`;
    if (/\brel=/.test(attrs)) return tag;
    patched++;
    return `<a ${before}href="${href}"${after} rel="noopener nofollow" target="_blank">`;
  });
  if (out !== html) fs.writeFileSync(file, out);
}
console.log(`postbuild: patched ${patched} external links`);
