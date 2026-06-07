#!/usr/bin/env node
// Fetches the latest newsletter posts from Substack and writes them to
// public/posts.json. Runs at build time and on an hourly GitHub Actions cron,
// so the landing page reads a static file at runtime instead of depending on a
// proxy or edge function.

import { writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SUBSTACK_API = 'https://bayesiansapien.substack.com/api/v1/posts?limit=25';
const MAX_ARTICLES = 3;
const OUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'posts.json');

async function main() {
  const response = await fetch(SUBSTACK_API, {
    headers: {
      // Substack's CDN 403s the default Node/undici user-agent. A common
      // desktop browser UA gets through cleanly.
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      accept: 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Substack API responded ${response.status}`);
  }

  const items = await response.json();
  if (!Array.isArray(items)) {
    throw new Error('Unexpected Substack response shape');
  }

  const articles = items
    .filter((p) => p && p.type === 'newsletter')
    .slice(0, MAX_ARTICLES)
    .map((p) => ({
      title: p.title,
      link: p.canonical_url,
      date: p.post_date,
      description: p.description || p.subtitle || '',
      thumbnail: p.cover_image || p.cover_image_url || null
    }));

  if (articles.length === 0) {
    throw new Error('No newsletter articles in the latest 25 Substack items');
  }

  const payload = { generated_at: new Date().toISOString(), articles };
  const serialized = JSON.stringify(payload, null, 2) + '\n';

  let previous = '';
  try {
    previous = await readFile(OUT_PATH, 'utf8');
  } catch {
    // first run — no previous file
  }

  if (previous) {
    const stripGeneratedAt = (s) => s.replace(/"generated_at":\s*"[^"]+",?\s*/, '');
    if (stripGeneratedAt(previous) === stripGeneratedAt(serialized)) {
      console.log('posts.json: no content changes, skipping write');
      return;
    }
  }

  await writeFile(OUT_PATH, serialized, 'utf8');
  console.log(`posts.json: wrote ${articles.length} articles`);
}

main().catch((err) => {
  // Upstream Substack hiccups (403, 5xx, network) shouldn't fail the hourly
  // workflow — the last known good posts.json keeps serving until next run.
  // Surface the error in logs but exit cleanly so the action stays green.
  console.error('fetch-posts: upstream failed, keeping previous posts.json');
  console.error(err);
  process.exit(0);
});
