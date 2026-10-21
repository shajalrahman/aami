/* ============================================
   CINEMATIC BIRTHDAY - Main JavaScript
   ============================================ */

// === State ===
const PASSCODE = '1234';
let enteredCode = '';
let currentScreen = 'screen-card';

// === DOM References ===
const screens = {
  card:    document.getElementById('screen-card'),
  lamp:    document.getElementById('screen-lamp'),
  fire:    document.getElementById('screen-fire'),
  cake:    document.getElementById('screen-cake'),
  message: document.getElementById('screen-message'),
  game:    document.getElementById('screen-game'),
};

const bgMusic = document.getElementById('bg-music');

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  initPolaroidCard();
  initPasscodeKeypad();
  initLampPull();
  initFireButton();
  initCakeScreen();
  initEnvelopeLetter();
  initBalloonGame();
});

// ============================================
// FLOATING HEARTS
// ============================================
function createFloatingHearts() {
  const container = document.getElementById('floating-hearts');
  const hearts = ['♡', '♥', '♡', '♥', '♡', '♥', '♡'];
  
  hearts.forEach((h, i) => {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    el.textContent = h;
    el.style.left = `${5 + Math.random() * 90}%`;
    el.style.animationDuration = `${12 + Math.random() * 10}s`;
    el.style.animationDelay = `${i * 2.5 + Math.random() * 3}s`;
    el.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
    container.appendChild(el);
  });
}

// ============================================
// SCREEN TRANSITIONS
// ============================================
function transitionTo(screenKey) {
  // Fade out current
  Object.values(screens).forEach(s => s.classList.remove('active'));
  
  // Small delay then show new
  setTimeout(() => {
    screens[screenKey].classList.add('active');
    currentScreen = screenKey;
  }, 400);
}

// ============================================
// SCREEN 1: POLAROID CARD + PASSCODE
// ============================================
function initPolaroidCard() {
  const flipCard = document.getElementById('flip-card');
  const frontSide = flipCard.querySelector('.flip-card-front');

  frontSide.addEventListener('click', () => {
    flipCard.classList.add('flipped');
  });

  document.getElementById('unflip-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    flipCard.classList.remove('flipped');
  });
}

function initPasscodeKeypad() {
  const dotsContainer = document.getElementById('dots-container');
  const keypadGrid = document.getElementById('keypad-grid');

  // Create 4 dot boxes
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot-box';
    dotsContainer.appendChild(dot);
  }

  // Create keypad buttons
  const keys = ['1','2','3','4','5','6','7','8','9','*','0','⌫'];
  keys.forEach(key => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `keypad-btn${key === '⌫' ? ' delete-btn' : ''}`;
    btn.textContent = key;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleKeyPress(key);
    });
    keypadGrid.appendChild(btn);
  });
}

function handleKeyPress(key) {
  const dots = document.querySelectorAll('.dot-box');

  if (key === '⌫') {
    if (enteredCode.length > 0) {
      enteredCode = enteredCode.slice(0, -1);
      updateDots(dots);
    }
    return;
  }

  if (enteredCode.length >= 4) return;

  enteredCode += key;
  updateDots(dots);

  // Check passcode when 4 digits entered
  if (enteredCode.length === 4) {
    setTimeout(() => {
      if (enteredCode === PASSCODE) {
        // Success feedback
        dots.forEach(d => d.classList.add('success'));
        // Trigger flower burst animation
        createFlowerBurst(() => {
          playMusic();
          transitionTo('lamp');
        });
      } else {
        // Error - shake and reset
        dots.forEach(d => d.classList.add('error'));
        setTimeout(() => {
          enteredCode = '';
          dots.forEach(d => {
            d.classList.remove('error', 'filled');
          });
        }, 600);
      }
    }, 200);
  }
}

