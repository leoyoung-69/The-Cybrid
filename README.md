# Cybrid Lab

> Cyber minds at the frontiers of finance, tech, and AI. Creating. Building. Writing what we learn.

Personal blog and research notebook built with Astro, deployed on Cloudflare Pages.

🚧 **Under active development** — content is still being written.

## Features

- **Blog & Research** — two separate content collections (`/blog`, `/research`) with shared post layout
- **Reading experience** — table of contents, reading time, prev/next navigation, code copy buttons with language badges
- **Search** — client-side full-text search via [Pagefind](https://pagefind.app/) (zero-JS until used)
- **View counter** — per-post views stored in Cloudflare D1
- **Newsletter signup** — emails stored in D1 with honeypot spam protection (confirmation emails via Resend planned — see [docs/newsletter-resend-setup.md](docs/newsletter-resend-setup.md))
- **Dark mode** — class-based toggle, respects system preference, persists via localStorage
- **SEO** — Open Graph / Twitter cards, JSON-LD, sitemap, RSS feed covering both collections

## Tech Stack

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | [Astro 5](https://astro.build/) (static + SSR API routes) |
| Styling    | [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite` |
| Content    | Markdown / MDX with Astro Content Layer             |
| Backend    | Cloudflare Pages Functions + D1 (SQLite)            |
| Search     | Pagefind (build-time index)                         |
| Deployment | Cloudflare Pages (auto-deploy from `main`)          |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Local development (static site only)

```bash
npm install
npm run dev
```

Open http://localhost:4321. The view counter and newsletter form degrade gracefully without a database.

### Local development (with D1 backend)

```bash
# One-time: create the database and note the returned database_id
npx wrangler d1 create cybrid-lab
# → paste the database_id into wrangler.toml

# One-time: apply the schema locally
npx wrangler d1 execute cybrid-lab --local --file=./schema.sql

npm run dev
```

The Cloudflare adapter's `platformProxy` exposes the local D1 binding to the dev server automatically.

## Writing Content

```bash
node new-post.mjs "My Post Title"              # blog post (draft)
node new-post.mjs --research "My Research Note" # research note (draft)
```

Posts are created under `src/content/blog/` or `src/content/research/` with `draft: true`. Set `draft: false` to publish.

### Publishing HTML briefings

Self-contained HTML reports (e.g., automated financial briefings) are served
verbatim and listed at `/research/briefings`:

```bash
node scripts/add-briefing.mjs path/to/2026-07-02-financial-briefing.html  # single file
node scripts/add-briefing.mjs path/to/briefings-folder                    # all .html in a folder
```

Files land in `public/research/briefings/` and keep their own styling. The
listing page reads the date from the `YYYY-MM-DD` filename prefix and the title
from the file's `<title>` tag.

**Frontmatter fields:** `title`, `description`, `date`, `category`, `tags` (required); `updatedDate`, `draft`, `image`, `imageAlt`, `readingTime` (optional — reading time is auto-computed if omitted).

## Scripts

| Command                       | What it does                                  |
| ----------------------------- | --------------------------------------------- |
| `npm run dev`                 | Start dev server                              |
| `npm run build`               | Production build + Pagefind search indexing   |
| `npm run preview`             | Preview the production build                  |
| `node new-post.mjs "Title"`   | Scaffold a new post                           |
| `node scripts/add-briefing.mjs <path>` | Publish an HTML briefing to `/research/briefings` |
| `node scripts/export-logo.mjs`| Regenerate PNG logos from the SVG mark        |
| `node scripts/generate-og.mjs`| Regenerate the default Open Graph image       |

## Deployment (Cloudflare Pages)

1. Push to GitHub — Pages auto-deploys `main`
2. Build command: `npm run build` · Output directory: `dist` · Env var: `NODE_VERSION=20`
3. Bind the D1 database: Pages → Settings → Functions → D1 bindings → `DB` → `cybrid-lab`
4. Apply the schema to production: `npx wrangler d1 execute cybrid-lab --file=./schema.sql --remote`
5. Redeploy so Functions pick up the binding

## Project Structure

```
src/
├── components/     # Reusable Astro components
├── content/
│   ├── blog/       # Blog posts (Markdown/MDX)
│   └── research/   # Research notes (Markdown/MDX)
├── layouts/        # BaseLayout, PostLayout
├── pages/
│   ├── api/        # SSR endpoints (views, newsletter)
│   ├── blog/       # Blog index + post pages
│   └── research/   # Research index + note pages
└── styles/         # Tailwind v4 global styles
public/             # Static assets (favicon, logo, OG image, headers)
scripts/            # Logo / OG image generation
schema.sql          # D1 schema (post_views, newsletter_subscribers)
```
