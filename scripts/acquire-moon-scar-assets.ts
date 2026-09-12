// @jasonyu0100
import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import sharp from 'sharp';
import { runReplicatePrediction, replicateInputDigest, selectReplicateOutputUrl } from '../src/provider/replicate';
import { inspectChromaMatte, refineSegmentedChromaMatte, type Rgb } from '../src/core/chroma-matte';
import { loadLocalEnvironment, requireSetting } from './config';

const projectRoot = resolve(import.meta.dirname, '..');
await loadLocalEnvironment(projectRoot);
const token = requireSetting('REPLICATE_API_TOKEN');
const productionId = 'moon-scar-ledger-v2';
const assetRoot = `assets/generated/${productionId}`;
const outputDirectory = join(projectRoot, assetRoot);
const evidenceDirectory = join(projectRoot, `productions/${productionId}/evidence`);
await mkdir(outputDirectory, { recursive: true });
await mkdir(evidenceDirectory, { recursive: true });

const model = 'bytedance/seedream-4.5';
const matteModel = '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc';
const legacyRoot = resolve(projectRoot, '../sfx-lab');
const legacyFangCoordinate = 'productions/reverend-insanity/episode-006-the-supply-tendon/vn-entity-combination-proof-v2/assets/entities/fang-field-mantle-guarded-v3.png';
const legacyFangReceiptCoordinate = 'productions/reverend-insanity/episode-006-the-supply-tendon/vn-entity-combination-proof-v2/evidence/fang-field-expression-v3/receipt.json';
const legacyChunCoordinate = 'productions/reverend-insanity/episode-007-three-heartbeats/vn-reader-v1/assets/entities/gu-yue-chun-ambush-contact-v2.png';
const legacyChunReceiptCoordinate = 'productions/reverend-insanity/episode-007-three-heartbeats/vn-reader-v1/evidence/gu-yue-chun-ambush-contact-v2/receipt.json';
const legacyFang = join(legacyRoot, legacyFangCoordinate);
const legacyChun = join(legacyRoot, legacyChunCoordinate);

const style = 'High-fidelity authored 2D xianxia visual-novel illustration, refined anime-influenced anatomy, cohesive late-medieval Southern Border material culture, crisp naturally tapered linework, clean faces and hands, layered cloth and worn stone texture, cool charcoal-violet and weathered blue-grey palette with selective warm accents, cinematic directional light, restrained atmospheric depth, smooth full-resolution shapes with only faint retro-game texture in a few shadow edges, elegant detailed key art readable at phone scale.';
const exclusions = 'No text, letters, numbers, captions, logos, border, interface, placement guides, anonymous silhouettes, duplicate objects, extra limbs, malformed hands, chibi anatomy, glossy 3D, photorealism, vector-flat rendering, painterly blur, coarse square pixels, 8-bit or 16-bit sprite art.';

type Request = {
  id: string;
  kind: 'background' | 'isolated';
  aspectRatio: '16:9' | '3:4' | '1:1';
  prompt: string;
  references?: string[];
};

