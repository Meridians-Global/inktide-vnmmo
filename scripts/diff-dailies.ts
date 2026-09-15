// @jasonyu0100
// Compare the latest auto-dailies receipt against the previous capture (or the committed receipt) and
// write a before/after contact sheet. Usage: tsx scripts/diff-dailies.ts [--story <experienceId>] [--all]
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import { diffDailies, renderDailiesContactSheet, type DailiesDiff, type DailiesReceiptDigest } from '../src/core/dailies-diff';
import { productionIdFor, productions } from '../src/story/productions';
import { AUTO_DAILIES_DIR, AUTO_DAILIES_PREVIOUS_DIR, AUTO_DAILIES_RECEIPT } from './dailies-paths';

const projectRoot = resolve(import.meta.dirname, '..');
const run = promisify(execFile);

export type DailiesDiffArtifacts = Readonly<{
  diff: DailiesDiff;
  baseline: 'previous-capture' | 'committed-receipt' | 'none';
  sheetPath: string;
  jsonPath: string;
}>;

async function committedReceipt(relativePath: string): Promise<DailiesReceiptDigest | null> {
  try {
    const { stdout } = await run('git', ['show', `HEAD:${relativePath}`], { cwd: projectRoot, maxBuffer: 64 * 1024 * 1024 });
    return JSON.parse(stdout) as DailiesReceiptDigest;
  } catch {
    return null;
  }
}

export async function diffProductionDailies(experienceId: string, options: { showUnchanged?: boolean } = {}): Promise<DailiesDiffArtifacts> {
  const evidenceRoot = join(projectRoot, 'productions', productionIdFor(experienceId), 'evidence');
  const receiptPath = join(evidenceRoot, AUTO_DAILIES_RECEIPT);
  if (!existsSync(receiptPath)) throw new Error(`No auto-dailies receipt for ${experienceId}; run npm run dailies first`);
  const after = JSON.parse(await readFile(receiptPath, 'utf8')) as DailiesReceiptDigest;

  const previousReceiptPath = join(evidenceRoot, AUTO_DAILIES_PREVIOUS_DIR, AUTO_DAILIES_RECEIPT);
  let baseline: DailiesDiffArtifacts['baseline'] = 'none';
  let before: DailiesReceiptDigest | null = null;
  if (existsSync(previousReceiptPath)) {
    before = JSON.parse(await readFile(previousReceiptPath, 'utf8')) as DailiesReceiptDigest;
    baseline = 'previous-capture';
  } else {
    before = await committedReceipt(relative(projectRoot, receiptPath));
    if (before) baseline = 'committed-receipt';
  }

  const diff = diffDailies(before, after);
  const sheetRoot = join(evidenceRoot, AUTO_DAILIES_DIR);
  const sheetPath = join(sheetRoot, 'DIFF.html');
  const jsonPath = join(sheetRoot, 'diff.json');
  const html = renderDailiesContactSheet(diff, {
    before: (frame) => baseline === 'previous-capture'
      ? relative(sheetRoot, join(evidenceRoot, AUTO_DAILIES_PREVIOUS_DIR, frame.file.replace(`${AUTO_DAILIES_DIR}/`, '')))
      : null,
    after: (frame) => relative(sheetRoot, join(evidenceRoot, frame.file)),
  }, { title: `${experienceId} · dailies diff (${baseline})`, ...(options.showUnchanged !== undefined ? { showUnchanged: options.showUnchanged } : {}) });
  await writeFile(sheetPath, html);
  await writeFile(jsonPath, `${JSON.stringify({ baseline, ...diff }, null, 2)}\n`);
  return { diff, baseline, sheetPath, jsonPath };
}

export function describeDiff(artifacts: DailiesDiffArtifacts): string {
  const { diff, baseline } = artifacts;
  const changed = diff.frames.filter((frame) => frame.status !== 'unchanged').map((frame) => `${frame.status === 'changed' ? '~' : frame.status === 'added' ? '+' : '-'}${frame.frameId}`);
  return `${diff.experienceId} · vs ${baseline} · ${diff.counts.changed} changed, ${diff.counts.added} added, ${diff.counts.removed} removed, ${diff.counts.unchanged} unchanged${changed.length > 0 ? `\n    ${changed.join(' ')}` : ''}\n    ${relative(projectRoot, artifacts.sheetPath)}`;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const storyIndex = process.argv.indexOf('--story');
  const storyId = storyIndex >= 0 ? process.argv[storyIndex + 1] : undefined;
  const ids = storyId ? [storyId] : Object.keys(productions);
  for (const id of ids) {
    const artifacts = await diffProductionDailies(id, { showUnchanged: process.argv.includes('--all') });
    console.log(describeDiff(artifacts));
  }
}
