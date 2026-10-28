// Pinch to zoom on the map. Snaps back to normal size when all fingers lift.
const box = document.querySelector('.image-box');
const img = box.querySelector('img');

const MAX_SCALE = 4;
const pointers = new Map();   // pointerId -> {x, y}

let scale = 1, tx = 0, ty = 0;   // current transform
let start = null;                // transform + finger positions when the gesture (re)started

function applyTransform() {
  img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
}

// Midpoint and spread of the fingers, relative to the box
function fingerInfo() {
  const rect = box.getBoundingClientRect();
  const pts = [...pointers.values()].slice(0, 2);
  const x = pts.reduce((sum, p) => sum + p.x, 0) / pts.length - rect.left;
  const y = pts.reduce((sum, p) => sum + p.y, 0) / pts.length - rect.top;
  const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
  return { x, y, dist };
}

// Called whenever a finger is added or removed so the math starts fresh
function resetStart() {
  start = pointers.size ? { scale, tx, ty, ...fingerInfo() } : null;
}

box.addEventListener('pointerdown', (e) => {
  box.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  img.classList.remove('zoom-reset');
  resetStart();
});

box.addEventListener('pointermove', (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  const now = fingerInfo();
  let newScale = start.scale;
  if (pointers.size > 1 && start.dist > 0) {
    newScale = Math.min(MAX_SCALE, Math.max(1, start.scale * (now.dist / start.dist)));
  }

  // Keep the spot that was under the fingers under the fingers
  const mapX = (start.x - start.tx) / start.scale;
  const mapY = (start.y - start.ty) / start.scale;
  scale = newScale;
  tx = now.x - mapX * scale;
  ty = now.y - mapY * scale;
  applyTransform();
});

function release(e) {
  if (!pointers.delete(e.pointerId)) return;
  if (pointers.size === 0) {
    // All fingers up: animate back to normal
    scale = 1; tx = 0; ty = 0;
    img.classList.add('zoom-reset');
    applyTransform();
  }
  resetStart();
}

box.addEventListener('pointerup', release);
box.addEventListener('pointercancel', release);
