import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { runReplicatePrediction, replicateInputDigest, selectReplicateOutputUrl } from '../src/provider/replicate';
import { refineSegmentedChromaMatte } from '../src/core/chroma-matte';
import { normalizeFigureBuffer } from '../src/core/figure-normalization';
import { loadLocalEnvironment, requireSetting } from './config';

const projectRoot = resolve(import.meta.dirname, '..');
await loadLocalEnvironment(projectRoot);
const meridiansRoot = resolve(requireSetting('MERIDIANS_ROOT'));
const domainPath = join(meridiansRoot, '.meridians-local/record/docs/domains/N-IMP-mtwby1q31jbg.json');
const evidenceDirectory = join(projectRoot, 'productions/spider-man-memory-between-us-v1/evidence');
const generatedAssetRoot = 'assets/generated/spider-man-memory-between-us-v1';
const outputDirectory = join(projectRoot, generatedAssetRoot);
await mkdir(evidenceDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });

const token = requireSetting('REPLICATE_API_TOKEN');

const domainDigest = createHash('sha256').update(await readFile(domainPath)).digest('hex');
const style = 'High-fidelity cinematic 2D visual-novel illustration, mature anime-influenced anatomy, crisp tapered ink contours, detailed faces and hands, slightly desaturated urban palette, dramatic practical lighting, subtle texture with only faint deliberate pixel clusters in shadow edges, never coarse pixel art, clean readable silhouette at phone scale.';
const exclusions = 'No text, letters, captions, logos, border, UI, watermark, duplicate body, extra limbs, malformed hands, chibi anatomy, glossy 3D, photorealism, thick pixel blocks, or anonymous people.';

type Request = { id: string; kind: 'background' | 'figure'; prompt: string; references?: string[] };
const requests: Request[] = [
  {
    id: 'mj-apartment-night',
    kind: 'background',
    prompt: `${style} Empty modest New York apartment living room at night after an emotionally difficult conversation. Stable eye-level visual-novel camera, broad actor-safe floor with clear left and right standing marks, one worn couch and a small table kept behind the marks, rain-softened city lights through a window, cool blue exterior light and one warm practical lamp. The room must feel inhabited but quiet. Keep faces and bodies absent. Protect the lower quarter for a translucent dialogue rail. ${exclusions}`,
  },
  {
    id: 'mj-apartment-night-clean',
    kind: 'background',
    prompt: `${style} A single clean environmental background painting of an empty modest New York apartment living room at night after an emotionally difficult conversation. Eye-level camera. A worn couch sits against the rear-left wall, a small table and warm floor lamp sit against the rear-right wall, and rain-softened city lights show through one central window. The foreground is naturally open wooden floor with no objects, No people, body silhouettes, shadows shaped like people, mannequins, diagrams, arrows, crosshairs, placement guides, subtitles, interface panels, visual-novel textbox, speech bubble, signage, writing, letters, numbers, or borders anywhere in the image. This is only the world background plate, not a game screenshot or design diagram. ${exclusions}`,
  },
  {
    id: 'peter-civilian-guarded',
    kind: 'figure',
    prompt: `${style} Full-body canonical Peter Parker, a lean white American man in his early twenties with tousled medium-brown hair, expressive brown eyes, a tired kind face and a small healing cut at one eyebrow. He stands in simple charcoal trousers, worn sneakers, a muted blue overshirt over a dark red T-shirt. Neutral grounded stance facing screen-left, both feet level and visible, shoulders carrying fatigue, mouth controlled, gaze attentive. This is the protected identity and civilian wardrobe reference for later renditions. Isolate him on a perfectly uniform flat #00FF66 chroma field with generous padding, no floor, shadow, scenery, green reflection, or rim light. ${exclusions}`,
  },
];

const results: Record<string, { generatedUrl: string; transparentUrl?: string; sourcePath: string; sha256: string; predictionIds: string[] }> = {};
const requestDigests: Record<string, string> = {};

async function run(id: string, model: string, input: Record<string, unknown>, evidenceName: string) {
  requestDigests[evidenceName] = replicateInputDigest(input);
  const prediction = await runReplicatePrediction({ token, model, input, evidenceDirectory, evidenceName });
  return { prediction, url: selectReplicateOutputUrl(prediction.output) };
}

