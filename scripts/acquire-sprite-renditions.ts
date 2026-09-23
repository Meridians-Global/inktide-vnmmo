// @jasonyu0100
// Supplementary acting pass: extra sprite renditions for actors the production audit flags as
// `thin-rendition-set` or `held-pose`. Every request is reference-conditioned on the actor's
// already-pinned baseline sprite so identity, wardrobe, facing and scale carry over; only the
// performance changes. Run with `npx tsx scripts/acquire-sprite-renditions.ts [productionId ...]`.
import { resolve } from 'node:path';
import { acquire, assetLines, GREEN, MAGENTA, type AcquisitionManifest, type AcquisitionRequest } from './lib/acquisition-kit';
import { loadLocalEnvironment, requireSetting } from './config';
import type { Rgb } from '../src/core/chroma-matte';

const projectRoot = resolve(import.meta.dirname, '..');
await loadLocalEnvironment(projectRoot);
const token = requireSetting('REPLICATE_API_TOKEN');
const only = new Set(process.argv.slice(2));

const exclusions = 'No text, letters, numbers, captions, logos, border, interface, placement guides, anonymous silhouettes, duplicate objects, extra limbs, malformed hands, chibi anatomy, glossy 3D, photorealism, vector-flat rendering, painterly blur, coarse pixels, real actor likeness.';
const fieldName = (matte: Rgb) => (matte === GREEN ? '#00FF66' : '#FF00FF');

function rendition(style: string, id: string, reference: string, matte: Rgb, performance: string): AcquisitionRequest {
  return {
    id,
    kind: 'isolated',
    aspectRatio: '3:4',
    matte,
    references: [reference],
    prompt: `${style} Create one precise acting variation from the supplied canonical character image. Preserve the exact identity, face, hair, age, full-body proportions, wardrobe, facing direction, canvas, subject scale, padding, linework, shading and palette of the reference. Change only the performance: ${performance} Both feet stay level and visible, the complete head-to-feet figure remains in frame, hands anatomically clear. Do not mirror, crop, zoom, rotate, change wardrobe, add props or scenery, or redesign the face. Output the isolated actor on a perfectly uniform flat ${fieldName(matte)} chroma field with no floor, cast shadow, rim light or reflected chroma. ${exclusions}`,
  };
}

const techniqueTransfer = [
  'supplementary acting pass: extra renditions requested only where the production audit reports thin-rendition-set or held-pose',
  'each rendition conditioned on the pinned baseline sprite by repository path so identity and wardrobe are inherited, not re-described',
  'performance text names one phase (appraisal, decision, after-state) so renditions map onto performanceBeat phases rather than arbitrary pose churn',
  'provider events, inputs, outputs and byte digests retained before story admission',
];

const privetStyle = 'High-fidelity authored 2D visual-novel illustration in a storybook-gothic British register, refined anime-influenced anatomy, crisp naturally tapered ink linework, clean faces and hands, layered wool and velvet cloth texture, palette of sodium-lamp amber, indigo night and suburban brick, cinematic directional light, restrained atmospheric depth, elegant detailed key art readable at phone scale.';
const privetSprites = 'assets/generated/privet-drive-boy-who-lived-v1';

