import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { ProductionPortfolioReport } from '../src/core/production-audit';

const projectRoot = resolve(import.meta.dirname, '..');
const reportPath = join(projectRoot, 'public', 'generated', 'production-report.json');
const report = JSON.parse(await readFile(reportPath, 'utf8')) as ProductionPortfolioReport;

console.log(`\nProduction portfolio · ${report.status}`);
for (const experience of report.experiences) {
  const duration = `${experience.reading.shortestRouteSeconds}–${experience.reading.longestRouteSeconds}s`;
  const high = experience.highPriorityDemandIds.length > 0
    ? ` · high: ${experience.highPriorityDemandIds.join(', ')}`
    : '';
  const medium = experience.mediumPriorityDemandIds.length > 0
    ? ` · medium: ${experience.mediumPriorityDemandIds.join(', ')}`
    : '';
  console.log(`  ${experience.status === 'targets-met' ? '✓' : '!'} ${experience.experienceId} · ${duration}${high}${medium}`);
}
if (report.nextRepair) {
  console.log(`  next repair: ${report.nextRepair.experienceId} / ${report.nextRepair.id}`);
} else {
  console.log('  no mechanically derived repair demand; human dailies approval is still required');
}

if (process.argv.includes('--fail-on-high') && report.status === 'needs-repair') process.exitCode = 1;
