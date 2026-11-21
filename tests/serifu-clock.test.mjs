import test from 'node:test';
import assert from 'node:assert/strict';
import { currentLineIndex, msUntilNextLine, songLengthSec } from '../src/serifu-clock.mjs';
import { SONGS } from '../src/serifu-data.mjs';

const lines = [
  { t: 7, speaker: 'A', text: 'one' },
  { t: 12, speaker: 'B', text: 'two' },
  { t: 20, speaker: 'A', text: 'three' },
];

test('開始前は -1', () => {
  assert.equal(currentLineIndex(lines, 0), -1);
  assert.equal(currentLineIndex(lines, 6999), -1);
  assert.equal(currentLineIndex(lines, -5), -1);
});

test('セリフの時刻ちょうどで切り替わる', () => {
  assert.equal(currentLineIndex(lines, 7000), 0);
  assert.equal(currentLineIndex(lines, 11999), 0);
  assert.equal(currentLineIndex(lines, 12000), 1);
  assert.equal(currentLineIndex(lines, 999999), 2);
});

test('次のセリフまでの時間', () => {
  assert.equal(msUntilNextLine(lines, 0), 7000);
  assert.equal(msUntilNextLine(lines, 7000), 5000);
  assert.equal(msUntilNextLine(lines, 20000), Infinity);
});

test('EZ DO DANCEのデータが昇順で実在する', () => {
  assert.ok(SONGS[0].lines.length >= 50);
  for (let i = 1; i < SONG.lines.length; i++) {
    assert.ok(SONG.lines[i].t >= SONG.lines[i - 1].t);
  }
  assert.ok(songLengthSec(SONG.lines) > 240);
});