// ============================================
// FLOWER BURST ANIMATION (passcode success)
// ============================================
function createFlowerBurst(onComplete) {
  // Remove any existing overlay
  const existing = document.getElementById('flower-overlay');
  if (existing) existing.remove();

  // Real flower image paths from /Flowers folder
  const flowerImages = [
    '/Flowers/Isolated Blush Pink Blossom.png',
    '/Flowers/Isolated Photorealistic Pink Rose Bloom.png',
    '/Flowers/Isolated Pink Rose Bloom.png',
    '/Flowers/Pink Anemone with Purple Center.png',
    '/Flowers/Pink Wild Rose Blossom Cutout.png',
    '/Flowers/Realistic Pink Blossom Cutout (1).png',
    '/Flowers/Realistic Pink Blossom Cutout.png',
  ];

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'flower-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: all;
    overflow: hidden;
    background: transparent;
  `;
  document.body.appendChild(overlay);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const COUNT = 250;
  const flowers = [];

  // Generate spawn positions on all 4 edges
  function getEdgeStart(i) {
    const edge = i % 4;
    if (edge === 0) return { x: Math.random() * W,       y: -60 };          // top
    if (edge === 1) return { x: W + 60,                  y: Math.random() * H }; // right
    if (edge === 2) return { x: Math.random() * W,       y: H + 60 };        // bottom
    return              { x: -60,                         y: Math.random() * H }; // left
  }

  // Target = random point on screen (for covering the full screen)
  function getTarget() {
    return {
      x: W * 0.05 + Math.random() * W * 0.9,
      y: H * 0.05 + Math.random() * H * 0.9,
    };
  }

  // Create all flower elements
  for (let i = 0; i < COUNT; i++) {
    const start = getEdgeStart(i);
    const target = getTarget();
    const size = 100 + Math.random() * 80; // 100–180px (large)
    const src = flowerImages[Math.floor(Math.random() * flowerImages.length)];
    const delay = Math.random() * 700; // stagger 0–700ms
    const spinDir = Math.random() > 0.5 ? 1 : -1;
    const spinSpeed = 0.1 + Math.random() * 0.2; // 0.1–0.3 rot/sec (very slow)

    const el = document.createElement('img');
    el.src = src;
    el.draggable = false;
    el.style.cssText = `
      position: absolute;
      left: ${start.x}px;
      top: ${start.y}px;
      width: ${size}px;
      height: ${size}px;
      object-fit: contain;
      transform: translate(-50%, -50%) rotate(0deg);
      opacity: 0;
      will-change: transform, opacity;
      transition: none;
      user-select: none;
      pointer-events: none;
    `;
    overlay.appendChild(el);

    flowers.push({ el, start, target, delay, spinDir, spinSpeed, size });
  }

  // --- Phase 1: Fly IN from edges ---
  const IN_DURATION = 2800; // ms (very slow, dreamy)
  let animating = true;
  let phase = 'in';
  let phaseStart = null;
  let holdStart = null;
  const HOLD_DURATION = 500; // ms on screen

  // Track per-flower rotation angles
  const angles = new Array(COUNT).fill(0);
  let lastTime = null;

  function animate(now) {
    if (!animating) return;
    if (!lastTime) lastTime = now;
    const dt = now - lastTime;
    lastTime = now;

    if (phase === 'in') {
      if (!phaseStart) phaseStart = now;
      const elapsed = now - phaseStart;

      flowers.forEach((f, i) => {
        const t = Math.max(0, Math.min(1, (elapsed - f.delay) / IN_DURATION));
        const ease = easeOutBack(t);
        const x = f.start.x + (f.target.x - f.start.x) * ease;
        const y = f.start.y + (f.target.y - f.start.y) * ease;

        angles[i] += (f.spinSpeed * 360 * dt) / 1000 * f.spinDir;
        f.el.style.left = x + 'px';
        f.el.style.top = y + 'px';
        f.el.style.opacity = Math.min(t * 3, 1);
        f.el.style.transform = `translate(-50%, -50%) rotate(${angles[i]}deg)`;
      });

      // All flowers arrived (max delay + duration)
      if (elapsed > 700 + IN_DURATION) {
        phase = 'hold';
        holdStart = now;
      }
    } else if (phase === 'hold') {
      const elapsed = now - holdStart;

      // Keep rotating
      flowers.forEach((f, i) => {
        angles[i] += (f.spinSpeed * 360 * dt) / 1000 * f.spinDir;
        f.el.style.transform = `translate(-50%, -50%) rotate(${angles[i]}deg)`;
      });

      if (elapsed >= HOLD_DURATION) {
        phase = 'out';
        phaseStart = now;
      }
    } else if (phase === 'out') {
      // --- Phase 2: Fly OUT back to edges ---
      const OUT_DURATION = 2200; // ms (very slow exit)
      const elapsed = now - phaseStart;

      flowers.forEach((f, i) => {
        const t = Math.max(0, Math.min(1, (elapsed - f.delay * 0.3) / OUT_DURATION));
        const ease = easeInQuad(t);
        const x = f.target.x + (f.start.x - f.target.x) * t;
        const y = f.target.y + (f.start.y - f.target.y) * t;

        angles[i] += (f.spinSpeed * 360 * dt) / 1000 * f.spinDir;
        f.el.style.left = x + 'px';
        f.el.style.top = y + 'px';
        f.el.style.opacity = '1'; // stay fully visible — just slide off screen
        f.el.style.transform = `translate(-50%, -50%) rotate(${angles[i]}deg)`;
      });

      if (elapsed > 300 + OUT_DURATION) {
        animating = false;
        overlay.remove();
        if (onComplete) onComplete();
        return;
      }
    }

    requestAnimationFrame(animate);
  }

  // Tap to skip
  overlay.addEventListener('click', () => {
    if (phase === 'hold' || phase === 'in') {
      // Jump to out phase
      phase = 'out';
      phaseStart = performance.now();
      flowers.forEach(f => { f.delay = 0; });
    }
  });

  requestAnimationFrame(animate);
}

// Easing helpers
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeInBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
}
function easeInQuad(t) {
  return t * t;
}

function updateDots(dots) {
  dots.forEach((d, i) => {
    if (i < enteredCode.length) {
      d.classList.add('filled');
    } else {
      d.classList.remove('filled');
    }
  });
}

// ============================================
// MUSIC
// ============================================
function playMusic() {
  if (bgMusic) {
    bgMusic.volume = 0.4;
    bgMusic.play().catch(() => {
      // Browser might block autoplay, that's ok
      console.log('Music autoplay blocked');
    });
  }
}

// ============================================
// SCREEN 2: LAMP PULL (SVG smooth rope)
// ============================================
function initLampPull() {
  const handle = document.getElementById('chain-handle');
  const svg    = document.getElementById('chain-svg');
  const hint   = document.getElementById('drag-hint');
  const lampBody = document.getElementById('lamp-body');

  // Chain visual: SVG path + repeating oval chain links along the curve
  const CHAIN_COLOR  = '#b88a9a';
  const CHAIN_WIDTH  = 3;
  const LINK_COUNT   = 14;   // number of chain ovals drawn along the path
  const TRIGGER_DIST = 140;  // px — pull this far to trigger
  const REST_CHAIN   = 130;  // resting chain length (px)

  // Spring physics state
  let handleX = 0, handleY = 0;  // current handle pos (screen coords)
  let velX = 0, velY = 0;
  let anchorX = 0, anchorY = 0;  // bottom of lamp cap
  let isDragging = false;
  let targetX = 0, targetY = 0;
  let triggered = false;
  let animFrame = null;

  // SVG elements
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', CHAIN_COLOR);
  path.setAttribute('stroke-width', CHAIN_WIDTH);
  path.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path);

  // Chain link ovals (ellipse elements along the path)
  const links = [];
  for (let i = 0; i < LINK_COUNT; i++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    g.setAttribute('rx', 5);
    g.setAttribute('ry', 8);
    g.setAttribute('fill', 'none');
    g.setAttribute('stroke', CHAIN_COLOR);
    g.setAttribute('stroke-width', 1.8);
    svg.appendChild(g);
    links.push(g);
  }

  function getAnchor() {
    const lb = document.getElementById('lamp-body');
    if (!lb) return { x: window.innerWidth / 2, y: 260 };
    const r = lb.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.bottom };
  }

  function setRestPosition() {
    const a = getAnchor();
    anchorX = a.x;
    anchorY = a.y;
    handleX = anchorX;
    handleY = anchorY + REST_CHAIN;
    velX = 0; velY = 0;
  }

  function positionHandle() {
    handle.style.left = handleX + 'px';
    handle.style.top  = handleY + 'px';
  }

  function drawChain() {
    // Bezier control points: mid-point sags naturally
    const cx = (anchorX + handleX) / 2;
    const cy = (anchorY + handleY) / 2 + 18; // slight sag

    const d = `M ${anchorX} ${anchorY} Q ${cx} ${cy} ${handleX} ${handleY}`;
    path.setAttribute('d', d);

    // Place chain ovals along the quadratic bezier
    for (let i = 0; i < LINK_COUNT; i++) {
      const t = (i + 1) / (LINK_COUNT + 1);
      // Quadratic bezier point
      const bx = (1-t)*(1-t)*anchorX + 2*(1-t)*t*cx + t*t*handleX;
      const by = (1-t)*(1-t)*anchorY + 2*(1-t)*t*cy + t*t*handleY;
      // Tangent for rotation
      const tx = 2*(1-t)*(cx-anchorX) + 2*t*(handleX-cx);
      const ty = 2*(1-t)*(cy-anchorY) + 2*t*(handleY-cy);
      const angle = Math.atan2(ty, tx) * 180 / Math.PI;

      links[i].setAttribute('cx', bx);
      links[i].setAttribute('cy', by);
      links[i].setAttribute('transform', `rotate(${angle + 90}, ${bx}, ${by})`);
    }
  }

  function physicsLoop() {
    if (!isDragging && !triggered) {
      // Spring back to rest
      const a = getAnchor();
      anchorX = a.x;
      anchorY = a.y;
      const restX = anchorX;
      const restY = anchorY + REST_CHAIN;

      const stiffness = 0.12;
      const damping   = 0.78;

      const fx = (restX - handleX) * stiffness;
      const fy = (restY - handleY) * stiffness;
      velX = (velX + fx) * damping;
      velY = (velY + fy) * damping;
      handleX += velX;
      handleY += velY;

      positionHandle();
      drawChain();

      // Fade hint based on distance pulled
      const dist = Math.hypot(handleX - restX, handleY - restY);
      hint.style.opacity = Math.max(0, 1 - dist / TRIGGER_DIST);
    }

    animFrame = requestAnimationFrame(physicsLoop);
  }

  function onStart(e) {
    if (triggered) return;
    isDragging = true;
    handle.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onMove(e) {
    if (!isDragging || triggered) return;
    e.preventDefault();
    const pt = getPointer(e);
    const a  = getAnchor();
    anchorX  = a.x;
    anchorY  = a.y;

    // Constrain to max reach
    const dx   = pt.x - anchorX;
    const dy   = pt.y - anchorY;
    const dist = Math.hypot(dx, dy);
    const maxReach = 240;
    if (dist > maxReach) {
      targetX = anchorX + (dx / dist) * maxReach;
      targetY = anchorY + (dy / dist) * maxReach;
    } else {
      targetX = pt.x;
      targetY = pt.y;
    }

    // Smooth follow
    handleX += (targetX - handleX) * 0.35;
    handleY += (targetY - handleY) * 0.35;

    positionHandle();
    drawChain();

    // Update hint fade
    hint.style.opacity = Math.max(0, 1 - dist / TRIGGER_DIST);
  }

  function onEnd(e) {
    if (!isDragging || triggered) return;
    isDragging = false;
    handle.style.cursor = 'grab';

    const a = getAnchor();
    const dist = Math.hypot(handleX - a.x, handleY - a.y);

    if (dist >= TRIGGER_DIST) {
      triggered = true;
      cancelAnimationFrame(animFrame);
      hint.style.opacity = '0';

      // Hide chain & handle immediately
      path.style.transition  = 'opacity 0.15s';
      path.style.opacity = '0';
      links.forEach(l => { l.style.transition = 'opacity 0.15s'; l.style.opacity = '0'; });
      handle.style.transition = 'opacity 0.15s';
      handle.style.opacity = '0';

      // Slide the ENTIRE lamp screen off to the left
      const lampScreen = document.getElementById('screen-lamp');
      lampScreen.style.transition = 'transform 0.65s cubic-bezier(0.4, 0, 0.8, 0.6)';
      lampScreen.style.transform  = 'translateX(-110vw)';

      // After slide completes → fade in fire screen
      setTimeout(() => {
        transitionTo('fire');

        // Reset lamp screen silently (no transition) so it's ready next time
        setTimeout(() => {
          lampScreen.style.transition = 'none';
          lampScreen.style.transform  = '';
          triggered = false;
          path.style.opacity   = '1';
          links.forEach(l => { l.style.opacity = '1'; });
          handle.style.opacity = '1';
          if (lampBody) { lampBody.style.transform = ''; lampBody.style.opacity = ''; }
          setRestPosition();
          positionHandle();
          drawChain();
          // Re-enable transition on lamp screen for next use
          setTimeout(() => { lampScreen.style.transition = ''; }, 50);
          animFrame = requestAnimationFrame(physicsLoop);
        }, 600);
      }, 700);
    }
    // else spring snaps back via physicsLoop
  }

  function getPointer(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  // Init
  setRestPosition();
  positionHandle();
  drawChain();
  animFrame = requestAnimationFrame(physicsLoop);

  // Events on handle only for start; global for move/end
  handle.addEventListener('mousedown',  onStart);
  handle.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('mousemove',  onMove);
  window.addEventListener('touchmove',  onMove, { passive: false });
  window.addEventListener('mouseup',    onEnd);
  window.addEventListener('touchend',   onEnd);
}


// ============================================
// SCREEN 3: FIRE EMOJI
// ============================================
function initFireButton() {
  const fireBtn = document.getElementById('fire-btn');

  fireBtn.addEventListener('click', () => {
    // Pulse the button
    fireBtn.style.transform = 'scale(1.3)';
    fireBtn.style.boxShadow = '0 0 60px rgba(255, 150, 180, 0.7)';
    fireBtn.style.transition = 'all 0.3s ease';
    fireBtn.style.pointerEvents = 'none'; // prevent double click

    // Launch flowers from bottom → transition to cake when done
    createBottomFlowerBurst(() => {
      transitionTo('cake');
      initCandleFlames();
    });
  });
}

// ============================================
// BOTTOM-TO-TOP FLOWER BURST (fire screen)
// ============================================
function createBottomFlowerBurst(onComplete) {
  // Remove any stale overlay
  const existing = document.getElementById('flower-overlay');
  if (existing) existing.remove();

  const flowerImages = [
    '/Flowers/Isolated Blush Pink Blossom.png',
    '/Flowers/Isolated Photorealistic Pink Rose Bloom.png',
    '/Flowers/Isolated Pink Rose Bloom.png',
    '/Flowers/Pink Anemone with Purple Center.png',
    '/Flowers/Pink Wild Rose Blossom Cutout.png',
    '/Flowers/Realistic Pink Blossom Cutout (1).png',
    '/Flowers/Realistic Pink Blossom Cutout.png',
  ];

  const overlay = document.createElement('div');
  overlay.id = 'flower-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    pointer-events: all; overflow: hidden; background: transparent;
  `;
  document.body.appendChild(overlay);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const COUNT = 200;
  const IN_DURATION  = 2400; // ms to rise up
  const HOLD_DURATION = 400;  // ms to linger
  const OUT_DURATION = 1800; // ms to exit upward

  const flowers = [];
  const angles  = new Array(COUNT).fill(0);
  let lastTime  = null;
  let phase     = 'in';
  let phaseStart = null;
  let holdStart  = null;
  let animating  = true;

  for (let i = 0; i < COUNT; i++) {
    // Spawn: random x along bottom edge, just below viewport
    const startX = Math.random() * W;
    const startY = H + 60 + Math.random() * 80;

    // Target: random position covering the full screen
    const targetX = W * 0.03 + Math.random() * W * 0.94;
    const targetY = H * 0.02 + Math.random() * H * 0.96;

    const size     = 90 + Math.random() * 90;       // 90–180 px
    const src      = flowerImages[Math.floor(Math.random() * flowerImages.length)];
    const delay    = Math.random() * 600;            // stagger 0–600 ms
    const spinDir  = Math.random() > 0.5 ? 1 : -1;
    const spinSpd  = 0.08 + Math.random() * 0.18;   // slow gentle spin

    const el = document.createElement('img');
    el.src = src;
    el.draggable = false;
    el.style.cssText = `
      position: absolute;
      left: ${startX}px; top: ${startY}px;
      width: ${size}px; height: ${size}px;
      object-fit: contain;
      transform: translate(-50%, -50%) rotate(0deg);
      opacity: 0;
      will-change: transform, opacity;
      pointer-events: none;
      user-select: none;
    `;
    overlay.appendChild(el);
    flowers.push({ el, startX, startY, targetX, targetY, delay, spinDir, spinSpd, size });
  }

  // Easing helpers (local scope)
  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }
  function easeInQuad(t)   { return t * t; }

  function animate(now) {
    if (!animating) return;
    if (!lastTime) lastTime = now;
    const dt = now - lastTime;
    lastTime = now;

    if (phase === 'in') {
      if (!phaseStart) phaseStart = now;
      const elapsed = now - phaseStart;

      flowers.forEach((f, i) => {
        const t    = Math.max(0, Math.min(1, (elapsed - f.delay) / IN_DURATION));
        const ease = easeOutQuint(t);
        const x    = f.startX + (f.targetX - f.startX) * ease;
        const y    = f.startY + (f.targetY - f.startY) * ease;

        angles[i] += (f.spinSpd * 360 * dt) / 1000 * f.spinDir;
        f.el.style.left      = x + 'px';
        f.el.style.top       = y + 'px';
        f.el.style.opacity   = Math.min(t * 4, 1);
        f.el.style.transform = `translate(-50%, -50%) rotate(${angles[i]}deg)`;
      });

      if (elapsed > 600 + IN_DURATION) {
        phase     = 'hold';
        holdStart = now;
      }
    } else if (phase === 'hold') {
      const elapsed = now - holdStart;
      flowers.forEach((f, i) => {
        angles[i] += (f.spinSpd * 360 * dt) / 1000 * f.spinDir;
        f.el.style.transform = `translate(-50%, -50%) rotate(${angles[i]}deg)`;
      });
      if (elapsed >= HOLD_DURATION) {
        phase      = 'out';
        phaseStart = now;
      }
    } else if (phase === 'out') {
      // Exit: fly further upward (past top edge)
      const elapsed = now - phaseStart;
      flowers.forEach((f, i) => {
        const t    = Math.max(0, Math.min(1, (elapsed - f.delay * 0.2) / OUT_DURATION));
        const ease = easeInQuad(t);
        // Move from current target position upward off screen
        const x = f.targetX;
        const y = f.targetY - H * 1.3 * ease;

        angles[i] += (f.spinSpd * 360 * dt) / 1000 * f.spinDir;
        f.el.style.left      = x + 'px';
        f.el.style.top       = y + 'px';
        f.el.style.transform = `translate(-50%, -50%) rotate(${angles[i]}deg)`;
        f.el.style.opacity   = Math.max(0, 1 - ease * 1.4);
      });

      if (elapsed > 300 + OUT_DURATION) {
        animating = false;
        overlay.remove();
        if (onComplete) onComplete();
        return;
      }
    }

    requestAnimationFrame(animate);
  }

  // Tap to skip straight to exit
  overlay.addEventListener('click', () => {
    if (phase === 'in' || phase === 'hold') {
      phase      = 'out';
      phaseStart = performance.now();
      flowers.forEach(f => { f.delay = 0; });
    }
  });

  requestAnimationFrame(animate);
}

