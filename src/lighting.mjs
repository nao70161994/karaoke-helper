import { BEAT_MS, isLit } from './light-clock.mjs';
import './common.mjs';

const setup = document.getElementById('setup');
const stage = document.getElementById('stage');
const left = document.getElementById('left');
const right = document.getElementById('right');
const go = document.getElementById('go');
const back = document.getElementById('back');

let side = 'left';
let startedAt = null;
let rafId = 0;
let lastState = null;
let wakeLock = null;

// 2台とも同じ拍に合わせてタップすると、左右が逆位相で光る。
// 経過時間から直接拍番号を計算し、タイマーの累積遅延を避ける。
function setSide(value) {
  side = value;
  left.setAttribute('aria-pressed', String(side === 'left'));
  right.setAttribute('aria-pressed', String(side === 'right'));
}

function paint(on) {
  if (lastState === on) return;
  stage.classList.toggle('on', on);
  lastState = on;
}

function tick(now) {
  if (startedAt === null) return;
  paint(isLit(side, Math.max(0, now - startedAt)));
  rafId = requestAnimationFrame(tick);
}

function sync() {
  cancelAnimationFrame(rafId);
  startedAt = performance.now();
  stage.classList.add('running');
  lastState = null;
  tick(startedAt);
}

async function keepScreenAwake() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch (_) { /* 未対応の場合はそのまま使用 */ }
}

async function enter() {
  setup.hidden = true;
  stage.hidden = false;
  stage.classList.remove('running');
  startedAt = null;
  paint(false);
  try {
    if (stage.requestFullscreen) await stage.requestFullscreen();
  } catch (_) { /* iPhone Safari等では未対応 */ }
  keepScreenAwake();
}

function exit() {
  cancelAnimationFrame(rafId);
  rafId = 0;
  startedAt = null;
  stage.classList.remove('running', 'on');
  lastState = false;
  stage.hidden = true;
  setup.hidden = false;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
}

left.addEventListener('click', () => setSide('left'));
right.addEventListener('click', () => setSide('right'));
go.addEventListener('click', enter);
back.addEventListener('pointerdown', event => event.stopPropagation());
back.addEventListener('click', event => { event.stopPropagation(); exit(); });
stage.addEventListener('pointerdown', event => {
  if (event.isPrimary && event.target !== back) sync();
});
stage.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', event => {
  if (stage.hidden) return;
  if (event.key === 'Escape') exit();
  if (event.key === ' ') { event.preventDefault(); sync(); }
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !stage.hidden && startedAt !== null) {
    cancelAnimationFrame(rafId);
    tick(performance.now());
    if (!wakeLock) keepScreenAwake();
  }
});

export const lightTiming = Object.freeze({ beatMs: BEAT_MS });
