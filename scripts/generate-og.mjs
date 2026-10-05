import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(dir, '..', 'public');
mkdirSync(path.join(publicDir, 'images/og'), { recursive: true });
const icon = `<g fill="none">${readFileSync(path.join(publicDir, 'favicon.svg')).toString().replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>`;

const tiers = [
  ['夯', '#e8421e', '#fff'],
  ['顶级', '#f08a24', '#17120d'],
  ['人上人', '#f5c518', '#17120d'],
  ['NPC', '#5aa469', '#0e2a14'],
  ['拉', '#7b8794', '#fff'],
];
const font = "PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif";
const rows = tiers
  .map(([label, bg, fg], i) => {
    const y = 330 + i * 52;
    const w = 520 - i * 70;
    return `<rect x="70" y="${y}" width="150" height="46" fill="${bg}" stroke="#17120d" stroke-width="3"/>
      <text x="145" y="${y + 33}" text-anchor="middle" font-size="28" font-weight="900" fill="${fg}" font-family="${font}">${label}</text>
      <rect x="220" y="${y}" width="${w}" height="46" fill="#fffaf0" stroke="#17120d" stroke-width="3"/>`;
  })
  .join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6f0e2"/>
  <rect x="0" y="0" width="1200" height="14" fill="#17120d"/>
  <g transform="translate(70,60) scale(2.2)">${icon}</g>
  <text x="240" y="128" font-size="84" font-weight="900" fill="#17120d" font-family="${font}">机场牛</text>
  <text x="242" y="185" font-size="34" font-weight="700" fill="#5f5647" font-family="${font}">2026 机场推荐排行榜 · 从夯到拉一次看完</text>
  <text x="70" y="290" font-size="30" font-weight="800" fill="#17120d" font-family="${font}">便宜机场 · 专线机场 · Clash · 优惠码 · 跑路预警</text>
  ${rows}
  <g transform="translate(850,330)">
    <rect x="4" y="4" width="280" height="240" fill="#17120d"/>
    <rect x="0" y="0" width="280" height="240" fill="#f5c518" stroke="#17120d" stroke-width="3"/>
    <text x="140" y="110" text-anchor="middle" font-size="120" font-weight="900" fill="#e8421e" font-family="${font}">夯</text>
    <text x="140" y="165" text-anchor="middle" font-size="30" font-weight="900" fill="#17120d" font-family="${font}">综合第一名</text>
    <text x="140" y="205" text-anchor="middle" font-size="22" font-weight="700" fill="#17120d" font-family="${font}">jcniu.com</text>
  </g>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile(path.join(publicDir, 'images/og/default.png'));
console.log('og generated');
