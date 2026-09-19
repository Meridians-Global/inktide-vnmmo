// @jasonyu0100
// Composed CG candidates for the three productions. Each request carries a CgComposition brief (camera, thirds,
// depth planes, vectors, key light, reserved rail space) compiled by the kit; identity comes from already-pinned
// sprites. Each production writes its own cg-composition.receipt.json so the original acquisition receipt is untouched.
import { resolve } from 'node:path';
import type { CgComposition } from '../src/core/cg-composition';
import { acquire, assetLines, type AcquisitionManifest, type AcquisitionRequest } from './lib/acquisition-kit';
import { loadLocalEnvironment, requireSetting } from './config';

const projectRoot = resolve(import.meta.dirname, '..');
await loadLocalEnvironment(projectRoot);
const token = requireSetting('REPLICATE_API_TOKEN');
const only = new Set(process.argv.slice(2));

const cgStyle = 'Modern premium visual-novel event CG, full 16:9 frame, smooth high-resolution anime illustration with crisp tapered linework, nuanced facial acting, painterly cinematic lighting and no coarse pixels. This is one pivotal authored image, not a sprite sheet or interface.';
const exclusions = 'No text, letters, numbers, captions, logos, border, interface, placement guides, anonymous silhouettes, duplicate objects, extra limbs, malformed hands, chibi anatomy, glossy 3D, photorealism, vector-flat rendering, coarse pixels, real actor likeness.';

function cg(id: string, references: string[], prompt: string, composition: CgComposition): AcquisitionRequest {
  return { id, kind: 'cg', aspectRatio: '16:9', references, prompt: `${cgStyle} ${prompt} ${exclusions}`, composition };
}

const matteModel = '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc';
const technique = [
  'typed CgComposition brief compiled into every CG prompt: shot scale, camera, thirds, depth planes, gaze/gesture vectors, key light, reserved rail space',
  'identity references drawn from already-pinned sprites by repository path',
  'multiple candidates per CG for human selection; rejected takes retained as evidence',
];

