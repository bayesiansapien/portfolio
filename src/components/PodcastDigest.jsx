import { stitch } from '../shared/stitch';

const SPOTIFY_SHOW = 'https://open.spotify.com/show/033pFfRZXOPB4gyxbpMOnw';
const CEREBRO = 'https://bayesiansapien.github.io/cere-bro';

const card = 'relative z-10 rounded-2xl p-6 ring-1 ring-white/15 backdrop-blur-xl backdrop-saturate-150 shadow-[0_0_30px_rgba(82,246,197,0.1)] bg-white/5 overflow-hidden flex flex-col';
const pill = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition';

export default function PodcastDigest({ revealed = true }) {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-16">
      <div className="relative z-10 flex justify-center mb-12" style={stitch(560, revealed, 700)}>
        <div className="relative w-auto rounded-2xl px-6 py-3 ring-1 ring-white/15 backdrop-blur-xl backdrop-saturate-150 shadow-[0_0_30px_rgba(82,246,197,0.1)] bg-white/5 overflow-hidden">
          <h2 className="text-3xl font-bold text-center text-slate-100">
            Podcast &amp; Daily Digest
          </h2>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className={card} style={stitch(561, revealed, 760)}>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Cerebro Radio</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Long-form AI research episodes, about 45 minutes each, built from the cere-bro digests.
            Three a week: a Wednesday midweek, a Saturday late-week and a Sunday weekly wrap.
          </p>
          <iframe
            title="Cerebro Radio on Spotify"
            src="https://open.spotify.com/embed/show/033pFfRZXOPB4gyxbpMOnw?theme=0"
            className="w-full rounded-xl mb-4"
            height="152"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
          <div className="mt-auto flex flex-wrap gap-2">
            <a href={SPOTIFY_SHOW} target="_blank" rel="noreferrer" className={`${pill} bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1ED760]`}>
              Listen on Spotify
            </a>
            <a href={`${CEREBRO}/radio`} target="_blank" rel="noreferrer" className={`${pill} bg-white/10 hover:bg-white/20 text-slate-200`}>
              All episodes
            </a>
            <a href={`${CEREBRO}/podcast.xml`} target="_blank" rel="noreferrer" className={`${pill} bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300`}>
              Podcast RSS
            </a>
          </div>
        </div>

        <div className={card} style={stitch(562, revealed, 820)}>
          <h3 className="text-xl font-bold text-slate-100 mb-2">cere-bro</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            A self-feeding AI research knowledge base. Every morning it reads the day's papers
            (HF Daily Papers, arXiv leaderboards), research blogs, newsletters and X, then writes
            source summaries, concept pages and a daily digest.
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            <a href={`${CEREBRO}/`} target="_blank" rel="noreferrer" className={`${pill} bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300`}>
              Today's digest
            </a>
            <a href={`${CEREBRO}/atlas`} target="_blank" rel="noreferrer" className={`${pill} bg-white/10 hover:bg-white/20 text-slate-200`}>
              Atlas
            </a>
            <a href={`${CEREBRO}/browse`} target="_blank" rel="noreferrer" className={`${pill} bg-white/10 hover:bg-white/20 text-slate-200`}>
              Wiki
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