const requests: Request[] = [
  {
    id: 'mountain-cleft-stage-v3',
    kind: 'background',
    aspectRatio: '16:9',
    prompt: `High-resolution hand-drawn anime environment background, crisp tapered ink contours, detailed worn stone, smooth shapes, restrained texture, cinematic cold light, no coarse pixels. An entirely empty mountain cleft terrace before dawn in winter. Stable eye-level camera. A carved stone shelter frames a distant mountain valley; one broad level flagstone floor spans the full foreground. Snow stays on distant ledges and outside the sheltered floor. The lower foreground remains dark, quiet and visually simple. Absolutely no people, humanoid shapes, character shadows, signs, labels, decorative markers, frames, panels, interface, diagram, furniture, freestanding object, or magic. A single clean environmental painting only. ${exclusions}`,
  },
  {
    id: 'secret-cellar-stage-v3',
    kind: 'background',
    aspectRatio: '16:9',
    prompt: `High-resolution hand-drawn anime environment background, crisp tapered ink contours, detailed worn stone and wood, smooth shapes, restrained texture, cinematic practical light, no coarse pixels. An entirely empty concealed cellar beneath an old xianxia clan hall. Stable straight-on eye-level camera. One broad level flagstone floor spans the foreground. A low carved examination table sits against the rear centre wall. A closed stone doorway is at rear-left; shallow shelves and a hooded warm lantern are at rear-right; cold violet moonlight enters through one narrow high vent. The lower foreground remains dark, quiet and visually simple. Absolutely no people, humanoid shapes, character shadows, vessels, signs, labels, decorative markers, frames, panels, interface, diagram, or magic. A single clean environmental painting only. ${exclusions}`,
  },
  {
    id: 'gu-yue-chun-neutral-v2',
    kind: 'isolated',
    aspectRatio: '3:4',
    references: ['legacy-gu-yue-chun-reference-v1'],
    prompt: `${style} Preserve the exact Gu Yue Chun identity, face, hair arrangement, age, proportions and muted olive-grey clan wardrobe from the reference. Full-body neutral standing visual-novel rendition, facing screen-left in three-quarter profile. Both feet level and visible, posture grounded and self-possessed, hands relaxed and anatomically clear, attentive eyes, restrained mouth, no attack or crouch. Uniform perfectly flat #FF00FF chroma field with generous padding around the complete figure, no floor, cast shadow, scenery, magenta rim light, or reflected magenta. ${exclusions}`,
  },
  {
    id: 'gu-yue-chun-disclosure-v1',
    kind: 'isolated',
    aspectRatio: '3:4',
    references: ['legacy-gu-yue-chun-reference-v1', 'legacy-fang-style-reference-v1'],
    prompt: `${style} Reference one owns Gu Yue Chun's exact identity, face, hair arrangement, age, proportions and muted olive-grey clan wardrobe. Reference two owns only the established cast linework, shading depth and cinematic finish; do not copy Fang Yuan's body, face, hair, clothing or colours. Full-body Gu Yue Chun facing screen-left at the same standing height and grounded feet. This is the restrained disclosure after Fang Yuan asks what the failed moss became: her eyes sharpen toward him, her chin lifts by a fraction, her lips part for the answer, and one relaxed hand opens slightly toward the unseen reliquary while the rest of her posture stays controlled. No smile, tears, attack stance, theatrical pointing, folded arms, chin touch or melodramatic gesture. Uniform perfectly flat #FF00FF chroma field with generous padding around the complete figure, no floor, cast shadow, scenery, magenta rim light or reflected magenta. ${exclusions}`,
  },
  {
    id: 'gu-yue-chun-disclosure-v2',
    kind: 'isolated',
    aspectRatio: '3:4',
    references: ['legacy-gu-yue-chun-reference-v1', 'legacy-fang-style-reference-v1'],
    prompt: `${style} Reference one owns Gu Yue Chun's exact identity, face, hair arrangement, age, proportions and muted olive-grey clan wardrobe. Reference two owns only the established cast linework, shading depth and cinematic finish; do not copy Fang Yuan's body, face, hair, clothing, eye colour or palette. Full-body Gu Yue Chun facing screen-left at the same standing height and grounded feet. Her irises are natural very dark brown with white sclera and small dark pupils—never red, pink, violet, glowing or stylized. This is the restrained disclosure after Fang Yuan asks what the failed moss became: her gaze sharpens toward him, chin lifts by a fraction, lips part for the answer, and one relaxed hand opens slightly toward the unseen reliquary while the rest of her posture stays controlled. No smile, tears, attack stance, theatrical pointing, folded arms, chin touch or melodramatic gesture. Uniform perfectly flat #FF00FF chroma field with generous padding around the complete figure, no floor, cast shadow, scenery, magenta rim light or reflected magenta. ${exclusions}`,
  },
  {
    id: 'gu-yue-chun-moon-scar-reaction-v1',
    kind: 'isolated',
    aspectRatio: '3:4',
    references: ['legacy-gu-yue-chun-reference-v1', 'legacy-fang-style-reference-v1'],
    prompt: `${style} Reference one owns Gu Yue Chun's exact identity, face, hair arrangement, age, proportions and muted olive-grey clan wardrobe. Reference two owns only the established cast linework, shading depth and cinematic finish; do not copy Fang Yuan's body, face, hair, clothing, eye colour or palette. Full-body Gu Yue Chun facing screen-left at the same standing height and grounded feet. Her irises are natural very dark brown with white sclera and small dark pupils—never red, pink, violet, glowing or stylized. This is the contained reaction when the Moon-Scar reliquary opens: her gaze drops slightly toward the unseen centre object, lips close, shoulders draw still, and the previously open hand withdraws close to her sleeve. She recognizes danger but suppresses alarm. No smile, tears, attack stance, pointing, folded arms, chin touch or large recoil. Uniform perfectly flat #FF00FF chroma field with generous padding around the complete figure, no floor, cast shadow, scenery, magenta rim light or reflected magenta. ${exclusions}`,
  },
  {
    id: 'moon-scar-revelation-cg-v1',
    kind: 'background',
    aspectRatio: '16:9',
    references: ['legacy-gu-yue-chun-reference-v1', 'legacy-fang-style-reference-v1'],
    prompt: `Modern premium visual-novel event CG, full 16:9 frame, smooth high-resolution anime illustration with crisp tapered linework, nuanced facial acting, cinematic violet-and-lantern lighting and no coarse pixels. Preserve the two reference identities: Fang Yuan is the long-haired young man in layered charcoal robes on frame-left, controlled and analytical; Gu Yue Chun is the young woman with the compact braided bun and muted olive-grey robes on frame-right, contained alarm in her natural dark-brown eyes. In a concealed worn-stone cellar, they face inward across a palm-sized dark-stone reliquary on the rear examination table. One thin violet crescent seam has just opened in the reliquary; its directional light catches their eyes and hands. Medium close ensemble composition, faces and the object all readable at phone scale, quiet negative space in the lower quarter for a visual-novel dialogue rail. This is one pivotal authored memory image, not a sprite sheet or interface. ${exclusions}`,
  },
  {
    id: 'sealed-substrate-v3',
    kind: 'isolated',
    aspectRatio: '1:1',
    prompt: `Isolated anime game inventory object, object only, centered and fully visible: one palm-sized shallow dark-stone cultivation reliquary containing pale moss beneath a fitted clear mineral lid, wrapped once with a narrow blank paper seal. Three-quarter view, high-resolution crisp tapered linework, coherent practical construction, readable silhouette, generous empty padding. Uniform perfectly flat #00FF66 green-screen background. Absolutely no person, face, body, hand, room, table, floor, stand, cast shadow, scenery, text, label, interface, or second object. ${exclusions}`,
  },
  {
    id: 'moon-scar-gu-v3',
    kind: 'isolated',
    aspectRatio: '1:1',
    prompt: `Isolated anime game inventory object, object only, centered and fully visible: one palm-sized oval Moon-Scar Gu reliquary made from dark stone and smoked glass, containing a living pale moss core crossed by one thin luminous violet crescent seam. Three-quarter view, high-resolution crisp tapered linework, coherent practical construction, readable silhouette, generous empty padding. Uniform perfectly flat #00FF66 green-screen background. Absolutely no person, face, body, hand, room, table, floor, stand, cast shadow, scenery, text, label, interface, or second object. ${exclusions}`,
  },
];

