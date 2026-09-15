// @jasonyu0100
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { diffDailies, renderDailiesContactSheet, type DailiesReceiptDigest } from '../src/core/dailies-diff';

const frame = (frameId: string, sha256: string, textSha256 = 't') => ({
  frameId, momentId: frameId.split('--')[0]!, file: `auto-dailies/${frameId}.png`, sha256, textSha256,
});

const before: DailiesReceiptDigest = {
  experienceId: 'x', experienceSha256: 'aaa',
  frames: [frame('a', '1'), frame('b', '2'), frame('c', '3'), frame('c--0001', '4')],
};
const after: DailiesReceiptDigest = {
  experienceId: 'x', experienceSha256: 'bbb',
  frames: [frame('a', '1'), frame('b', '2b', 't2'), frame('c', '3c'), frame('d', '5')],
};

describe('dailies diff', () => {
  it('classifies every frame by pinned screenshot bytes and reports text changes separately', () => {
    const diff = diffDailies(before, after);
    assert.equal(diff.experienceChanged, true);
    assert.deepEqual(diff.counts, { changed: 2, added: 1, removed: 1, unchanged: 1 });
    const byId = new Map(diff.frames.map((change) => [change.frameId, change]));
    assert.equal(byId.get('a')?.status, 'unchanged');
    assert.equal(byId.get('b')?.status, 'changed');
    assert.equal(byId.get('b')?.textChanged, true);
    assert.equal(byId.get('c')?.status, 'changed');
    assert.equal(byId.get('c')?.textChanged, false);
    assert.equal(byId.get('c--0001')?.status, 'removed');
    assert.equal(byId.get('d')?.status, 'added');
  });

  it('is empty when nothing changed and needs no baseline to list additions', () => {
    assert.deepEqual(diffDailies(after, after).counts, { changed: 0, added: 0, removed: 0, unchanged: 4 });
    const fresh = diffDailies(null, after);
    assert.deepEqual(fresh.counts, { changed: 0, added: 4, removed: 0, unchanged: 0 });
    assert.ok(fresh.frames.every((change) => change.status === 'added'));
  });

  it('renders changed, added and removed frames on the contact sheet and hides unchanged by default', () => {
    const diff = diffDailies(before, after);
    const paths = {
      before: (digest: { file: string }) => `prev/${digest.file}`,
      after: (digest: { file: string }) => `cur/${digest.file}`,
    };
    const html = renderDailiesContactSheet(diff, paths);
    for (const id of ['b', 'c', 'c--0001', 'd']) assert.match(html, new RegExp(`<code>${id}</code>`));
    assert.doesNotMatch(html, /<code>a<\/code>/);
    assert.match(html, /prev\/auto-dailies\/b\.png/);
    assert.match(html, /cur\/auto-dailies\/b\.png/);
    assert.match(renderDailiesContactSheet(diff, paths, { showUnchanged: true }), /<code>a<\/code>/);
  });
});
