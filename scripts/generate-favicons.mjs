import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');
const svg = readFileSync(path.join(publicDir, 'favicon.svg'));

const targets = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon.ico', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-512.png', size: 512 },
];

for (const { file, size } of targets) {
  const outPath = path.join(publicDir, file);
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(outPath);
  console.log(`generated ${file} (${size}x${size}) -> ${outPath}`);
}
