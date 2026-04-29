import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <path d="M24 8a10 10 0 1 0 0 16" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
  <circle cx="24" cy="8" r="2.5" fill="#475569"/>
  <circle cx="24" cy="24" r="2.5" fill="#475569"/>
</svg>`;

const outDir = join(process.cwd(), 'public', 'logo');
await mkdir(outDir, { recursive: true });

for (const size of [256, 512, 1024]) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(outDir, `cybrid-logo-${size}.png`));
  console.log(`wrote cybrid-logo-${size}.png`);
}
