#!/usr/bin/env node
import { existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
let collection = 'blog';
const titleArgs = [];
for (const a of args) {
  if (a === '--research' || a === '-r') collection = 'research';
  else if (a === '--blog' || a === '-b') collection = 'blog';
  else titleArgs.push(a);
}
const title = titleArgs.join(' ');
if (!title) {
  console.error('Usage: node new-post.mjs [--blog|--research] "My Post Title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

if (!slug) {
  console.error('Title must contain alphanumeric characters.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const filePath = join(__dirname, 'src', 'content', collection, `${slug}.md`);

if (existsSync(filePath)) {
  console.error(`File already exists: ${filePath}`);
  process.exit(1);
}

const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: ""
date: ${today}
category: ${collection === 'research' ? 'research' : 'tech'}
tags: []
draft: true
---

<!-- Write your post here -->
`;

writeFileSync(filePath, frontmatter, 'utf8');
console.log(`Created: ${filePath}`);
