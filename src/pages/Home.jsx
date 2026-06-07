import { useState, useEffect } from 'react';
import RecentBlogPosts from '../components/RecentBlogPosts';
import Footer from '../components/Footer';

export default function Home() {
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && revealed) setRevealed(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed]);

  useEffect(() => {
    // Touch-only devices never fire mouseenter, so the cursive hint would
    // stay hidden forever. Pin hovered = true on devices that report no
    // hover capability so the hint is visible by default until the bio is
    // revealed. Never flips back to false from this effect (desktop hover
    // state is owned by the mouse handlers on the sigil button).
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: none)');
    const sync = () => { if (mq.matches) setHovered(true); };
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  // Anchor point inside the section where the sigil's circular composition
  // center AND the bubble's avatar center both align. 38% (vs 50%) lifts the
  // whole composition into the upper-middle of the viewport.
  const ANCHOR_TOP = '38%';
  // Bubble padding-top + half the avatar's height. Used to offset the bubble
  // upward so the avatar's center lands on the anchor.
  const AVATAR_OFFSET = 100;

  return (
    <>
      <main className="max-w-none mx-auto px-4 pt-4 pb-16">
        <section className="relative grid justify-center pb-12 min-h-[860px] md:min-h-[900px]">

          <div
            aria-hidden="true"
            className={[
              'pointer-events-none absolute left-1/2',
              '-translate-x-1/2 -translate-y-[40%] z-[1]',
              'rounded-full aspect-square',
              'transition-all duration-700 ease-out',
              revealed
                ? 'opacity-0 w-[clamp(440px,68vw,720px)]'
                : 'opacity-100 w-[clamp(460px,72vw,760px)]'
            ].join(' ')}
            style={{
              top: ANCHOR_TOP,
              background:
                'radial-gradient(circle at center, ' +
                'rgba(82,246,197,0) 18%, ' +
                'rgba(82,246,197,0.05) 28%, ' +
                'rgba(82,246,197,0.03) 35%, ' +
                'rgba(0,0,0,0.18) 44%, ' +
                'rgba(0,0,0,0.26) 52%, ' +
                'rgba(0,0,0,0.22) 60%, ' +
                'rgba(0,0,0,0.16) 68%, ' +
                'rgba(0,0,0,0.10) 76%, ' +
                'rgba(0,0,0,0.05) 85%, ' +
                'rgba(0,0,0,0.02) 92%, ' +
                'rgba(0,0,0,0) 100%)',
              filter: 'blur(20px)'
            }}
          />

          <button
            type="button"
            onClick={() => !revealed && setRevealed(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            aria-label={revealed ? 'BayesianSapien sigil' : 'Tap to unravel the Sapien'}
            tabIndex={revealed ? -1 : 0}
            className={[
              'group absolute left-1/2 -translate-x-1/2 -translate-y-[40%] z-[2]',
              'flex items-center justify-center bg-transparent border-0 p-0',
              'transition-all duration-700 ease-out',
              revealed
                ? 'opacity-[0.01] pointer-events-none'
                : 'opacity-95 cursor-pointer hover:scale-[1.03]'
            ].join(' ')}
            style={{ top: ANCHOR_TOP, mixBlendMode: 'screen' }}
          >
            <img
              src="/bayesian-sigil.png"
              alt=""
              aria-hidden="true"
              className={[
                'select-none aspect-square w-[clamp(380px,82vw,760px)]',
                revealed ? '' : 'animate-sigil-glow'
              ].join(' ')}
            />
          </button>

          <div
            aria-hidden="true"
            className={[
              'absolute left-1/2 -translate-x-1/2 z-[5] pointer-events-none',
              'transition-all duration-500 ease-out',
              !revealed && hovered
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3'
            ].join(' ')}
            style={{ top: `calc(${ANCHOR_TOP} + clamp(260px, 56vw, 420px))` }}
          >
            <span
              className="font-script text-[28px] sm:text-3xl md:text-4xl lg:text-5xl text-amber-200 tracking-wide whitespace-nowrap"
              style={{
                filter:
                  'drop-shadow(0 0 12px rgba(251,191,36,0.85)) ' +
                  'drop-shadow(0 0 32px rgba(251,146,60,0.45))'
              }}
            >
              Tap to Unravel the Sapien
            </span>
          </div>

          <div
            className={[
              'absolute left-1/2 -translate-x-1/2',
              'flex justify-center items-start gap-6 w-full max-w-7xl px-4',
              'transition-all duration-700 ease-out',
              revealed
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-[0.94] pointer-events-none'
            ].join(' ')}
            style={{ top: `calc(${ANCHOR_TOP} - ${AVATAR_OFFSET}px)` }}
            aria-hidden={!revealed}
          >

            <div
              id="hero-bubble"
              data-revealed={revealed ? 'true' : 'false'}
              className="relative w-full mx-auto text-center rounded-3xl p-6 md:p-8 ring-1 ring-white/20 backdrop-blur-xl shadow-[0_0_70px_rgba(82,246,197,0.22)] after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:shadow-[0_0_140px_rgba(82,246,197,0.26)] overflow-hidden backdrop-blur-2xl backdrop-saturate-150 z-10 max-w-[820px] md:max-w-[980px] lg:max-w-[1120px] poppins bg-black/10"
            >
              <button
                type="button"
                onClick={() => setRevealed(false)}
                aria-label="Close about me"
                tabIndex={revealed ? 0 : -1}
                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full ring-1 ring-white/15 hover:ring-white/30 bg-black/30 hover:bg-black/40 backdrop-blur text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <img
                src="/avatar.png"
                className="mx-auto mb-6 w-36 h-36 md:w-36 md:h-36 rounded-full object-cover ring-1 ring-white/15 shadow-lg"
                alt="Avatar"
              />

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Hello, I'm <span className="text-emerald-300">Amit Singh Bhatti</span>
              </h1>

              <p className="mx-auto max-w-[1200px] lg:max-w-[1240px] text-[16px] md:text-[17px] lg:text-[14px] md:text-[15px] lg:text-[16px] tracking-[0.005em] leading-7 md:leading-7 lg:leading-7">
                A Minimalist Bayesian Sapien contributing to the universe's entropy, being an AI researcher building efficient, sustainable intelligence optimizing models via pruning, distillation, quantization, and routing to deliver lighter and faster systems. I also apply Quantum ML to combinatorial optimization, turning vast search spaces into practical results. My work spans RL, test time compute, Agentic Intelligence Optimization, and reasoning systems.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a
                  href="https://bayesiansapien.substack.com/subscribe"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  aria-label="Subscribe by Email on Substack"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="0" y="0" width="24" height="24" rx="3" fill="#FF6719"></rect>
                    <rect x="4" y="6" width="16" height="2" fill="white"></rect>
                    <rect x="4" y="10" width="16" height="2" fill="white"></rect>
                    <rect x="8" y="14" width="8" height="6" fill="white"></rect>
                  </svg>
                  <span>Subscribe by Email</span>
                </a>

                <a
                  href="https://bayesiansapien.substack.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition"
                  aria-label="RSS Feed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 11a9 9 0 0 1 9 9"></path>
                    <path d="M4 4a16 16 0 0 1 16 16"></path>
                    <circle cx="5" cy="19" r="1"></circle>
                  </svg>
                  <span>RSS Feed</span>
                </a>

                <a
                  href="https://bayesiansapien.github.io/cere-bro/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition"
                  aria-label="Research Wiki — daily AI research synthesis"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <span>Research Wiki</span>
                </a>
              </div>
            </div>

            <div className="hidden lg:block self-start">
              <div className="relative rounded-2xl p-3 ring-1 ring-white/15 backdrop-blur-xl shadow-[0_0_30px_rgba(82,246,197,0.1)] overflow-hidden backdrop-blur-2xl backdrop-saturate-150 bg-black/5">
                <div className="flex flex-col items-center gap-4">

                  <a href="/resume.pdf" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="CV">
                    <span className="text-xs font-medium text-gray-700 group-hover:text-emerald-600 transition">CV</span>
                  </a>

                  <a href="https://github.com/bayesiansapien" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="GitHub">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="#000000" className="group-hover:fill-emerald-600 transition">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                    </svg>
                  </a>

                  <a href="https://www.linkedin.com/in/amit-singh-bhatti-278b0a83/" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5" className="group-hover:fill-emerald-600 transition">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>

                  <a href="https://x.com/bayesiansapien" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="X (Twitter)">
                    <svg width="20" height="20" viewBox="0 0 300 271" fill="#000000" className="group-hover:fill-emerald-600 transition">
                      <path d="M236 0h46L181 115l118 156h-92.6l-72.5-94.8L59 271H13l107-123L0 0h94.9l65.5 86.6L236 0zm-16.1 243h25.5L80.4 26H53.2l166.7 217z"/>
                    </svg>
                  </a>

                  <a href="https://bayesiansapien.substack.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="Substack">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="#FF6719" className="group-hover:fill-emerald-600 transition">
                      <path d="M15 3.604H1v1.891h14v-1.89ZM1 7.208V16l7-3.926L15 16V7.208zM15 0H1v1.89h14z"/>
                    </svg>
                  </a>

                </div>
              </div>
            </div>

          </div>
        </section>

        <div
          className={[
            'transition-all duration-700 ease-out overflow-hidden',
            revealed
              ? 'opacity-100 max-h-[5000px]'
              : 'opacity-0 max-h-0 pointer-events-none'
          ].join(' ')}
          aria-hidden={!revealed}
        >
          <RecentBlogPosts />
        </div>
      </main>

      <div
        className={[
          'transition-all duration-700 ease-out overflow-hidden',
          revealed
            ? 'opacity-100 max-h-[400px]'
            : 'opacity-0 max-h-0 pointer-events-none'
        ].join(' ')}
        aria-hidden={!revealed}
      >
        <Footer />
      </div>
    </>
  );
}
