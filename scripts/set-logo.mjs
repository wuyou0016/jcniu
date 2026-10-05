// 用法：node scripts/set-logo.mjs A|B|C|E
// 把 public/logo-options 里选中的数码牛方案设为站标，并重新生成 favicon 与 OG 图。
import { copyFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pick = (process.argv[2] ?? '').toUpperCase();
const file = readdirSync(path.join(root, 'public/logo-options')).find((f) => f.startsWith(`${pick}-`) && f.endsWith('.svg'));
if (!file) {
  console.error('用法：node scripts/set-logo.mjs A|B|C|E');
  process.exit(1);
}
copyFileSync(path.join(root, 'public/logo-options', file), path.join(root, 'public/favicon.svg'));
execSync('node scripts/generate-favicons.mjs && node scripts/generate-og.mjs', { cwd: root, stdio: 'inherit' });
console.log(`logo -> ${file}`);
