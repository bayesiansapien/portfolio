import { useState, useEffect } from 'react';

const FALLBACK_POSTS = [
  {
    id: 1,
    title: "The Dark Matter Economics of Claude Code",
    date: "May 18, 2026",
    excerpt: "Most of what you pay for is invisible to the UI. This is the field guide to seeing it plus a small open toolkit that surfaces it.",
    link: "https://bayesiansapien.substack.com/p/the-dark-matter-economics-of-claude",
    thumbnail: "https://substack-post-media.s3.amazonaws.com/public/images/f473abfe-3850-4010-8133-72f208d65023_1672x941.png"
  },
  {
    id: 2,
    title: "The Simulacrum of Sapience: Intelligence Performed, Never Possessed",
    date: "Apr 5, 2026",
    excerpt: "The convergent case from philosophy, neuroscience, and machine learning that eloquent intermediate tokens are the alibi, not the act.",
    link: "https://bayesiansapien.substack.com/p/the-simulacrum-of-sapience-intelligence",
    thumbnail: "https://substackcdn.com/image/fetch/$s_!LHRC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb45fabd-4222-4d92-b0e1-bfd317004f99_2938x1472.png"
  },
  {
    id: 3,
    title: "The 2026 Transformer Efficiency Revolution: Four Papers, One Coherent Argument",
    date: "Mar 29, 2026",
    excerpt: "There is a particular kind of scientific excitement that happens when four separate research groups, working independently, end up converging on the same structural problem from four different directions.",
    link: "https://bayesiansapien.substack.com/p/the-2026-transformer-efficiency-revolution",
    thumbnail: "https://substackcdn.com/image/fetch/$s_!Ylnz!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F675067d3-eb0d-436e-bb3e-bf6640608c75_681x818.png"
  }
];

export default function RecentBlogPosts() {
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 5000);

    const fetchPosts = async () => {
      try {
        const response = await fetch('/posts.json', { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const articles = Array.isArray(data.articles) ? data.articles : [];

        if (articles.length === 0) {
          setUsingFallback(true);
          return;
        }

        const parsedPosts = articles.map((post, index) => {
          const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = post.description || '';
          const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
          const excerpt = cleanDescription.slice(0, 280) + (cleanDescription.length > 280 ? '...' : '');

          return {
            id: index + 1,
            title: post.title,
            link: post.link,
            date: formattedDate,
            excerpt: excerpt || 'Read more on Substack...',
            thumbnail: post.thumbnail || null
          };
        });

        setPosts(parsedPosts);
        setUsingFallback(false);
      } catch (err) {
        if (err.name === 'AbortError' && !timedOut) return;
        console.error('Error fetching Substack posts:', err);
        setUsingFallback(true);
      } finally {
        clearTimeout(timeoutId);
        if (!controller.signal.aborted || timedOut) setLoading(false);
      }
    };

    fetchPosts();
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4 text-slate-100">
          Recent Notes and Blog Entries
        </h2>
        <div className="text-center text-slate-400 py-12">
          Loading posts...
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <div className="flex justify-center mb-12">
        <div className="relative w-auto rounded-2xl px-6 py-3 ring-1 ring-white/15 backdrop-blur-xl shadow-[0_0_30px_rgba(82,246,197,0.1)] overflow-hidden backdrop-blur-xl backdrop-saturate-150 bg-white/5">
          <h2 className="text-3xl font-bold text-center text-slate-100">
            Recent Notes and Blog Entries
          </h2>
        </div>
      </div>
      
      <p className="text-center text-slate-300 mb-12">
        See <a 
          href="https://bayesiansapien.substack.com/" 
          className="text-emerald-400 hover:text-emerald-300 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Blog and Notes Archive
        </a> for all entries.
        {usingFallback && <span className="text-xs text-slate-500 ml-2">(Showing recent posts)</span>}
      </p>

      <div className="space-y-8">
        {posts.map((post) => (
          <article 
            key={post.id}
            style={{
              backgroundColor: 'rgba(11, 18, 32, 0.01)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              position: 'relative',
              zIndex: 10,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(82, 246, 197, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            className="flex flex-col md:flex-row gap-6 p-6 rounded-xl transition-all duration-300 border-[3px] border-emerald-400/50 hover:border-emerald-400/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_0_4px_rgba(82,246,197,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(11, 18, 32, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(11, 18, 32, 0.01)';
            }}
          >
            <div className="md:w-48 md:flex-shrink-0">
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                {post.thumbnail ? (
                  <img 
                    src={post.thumbnail} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-400"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-100 mb-2">
                <a 
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {post.title}
                </a>
              </h3>
              
              <time className="text-sm text-slate-400 mb-3 block">
                {post.date}
              </time>
              
              <p className="text-slate-300 leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}