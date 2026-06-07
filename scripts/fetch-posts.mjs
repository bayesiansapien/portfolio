#!/usr/bin/env node
// Fetches the latest newsletter posts from Substack and writes them to
// public/posts.json. Runs at build time and on an hourly GitHub Actions cron,
// so the landing page reads a static file at runtime instead of depending on a
// proxy or edge function.
//
// Substack's CDN 403s direct requests from GitHub Actions IP ranges (both the
// JSON API and the RSS feed). To work around it the script proxies through
// allorigins.win, which fetches Substack server-side from its own network and
// hands the response back. rss2json is kept as a fallback for the rare case
// allorigins is down — note it caps at 10 items, so on weeks with heavy
// podcast cadence it may return fewer than MAX_ARTICLES.

import { writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SUBSTACK_API = 'https://bayesiansapien.substack.com/api/v1/posts?limit=25';
const SUBSTACK_RSS = 'https://bayesiansapien.substack.com/feed';
const MAX_ARTICLES = 3;
const DESCRIPTION_LIMIT = 320;
const OUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'posts.json'
);

const STRATEGIES = [
  { name: 'allorigins -> Substack JSON API', fetch: fetchViaAllorigins },
  { name: 'rss2json -> Substack RSS', fetch: fetchViaRss2Json }
];

async function main() {
  let fetched = [];
  let lastError = null;

  for (const { name, fetch: strategy } of STRATEGIES) {
    try {
      const articles = await strategy();
      console.log(`${name}: ${articles.length} article(s)`);
      if (articles.length > fetched.length) fetched = articles;
      if (fetched.length >= MAX_ARTICLES) break;
    } catch (err) {
      lastError = err;
      console.error(`${name}: ${err.message}`);
    }
  }

  let previous = '';
  try {
    previous = await readFile(OUT_PATH, 'utf8');
  } catch {
    // first run — no previous file
  }

  const cached = parseCached(previous);

  // Merge fetched with cached so an upstream that briefly returns fewer items
  // (e.g. rss2json's 10-item window with heavy podcast cadence) can't degrade
  // the displayed list. New articles always sit on top; cached articles fill
  // any remaining slots up to MAX_ARTICLES.
  const articles = mergeByLink(fetched, cached, MAX_ARTICLES);

  if (articles.length === 0) {
    throw lastError || new Error('No articles fetched and no cache to fall back on');
  }

  const payload = { generated_at: new Date().toISOString(), articles };
  const serialized = JSON.stringify(payload, null, 2) + '\n';

  if (previous) {
    const cachedSig = articleSignature(parseCached(previous));
    const newSig = articleSignature(articles);
    if (cachedSig === newSig) {
      console.log('posts.json: same article set, skipping write');
      return;
    }
  }

  await writeFile(OUT_PATH, serialized, 'utf8');
  console.log(`posts.json: wrote ${articles.length} articles`);
}

function articleSignature(articles) {
  // Stable identity = ordered list of canonical article links. Lets the
  // script ignore cosmetic metadata drift between fetch sources (thumbnail
  // URL shape, date timezone) and only rewrite when the displayed article
  // set actually changes.
  return (articles || []).map((a) => a?.link || '').join('|');
}

function parseCached(text) {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed?.articles) ? parsed.articles : [];
  } catch {
    return [];
  }
}

function mergeByLink(primary, secondary, limit) {
  const seen = new Set();
  const out = [];
  for (const article of [...primary, ...secondary]) {
    const key = article?.link;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(article);
    if (out.length >= limit) break;
  }
  return out;
}


async function fetchViaAllorigins() {
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(SUBSTACK_API)}`;
  const response = await fetch(proxy);
  if (!response.ok) {
    throw new Error(`allorigins responded ${response.status}`);
  }
  const items = await response.json();
  if (!Array.isArray(items)) {
    throw new Error('allorigins: unexpected response shape');
  }
  return items
    .filter((p) => p?.type === 'newsletter')
    .map((p) => ({
      title: p.title,
      link: p.canonical_url,
      date: p.post_date ? new Date(p.post_date).toISOString() : null,
      description: stripHtml(p.description || p.subtitle || '').slice(0, DESCRIPTION_LIMIT),
      thumbnail: p.cover_image || p.cover_image_url || null
    }));
}

async function fetchViaRss2Json() {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(SUBSTACK_RSS)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`rss2json responded ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'ok' || !Array.isArray(data.items)) {
    throw new Error(`rss2json returned status="${data.status}"`);
  }
  return data.items
    .filter((item) => !(item.enclosure?.type || '').startsWith('audio/'))
    .map((item) => ({
      title: item.title,
      link: item.link,
      date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      description: stripHtml(item.description || '').slice(0, DESCRIPTION_LIMIT),
      thumbnail:
        item.thumbnail ||
        item.enclosure?.link ||
        extractFirstImage(item.content || item.description) ||
        null
    }));
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstImage(html) {
  if (!html) return null;
  const m = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

main().catch((err) => {
  // Upstream hiccups (proxy down, 5xx, network) shouldn't fail the hourly
  // workflow — the last known good posts.json keeps serving until next run.
  // Surface the error in logs but exit cleanly so the action stays green.
  console.error('fetch-posts: every strategy failed, keeping previous posts.json');
  console.error(err);
  process.exit(0);
});
