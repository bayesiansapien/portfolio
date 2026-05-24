// Cloudflare Pages Function: GET /api/posts
// Returns the latest newsletter articles from Substack, filtered to exclude
// podcasts. Uses the Workers Cache API to memoize the small processed result
// so most requests never re-parse the full upstream payload.

const SUBSTACK_API = 'https://bayesiansapien.substack.com/api/v1/posts?limit=25';
const MAX_ARTICLES = 3;
const EDGE_TTL_SECONDS = 600;
const CACHE_KEY = 'https://bayesiansapien.tech/__cache__/api/posts/v1';

export async function onRequest({ request, waitUntil }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405, headers: { 'allow': 'GET, HEAD' } });
  }

  const cache = caches.default;
  const cacheKey = new Request(CACHE_KEY, { method: 'GET' });

  const cached = await cache.match(cacheKey);
  if (cached) {
    return request.method === 'HEAD' ? new Response(null, cached) : cached;
  }

  try {
    const upstream = await fetch(SUBSTACK_API, { headers: { 'accept': 'application/json' } });
    if (!upstream.ok) {
      return jsonResponse({ error: 'upstream', status: upstream.status }, 502);
    }

    const items = await upstream.json();
    const articles = Array.isArray(items)
      ? items
          .filter((p) => p && p.type === 'newsletter')
          .slice(0, MAX_ARTICLES)
          .map((p) => ({
            title: p.title,
            link: p.canonical_url,
            date: p.post_date,
            description: p.description || p.subtitle || '',
            thumbnail: p.cover_image || p.cover_image_url || null
          }))
      : [];

    const response = jsonResponse({ articles }, 200, {
      'cache-control': `public, max-age=300, s-maxage=${EDGE_TTL_SECONDS}`
    });

    waitUntil(cache.put(cacheKey, response.clone()));
    return request.method === 'HEAD' ? new Response(null, response) : response;
  } catch (err) {
    return jsonResponse({ error: 'fetch_failed', message: String(err) }, 502);
  }
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}
