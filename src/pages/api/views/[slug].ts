import type { APIRoute } from 'astro';

export const prerender = false;

type D1 = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => { first: <T = unknown>() => Promise<T | null>; run: () => Promise<unknown> };
  };
};

function getDB(locals: App.Locals): D1 | null {
  // @ts-expect-error - runtime env is provided by the Cloudflare adapter
  return locals?.runtime?.env?.DB ?? null;
}

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug;
  if (!slug) return new Response(JSON.stringify({ error: 'missing slug' }), { status: 400 });

  const db = getDB(locals);
  if (!db) return new Response(JSON.stringify({ views: 0 }), { status: 200 });

  const row = await db
    .prepare('SELECT views FROM post_views WHERE slug = ?')
    .bind(slug)
    .first<{ views: number }>();

  return new Response(JSON.stringify({ views: row?.views ?? 0 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ params, locals }) => {
  const slug = params.slug;
  if (!slug) return new Response(JSON.stringify({ error: 'missing slug' }), { status: 400 });

  const db = getDB(locals);
  if (!db) return new Response(JSON.stringify({ views: 0 }), { status: 200 });

  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO post_views (slug, views, updated_at) VALUES (?, 1, ?)
       ON CONFLICT(slug) DO UPDATE SET views = views + 1, updated_at = excluded.updated_at`
    )
    .bind(slug, now)
    .run();

  const row = await db
    .prepare('SELECT views FROM post_views WHERE slug = ?')
    .bind(slug)
    .first<{ views: number }>();

  return new Response(JSON.stringify({ views: row?.views ?? 1 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