// --- Privet Drive: the doorstep ---------------------------------------------------------------------------------
const privet = 'assets/generated/privet-drive-boy-who-lived-v1';
const dumbledore = 'a very tall, thin, very old wizard with long silver hair and beard tucked into his belt, half-moon spectacles on a long crooked nose, long sweeping purple robes and cloak';
const mcgonagall = 'a severe older witch with black hair in a tight bun, square spectacles, an emerald-green cloak over a dark high-collared dress';
const hagrid = 'a giant of a man, twice as tall as an ordinary man, long shaggy tangled black hair and a wild beard, a huge moleskin overcoat, enormous hands';
const doorstepSubject = `Preserve the three referenced identities: ${dumbledore}; ${mcgonagall}; ${hagrid}. Night on the dark doorstep of an ordinary English brick suburban house. A small bundle of blankets lies on the step with a sealed parchment letter tucked into it; inside sleeps a baby boy with a tuft of jet-black hair and a fine lightning-shaped cut on his forehead. Storybook-gothic British register, palette of sodium-lamp amber, indigo night and suburban brick.`;
const privetManifest: AcquisitionManifest = {
  productionId: 'privet-drive-boy-who-lived-v1',
  generationModel: 'bytedance/seedream-4.5',
  matteModel,
  techniqueTransfer: technique,
  receiptName: 'cg-composition.receipt.json',
  requests: [
    cg('doorstep-cg-v2a', [`${privet}/dumbledore-arrival-v1.png`, `${privet}/mcgonagall-stern-v1.png`, `${privet}/hagrid-bundle-v1.png`], doorstepSubject, {
      scale: 'full',
      camera: { height: 'low', angle: 'three-quarter' },
      placements: [
        { subject: 'the bundle with the letter, on the step', third: 'left', plane: 'fore', facing: 'toward-camera', vector: 'the letter angled toward the three adults' },
        { subject: 'Hagrid, crouched huge and tender', third: 'centre', plane: 'mid', facing: 'into-depth', vector: 'head bowed, both hands reaching down to the bundle' },
        { subject: 'Dumbledore and McGonagall standing side by side', third: 'right', plane: 'far', facing: 'screen-left', vector: 'both looking down at the bundle' },
      ],
      planes: { fore: 'the worn brick step and the bundle, cut by the frame edge', mid: 'Hagrid kneeling on the path, the doorframe behind him', far: 'the dark cul-de-sac, extinguished lamp posts, a thin moon over the roofs' },
      light: { key: 'cold moonlight', from: 'high behind the adults, rimming their silhouettes and falling on the bundle', mood: 'hushed, tender and final' },
      leadingLine: 'the garden path running from the street to the step',
      negativeSpace: 'lower-quarter',
    }),
    cg('doorstep-cg-v2b', [`${privet}/dumbledore-arrival-v1.png`, `${privet}/mcgonagall-stern-v1.png`, `${privet}/hagrid-bundle-v1.png`], doorstepSubject, {
      scale: 'wide',
      camera: { height: 'high', angle: 'three-quarter' },
      placements: [
        { subject: 'Dumbledore, seen from behind and above, lowering the bundle onto the step', third: 'right', plane: 'fore', facing: 'away-from-camera', vector: 'his long arms reaching down to the step' },
        { subject: 'McGonagall, hand at her mouth', third: 'centre', plane: 'mid', facing: 'screen-right', vector: 'looking at the bundle' },
        { subject: 'Hagrid, huge and weeping, on the pavement', third: 'left', plane: 'far', facing: 'screen-right', vector: 'one hand covering his eyes' },
      ],
      planes: { fore: 'Dumbledore\'s purple shoulders and the doorstep, cut by the frame edge', mid: 'McGonagall on the path beside a low garden wall', far: 'Hagrid, the motorbike, and the dark street of identical houses' },
      light: { key: 'a single orange sodium lamp', from: 'far down the street behind Hagrid, everything nearer in moon-blue shadow', mood: 'lonely and ceremonial' },
      leadingLine: 'the low garden wall running from Hagrid to the step',
      negativeSpace: 'lower-quarter',
    }),
    cg('doorstep-cg-v2c', [`${privet}/dumbledore-arrival-v1.png`, `${privet}/mcgonagall-stern-v1.png`, `${privet}/hagrid-bundle-v1.png`], doorstepSubject, {
      scale: 'medium',
      camera: { height: 'low', angle: 'over-shoulder' },
      placements: [
        { subject: 'Hagrid\'s enormous shoulder and beard, out of focus', third: 'left', plane: 'fore', facing: 'away-from-camera' },
        { subject: 'Dumbledore, bending to lay the bundle down', third: 'centre', plane: 'mid', facing: 'into-depth', vector: 'both hands and eyes on the bundle' },
        { subject: 'McGonagall in the lit doorway of the house', third: 'right', plane: 'far', facing: 'screen-left', vector: 'arms folded, gaze on Dumbledore' },
      ],
      planes: { fore: 'Hagrid\'s dark coat, cut by the frame edge', mid: 'Dumbledore and the bundle on the step', far: 'the brick porch and hall window with a faint light behind curtains' },
      light: { key: 'warm light from the hall window', from: 'behind McGonagall, spilling over the step', mood: 'intimate and grave' },
      leadingLine: 'Dumbledore\'s long arms and the edge of the step toward the bundle',
      negativeSpace: 'lower-quarter',
    }),
  ],
};

