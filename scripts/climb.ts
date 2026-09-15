// @jasonyu0100
// Hill-climb loop: edit → produce → capture dailies → diff → ledger row → your verdict.
//   tsx scripts/climb.ts step [--story <experienceId>] [--skip-produce]
//   tsx scripts/climb.ts verdict <experienceId> <keep|revert|note> [text…]
//   tsx scripts/climb.ts watch [--story <experienceId>]
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import type { ProductionPortfolioReport } from '../src/core/production-audit';
import { productionFor, productionIdFor } from '../src/story/productions';
import { captureDailies, type AutoDailiesReceipt } from './capture-dailies';
import { ITERATIONS_LEDGER } from './dailies-paths';
import { describeDiff, diffProductionDailies } from './diff-dailies';

const projectRoot = resolve(import.meta.dirname, '..');

export type IterationRow = Readonly<{
  schemaVersion: 1;
  at: string;
  experienceId: string;
  experienceSha256: string;
  storySha256: string | null;
  produce: 'passed' | 'failed' | 'skipped';
  audit: Readonly<{ status: string; high: readonly string[]; medium: readonly string[]; nextRepair: string | null }> | null;
  frames: Readonly<{ total: number; variants: number; changed: number; added: number; removed: number; baseline: string }>;
  consoleErrors: number;
  verdict: 'keep' | 'revert' | 'note' | null;
  note: string | null;
}>;

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function ledgerPath(experienceId: string): string {
  return join(projectRoot, 'productions', productionIdFor(experienceId), 'evidence', ITERATIONS_LEDGER);
}

function runNpm(script: string): Promise<number> {
  return new Promise((done) => {
    const child = spawn('npm', ['run', script], { cwd: projectRoot, stdio: 'inherit' });
    child.on('exit', (code) => done(code ?? 1));
  });
}

async function gitBlobSha(path: string): Promise<string | null> {
  return new Promise((done) => {
    const child = spawn('git', ['hash-object', path], { cwd: projectRoot });
    let out = '';
    child.stdout.on('data', (chunk: Buffer) => { out += chunk.toString(); });
    child.on('exit', (code) => done(code === 0 ? out.trim() : null));
  });
}

async function readReport(): Promise<ProductionPortfolioReport | null> {
  try {
    return JSON.parse(await readFile(join(projectRoot, 'public', 'generated', 'production-report.json'), 'utf8')) as ProductionPortfolioReport;
  } catch {
    return null;
  }
}

async function readLedger(experienceId: string): Promise<IterationRow[]> {
  try {
    const text = await readFile(ledgerPath(experienceId), 'utf8');
    return text.split('\n').filter(Boolean).map((line) => JSON.parse(line) as IterationRow);
  } catch {
    return [];
  }
}

async function recordStep(receipt: AutoDailiesReceipt, produce: IterationRow['produce'], report: ProductionPortfolioReport | null): Promise<IterationRow> {
  const artifacts = await diffProductionDailies(receipt.experienceId);
  const entry = report?.experiences.find((experience) => experience.experienceId === receipt.experienceId);
  const storyFile = join(projectRoot, productionFor(receipt.experienceId).storyFile);
  const row: IterationRow = {
    schemaVersion: 1,
    at: receipt.capturedAt,
    experienceId: receipt.experienceId,
    experienceSha256: receipt.experienceSha256,
    storySha256: await gitBlobSha(storyFile),
    produce,
    audit: entry ? {
      status: entry.status,
      high: entry.highPriorityDemandIds,
      medium: entry.mediumPriorityDemandIds,
      nextRepair: report?.nextRepair?.experienceId === receipt.experienceId ? report.nextRepair.id : null,
    } : null,
    frames: {
      total: receipt.frames.length,
      variants: receipt.frames.filter((frame) => frame.reading === 'variant').length,
      changed: artifacts.diff.counts.changed,
      added: artifacts.diff.counts.added,
      removed: artifacts.diff.counts.removed,
      baseline: artifacts.baseline,
    },
    consoleErrors: receipt.consoleErrors.length,
    verdict: null,
    note: null,
  };
  await appendFile(ledgerPath(receipt.experienceId), `${JSON.stringify(row)}\n`);
  console.log(`\n${describeDiff(artifacts)}`);
  if (row.audit) {
    console.log(`    audit ${row.audit.status}${row.audit.high.length > 0 ? ` · high ${row.audit.high.join(', ')}` : ''}${row.audit.medium.length > 0 ? ` · medium ${row.audit.medium.join(', ')}` : ''}`);
    if (row.audit.nextRepair) console.log(`    next repair → ${row.audit.nextRepair}`);
  }
  console.log(`    ledger ${relative(projectRoot, ledgerPath(receipt.experienceId))} · verdict pending: npm run climb:verdict -- ${receipt.experienceId} keep|revert|note "…"`);
  return row;
}