// ============================================
// SCREEN 4: CAKE SWIPE-TO-CUT
// ============================================
function initCakeScreen() {
  const cakeStage = screens.cake;
  const canvas    = document.getElementById('cake-canvas');
  const hint      = document.getElementById('swipe-hint');
  let   ctx       = null;
  let   isSlicing = false;
  let   sliced    = false;
  let   points    = [];

  // Size canvas to match its displayed size
  function resizeCanvas() {
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    canvas.width  = r.width || canvas.offsetWidth || 300;
    canvas.height = r.height || canvas.offsetHeight || 260;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const src = (e.touches && e.touches.length > 0)
      ? e.touches[0]
      : (e.changedTouches && e.changedTouches.length > 0)
        ? e.changedTouches[0]
        : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }

  function drawSlash() {
    if (!ctx || points.length < 2) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Glowing slash line
    ctx.save();
    ctx.lineCap    = 'round';
    ctx.lineJoin   = 'round';

    // Outer glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur  = 18;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth   = 6;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Inner bright core
    ctx.shadowBlur  = 4;
    ctx.strokeStyle = 'rgba(255, 240, 250, 1)';
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.restore();
  }

  function onSliceStart(e) {
    if (sliced) return;
    isSlicing = true;
    points    = [getPos(e)];
    if (!ctx) ctx = canvas.getContext('2d');
  }

  function onSliceMove(e) {
    if (!isSlicing || sliced) return;
    if (e.cancelable) e.preventDefault();
    points.push(getPos(e));
    drawSlash();
  }

  function onSliceEnd(e) {
    if (!isSlicing || sliced) return;
    isSlicing = false;

    // Trigger if swiped horizontally (>45px) or diagonally/vertically (>55px)
    if (points.length > 1) {
      const dx = Math.abs(points[points.length - 1].x - points[0].x);
      const dy = Math.abs(points[points.length - 1].y - points[0].y);
      const dist = Math.hypot(dx, dy);

      if (dx > 45 || dist > 55) {
        sliced = true;
        triggerCakeCut();
      } else {
        // Too short — fade slash and reset
        canvas.style.transition = 'opacity 0.3s';
        canvas.style.opacity    = '0';
        setTimeout(() => {
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.style.opacity    = '1';
          canvas.style.transition = '';
          points = [];
        }, 300);
      }
    }
  }

  function triggerCakeCut() {
    sliced = true;

    // Flash the slash bright
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.shadowColor = 'rgba(255,220,240,1)';
      ctx.shadowBlur  = 36;
      ctx.strokeStyle = 'white';
      ctx.lineWidth   = 8;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();

      // Fade slash after flash
      setTimeout(() => {
        canvas.style.transition = 'opacity 0.4s';
        canvas.style.opacity = '0';
      }, 350);
    }

    // Shake cake then brighten it
    const cakeEl = document.getElementById('cake-img');
    if (cakeEl) {
      cakeEl.style.transition = 'transform 0.15s ease';
      cakeEl.style.transform  = 'scale(1.06) rotate(-1.5deg)';
      setTimeout(() => {
        cakeEl.style.transform = 'scale(1.06) rotate(1.5deg)';
        setTimeout(() => {
          cakeEl.style.transform = 'scale(1)';
          cakeEl.style.filter = 'drop-shadow(0 10px 30px rgba(161, 118, 171, 0.5)) brightness(1.05)';
        }, 130);
      }, 130);
    }

    // Hide pre-cut header & hint, then swap to reveal header
    const header = document.getElementById('cake-header');
    if (header) {
      header.style.opacity = '0';
      header.style.pointerEvents = 'none';
      setTimeout(() => {
        header.style.display = 'none';
      }, 300);
    }

    if (hint) {
      hint.style.display = 'none';
    }

    // --- EMOJI BLAST ---
    const blastContainer = document.getElementById('cake-emoji-blast');
    const emojis = ['🎉','🎊','🎈','🥳','✨','💖','🌸','🎀','🎁','💝','⭐','🎆'];
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 48; i++) {
      const el = document.createElement('span');
      el.className = 'blast-emoji';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const angle = Math.random() * Math.PI * 2;
      const dist  = 160 + Math.random() * 240;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist;
      const rot   = (Math.random() - 0.5) * 540;
      const dur   = (0.7 + Math.random() * 0.8).toFixed(2) + 's';
      const delay = (Math.random() * 0.35).toFixed(2) + 's';

      el.style.cssText = `
        left: ${cx}px; top: ${cy}px;
        --tx: ${tx}px; --ty: ${ty}px;
        --rot: ${rot}deg; --dur: ${dur};
        animation-delay: ${delay};
      `;
      blastContainer.appendChild(el);
      setTimeout(() => el.remove(), 1800);
    }

    // Show birthday reveal title + heart smoothly in place
    setTimeout(() => {
      const reveal = document.getElementById('cake-bday-reveal');
      if (reveal) {
        reveal.style.display = 'block';
        requestAnimationFrame(() => {
          reveal.classList.add('visible');
        });
      }
    }, 280);

    // Show "Next Scene" button & wire transition
    const btn = document.getElementById('next-scene-btn');
    const goToNextScene = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (btn) btn.classList.remove('visible');
      transitionTo('message');
      launchConfetti();
    };

    if (btn) {
      setTimeout(() => {
        btn.classList.add('visible');
      }, 500);

      btn.onclick = goToNextScene;
      btn.ontouchend = goToNextScene;
    }

    // Also allow tapping cake wrapper to proceed after cutting
    const cakeWrapper = document.getElementById('cake-wrapper');
    if (cakeWrapper) {
      cakeWrapper.onclick = (e) => {
        if (sliced) goToNextScene(e);
      };
      cakeWrapper.ontouchend = (e) => {
        if (sliced) goToNextScene(e);
      };
    }
  }

  // Wire up cake slice events
  cakeStage.addEventListener('mousedown',  onSliceStart);
  cakeStage.addEventListener('touchstart', onSliceStart, { passive: true });
  window.addEventListener('mousemove',  onSliceMove);
  window.addEventListener('touchmove',  onSliceMove, { passive: false });
  window.addEventListener('mouseup',    onSliceEnd);
  window.addEventListener('touchend',   onSliceEnd);
}