// --- Moon-Scar: the reliquary opens ------------------------------------------------------------------------------
const moon = 'assets/generated/moon-scar-ledger-v2';
const moonSubject = 'Preserve the two referenced identities: Fang Yuan is the long-haired young man in layered charcoal robes, controlled and analytical; Gu Yue Chun is the young woman with the compact braided bun and muted olive-grey robes, natural dark-brown eyes, contained alarm. A concealed worn-stone cellar. A palm-sized dark-stone Moon-Scar reliquary on an examination table has just opened one thin violet crescent seam. Xianxia register, cool charcoal-violet and weathered blue-grey palette.';
const moonRefs = [`${moon}/fang-field-mantle-guarded-v3.png`, `${moon}/gu-yue-chun-moon-scar-reaction-v1.png`, `${moon}/moon-scar-gu-v3.png`];
const moonManifest: AcquisitionManifest = {
  productionId: 'moon-scar-ledger-v2',
  generationModel: 'bytedance/seedream-4.5',
  matteModel,
  techniqueTransfer: technique,
  receiptName: 'cg-composition.receipt.json',
  requests: [
    cg('moon-scar-revelation-cg-v2a', moonRefs, moonSubject, {
      scale: 'medium',
      camera: { height: 'low', angle: 'over-shoulder' },
      placements: [
        { subject: 'Fang Yuan\'s shoulder and long dark hair, seen from behind', third: 'left', plane: 'fore', facing: 'away-from-camera', vector: 'his hand resting on the table edge toward the reliquary' },
        { subject: 'the open reliquary with its violet crescent seam', third: 'centre', plane: 'mid', facing: 'toward-camera' },
        { subject: 'Gu Yue Chun across the table, lit from below by the seam', third: 'right', plane: 'far', facing: 'screen-left', vector: 'her gaze dropped to the reliquary, hand withdrawn to her sleeve' },
      ],
      planes: { fore: 'Fang Yuan\'s dark robed shoulder, cut by the frame edge', mid: 'the stone table and the glowing reliquary', far: 'rough cellar wall, a shelf of sealed jars, a dark stair' },
      light: { key: 'the violet crescent seam', from: 'the reliquary itself, casting upward onto her face and the underside of his jaw', mood: 'secret, taut, dangerous' },
      leadingLine: 'the table edge running from his hand to the reliquary',
      negativeSpace: 'lower-quarter',
    }),
    cg('moon-scar-revelation-cg-v2b', moonRefs, moonSubject, {
      scale: 'full',
      camera: { height: 'high', angle: 'three-quarter' },
      placements: [
        { subject: 'the reliquary on the table, violet seam open', third: 'right', plane: 'fore', facing: 'toward-camera' },
        { subject: 'Fang Yuan leaning over the table', third: 'centre', plane: 'mid', facing: 'into-depth', vector: 'eyes on the seam, one hand hovering above it, not touching' },
        { subject: 'Gu Yue Chun a step back against the wall', third: 'left', plane: 'far', facing: 'screen-right', vector: 'watching Fang Yuan, not the reliquary' },
      ],
      planes: { fore: 'the table corner and the reliquary, cut by the frame edge', mid: 'Fang Yuan bent over the table, his shadow thrown up the wall', far: 'cellar stair with a sliver of lantern light from above' },
      light: { key: 'the violet seam', from: 'low and near, with a faint warm lantern glow from the stair behind her', mood: 'watchful and cold' },
      leadingLine: 'Fang Yuan\'s long shadow across the wall toward Gu Yue Chun',
      negativeSpace: 'lower-quarter',
    }),
    cg('moon-scar-revelation-cg-v2c', moonRefs, moonSubject, {
      scale: 'medium-close',
      camera: { height: 'eye', angle: 'profile' },
      placements: [
        { subject: 'Gu Yue Chun\'s face and shoulder in profile, nearest the camera', third: 'right', plane: 'fore', facing: 'screen-left', vector: 'gaze fixed on Fang Yuan across the light' },
        { subject: 'the reliquary between them on the table, seam glowing', third: 'centre', plane: 'mid', facing: 'toward-camera' },
        { subject: 'Fang Yuan behind the table, face lit violet from below', third: 'left', plane: 'far', facing: 'screen-right', vector: 'eyes on the reliquary, unmoved' },
      ],
      planes: { fore: 'her profile and braided bun, cut by the frame edge', mid: 'the table and the open reliquary', far: 'Fang Yuan and the dark cellar arch behind him' },
      light: { key: 'the violet crescent seam', from: 'between them, the only light, her face in half shadow', mood: 'intimate and unsafe' },
      leadingLine: 'her eyeline across the seam to his face',
      negativeSpace: 'lower-quarter',
    }),
  ],
};

