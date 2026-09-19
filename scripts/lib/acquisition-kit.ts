// @jasonyu0100
// Manifest-driven offline acquisition: a new Experience declares plates, isolated figures/objects and CGs as data;
// the kit handles provider calls, retained evidence, matte refinement, reuse of completed predictions and the receipt.
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { runReplicatePrediction, replicateInputDigest, selectReplicateOutputUrl } from '../../src/provider/replicate';
import { inspectChromaMatte, refineSegmentedChromaMatte, type Rgb } from '../../src/core/chroma-matte';
import { composePrompt, type CgComposition } from '../../src/core/cg-composition';

export type AcquisitionRequest = {
  id: string;
  kind: 'background' | 'cg' | 'isolated';
  aspectRatio: '16:9' | '3:4' | '1:1';
  prompt: string;
  /** Earlier request ids, or repository-relative paths of already-pinned assets, fed back as identity/style references. */
  references?: string[];
  /** Chroma field the prompt asked for; only isolated requests use it. */
  matte?: Rgb;
  /** Required for `cg`: the shot design, compiled after `prompt` so the subject text never carries framing. */
  composition?: CgComposition;
};

export type AcquisitionManifest = {
  productionId: string;
  generationModel: string;
  matteModel: string;
  requests: AcquisitionRequest[];
  techniqueTransfer: string[];
  /** Receipt file under the production's evidence directory; a supplementary pass names its own so it never clobbers the original. */
  receiptName?: string;
};

export type AssetReceipt = {
  sourcePath: string;
  sha256: string;
  provenance: 'replicate';
  predictionIds: string[];
  generatedUrl: string;
  composition?: CgComposition;
  transparentUrl?: string;
  matteInspection?: ReturnType<typeof inspectChromaMatte>;
};

type CompletedPrediction = { id: string; status: string; input: Record<string, unknown>; output: unknown };

export const MAGENTA: Rgb = [255, 0, 255];
export const GREEN: Rgb = [0, 255, 102];

/** The provider prompt: subject text, then the compiled composition for CGs. */
export function requestPrompt(request: AcquisitionRequest): string {
  if (request.kind !== 'cg') return request.prompt;
  if (!request.composition) throw new Error(`${request.id}: a cg request needs a composition brief`);
  return `${request.prompt} ${composePrompt(request.composition)}`;
}

