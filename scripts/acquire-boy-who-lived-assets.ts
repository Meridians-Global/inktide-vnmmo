// @jasonyu0100
import { resolve } from 'node:path';
import { acquire, assetLines, GREEN, MAGENTA, type AcquisitionManifest, type AcquisitionRequest } from './lib/acquisition-kit';
import { loadLocalEnvironment, requireSetting } from './config';

const projectRoot = resolve(import.meta.dirname, '..');
await loadLocalEnvironment(projectRoot);
const token = requireSetting('REPLICATE_API_TOKEN');

const style = 'High-fidelity authored 2D visual-novel illustration in a storybook-gothic British register, refined anime-influenced anatomy, crisp naturally tapered ink linework, clean faces and hands, layered wool and velvet cloth texture, palette of sodium-lamp amber, indigo night and suburban brick, cinematic directional light, restrained atmospheric depth, elegant detailed key art readable at phone scale.';
const exclusions = 'No text, letters, numbers, captions, logos, border, interface, placement guides, anonymous silhouettes, duplicate objects, extra limbs, malformed hands, chibi anatomy, glossy 3D, photorealism, vector-flat rendering, painterly blur, coarse pixels, real actor likeness.';
const plate = 'High-resolution hand-drawn anime environment background, crisp tapered ink contours, smooth shapes, restrained texture, no coarse pixels. Stable eye-level camera. One broad level pavement or floor spans the full foreground as a clear actor stage; the lower quarter stays dark, quiet and visually simple for a dialogue rail. Absolutely no people, humanoid shapes, character shadows, animals, signs, readable house numbers, labels, frames, panels, interface or diagram. A single clean environmental painting only.';
const isolated = (field: string) => `Uniform perfectly flat ${field} chroma field with generous padding around the complete subject, no floor, cast shadow, scenery, rim light or reflected chroma.`;

const dumbledore = 'a very tall, thin, very old wizard with long silver hair and a silver beard both tucked into his belt, half-moon spectacles on a long crooked nose, twinkling light-blue eyes, wearing long sweeping purple robes and a cloak, high-heeled buckled boots';
const mcgonagall = 'a severe-looking older witch with black hair drawn into a tight bun, square spectacles, an emerald-green cloak over a dark high-collared dress, thin lips, upright posture';
const hagrid = 'a giant of a man, twice as tall as an ordinary man and several times as wide, long shaggy tangled black hair and a wild beard hiding most of his face, small glinting dark eyes, a huge moleskin overcoat, enormous hands';
const vernon = 'a big beefy middle-aged Englishman with hardly any neck, a very large black moustache, thinning hair, wearing a grey suit, tie and a dull overcoat, holding a briefcase';

function figure(id: string, description: string, performance: string, references: string[] = []): AcquisitionRequest {
  return {
    id,
    kind: 'isolated',
    aspectRatio: '3:4',
    matte: MAGENTA,
    ...(references.length ? { references } : {}),
    prompt: `${style} ${references.length ? 'Preserve the exact identity, face, hair, age, proportions and wardrobe of the referenced character.' : ''} Full-body standing visual-novel rendition of ${description}. ${performance} Both feet level and visible, hands anatomically clear. ${isolated('#FF00FF')} ${exclusions}`,
  };
}