// --- Spider-Man: the unmasking -------------------------------------------------------------------------------------
const spider = 'assets/generated/spider-man-memory-between-us-v1';
const spiderSubject = 'Preserve the referenced identities exactly; there are only two people in the room. MJ is a slim young Black American woman in her early twenties with warm brown skin, dark brown eyes and long textured dark hair tied loosely back, wearing a dark olive jacket over a rust knit top and black jeans, guarded and startled. Peter Parker is in the red-and-navy Spider-Man suit, mask just removed and held in his gloved hand, complete with black web lines and white eye lenses, his uncovered face and brown hair shown, suit torso intact with no wound or tear. A small New York apartment at night, rain only on the outside of the window, city glow beyond it; no reflection or second figure in the glass. Mature cinematic register, slightly desaturated urban palette.';
const spiderRefs = [`${spider}/mj-guarded-eye-refined-v3.png`, `${spider}/peter-spider-revealed.png`, `${spider}/peter-spider-masked.png`];
const spiderManifest: AcquisitionManifest = {
  productionId: 'spider-man-memory-between-us-v1',
  generationModel: 'bytedance/seedream-4.5',
  matteModel,
  techniqueTransfer: technique,
  receiptName: 'cg-composition.receipt.json',
  requests: [
    cg('spider-unmask-revelation-cg-v4a', spiderRefs, spiderSubject, {
      scale: 'medium',
      camera: { height: 'eye', angle: 'over-shoulder' },
      placements: [
        { subject: 'MJ\'s shoulder and red hair, back to camera', third: 'left', plane: 'fore', facing: 'away-from-camera' },
        { subject: 'the removed mask held out in Peter\'s gloved hand', third: 'centre', plane: 'mid', facing: 'toward-camera', vector: 'the mask offered toward MJ along the depth axis' },
        { subject: 'Peter, unmasked, by the rain-streaked window', third: 'right', plane: 'far', facing: 'screen-left', vector: 'eyes on MJ, waiting' },
      ],
      planes: { fore: 'MJ\'s dark shoulder and hair, soft, cut by the frame edge', mid: 'the mask in his hand, sharp', far: 'Peter against the window, the city lights blurred behind him' },
      light: { key: 'cool city light through the rain window', from: 'behind Peter, rimming his face and hair, MJ in shadow', mood: 'exposed and quiet' },
      leadingLine: 'his extended arm carrying the mask from the window to MJ',
      negativeSpace: 'lower-quarter',
    }),
    cg('spider-unmask-revelation-cg-v4b', spiderRefs, spiderSubject, {
      scale: 'full',
      camera: { height: 'low', angle: 'three-quarter' },
      placements: [
        { subject: 'the mask lying on the floorboards where it was dropped', third: 'right', plane: 'fore', facing: 'toward-camera', vector: 'its eye lenses turned toward MJ' },
        { subject: 'Peter, unmasked, standing very still', third: 'centre', plane: 'mid', facing: 'screen-left', vector: 'looking at MJ, hands open at his sides' },
        { subject: 'MJ backed to the doorway', third: 'left', plane: 'far', facing: 'screen-right', vector: 'one hand on the doorframe, staring at his face' },
      ],
      planes: { fore: 'floorboards and the dropped mask, cut by the frame edge', mid: 'Peter in the room, a low lamp beside him', far: 'MJ in the hallway doorway, dim hall light behind her' },
      light: { key: 'a single warm table lamp', from: 'beside Peter, the window behind him blue with rain', mood: 'a held breath' },
      leadingLine: 'the floorboards converging from the mask to the doorway',
      negativeSpace: 'lower-quarter',
    }),
    cg('spider-unmask-revelation-cg-v4c', spiderRefs, spiderSubject, {
      scale: 'medium-close',
      camera: { height: 'eye', angle: 'three-quarter' },
      placements: [
        { subject: 'Peter\'s gloved hand and the removed mask, nearest the camera', third: 'right', plane: 'fore', facing: 'toward-camera', vector: 'the mask lowered, lenses toward the floor' },
        { subject: 'Peter\'s uncovered face, turned to MJ', third: 'centre', plane: 'mid', facing: 'screen-left', vector: 'eyes on her, unguarded' },
        { subject: 'MJ, small in the depth of the room', third: 'left', plane: 'far', facing: 'screen-right', vector: 'arms crossed, gaze locked on him' },
      ],
      planes: { fore: 'the mask in his hand, slightly soft, cut by the frame edge', mid: 'his face and shoulders', far: 'MJ across the room by the kitchen counter, the window with rain' },
      light: { key: 'cold window light', from: 'screen-left behind MJ, catching one side of Peter\'s face', mood: 'raw and intimate' },
      leadingLine: 'the line of his arm from the mask up to his face and on to MJ',
      negativeSpace: 'lower-quarter',
    }),
  ],
};

for (const manifest of [privetManifest, moonManifest, spiderManifest]) {
  if (only.size && !only.has(manifest.productionId)) continue;
  const assets = await acquire(projectRoot, token, manifest);
  console.log(`\n${manifest.productionId}`);
  console.log(assetLines(assets, Object.fromEntries(manifest.requests.map((request) => [request.id, 'cg' as const]))));
}
