/* Cosmic background: nebula haze, a slowly turning starfield and an
   emerald spiral galaxy whose core sits behind the sigil. Revealing or
   closing the bio collapses all of it into a singularity at the seal, then
   bursts it back out in a big bang. */
(() => {
  const EMERALD = [82, 246, 197];
  const PALE = [205, 255, 240];
  const WHITE = [232, 240, 255];
  const AMBER = [251, 196, 120];
  const CYAN = [70, 225, 255];      // young hot stars and bright gas along the arms
  const AQUA = [30, 205, 165];
  const GOLD = [255, 176, 80];      // older stars crowding the core

  const reduceMotion =
    !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "0",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 0.6s ease-out"
  });

  document.body.appendChild(canvas);

  const config = {
    tilt: 0.46,            // disc inclination: projected minor/major axis ratio
    positionAngle: -0.38,  // disc rotation on screen, radians
    arms: 2,
    pitch: 0.24,           // tan of the spiral pitch angle
    patternSpeed: 0.012,   // rad/s for the outer disc; inner disc turns faster
    skySpeed: 0.006,       // rad/s for the background starfield
    starScale: 1.15        // global multiplier on every star's size
  };

  const SKY_ALPHA = [0.3, 0.45, 0.62, 0.82];

  let W = 0, H = 0, dpr = 1;
  let cx = 0, cy = 0, R = 0, D = 0;
  let nebula = null;
  let skyBuckets = [], twinklers = [], stars = [];
  let sprites = null;
  let isInitialized = false, animationId = null, timerId = null;
  let lastTime = 0, t = 0, skyAngle = 0;

  // Collapse and big bang, triggered from Home.jsx via a "cosmic:warp" event.
  // Until BANG, space spirals into a singularity at the seal and the sky
  // darkens; at BANG it bursts back out, fast at first and then settling.
  let warp = null;
  const WARP_OPEN = 1.6;
  const WARP_CLOSE = 1.4;
  const BANG = 0.47;          // fraction of the transition spent collapsing
  const PULL = 0.985;
  const TWIST = 2.4;
  let pull = 0, twist = 0, envelope = 0, ringFlow = 0, phase = 0;
  let bx = 0, by = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const easeIn = (p) => p * p * p;
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const easeOutQuint = (p) => 1 - Math.pow(1 - p, 5);
  function gauss() {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

  // Pre-rendered star sprites: a solid core with a thin glow, so stars read
  // as crisp points rather than soft blobs. drawImage of a cached sprite is
  // far cheaper than building a gradient per star per frame.
  function makeSprite(c) {
    const s = 64;
    const el = document.createElement("canvas");
    el.width = el.height = s;
    const g = el.getContext("2d");
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, rgba(c, 1));
    grad.addColorStop(0.18, rgba(c, 1));
    grad.addColorStop(0.24, rgba(c, 0.22));
    grad.addColorStop(0.34, rgba(c, 0.04));
    grad.addColorStop(0.46, rgba(c, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    return el;
  }

  // Where the sigil's center sits in the viewport, so the galactic core lines
  // up with it. Falls back to the layout anchor used in Home.jsx.
  function findCenter() {
    const img = document.querySelector('img[src="/bayesian-sigil.png"]');
    if (img && window.scrollY < 10) {
      const r = img.getBoundingClientRect();
      if (r.width > 0) return [r.left + r.width / 2, r.top + r.height / 2];
    }
    return [W / 2, H * 0.42];
  }

  function resizeCanvas() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    [cx, cy] = findCenter();
    R = Math.max(W, H) * 0.62;
    // Diameter that covers the viewport at any rotation about (cx, cy)
    D = 2 * Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
  }

  // Static haze: the disc's diffuse light. The disc is inclined, so its
  // projected outline stays fixed while its stars circulate.
  function buildNebula() {
    const scale = 0.5;
    const el = document.createElement("canvas");
    el.width = Math.max(1, Math.round(W * scale));
    el.height = Math.max(1, Math.round(H * scale));
    const g = el.getContext("2d");
    g.scale(scale, scale);

    const blob = (x, y, r, c, a, sx = 1, sy = 1, rot = 0) => {
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.scale(sx, sy);
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, r);
      grad.addColorStop(0, rgba(c, a));
      grad.addColorStop(0.45, rgba(c, a * 0.45));
      grad.addColorStop(1, rgba(c, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.fill();
      g.restore();
    };

    const TEAL = [30, 150, 160];
    const OCEAN = [20, 110, 170];

    blob(cx, cy, R * 0.95, TEAL, 0.07, 1, config.tilt, config.positionAngle);
    blob(cx, cy, R * 0.55, EMERALD, 0.07, 1, config.tilt, config.positionAngle);
    blob(cx, cy, R * 0.8, OCEAN, 0.06, 1, config.tilt * 1.1, config.positionAngle + 0.2);
    blob(cx, cy, R * 0.22, GOLD, 0.12, 1, 0.75, config.positionAngle);
    blob(cx, cy, R * 0.1, AMBER, 0.14, 1, 0.8, config.positionAngle);

    // Faint noise breaks up the banding that low-alpha gradients show
    const img = g.getImageData(0, 0, el.width, el.height);
    const px = img.data;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] === 0) continue;
      const n = (Math.random() - 0.5) * 6;
      px[i] += n;
      px[i + 1] += n;
      px[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    return el;
  }

  function createStars() {
    const area = W * H;

    // Far starfield, drawn live each frame at full device resolution so the
    // points stay sharp on high-DPI screens. Stored relative to the core.
    // Bucketed by colour and alpha so each bucket fills as a single path.
    skyBuckets = SKY_ALPHA.flatMap((a) => [
      { color: WHITE, alpha: a, stars: [] },
      { color: PALE, alpha: a, stars: [] }
    ]);
    const skyCount = Math.round(Math.min(2000, Math.max(420, (D * D) / 1800)));
    for (let i = 0; i < skyCount; i++) {
      const bucket = ((Math.random() * SKY_ALPHA.length) | 0) * 2 + (Math.random() < 0.8 ? 0 : 1);
      skyBuckets[bucket].stars.push({
        x: rand(-0.5, 0.5) * D,
        y: rand(-0.5, 0.5) * D,
        r: (Math.pow(Math.random(), 3) * 0.9 + 0.35) * config.starScale
      });
    }

    twinklers = [];
    const tCount = Math.round(Math.min(140, Math.max(50, area / 9000)));
    for (let i = 0; i < tCount; i++) {
      twinklers.push({
        x: rand(-0.5, 0.5) * D,
        y: rand(-0.5, 0.5) * D,
        size: rand(0.8, 2),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.6, 2.2),
        color: Math.random() < 0.7 ? WHITE : PALE
      });
    }

    // Galaxy: bulge, two log-spiral arms, and a loose inter-arm population
    stars = [];
    const count = Math.round(Math.min(2000, Math.max(560, area / 700)));
    const r0 = R * 0.06;
    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      let r, theta, kind;
      if (roll < 0.15) {
        kind = "bulge";
        r = Math.abs(gauss()) * R * 0.1 + R * 0.015;
        theta = rand(0, Math.PI * 2);
      } else if (roll < 0.78) {
        kind = "arm";
        r = r0 + Math.pow(Math.random(), 0.85) * (R - r0);
        const arm = i % config.arms;
        const spread = 0.28 + 0.12 * (r / R);
        theta = (arm * 2 * Math.PI) / config.arms + Math.log(r / r0) / config.pitch + gauss() * spread;
        r *= 1 + gauss() * 0.05;
      } else {
        kind = "disc";
        r = r0 + Math.sqrt(Math.random()) * (R * 1.05 - r0);
        theta = rand(0, Math.PI * 2);
      }

      let color = EMERALD;
      const c = Math.random();
      if (kind === "bulge") color = c < 0.4 ? GOLD : c < 0.7 ? AMBER : c < 0.88 ? PALE : EMERALD;
      else if (kind === "arm" && c < 0.14) color = CYAN;
      else if (kind === "arm" && c < 0.22) color = AQUA;
      else if (c < 0.28) color = PALE;
      else if (c < 0.33) color = WHITE;
      else if (c < 0.36) color = AMBER;

      stars.push({
        r,
        theta,
        // Inner disc turns faster than the rim: gentle differential rotation
        omega: config.patternSpeed * (1 + 0.45 * (1 - Math.min(1, r / R))) * rand(0.94, 1.06),
        // Stars sit slightly above/below the plane
        z: gauss() * (kind === "bulge" ? 0.35 : 0.06) * r,
        size: kind === "arm" ? rand(0.8, 2.2) : rand(0.6, 1.5),
        brightness: kind === "disc" ? rand(0.4, 0.7) : rand(0.65, 1),
        phase: rand(0, Math.PI * 2),
        pulse: rand(0.4, 1.4),
        color
      });
    }
  }

  // Map a screen point through the wormhole into (bx, by): pulled toward the
  // throat and twisted around it, inner space twisting hardest.
  function bend(x, y) {
    if (!pull && !twist) {
      bx = x;
      by = y;
      return;
    }
    const dx = x - warp.x;
    const dy = y - warp.y;
    const d = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx) + twist * (1 - Math.min(1, d / (D * 0.6)));
    const nd = d * (1 - pull);
    bx = warp.x + Math.cos(a) * nd;
    by = warp.y + Math.sin(a) * nd;
  }

  function updateWarp(dt) {
    pull = twist = envelope = 0;
    if (!warp) return;
    const p = (t - warp.start) / warp.duration;
    if (p >= 1) {
      warp = null;
      return;
    }
    phase = p;
    if (p < BANG) {
      const q = easeIn(p / BANG);
      envelope = q;
      pull = PULL * q;
      twist = TWIST * q * warp.spin;
      ringFlow -= dt * 1.1;     // fabric rings drawn into the point
    } else {
      // Explosive at first, then settling back into place
      const q = 1 - easeOutQuint((p - BANG) / (1 - BANG));
      envelope = q;
      pull = PULL * q;
      twist = TWIST * 0.25 * q * warp.spin; // expands outward rather than unwinding
      ringFlow += dt * 1.6;     // and flung outward by the bang
    }
  }

  // Space-time fabric rings flowing into the point (collapse) and out of it
  // (expansion), a darkening sky, the singularity itself, and the bang.
  function drawCollapse() {
    const maxR = Math.hypot(W, H);
    const n = 9;
    const flow = ((ringFlow % 1) + 1) % 1;
    if (envelope > 0.01) {
      ctx.lineWidth = 1;
      for (let i = 0; i < n; i++) {
        const f = (i + flow) / n;
        const r = f * f * maxR;
        if (r < 4) continue;
        ctx.beginPath();
        ctx.ellipse(warp.x, warp.y, r, r * 0.86, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(EMERALD, 0.14 * envelope * Math.min(1, f * 2.2));
        ctx.stroke();
      }

      const vignette = ctx.createRadialGradient(warp.x, warp.y, maxR * 0.05, warp.x, warp.y, maxR * 0.7);
      vignette.addColorStop(0, "rgba(3, 7, 16, 0)");
      vignette.addColorStop(1, `rgba(3, 7, 16, ${0.7 * envelope})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.globalCompositeOperation = "lighter";
    // The singularity: a pinpoint that tightens and brightens just before
    // the bang, then burns off as space expands
    const s = phase < BANG ? easeIn(phase / BANG) : Math.max(0, 1 - (phase - BANG) / 0.12);
    if (s > 0.02) {
      const pr = 3 + 5 * s;
      const core = ctx.createRadialGradient(warp.x, warp.y, 0, warp.x, warp.y, pr * 4);
      core.addColorStop(0, rgba(WHITE, 0.95 * s));
      core.addColorStop(0.25, rgba(PALE, 0.6 * s));
      core.addColorStop(1, rgba(EMERALD, 0));
      ctx.fillStyle = core;
      ctx.fillRect(warp.x - pr * 4, warp.y - pr * 4, pr * 8, pr * 8);
    }
    // The bang: a soft bloom and a thin wavefront racing outward
    if (phase >= BANG) {
      const b = (phase - BANG) / (1 - BANG);
      const bloomR = Math.min(W, H) * (0.08 + 0.4 * easeOut(Math.min(1, b / 0.35)));
      const bloomA = Math.max(0, 1 - b / 0.35);
      if (bloomA > 0) {
        const bloom = ctx.createRadialGradient(warp.x, warp.y, 0, warp.x, warp.y, bloomR);
        bloom.addColorStop(0, rgba(PALE, 0.35 * bloomA));
        bloom.addColorStop(0.4, rgba(EMERALD, 0.14 * bloomA));
        bloom.addColorStop(1, rgba(EMERALD, 0));
        ctx.fillStyle = bloom;
        ctx.fillRect(warp.x - bloomR, warp.y - bloomR, bloomR * 2, bloomR * 2);
      }
      const front = easeOut(Math.min(1, b / 0.6)) * maxR;
      const frontA = Math.max(0, 1 - b / 0.6);
      if (frontA > 0 && front > 2) {
        ctx.beginPath();
        ctx.ellipse(warp.x, warp.y, front, front * 0.86, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(PALE, 0.3 * frontA);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }

  window.addEventListener("cosmic:warp", (e) => {
    if (reduceMotion || !isInitialized) return;
    const d = e.detail || {};
    const onScreen = d.x >= 0 && d.x <= W && d.y >= 0 && d.y <= H;
    warp = {
      start: t,
      // Opening spirals clockwise (positive angle, y pointing down);
      // closing winds the other way
      spin: d.dir < 0 ? -1 : 1,
      duration: d.dir < 0 ? WARP_CLOSE : WARP_OPEN,
      x: onScreen ? d.x : cx,
      y: onScreen ? d.y : cy
    };
  });

  // Get hero bubble for masking — skip when it's collapsed so the canvas
  // flows uninterrupted around the BayesianSapien sigil.
  function getHeroBubble() {
    const el = document.getElementById("hero-bubble");
    if (!el) return null;
    if (el.dataset && el.dataset.revealed === "false") return null;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    // Exactly the card's footprint (rounded-3xl = 24px) so the dimmed area
    // never peeks out past its edges.
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      radius: 24
    };
  }

  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }


  function draw(dt) {
    t += dt;
    skyAngle += config.skySpeed * dt;
    updateWarp(dt);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);

    if (pull) {
      // The haze gets squeezed toward the singularity with everything else
      const k = 1 - pull * 0.9;
      ctx.save();
      ctx.translate(warp.x, warp.y);
      ctx.scale(k, k);
      ctx.translate(-warp.x, -warp.y);
      ctx.globalAlpha = 0.4 + 0.6 * k;
      ctx.drawImage(nebula, 0, 0, W, H);
      ctx.restore();
    } else {
      ctx.drawImage(nebula, 0, 0, W, H);
    }

    // Far starfield: batched into one path per colour/alpha bucket
    const cosS = Math.cos(skyAngle);
    const sinS = Math.sin(skyAngle);
    for (const bucket of skyBuckets) {
      ctx.beginPath();
      for (const s of bucket.stars) {
        bend(cx + s.x * cosS - s.y * sinS, cy + s.x * sinS + s.y * cosS);
        if (bx < -2 || bx > W + 2 || by < -2 || by > H + 2) continue;
        ctx.moveTo(bx + s.r, by);
        ctx.arc(bx, by, s.r, 0, Math.PI * 2);
      }
      ctx.fillStyle = rgba(bucket.color, bucket.alpha);
      ctx.fill();
    }

    for (const s of twinklers) {
      bend(cx + s.x * cosS - s.y * sinS, cy + s.x * sinS + s.y * cosS);
      if (bx < -10 || bx > W + 10 || by < -10 || by > H + 10) continue;
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      const size = s.size * 4 * config.starScale;
      ctx.globalAlpha = a * 0.9;
      ctx.drawImage(sprites.get(s.color), bx - size / 2, by - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    // Galaxy: additive blending so dense arms and the bulge bloom
    ctx.globalCompositeOperation = "lighter";
    const cosP = Math.cos(config.positionAngle);
    const sinP = Math.sin(config.positionAngle);
    for (const s of stars) {
      s.theta += s.omega * dt;
      const dx = Math.cos(s.theta) * s.r;
      const dy = Math.sin(s.theta) * s.r * config.tilt + s.z * (1 - config.tilt);
      bend(cx + dx * cosP - dy * sinP, cy + dx * sinP + dy * cosP);
      if (bx < -20 || bx > W + 20 || by < -20 || by > H + 20) continue;
      const pulse = 0.5 + 0.5 * Math.sin(t * s.pulse + s.phase);
      const size = (s.size + pulse * 0.5) * 4.5 * config.starScale;
      ctx.globalAlpha = Math.min(1, s.brightness * (0.75 + 0.25 * pulse));
      ctx.drawImage(sprites.get(s.color), bx - size / 2, by - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (warp) drawCollapse();

    // Dim rather than erase: the glass card blurs what's left behind it,
    // so the galaxy glows through instead of leaving a flat dark cut-out.
    const bubble = getHeroBubble();
    if (bubble) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      drawRoundedRect(bubble.x, bubble.y, bubble.width, bubble.height, bubble.radius);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fill();
      ctx.restore();
    }
  }


  function animate(currentTime) {
    if (!isInitialized) return;
    const dt = lastTime ? Math.min(0.05, (currentTime - lastTime) / 1000) : 0;
    lastTime = currentTime;
    draw(dt);
    animationId = requestAnimationFrame(animate);
  }

  // Reduced motion: hold a still sky, but keep redrawing occasionally so the
  // hero-bubble mask follows reveal/close and scrolling.
  function still() {
    if (!isInitialized) return;
    draw(0);
    timerId = setTimeout(still, 250);
  }

  function startLoop() {
    stopLoop();
    lastTime = 0;
    if (reduceMotion) still();
    else animationId = requestAnimationFrame(animate);
  }

  function stopLoop() {
    if (animationId) cancelAnimationFrame(animationId);
    if (timerId) clearTimeout(timerId);
    animationId = timerId = null;
  }

  function rebuild() {
    resizeCanvas();
    nebula = buildNebula();
    createStars();
  }

  // Debounced resize. Ignore height-only changes under ~120px so mobile
  // browser toolbars sliding in and out don't regenerate the sky mid-scroll.
  let resizeTimeout;
  function handleResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!isInitialized) return;
      const widthChanged = window.innerWidth !== W;
      const heightJump = Math.abs(window.innerHeight - H) > 120;
      if (widthChanged || heightJump) rebuild();
    }, 150);
  }

  function initialize() {
    const palette = [EMERALD, PALE, WHITE, AMBER, CYAN, AQUA, GOLD];
    sprites = new Map(palette.map((c) => [c, makeSprite(c)]));
    rebuild();
    isInitialized = true;
    startLoop();
    setTimeout(() => {
      canvas.style.opacity = "1";
    }, 150);
  }

  // Wait for stable environment
  function waitForStability() {
    let stabilityChecks = 0;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    function checkStable() {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      if (currentWidth === lastWidth && currentHeight === lastHeight) {
        stabilityChecks++;
        if (stabilityChecks >= 3) {
          initialize();
          return;
        }
      } else {
        stabilityChecks = 0;
        lastWidth = currentWidth;
        lastHeight = currentHeight;
      }

      setTimeout(checkStable, 100);
    }

    setTimeout(checkStable, 200);
  }

  function start() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(waitForStability, 100);
      });
    } else {
      setTimeout(waitForStability, 300);
    }
  }

  window.addEventListener("resize", handleResize);

  // Don't burn battery in background tabs
  document.addEventListener("visibilitychange", () => {
    if (!isInitialized) return;
    if (document.hidden) stopLoop();
    else startLoop();
  });

  window.addEventListener("beforeunload", stopLoop);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
