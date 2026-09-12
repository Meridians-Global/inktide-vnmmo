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

  it('removes chroma color from translucent matte edges without changing opaque pixels', async () => {
    const pixels = Buffer.alloc(30 * 30 * 4);
    for (let y = 4; y < 26; y += 1) {
      for (let x = 4; x < 26; x += 1) {
        const index = (y * 30 + x) * 4;
        const edge = x < 7 || x > 22 || y < 7 || y > 22;
        pixels.set(edge ? [12, 240, 20, x === 4 ? 255 : 120] : [44, 80, 52, 255], index);
      }
    }
    const source = await sharp(pixels, { raw: { width: 30, height: 30, channels: 4 } }).png().toBuffer();
    const output = await normalizeFigureBuffer(source, {
      ...recipe,
      matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 },
    });
    const normalized = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const visible = [];
    for (let index = 0; index < normalized.data.length; index += 4) {
      if (normalized.data[index + 3]! > 0) visible.push([...normalized.data.subarray(index, index + 4)]);
    }
    assert.ok(visible.some(([red, green, blue, alpha]) => alpha! < 255 && green === Math.max(red!, blue!)));
    assert.ok(visible.some(([red, green, blue, alpha]) => alpha === 255 && red === 12 && green === 20 && blue === 20));
    assert.ok(visible.some(([red, green, blue, alpha]) => red === 44 && green === 80 && blue === 52 && alpha === 255));
  });
});
