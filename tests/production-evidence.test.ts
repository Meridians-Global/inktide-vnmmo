import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

const projectRoot = resolve(import.meta.dirname, '..');
const evidenceRoot = resolve(projectRoot, 'productions/moon-scar-ledger-v2/evidence');

async function digest(path: string): Promise<string> {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

describe('Moon-Scar production evidence', () => {
  it('pins every admitted acquisition byte', async () => {
    const receipt = JSON.parse(await readFile(resolve(evidenceRoot, 'acquisition.receipt.json'), 'utf8')) as {
      assets: Record<string, { sourcePath: string; sha256: string }>;
    };

    for (const [assetId, asset] of Object.entries(receipt.assets)) {
      assert.equal(await digest(resolve(projectRoot, asset.sourcePath)), asset.sha256, assetId);
    }
  });

  it('pins deterministic eye corrections to exact sources and outputs', async () => {
    for (const productionId of ['moon-scar-ledger-v2', 'spider-man-memory-between-us-v1']) {
      const receipt = JSON.parse(await readFile(resolve(projectRoot, 'productions', productionId, 'evidence', 'eye-correction.receipt.json'), 'utf8')) as {
        outputs: Record<string, { sourcePath: string; sourceSha256: string; outputPath: string; outputSha256: string }>;
      };
      for (const [outputId, output] of Object.entries(receipt.outputs)) {
        assert.equal(await digest(resolve(projectRoot, output.sourcePath)), output.sourceSha256, `${outputId} source`);
        assert.equal(await digest(resolve(projectRoot, output.outputPath)), output.outputSha256, `${outputId} output`);
      }
    }
  });

  it('pins every contextual dailies frame', async () => {
    const receipt = JSON.parse(await readFile(resolve(evidenceRoot, 'dailies.receipt.json'), 'utf8')) as {
      frames: Array<{ momentId: string; path: string; sha256: string }>;
    };

    for (const frame of receipt.frames) {
      assert.equal(await digest(resolve(evidenceRoot, frame.path)), frame.sha256, frame.momentId);
    }
  });
});