type AssetReceipt = {
  sourcePath: string;
  sha256: string;
  provenance: 'replicate' | 'legacy-sfx-lab';
  predictionIds?: string[];
  generatedUrl?: string;
  transparentUrl?: string;
  legacySourcePath?: string;
  legacyReceiptPath?: string;
  matteInspection?: ReturnType<typeof inspectChromaMatte>;
};

const assets: Record<string, AssetReceipt> = {};
const requestDigests: Record<string, string> = {};

async function fileDigest(path: string): Promise<string> {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function completedPrediction(evidenceName: string): Promise<{ id: string; status: string; input: Record<string, unknown>; output: unknown } | undefined> {
  try {
    const result = JSON.parse(await readFile(join(evidenceDirectory, `${evidenceName}.result.json`), 'utf8')) as { id: string; status: string; input: Record<string, unknown>; output: unknown };
    return result.status === 'succeeded' ? result : undefined;
  } catch {
    return undefined;
  }
}

async function predict(evidenceName: string, selectedModel: string, input: Record<string, unknown>) {
  requestDigests[evidenceName] = replicateInputDigest(input);
  const retained = await completedPrediction(evidenceName);
  if (retained) return retained;
  return runReplicatePrediction({ token, model: selectedModel, input, evidenceDirectory, evidenceName });
}

async function reuseExisting(request: Request): Promise<boolean> {
  if (request.kind === 'isolated' && (process.env.REBUILD_MATTE === '1' || process.env.REBUILD_MATTE_ID === request.id)) return false;
  const extension = request.kind === 'background' ? 'jpg' : 'png';
  const target = join(outputDirectory, `${request.id}.${extension}`);
  try {
    await access(target);
    const generated = await completedPrediction(`${request.id}.generate`);
    const matte = request.kind === 'isolated' ? await completedPrediction(`${request.id}.matte`) : undefined;
    if (!generated || (request.kind === 'isolated' && !matte)) return false;
    requestDigests[`${request.id}.generate`] = replicateInputDigest(generated.input);
    if (matte) requestDigests[`${request.id}.matte`] = replicateInputDigest(matte.input);
    const inspection = request.kind === 'isolated' ? await inspectAssetMatte(target, matteFor(request.id)) : undefined;
    if (inspection && inspection.visiblePixels > 0.9 * inspection.width * inspection.height) return false;
    assets[request.id] = {
      sourcePath: `${assetRoot}/${request.id}.${extension}`,
      sha256: await fileDigest(target),
      provenance: 'replicate',
      predictionIds: matte ? [generated.id, matte.id] : [generated.id],
      generatedUrl: selectReplicateOutputUrl(generated.output),
      ...(matte ? { transparentUrl: selectReplicateOutputUrl(matte.output) } : {}),
      ...(inspection ? { matteInspection: inspection.report } : {}),
    };
    return true;
  } catch {
    return false;
  }
}

async function inspectAssetMatte(path: string, matte: Rgb) {
  const decoded = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: decoded.info.width, height: decoded.info.height, report: inspectChromaMatte(decoded.data, decoded.info.width, decoded.info.height, matte), ...inspectChromaMatte(decoded.data, decoded.info.width, decoded.info.height, matte) };
}

