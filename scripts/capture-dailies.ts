// @jasonyu0100
// Render every reachable reading of every registered Experience in the real 16:9 reader and pin the frames.
// Usage: tsx scripts/capture-dailies.ts [--story <experienceId>] [--port 4191]
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn, type ChildProcess } from 'node:child_process';
import { join, resolve } from 'node:path';
import { chromium, type Page } from 'playwright';
import type { CompiledExperience } from '../src/core/contracts';
import { planDailies, type DailiesFramePlan } from '../src/core/dailies-plan';
import { productionIdFor } from '../src/story/productions';
import { AUTO_DAILIES_DIR, AUTO_DAILIES_PREVIOUS_DIR, AUTO_DAILIES_RECEIPT } from './dailies-paths';

export type AutoDailiesFrame = Readonly<{
  frameId: string;
  momentId: string;
  tableauId: string;
  reading: 'base' | 'variant';
  file: string;
  sha256: string;
  route: readonly Readonly<{ nodeId: string; optionId: string }>[];
  insightIds: readonly string[];
  availableOptionIds: readonly string[];
  textSha256: string;
  steps: number;
}>;

export type AutoDailiesReceipt = Readonly<{
  schemaVersion: 1;
  productionId: string;
  experienceId: string;
  experienceSha256: string;
  viewport: Readonly<{ width: number; height: number }>;
  capturedAt: string;
  consoleErrors: readonly string[];
  frames: readonly AutoDailiesFrame[];
}>;


const VIEWPORT = { width: 1600, height: 900 } as const;
const projectRoot = resolve(import.meta.dirname, '..');
const generatedRoot = join(projectRoot, 'public', 'generated');

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function sha256(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex');
}

async function startPreview(port: number): Promise<ChildProcess> {
  const child = spawn(join(projectRoot, 'node_modules', '.bin', 'vite'), ['preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  const origin = `http://127.0.0.1:${port}/generated/catalog.json`;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`vite preview exited with ${child.exitCode}`);
    try {
      const response = await fetch(origin);
      if (response.ok) return child;
    } catch {
      // not listening yet
    }
    await new Promise((done) => setTimeout(done, 100));
  }
  stopPreview(child);
  throw new Error('vite preview did not start');
}

function stopPreview(child: ChildProcess): void {
  if (child.pid && child.exitCode === null) process.kill(-child.pid, 'SIGTERM');
}

async function settle(page: Page, expectedText: string): Promise<void> {
  await page.waitForFunction(
    (text) => document.querySelector('.line')?.textContent === text,
    expectedText,
    { timeout: 10_000 },
  );
  await page.waitForFunction(() =>
    [...document.querySelectorAll('img')].every((image) => !image.getAttribute('src') || image.complete),
  );
  await page.evaluate(() => document.fonts.ready);
}

async function replay(page: Page, frame: DailiesFramePlan, origin: string, experienceId: string, startNodeId: string): Promise<void> {
  await page.goto(`${origin}/?story=${encodeURIComponent(experienceId)}&moment=${encodeURIComponent(startNodeId)}`);
  await page.waitForSelector('.line:not(:empty)');
  for (const step of frame.steps) {
    if (step.type === 'advance') await page.click('[data-action="next"]');
    else if (step.type === 'back') await page.click('[data-action="back"]');
    else await page.click(`[data-option-id="${step.optionId}"]`);
  }
  await settle(page, frame.text);
}

export async function captureExperience(
  experience: CompiledExperience,
  origin: string,
  page: Page,
  onConsoleError: (message: string) => void,
): Promise<{ receipt: AutoDailiesReceipt; evidenceRoot: string }> {
  const productionId = productionIdFor(experience.id);
  const evidenceRoot = join(projectRoot, 'productions', productionId, 'evidence');
  const framesRoot = join(evidenceRoot, AUTO_DAILIES_DIR);
  const previousRoot = join(evidenceRoot, AUTO_DAILIES_PREVIOUS_DIR);
  const buildReceipt = JSON.parse(await readFile(join(generatedRoot, experience.id, 'receipt.json'), 'utf8')) as { experienceSha256: string };

  if (existsSync(framesRoot)) {
    await rm(previousRoot, { recursive: true, force: true });
    await rename(framesRoot, previousRoot);
    const priorReceipt = join(evidenceRoot, AUTO_DAILIES_RECEIPT);
    if (existsSync(priorReceipt)) await rename(priorReceipt, join(previousRoot, AUTO_DAILIES_RECEIPT));
  }
  await mkdir(framesRoot, { recursive: true });

  const plan = planDailies(experience);
  const consoleErrors: string[] = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) {
      consoleErrors.push(message.text());
      onConsoleError(message.text());
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
    onConsoleError(error.message);
  });

  const frames: AutoDailiesFrame[] = [];
  for (const frame of plan) {
    await replay(page, frame, origin, experience.id, experience.startNodeId);
    const file = `${frame.frameId}.png`;
    const bytes = await page.locator('.stage').screenshot({ animations: 'disabled', caret: 'hide', type: 'png' });
    await writeFile(join(framesRoot, file), bytes);
    frames.push({
      frameId: frame.frameId,
      momentId: frame.momentId,
      tableauId: frame.tableauId,
      reading: frame.reading,
      file: `${AUTO_DAILIES_DIR}/${file}`,
      sha256: sha256(bytes),
      route: frame.route,
      insightIds: frame.insightIds,
      availableOptionIds: frame.availableOptionIds,
      textSha256: sha256(frame.text),
      steps: frame.steps.length,
    });
    process.stdout.write(`  ${frame.reading === 'base' ? '·' : '+'} ${experience.id}/${frame.frameId} (${frame.steps.length} steps)\n`);
  }

  const receipt: AutoDailiesReceipt = {
    schemaVersion: 1,
    productionId,
    experienceId: experience.id,
    experienceSha256: buildReceipt.experienceSha256,
    viewport: VIEWPORT,
    capturedAt: new Date().toISOString(),
    consoleErrors,
    frames,
  };
  await writeFile(join(evidenceRoot, AUTO_DAILIES_RECEIPT), `${JSON.stringify(receipt, null, 2)}\n`);
  return { receipt, evidenceRoot };
}

