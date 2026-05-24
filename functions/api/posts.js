// Cloudflare Pages Function: GET /api/posts
// Fetches Substack posts server-side (no browser CORS), filters out podcasts,
// returns the most recent newsletter articles. Cached at Cloudflare's edge.

const SUBSTACK_API = 'https://bayesiansapien.substack.com/api/v1/posts?limit=25';
const MAX_ARTICLES = 3;
const EDGE_TTL_SECONDS = 600;

export async function onRequestGet() {
  try {
    const upstream = await fetch(SUBSTACK_API, {
      cf: { cacheTtl: EDGE_TTL_SECONDS, cacheEverything: true },
      headers: { 'accept': 'application/json' }
    });

    if (!upstream.ok) {
      return json({ error: 'upstream', status: upstream.status }, 502);
    }

    const items = await upstream.json();
    const articles = Array.isArray(items)
      ? items
          .filter((p) => p.type === 'newsletter')
          .slice(0, MAX_ARTICLES)
          .map((p) => ({
            title: p.title,
            link: p.canonical_url,
            date: p.post_date,
            description: p.description || p.subtitle || '',
            thumbnail: p.cover_image || p.cover_image_url || null
          }))
      : [];

    return json({ articles }, 200, {
      'cache-control': `public, max-age=300, s-maxage=${EDGE_TTL_SECONDS}`
    });
  } catch (err) {
    return json({ error: 'fetch_failed', message: String(err) }, 502);
  }
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}
