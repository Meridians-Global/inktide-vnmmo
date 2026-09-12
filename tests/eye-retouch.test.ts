import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { retouchIrisPixels } from '../src/core/eye-retouch';

describe('retouchIrisPixels', () => {
  it('changes saturated iris pixels inside the declared ellipse and nothing else', () => {
    const source = Buffer.from([
      190, 45, 70, 255,
      190, 45, 70, 255,
      190, 45, 70, 255,
    ]);
    const result = retouchIrisPixels(source, 3, 1, {
      regions: [{ cx: 1, cy: 0, rx: 0.49, ry: 1 }],
      targetRgb: [75, 48, 30],
      strength: 1,
      minimumChroma: 20,
    });
    assert.deepEqual([...result.subarray(0, 4)], [...source.subarray(0, 4)]);
    assert.notDeepEqual([...result.subarray(4, 8)], [...source.subarray(4, 8)]);
    assert.deepEqual([...result.subarray(8, 12)], [...source.subarray(8, 12)]);
  });
});
