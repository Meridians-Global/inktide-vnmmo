// @jasonyu0100
export type ProductionCoordinate = Readonly<{
  productionId: string;
  storyFile: string;
}>;

export const productions: Readonly<Record<string, ProductionCoordinate>> = {
  'spider-memory-between-us-v1': { productionId: 'spider-man-memory-between-us-v1', storyFile: 'src/story/spider-memory.ts' },
  'moon-scar-reading-v1': { productionId: 'moon-scar-ledger-v2', storyFile: 'src/story/moon-scar.ts' },
  'privet-drive-boy-who-lived-v1': { productionId: 'privet-drive-boy-who-lived-v1', storyFile: 'src/story/boy-who-lived.ts' },
};

export function productionFor(experienceId: string): ProductionCoordinate {
  const production = productions[experienceId];
  if (!production) throw new Error(`Experience ${experienceId} needs an explicit production coordinate`);
  return production;
}

export function productionIdFor(experienceId: string): string {
  return productionFor(experienceId).productionId;
}