export async function captureDailies(options: { storyId?: string; port?: number } = {}): Promise<AutoDailiesReceipt[]> {
  const port = options.port ?? 4191;
  const catalog = JSON.parse(await readFile(join(generatedRoot, 'catalog.json'), 'utf8')) as { experiences: { id: string }[] };
  const selected = catalog.experiences.filter((entry) => !options.storyId || entry.id === options.storyId);
  if (selected.length === 0) throw new Error(`No prepared experience matches ${options.storyId ?? '(any)'}; run npm run build:experience`);

  const server = await startPreview(port);
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const receipts: AutoDailiesReceipt[] = [];
  try {
    const context = await browser.newContext({ viewport: { ...VIEWPORT }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const entry of selected) {
      const experience = JSON.parse(await readFile(join(generatedRoot, entry.id, 'experience.json'), 'utf8')) as CompiledExperience;
      console.log(`\nCapturing ${experience.id}`);
      const { receipt } = await captureExperience(experience, origin, page, (message) => console.error(`  console error: ${message}`));
      console.log(`  ${receipt.frames.length} frames · ${receipt.frames.filter((frame) => frame.reading === 'variant').length} variant readings · ${receipt.consoleErrors.length} console errors`);
      receipts.push(receipt);
    }
  } finally {
    await browser.close();
    stopPreview(server);
  }
  return receipts;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const storyId = argValue('--story');
  const port = argValue('--port');
  const receipts = await captureDailies({
    ...(storyId ? { storyId } : {}),
    ...(port ? { port: Number(port) } : {}),
  });
  const failures = receipts.filter((receipt) => receipt.consoleErrors.length > 0);
  if (failures.length > 0) {
    console.error(`\nConsole errors in: ${failures.map((receipt) => receipt.experienceId).join(', ')}`);
    process.exitCode = 1;
  }
}
