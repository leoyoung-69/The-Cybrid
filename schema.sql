-- Cybrid Lab D1 schema
-- Run locally: npx wrangler d1 execute cybrid-lab --file=./schema.sql
-- Run on remote: npx wrangler d1 execute cybrid-lab --file=./schema.sql --remote

CREATE TABLE IF NOT EXISTS post_views (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email TEXT PRIMARY KEY,
  confirmed INTEGER NOT NULL DEFAULT 0,
  confirm_token TEXT,
  created_at INTEGER NOT NULL
);
