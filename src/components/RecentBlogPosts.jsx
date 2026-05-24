import { useState, useEffect } from 'react';

const FALLBACK_POSTS = [
  {
    id: 1,
    title: "Understanding and Implementing Qwen3 From Scratch",
    date: "Sep 6, 2025",
    excerpt: "Previously, I compared the most notable open-weight architectures of 2025 in The Big LLM Architecture Comparison.",
    link: "https://bayesiansapien.substack.com/"
  },
  {
    id: 2,
    title: "From GPT-2 to gpt-oss: Analyzing the Architectural Advances",
    date: "Aug 9, 2025",
    excerpt: "OpenAI just released their new open-weight LLMs this week: gpt-oss-120b and gpt-oss-20b.",
    link: "https://bayesiansapien.substack.com/"
  },
  {
    id: 3,
    title: "The Big LLM Architecture Comparison",
    date: "Jul 15, 2025",
    excerpt: "A comprehensive comparison of the most notable open-weight LLM architectures released in 2025.",
    link: "https://bayesiansapien.substack.com/"
  }
];

export default function RecentBlogPosts() {
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchRSSFeed = async () => {
      try {
        const RSS_URL = 'https://bayesiansapien.substack.com/feed';
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
        
        const response = await fetch(rss2jsonUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
          const articlesOnly = data.items.filter(
            (item) => !item.enclosure?.type?.startsWith('audio/')
          );

          if (articlesOnly.length === 0) {
            setUsingFallback(true);
            return;
          }

          const parsedPosts = articlesOnly.slice(0, 3).map((item, index) => {
            const date = new Date(item.pubDate);
            const formattedDate = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            });
            
            let thumbnail = null;
            if (item.thumbnail) {
              thumbnail = item.thumbnail;
            } else if (item.enclosure && item.enclosure.link) {
              thumbnail = item.enclosure.link;
            } else if (item.content || item.description) {
              const content = item.content || item.description;
              const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
              if (imgMatch) {
                thumbnail = imgMatch[1];
              }
            }
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.description || '';
            const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
            const excerpt = cleanDescription.slice(0, 280) + (cleanDescription.length > 280 ? '...' : '');
            
            return {
              id: index + 1,
              title: item.title,
              link: item.link,
              date: formattedDate,
              excerpt: excerpt || 'Read more on Substack...',
              thumbnail: thumbnail
            };
          });
          
          setPosts(parsedPosts);
          setUsingFallback(false);
        } else {
          setUsingFallback(true);
        }
      } catch (err) {
        console.error('Error fetching RSS feed:', err);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRSSFeed();
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