// Keep these stubs so no reference errors from the fire screen calling initCandleFlames
function initCandleFlames() {}
function blowCandles() {}


// ============================================
// CONFETTI
// ============================================
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#FFADCE', '#FF97B5', '#FD95D5', '#A176AB', '#649600', '#96DC00', '#FFDC4E', '#FFFAFF'];
  
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 10;
      const shapes = ['50%', '2px', '0'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size * (0.6 + Math.random() * 0.8)}px;
        background: ${color};
        border-radius: ${shape};
        animation-duration: ${2 + Math.random() * 3}s;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      
      container.appendChild(piece);
      
      setTimeout(() => piece.remove(), 6000);
    }, i * 30);
  }

  // Second wave
  setTimeout(() => {
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 6 + Math.random() * 10;
        
        piece.style.cssText = `
          left: ${Math.random() * 100}%;
          width: ${size}px;
          height: ${size * 0.6}px;
          background: ${color};
          border-radius: 2px;
          animation-duration: ${2 + Math.random() * 3}s;
        `;
        
        container.appendChild(piece);
        setTimeout(() => piece.remove(), 6000);
      }, i * 50);
    }
  }, 2000);
}

// ============================================
// SCREEN 5: ENVELOPE LETTER
// ============================================
function initEnvelopeLetter() {
  const envelope   = document.getElementById('envelope');
  const envStage   = document.getElementById('env-stage');
  const letterView = document.getElementById('letter-view');

  if (!envelope) return;

  function resetEnvelope() {
    envelope.classList.remove('open');
    envelope.style.pointerEvents = '';
    envStage.style.opacity   = '';
    envStage.style.transform = '';
    envStage.style.display   = '';
    letterView.classList.remove('visible');
  }

  function openEnvelope() {
    if (envelope.classList.contains('open')) return;

    // Trigger CSS: flap lifts + paper slides up
    envelope.classList.add('open');
    envelope.style.pointerEvents = 'none';

    // After animation, fade out envelope → show full letter
    setTimeout(() => {
      envStage.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      envStage.style.opacity    = '0';
      envStage.style.transform  = 'scale(0.9) translateY(-16px)';

      setTimeout(() => {
        envStage.style.display = 'none';
        letterView.classList.add('visible');
      }, 520);
    }, 950);
  }

  envelope.addEventListener('click',    openEnvelope);
  envelope.addEventListener('touchend', (e) => { e.preventDefault(); openEnvelope(); });
  envelope.addEventListener('keydown',  (e) => {
    if (e.key === 'Enter' || e.key === ' ') openEnvelope();
  });

  // Wire "One last surprise" button
  const gameBtn = document.getElementById('lp-game-btn');
  if (gameBtn) {
    gameBtn.addEventListener('click', () => {
      transitionTo('game');
      initBalloonGame();
    });
  }

  // Reset envelope state every time screen-message becomes active
  // so the animation replays correctly if navigated to again
  const observer = new MutationObserver(() => {
    const screen = document.getElementById('screen-message');
    if (screen && screen.classList.contains('active')) {
      resetEnvelope();
    }
  });
  const msgScreen = document.getElementById('screen-message');
  if (msgScreen) observer.observe(msgScreen, { attributes: true, attributeFilter: ['class'] });
}