function matteFor(requestId: string): Rgb {
  return requestId.startsWith('gu-yue-chun-') ? [255, 0, 255] : [0, 255, 102];
}

async function prepareLocalMatte(source: Buffer, segmented: Buffer, matte: Rgb): Promise<{ bytes: Buffer; report: ReturnType<typeof inspectChromaMatte>; clearedPixels: number }> {
  const [decodedSource, decodedSegmented] = await Promise.all([
    sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(segmented).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  if (decodedSource.info.width !== decodedSegmented.info.width || decodedSource.info.height !== decodedSegmented.info.height) throw new Error('Generated and segmented mattes have different dimensions');
  const refined = refineSegmentedChromaMatte(decodedSource.data, decodedSegmented.data, decodedSource.info.width, decodedSource.info.height, matte);
  return {
    bytes: await sharp(refined.data, { raw: { width: decodedSource.info.width, height: decodedSource.info.height, channels: 4 } }).png().toBuffer(),
    report: refined.inspection,
    clearedPixels: refined.clearedPixels,
  };
}

const fangTarget = join(outputDirectory, basename(legacyFang));
await copyFile(legacyFang, fangTarget);
assets['fang-field-mantle-guarded-v3'] = {
  sourcePath: `${assetRoot}/${basename(legacyFang)}`,
  sha256: await fileDigest(fangTarget),
  provenance: 'legacy-sfx-lab',
  legacySourcePath: `legacy-sfx-lab://${legacyFangCoordinate}`,
  legacyReceiptPath: `legacy-sfx-lab://${legacyFangReceiptCoordinate}`,
};

const chunReferenceTarget = join(outputDirectory, 'legacy-gu-yue-chun-reference-v1.jpg');
await sharp(legacyChun)
  .flatten({ background: '#8f4f8f' })
  .resize({ width: 576, height: 768, fit: 'contain', background: '#8f4f8f' })
  .jpeg({ quality: 86 })
  .toFile(chunReferenceTarget);
assets['legacy-gu-yue-chun-reference-v1'] = {
  sourcePath: `${assetRoot}/legacy-gu-yue-chun-reference-v1.jpg`,
  sha256: await fileDigest(chunReferenceTarget),
  provenance: 'legacy-sfx-lab',
  legacySourcePath: `legacy-sfx-lab://${legacyChunCoordinate}`,
  legacyReceiptPath: `legacy-sfx-lab://${legacyChunReceiptCoordinate}`,
};
const chunReferenceData = `data:image/jpeg;base64,${(await readFile(chunReferenceTarget)).toString('base64')}`;

const fangReferenceTarget = join(outputDirectory, 'legacy-fang-style-reference-v1.jpg');
await sharp(legacyFang)
  .flatten({ background: '#73707d' })
  .resize({ width: 576, height: 768, fit: 'contain', background: '#73707d' })
  .jpeg({ quality: 86 })
  .toFile(fangReferenceTarget);
assets['legacy-fang-style-reference-v1'] = {
  sourcePath: `${assetRoot}/legacy-fang-style-reference-v1.jpg`,
  sha256: await fileDigest(fangReferenceTarget),
  provenance: 'legacy-sfx-lab',
  legacySourcePath: `legacy-sfx-lab://${legacyFangCoordinate}`,
  legacyReceiptPath: `legacy-sfx-lab://${legacyFangReceiptCoordinate}`,
};
const fangReferenceData = `data:image/jpeg;base64,${(await readFile(fangReferenceTarget)).toString('base64')}`;
const referenceData = new Map([
  ['legacy-gu-yue-chun-reference-v1', chunReferenceData],
  ['legacy-fang-style-reference-v1', fangReferenceData],
]);

for (const request of requests) {
  if (await reuseExisting(request)) continue;
  const generationInput = {
    prompt: request.prompt,
    aspect_ratio: request.aspectRatio,
    image_input: (request.references ?? []).map((reference) => referenceData.get(reference) ?? reference),
    max_images: 1,
    sequential_image_generation: 'disabled',
    size: '2K',
  };
  const generated = await predict(`${request.id}.generate`, model, generationInput);
  const generatedUrl = selectReplicateOutputUrl(generated.output);
  if (request.kind === 'background') {
    const target = join(outputDirectory, `${request.id}.jpg`);
    await writeFile(target, await download(generatedUrl));
    assets[request.id] = {
      sourcePath: `${assetRoot}/${request.id}.jpg`,
      sha256: await fileDigest(target),
      provenance: 'replicate',
      predictionIds: [generated.id],
      generatedUrl,
    };
    continue;
  }
  const matteInput = { image: generatedUrl, background_type: 'rgba', format: 'png', reverse: false, threshold: 0 };
  const matte = await predict(`${request.id}.matte`, matteModel, matteInput);
  const transparentUrl = selectReplicateOutputUrl(matte.output);
  const target = join(outputDirectory, `${request.id}.png`);
  const generatedBytes = await download(generatedUrl);
  const prepared = await prepareLocalMatte(generatedBytes, await download(transparentUrl), matteFor(request.id));
  await writeFile(target, prepared.bytes);
  assets[request.id] = {
    sourcePath: `${assetRoot}/${request.id}.png`,
    sha256: await fileDigest(target),
    provenance: 'replicate',
    predictionIds: [generated.id, matte.id],
    generatedUrl,
    transparentUrl,
    matteInspection: prepared.report,
  };
}

await writeFile(join(evidenceDirectory, 'acquisition.receipt.json'), `${JSON.stringify({
  schemaVersion: 1,
  productionId,
  status: 'candidate',
  techniqueTransfer: [
    'demand-led exact reachable coordinates',
    'identity and appearance lineage separated from staging',
    'uniform chroma generation followed by dedicated matte provider',
    'stage plates briefed with root band, actor marks, depth boundary and dialogue-safe region',
    'provider events, inputs, outputs and byte digests retained before story admission',
  ],
  models: { generation: model, matte: matteModel },
  requestDigests,
  assets,
}, null, 2)}\n`);

console.log(JSON.stringify(assets, null, 2));
