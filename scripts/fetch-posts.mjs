#!/usr/bin/env node
// Fetches the latest newsletter posts from Substack and writes them to
// public/posts.json. Runs at build time and on an hourly GitHub Actions cron,
// so the landing page reads a static file at runtime instead of depending on a
// proxy or edge function.

import { writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RSS_URL = 'https://bayesiansapien.substack.com/feed';
const MAX_ARTICLES = 3;
const OUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'posts.json');
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function main() {
  const response = await fetch(RSS_URL, {
    headers: {
      'user-agent': BROWSER_UA,
      accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8'
    }
  });
  if (!response.ok) {
    throw new Error(`Substack RSS responded ${response.status}`);
  }

  const xml = await response.text();
  const items = parseRssItems(xml);

  const articles = items
    .filter((item) => !(item.enclosureType || '').startsWith('audio/'))
    .slice(0, MAX_ARTICLES)
    .map((item) => ({
      title: item.title,
      link: item.link,
      date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      description: item.description.slice(0, 320),
      thumbnail: item.thumbnail
    }));

  if (articles.length === 0) {
    throw new Error('No newsletter articles in the Substack RSS feed');
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

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    items.push(parseItem(match[1]));
  }
  return items;
}

function parseItem(block) {
  const title = unwrap(extractTag(block, 'title'));
  const link = unwrap(extractTag(block, 'link'));
  const pubDate = unwrap(extractTag(block, 'pubDate'));
  const descriptionHtml = unwrap(extractTag(block, 'description'));
  const contentHtml = unwrap(extractTag(block, 'content:encoded')) || descriptionHtml;
  const enclosureType = extractAttr(block, 'enclosure', 'type');

  return {
    title,
    link,
    pubDate,
    description: stripHtml(descriptionHtml).trim(),
    enclosureType,
    thumbnail: extractFirstImage(contentHtml)
  };
}

function extractTag(block, tagName) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'i');
  const m = block.match(re);
  return m ? m[1] : '';
}

function extractAttr(block, tagName, attrName) {
  const re = new RegExp(
    `<${tagName}\\b[^>]*\\b${attrName}=["']([^"']*)["']`,
    'i'
  );
  const m = block.match(re);
  return m ? m[1] : '';
}

function unwrap(text) {
  return text
    .replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1')
    .trim();
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
    .replace(/\s+/g, ' ');
}

function extractFirstImage(html) {
  if (!html) return null;
  const m = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

main().catch((err) => {
  // Upstream Substack hiccups (403, 5xx, network) shouldn't fail the hourly
  // workflow — the last known good posts.json keeps serving until next run.
  // Surface the error in logs but exit cleanly so the action stays green.
  console.error('fetch-posts: upstream failed, keeping previous posts.json');
  console.error(err);
  process.exit(0);
});
