import { stitch } from '../shared/stitch';

const SPOTIFY_SHOW = 'https://open.spotify.com/show/033pFfRZXOPB4gyxbpMOnw';
const CEREBRO = 'https://bayesiansapien.github.io/cere-bro';

const card = 'relative rounded-2xl p-4 ring-1 ring-white/15 backdrop-blur-xl backdrop-saturate-150 shadow-[0_0_30px_rgba(82,246,197,0.1)] bg-[#0b1220]/55 overflow-hidden text-left poppins';
const pill = 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs transition';

// Two stacked tabs beside the bio card (below it on smaller screens).
export default function PodcastDigest({ revealed = true }) {
  return (
    <div className="w-full max-w-[820px] md:max-w-[980px] lg:max-w-[992px] min-[1360px]:w-[300px] shrink-0 grid gap-4">
      <div className={card} style={stitch(220, revealed, 150)}>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 mb-1">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="#1DB954" aria-hidden="true">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/>
          </svg>
          Cerebro Radio
        </h3>
        <p className="text-sm text-slate-300 leading-6 mb-3">
          AI research episodes, about 45 minutes each. Three a week: Wednesday, Saturday and a Sunday wrap.
        </p>
        <iframe
          title="Cerebro Radio on Spotify"
          src="https://open.spotify.com/embed/show/033pFfRZXOPB4gyxbpMOnw?theme=0"
          className="w-full rounded-xl mb-3"
          height="152"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
        <div className="flex flex-wrap justify-center gap-2">
          <a href={SPOTIFY_SHOW} target="_blank" rel="noreferrer" className={`${pill} bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1ED760]`}>Spotify</a>
          <a href={`${CEREBRO}/radio`} target="_blank" rel="noreferrer" className={`${pill} bg-white/10 hover:bg-white/20 text-slate-200`}>All episodes</a>
        </div>
      </div>

      <div className={card} style={stitch(221, revealed, 220)}>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 mb-1">
          <img src="/cerebro-mark.png" alt="" width="20" height="20" aria-hidden="true" />
          Research Wiki
        </h3>
        <p className="text-sm text-slate-300 leading-6 mb-3">
          Cere-bro, a self-feeding AI research knowledge base. Every morning it reads new papers, blogs and newsletters and writes a daily digest.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <a href={`${CEREBRO}/`} target="_blank" rel="noreferrer" className={`${pill} bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300`}>Today's digest</a>
          <a href={`${CEREBRO}/atlas`} target="_blank" rel="noreferrer" className={`${pill} bg-white/10 hover:bg-white/20 text-slate-200`}>Atlas</a>
          <a href={`${CEREBRO}/browse`} target="_blank" rel="noreferrer" className={`${pill} bg-white/10 hover:bg-white/20 text-slate-200`}>Wiki</a>
        </div>
      </div>
    </div>
  );
}