export async function step(options: { storyId?: string; skipProduce?: boolean } = {}): Promise<boolean> {
  let produce: IterationRow['produce'] = 'skipped';
  if (!options.skipProduce) {
    const code = await runNpm('produce');
    produce = code === 0 ? 'passed' : 'failed';
    if (produce === 'failed') {
      console.error('\nproduce failed; fix the compiler/test output above before capturing dailies.');
      return false;
    }
  }
  const receipts = await captureDailies(options.storyId ? { storyId: options.storyId } : {});
  const report = await readReport();
  let ok = true;
  for (const receipt of receipts) {
    const row = await recordStep(receipt, produce, report);
    if (row.consoleErrors > 0) ok = false;
  }
  return ok;
}

export async function verdict(experienceId: string, value: IterationRow['verdict'], note: string | null): Promise<void> {
  const rows = await readLedger(experienceId);
  const last = rows.at(-1);
  if (!last) throw new Error(`No iterations recorded for ${experienceId}; run npm run climb:step first`);
  rows[rows.length - 1] = { ...last, verdict: value, note };
  await writeFile(ledgerPath(experienceId), `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
  console.log(`${experienceId} · iteration ${rows.length} (${last.experienceSha256.slice(0, 12)}) → ${value}${note ? ` · ${note}` : ''}`);
}

export function watchAndClimb(options: { storyId?: string } = {}): void {
  const roots = ['src', 'productions'].map((dir) => join(projectRoot, dir));
  let timer: NodeJS.Timeout | null = null;
  let running = false;
  let dirty = false;
  const schedule = (reason: string): void => {
    if (reason.includes('auto-dailies') || reason.endsWith(ITERATIONS_LEDGER) || reason.endsWith('DIFF.html') || reason.endsWith('diff.json')) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) {
        dirty = true;
        return;
      }
      running = true;
      console.log(`\n▶ climb step (${reason})`);
      try {
        await step({ ...(options.storyId ? { storyId: options.storyId } : {}), skipProduce: false });
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      } finally {
        running = false;
        if (dirty) {
          dirty = false;
          schedule('changes during run');
        } else {
          console.log('\nwatching src/ and productions/ — edit and save to climb again (Ctrl-C to stop)');
        }
      }
    }, 600);
  };
  for (const root of roots) {
    watch(root, { recursive: true }, (_event, filename) => schedule(filename ? relative(projectRoot, join(root, filename.toString())) : root));
  }
  console.log('watching src/ and productions/ — edit and save to climb (Ctrl-C to stop)');
  schedule('initial');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const command = process.argv[2];
  const storyId = argValue('--story');
  if (command === 'step') {
    const ok = await step({ ...(storyId ? { storyId } : {}), skipProduce: process.argv.includes('--skip-produce') });
    if (!ok) process.exitCode = 1;
  } else if (command === 'verdict') {
    const [, , , experienceId, value, ...note] = process.argv;
    if (!experienceId || !value || !['keep', 'revert', 'note'].includes(value)) {
      throw new Error('usage: climb verdict <experienceId> <keep|revert|note> [text…]');
    }
    await verdict(experienceId, value as IterationRow['verdict'], note.length > 0 ? note.join(' ') : null);
  } else if (command === 'watch') {
    watchAndClimb(storyId ? { storyId } : {});
  } else {
    throw new Error('usage: climb <step|verdict|watch>');
  }
}