async function completedPrediction(evidenceName: string): Promise<{ id: string; output: unknown } | undefined> {
  try {
    const prediction = JSON.parse(await readFile(join(evidenceDirectory, `${evidenceName}.result.json`), 'utf8')) as { id: string; status: string; output: unknown };
    return prediction.status === 'succeeded' ? prediction : undefined;
  } catch {
    return undefined;
  }
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function prepareLocalMatte(source: Buffer, segmented: Buffer): Promise<Buffer> {
  const [decodedSource, decodedSegmented] = await Promise.all([
    sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(segmented).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  if (decodedSource.info.width !== decodedSegmented.info.width || decodedSource.info.height !== decodedSegmented.info.height) {
    throw new Error('Generated and segmented mattes have different dimensions');
  }
  const refined = refineSegmentedChromaMatte(decodedSource.data, decodedSegmented.data, decodedSource.info.width, decodedSource.info.height, [0, 255, 102]);
  return sharp(refined.data, { raw: { width: decodedSource.info.width, height: decodedSource.info.height, channels: 4 } }).png().toBuffer();
}

async function existingAsset(id: string, extension: 'jpg' | 'png'): Promise<{ generatedUrl: string; transparentUrl?: string; sourcePath: string; sha256: string; predictionIds: string[] } | undefined> {
  if (extension === 'png' && process.env.REBUILD_MATTE_ID === id) return undefined;
  const targetName = `${id}.${extension}`;
  const target = join(outputDirectory, targetName);
  try {
    await access(target);
    const prediction = JSON.parse(await readFile(join(evidenceDirectory, `${id}.generate.result.json`), 'utf8')) as { id: string; input: Record<string, unknown>; output: unknown };
    requestDigests[`${id}.generate`] = replicateInputDigest(prediction.input);
    const matte = extension === 'png'
      ? JSON.parse(await readFile(join(evidenceDirectory, `${id}.matte.result.json`), 'utf8')) as { id: string; input: Record<string, unknown>; output: unknown }
      : undefined;
    if (matte) requestDigests[`${id}.matte`] = replicateInputDigest(matte.input);
    const bytes = await readFile(target);
    return {
      generatedUrl: selectReplicateOutputUrl(prediction.output),
      ...(matte ? { transparentUrl: selectReplicateOutputUrl(matte.output) } : {}),
      sourcePath: `${generatedAssetRoot}/${targetName}`,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      predictionIds: matte ? [prediction.id, matte.id] : [prediction.id],
    };
  } catch {
    return undefined;
  }
}

async function prepareStageCrop(): Promise<{ sourcePath: string; sha256: string; preparation: Record<string, unknown> }> {
  const sourceName = 'mj-apartment-night-clean.jpg';
  const targetName = 'mj-apartment-stage-crop-v1.png';
  const preparation = { kind: 'extract', recipeVersion: 1, left: 800, top: 180, width: 1760, height: 990, format: 'png' };
  const source = join(outputDirectory, sourceName);
  const target = join(outputDirectory, targetName);
  await sharp(source).extract({ left: 800, top: 180, width: 1760, height: 990 }).png().toFile(target);
  return {
    sourcePath: `${generatedAssetRoot}/${targetName}`,
    sha256: createHash('sha256').update(await readFile(target)).digest('hex'),
    preparation: {
      ...preparation,
      sourcePath: `${generatedAssetRoot}/${sourceName}`,
      sourceSha256: createHash('sha256').update(await readFile(source)).digest('hex'),
    },
  };
}

async function acquireFigure(request: Request, references: string[]): Promise<string> {
  const existing = await existingAsset(request.id, 'png');
  if (existing) {
    results[request.id] = existing;
    return existing.generatedUrl;
  }
  const input = { prompt: request.prompt, aspect_ratio: '3:4', image_input: references, max_images: 1, sequential_image_generation: 'disabled', size: '2K' };
  const retainedGeneration = await completedPrediction(`${request.id}.generate`);
  const generated = retainedGeneration
    ? { prediction: retainedGeneration, url: selectReplicateOutputUrl(retainedGeneration.output) }
    : await run(request.id, 'bytedance/seedream-4.5', input, `${request.id}.generate`);
  const retainedMatte = await completedPrediction(`${request.id}.matte`);
  const removed = retainedMatte
    ? { prediction: retainedMatte, url: selectReplicateOutputUrl(retainedMatte.output) }
    : await run(request.id, '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc', {
      image: generated.url,
      background_type: 'rgba',
      format: 'png',
      reverse: false,
      threshold: 0,
    }, `${request.id}.matte`);
  const bytes = await prepareLocalMatte(await download(generated.url), await download(removed.url));
  const targetName = `${request.id}.png`;
  await writeFile(join(outputDirectory, targetName), bytes);
  results[request.id] = {
    generatedUrl: generated.url,
    transparentUrl: removed.url,
    sourcePath: `${generatedAssetRoot}/${targetName}`,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    predictionIds: [generated.prediction.id, removed.prediction.id],
  };
  return generated.url;
}

for (const request of requests) {
  if (request.kind === 'background') {
    const existing = await existingAsset(request.id, 'jpg');
    if (existing) {
      results[request.id] = existing;
      continue;
    }
    const input = { prompt: request.prompt, aspect_ratio: '16:9', image_input: [], max_images: 1, sequential_image_generation: 'disabled', size: '2K' };
    const generated = await run(request.id, 'bytedance/seedream-4.5', input, `${request.id}.generate`);
    const bytes = await download(generated.url);
    const targetName = `${request.id}.jpg`;
    await writeFile(join(outputDirectory, targetName), bytes);
    results[request.id] = {
      generatedUrl: generated.url,
      sourcePath: `${generatedAssetRoot}/${targetName}`,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      predictionIds: [generated.prediction.id],
    };
  } else {
    const civilianReference = await acquireFigure(request, []);
    const masked: Request = {
      id: 'peter-spider-masked',
      kind: 'figure',
      prompt: `${style} Preserve the exact Peter Parker identity, height, proportions, and body from the identity reference. Full-body Peter wearing a fitted red-and-deep-navy Spider-Man suit with fine web pattern and opaque expressive white eye lenses, mask fully covering his face. The suit is lightly damaged after a difficult fight. He faces screen-left in a quiet guarded stance; one hand rests near his injured ribs, the other hangs open rather than clenched. Both feet level and visible. Isolate the complete subject on a perfectly uniform flat #00FF66 chroma field with generous padding, no floor, shadow, scenery, green reflection, or rim light. ${exclusions}`,
    };
    const maskedReference = await acquireFigure(masked, [civilianReference]);
    await acquireFigure({
      id: 'peter-spider-revealed',
      kind: 'figure',
      prompt: `${style} Preserve the exact Peter Parker face, hair, age, height and proportions from reference one and the exact damaged Spider-Man suit from reference two. Full-body Peter in the suit with the mask removed and held loosely at his side. He faces screen-left. His eyes are wet but steady; inner brows lift slightly while his mouth remains restrained. Shoulders relax by a fraction, reading as vulnerable honesty rather than defeat. Both feet level and visible; mask hand anatomically clear. Isolate the complete subject on a perfectly uniform flat #00FF66 chroma field with generous padding, no floor, shadow, scenery, green reflection, or rim light. ${exclusions}`,
    }, [civilianReference, maskedReference]);
    await acquireFigure({
      id: 'mj-guarded',
      kind: 'figure',
      prompt: `${style} Full-body MJ, a slim young Black American woman in her early twenties with warm brown skin, expressive dark brown eyes, and long textured dark hair tied loosely back. She wears a dark olive jacket, rust knit top, straight black jeans and practical boots. She faces screen-right in a contained defensive listening stance: shoulders square, arms relaxed but hands held close, gaze direct, mouth uncertain rather than angry. Both feet level and visible. Isolate the complete subject on a perfectly uniform flat #00FF66 chroma field with generous padding, no floor, shadow, scenery, green reflection, or rim light. ${exclusions}`,
    }, []);
  }
}

const referenceRecipe = {
  kind: 'figure-normalize' as const,
  recipeVersion: 1 as const,
  canvas: { width: 896, height: 1024 },
  subjectBox: { width: 850, height: 960 },
  bottomPadding: 24,
};
const mjReference = await normalizeFigureBuffer(await readFile(join(outputDirectory, 'mj-guarded.png')), {
  ...referenceRecipe,
  matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 },
});
const peterReference = await normalizeFigureBuffer(await readFile(join(outputDirectory, 'peter-spider-revealed.png')), referenceRecipe);
const compactReference = async (bytes: Buffer): Promise<string> => `data:image/jpeg;base64,${(await sharp(bytes)
  .flatten({ background: '#76727d' })
  .resize({ width: 576, height: 768, fit: 'contain', background: '#76727d' })
  .jpeg({ quality: 86 })
  .toBuffer()).toString('base64')}`;
await acquireFigure({
  id: 'mj-conflicted-boundary-v1',
  kind: 'figure',
  prompt: `${style} Reference one owns MJ's exact identity, face, skin tone, hair, proportions and olive-jacket wardrobe. Reference two owns only the established cast linework, shading depth and cinematic finish; do not copy Peter's body, face, clothing or colours. Full-body MJ facing screen-right at the same standing height and grounded feet. This is the moment after she understands Peter's grief but refuses to inherit another woman's answer: her gaze softens without looking away, inner brows lift slightly, jaw releases from anger, lips part for a measured boundary, and one hand loosens from the guarded clasp while her posture stays self-possessed. No smile, tears, embrace, pointing, folded arms or melodramatic gesture. Uniform perfectly flat #00FF66 chroma field with generous padding, no floor, cast shadow, scenery, green rim light or reflected green. ${exclusions}`,
}, [await compactReference(mjReference), await compactReference(peterReference)]);

await acquireFigure({
  id: 'mj-conflicted-boundary-v2',
  kind: 'figure',
  prompt: `${style} Reference one owns MJ's exact identity, face, warm brown skin, long textured dark hair, proportions and olive-jacket wardrobe. Reference two owns only the established cast linework, shading depth and cinematic finish; do not copy Peter's body, face, clothing, eye colour or palette. Full-body MJ facing screen-right at the same standing height and grounded feet. Her irises are natural dark brown with white sclera and small dark pupils—never red, pink, amber, glowing or stylized. This is the moment after she understands Peter's grief but refuses to inherit another woman's answer: her gaze softens without looking away, inner brows lift slightly, jaw releases from anger, lips part for a measured boundary, and one hand loosens from the guarded clasp while her posture stays self-possessed. No smile, tears, embrace, pointing, folded arms or melodramatic gesture. Uniform perfectly flat #00FF66 chroma field with generous padding, no floor, cast shadow, scenery, green rim light or reflected green. ${exclusions}`,
}, [await compactReference(mjReference), await compactReference(peterReference)]);

await acquireFigure({
  id: 'mj-reluctant-trust-v1',
  kind: 'figure',
  prompt: `${style} Reference one owns MJ's exact identity, face, warm brown skin, long textured dark hair, proportions and olive-jacket wardrobe. Reference two owns only the established cast linework, shading depth and cinematic finish; do not copy Peter's body, face, clothing, eye colour or palette. Full-body MJ facing screen-right at the same standing height and grounded feet. Her irises are natural dark brown with white sclera and small dark pupils—never red, pink, amber, glowing or stylized. This is the quiet after-state after she preserves her boundary but asks Peter to take her home: her shoulders ease by a fraction, gaze remains direct, mouth closes into thoughtful resolve, and both hands rest open and visible at her sides. The change is cautious practical trust, not romance or reconciliation. No smile, tears, embrace, pointing, folded arms, chin touch or heroic stance. Uniform perfectly flat #00FF66 chroma field with generous padding, no floor, cast shadow, scenery, green rim light or reflected green. ${exclusions}`,
}, [await compactReference(mjReference), await compactReference(peterReference)]);

const preparedBackground = await prepareStageCrop();

await writeFile(join(evidenceDirectory, 'acquisition.receipt.json'), `${JSON.stringify({
  schemaVersion: 1,
  productionId: 'spider-man-memory-between-us-v1',
  source: { domainId: 'N-IMP-mtwby1q31jbg', sceneId: 'SCN-SPI-16', domainSha256: domainDigest },
  model: 'bytedance/seedream-4.5',
  matteModel: '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
  requestDigests,
  assets: results,
  preparedAssets: { 'mj-apartment-stage-crop-v1': preparedBackground },
}, null, 2)}\n`);

console.log(JSON.stringify(results, null, 2));
