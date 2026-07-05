import sharp from 'sharp';
import { join } from 'node:path';

const W = 1200;
const H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0f172a"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#334155" stroke-width="2" rx="16"/>
  <g transform="translate(120, 215) scale(6.25)" fill="none">
    <path d="M24 8a10 10 0 1 0 0 16" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
    <circle cx="24" cy="8" r="2.5" fill="#cbd5e1"/>
    <circle cx="24" cy="24" r="2.5" fill="#cbd5e1"/>
  </g>
  <text x="360" y="330" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="bold" fill="#f1f5f9">Cybrid Lab</text>
  <text x="364" y="400" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#94a3b8">Cyber minds at the frontiers of finance, tech, and AI</text>
</svg>`;

const out = join(process.cwd(), 'public', 'og-default.jpg');
await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(out);
console.log(`wrote ${out}`);
