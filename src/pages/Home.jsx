import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import RecentBlogPosts from '../components/RecentBlogPosts';
import Footer from '../components/Footer';
import { stitch, REDUCED_MOTION } from '../shared/stitch';
import Stitched from '../shared/Stitched';

// bg.js bends the background into a wormhole through the seal's center;
// dir 1 opens, -1 closes.
function emitWarp(dir, sigil) {
  const r = sigil?.getBoundingClientRect();
  const detail = r && r.width ? { dir, x: r.left + r.width / 2, y: r.top + r.height / 2 } : { dir };
  window.dispatchEvent(new CustomEvent('cosmic:warp', { detail }));
}

export default function Home() {
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const closeRef = useRef(null);
  // While closing, the seal waits for the card to fall into the wormhole
  // before re-emerging on this side.
  const [closing, setClosing] = useState(false);
  const closingTimer = useRef(null);
  // Ignore taps while a transition is in flight: the seal and the card stay
  // clickable while invisible, and a mid-flight tap would tangle open/close.
  const busyUntil = useRef(0);
  const claim = (ms) => {
    const now = Date.now();
    if (now < busyUntil.current) return false;
    busyUntil.current = now + (REDUCED_MOTION ? 400 : ms);
    return true;
  };
  const reveal = () => {
    if (revealed || !claim(2300)) return;
    emitWarp(1, sigilRef.current);
    setRevealed(true);
  };
  const scrollTimer = useRef(null);
  const close = () => {
    if (!claim(2600)) return;
    const collapse = () => {
      emitWarp(-1, sigilRef.current);
      setRevealed(false);
      setClosing(true);
      clearTimeout(closingTimer.current);
      closingTimer.current = setTimeout(() => setClosing(false), 2200);
    };
    // The collapse happens at the seal, so bring it back into view first
    clearTimeout(scrollTimer.current);
    if (window.scrollY > 20) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scrollTimer.current = setTimeout(collapse, 450);
    } else {
      collapse();
    }
  };
  useEffect(() => () => {
    clearTimeout(closingTimer.current);
    clearTimeout(scrollTimer.current);
  }, []);
  useEffect(() => {
    closeRef.current = close;
  });

  // The hint sits a gap below the seal. Holding hover for a beat after the
  // pointer leaves lets it travel from the seal to the hint without the hint
  // vanishing underneath it.
  const hoverTimer = useRef(null);
  const hoverOn = () => {
    clearTimeout(hoverTimer.current);
    setHovered(true);
  };
  const hoverOff = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (!window.matchMedia?.('(hover: none)').matches) setHovered(false);
    }, 350);
  };
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && revealed) closeRef.current();
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

  // Where the sigil's circular composition is centered. Viewport-relative
  // (vh) instead of section-% so the sigil stays put when the section grows
  // on reveal. 38vh lifts the seal into the upper-middle of the viewport.
  const ANCHOR_TOP = '38vh';

  // The sigil's rendered size is capped by its container, so on phones it
  // comes out far smaller than its clamp() width suggests. Measure where the
  // image actually ends and hang the hint a proportional distance below it,
  // rather than guessing from the viewport width.
  const sectionRef = useRef(null);
  const sigilRef = useRef(null);
  const hintTextRef = useRef(null);
  const [hintTop, setHintTop] = useState(null);

  // Once revealed, the bio row lifts toward the top of the viewport and the
  // section shrinks to wrap it, so the Recent Notes header peeks in above
  // the fold instead of hiding a full screen below.
  const REVEALED_TOP_MIN = 16;
  const REVEALED_TOP_MAX = 80;
  const REVEALED_GAP = 24;
  const rowRef = useRef(null);
  const [revealedMinH, setRevealedMinH] = useState(null);

  const revealedTop = () =>
    Math.round(Math.min(REVEALED_TOP_MAX, Math.max(REVEALED_TOP_MIN, window.innerHeight * 0.06)));

  // The row grows out of (and collapses back into) the singularity at the
  // seal's center, so its transform-origin is aimed there. offsetLeft/Top are
  // pre-transform, and the row is shifted left by half its width.
  const [origin, setOrigin] = useState('50% 50%');

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      setRevealedMinH(revealedTop() + row.offsetHeight + REVEALED_GAP);
      const sigil = sigilRef.current;
      const section = sectionRef.current;
      if (!sigil || !section) return;
      const s = sigil.getBoundingClientRect();
      const sec = section.getBoundingClientRect();
      const ox = s.left + s.width / 2 - sec.left - row.offsetLeft + row.offsetWidth / 2;
      const oy = s.top + s.height / 2 - sec.top - row.offsetTop;
      setOrigin(`${Math.round(ox)}px ${Math.round(oy)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);


  useLayoutEffect(() => {
    const section = sectionRef.current;
    const sigil = sigilRef.current;
    if (!section || !sigil) return;
    const measure = () => {
      const sec = section.getBoundingClientRect();
      const bottom = sigil.getBoundingClientRect().bottom - sec.top;
      const gap = Math.min(145, Math.max(48, Math.min(window.innerWidth * 0.11, window.innerHeight * 0.18)));
      // Never let the hint slip below the fold on short screens
      const textH = hintTextRef.current?.offsetHeight || 48;
      const limit = window.innerHeight - 12 - sec.top - window.scrollY - textH;
      setHintTop(Math.round(Math.max(bottom + 32, Math.min(bottom + gap, limit))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sigil);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <>
      <main className="max-w-none mx-auto px-4 pt-4 pb-16">
        <section
          ref={sectionRef}
          className={[
            'relative grid justify-center pb-12',
            'transition-[min-height] duration-700 ease-out',
            // Revealed height is measured from the bio row (see above);
            // these classes cover the sigil state and the first paint.
            revealed
              ? 'min-h-[1380px] sm:min-h-[1136px] md:min-h-[1036px] lg:min-h-[956px]'
              : 'min-h-[620px] sm:min-h-[720px] md:min-h-[860px]'
          ].join(' ')}
          style={revealed && revealedMinH ? { minHeight: `${revealedMinH}px` } : undefined}
        >

          <div
            aria-hidden="true"
            className={[
              'pointer-events-none absolute left-1/2',
              '-translate-x-1/2 -translate-y-[40%] z-[1]',
              'rounded-full aspect-square',
              'transition-all duration-700 ease-out',
              revealed
                ? 'opacity-0 w-[clamp(280px,68vw,720px)]'
                : 'opacity-100 w-[clamp(300px,72vw,760px)]'
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
            onClick={reveal}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
            onFocus={hoverOn}
            onBlur={hoverOff}
            aria-label={revealed ? 'BayesianSapien sigil' : 'Tap to unravel the Sapien'}
            tabIndex={revealed ? -1 : 0}
            className={[
              'group absolute left-1/2 -translate-x-1/2 -translate-y-[40%] z-[2]',
              'flex items-center justify-center bg-transparent border-0 p-0',
              'transition-all duration-700 ease-out',
              revealed
                // The seal falls into the wormhole's throat
                ? 'opacity-[0.01] scale-[0.35] pointer-events-none'
                // On close the seal waits out the collapse and the passage
                : 'opacity-95 cursor-pointer hover:scale-[1.03]' + (closing && !REDUCED_MOTION ? ' delay-[1250ms]' : '')
            ].join(' ')}
            style={{ top: ANCHOR_TOP, mixBlendMode: 'screen' }}
          >
            <img
              ref={sigilRef}
              src="/bayesian-sigil.png"
              alt=""
              aria-hidden="true"
              className={[
                // Short landscape viewports (phones on their side) would otherwise
                // push the seal off the top edge and the hint below the fold.
                // Capped by viewport height too, so short laptop screens keep
                // room for the hint below it.
                'select-none aspect-square w-[clamp(380px,82vw,760px)] max-w-[min(100%,62vh)] [@media(max-height:500px)]:max-w-[56vh]',
                revealed ? '' : 'animate-sigil-glow'
              ].join(' ')}
            />
          </button>

          {/* The hint reads as a call to action, so it has to act like one:
              tapping it reveals the bio just like tapping the seal. It's a
              duplicate of the seal button for assistive tech, hence hidden. */}
          <div
            aria-hidden="true"
            onClick={reveal}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
            className={[
              'absolute left-1/2 -translate-x-1/2 z-[5] px-4 py-2 -mt-2',
              'transition-all duration-500 ease-out',
              !revealed && hovered
                ? 'opacity-100 translate-y-0 cursor-pointer pointer-events-auto'
                : 'opacity-0 translate-y-3 pointer-events-none'
            ].join(' ')}
            style={{ top: hintTop != null ? `${hintTop}px` : `calc(${ANCHOR_TOP} + clamp(260px, 56vw, 420px))` }}
          >
            <span
              ref={hintTextRef}
              className="font-script text-[28px] sm:text-3xl md:text-4xl lg:text-5xl [@media(max-height:500px)]:text-3xl text-amber-200 tracking-wide whitespace-nowrap"
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
            ref={rowRef}
            className={[
              // z-10: the translate/scale make this row its own stacking
              // context, which would otherwise paint beneath bg.js's canvas.
              'absolute left-1/2 -translate-x-1/2 z-10',
              'flex justify-center items-center gap-6 w-full max-w-7xl px-4',
              'transition-all duration-700 ease-out',
              revealed
                // Born in the big bang: bursts out of the singularity once the
                // collapse is done
                ? 'opacity-100 scale-100 rotate-0 pointer-events-auto ' + (REDUCED_MOTION ? '' : 'delay-[1400ms]')
                : closing
                  // Sucked into the seal: swirling anticlockwise (the reverse of
                  // the clockwise opening) and accelerating inward
                  ? 'opacity-0 scale-[0.02] -rotate-[140deg] pointer-events-none'
                  : 'opacity-0 scale-[0.05] pointer-events-none'
            ].join(' ')}
            style={{
              // Pinned at its revealed position so it has one fixed point to
              // grow out of and collapse into
              top: `clamp(${REVEALED_TOP_MIN}px, 6vh, ${REVEALED_TOP_MAX}px)`,
              transformOrigin: origin,
              ...(closing && !revealed
                ? { transitionDuration: '650ms', transitionTimingFunction: 'cubic-bezier(0.55, 0, 1, 0.45)' }
                : null)
            }}
            aria-hidden={!revealed}
          >

            <div
              id="hero-bubble"
              data-revealed={revealed ? 'true' : 'false'}
              className="relative w-full mx-auto text-center rounded-3xl p-6 md:p-8 ring-1 ring-white/10 bg-[#0b1220]/55 backdrop-blur-md backdrop-saturate-150 shadow-[0_0_60px_rgba(82,246,197,0.10)] after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] overflow-hidden z-10 max-w-[820px] md:max-w-[980px] lg:max-w-[1120px] poppins"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close about me"
                tabIndex={revealed ? 0 : -1}
                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full ring-1 ring-white/15 hover:ring-white/30 bg-black/30 hover:bg-black/40 backdrop-blur text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div style={stitch(0, revealed)}>
                <img
                  src="/avatar.png"
                  className="mx-auto mb-6 w-36 h-36 md:w-36 md:h-36 rounded-full object-cover ring-1 ring-white/15 shadow-lg"
                  alt="Avatar"
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                <Stitched text="Hello, I'm" from={1} revealed={revealed} />
                <span className="text-emerald-300">
                  <Stitched text="Amit Singh Bhatti" from={3} revealed={revealed} />
                </span>
              </h1>

              <p className="mx-auto max-w-[1200px] lg:max-w-[1240px] text-[16px] md:text-[17px] lg:text-[14px] md:text-[15px] lg:text-[16px] tracking-[0.005em] leading-7 md:leading-7 lg:leading-7">
                <Stitched
                  text="A Minimalist Bayesian Sapien, adding to the universe's entropy while playing Maxwell's demon for machine intelligence, sorting signal from heat. I'm a research-to-product lead working on the expensive half of intelligence, the serving systems, routing infrastructure, compression and quantization that I tune until every token earns its keep. I think hardware-first, from GPU kernels and memory hierarchies up to agentic intelligence optimization and test-time compute, teaching models how hard to think before they spend. What I'm after is AI that is reliable, fast and cheap enough to disappear into the product."
                  from={10}
                  revealed={revealed}
                />
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <span style={stitch(200, revealed)}>
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
                </span>

                <span style={stitch(201, revealed)}>
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
                </span>

                <span style={stitch(202, revealed)}>
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
                </span>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-2xl p-3 ring-1 ring-white/10 bg-linear-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl backdrop-saturate-150 shadow-[0_0_40px_rgba(82,246,197,0.08)] overflow-hidden">
                <div className="flex flex-col items-center gap-4">

                  <div style={stitch(210, revealed)}>
                    <a href="/resume.pdf" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="CV">
                      <span className="text-xs font-medium text-gray-700 group-hover:text-emerald-600 transition">CV</span>
                    </a>
                  </div>

                  <div style={stitch(211, revealed)}>
                    <a href="https://scholar.google.com/citations?user=TtuSSF4AAAAJ&hl=en" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="Google Scholar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#4285F4" className="group-hover:fill-emerald-600 transition">
                        <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>
                      </svg>
                    </a>
                  </div>

                  <div style={stitch(212, revealed)}>
                    <a href="https://github.com/bayesiansapien" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="GitHub">
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="#000000" className="group-hover:fill-emerald-600 transition">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                      </svg>
                    </a>
                  </div>

                  <div style={stitch(213, revealed)}>
                    <a href="https://www.linkedin.com/in/amit-singh-bhatti-278b0a83/" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="LinkedIn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5" className="group-hover:fill-emerald-600 transition">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>

                  <div style={stitch(214, revealed)}>
                    <a href="https://x.com/bayesiansapien" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="X (Twitter)">
                      <svg width="20" height="20" viewBox="0 0 300 271" fill="#000000" className="group-hover:fill-emerald-600 transition">
                        <path d="M236 0h46L181 115l118 156h-92.6l-72.5-94.8L59 271H13l107-123L0 0h94.9l65.5 86.6L236 0zm-16.1 243h25.5L80.4 26H53.2l166.7 217z"/>
                      </svg>
                    </a>
                  </div>

                  <div style={stitch(215, revealed)}>
                    <a href="https://bayesiansapien.substack.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-100 rounded-lg transition group" title="Substack">
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="#FF6719" className="group-hover:fill-emerald-600 transition">
                        <path d="M15 3.604H1v1.891h14v-1.89ZM1 7.208V16l7-3.926L15 16V7.208zM15 0H1v1.89h14z"/>
                      </svg>
                    </a>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        <div
          className={[
            'transition-all duration-700 ease-out overflow-hidden',
            revealed
              ? 'opacity-100 max-h-[5000px] ' + (REDUCED_MOTION ? '' : 'delay-[1400ms]')
              : 'opacity-0 max-h-0 pointer-events-none'
          ].join(' ')}
          aria-hidden={!revealed}
        >
          <RecentBlogPosts revealed={revealed} />
        </div>
      </main>

      <div
        className={[
          'transition-all duration-700 ease-out overflow-hidden',
          revealed
            ? 'opacity-100 max-h-[400px] ' + (REDUCED_MOTION ? '' : 'delay-[1400ms]')
            : 'opacity-0 max-h-0 pointer-events-none'
        ].join(' ')}
        aria-hidden={!revealed}
      >
        <Footer revealed={revealed} />
      </div>
    </>
  );
}
