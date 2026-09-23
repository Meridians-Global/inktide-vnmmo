// @jasonyu0100
import type { Experience } from '../core/contracts';
import { withVoiceLines } from '../core/voice-cast';
import { boyWhoLivedVoiceLines } from './generated/boy-who-lived.voices';

const generated = 'assets/generated/privet-drive-boy-who-lived-v1';
const normalize = { kind: 'figure-normalize' as const, recipeVersion: 1 as const, canvas: { width: 896, height: 1024 }, subjectBox: { width: 850, height: 960 }, bottomPadding: 24 };
const magenta = { ...normalize, matteCleanup: { spill: 'magenta' as const, alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 14 } };
const chapter = 'Chapter 1 · The Boy Who Lived';
const morning = 'Privet Drive · Number Four · A dull grey Tuesday';
const night = 'Privet Drive · Number Four · Nightfall';

const authored: Experience = {
  schemaVersion: 2,
  id: 'privet-drive-boy-who-lived-v1',
  title: 'The Boy Who Lived',
  subtitle: 'A Privet Drive prologue',
  posture: 'catch-up',
  source: {
    domainId: 'harry-potter-philosophers-stone',
    branchId: 'condensed-retelling-supplied-2026-09',
    asOfEntryId: 'chapter-01--the-boy-who-lived',
    sourceSha256: '70b8f50f7d46a8d9582d0ccbfc67b745d57083816b40ec50be6cc40e6508cf99',
    note: 'Bounded adaptation of the supplied condensed retelling (chapter 1 only: Vernon’s strange day through the doorstep). Presentation-only; traversal choices write no canonical state.',
  },
  startNodeId: 'privet-morning',
  readerInsights: [
    { id: 'cat-reads-map', standing: 'grounded', meaning: 'Vernon saw the cat reading a map before he saw it reading a sign; the impossible thing arrived first.' },
    { id: 'cat-reads-sign', standing: 'grounded', meaning: 'Vernon let himself see only a cat looking at a street sign; the map was edited out.' },
    { id: 'potters-named', standing: 'grounded', meaning: 'The whisperers named the Potters and their son Harry; Vernon recognised the name and refused it.' },
    { id: 'cloaks-noticed', standing: 'grounded', meaning: 'Vernon fixed on the cloaks rather than the words, and so kept the news at arm’s length.' },
    { id: 'collection-stunt-assumed', standing: 'mistaken', meaning: 'Vernon filed the cloaked huddle as a collection stunt; the name Potter went past him unheard.' },
    { id: 'power-broke-assumed', standing: 'mistaken', meaning: 'You took the dark wizard’s failure to be his own power breaking, with nothing owed to the child.' },
    { id: 'charm-compels-assumed', standing: 'mistaken', meaning: 'You took Dumbledore to be binding the Dursleys with magic so that they could not refuse the boy.' },
  ],
  assets: [
    { id: 'street-morning', kind: 'background', sourcePath: `${generated}/privet-drive-morning-v1.jpg`, sha256: '756026571829c56db8f7bcaaebc4432ea0b9d5ce26ef1749ff19d2a86d8b6a00' },
    { id: 'street-night-lit', kind: 'background', sourcePath: `${generated}/privet-drive-night-lit-v1.jpg`, sha256: 'd004a203117fcd8d2e9e57ad15edac5a877794123a16f9637f5443479ed1cf46' },
    { id: 'street-night-dark', kind: 'background', sourcePath: `${generated}/privet-drive-night-dark-v1.jpg`, sha256: 'cc5cb0b7ea851df61559727b6f2ac91269ec031a21472fafb5fcc9ba22e5ba5d' },
    { id: 'tabby-cat', kind: 'artifact', sourcePath: `${generated}/tabby-cat-map-v1.png`, sha256: '7814ed85f357831ca982260118ad4313ce85517e12553a588c970540f0b761a5' },
    { id: 'put-outer', kind: 'artifact', sourcePath: `${generated}/put-outer-v1.png`, sha256: 'e0ca8c5f592294a786abd206705839ae0eb93d39d31cf48912c5b9d8bc671e05' },
    { id: 'sealed-letter', kind: 'artifact', sourcePath: `${generated}/sealed-letter-v1.png`, sha256: '73c8095519338f18304d785f3e3b39cdc7c6bacea20bb3d42e917c1f15308807' },
    { id: 'vernon-briefcase', kind: 'figure', sourcePath: `${generated}/vernon-briefcase-v1.png`, sha256: '8155cae6460b479b2dc86e7fd273a6610ed435f2b658d78ccae73e31b9c7ed65', preparation: magenta },
    { id: 'dumbledore-arrival', kind: 'figure', sourcePath: `${generated}/dumbledore-arrival-v1.png`, sha256: '0fbe73f0964d6d12bf92c9f626c6c0f4c80712cd725ec185155aa1237bb3b737', preparation: magenta },
    { id: 'dumbledore-grave', kind: 'figure', sourcePath: `${generated}/dumbledore-grave-v1.png`, sha256: '9b594ac0ff041475bf3a6ded7f2204fa8b3c9a7f3374f0862938212920638783', preparation: magenta },
    { id: 'mcgonagall-stern', kind: 'figure', sourcePath: `${generated}/mcgonagall-stern-v1.png`, sha256: '9c3056bd09ea0d783ee235f524e7d7e06797d86c3c54711981402a1c5c12340d', preparation: magenta },
    { id: 'mcgonagall-grief', kind: 'figure', sourcePath: `${generated}/mcgonagall-grief-v2.png`, sha256: 'e21efcacd77af76ed44a41c8f3b6a8cff6b9e714ceafd3a830e9d2cefce0adad', preparation: magenta },
    { id: 'hagrid-bundle', kind: 'figure', sourcePath: `${generated}/hagrid-bundle-v1.png`, sha256: '1702b790ff090d44109bbb5b4587f19c4307716aeb985ce79dee8decb140a392', preparation: magenta },
    { id: 'hagrid-weeping', kind: 'figure', sourcePath: `${generated}/hagrid-weeping-v1.png`, sha256: '60605abc48e2d521b32abf3e6174d7ce23124db3597949985bd3812426e6c60a', preparation: magenta },
    { id: 'vernon-noticing', kind: 'figure', sourcePath: `${generated}/vernon-noticing-v1.png`, sha256: 'd30ce5bdab55d38012b9dd6c78412dbf6eb597564c7f20e2eb3fb455f58ceaab', preparation: magenta },
    { id: 'vernon-alarmed', kind: 'figure', sourcePath: `${generated}/vernon-alarmed-v1.png`, sha256: '4b7e719cc7e96ee7492294ef4276352b32c5447d747403e85d6367db4dd7b2f8', preparation: magenta },
    { id: 'vernon-dismissing', kind: 'figure', sourcePath: `${generated}/vernon-dismissing-v1.png`, sha256: '7e49db049ca9809a08363b1707d1cb007b7fcb8a504a004f670be3c61dc0e9a2', preparation: magenta },
    { id: 'dumbledore-listening', kind: 'figure', sourcePath: `${generated}/dumbledore-listening-v1.png`, sha256: '5a6056d19a1df54843b1e77f6e57fcdaa1a877c9c3d7178d09fa344e070a1052', preparation: magenta },
    { id: 'dumbledore-resolved', kind: 'figure', sourcePath: `${generated}/dumbledore-resolved-v1.png`, sha256: '7c17af3f0808e0b7beec8408f7b01ba300a49672103a547da85b3ceff86bd427', preparation: magenta },
    { id: 'mcgonagall-questioning', kind: 'figure', sourcePath: `${generated}/mcgonagall-questioning-v2.png`, sha256: '5d9df6afff395de526259365a19aa039e717cd97ffb4b33379f080a38e70c456', preparation: magenta },
    { id: 'mcgonagall-steadied', kind: 'figure', sourcePath: `${generated}/mcgonagall-steadied-v1.png`, sha256: '2130df38bb92d946610d839e16e1319cfd5c8bcfb163da4a0d99e42298c0e786', preparation: magenta },
    { id: 'hagrid-hushed', kind: 'figure', sourcePath: `${generated}/hagrid-hushed-v1.png`, sha256: '1e82ef807680b76c2c6f2f0fdb0fce1a6b8828e7b1b5599621c549cb374a04b3', preparation: magenta },
    { id: 'hagrid-farewell', kind: 'figure', sourcePath: `${generated}/hagrid-farewell-v1.png`, sha256: 'c5c6a56409f48472c606a36af5e80b76f3e420afdca77d969c4d3e59dc852467', preparation: magenta },
    { id: 'doorstep-cg', kind: 'cg', sourcePath: `${generated}/doorstep-cg-v2c.jpg`, sha256: '56061f8d48f756d954a40dc698f6c89b837586075f41bd72f1f4863ab387f822' },
    { id: 'suburban-night', kind: 'ambience', sourcePath: `${generated}/suburban-night-v1.wav`, sha256: '6622538b6ccc1f787dbb782597e94a8ac2451484b466415bc6aa928eb2decf3b' },
    { id: 'put-outer-click', kind: 'cue', sourcePath: `${generated}/put-outer-click-v1.wav`, sha256: '4da2a4ed6c6c95306c37513fa66a6dfb40ac2c1ab398451a51a7b83f23ad4e77' },
    { id: 'motorcycle-descent', kind: 'cue', sourcePath: `${generated}/motorcycle-descent-v1.wav`, sha256: '1b412a7101fadeb9084221ecd62689d7a17e372465603a93d84a15b32a1db00f' },
    { id: 'privet-morning-theme', kind: 'music', sourcePath: `${generated}/score/privet-morning-theme.mp3`, sha256: 'cb3a70ffe89e9a5d32fa99f99936aa9109a2040051e06edc0ab27a4c23f1fe56' },
    { id: 'privet-nocturne', kind: 'music', sourcePath: `${generated}/score/privet-nocturne.mp3`, sha256: '4e35b7a7fcf7602d9e6eaf9277567ae5e0096198fab7ad3d1ec4f688b23e0180' },
    { id: 'doorstep-lullaby', kind: 'music', sourcePath: `${generated}/score/doorstep-lullaby.mp3`, sha256: '7c2f60036da1bd0ec40a941e85360fdd0129bf52e1d69f6a54f742bbad9a89a9' },
    { id: 'cat-transfiguration', kind: 'cue', sourcePath: `${generated}/score/cat-transfiguration.wav`, sha256: '5bf1313139a32db5ff0e6cd01b799b0daa4718920ac105cef2a5b55a2d3c4205' },
    { id: 'letter-placed-cue', kind: 'cue', sourcePath: `${generated}/score/letter-placed.wav`, sha256: 'dd16d7ddf811b343e105a762038f01496a67c4677cd5aae0d88eaf0379a43946' },
  ],
  actors: [
    { id: 'vernon', name: 'Vernon Dursley', identityVersion: 'vernon-dursley-v1', defaultAppearanceId: 'briefcase', stageHeightPercent: 84, appearances: [
      { id: 'briefcase', assetId: 'vernon-briefcase', stageName: 'Mr Dursley', wardrobe: 'grey-suit-overcoat', expression: 'irritated-self-importance', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
      { id: 'noticing', assetId: 'vernon-noticing', stageName: 'Mr Dursley', wardrobe: 'grey-suit-overcoat', expression: 'glance-back', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
      { id: 'alarmed', assetId: 'vernon-alarmed', stageName: 'Mr Dursley', wardrobe: 'grey-suit-overcoat', expression: 'alarm-checked', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
      { id: 'dismissing', assetId: 'vernon-dismissing', stageName: 'Mr Dursley', wardrobe: 'grey-suit-overcoat', expression: 'dismissive-squared', concealment: 'civilian', projection: 'full-body', sourceFacing: 'right' },
    ] },
    { id: 'dumbledore', name: 'Albus Dumbledore', identityVersion: 'albus-dumbledore-v1', defaultAppearanceId: 'arrival', stageHeightPercent: 90, appearances: [
      { id: 'arrival', assetId: 'dumbledore-arrival', stageName: 'The old man', wardrobe: 'purple-robes-cloak', expression: 'faint-amusement', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'named', assetId: 'dumbledore-arrival', stageName: 'Albus Dumbledore', wardrobe: 'purple-robes-cloak', expression: 'faint-amusement', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'grave', assetId: 'dumbledore-grave', stageName: 'Albus Dumbledore', wardrobe: 'purple-robes-cloak', expression: 'grief-held', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'listening', assetId: 'dumbledore-listening', stageName: 'Albus Dumbledore', wardrobe: 'purple-robes-cloak', expression: 'listening-weighing', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'resolved', assetId: 'dumbledore-resolved', stageName: 'Albus Dumbledore', wardrobe: 'purple-robes-cloak', expression: 'resolved-open', concealment: 'civilian', projection: 'full-body', sourceFacing: 'left' },
    ] },
    { id: 'mcgonagall', name: 'Minerva McGonagall', identityVersion: 'minerva-mcgonagall-v1', defaultAppearanceId: 'stern', stageHeightPercent: 86, appearances: [
      { id: 'stern', assetId: 'mcgonagall-stern', stageName: 'Professor McGonagall', wardrobe: 'emerald-cloak', expression: 'controlled-indignation', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
      { id: 'grief', assetId: 'mcgonagall-grief', stageName: 'Professor McGonagall', wardrobe: 'emerald-cloak', expression: 'composure-cracked', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
      { id: 'questioning', assetId: 'mcgonagall-questioning', stageName: 'Professor McGonagall', wardrobe: 'emerald-cloak', expression: 'pressing-question', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
      { id: 'steadied', assetId: 'mcgonagall-steadied', stageName: 'Professor McGonagall', wardrobe: 'emerald-cloak', expression: 'steadied-hands-clasped', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
    ] },
    { id: 'hagrid', name: 'Rubeus Hagrid', identityVersion: 'rubeus-hagrid-v1', defaultAppearanceId: 'bundle', stageHeightPercent: 92, appearances: [
      { id: 'bundle', assetId: 'hagrid-bundle', stageName: 'Hagrid', wardrobe: 'moleskin-overcoat', expression: 'tender-careful', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'weeping', assetId: 'hagrid-weeping', stageName: 'Hagrid', wardrobe: 'moleskin-overcoat', expression: 'weeping', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'hushed', assetId: 'hagrid-hushed', stageName: 'Hagrid', wardrobe: 'moleskin-overcoat', expression: 'hushed-finger-to-lips', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'farewell', assetId: 'hagrid-farewell', stageName: 'Hagrid', wardrobe: 'moleskin-overcoat', expression: 'farewell-hand-raised', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
    ] },
  ],
  tableaux: [
    { id: 'morning-establishing', location: morning, backgroundAssetId: 'street-morning', musicAssetId: 'privet-morning-theme', shot: 'wide', tone: 'neutral', figures: [] },
    { id: 'morning-vernon', location: morning, backgroundAssetId: 'street-morning', musicAssetId: 'privet-morning-theme', shot: 'conversation', tone: 'neutral', figures: [
      { actorId: 'vernon', slot: 'left', facing: 'right', emphasis: 'active' },
    ] },
    { id: 'morning-cat', location: morning, backgroundAssetId: 'street-morning', musicAssetId: 'privet-morning-theme', shot: 'artifact', tone: 'neutral', figures: [
      { actorId: 'vernon', slot: 'far-left', facing: 'right', emphasis: 'active' },
    ], artifact: { assetId: 'tabby-cat', slot: 'right', footprint: 'study' } },
    { id: 'morning-cat-noticing', location: morning, backgroundAssetId: 'street-morning', musicAssetId: 'privet-morning-theme', shot: 'artifact', tone: 'neutral', figures: [
      { actorId: 'vernon', appearanceId: 'noticing', slot: 'far-left', facing: 'right', emphasis: 'active' },
    ], artifact: { assetId: 'tabby-cat', slot: 'right', footprint: 'study' } },
    { id: 'morning-vernon-alarmed', location: morning, backgroundAssetId: 'street-morning', musicAssetId: 'privet-morning-theme', shot: 'conversation', tone: 'cold', figures: [
      { actorId: 'vernon', appearanceId: 'alarmed', slot: 'left', facing: 'right', emphasis: 'active' },
    ] },
    { id: 'morning-vernon-dismissing', location: morning, backgroundAssetId: 'street-morning', musicAssetId: 'privet-morning-theme', shot: 'conversation', tone: 'neutral', figures: [
      { actorId: 'vernon', appearanceId: 'dismissing', slot: 'left', facing: 'right', emphasis: 'active' },
    ] },
    { id: 'morning-cat-watching', location: morning, backgroundAssetId: 'street-morning', musicAssetId: 'privet-morning-theme', shot: 'artifact', tone: 'cold', figures: [
      { actorId: 'vernon', slot: 'far-left', facing: 'right', emphasis: 'recessed' },
    ], artifact: { assetId: 'tabby-cat', slot: 'right', footprint: 'study' } },
    { id: 'night-establishing', location: night, backgroundAssetId: 'street-night-lit', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'wide', tone: 'cold', figures: [] },
    { id: 'night-cat', location: night, backgroundAssetId: 'street-night-lit', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'artifact', tone: 'cold', figures: [], artifact: { assetId: 'tabby-cat', slot: 'right', footprint: 'study' } },
    { id: 'night-arrival', location: night, backgroundAssetId: 'street-night-lit', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'artifact', tone: 'cold', figures: [
      { actorId: 'dumbledore', appearanceId: 'arrival', slot: 'right', facing: 'left', emphasis: 'active' },
    ], artifact: { assetId: 'tabby-cat', slot: 'far-left', footprint: 'study' } },
    { id: 'night-put-outer', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'artifact', tone: 'ominous', figures: [
      { actorId: 'dumbledore', appearanceId: 'arrival', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
    ], artifact: { assetId: 'put-outer', slot: 'center', footprint: 'study' } },
    { id: 'dark-dumbledore-cat', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'artifact', tone: 'intimate', figures: [
      { actorId: 'dumbledore', appearanceId: 'named', slot: 'right', facing: 'left', emphasis: 'active' },
    ], artifact: { assetId: 'tabby-cat', slot: 'far-left', footprint: 'study' } },
    { id: 'dark-mcgonagall-active', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mcgonagall', appearanceId: 'stern', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'dumbledore', appearanceId: 'named', slot: 'right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'dark-dumbledore-active', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mcgonagall', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'dumbledore', appearanceId: 'named', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'dark-mcgonagall-questioning', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mcgonagall', appearanceId: 'questioning', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'dumbledore', appearanceId: 'listening', slot: 'right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'dark-dumbledore-grave', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'ominous', figures: [
      { actorId: 'mcgonagall', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'dumbledore', appearanceId: 'grave', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'dark-mcgonagall-grief', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'ominous', figures: [
      { actorId: 'mcgonagall', appearanceId: 'grief', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'dumbledore', appearanceId: 'grave', slot: 'right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'dark-hagrid-hushed', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'ominous', figures: [
      { actorId: 'mcgonagall', appearanceId: 'grief', slot: 'far-left', facing: 'right', emphasis: 'recessed' },
      { actorId: 'dumbledore', appearanceId: 'listening', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'hagrid', appearanceId: 'hushed', slot: 'far-right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'dark-hagrid-arrives', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'ominous', figures: [
      { actorId: 'mcgonagall', appearanceId: 'grief', slot: 'far-left', facing: 'right', emphasis: 'recessed' },
      { actorId: 'dumbledore', appearanceId: 'grave', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'hagrid', appearanceId: 'bundle', slot: 'far-right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'dark-trio-dumbledore', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mcgonagall', appearanceId: 'grief', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'dumbledore', appearanceId: 'grave', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'hagrid', appearanceId: 'bundle', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'dark-trio-mcgonagall', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'privet-nocturne', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mcgonagall', appearanceId: 'grief', slot: 'far-left', facing: 'right', emphasis: 'active' },
      { actorId: 'dumbledore', appearanceId: 'grave', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'hagrid', appearanceId: 'bundle', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'doorstep-reveal', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'doorstep-lullaby', ambienceAssetId: 'suburban-night', shot: 'artifact', tone: 'intimate', figures: [],
      cutIn: { assetId: 'doorstep-cg', framing: 'location-match', representedActorIds: ['dumbledore', 'mcgonagall', 'hagrid'], representedArtifactId: 'sealed-letter' } },
    { id: 'dark-letter-resolved', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'doorstep-lullaby', ambienceAssetId: 'suburban-night', shot: 'artifact', tone: 'intimate', figures: [
      { actorId: 'mcgonagall', appearanceId: 'steadied', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'dumbledore', appearanceId: 'resolved', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'hagrid', appearanceId: 'weeping', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
    ], artifact: { assetId: 'sealed-letter', slot: 'center', footprint: 'study' } },
    { id: 'dark-letter', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'doorstep-lullaby', ambienceAssetId: 'suburban-night', shot: 'artifact', tone: 'intimate', figures: [
      { actorId: 'mcgonagall', appearanceId: 'grief', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'dumbledore', appearanceId: 'grave', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'hagrid', appearanceId: 'weeping', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
    ], artifact: { assetId: 'sealed-letter', slot: 'center', footprint: 'study' } },
    { id: 'dark-hagrid-weeps', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'doorstep-lullaby', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mcgonagall', appearanceId: 'grief', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'dumbledore', appearanceId: 'grave', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'hagrid', appearanceId: 'weeping', slot: 'far-right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'dark-farewell', location: night, backgroundAssetId: 'street-night-dark', musicAssetId: 'doorstep-lullaby', ambienceAssetId: 'suburban-night', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mcgonagall', appearanceId: 'steadied', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'dumbledore', appearanceId: 'resolved', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'hagrid', appearanceId: 'farewell', slot: 'far-right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'night-relit', location: night, backgroundAssetId: 'street-night-lit', musicAssetId: 'doorstep-lullaby', ambienceAssetId: 'suburban-night', shot: 'artifact', tone: 'cold', figures: [], artifact: { assetId: 'sealed-letter', slot: 'center', footprint: 'study' } },
  ],
  moments: [
    { id: 'privet-morning', chapter, tableauId: 'morning-establishing', viewpoint: { kind: 'public' }, mode: 'location', text: 'Number four, Privet Drive. The residents were proud to say that they were perfectly normal, thank you very much.', cueAssetIds: [], next: { type: 'goto', nodeId: 'normal-people' } },
    { id: 'normal-people', chapter, tableauId: 'morning-establishing', viewpoint: { kind: 'public' }, mode: 'narration', label: 'The Dursleys', text: 'Mr and Mrs Dursley had everything they wanted, and one secret they wanted less than anything: Mrs Dursley’s sister, and the sister’s family. They did not think they could bear it if anyone found out about the Potters.', cueAssetIds: [], next: { type: 'goto', nodeId: 'vernon-leaves' } },
    { id: 'vernon-leaves', chapter, tableauId: 'morning-vernon', viewpoint: { kind: 'public' }, mode: 'action', label: 'Tuesday', text: 'Mr Dursley hummed as he picked out his most boring tie and backed his car out of the drive. The sky was dull and grey. Nothing about it suggested that strange and mysterious things would soon be happening all over the country.', cueAssetIds: [], performanceBeat: { actorId: 'vernon', phase: 'baseline', importance: 'supporting' }, next: { type: 'goto', nodeId: 'cat-on-wall' } },
    { id: 'cat-on-wall', chapter, tableauId: 'morning-cat', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'The cat', text: 'At the corner of the street he noticed the first sign of something peculiar: a tabby cat on the garden wall. It stared back at him. It had square markings around its eyes.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'observe', prompt: 'What does Mr Dursley actually see?', options: [
      { id: 'see-map', label: 'A cat reading a map', consequence: 'Let the impossible thing be the first thing he sees.', nodeId: 'vernon-blinks-map', grantsInsightIds: ['cat-reads-map'] },
      { id: 'see-sign', label: 'A cat looking at the street sign', consequence: 'Let him edit the map out before it registers.', nodeId: 'vernon-blinks-sign', grantsInsightIds: ['cat-reads-sign'] },
    ] } },
    { id: 'vernon-blinks-map', chapter, tableauId: 'morning-cat-noticing', viewpoint: { kind: 'private', holderId: 'vernon' }, mode: 'thought', speakerId: 'vernon', text: 'A cat reading a map. He blinked and looked again. It was only staring at the sign that said Privet Drive—no, at him. Cats could not read maps. Cats could not read anything.', cueAssetIds: [], performanceBeat: { actorId: 'vernon', phase: 'appraisal', importance: 'supporting' }, next: { type: 'goto', nodeId: 'cloaks-in-town' } },
    { id: 'vernon-blinks-sign', chapter, tableauId: 'morning-cat-noticing', viewpoint: { kind: 'private', holderId: 'vernon' }, mode: 'thought', speakerId: 'vernon', text: 'A cat, looking at the sign that said Privet Drive. That was all it was. There had been no map. Cats did not read signs either, but that was a smaller thing to not think about.', cueAssetIds: [], performanceBeat: { actorId: 'vernon', phase: 'appraisal', importance: 'supporting' }, next: { type: 'goto', nodeId: 'cloaks-in-town' } },
    { id: 'cloaks-in-town', chapter, tableauId: 'morning-vernon', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Town', text: 'By the time he reached the traffic jam, the cat was forgotten. In its place were people in cloaks: a whole huddle of them, whispering excitedly, and not one of them looked young enough to be dressing up for a collection stunt.', cueAssetIds: [], next: { type: 'goto', nodeId: 'whispers' } },
    { id: 'whispers', chapter, tableauId: 'morning-vernon', viewpoint: { kind: 'public' }, mode: 'action', label: 'Overheard', text: 'On his way to buy a doughnut he passed the huddle and caught a few words. “The Potters, that’s right, that’s what I heard—” “—yes, their son, Harry—”', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'interpret', prompt: 'What unsettles him most?', options: [
      { id: 'the-name', label: 'The name Potter', consequence: 'He knows that name. He has spent years not saying it.', nodeId: 'vernon-stops-name', grantsInsightIds: ['potters-named'] },
      { id: 'the-cloaks', label: 'Grown men in cloaks at midday', consequence: 'He fixes on the costume so he need not hear the words.', nodeId: 'vernon-stops-cloaks', grantsInsightIds: ['cloaks-noticed'] },
      { id: 'a-collection', label: 'A collection stunt, badly dressed', consequence: 'He looks for the bucket and the badge.', nodeId: 'vernon-stops-collection', distractor: true, grantsInsightIds: ['collection-stunt-assumed'] },
    ] } },
    { id: 'vernon-stops-collection', chapter, tableauId: 'morning-vernon-dismissing', viewpoint: { kind: 'private', holderId: 'vernon' }, mode: 'thought', speakerId: 'vernon', text: 'Some silly stunt, then. Collecting for something. He looked for the bucket and found none, and the word Potter went past him like a bus he had already decided not to catch.', cueAssetIds: [], performanceBeat: { actorId: 'vernon', phase: 'decision', importance: 'supporting' }, next: { type: 'goto', nodeId: 'vernon-returns' } },
    { id: 'vernon-stops-name', chapter, tableauId: 'morning-vernon-alarmed', viewpoint: { kind: 'private', holderId: 'vernon' }, mode: 'thought', speakerId: 'vernon', text: 'Potter. He stopped dead. Fear flooded him. Then he told himself Potter was not an unusual name, there were plenty of Potters, and he was not even sure the nephew was called Harry. It might have been Harvey. Or Harold.', cueAssetIds: [], performanceBeat: { actorId: 'vernon', phase: 'decision', importance: 'supporting' }, next: { type: 'goto', nodeId: 'vernon-returns' } },
    { id: 'vernon-stops-cloaks', chapter, tableauId: 'morning-vernon-alarmed', viewpoint: { kind: 'private', holderId: 'vernon' }, mode: 'thought', speakerId: 'vernon', text: 'Cloaks. Emerald green, in the middle of the working day. He glared at them so hard that he nearly missed the word Potter altogether—and decided, on balance, that he had.', cueAssetIds: [], performanceBeat: { actorId: 'vernon', phase: 'decision', importance: 'supporting' }, next: { type: 'goto', nodeId: 'vernon-returns' } },
    { id: 'vernon-returns', chapter, tableauId: 'morning-cat-watching', viewpoint: { kind: 'public' }, mode: 'action', label: 'Home', text: 'When he pulled into the drive at five o’clock, the tabby cat was still sitting on the garden wall. “Shoo!” said Mr Dursley. The cat did not move. It gave him a stern look.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['cat-reads-map', 'potters-named'] }, text: 'The tabby cat was still on the garden wall at five o’clock. It gave him a stern look, and for one second the map and the name Potter arrived together in his head. He said “Shoo!” to both of them. Neither moved.' },
      { when: { kind: 'reader-insights', insightIds: ['cat-reads-map'] }, text: 'The tabby cat was still on the garden wall at five o’clock. There was no map now. “Shoo!” said Mr Dursley. The cat gave him a stern look, as though it remembered that he had seen.' },
      { when: { kind: 'reader-insights', insightIds: ['potters-named'] }, text: 'The tabby cat was still on the garden wall at five o’clock. “Shoo!” said Mr Dursley. It did not move. He decided he would not mention the Potters to Petunia. He would not mention anything at all.' },
    ], cueAssetIds: [], performanceBeat: { actorId: 'vernon', phase: 'after-state', importance: 'supporting' }, next: { type: 'goto', nodeId: 'privet-night' } },
    { id: 'privet-night', chapter, tableauId: 'night-establishing', viewpoint: { kind: 'public' }, mode: 'location', text: 'Privet Drive, near midnight. The Dursleys slept. Nothing on the street looked as if it had ever been anything other than ordinary.', cueAssetIds: [], next: { type: 'goto', nodeId: 'cat-waits' } },
    { id: 'cat-waits', chapter, tableauId: 'night-cat', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'Still there', text: 'The cat on the wall had not moved. It sat as still as a statue, eyes fixed unblinkingly on the far corner of the street. It did not so much as quiver when a car door slammed in the next road.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['cat-reads-sign'] }, text: 'The cat on the wall had not moved. Whatever Mr Dursley had decided it was looking at that morning, it was looking at the far corner of the street now, and had been for hours, as still as a statue.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'man-appears' } },
    { id: 'man-appears', chapter, tableauId: 'night-arrival', viewpoint: { kind: 'public' }, mode: 'action', label: 'The corner', text: 'A man appeared on the corner the cat had been watching—appeared so suddenly and silently you would have thought he had popped out of the ground. He was tall, thin and very old, with silver hair and a beard long enough to tuck into his belt. Nothing like him had ever been seen on Privet Drive.', cueAssetIds: [], performanceBeat: { actorId: 'dumbledore', phase: 'baseline', importance: 'supporting' }, next: { type: 'goto', nodeId: 'put-outer' } },
    { id: 'put-outer', chapter, tableauId: 'night-put-outer', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'The Put-Outer', text: 'He found what he was looking for in an inside pocket: something like a silver cigarette lighter. He flicked it open, held it up, and clicked. The nearest streetlamp went out with a little pop. Twelve clicks later the only lights left on the whole street were two tiny pinpricks in the distance—the eyes of the cat.', cueAssetIds: ['put-outer-click'], next: { type: 'goto', nodeId: 'greets-cat' } },
    { id: 'greets-cat', chapter, tableauId: 'dark-dumbledore-cat', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'dumbledore', text: 'Fancy seeing you here, Professor McGonagall.', cueAssetIds: [], next: { type: 'goto', nodeId: 'cat-becomes-woman' } },
    { id: 'cat-becomes-woman', chapter, tableauId: 'dark-mcgonagall-active', viewpoint: { kind: 'public' }, mode: 'action', label: 'Animagus', text: 'He turned to smile at the tabby, but it had gone. Instead he was smiling at a rather severe-looking woman in square spectacles exactly the shape of the markings the cat had had around its eyes. She, too, was wearing a cloak, an emerald one, and she looked distinctly ruffled.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['collection-stunt-assumed'] }, text: 'He turned to smile at the tabby, but it had gone. Instead he was smiling at a rather severe-looking woman in square spectacles exactly the shape of the markings the cat had had around its eyes. She, too, was wearing a cloak, an emerald one—the same cloaks Mr Dursley had decided were collecting for something—and she was not collecting for anything. She looked distinctly ruffled.' },
    ], cueAssetIds: ['cat-transfiguration'], performanceBeat: { actorId: 'mcgonagall', phase: 'baseline', importance: 'supporting' }, next: { type: 'goto', nodeId: 'mcgonagall-scolds' } },
    { id: 'mcgonagall-scolds', chapter, tableauId: 'dark-mcgonagall-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mcgonagall', text: 'How did you know it was me? I’ve been sitting on that wall all day. And you’d think they’d be a bit more careful—owls in broad daylight, shooting stars in Kent. Even the Muggles have noticed something’s going on.', cueAssetIds: [], next: { type: 'goto', nodeId: 'dumbledore-celebrate' } },
    { id: 'dumbledore-celebrate', chapter, tableauId: 'dark-dumbledore-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'dumbledore', text: 'You can’t blame them. We’ve had precious little to celebrate for eleven years. Would you care for a sherbet lemon? It’s a kind of Muggle sweet I’m rather fond of.', cueAssetIds: [], next: { type: 'goto', nodeId: 'mcgonagall-asks' } },
    { id: 'mcgonagall-asks', chapter, tableauId: 'dark-mcgonagall-questioning', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mcgonagall', text: 'No, thank you. Albus—everyone is saying he has gone. You-Know-Who. That he turned up in Godric’s Hollow last night, looking for the Potters. The rumour is that Lily and James are… that they’re… dead.', cueAssetIds: [], performanceBeat: { actorId: 'mcgonagall', phase: 'appraisal', importance: 'supporting' }, next: { type: 'goto', nodeId: 'mcgonagall-private' } },
    { id: 'mcgonagall-private', chapter, tableauId: 'dark-mcgonagall-questioning', viewpoint: { kind: 'private', holderId: 'mcgonagall' }, mode: 'thought', speakerId: 'mcgonagall', text: 'Say it is a rumour. Say it. She had sat on a cold wall for a whole day so that she could hear him say it before anyone else did.', cueAssetIds: [], next: { type: 'goto', nodeId: 'dumbledore-confirms' } },
    { id: 'dumbledore-confirms', chapter, tableauId: 'dark-dumbledore-grave', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'dumbledore', text: 'I’m afraid so, Professor. Lily and James. I know. I know.', cueAssetIds: [], performanceBeat: { actorId: 'dumbledore', phase: 'decision', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'mcgonagall-breaks' } },
    { id: 'mcgonagall-breaks', chapter, tableauId: 'dark-mcgonagall-grief', viewpoint: { kind: 'public' }, mode: 'action', label: 'Grief', text: 'Professor McGonagall’s voice trembled. She had to sit for a moment. “That’s not all. They’re saying he tried to kill the Potters’ son, Harry. And that he couldn’t. That he couldn’t kill a little boy.”', cueAssetIds: [], performanceBeat: { actorId: 'mcgonagall', phase: 'after-state', importance: 'pivotal' }, next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'predict', prompt: 'Why could the most feared wizard in a century not kill a child?', options: [
      { id: 'something-in-boy', label: 'Something about the boy himself', consequence: 'Predict that the answer lies in Harry.', nodeId: 'dumbledore-guess' },
      { id: 'his-power-broke', label: 'His own power turned on him', consequence: 'Predict that the curse failed at its source.', nodeId: 'dumbledore-guess', distractor: true, grantsInsightIds: ['power-broke-assumed'] },
      { id: 'nobody-knows', label: 'Nobody knows—not even Dumbledore', consequence: 'Predict that the wisest man present is guessing too.', nodeId: 'dumbledore-guess' },
    ] } },
    { id: 'dumbledore-guess', chapter, tableauId: 'dark-dumbledore-grave', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'dumbledore', text: 'We can only guess. We may never know.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'mcgonagall-breaks', optionId: 'something-in-boy' }, text: 'We can only guess. Something in that boy stopped him where nothing else could—but as to what, we may never know.' },
      { when: { kind: 'active-choice', choiceNodeId: 'mcgonagall-breaks', optionId: 'his-power-broke' }, text: 'We can only guess. Perhaps his power broke, and that is why he has gone. But we may never know.' },
      { when: { kind: 'active-choice', choiceNodeId: 'mcgonagall-breaks', optionId: 'nobody-knows' }, text: 'We can only guess. I do not know either, Professor, and I am not ashamed to say it tonight. We may never know.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'hagrid-arrives' } },
    { id: 'hagrid-arrives', chapter, tableauId: 'dark-hagrid-arrives', viewpoint: { kind: 'public' }, mode: 'action', label: 'From the sky', text: 'A low rumbling broke the silence, grew to a roar, and a huge motorbike fell out of the air and landed on the road in front of them. If the motorbike was huge, it was nothing to the man sitting astride it. In his vast, muscular arms he was holding a bundle of blankets.', cueAssetIds: ['motorcycle-descent'], performanceBeat: { actorId: 'hagrid', phase: 'baseline', importance: 'supporting' }, next: { type: 'goto', nodeId: 'hagrid-reports' } },
    { id: 'hagrid-reports', chapter, tableauId: 'dark-hagrid-hushed', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'hagrid', text: 'No problems, sir. House was almost destroyed but I got him out all right before the Muggles started swarmin’ around. He fell asleep as we was flyin’ over Bristol.', cueAssetIds: [], next: { type: 'goto', nodeId: 'doorstep' } },
    { id: 'doorstep', chapter, tableauId: 'doorstep-reveal', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'The doorstep', text: 'Under the blankets a baby boy was fast asleep. Beneath a tuft of jet-black hair, on his forehead, they could see a curiously shaped cut, like a bolt of lightning. Dumbledore stepped over the low garden wall and laid him gently on the doorstep of number four.', cueAssetIds: [], performanceBeat: { actorId: 'dumbledore', phase: 'after-state', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'scar-question' } },
    { id: 'scar-question', chapter, tableauId: 'dark-trio-mcgonagall', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mcgonagall', text: 'Is that where—? Couldn’t you do something about it, Albus?', cueAssetIds: [], next: { type: 'goto', nodeId: 'scars-handy' } },
    { id: 'scars-handy', chapter, tableauId: 'dark-trio-dumbledore', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'dumbledore', text: 'Even if I could, I wouldn’t. Scars can come in handy. I have one above my left knee which is a perfect map of the London Underground.', cueAssetIds: [], next: { type: 'goto', nodeId: 'hagrid-weeps' } },
    { id: 'letter-decision', chapter, tableauId: 'dark-letter', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'The letter', text: 'Dumbledore took a letter out of his cloak and tucked it inside the blankets. Professor McGonagall looked at the dark, sleeping house and then at him.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'decide', prompt: 'The Dursleys will find him in the morning. What does Dumbledore leave them?', options: [
      { id: 'letter-alone', label: 'The letter alone', consequence: 'Trust the written explanation and nothing else.', nodeId: 'letter-placed' },
      { id: 'a-word-tomorrow', label: 'The letter, and a word with them tomorrow', consequence: 'Refuse to leave a child to a piece of paper.', nodeId: 'letter-placed' },
      { id: 'a-charm-on-the-step', label: 'The letter, and a charm they cannot refuse', consequence: 'Make the doorstep hold him whether they like it or not.', nodeId: 'letter-placed', distractor: true, grantsInsightIds: ['charm-compels-assumed'] },
    ] } },
    { id: 'letter-placed', chapter, tableauId: 'dark-letter-resolved', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'dumbledore', text: 'I’ve explained everything in the letter. They are the only family he has left. It is the best place for him. Dry your eyes, Hagrid.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'letter-decision', optionId: 'letter-alone' }, text: 'I’ve explained everything in the letter. It will be quite enough, Professor. They are the only family he has left, and however they receive him, this is the best place for him.' },
      { when: { kind: 'active-choice', choiceNodeId: 'letter-decision', optionId: 'a-word-tomorrow' }, text: 'I’ve explained everything in the letter. No—I shall not come back tomorrow. He must be where I am not, and they are the only family he has left. It is the best place for him. Dry your eyes, Hagrid.' },
      { when: { kind: 'active-choice', choiceNodeId: 'letter-decision', optionId: 'a-charm-on-the-step' }, text: 'I’ve explained everything in the letter. They will take him in, Professor—not because I make them, but because they are the only family he has left. It is the best place for him. Dry your eyes, Hagrid.' },
    ], cueAssetIds: ['letter-placed-cue'], next: { type: 'goto', nodeId: 'hagrid-farewell' } },
    { id: 'hagrid-farewell', chapter, tableauId: 'dark-farewell', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'hagrid', text: 'Yeah. I’ll be takin’ Sirius his bike back. G’night, Professor McGonagall—Professor Dumbledore, sir.', cueAssetIds: [], performanceBeat: { actorId: 'hagrid', phase: 'after-state', importance: 'supporting' }, next: { type: 'goto', nodeId: 'they-leave' } },
    { id: 'hagrid-weeps', chapter, tableauId: 'dark-hagrid-weeps', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'hagrid', text: 'S-s-sorry. But I c-c-can’t stand it—Lily an’ James dead—an’ poor little Harry off ter live with Muggles—', cueAssetIds: [], performanceBeat: { actorId: 'hagrid', phase: 'after-state', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'letter-decision' } },
    { id: 'they-leave', chapter, tableauId: 'night-relit', viewpoint: { kind: 'public' }, mode: 'action', label: 'Departure', text: 'A breeze ruffled the hedges of Privet Drive. Hagrid’s motorbike roared into the sky, a cat slipped round the corner, and the old man clicked the Put-Outer once. Twelve balls of light sped back to their lamps, and by their glow, the small bundle on the step of number four stirred in its blankets but did not wake.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['cloaks-noticed'] }, text: 'A breeze ruffled the hedges of Privet Drive. Hagrid’s motorbike roared into the sky, a cat slipped round the corner, and the last cloak Mr Dursley would have glared at that day clicked the Put-Outer once. Twelve balls of light sped back to their lamps, and the small bundle on the step of number four stirred in its blankets but did not wake.' },
    ], cueAssetIds: ['put-outer-click'], next: { type: 'goto', nodeId: 'ending' } },
    { id: 'ending', chapter, tableauId: 'night-relit', viewpoint: { kind: 'public' }, mode: 'ending', label: 'The boy who lived', text: 'He could not know that at this very moment people meeting in secret all over the country were holding up their glasses and saying in hushed voices: “To Harry Potter—the boy who lived!”', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['power-broke-assumed'] }, text: 'He could not know that at this very moment people meeting in secret all over the country were holding up their glasses—not to a curse that had failed, but to him—and saying in hushed voices: “To Harry Potter—the boy who lived!”' },
      { when: { kind: 'reader-insights', insightIds: ['charm-compels-assumed'] }, text: 'Nothing held him to the step but blankets and a letter. He could not know that at this very moment people meeting in secret all over the country were holding up their glasses and saying in hushed voices: “To Harry Potter—the boy who lived!”' },
      { when: { kind: 'reader-insights', insightIds: ['power-broke-assumed', 'charm-compels-assumed'] }, text: 'Nothing held him to the step but blankets and a letter. He could not know that at this very moment people meeting in secret all over the country were holding up their glasses—not to a curse that had failed, but to him—and saying in hushed voices: “To Harry Potter—the boy who lived!”' },
    ], cueAssetIds: [], next: { type: 'end' } },
  ],
};

export const boyWhoLivedExperience: Experience = withVoiceLines(authored, boyWhoLivedVoiceLines);
