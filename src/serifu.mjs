import { SONG } from './serifu-data.mjs';
import { currentLineIndex } from './serifu-clock.mjs';
import './common.mjs';

const setup = document.getElementById('setup');
const stage = document.getElementById('stage');
const startButton = document.getElementById('go');
const back = document.getElementById('back');
const nowSpeaker = document.getElementById('now-speaker');
const nowText = document.getElementById('now-text');
const nextText = document.getElementById('next-text');
const clock = document.getElementById('clock');
const listEl = document.getElementById('line-list');

// 話者ごとの色分け（プリズムショーの主要メンバー）。
const SPEAKER_COLORS = {
  'カヅキ': '#ffb020',
  'アレクサンダー': '#ff5a5a',
  'コウジ': '#ff8ac2',
  'シン': '#ffe95a',
  'タイガ': '#6fe08a',
  'カケル': '#6fb7ff',
};
function speakerColor(speaker) {
  for (const name of Object.keys(SPEAKER_COLORS)) {
    if (speaker && speaker.includes(name)) return SPEAKER_COLORS[name];
  }
  return '#b6c0d0';
}

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// セットアップ画面に全セリフ一覧（練習用）。
for (const line of SONG.lines) {
  const li = document.createElement('li');
  const time = document.createElement('span');
  time.className = 'line-time';
  time.textContent = formatTime(line.t);
  const body = document.createElement('span');
  if (line.speaker) {
    const sp = document.createElement('strong');
    sp.textContent = line.speaker;
    sp.style.color = speakerColor(line.speaker);
    body.append(sp, ' ', line.text);
  } else {
    body.textContent = line.text;
  }
  li.append(time, body);
  listEl.append(li);
}

let startedAt = null;   // performance.now() 基準の開始時刻
let offsetMs = 0;       // カラオケ音源とのずれ調整
let rafId = 0;
let lastIndex = -2;
let wakeLock = null;

function render(elapsedMs) {
  const idx = currentLineIndex(SONG.lines, elapsedMs);
  clock.textContent = formatTime(elapsedMs / 1000);
  if (idx === lastIndex) return;
  lastIndex = idx;
  const current = SONG.lines[idx];
  const next = SONG.lines[idx + 1];
  if (current) {
    nowSpeaker.textContent = current.speaker || ' ';
    nowSpeaker.style.color = speakerColor(current.speaker);
    nowText.textContent = current.text;
  } else {
    nowSpeaker.textContent = ' ';
    nowText.textContent = 'まもなく…';
  }
  nextText.textContent = next ? `つぎ: ${next.speaker ? `${next.speaker} ` : ''}${next.text}` : '';
}

function tick(now) {
  if (startedAt === null) return;
  render(Math.max(0, now - startedAt + offsetMs));
  rafId = requestAnimationFrame(tick);
}

function sync() {
  cancelAnimationFrame(rafId);
  startedAt = performance.now();
  offsetMs = 0;
  lastIndex = -2;
  stage.classList.add('running');
  tick(startedAt);
}

async function keepScreenAwake() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch (_) { /* 未対応の場合はそのまま使用 */ }
}

function enter() {
  setup.hidden = true;
  stage.hidden = false;
  stage.classList.remove('running');
  startedAt = null;
  lastIndex = -2;
  nowSpeaker.textContent = ' ';
  nowText.textContent = 'カラオケが始まったら画面をタップ';
  nextText.textContent = '';
  clock.textContent = '0:00';
  keepScreenAwake();
}

function exit() {
  cancelAnimationFrame(rafId);
  rafId = 0;
  startedAt = null;
  stage.hidden = true;
  setup.hidden = false;
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
}

// ずれ調整ボタン（音源ごとに冒頭の長さが違うため）。
for (const button of document.querySelectorAll('[data-offset]')) {
  button.addEventListener('pointerdown', event => event.stopPropagation());
  button.addEventListener('click', event => {
    event.stopPropagation();
    offsetMs += Number(button.dataset.offset);
    if (startedAt !== null) lastIndex = -2;
  });
}

startButton.addEventListener('click', enter);
back.addEventListener('pointerdown', event => event.stopPropagation());
back.addEventListener('click', event => { event.stopPropagation(); exit(); });
stage.addEventListener('pointerdown', event => {
  if (event.isPrimary && !event.target.closest('button')) sync();
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
