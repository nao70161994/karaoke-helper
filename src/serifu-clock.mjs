/** セリフ表示の純粋関数。lines は t（秒）の昇順に並んでいる前提。 */

/** 経過ミリ秒時点で「現在のセリフ」の添字。開始前は -1。 */
export function currentLineIndex(lines, elapsedMs) {
  if (!Array.isArray(lines) || !Number.isFinite(elapsedMs) || elapsedMs < 0) return -1;
  const sec = elapsedMs / 1000;
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].t <= sec) idx = i;
    else break;
  }
  return idx;
}

/** 次のセリフまでのミリ秒。もう無ければ Infinity。 */
export function msUntilNextLine(lines, elapsedMs) {
  const idx = currentLineIndex(lines, elapsedMs);
  const next = lines[idx + 1];
  if (!next) return Infinity;
  return Math.max(0, next.t * 1000 - elapsedMs);
}

/** 全セリフ終了までの目安（最後のセリフの t、秒）。 */
export function songLengthSec(lines) {
  if (!Array.isArray(lines) || lines.length === 0) return 0;
  return lines[lines.length - 1].t;
}