const privetManifest: AcquisitionManifest = {
  productionId: 'privet-drive-boy-who-lived-v1',
  generationModel: 'bytedance/seedream-4.5',
  matteModel: '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
  techniqueTransfer,
  receiptName: 'sprite-renditions.receipt.json',
  requests: [
    rendition(privetStyle, 'vernon-noticing-v1', `${privetSprites}/vernon-briefcase-v1.png`, MAGENTA,
      'appraisal. He has stopped mid-stride and half-turned his head back over his shoulder, brow furrowed, small eyes narrowed at something behind him, mouth slightly open in puzzlement, the briefcase lowered to his side. Suspicion he has not yet admitted to.'),
    rendition(privetStyle, 'vernon-alarmed-v1', `${privetSprites}/vernon-briefcase-v1.png`, MAGENTA,
      'decision. He has frozen in place: colour risen high in his face, eyes wide and staring straight ahead, mouth open on a word he refuses to finish, the free hand lifted halfway as though to stop something, the briefcase clutched tightly. A name he knows has just been spoken.'),
    rendition(privetStyle, 'vernon-dismissing-v1', `${privetSprites}/vernon-briefcase-v1.png`, MAGENTA,
      'after-state. He has decided not to see: back rigidly straight, chin lifted, eyes fixed forward and away, mouth pressed thin beneath the moustache, both hands settled and stiff, the briefcase held like a shield. Deliberate, effortful ordinariness.'),
    rendition(privetStyle, 'dumbledore-listening-v1', `${privetSprites}/dumbledore-arrival-v1.png`, MAGENTA,
      'appraisal. He listens: head tilted a fraction, eyes attentive over the half-moon spectacles, one hand slowly stroking the long silver beard, the other resting quietly. Weighing what he is being told, neither agreeing nor dismissing, the faint amusement gone from the mouth.'),
    rendition(privetStyle, 'dumbledore-resolved-v1', `${privetSprites}/dumbledore-arrival-v1.png`, MAGENTA,
      'decision. He has made up his mind: standing fully upright, chin level, gaze steady and kind but firm, one hand extended a little from the robe with the palm turned gently down as though settling an argument. Quiet finality without severity.'),
    rendition(privetStyle, 'mcgonagall-questioning-v2', `${privetSprites}/mcgonagall-stern-v1.png`, MAGENTA,
      'appraisal. She stands at exactly the same full height as the reference, upright, not stooped. Her arms have come unfolded: exactly two arms, one hand half-raised at chest height with the fingers open as she presses a question, the other hand resting at her side, eyes searching and urgent behind the square spectacles, lips parted. Indignation giving way to the need to know.'),
    rendition(privetStyle, 'mcgonagall-grief-v2', `${privetSprites}/mcgonagall-stern-v1.png`, MAGENTA,
      'after-state. Composure cracking: exactly two arms, one hand pressed to her mouth, the other hand gripping the edge of the cloak at her chest, shoulders drawn in, eyes wet behind the square spectacles, brow lifted in grief. Same full height and stance as the reference, no third hand, no outstretched arms.'),
    rendition(privetStyle, 'mcgonagall-steadied-v1', `${privetSprites}/mcgonagall-stern-v1.png`, MAGENTA,
      'after-state. Composure regained but softened: both hands clasped in front of her, spine straight, chin up, eyes dry and clear but the mouth no longer thin, the shoulders lowered. Acceptance held with dignity, no anger, no tears.'),
    rendition(privetStyle, 'hagrid-hushed-v1', `${privetSprites}/hagrid-bundle-v1.png`, MAGENTA,
      'appraisal. He still cradles the closed bundle of blankets in one enormous arm, but has looked up: head lifted, small dark eyes wide and anxious above the beard, the free hand raised with one huge finger to his lips in an urgent hush. Bashful, protective, trying to be quiet and failing.'),
    rendition(privetStyle, 'hagrid-farewell-v1', `${privetSprites}/hagrid-bundle-v1.png`, MAGENTA,
      'after-state. Same crisp rendering, identical dark trousers and heavy brown leather boots, never barefoot. His arms are empty now: head bowed low, one huge hand raised in a small awkward wave of farewell, the other holding a large spotted handkerchief at his side, shoulders slumped. Enormous, gentle and bereft, tears on the cheeks but no hand covering the face.'),
  ],
};

const moonStyle = 'High-fidelity authored 2D xianxia visual-novel illustration, refined anime-influenced anatomy, cohesive late-medieval Southern Border material culture, crisp naturally tapered linework, clean faces and hands, layered cloth and worn stone texture, cool charcoal-violet and weathered blue-grey palette with selective warm accents, cinematic directional light, restrained atmospheric depth, smooth full-resolution shapes with only faint retro-game texture in a few shadow edges, elegant detailed key art readable at phone scale.';

const moonManifest: AcquisitionManifest = {
  productionId: 'moon-scar-ledger-v2',
  generationModel: 'bytedance/seedream-4.5',
  matteModel: '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
  techniqueTransfer,
  receiptName: 'sprite-renditions.receipt.json',
  requests: [
    rendition(moonStyle, 'fang-seal-order-v1', 'assets/generated/moon-scar-ledger-v2/fang-field-mantle-guarded-v3.png', GREEN,
      'after-state, the instant he gives the order to seal the reliquary. He keeps facing screen-right. One hand has come fully out of its sleeve and is held at chest height with the palm flat and turned down, fingers together, a small, final, settling gesture of closing something; the other hand rests quietly beside its sleeve. Head level, gaze steady and analytical, mouth just closing on a spoken order. Ruthless calm, no pointing, clenched fist, folded arms, smile or theatrical gesture.'),
  ],
};

for (const manifest of [privetManifest, moonManifest]) {
  if (only.size && !only.has(manifest.productionId)) continue;
  const assets = await acquire(projectRoot, token, manifest);
  console.log(`\n${manifest.productionId}`);
  console.log(assetLines(assets, Object.fromEntries(manifest.requests.map((request) => [request.id, 'figure' as const]))));
}
