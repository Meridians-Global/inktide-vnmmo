import type { Experience } from '../core/contracts';

const base = 'assets/stage-kit';
const generated = 'assets/generated/moon-scar-ledger-v2';
const normalize = { kind: 'figure-normalize' as const, recipeVersion: 1 as const, canvas: { width: 896, height: 1024 }, subjectBox: { width: 850, height: 960 }, bottomPadding: 24 };
const snowBeyondCleft = { kind: 'snow' as const, layer: 'back' as const, region: { left: 24, top: 14, width: 52, height: 58 }, intensity: 18, seed: 1111 };

export const moonScarExperience: Experience = {
  schemaVersion: 2,
  id: 'moon-scar-reading-v1',
  title: 'Moon-Scar Ledger',
  subtitle: 'A clean-room visual-novel proof',
  posture: 'catch-up',
  source: {
    domainId: 'reverend-insanity',
    branchId: 'western-terraces',
    asOfEntryId: 'chapter-011--fang-receives-the-result',
    note: 'Presentation-only reconstruction. Traversal choices write no canonical state.',
  },
  startNodeId: 'cleft-location',
  assets: [
    { id: 'cleft-bg', kind: 'background', sourcePath: `${generated}/mountain-cleft-stage-v3.jpg`, sha256: '6fcfd2ad2723ded696fb7e0c08dde5b55a2162d5a3e6a819c082e4147b36cc67' },
    { id: 'cellar-bg', kind: 'background', sourcePath: `${generated}/secret-cellar-stage-v3.jpg`, sha256: '4612d2c69b3699d3a703975be3bb6a135aecb507e0f31f156632c8731a4e5bde' },
    { id: 'fang-neutral', kind: 'figure', sourcePath: `${generated}/fang-field-mantle-guarded-v3.png`, sha256: 'fb2edde92160508d19674c44ddf7264f1c6fbfcb021821f61ec89cacbc42e0a3', preparation: normalize },
    { id: 'chun-neutral', kind: 'figure', sourcePath: `${generated}/gu-yue-chun-neutral-v2.png`, sha256: 'a343a0837c79508997777d5ed06a4f01729781b4a5c8362f58101688e6972960', preparation: { ...normalize, matteCleanup: { spill: 'magenta', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 14 } } },
    { id: 'chun-disclosure', kind: 'figure', sourcePath: `${generated}/gu-yue-chun-disclosure-eye-fixed-v1.png`, sha256: 'd3832de2e26ebe3ec08c94d9515decd7957749f8ab35312199773eae7320d1a1', preparation: { ...normalize, matteCleanup: { spill: 'magenta', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 14 } } },
    { id: 'sealed-substrate', kind: 'artifact', sourcePath: `${generated}/sealed-substrate-v3.png`, sha256: '68e970759a94505f3965a0a60650bd531adfb299f81f77a60f15d19a44081b70' },
    { id: 'moon-scar-gu', kind: 'artifact', sourcePath: `${generated}/moon-scar-gu-v3.png`, sha256: 'ef5e118a551c86fb01cbd09cd346c2013d1842e44818d27daccaaaf051b86640' },
    { id: 'moon-scar-cg', kind: 'cg', sourcePath: `${generated}/moon-scar-revelation-cg-v1.jpg`, sha256: 'a9b98de23c59b5e2f3fac20b33adc4a202e45bb3adb3ca7e1f15d3a3041ecd1a' },
    { id: 'winter-wind', kind: 'ambience', sourcePath: `${base}/audio/ambience/winter-wind.wav`, sha256: 'f8a696b14987176d9b840e147011818d63f3cc4c54592403f640d94b0b69eecc' },
    { id: 'interior-room', kind: 'ambience', sourcePath: `${base}/audio/ambience/interior-room.wav`, sha256: 'b97136cf6eba23c088dd07b3e8a57a316ea8208778f31648e778a1607dd85044' },
    { id: 'tension-drone', kind: 'music', sourcePath: `${base}/audio/music/subterranean-tension-drone-v1.wav`, sha256: 'dd57f7c71b7c01362afad3255390d0ddee3e9ab8a4ffe9a992c514223b410c0c' },
    { id: 'stone-mechanism', kind: 'cue', sourcePath: `${base}/audio/foley/stone-mechanism-v1.wav`, sha256: 'eb8ec3cba42097a523f156f78d95ea9077d2878ad39dd2a88964c37cc2e27c8d' },
    { id: 'cloth-shift', kind: 'cue', sourcePath: `${base}/audio/foley/cloth-shift-v1.wav`, sha256: 'b2c9deb349f3843b222b5365bb5e131a8974a4c1271846b3f517c43d96b70591' },
    { id: 'stone-collection', kind: 'cue', sourcePath: `${base}/audio/foley/small-stone-collection-v1.wav`, sha256: '43ecf5b25a16244110b48185c95e14b7b0f6a90feb101e064a9d2e37a00c0790' },
  ],
  actors: [
    { id: 'fang-yuan', name: 'Fang Yuan', identityVersion: 'fang-yuan-v2', defaultAppearanceId: 'field-neutral', stageHeightPercent: 88, appearances: [
      { id: 'field-neutral', assetId: 'fang-neutral', stageName: 'Fang Yuan', wardrobe: 'black-grey-field-robes', expression: 'controlled-neutral', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
    ] },
    { id: 'gu-yue-chun', name: 'Gu Yue Chun', identityVersion: 'gu-yue-chun-v1', defaultAppearanceId: 'field-neutral', stageHeightPercent: 88, appearances: [
      { id: 'field-neutral', assetId: 'chun-neutral', stageName: 'Gu Yue Chun', wardrobe: 'green-field-robes', expression: 'attentive-neutral', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'restrained-disclosure', assetId: 'chun-disclosure', stageName: 'Gu Yue Chun', wardrobe: 'green-field-robes', expression: 'restrained-disclosure', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
    ] },
  ],
  tableaux: [
    {
      id: 'cleft-establishing', location: 'Mountain Cleft · Unregistered Harvest', backgroundAssetId: 'cleft-bg', ambienceAssetId: 'winter-wind', shot: 'wide', tone: 'cold', atmosphere: [snowBeyondCleft], figures: [],
    },
    {
      id: 'cleft-chun-active', location: 'Mountain Cleft · Unregistered Harvest', backgroundAssetId: 'cleft-bg', ambienceAssetId: 'winter-wind', shot: 'conversation', tone: 'cold', atmosphere: [snowBeyondCleft], figures: [
        { actorId: 'fang-yuan', slot: 'left', facing: 'right', emphasis: 'supporting' },
        { actorId: 'gu-yue-chun', slot: 'right', facing: 'left', emphasis: 'active' },
      ],
    },
    {
      id: 'cleft-fang-active', location: 'Mountain Cleft · Unregistered Harvest', backgroundAssetId: 'cleft-bg', ambienceAssetId: 'winter-wind', shot: 'conversation', tone: 'cold', atmosphere: [snowBeyondCleft], figures: [
        { actorId: 'fang-yuan', appearanceId: 'field-neutral', slot: 'left', facing: 'right', emphasis: 'active' },
        { actorId: 'gu-yue-chun', slot: 'right', facing: 'left', emphasis: 'supporting' },
      ],
    },
    {
      id: 'cellar-establishing', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'wide', tone: 'ominous', figures: [],
    },
    {
      id: 'cellar-conversation', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'conversation', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', slot: 'left', facing: 'right', emphasis: 'supporting' },
        { actorId: 'gu-yue-chun', slot: 'right', facing: 'left', emphasis: 'active' },
      ],
    },
    {
      id: 'cellar-disclosure', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'conversation', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', slot: 'left', facing: 'right', emphasis: 'supporting' },
        { actorId: 'gu-yue-chun', appearanceId: 'restrained-disclosure', slot: 'right', facing: 'left', emphasis: 'active' },
      ],
    },
    {
      id: 'substrate-study', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'recessed' },
        { actorId: 'gu-yue-chun', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
      ], artifact: { assetId: 'sealed-substrate', slot: 'center', footprint: 'study' },
    },
    {
      id: 'fang-question', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'conversation', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', appearanceId: 'field-neutral', slot: 'left', facing: 'right', emphasis: 'active' },
        { actorId: 'gu-yue-chun', slot: 'right', facing: 'left', emphasis: 'supporting' },
      ],
    },
    {
      id: 'moon-scar-reveal', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'ominous', figures: [],
      cutIn: { assetId: 'moon-scar-cg', representedActorIds: ['fang-yuan', 'gu-yue-chun'], representedArtifactId: 'moon-scar-gu' },
    },
    {
      id: 'moon-scar-reflection', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'ominous', figures: [
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'active' },
        { actorId: 'gu-yue-chun', slot: 'far-right', facing: 'left', emphasis: 'recessed' },
      ], artifact: { assetId: 'moon-scar-gu', slot: 'center', footprint: 'large' },
    },
  ],
  moments: [
    { id: 'cleft-location', chapter: 'Chapter 11 · The Result', tableauId: 'cleft-establishing', viewpoint: { kind: 'public' }, mode: 'location', label: 'Location', text: 'Mountain Cleft. Before dawn. Snow sealed every footprint except the two that mattered.', cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-arrives' } },
    { id: 'chun-arrives', chapter: 'Chapter 11 · The Result', tableauId: 'cleft-chun-active', viewpoint: { kind: 'public' }, mode: 'action', label: 'Action', text: 'Gu Yue Chun stopped at conversational distance. Neither cultivator surrendered the centre line.', cueAssetIds: ['cloth-shift'], next: { type: 'goto', nodeId: 'fang-private' } },
    { id: 'fang-private', chapter: 'Chapter 11 · The Result', tableauId: 'cleft-fang-active', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'thought', speakerId: 'fang-yuan', text: 'She came alone. That means the tally is valuable—or dangerous enough to keep off the books.', cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-speaks' } },
    { id: 'chun-speaks', chapter: 'Chapter 11 · The Result', tableauId: 'cleft-chun-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'gu-yue-chun', text: 'The moss survived the cleft. The result did not belong in the registry.', cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-private' } },
    { id: 'chun-private', chapter: 'Chapter 11 · The Result', tableauId: 'cleft-chun-active', viewpoint: { kind: 'private', holderId: 'gu-yue-chun' }, mode: 'thought', speakerId: 'gu-yue-chun', text: 'He did not ask whether it lived. He asked who had learned that it could.', cueAssetIds: [], next: { type: 'goto', nodeId: 'cellar-location' } },
    { id: 'cellar-location', chapter: 'Chapter 11 · The Result', tableauId: 'cellar-establishing', viewpoint: { kind: 'public' }, mode: 'location', label: 'Later', text: 'Beneath the council hall, stone swallowed the wind. Chun opened a room without a public key.', cueAssetIds: ['stone-mechanism'], next: { type: 'goto', nodeId: 'substrate-reveal' } },
    { id: 'substrate-reveal', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-study', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'Evidence', text: 'Seven sealed cores. Each held one measured layer of moonlit moss and one missing fact.', cueAssetIds: ['stone-collection'], next: { type: 'goto', nodeId: 'tally-bound' } },
    { id: 'tally-bound', chapter: 'Chapter 11 · The Result', tableauId: 'cellar-conversation', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'gu-yue-chun', text: 'With this moss as the core substrate: seven successes in ten. Seventy percent.', cueAssetIds: [], next: { type: 'goto', nodeId: 'question-choice' } },
    { id: 'question-choice', chapter: 'Chapter 11 · The Result', tableauId: 'fang-question', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'thought', speakerId: 'fang-yuan', text: 'The number was bait. The useful question was what Chun had chosen not to measure.', cueAssetIds: [], performanceBeat: { actorId: 'fang-yuan', phase: 'decision', importance: 'pivotal' }, next: { type: 'choice', posture: 'traversal', prompt: 'Which accepted passage do you read?', options: [
      { id: 'ask-rank', label: 'Ask what the result becomes at rank two.', consequence: 'Tests the technique’s ceiling.', nodeId: 'rank-question' },
      { id: 'ask-loss', label: 'Ask where the missing thirty percent went.', consequence: 'Tests the accounting.', nodeId: 'loss-question' },
    ] } },
    { id: 'rank-question', chapter: 'Chapter 11 · The Result', tableauId: 'fang-question', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'fang-yuan', text: 'And once the aperture reaches rank two?', cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-answers' } },
    { id: 'loss-question', chapter: 'Chapter 11 · The Result', tableauId: 'fang-question', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'fang-yuan', text: 'The missing three—failure, theft, or transformation?', cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-answers' } },
    { id: 'chun-answers', chapter: 'Chapter 11 · The Result', tableauId: 'cellar-disclosure', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'gu-yue-chun', text: 'Neither. The moss was not consumed. It was teaching the stone to remember moonlight.', cueAssetIds: [], performanceBeat: { actorId: 'gu-yue-chun', phase: 'decision', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'moon-scar' } },
    { id: 'moon-scar', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reveal', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'Moon-Scar Gu', text: 'A thin violet seam opened across the vessel. The cellar’s shadows bent toward it.', cueAssetIds: ['stone-mechanism'], performanceBeat: { actorId: 'gu-yue-chun', phase: 'after-state', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'ending' } },
    { id: 'ending', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reflection', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'ending', speakerId: 'fang-yuan', label: 'Fate remains open', text: 'A seventy-percent technique was ordinary. A material that learned from failure could change who owned the next winter.', cueAssetIds: [], next: { type: 'end' } },
  ],
};
