// When space re-expands after the big bang (see public/bg.js), the page is
// stitched together from its pieces: each word, button, card and icon flies
// in from a scattered offset and locks into place. Offsets are seeded by
// index so they stay put across renders. `extra` delays a piece further so
// the page assembles top to bottom.
// Must match public/bg.js: BANG (0.47) x WARP_OPEN (1.6s).
export const BANG_MS = 750;

// Reduced-motion visitors get no warp, so pieces just fade in place.
export const REDUCED_MOTION =
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function scatter(i) {
  const r = (n) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { dx: (r(1) - 0.5) * 110, dy: (r(2) - 0.5) * 70, rot: (r(3) - 0.5) * 30, jitter: r(4) };
}

export function stitch(i, revealed, extra = 0) {
  if (REDUCED_MOTION) return { opacity: revealed ? 1 : 0, transition: 'opacity 300ms ease-out' };
  const { dx, dy, rot, jitter } = scatter(i);
  if (revealed) {
    const delay = BANG_MS + 80 + extra + jitter * 450;
    return {
      transform: 'none',
      opacity: 1,
      transition: `transform 750ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 350ms ease-out ${delay}ms`
    };
  }
  return {
    transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.5)`,
    opacity: 0,
    transition: `transform 420ms ease-in ${jitter * 120}ms, opacity 320ms ease-in ${jitter * 120}ms`
  };
}