// ============================================
// SCREEN 6: BALLOON POP GAME  (balloons rise bottom → top)
// ============================================
function initBalloonGame() {
  const field   = document.getElementById('balloon-field');
  const countEl = document.getElementById('pop-count');
  const victory = document.getElementById('game-victory');

  if (!field) return;

  // Reset state
  field.innerHTML = '';
  if (countEl) countEl.textContent = '0';
  if (victory) victory.classList.remove('visible');

  const TOTAL    = 21;
  const LIVE_MAX = 6;   // balloons in the air simultaneously
  let   popped   = 0;
  let   done     = false;
  let   colorIdx = 0;

  const colors = [
    '#FFADCE', '#FF97B5', '#FD95D5', '#E070A0',
    '#A176AB', '#C9A0DC', '#96DC00', '#FFDC4E',
    '#FFB3D1', '#FF6B9D', '#D4A0E8', '#7EC8A0',
    '#FFD580', '#F08080', '#80C4E8'
  ];

  function spawnBalloon() {
    if (done || !field.isConnected) return;

    const size    = 54 + Math.random() * 30;               // 54–84 px
    const color   = colors[colorIdx++ % colors.length];
    const leftPct = 4 + Math.random() * 84;                // 4–88 %
    const dur     = (4.5 + Math.random() * 3).toFixed(2);  // 4.5–7.5 s
    const sway    = ((Math.random() * 70) - 35).toFixed(1);// ±35 px horizontal drift
    const strLen  = 28 + Math.random() * 22;

    // Wrapper rises from bottom; animation on wrapper moves both balloon + string
    const wrap = document.createElement('div');
    wrap.className = 'balloon-wrap';
    // Position at bottom, use CSS var for sway
    wrap.style.cssText = `
      left: ${leftPct}%;
      bottom: -${(size * 1.6 + strLen).toFixed(0)}px;
      --sway: ${sway}px;
      animation: balloonRise ${dur}s linear forwards;
    `;

    // Balloon body
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.cssText = `
      width: ${size}px;
      height: ${size * 1.22}px;
      background: radial-gradient(circle at 38% 28%,
        rgba(255,255,255,0.46) 0%, transparent 58%
      ), ${color};
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
    `;

    // String
    const str = document.createElement('div');
    str.className = 'balloon-string';
    str.style.height = `${strLen}px`;

    wrap.appendChild(balloon);
    wrap.appendChild(str);

    // When balloon naturally exits the top — respawn immediately
    wrap.addEventListener('animationend', () => {
      wrap.remove();
      spawnBalloon();
    });

    // --- Pop ---
    function doPop(e) {
      e.stopPropagation();
      if (wrap.dataset.popped) return;
      wrap.dataset.popped = '1';

      // Freeze in place, play pop burst
      wrap.style.animationPlayState = 'paused';
      balloon.classList.add('popping');
      str.style.opacity = '0';

      // Coloured particle burst at tap position
      const rect = balloon.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      for (let i = 0; i < 10; i++) {
        const p     = document.createElement('div');
        p.className = 'pop-particle';
        const angle = (i / 10) * Math.PI * 2;
        const dist  = 35 + Math.random() * 32;
        p.style.cssText = `
          left: ${cx}px; top: ${cy}px;
          background: ${color};
          --dx: ${(Math.cos(angle) * dist).toFixed(1)}px;
          --dy: ${(Math.sin(angle) * dist).toFixed(1)}px;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 620);
      }

      // Score counter bounce
      popped++;
      if (countEl) {
        countEl.textContent = popped;
        countEl.classList.add('bump');
        setTimeout(() => countEl.classList.remove('bump'), 260);
      }

      // Remove & respawn after pop animation
      setTimeout(() => {
        wrap.remove();
        spawnBalloon();
      }, 340);

      // Victory when 21 popped
      if (popped >= TOTAL) {
        done = true;
        setTimeout(() => {
          if (victory) victory.classList.add('visible');
          launchConfetti();
        }, 520);
      }
    }

    balloon.addEventListener('click',      doPop);
    balloon.addEventListener('touchstart', doPop, { passive: true });

    field.appendChild(wrap);
  }

  // Launch LIVE_MAX balloons staggered so screen fills up nicely
  for (let i = 0; i < LIVE_MAX; i++) {
    setTimeout(spawnBalloon, i * 650);
  }
}
