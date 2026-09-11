import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { inspectChromaMatte, keyChromaMatte, refineSegmentedChromaMatte } from '../src/core/chroma-matte';

describe('deterministic chroma matte', () => {
  it('removes the screen, retains the subject, and zeroes transparent RGB', () => {
    const width = 12;
    const height = 12;
    const pixels = Buffer.alloc(width * height * 4);
    for (let pixel = 0; pixel < width * height; pixel += 1) pixels.set([250, 0, 250, 255], pixel * 4);
    for (let y = 3; y < 10; y += 1) for (let x = 4; x < 8; x += 1) pixels.set([55, 62, 68, 255], (y * width + x) * 4);
    const result = keyChromaMatte(pixels, width, height, [255, 0, 255], { tolerance: 28, softness: 64 });
    assert.equal(result.data[(5 * width + 5) * 4 + 3], 255);
    assert.equal(result.data[(0 * width + 0) * 4 + 3], 0);
    assert.equal(result.inspection.transparentRgbPixels, 0);
    assert.equal(result.inspection.residualBoundaryFraction, 0);
  });

  it('reports chroma-coloured visible boundary contamination', () => {
    const pixels = Buffer.from([0, 0, 0, 0, 250, 0, 250, 255, 40, 40, 40, 255]);
    const report = inspectChromaMatte(pixels, 3, 1, [255, 0, 255]);
    assert.equal(report.boundaryPixels, 2);
    assert.equal(report.residualBoundaryFraction, 0.5);
  });

  it('clears only chroma connected to the segmented exterior', () => {
    const width = 7;
    const height = 5;
    const source = Buffer.alloc(width * height * 4, 255);
    const segmented = Buffer.alloc(width * height * 4, 255);
    for (let pixel = 0; pixel < width * height; pixel += 1) source.set([0, 255, 102, 255], pixel * 4);
    for (let y = 1; y < 4; y += 1) for (let x = 2; x < 5; x += 1) {
      source.set([40, 45, 50, 255], (y * width + x) * 4);
      segmented.set([40, 45, 50, 255], (y * width + x) * 4);
    }
    source.set([0, 255, 102, 255], (2 * width + 3) * 4);
    segmented.set([0, 255, 102, 255], (2 * width + 3) * 4);
    for (let pixel = 0; pixel < width * height; pixel += 1) if (pixel % width < 2 || pixel % width > 4 || Math.floor(pixel / width) === 0 || Math.floor(pixel / width) === 4) segmented[pixel * 4 + 3] = 0;
    const result = refineSegmentedChromaMatte(source, segmented, width, height, [0, 255, 102]);
    assert.equal(result.data[(1 * width + 1) * 4 + 3], 0);
    assert.equal(result.data[(2 * width + 3) * 4 + 3], 255);
  });
});