const manifest: AcquisitionManifest = {
  productionId: 'privet-drive-boy-who-lived-v1',
  generationModel: 'bytedance/seedream-4.5',
  matteModel: '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
  techniqueTransfer: [
    'manifest-driven acquisition: plates, isolated subjects and CGs declared as data, kit owns provider calls and evidence',
    'identity references fed back from earlier requests in the same run',
    'uniform chroma generation followed by dedicated matte provider and local refinement',
    'provider events, inputs, outputs and byte digests retained before story admission',
  ],
  requests: [
    {
      id: 'privet-drive-morning-v1',
      kind: 'background',
      aspectRatio: '16:9',
      prompt: `${plate} A dull grey Tuesday morning on an aggressively ordinary English suburban cul-de-sac: identical tidy brick semi-detached houses with neat hedges, a low garden wall along the foreground pavement, a parked family car in one driveway, overcast pale sky, everything clean, symmetrical and joyless. ${exclusions}`,
    },
    {
      id: 'privet-drive-night-lit-v1',
      kind: 'background',
      aspectRatio: '16:9',
      prompt: `${plate} The same tidy English suburban cul-de-sac late at night: identical brick semi-detached houses dark and asleep, neat hedges, a low garden wall along the foreground pavement, orange sodium streetlamps glowing at intervals down the street under a clear indigo sky with faint stars. Quiet, still, watchful. ${exclusions}`,
    },
    {
      id: 'privet-drive-night-dark-v1',
      kind: 'background',
      aspectRatio: '16:9',
      prompt: `${plate} The same tidy English suburban cul-de-sac at night with every streetlamp extinguished: dark lamp posts, houses reduced to indigo silhouettes, neat hedges and a low garden wall along the foreground pavement, only cold moonlight and pinprick stars lighting the scene. Deep, secret, hushed. ${exclusions}`,
    },
    {
      id: 'tabby-cat-map-v1',
      kind: 'isolated',
      aspectRatio: '1:1',
      matte: GREEN,
      prompt: `Isolated anime game object, subject only, centered and fully visible: one tabby cat with square markings around its eyes sitting perfectly upright and still, seen in three-quarter view, staring intently ahead with an unnervingly intelligent expression. High-resolution crisp tapered linework, readable silhouette, generous empty padding. ${isolated('#00FF66')} Absolutely no person, room, street, wall, floor, map, text, label or second animal. ${exclusions}`,
    },
    {
      id: 'put-outer-v1',
      kind: 'isolated',
      aspectRatio: '1:1',
      matte: GREEN,
      prompt: `Isolated anime game inventory object, object only, centered and fully visible: one small antique silver device shaped like a cigarette lighter, ornate engraved casing, lid flipped open, a tiny ball of captured orange lamp-light hovering just above it. Three-quarter view, high-resolution crisp tapered linework, coherent practical construction, readable silhouette, generous empty padding. ${isolated('#00FF66')} Absolutely no person, hand, room, table, floor, text, label or second object. ${exclusions}`,
    },
    {
      id: 'sealed-letter-v1',
      kind: 'isolated',
      aspectRatio: '1:1',
      matte: GREEN,
      prompt: `Isolated anime game inventory object, object only, centered and fully visible: one thick envelope of heavy yellowish parchment, sealed with a blob of purple wax, unaddressed, slightly curled at the edges, resting at a shallow angle. Three-quarter view, high-resolution crisp tapered linework, readable silhouette, generous empty padding. ${isolated('#00FF66')} Absolutely no person, hand, room, table, floor, writing, text, label or second object. ${exclusions}`,
    },
    figure('vernon-briefcase-v1', vernon, 'Facing screen-right in three-quarter profile, chin up, mouth set in irritated self-importance, one hand gripping the briefcase, the other loosely closed at his side. Ordinary, impatient, oblivious.'),
    figure('dumbledore-arrival-v1', dumbledore, 'Facing screen-left in three-quarter profile, calm and faintly amused, one hand resting inside his robe as if about to draw something out, the other relaxed. Gentle authority, no wand visible.'),
    figure('dumbledore-grave-v1', dumbledore, 'Facing screen-left at the same standing height and grounded feet. The amusement is gone: eyes lowered behind the half-moon spectacles, mouth closed and sober, both hands folded quietly in front of him. Grief held with dignity, no smile, no gesture.', ['dumbledore-arrival-v1']),
    figure('mcgonagall-stern-v1', mcgonagall, 'Facing screen-right in three-quarter profile, arms folded, ruffled and stiff as though she has sat in the cold for hours, lips thin, eyes sharp and accusing behind square spectacles. Controlled indignation.'),
    figure('mcgonagall-grief-v1', mcgonagall, 'Facing screen-right at the same standing height and grounded feet. Her composure cracks: arms unfolded, one hand pressed to her mouth, eyes wet behind the square spectacles, shoulders drawn in. Quiet grief, no theatrical pose.', ['mcgonagall-stern-v1']),
    figure('hagrid-bundle-v1', hagrid, 'Facing screen-left in three-quarter profile, cradling a small bundle of blankets protectively in both enormous arms, head bowed toward it, tender and careful. The bundle is closed; no baby face visible.'),
    figure('hagrid-weeping-v1', hagrid, 'Same crisp 2D ink-and-cel rendering as the reference, identical dark trousers and heavy brown leather boots, never barefoot. Facing screen-left at the same standing height and grounded feet, arms now empty, one huge hand covering his eyes while the other clutches a large spotted handkerchief, shoulders shaking, weeping openly. Enormous and heartbroken.', ['hagrid-bundle-v1']),
    {
      id: 'doorstep-cg-v1',
      kind: 'cg',
      aspectRatio: '16:9',
      references: ['dumbledore-arrival-v1', 'mcgonagall-stern-v1', 'hagrid-bundle-v1'],
      prompt: `Modern premium visual-novel event CG, full 16:9 frame, smooth high-resolution anime illustration with crisp tapered linework, nuanced facial acting, cinematic moonlight-and-shadow lighting and no coarse pixels. Preserve the three referenced identities: ${dumbledore}; ${mcgonagall}; ${hagrid}. They stand close together on the dark doorstep of an ordinary English brick suburban house at night, looking down at a small bundle of blankets laid on the step with a sealed parchment letter tucked into it. Inside the blankets a baby boy with a tuft of jet-black hair sleeps, and on his forehead a fine curiously shaped cut like a bolt of lightning is just visible. Medium ensemble composition, faces and the bundle readable at phone scale, quiet negative space in the lower quarter for a dialogue rail. This is one pivotal authored image, not a sprite sheet or interface. ${exclusions}`,
    },
  ],
};

const assets = await acquire(projectRoot, token, manifest);
console.log(assetLines(assets, {
  'privet-drive-morning-v1': 'background',
  'privet-drive-night-lit-v1': 'background',
  'privet-drive-night-dark-v1': 'background',
  'tabby-cat-map-v1': 'artifact',
  'put-outer-v1': 'artifact',
  'sealed-letter-v1': 'artifact',
  'doorstep-cg-v1': 'cg',
}));
