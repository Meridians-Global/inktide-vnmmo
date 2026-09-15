// @jasonyu0100
import type { ProductionTarget } from '../core/production-audit';

const readerLedBranching: ProductionTarget = {
  requiredChoicePurposes: ['observe', 'interpret', 'predict', 'decide'],
  minimumLocationCount: 2,
  minimumReadingSeconds: 180,
  readingWordsPerMinute: 180,
};

export const productionTargets: Readonly<Record<string, ProductionTarget>> = {
  'spider-memory-between-us-v1': readerLedBranching,
  'moon-scar-reading-v1': readerLedBranching,
};

export function productionTargetFor(experienceId: string): ProductionTarget {
  const target = productionTargets[experienceId];
  if (!target) throw new Error(`Experience ${experienceId} needs an explicit production target`);
  return target;
}
