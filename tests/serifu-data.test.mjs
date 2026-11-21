import test from 'node:test';
import assert from 'node:assert/strict';
import { SONGS, SONG, getSongById, validateSongData } from '../src/serifu-data.mjs';

test('曲データはID・タイトル・作品名・セリフ行を持つ配列', () => {
  assert.ok(Array.isArray(SONGS));
  assert.equal(validateSongData(SONGS), true);
  assert.equal(SONG, SONGS[0]);
  assert.equal(SONG.id, 'ez-do-dance');
  assert.equal(SONG.title, 'EZ DO DANCE');
  assert.equal(SONG.work, 'KING OF PRISM by PrettyRhythm');
  assert.ok(SONG.lines.length >= 50);
  assert.deepEqual(Object.keys(SONG.lines[0]), ['t', 'speaker', 'text']);
  assert.deepEqual(SONG.lines[0], { t: 7, speaker: 'カヅキ', text: 'アハッ！' });
  assert.deepEqual(SONG.lines.at(-1), {
    t: 252, speaker: 'カヅキ・アレクサンダー', text: '(カヅキ･アレクサンダー) ハァ ハァ ハァ…',
  });
});

test('曲IDで選択でき、存在しないIDはnull', () => {
  assert.equal(getSongById('ez-do-dance'), SONG);
  assert.equal(getSongById('not-registered'), null);
});

test('複数曲の追加を想定してID重複・不正な行を拒否する', () => {
  const extra = { id: 'another-song', title: '別の曲', work: '別作品',
    lines: [{ t: 0, speaker: '', text: '開始' }] };
  assert.equal(validateSongData([...SONGS, extra]), true);
  assert.throws(() => validateSongData([...SONGS, { ...extra, id: SONG.id }]), /一意/);
  assert.throws(() => validateSongData([{ ...extra, lines: [{ t: -1, speaker: '', text: '不正' }] }]), /不正/);
  assert.throws(() => validateSongData([]), /1曲以上/);
});
