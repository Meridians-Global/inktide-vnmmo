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
    id: 'apartment-hallway-night-v1',
    kind: 'background',
    prompt: `${style} A single clean environmental background painting of the empty hallway immediately outside a modest New York apartment after midnight. Match the cool rainy night and restrained warm practical lighting of an intimate apartment scene. Stable eye-level camera, long shallow corridor with apartment doors receding toward screen-left, the open foreground spanning the full width as a clear level actor stage, one stairwell door at the far end, rain-muted city glow through a narrow wired-glass window. The geography must make a quiet departure and preserved interpersonal distance readable. Keep the lower quarter low-detail for a translucent visual-novel dialogue rail. Absolutely no people, human silhouettes, character-shaped shadows, furniture blocking the actor marks, signs, readable numbers, text, interface, panels, arrows or magic. This is only a coherent world background plate. ${exclusions}`,
  },
  {
    id: 'apartment-hallway-night-v2',
    kind: 'background',
    prompt: `Empty animation background plate, environment only. A modest New York apartment building corridor after midnight in rain, drawn in polished high-resolution 2D anime background art with crisp clean contours, subtle surface texture, cool blue window light and restrained warm ceiling lights. Straight-on eye-level camera. A broad unobstructed level floor fills the near foreground; closed apartment doors recede on both walls; a simple stairwell begins at the distant centre. The architecture is quiet, plausible and empty. Keep the lower foreground visually simple. No character, person, body, face, portrait, phone, hand, silhouette, character-shaped shadow, speech box, user interface, subtitle, caption, writing, letters, number, sign, logo, decorative frame, diagram, prop close-up or magical effect anywhere. Output only the unoccupied building interior as one continuous full-frame 16:9 painting. ${exclusions}`,
  },
  {
    id: 'apartment-hallway-night-v3',
    kind: 'background',
    prompt: `Environment-only animation background plate. The DRY INTERIOR of a modest New York apartment building corridor after midnight, while rain falls outdoors. Polished high-resolution 2D anime background art, crisp clean contours, subtle surface texture, cool blue light entering through windows and restrained warm ceiling lights. Straight-on eye-level camera. A broad dry unobstructed level floor fills the near foreground; closed apartment doors recede on both walls; a simple stairwell begins at the distant centre. Rain is visible only as droplets and blurred city light on the OUTSIDE surfaces of closed windows. There is absolutely no rain, water, puddle, wet reflection, snow, dust or particle effect inside the corridor. No character, person, body, face, portrait, phone, hand, silhouette, character-shaped shadow, speech box, user interface, subtitle, caption, writing, letters, number, sign, logo, decorative frame, diagram, prop close-up or magic. One unoccupied building interior, full-frame 16:9. ${exclusions}`,
  },
  {
    id: 'apartment-hallway-night-v4',
    kind: 'background',
    prompt: `One empty interior environment painting for a modern dramatic animated film: the dry hallway outside a modest New York apartment after midnight. Smooth high-resolution 2D anime illustration with refined tapered linework, nuanced surfaces, cinematic cool-blue window light, restrained warm ceiling lamps, and natural continuous curves. Straight-on eye-level lens. Broad level dry floor in the near foreground, closed apartment doors along both walls, and one stairwell at the distant centre. The weather is conveyed only by soft blue night light and blurred city lights beyond closed glass; do not draw rain streaks, drops, water, puddles, reflections, particles, snow or mist anywhere. No pixel-art blocks or stair-stepped edges. No character, person, body, face, portrait, phone, hand, silhouette, character shadow, box, interface, subtitle, writing, letters, numbers, signs, logos, frame, diagram, prop close-up or magic. Output one unoccupied full-frame 16:9 architectural painting and nothing else.`,
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

async function acquireFaithfulFigureEdit(id: string, prompt: string, references: string[]): Promise<string> {
  const existing = await existingAsset(id, 'png');
  if (existing) {
    results[id] = existing;
    return existing.generatedUrl;
  }
  const input = {
    prompt,
    image_input: references,
    aspect_ratio: 'match_input_image',
    resolution: '2K',
    output_format: 'png',
    safety_filter_level: 'block_only_high',
    allow_fallback_model: false,
  };
  const generated = await run(id, 'google/nano-banana-pro', input, `${id}.generate`);
  const removed = await run(id, '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc', {
    image: generated.url,
    background_type: 'rgba',
    format: 'png',
    reverse: false,
    threshold: 0,
  }, `${id}.matte`);
  const bytes = await prepareLocalMatte(await download(generated.url), await download(removed.url));
  const targetName = `${id}.png`;
  await writeFile(join(outputDirectory, targetName), bytes);
  results[id] = {
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
const losslessChromaReference = async (bytes: Buffer): Promise<string> => `data:image/png;base64,${(await sharp(bytes)
  .flatten({ background: '#00ff66' })
  .png()
  .toBuffer()).toString('base64')}`;

await acquireFigure({
  id: 'peter-choice-returned-staying-v2',
  kind: 'figure',
  prompt:
  `Create one precise acting variation from the supplied canonical Peter Parker image. Preserve his exact identity, uncovered face, tousled brown hair, age, full-body proportions, damaged red-and-deep-navy Spider-Man suit, loose removed mask, screen-left facing, canvas, subject scale, padding, linework, shading and palette. Change only the performance at the instant he decides not to flee through the open door and returns the choice to MJ. His feet remain planted and level. His torso stays oriented toward her while his head has just settled back from a fractional glance toward the exit. His shoulders release instead of collapsing. The hand without the mask opens low beside his hip, palm relaxed and visible, offering space rather than pleading; the mask remains held loosely in the other hand. His eyes are wet but steady, mouth restrained, expression vulnerable and resolved. No step, body reversal, smile, tears, embrace, pointing, raised open arms, heroic stance or theatrical pleading. Do not mirror, crop, zoom, rotate, change wardrobe, repair the suit, add scenery or alter his height. Output the isolated complete head-to-boots actor on the same perfectly uniform flat #00FF66 field with no floor, cast shadow, green rim light or reflected green. ${exclusions}`,
}, [await losslessChromaReference(peterReference)]);

await acquireFigure({
  id: 'peter-choice-returned-staying-v3',
  kind: 'figure',
  prompt: `${style} Use the supplied actor as the exact identity, wardrobe, scale and composition reference. Full-body uncovered young masked-hero actor in the same damaged red-and-deep-navy web suit, removed mask hanging from his right hand, facing screen-left toward an unseen woman at equal eye height. Keep his head level and his pupils aimed horizontally screen-left—never upward, downward or toward camera. Both feet are planted and level. His shoulders settle with quiet resolve. His empty left hand hangs low beside his thigh with relaxed separated fingers and a slightly visible open palm: he is returning a choice, not begging. His expression is controlled, vulnerable attention: dry eyes, gently raised inner brows, closed restrained mouth. Preserve the suit damage, body proportions, complete head-to-boots crop and generous padding. No tears, upward gaze, hand on hip, step, body reversal, smile, embrace, pointing, raised arms, heroic stance or theatrical pleading. Perfectly uniform flat #00FF66 field with no floor, cast shadow, scenery, green rim light or reflected green. ${exclusions}`,
}, [await losslessChromaReference(peterReference)]);

const mjEyeRefinedV1 = await acquireFigure({
  id: 'mj-guarded-eye-refined-v1',
  kind: 'figure',
  prompt: `${style} This is a precise reference-based character correction. The reference owns MJ's exact identity, face shape, warm brown skin, long textured dark hair, full-body proportions, olive-jacket wardrobe, grounded stance, screen-right facing, canvas scale and padding. Preserve all of those features and the restrained guarded-listening performance. Redraw only the eyes and immediately surrounding eyelids so both eyes have coherent human anatomy: natural dark-brown irises, small aligned dark pupils, clean white sclera, symmetrical eyelid construction in the same perspective, and a direct screen-right eyeline. Her expression remains wary and attentive, never frightened, vacant or angry. Do not change her head angle, nose, mouth, hair, hands, body, clothing, pose, crop, scale or art style. Uniform perfectly flat #00FF66 chroma field, no floor, shadow, scenery, green rim light or reflected green. ${exclusions}`,
}, [await losslessChromaReference(mjReference)]);

await acquireFigure({
  id: 'mj-guarded-eye-refined-v2',
  kind: 'figure',
  prompt: `${style} Produce a full-body visual-novel actor rendition, not a portrait or close-up. Reference one is the composition lock: preserve MJ's exact head-to-toe framing, body size, generous surrounding padding, grounded boots, guarded hand position, screen-right three-quarter stance, identity, hair, skin, olive jacket, rust top and black jeans. Reference two supplies only the corrected natural eye construction. Transfer its coherent dark-brown irises, aligned pupils, clean sclera and eyelid anatomy onto reference one's face while retaining reference one's head size, head angle and wary attentive expression. The entire figure from hair to both boot soles must remain visible at the same scale and position as reference one. Do not crop, zoom, reframe, beautify, change pose, change proportions, change wardrobe, or turn this into a bust. Uniform perfectly flat #00FF66 chroma field with no floor, shadow, scenery, green rim light or reflected green. ${exclusions}`,
}, [await losslessChromaReference(mjReference), mjEyeRefinedV1]);

const mjGuardedEyeRefinedV3 = await acquireFaithfulFigureEdit(
  'mj-guarded-eye-refined-v3',
  `Edit the supplied image in place as a surgical visual correction. Keep the exact same 3:4 canvas, green background, full-body head-to-boots composition, subject position, scale, padding, body proportions, screen-right head direction, gaze direction, guarded hand pose, facial identity, hairstyle, skin, wardrobe, linework, shading and colors. Do not mirror, rotate, crop, zoom, move or redesign anything. Change only MJ's two eyes and immediately adjacent eyelids: replace the red/glowing appearance with natural dark-brown irises, small aligned dark pupils, clean white sclera and anatomically coherent eyelids that follow the existing three-quarter perspective. She must still look screen-right toward the other actor with wary, attentive restraint. Every pixel outside the eye and eyelid region should remain visually unchanged. Output one complete full-body actor on the same perfectly uniform #00FF66 field. ${exclusions}`,
  [await losslessChromaReference(mjReference)],
);

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

await acquireFaithfulFigureEdit(
  'mj-conflicted-boundary-eye-refined-v1',
  `Edit reference one in place as a precise acting-rendition repair. Reference one owns every compositional pixel: retain its exact 3:4 canvas, complete head-to-boots figure, subject position, scale, padding, body proportions, screen-right head direction, softened but self-possessed boundary pose, released left hand, right hand near the jacket, wardrobe, linework, shading and colors. Reference two owns only MJ's canonical facial identity and anatomically coherent natural dark-brown eyes. Transfer that eye anatomy and identity consistency into reference one's face while preserving reference one's parted lips and conflicted, compassionate boundary expression. Both eyes must share the same screen-right eyeline toward Peter. Do not mirror, crop, zoom, rotate, change pose, close her mouth, move her hands, or redesign clothing. Output the same complete actor on a perfectly uniform #00FF66 chroma field. ${exclusions}`,
  [
    await losslessChromaReference(await readFile(join(outputDirectory, 'mj-conflicted-boundary-v1.png'))),
    mjGuardedEyeRefinedV3,
  ],
);

await acquireFaithfulFigureEdit(
  'mj-conflicted-boundary-eye-refined-v2',
  `Edit the supplied image in place. This image already owns MJ's canonical identity and the required conflicted-boundary performance. Preserve its exact full-body composition and body language: left arm hanging released at her side, left hand down and open, right hand held against the jacket near her waist, torso and feet unchanged, head and gaze facing screen-right, lips parted as she states a compassionate boundary. Do not move either arm or hand, do not clasp her hands, and do not return her to the guarded pose. Change only the malformed eyes and immediately adjacent eyelids into anatomically coherent natural dark-brown eyes with aligned dark pupils, clean white sclera and one consistent screen-right eyeline. Keep the exact canvas, subject position, scale, padding, identity, hair, skin, wardrobe, linework, shading and colors. Do not mirror, crop, zoom, rotate, change expression, or redesign anything else. Output the same complete actor on a perfectly uniform #00FF66 chroma field. ${exclusions}`,
  [await losslessChromaReference(await readFile(join(outputDirectory, 'mj-conflicted-boundary-v1.png')))],
);

await acquireFaithfulFigureEdit(
  'mj-reluctant-trust-eye-refined-v1',
  `Edit reference one in place as a precise acting-rendition repair. Reference one owns every compositional pixel: retain its exact 3:4 canvas, complete head-to-boots figure, subject position, scale, padding, body proportions, screen-right head direction, quiet open-handed reluctant-trust pose, wardrobe, linework, shading and colors. Reference two owns only MJ's canonical facial identity and anatomically coherent natural dark-brown eyes. Transfer that eye anatomy and identity consistency into reference one's face while preserving reference one's closed mouth, eased shoulders and cautious practical resolve. Both eyes must share the same screen-right eyeline toward Peter. Do not mirror, crop, zoom, rotate, change pose, alter either open hand, add a smile, or redesign clothing. Output the same complete actor on a perfectly uniform #00FF66 chroma field. ${exclusions}`,
  [
    await losslessChromaReference(await readFile(join(outputDirectory, 'mj-reluctant-trust-v1.png'))),
    mjGuardedEyeRefinedV3,
  ],
);

await acquireFaithfulFigureEdit(
  'mj-choice-returned-listening-v1',
  `Create one precise acting variation from the supplied canonical MJ image. Preserve her exact identity, face, warm brown skin, natural dark-brown eyes, long textured tied-back hair, age, full-body proportions, olive jacket, rust knit top, black jeans, boots, screen-right facing, canvas, subject scale, padding, linework, shading and palette. Change only the performance: Peter has just stopped deciding for her and said, "You choose." MJ listens before answering. Her shoulders release by a fraction, her chin stays level, her gaze remains directly screen-right toward Peter, her mouth closes in measured consideration, and her hands separate from the defensive hold without becoming fully open or welcoming—one hand rests lightly near the jacket hem while the other hangs relaxed and visible. The emotion is surprised agency and cautious assessment, not forgiveness, romance, fear or anger. Keep both feet level and the complete head-to-boots figure visible. Do not mirror, crop, zoom, rotate, change wardrobe, smile, cry, cross arms, point, touch her chin or create a heroic pose. Output the isolated actor on a perfectly uniform flat #00FF66 field with no floor, cast shadow, scenery, green rim light or reflected green. ${exclusions}`,
  [await losslessChromaReference(await readFile(join(outputDirectory, 'mj-guarded-eye-refined-v3.png')))],
);

const preparedBackground = await prepareStageCrop();

for (const rejectedId of ['spider-unmask-revelation-cg-v1', 'spider-unmask-revelation-cg-v2']) {
  const rejectedCg = await existingAsset(rejectedId, 'jpg');
  if (rejectedCg) results[rejectedId] = rejectedCg;
}
const maskedPeterReference = await normalizeFigureBuffer(await readFile(join(outputDirectory, 'peter-spider-masked.png')), referenceRecipe);
const cgId = 'spider-unmask-revelation-cg-v3';
const existingCg = await existingAsset(cgId, 'jpg');
if (existingCg) {
  results[cgId] = existingCg;
} else {
  const repairReference = await sharp(join(outputDirectory, 'spider-unmask-revelation-cg-v2.jpg'))
    .resize({ width: 1024, height: 576, fit: 'cover' })
    .jpeg({ quality: 88 })
    .toBuffer();
  const input = {
    prompt: `${style} Make a precise continuity repair to reference one, preserving its exact 16:9 camera, two-person staging, faces, eyelines, apartment, rain window, palette, lighting and mature visual-novel finish. Change only Peter's unmasking action and suit chest. Peter remains frame-right with the exact uncovered face and hair already shown. Replace the small red fabric pinched near his raised hand with the COMPLETE loose Spider-Man head mask from reference two: red cloth, black web lines, both white eye lenses, visibly empty and removed, hanging from his raised gloved hand at chest height. Restore the lower-right suit torso to intact red-and-deep-navy fabric with a clean black spider emblem; remove the false hole, exposed skin, wound and torn ring completely. MJ remains frame-left, guarded and startled, without changing identity or wardrobe. The readable focal order is their faces, the complete removed mask, then the emotional distance. Preserve low-detail space in the lower quarter for the fixed dialogue rail. No embrace, touch, smile, romance, interface, border, duplicate mask, chest wound, exposed skin, or missing fabric. ${exclusions}`,
    aspect_ratio: '16:9',
    image_input: [`data:image/jpeg;base64,${repairReference.toString('base64')}`, await compactReference(maskedPeterReference)],
    max_images: 1,
    sequential_image_generation: 'disabled',
    size: '2K',
  };
  const retained = await completedPrediction(`${cgId}.generate`);
  const generated = retained
    ? { prediction: retained, url: selectReplicateOutputUrl(retained.output) }
    : await run(cgId, 'bytedance/seedream-4.5', input, `${cgId}.generate`);
  const bytes = await download(generated.url);
  const targetName = `${cgId}.jpg`;
  await writeFile(join(outputDirectory, targetName), bytes);
  results[cgId] = {
    generatedUrl: generated.url,
    sourcePath: `${generatedAssetRoot}/${targetName}`,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    predictionIds: [generated.prediction.id],
  };
}

await writeFile(join(evidenceDirectory, 'acquisition.receipt.json'), `${JSON.stringify({
  schemaVersion: 1,
  productionId: 'spider-man-memory-between-us-v1',
  source: { domainId: 'N-IMP-mtwby1q31jbg', sceneId: 'SCN-SPI-16', domainSha256: domainDigest },
  models: {
    generation: 'bytedance/seedream-4.5',
    faithfulEdit: 'google/nano-banana-pro',
    matte: '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
  },
  requestDigests,
  assets: results,
  reviews: {
    'apartment-hallway-night-v1': { status: 'rejected', reason: 'The model embedded a character portrait, phone, Chinese dialogue and UI into the lower frame, so it is not an admissible environmental plate.' },
    'apartment-hallway-night-v2': { status: 'rejected', reason: 'The architectural composition is clean, but the model rendered rain and standing water inside the corridor, breaking physical set continuity.' },
    'apartment-hallway-night-v3': { status: 'rejected', reason: 'The set is physically cleaner, but rain-like streaks persist across the interior and the stepped pixel treatment is too coarse beside the cast.' },
    'apartment-hallway-night-v4': { status: 'candidate', reason: 'Fourth request removes visible weather entirely, preserves its lighting implication, and explicitly requires smooth high-resolution architectural rendering; contextual review remains due.' },
    'mj-guarded-eye-refined-v1': { status: 'rejected', reason: 'The eye anatomy improved, but the model reframed the full-body actor as a portrait and broke stage-scale continuity.' },
    'mj-guarded-eye-refined-v2': { status: 'rejected', reason: 'The full-body composition returned, but the edit reversed MJ to screen-left and broke the inward eyeline in the real two-shot.' },
    'mj-guarded-eye-refined-v3': { status: 'candidate', reason: 'A faithful in-place visual edit on the original full-body source is constrained to the eye region; contextual human review remains due.' },
    'mj-conflicted-boundary-eye-refined-v1': { status: 'rejected', reason: 'The face and eyes improved, but the edit collapsed the released-hand boundary pose back into a guarded clasp.' },
    'mj-conflicted-boundary-eye-refined-v2': { status: 'candidate', reason: 'Single-source in-place edit locks the released-hand boundary pose while repairing eye anatomy; contextual review remains due.' },
    'mj-reluctant-trust-eye-refined-v1': { status: 'candidate', reason: 'Reference-based edit preserves the open-handed after-state while using the accepted guarded rendition as MJ identity and eye-anatomy guidance; contextual review remains due.' },
    'mj-choice-returned-listening-v1': { status: 'candidate', reason: 'Single-source reference edit targets the exact listening beat after Peter returns agency to MJ; identity, inward facing, restrained hand release, and contextual scale require Dailies review.' },
    'peter-choice-returned-staying-v1': { status: 'rejected', reason: 'The faithful-edit provider blocked the first frozen request before producing an image; the failed provider result is retained and the repaired take uses a new ID.' },
    'peter-choice-returned-staying-v2': { status: 'rejected', reason: 'The first fast-model take preserved wardrobe but turned restraint into an upward tearful pose, lost the horizontal eyeline toward MJ, and placed the open hand on his hip.' },
    'peter-choice-returned-staying-v3': { status: 'candidate', reason: 'Second fast-model take narrows the demanded behavior to a level inward eyeline, planted feet, settled shoulders and one low open hand; contextual review remains due.' },
    'spider-unmask-revelation-cg-v1': { status: 'rejected', reason: 'The unmasking action is absent and the chest contains a false wound.' },
    'spider-unmask-revelation-cg-v2': { status: 'rejected', reason: 'The cast and camera improve, but the mask remains absent and the false chest wound persists.' },
    'spider-unmask-revelation-cg-v3': { status: 'candidate', reason: 'The complete removed mask, uncovered identity, intact chest, inward eyelines, and apartment continuity are readable in one close two-shot; human target-scale review remains due.' },
  },
  preparedAssets: { 'mj-apartment-stage-crop-v1': preparedBackground },
}, null, 2)}\n`);

console.log(JSON.stringify(results, null, 2));
