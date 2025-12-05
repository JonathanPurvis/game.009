// Shared utilities for the game project
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function saveLS(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) { console.warn('saveLS failed', e); }
}

function loadLS(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { console.warn('loadLS failed', e); return null; }
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
