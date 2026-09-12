import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { retouchIrisPixels, type IrisRetouchRecipe } from '../src/core/eye-retouch';

const projectRoot = resolve(import.meta.dirname, '..');

const corrections: Array<{
  id: string;
  productionId: string;
  sourcePath: string;
  outputPath: string;
  recipe: IrisRetouchRecipe;
}> = [
  {
    id: 'mj-conflicted-boundary-eye-fixed-v1',
    productionId: 'spider-man-memory-between-us-v1',
    sourcePath: 'assets/generated/spider-man-memory-between-us-v1/mj-conflicted-boundary-v1.png',
    outputPath: 'assets/generated/spider-man-memory-between-us-v1/mj-conflicted-boundary-eye-fixed-v1.png',
    recipe: { regions: [{ cx: 800, cy: 457, rx: 14, ry: 18 }, { cx: 853, cy: 463, rx: 11, ry: 17 }], targetRgb: [90, 55, 32], strength: 0.74, minimumChroma: 24 },
  },
  {
    id: 'mj-reluctant-trust-eye-fixed-v1',
    productionId: 'spider-man-memory-between-us-v1',
    sourcePath: 'assets/generated/spider-man-memory-between-us-v1/mj-reluctant-trust-v1.png',
    outputPath: 'assets/generated/spider-man-memory-between-us-v1/mj-reluctant-trust-eye-fixed-v1.png',
    recipe: { regions: [{ cx: 936, cy: 373, rx: 15, ry: 19 }, { cx: 996, cy: 376, rx: 13, ry: 18 }], targetRgb: [90, 55, 32], strength: 0.74, minimumChroma: 24 },
  },
  {
    id: 'gu-yue-chun-disclosure-eye-fixed-v1',
    productionId: 'moon-scar-ledger-v2',
    sourcePath: 'assets/generated/moon-scar-ledger-v2/gu-yue-chun-disclosure-v1.png',
    outputPath: 'assets/generated/moon-scar-ledger-v2/gu-yue-chun-disclosure-eye-fixed-v1.png',
    recipe: { regions: [{ cx: 955, cy: 326, rx: 10, ry: 16 }], targetRgb: [78, 52, 36], strength: 0.82, minimumChroma: 22 },
  },
];

function digest(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

const receipts = new Map<string, { schemaVersion: 1; productionId: string; operation: string; outputs: Record<string, unknown> }>();
for (const correction of corrections) {
  const source = await readFile(resolve(projectRoot, correction.sourcePath));
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const corrected = retouchIrisPixels(data, info.width, info.height, correction.recipe);
  const output = await sharp(corrected, { raw: info }).png().toBuffer();
  await mkdir(dirname(resolve(projectRoot, correction.outputPath)), { recursive: true });
  await writeFile(resolve(projectRoot, correction.outputPath), output);

  const receipt = receipts.get(correction.productionId) ?? {
    schemaVersion: 1 as const,
    productionId: correction.productionId,
    operation: 'deterministic-iris-retouch',
    outputs: {},
  };
  receipt.outputs[correction.id] = {
    sourcePath: correction.sourcePath,
    sourceSha256: digest(source),
    outputPath: correction.outputPath,
    outputSha256: digest(output),
    recipe: correction.recipe,
  };
  receipts.set(correction.productionId, receipt);
}

for (const [productionId, receipt] of receipts) {
  const receiptPath = resolve(projectRoot, 'productions', productionId, 'evidence', 'eye-correction.receipt.json');
  await mkdir(dirname(receiptPath), { recursive: true });
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
}
