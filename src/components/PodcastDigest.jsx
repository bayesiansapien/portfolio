import { stitch } from '../shared/stitch';

const SPOTIFY_SHOW = 'https://open.spotify.com/show/033pFfRZXOPB4gyxbpMOnw';
const CEREBRO = 'https://bayesiansapien.github.io/cere-bro';

const tab = 'rounded-2xl p-4 ring-1 ring-white/10 bg-white/5 text-center';
const pill = 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs transition';

// Two small tabs at the bottom of the bio card: Cerebro Radio left, Research Wiki right.
export default function PodcastDigest({ revealed = true }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-[720px] mx-auto">
      <div className={tab} style={stitch(220, revealed, 150)}>
        <h3 className="flex items-center justify-center gap-2 text-base font-bold text-slate-100 mb-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#1DB954" aria-hidden="true">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/>
          </svg>
          Cerebro Radio
        </h3>
        <p className="text-xs text-slate-300 leading-5 mb-3">
          AI research episodes, about 45 minutes each, three a week.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <a href={SPOTIFY_SHOW} target="_blank" rel="noreferrer" className={`${pill} bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1ED760]`}>Spotify</a>
          <a href={`${CEREBRO}/radio`} target="_blank" rel="noreferrer" className={`${pill} bg-white/10 hover:bg-white/20 text-slate-200`}>All episodes</a>
        </div>
      </div>

      <div className={tab} style={stitch(221, revealed, 220)}>
        <h3 className="flex items-center justify-center gap-2 text-base font-bold text-slate-100 mb-1">
          <img src="/cerebro-mark.png" alt="" width="18" height="18" aria-hidden="true" />
          Research Wiki
        </h3>
        <p className="text-xs text-slate-300 leading-5 mb-3">
          Cere-bro, a self-feeding AI research knowledge base with a daily digest.
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
