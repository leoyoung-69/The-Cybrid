import type { APIRoute } from 'astro';

export const prerender = false;

type D1 = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => { run: () => Promise<unknown> };
  };
};

function getDB(locals: App.Locals): D1 | null {
  // @ts-expect-error - runtime env is provided by the Cloudflare adapter
  return locals?.runtime?.env?.DB ?? null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, locals }) => {
  let body: { email?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 });
  }

  // Honeypot: real users leave this hidden field empty. Pretend success for bots.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return new Response(JSON.stringify({ error: 'invalid email' }), { status: 400 });
  }

  const db = getDB(locals);
  if (!db) {
    // No DB available (e.g., dev without D1 binding). Succeed silently.
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const now = Date.now();
  await db
    .prepare(
      `INSERT OR IGNORE INTO newsletter_subscribers (email, confirmed, confirm_token, created_at)
       VALUES (?, 0, NULL, ?)`
    )
    .bind(email, now)
    .run();

  // TODO: When Resend is configured, generate a confirm_token and send a
  // confirmation email here. See docs/newsletter-resend-setup.md.

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