export async function fileDigest(path: string): Promise<string> {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function extensionFor(kind: AcquisitionRequest['kind']): 'jpg' | 'png' {
  return kind === 'isolated' ? 'png' : 'jpg';
}

export async function acquire(projectRoot: string, token: string, manifest: AcquisitionManifest): Promise<Record<string, AssetReceipt>> {
  const assetRoot = `assets/generated/${manifest.productionId}`;
  const outputDirectory = join(projectRoot, assetRoot);
  const evidenceDirectory = join(projectRoot, `productions/${manifest.productionId}/evidence`);
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(evidenceDirectory, { recursive: true });

  const assets: Record<string, AssetReceipt> = {};
  const requestDigests: Record<string, string> = {};
  const rebuild = new Set((process.env.REBUILD_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean));

  async function completed(evidenceName: string): Promise<CompletedPrediction | undefined> {
    try {
      const result = JSON.parse(await readFile(join(evidenceDirectory, `${evidenceName}.result.json`), 'utf8')) as CompletedPrediction;
      return result.status === 'succeeded' ? result : undefined;
    } catch {
      return undefined;
    }
  }

  async function predict(evidenceName: string, model: string, input: Record<string, unknown>): Promise<CompletedPrediction> {
    requestDigests[evidenceName] = replicateInputDigest(input);
    const retained = await completed(evidenceName);
    if (retained && replicateInputDigest(retained.input) === requestDigests[evidenceName]) return retained;
    for (let attempt = 0; ; attempt += 1) {
      try {
        const prediction = await runReplicatePrediction({ token, model, input, evidenceDirectory, evidenceName });
        return { id: prediction.id, status: prediction.status, input, output: prediction.output };
      } catch (error) {
        const throttled = /HTTP 429/.test(String(error));
        if (!throttled || attempt >= 6) throw error;
        const retryAfter = Number(/"retry_after":(\d+)/.exec(String(error))?.[1] ?? 10) + 2;
        console.log(`throttled ${evidenceName}; retrying in ${retryAfter}s`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1_000));
      }
    }
  }

  async function reuse(request: AcquisitionRequest): Promise<boolean> {
    if (rebuild.has(request.id) || rebuild.has('*')) return false;
    const target = join(outputDirectory, `${request.id}.${extensionFor(request.kind)}`);
    try {
      await access(target);
    } catch {
      return false;
    }
    const generated = await completed(`${request.id}.generate`);
    if (!generated || generated.input.prompt !== requestPrompt(request) || generated.input.aspect_ratio !== request.aspectRatio) return false;
    const matte = request.kind === 'isolated' ? await completed(`${request.id}.matte`) : undefined;
    if (request.kind === 'isolated' && !matte) return false;
    requestDigests[`${request.id}.generate`] = replicateInputDigest(generated.input);
    if (matte) requestDigests[`${request.id}.matte`] = replicateInputDigest(matte.input);
    assets[request.id] = {
      sourcePath: `${assetRoot}/${request.id}.${extensionFor(request.kind)}`,
      sha256: await fileDigest(target),
      provenance: 'replicate',
      predictionIds: matte ? [generated.id, matte.id] : [generated.id],
      generatedUrl: selectReplicateOutputUrl(generated.output),
      ...(request.composition ? { composition: request.composition } : {}),
      ...(matte ? { transparentUrl: selectReplicateOutputUrl(matte.output) } : {}),
    };
    return true;
  }

  async function referenceData(id: string): Promise<string> {
    const receipt = assets[id];
    if (!receipt && !id.includes('/')) throw new Error(`Reference ${id} must be acquired before the request that uses it`);
    const bytes = await readFile(join(projectRoot, receipt?.sourcePath ?? id));
    const jpeg = await sharp(bytes).flatten({ background: '#808080' }).resize({ width: 768, height: 768, fit: 'inside' }).jpeg({ quality: 88 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  }

  for (const request of manifest.requests) requestPrompt(request);

  for (const request of manifest.requests) {
    if (await reuse(request)) {
      console.log(`reuse    ${request.id}`);
      continue;
    }
    console.log(`generate ${request.id}`);
    const generated = await predict(`${request.id}.generate`, manifest.generationModel, {
      prompt: requestPrompt(request),
      aspect_ratio: request.aspectRatio,
      image_input: await Promise.all((request.references ?? []).map(referenceData)),
      max_images: 1,
      sequential_image_generation: 'disabled',
      size: '2K',
    });
    const generatedUrl = selectReplicateOutputUrl(generated.output);
    const generatedBytes = await download(generatedUrl);
    if (request.kind !== 'isolated') {
      const target = join(outputDirectory, `${request.id}.jpg`);
      await writeFile(target, await sharp(generatedBytes).jpeg({ quality: 92 }).toBuffer());
      assets[request.id] = { sourcePath: `${assetRoot}/${request.id}.jpg`, sha256: await fileDigest(target), provenance: 'replicate', predictionIds: [generated.id], generatedUrl, ...(request.composition ? { composition: request.composition } : {}) };
      continue;
    }
    const matteRgb = request.matte ?? GREEN;
    const matte = await predict(`${request.id}.matte`, manifest.matteModel, { image: generatedUrl, background_type: 'rgba', format: 'png', reverse: false, threshold: 0 });
    const transparentUrl = selectReplicateOutputUrl(matte.output);
    const [source, segmented] = await Promise.all([
      sharp(generatedBytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(await download(transparentUrl)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    ]);
    if (source.info.width !== segmented.info.width || source.info.height !== segmented.info.height) throw new Error(`${request.id}: generated and segmented mattes differ in size`);
    const refined = refineSegmentedChromaMatte(source.data, segmented.data, source.info.width, source.info.height, matteRgb);
    const target = join(outputDirectory, `${request.id}.png`);
    await writeFile(target, await sharp(refined.data, { raw: { width: source.info.width, height: source.info.height, channels: 4 } }).png().toBuffer());
    assets[request.id] = {
      sourcePath: `${assetRoot}/${request.id}.png`,
      sha256: await fileDigest(target),
      provenance: 'replicate',
      predictionIds: [generated.id, matte.id],
      generatedUrl,
      transparentUrl,
      matteInspection: refined.inspection,
    };
  }

  await writeFile(join(evidenceDirectory, manifest.receiptName ?? 'acquisition.receipt.json'), `${JSON.stringify({
    schemaVersion: 1,
    productionId: manifest.productionId,
    status: 'candidate',
    techniqueTransfer: manifest.techniqueTransfer,
    models: { generation: manifest.generationModel, matte: manifest.matteModel },
    requestDigests,
    assets,
  }, null, 2)}\n`);
  return assets;
}

/** Prints `{ id, kind, sourcePath, sha256 }` lines ready to paste into an Experience's `assets` array. */
export function assetLines(assets: Record<string, AssetReceipt>, kinds: Record<string, 'background' | 'figure' | 'artifact' | 'cg'>): string {
  return Object.entries(assets)
    .map(([id, receipt]) => `{ id: '${id}', kind: '${kinds[id] ?? 'figure'}', sourcePath: \`\${generated}/${receipt.sourcePath.split('/').pop()}\`, sha256: '${receipt.sha256}' },`)
    .join('\n');
}
