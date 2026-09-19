// @jasonyu0100
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProductionEvidence } from '../../src/core/production-audit';
import { productionIdFor } from '../../src/story/productions';
import type { AssetReceipt } from './acquisition-kit';

/** Collects receipt-backed evidence for one Experience so the pure audit can compare against it. */
export async function loadProductionEvidence(projectRoot: string, experienceId: string): Promise<ProductionEvidence> {
  const receiptPath = join(projectRoot, 'productions', productionIdFor(experienceId), 'evidence', 'cg-composition.receipt.json');
  let receipt: { assets: Record<string, AssetReceipt> };
  try {
    receipt = JSON.parse(await readFile(receiptPath, 'utf8')) as { assets: Record<string, AssetReceipt> };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { composedCgSha256s: [] };
    throw error;
  }
  return {
    composedCgSha256s: Object.values(receipt.assets)
      .filter((asset) => asset.composition)
      .map((asset) => asset.sha256),
  };
}
