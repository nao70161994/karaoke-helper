import test from 'node:test';
import assert from 'node:assert/strict';
import { BPM, BEAT_MS, beatNumber, isLit } from '../src/light-clock.mjs';
test('126BPMの長さ', () => {
  assert.equal(BPM, 126);
  assert.ok(Math.abs(BEAT_MS - 476.190476) < .00001);
});
test('拍番号は一定の周期で増える', () => {
  assert.equal(beatNumber(0), 0);
  assert.equal(beatNumber(BEAT_MS - .01), 0);
  assert.equal(beatNumber(BEAT_MS + .01), 1);
  assert.equal(beatNumber(2 * BEAT_MS + .01), 2);
});
test('左と右は毎拍、常に逆位相', () => {
  for (let beat = 0; beat < 40; beat++) {
    const moment = (beat + .5) * BEAT_MS;
    assert.equal(isLit('left', moment), beat % 2 === 0);
    assert.equal(isLit('right', moment), beat % 2 === 1);
  }
});
test('不正な左右指定を拒否', () => {
  assert.throws(() => isLit('middle', 0), RangeError);
});
