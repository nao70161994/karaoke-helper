/** 126BPMで左右交互に点灯する純粋関数。 */
export const BPM = 126;
export const BEAT_MS = 60_000 / BPM;
export function beatNumber(elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return 0;
  return Math.floor(elapsedMs / BEAT_MS);
}
export function isLit(side, elapsedMs) {
  if (side !== 'left' && side !== 'right') throw new RangeError('Invalid side');
  const evenBeat = beatNumber(elapsedMs) % 2 === 0;
  return side === 'left' ? evenBeat : !evenBeat;
}
