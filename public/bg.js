/* Wobble-free neural background - written from scratch */
(() => {
  // State management
  let isInitialized = false;
  let animationId = null;
  let nodes = [];
  let lastTime = 0;
  
  // Canvas setup
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  
  // Start completely invisible and behind everything
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0", 
    width: "100vw",
    height: "100vh",
    zIndex: "0",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 0.4s ease-out"
  });
  
  document.body.appendChild(canvas);
  
  // Configuration
  const config = {
    nodeCount: 350, // Reduced from 450
    maxRadius: 0.45, // percentage of smaller dimension
    color: { r: 82, g: 246, b: 197 },
    pulseSpeed: 0.015,
    orbitalSpeed: 0.0008, // Increased from 0.0003
    ovalStretch: 0.8 // Y compression for oval shape
  };
  
  function rgba(alpha) {
    return `rgba(${config.color.r}, ${config.color.g}, ${config.color.b}, ${alpha})`;
  }
  
  // Proper canvas sizing
  function resizeCanvas() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    
    ctx.scale(dpr, dpr);
  }
  
  // Create node distribution
  function createNodes() {
    nodes = [];
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Use larger radius to cover full viewport
    const maxDistX = width * 0.6;  // 60% of width
    const maxDistY = height * 0.6; // 60% of height
    
    for (let i = 0; i < config.nodeCount; i++) {
      // Generate points in an ellipse covering most of the viewport
      const angle = Math.random() * Math.PI * 2;
      const radiusNorm = Math.sqrt(Math.random()); // 0 to 1
      
      // Calculate position using elliptical distribution
      const radiusX = radiusNorm * maxDistX;
      const radiusY = radiusNorm * maxDistY;
      
      // Base position
      const baseX = centerX + Math.cos(angle) * radiusX;
      const baseY = centerY + Math.sin(angle) * radiusY;
      
      nodes.push({
        // Fixed orbital properties
        centerX: centerX,
        centerY: centerY, 
        baseAngle: angle,
        baseRadiusX: radiusX,
        baseRadiusY: radiusY,
        orbitalSpeed: (Math.random() * 0.5 + 0.5) * config.orbitalSpeed,
        
        // Current position (starts at base)
        x: baseX,
        y: baseY,
        
        // Visual properties
        size: Math.random() * 2 + 1,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: (Math.random() * 0.5 + 0.5) * config.pulseSpeed,
        brightness: Math.random() * 0.4 + 0.6,
        
        // Gentle drift
        driftX: (Math.random() - 0.5) * 0.02,
        driftY: (Math.random() - 0.5) * 0.02
      });
    }
  }
  
  // Get hero bubble for masking — skip when it's collapsed so the canvas
  // particles flow uninterrupted around the BayesianSapien sigil.
  function getHeroBubble() {
    const el = document.getElementById("hero-bubble");
    if (!el) return null;
    if (el.dataset && el.dataset.revealed === "false") return null;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: rect.left - 20,
      y: rect.top - 20,
      width: rect.width + 40,
      height: rect.height + 40,
      radius: 20
    };
  }
  
  // Draw rounded rectangle path
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
  
  // Animation loop
  function animate(currentTime) {
    if (!isInitialized) return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw nodes
    nodes.forEach(node => {
      // Update orbital position
      node.baseAngle += node.orbitalSpeed;
      
      // Calculate target orbital position using elliptical orbit
      const targetX = node.centerX + Math.cos(node.baseAngle) * node.baseRadiusX;
      const targetY = node.centerY + Math.sin(node.baseAngle) * node.baseRadiusY;
      
      // Gentle movement toward target with drift
      node.x += (targetX - node.x) * 0.02 + node.driftX;
      node.y += (targetY - node.y) * 0.02 + node.driftY;
      
      // Update pulse
      node.pulsePhase += node.pulseSpeed;
      const pulse = (Math.sin(node.pulsePhase) + 1) * 0.5;
      
      // Calculate current visual properties
      const currentSize = node.size + pulse * 1.5;
      const currentBrightness = node.brightness + pulse * 0.3;
      const haloSize = currentSize * 2.5;
      
      // Draw halo
      if (pulse > 0.7) { // Increased threshold from 0.5 to 0.7
        const haloGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, haloSize
        );
        haloGradient.addColorStop(0, rgba(currentBrightness * 0.2));
        haloGradient.addColorStop(0.4, rgba(currentBrightness * 0.1));
        haloGradient.addColorStop(1, rgba(0));
        
        ctx.fillStyle = haloGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, haloSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw core node
      const nodeGradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, currentSize
      );
      nodeGradient.addColorStop(0, rgba(currentBrightness));
      nodeGradient.addColorStop(1, rgba(currentBrightness * 0.2));
      
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, currentSize, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Apply hero bubble mask
    const bubble = getHeroBubble();
    if (bubble) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.shadowColor = "rgba(0,0,0,1)";
      ctx.shadowBlur = 25;
      drawRoundedRect(bubble.x, bubble.y, bubble.width, bubble.height, bubble.radius);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
      ctx.restore();
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Debounced resize handler
  let resizeTimeout;
  function handleResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      if (isInitialized) {
        // Update node centers for new viewport
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        nodes.forEach(node => {
          node.centerX = centerX;
          node.centerY = centerY;
        });
      }
    }, 100); // Longer delay to ensure layout is stable
  }
  
  // Initialize everything
  function initialize() {
    resizeCanvas();
    createNodes();
    isInitialized = true;
    
    // Start animation
    animationId = requestAnimationFrame(animate);
    
    // Fade in after everything is ready
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
          // Stable for 3 checks
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
  
  // Start when everything is ready
  function start() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(waitForStability, 100);
      });
    } else {
      setTimeout(waitForStability, 300);
    }
  }
  
  // Event listeners
  window.addEventListener("resize", handleResize);
  
  // Cleanup
  window.addEventListener("beforeunload", () => {
    if (animationId) cancelAnimationFrame(animationId);
  });
  
  // Begin initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();