# Newsletter: Enabling Resend Confirmation Emails

The newsletter API (`src/pages/api/newsletter.ts`) currently stores email
addresses in D1 as **unconfirmed** (`confirmed = 0`). No confirmation email is
sent. To enable the full double opt-in flow, follow the steps below.

## 1. Create a Resend account

1. Sign up at <https://resend.com>
2. Verify your sending domain (or use the Resend sandbox for testing)
3. Create an API key from the dashboard

## 2. Install the SDK

```bash
npm install resend
```

## 3. Store the API key

**Production** (Cloudflare Pages):
- Dashboard → your project → Settings → Environment Variables
- Add `RESEND_API_KEY` as a **secret** (production environment)

**Local development:**
- Create `.dev.vars` in the project root (already gitignored):
  ```
  RESEND_API_KEY=re_your_key_here
  ```

## 4. Update the newsletter API

Replace the `TODO` block in `src/pages/api/newsletter.ts` with:

```ts
import { Resend } from 'resend';

// inside POST handler, after the INSERT:
const confirmToken = crypto.randomUUID();
await db
  .prepare(`UPDATE newsletter_subscribers SET confirm_token = ? WHERE email = ?`)
  .bind(confirmToken, email)
  .run();

const resendKey = locals?.runtime?.env?.RESEND_API_KEY;
if (resendKey) {
  const resend = new Resend(resendKey);
  const confirmUrl = `${new URL(request.url).origin}/api/newsletter/confirm?token=${confirmToken}`;
  await resend.emails.send({
    from: 'Cybrid Lab <hello@yourdomain.com>',
    to: email,
    subject: 'Confirm your Cybrid Lab subscription',
    text: `Click to confirm your subscription: ${confirmUrl}`,
  });
}
```

## 5. Add the confirm endpoint

Create `src/pages/api/newsletter/confirm.ts`:

```ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const token = url.searchParams.get('token');
  if (!token) return new Response('Missing token', { status: 400 });

  // @ts-expect-error
  const db = locals?.runtime?.env?.DB;
  if (!db) return new Response('DB unavailable', { status: 500 });

  await db
    .prepare(`UPDATE newsletter_subscribers SET confirmed = 1, confirm_token = NULL WHERE confirm_token = ?`)
    .bind(token)
    .run();

  return redirect('/newsletter-confirmed');
};
```

## 6. Add the thank-you page

Create `src/pages/newsletter-confirmed.astro`:

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
---
<BaseLayout title="Subscription Confirmed | Cybrid Lab">
  <div class="space-y-4">
    <h1 class="text-3xl font-bold">You're in!</h1>
    <p class="text-(--color-text-secondary)">
      Thanks for subscribing. You'll get new posts in your inbox.
    </p>
  </div>
</BaseLayout>
```

## 7. Update the form message

In `src/components/NewsletterForm.astro`, change the success status from
"We'll be in touch." to "Check your email to confirm your subscription."

## 8. (Optional) Backfill pending subscribers

If emails collected before Resend was enabled should receive a confirmation
email now, write a one-off script that reads all rows with `confirmed = 0 AND
confirm_token IS NULL`, generates tokens, and sends confirmation emails in
batches (respecting Resend rate limits — free tier is 100/day).
