#!/usr/bin/env node
// Copies briefing HTML file(s) into public/research/briefings/ so they get
// published verbatim. Accepts a single .html file or a folder of them.
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/add-briefing.mjs <file.html | folder>');
  process.exit(1);
}

const destDir = join(process.cwd(), 'public', 'research', 'briefings');
mkdirSync(destDir, { recursive: true });

function copyOne(file) {
  copyFileSync(file, join(destDir, basename(file)));
  console.log(`added ${basename(file)}`);
}

if (statSync(src).isDirectory()) {
  const files = readdirSync(src).filter(f => extname(f).toLowerCase() === '.html');
  if (files.length === 0) {
    console.error(`No .html files found in ${src}`);
    process.exit(1);
  }
  files.forEach(f => copyOne(join(src, f)));
} else {
  copyOne(src);
}
