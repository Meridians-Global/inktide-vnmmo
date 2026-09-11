import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import sharp from 'sharp';
import type { FigurePreparation } from '../src/core/contracts';
import { normalizeFigureBuffer, resolveFigurePlacement } from '../src/core/figure-normalization';

const recipe: FigurePreparation = {
  kind: 'figure-normalize',
  recipeVersion: 1,
  canvas: { width: 896, height: 1024 },
  subjectBox: { width: 850, height: 960 },
  bottomPadding: 24,
};

describe('figure normalization', () => {
  it('fits and grounds a visible subject without stretching its aspect ratio', () => {
    assert.deepEqual(resolveFigurePlacement(400, 800, recipe), {
      width: 480,
      height: 960,
      top: 40,
      right: 208,
      bottom: 24,
      left: 208,
    });
  });

  it('makes output independent of transparent source padding', async () => {
    const subject = await sharp({ create: { width: 120, height: 240, channels: 4, background: '#6f5a89ff' } }).png().toBuffer();
    const tight = await sharp(subject).extend({ top: 5, right: 5, bottom: 5, left: 5, background: '#00000000' }).png().toBuffer();
    const loose = await sharp(subject).extend({ top: 90, right: 140, bottom: 110, left: 80, background: '#00000000' }).png().toBuffer();
    const [tightOutput, looseOutput] = await Promise.all([
      normalizeFigureBuffer(tight, recipe),
      normalizeFigureBuffer(loose, recipe),
    ]);
    assert.deepEqual(tightOutput, looseOutput);
    const metadata = await sharp(tightOutput).metadata();
    assert.equal(metadata.width, 896);
    assert.equal(metadata.height, 1024);
  });
});
