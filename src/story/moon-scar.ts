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
  readerInsights: [
    { id: 'crescent-absence-noticed', meaning: 'The three failed cores form a deliberate crescent rather than random loss.' },
    { id: 'chun-contact-distance-noticed', meaning: 'Chun keeps her covered fingertips away from the sealed cores before explaining why.' },
    { id: 'fang-leverage-understood', meaning: 'Fang values a repeatable learning material more than one successful refinement.' },
    { id: 'chun-warning-understood', meaning: 'Chun treats discovery as evidence, not permission to continue.' },
  ],
  assets: [
    { id: 'cleft-bg', kind: 'background', sourcePath: `${generated}/mountain-cleft-stage-v3.jpg`, sha256: '6fcfd2ad2723ded696fb7e0c08dde5b55a2162d5a3e6a819c082e4147b36cc67' },
    { id: 'cellar-bg', kind: 'background', sourcePath: `${generated}/secret-cellar-stage-v3.jpg`, sha256: '4612d2c69b3699d3a703975be3bb6a135aecb507e0f31f156632c8731a4e5bde' },
    { id: 'fang-neutral', kind: 'figure', sourcePath: `${generated}/fang-field-mantle-guarded-v3.png`, sha256: 'fb2edde92160508d19674c44ddf7264f1c6fbfcb021821f61ec89cacbc42e0a3', preparation: normalize },
    { id: 'fang-withheld-touch', kind: 'figure', sourcePath: `${generated}/fang-withheld-touch-v2.png`, sha256: '7d6df9319d6c8b8abc3efbcb59dd6fdc5e2e7356cfcf405e8b5c52f24f86264a', preparation: { ...normalize, matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 } } },
    { id: 'chun-neutral', kind: 'figure', sourcePath: `${generated}/gu-yue-chun-neutral-v2.png`, sha256: 'a343a0837c79508997777d5ed06a4f01729781b4a5c8362f58101688e6972960', preparation: { ...normalize, matteCleanup: { spill: 'magenta', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 14 } } },
    { id: 'chun-disclosure', kind: 'figure', sourcePath: `${generated}/gu-yue-chun-disclosure-eye-fixed-v1.png`, sha256: 'd3832de2e26ebe3ec08c94d9515decd7957749f8ab35312199773eae7320d1a1', preparation: { ...normalize, matteCleanup: { spill: 'magenta', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 14 } } },
    { id: 'chun-held-warning', kind: 'figure', sourcePath: `${generated}/gu-yue-chun-held-warning-v1.png`, sha256: '68ff37476636752dc3f935e440a9282f8f889cb8059eaadcd11f73e9955fb8e7', preparation: { ...normalize, matteCleanup: { spill: 'magenta', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 14 } } },
    { id: 'sealed-substrate', kind: 'artifact', sourcePath: `${generated}/sealed-substrate-v3.png`, sha256: '68e970759a94505f3965a0a60650bd531adfb299f81f77a60f15d19a44081b70' },
    { id: 'moon-scar-gu', kind: 'artifact', sourcePath: `${generated}/moon-scar-gu-v3.png`, sha256: 'ef5e118a551c86fb01cbd09cd346c2013d1842e44818d27daccaaaf051b86640' },
    { id: 'moon-scar-cg', kind: 'cg', sourcePath: `${generated}/moon-scar-revelation-cg-v1.jpg`, sha256: 'a9b98de23c59b5e2f3fac20b33adc4a202e45bb3adb3ca7e1f15d3a3041ecd1a' },
    { id: 'winter-wind', kind: 'ambience', sourcePath: `${base}/audio/ambience/winter-wind.wav`, sha256: 'f8a696b14987176d9b840e147011818d63f3cc4c54592403f640d94b0b69eecc' },
    { id: 'interior-room', kind: 'ambience', sourcePath: `${base}/audio/ambience/interior-room.wav`, sha256: 'b97136cf6eba23c088dd07b3e8a57a316ea8208778f31648e778a1607dd85044' },
    { id: 'tension-drone', kind: 'music', sourcePath: `${base}/audio/music/subterranean-tension-drone-v1.wav`, sha256: 'dd57f7c71b7c01362afad3255390d0ddee3e9ab8a4ffe9a992c514223b410c0c' },
    { id: 'stone-mechanism', kind: 'cue', sourcePath: `${base}/audio/foley/stone-mechanism-v1.wav`, sha256: 'eb8ec3cba42097a523f156f78d95ea9077d2878ad39dd2a88964c37cc2e27c8d' },
    { id: 'cloth-shift', kind: 'cue', sourcePath: `${base}/audio/foley/cloth-shift-v1.wav`, sha256: 'b2c9deb349f3843b222b5365bb5e131a8974a4c1271846b3f517c43d96b70591' },
    { id: 'stone-collection', kind: 'cue', sourcePath: `${base}/audio/foley/small-stone-collection-v1.wav`, sha256: '43ecf5b25a16244110b48185c95e14b7b0f6a90feb101e064a9d2e37a00c0790' },
    { id: 'moon-resonance', kind: 'cue', sourcePath: `${generated}/moon-resonance-v1.wav`, sha256: 'aa425701bc5636c044e04893ce411fda0f418accc9f4ce4bf62f66d88de0b9a1' },
  ],
  actors: [
    { id: 'fang-yuan', name: 'Fang Yuan', identityVersion: 'fang-yuan-v2', defaultAppearanceId: 'field-neutral', stageHeightPercent: 88, appearances: [
      { id: 'field-neutral', assetId: 'fang-neutral', stageName: 'Fang Yuan', wardrobe: 'black-grey-field-robes', expression: 'controlled-neutral', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
      { id: 'leverage-appraisal', assetId: 'fang-neutral', stageName: 'Fang Yuan', wardrobe: 'black-grey-field-robes', expression: 'controlled-neutral', concealment: 'civilian', projection: 'portrait', sourceFacing: 'right' },
      { id: 'withheld-touch', assetId: 'fang-withheld-touch', stageName: 'Fang Yuan', wardrobe: 'black-grey-field-robes', expression: 'withheld-touch', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
    ] },
    { id: 'gu-yue-chun', name: 'Gu Yue Chun', identityVersion: 'gu-yue-chun-v1', defaultAppearanceId: 'field-neutral', stageHeightPercent: 88, appearances: [
      { id: 'field-neutral', assetId: 'chun-neutral', stageName: 'Gu Yue Chun', wardrobe: 'green-field-robes', expression: 'attentive-neutral', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'restrained-disclosure', assetId: 'chun-disclosure', stageName: 'Gu Yue Chun', wardrobe: 'green-field-robes', expression: 'restrained-disclosure', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'held-warning', assetId: 'chun-held-warning', stageName: 'Gu Yue Chun', wardrobe: 'green-field-robes', expression: 'held-warning', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
      { id: 'warning-appraisal', assetId: 'chun-held-warning', stageName: 'Gu Yue Chun', wardrobe: 'green-field-robes', expression: 'held-warning', concealment: 'civilian', projection: 'portrait', sourceFacing: 'left' },
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
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
        { actorId: 'gu-yue-chun', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
      ], artifact: { assetId: 'sealed-substrate', slot: 'center', footprint: 'study' },
    },
    {
      id: 'substrate-fang-active', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'active' },
        { actorId: 'gu-yue-chun', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
      ], artifact: { assetId: 'sealed-substrate', slot: 'center', footprint: 'study' },
    },
    {
      id: 'substrate-held-warning', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
        { actorId: 'gu-yue-chun', appearanceId: 'held-warning', slot: 'far-right', facing: 'left', emphasis: 'active' },
      ], artifact: { assetId: 'sealed-substrate', slot: 'center', footprint: 'study' },
    },
    {
      id: 'substrate-fang-appraisal', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', appearanceId: 'leverage-appraisal', slot: 'left', facing: 'right', emphasis: 'active' },
        { actorId: 'gu-yue-chun', appearanceId: 'held-warning', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
      ], artifact: { assetId: 'sealed-substrate', slot: 'center', footprint: 'study' },
    },
    {
      id: 'substrate-chun-appraisal', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
        { actorId: 'gu-yue-chun', appearanceId: 'warning-appraisal', slot: 'right', facing: 'left', emphasis: 'active' },
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
      cutIn: { assetId: 'moon-scar-cg', framing: 'location-match', representedActorIds: ['fang-yuan', 'gu-yue-chun'], representedArtifactId: 'moon-scar-gu' },
    },
    {
      id: 'moon-scar-aftermath', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'ominous', figures: [
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
        { actorId: 'gu-yue-chun', appearanceId: 'restrained-disclosure', slot: 'far-right', facing: 'left', emphasis: 'active' },
      ], artifact: { assetId: 'moon-scar-gu', slot: 'center', footprint: 'large' },
    },
    {
      id: 'moon-scar-reflection', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'ominous', figures: [
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'active' },
        { actorId: 'gu-yue-chun', appearanceId: 'held-warning', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
      ], artifact: { assetId: 'moon-scar-gu', slot: 'center', footprint: 'large' },
    },
    {
      id: 'moon-scar-restraint', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'ominous', figures: [
        { actorId: 'fang-yuan', appearanceId: 'withheld-touch', slot: 'far-left', facing: 'right', emphasis: 'active' },
        { actorId: 'gu-yue-chun', appearanceId: 'held-warning', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
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
    { id: 'substrate-reveal', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-study', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'Evidence', text: 'Seven sealed cores. Each held one measured layer of moonlit moss and one missing fact.', cueAssetIds: ['stone-collection'], next: { type: 'goto', nodeId: 'evidence-reading-choice' } },
    { id: 'evidence-reading-choice', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-study', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Inspection', text: 'The tally was obvious. The arrangement was not.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'observe', prompt: 'What do you inspect before the question?', options: [
      { id: 'trace-empty-cells', label: 'Trace the three empty cells', consequence: 'Read the shape hidden inside the failed trials.', nodeId: 'crescent-reading', grantsInsightIds: ['crescent-absence-noticed'] },
      { id: 'watch-chun-contact', label: 'Watch Chun’s covered hand', consequence: 'Read the distance she keeps from her own evidence.', nodeId: 'contact-distance-reading', grantsInsightIds: ['chun-contact-distance-noticed'] },
    ] } },
    { id: 'crescent-reading', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-fang-appraisal', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'thought', speakerId: 'fang-yuan', text: 'Three absences curved through the seven successes. Failure had left a shape, and shapes could be repeated.', cueAssetIds: [], next: { type: 'goto', nodeId: 'tally-bound' } },
    { id: 'contact-distance-reading', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-chun-appraisal', viewpoint: { kind: 'private', holderId: 'gu-yue-chun' }, mode: 'thought', speakerId: 'gu-yue-chun', text: 'She kept her fingertips inside the sleeve. He would notice the distance before she decided whether to name its reason.', cueAssetIds: [], next: { type: 'goto', nodeId: 'tally-bound' } },
    { id: 'tally-bound', chapter: 'Chapter 11 · The Result', tableauId: 'cellar-conversation', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'gu-yue-chun', text: 'With this moss as the core substrate: seven successes in ten. Seventy percent.', cueAssetIds: [], next: { type: 'goto', nodeId: 'question-choice' } },
    { id: 'question-choice', chapter: 'Chapter 11 · The Result', tableauId: 'fang-question', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'thought', speakerId: 'fang-yuan', text: 'The number was bait. The useful question was what Chun had chosen not to measure.', cueAssetIds: [], performanceBeat: { actorId: 'fang-yuan', phase: 'decision', importance: 'pivotal' }, next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'interpret', prompt: 'Which accepted passage do you read?', options: [
      { id: 'ask-rank', label: 'Ask what the result becomes at rank two.', consequence: 'Tests the technique’s ceiling.', nodeId: 'rank-question' },
      { id: 'ask-loss', label: 'Ask where the missing thirty percent went.', consequence: 'Tests the accounting.', nodeId: 'loss-question' },
    ] } },
    { id: 'rank-question', chapter: 'Chapter 11 · The Result', tableauId: 'fang-question', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'fang-yuan', text: 'And once the aperture reaches rank two?', cueAssetIds: [], next: { type: 'goto', nodeId: 'rank-chun-private' } },
    { id: 'rank-chun-private', chapter: 'Chapter 11 · The Result', tableauId: 'cellar-conversation', viewpoint: { kind: 'private', holderId: 'gu-yue-chun' }, mode: 'thought', speakerId: 'gu-yue-chun', text: 'He asked for the ceiling before praising the result. To him, success was only the first boundary worth breaking.', cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-answers' } },
    { id: 'loss-question', chapter: 'Chapter 11 · The Result', tableauId: 'fang-question', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'fang-yuan', text: 'The missing three—failure, theft, or transformation?', cueAssetIds: [], next: { type: 'goto', nodeId: 'loss-chun-private' } },
    { id: 'loss-chun-private', chapter: 'Chapter 11 · The Result', tableauId: 'cellar-conversation', viewpoint: { kind: 'private', holderId: 'gu-yue-chun' }, mode: 'thought', speakerId: 'gu-yue-chun', text: 'He had heard the word missing. Not failed. The omission had told him where the real result was buried.', cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-answers' } },
    { id: 'chun-answers', chapter: 'Chapter 11 · The Result', tableauId: 'cellar-disclosure', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'gu-yue-chun', text: 'Neither. The moss was not consumed. It was teaching the stone to remember moonlight.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'question-choice', optionId: 'ask-rank' }, text: 'At rank two, the yield may rise. But that is not the result. The moss was teaching the stone to remember moonlight.' },
      { when: { kind: 'active-choice', choiceNodeId: 'question-choice', optionId: 'ask-loss' }, text: 'The missing three did not fail. The moss was not consumed. It was teaching the stone to remember moonlight.' },
    ], cueAssetIds: [], performanceBeat: { actorId: 'gu-yue-chun', phase: 'decision', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'inspection-returns' } },
    { id: 'inspection-returns', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-held-warning', viewpoint: { kind: 'public' }, mode: 'action', label: 'The first clue', text: 'The seven sealed cores remained where Chun had placed them. Her explanation made their arrangement harder to ignore.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['crescent-absence-noticed'] }, text: 'The three dark cells completed a crescent through the seven sealed cores. Chun’s explanation turned absence into a record of motion.' },
      { when: { kind: 'reader-insights', insightIds: ['chun-contact-distance-noticed'] }, text: 'Chun kept one hand half-hidden beside her sleeve. Her explanation had not reduced the distance she kept from the cores.' },
      { when: { kind: 'reader-insights', insightIds: ['crescent-absence-noticed', 'chun-contact-distance-noticed'] }, text: 'The three dark cells formed a crescent while Chun kept one hand half-hidden beside her sleeve. Pattern and caution occupied the same evidence.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'reliquary-reading-choice' } },
    { id: 'reliquary-reading-choice', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-study', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Reading', text: 'The same result offered leverage to one witness and warning to the other.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'interpret', prompt: 'Whose reading do you carry into the reveal?', options: [
      { id: 'read-fang-calculation', label: 'Fang Yuan · leverage', consequence: 'Read why a repeatable anomaly matters more than one successful refinement.', nodeId: 'fang-leverage-private', grantsInsightIds: ['fang-leverage-understood'] },
      { id: 'read-chun-warning', label: 'Gu Yue Chun · warning', consequence: 'Read why the person who made the discovery keeps her distance from it.', nodeId: 'chun-warning-private', grantsInsightIds: ['chun-warning-understood'] },
      { id: 'hold-leverage-warning', label: 'Hold leverage and warning', consequence: 'Available because you have read both appraisals without lending either to the other character.', nodeId: 'moon-scar-synthesis', requiresInsightIds: ['fang-leverage-understood', 'chun-warning-understood'] },
    ] } },
    { id: 'fang-leverage-private', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-fang-appraisal', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'thought', speakerId: 'fang-yuan', text: 'A successful recipe could be copied. A material that learned from every failure could improve itself—and whoever controlled its trials would control the advantage.', cueAssetIds: [], next: { type: 'goto', nodeId: 'moon-scar' } },
    { id: 'chun-warning-private', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-chun-appraisal', viewpoint: { kind: 'private', holderId: 'gu-yue-chun' }, mode: 'thought', speakerId: 'gu-yue-chun', text: 'She had brought him proof, yet kept the stone beyond her own reach. Discovery was not the same as permission to continue.', cueAssetIds: [], next: { type: 'goto', nodeId: 'moon-scar' } },
    { id: 'moon-scar-synthesis', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-held-warning', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Two readings', text: 'The seam was an advantage and a warning at once. The reader could hold both; neither cultivator possessed the other’s private reason.', readingVariants: [
      { when: { kind: 'reader-insight-order', insightIds: ['fang-leverage-understood', 'chun-warning-understood'] }, text: 'Leverage appeared first: a material that learned could compound power. Chun’s warning then revised its price. The reader held both; neither cultivator gained the other’s reason.', tableauId: 'substrate-fang-appraisal' },
      { when: { kind: 'reader-insight-order', insightIds: ['chun-warning-understood', 'fang-leverage-understood'] }, text: 'Warning appeared first: discovery was not permission. Fang’s leverage then revealed why caution alone would not bury it. The reader held both; neither cultivator gained the other’s reason.', tableauId: 'substrate-chun-appraisal' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'two-measures' } },
    { id: 'two-measures', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-study', viewpoint: { kind: 'public' }, mode: 'action', label: 'Two measures', text: 'Fang measured how many winters the discovery could buy. Chun measured which experiment must never be repeated. The vessel answered neither of them.', cueAssetIds: [], next: { type: 'goto', nodeId: 'moon-scar' } },
    { id: 'moon-scar', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reveal', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'Moon-Scar Gu', text: 'A thin violet seam opened across the vessel. The cellar’s shadows bent toward it.', cueAssetIds: ['moon-resonance'], performanceBeat: { actorId: 'gu-yue-chun', phase: 'after-state', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'chun-hesitates' } },
    { id: 'chun-hesitates', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-aftermath', viewpoint: { kind: 'public' }, mode: 'action', label: 'Aftermath', text: 'Chun’s hand hovered above the seam. She had brought him a result; the distance she kept from it made the result a warning.', cueAssetIds: [], next: { type: 'goto', nodeId: 'fang-conduct-forecast' } },
    { id: 'fang-conduct-forecast', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reflection', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Your reading', text: 'The seam would not remain open. Fang Yuan had time for one revealing movement.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'predict', prompt: 'What do you expect him to do?', options: [
      { id: 'expect-seize', label: 'Touch the seam before it closes', consequence: 'Test whether advantage outranks contamination.', nodeId: 'forecast-seize' },
      { id: 'expect-preserve', label: 'Preserve the evidence untouched', consequence: 'Test whether patience can be the more ruthless move.', nodeId: 'forecast-preserve' },
    ] } },
    { id: 'forecast-seize', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-fang-appraisal', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Prediction', text: 'You expected his hand to close on the advantage before Chun could withdraw it.', cueAssetIds: [], next: { type: 'goto', nodeId: 'fang-does-not-touch' } },
    { id: 'forecast-preserve', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-chun-appraisal', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Prediction', text: 'You expected him to treat the unspent failure as more valuable than one immediate touch.', cueAssetIds: [], next: { type: 'goto', nodeId: 'fang-does-not-touch' } },
    { id: 'fang-does-not-touch', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-restraint', viewpoint: { kind: 'public' }, mode: 'action', label: 'Restraint', text: 'Fang Yuan studied the seam without touching it. The pause made Chun look at him again.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'reliquary-reading-choice', optionId: 'read-fang-calculation' }, text: 'Fang Yuan studied the seam without touching it, already measuring how many trials would turn an anomaly into leverage.' },
      { when: { kind: 'active-choice', choiceNodeId: 'reliquary-reading-choice', optionId: 'read-chun-warning' }, text: 'Fang Yuan did not touch the seam. Chun’s distance from her own discovery became part of the evidence.' },
      { when: { kind: 'active-choice', choiceNodeId: 'reliquary-reading-choice', optionId: 'hold-leverage-warning' }, text: 'Fang Yuan did not touch the seam. His stillness and Chun’s distance held leverage and warning in the same frame.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'conduct-prediction-settles' } },
    { id: 'conduct-prediction-settles', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-restraint', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Prediction answered', text: 'The untouched seam made patience visible as a form of control.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'fang-conduct-forecast', optionId: 'expect-seize' }, text: 'You had expected Fang to seize the advantage. His still hand revised the reading: possession could begin by preserving the only failed trial that could teach him more.' },
      { when: { kind: 'active-choice', choiceNodeId: 'fang-conduct-forecast', optionId: 'expect-preserve' }, text: 'Your prediction held, but its motive sharpened. Fang preserved the evidence not from caution, but because one repeatable failure promised more power than a fading seam.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'trial-decision' } },
    { id: 'trial-decision', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reflection', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Decision', text: 'Preserving the discovery was not enough. Tomorrow’s trial needed a constraint that would survive the appetite of whoever ordered it.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'decide', prompt: 'Which safeguard must the order make concrete?', options: [
      { id: 'choose-untouched-original', label: 'Preserve an untouched original', consequence: 'Require every experiment to work from a copy, leaving one failure unchanged as evidence.', nodeId: 'untouched-original-reading' },
      { id: 'choose-split-custody', label: 'Split custody from command', consequence: 'Let Fang direct the trial while Chun retains the sealed source and the key.', nodeId: 'split-custody-reading' },
    ] } },
    { id: 'untouched-original-reading', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-fang-appraisal', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'thought', speakerId: 'fang-yuan', text: 'A result could be forged after the fact. An untouched failure would remain a witness against every convenient explanation the next trial produced.', cueAssetIds: [], next: { type: 'goto', nodeId: 'seal-order' } },
    { id: 'split-custody-reading', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-chun-appraisal', viewpoint: { kind: 'private', holderId: 'gu-yue-chun' }, mode: 'thought', speakerId: 'gu-yue-chun', text: 'If command and custody stayed in one hand, caution would last only until ambition found a private room. The key must remain elsewhere.', cueAssetIds: [], next: { type: 'goto', nodeId: 'seal-order' } },
    { id: 'seal-order', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reflection', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'fang-yuan', text: 'Seal the original. You keep the key. Tomorrow, show me the first failed core—and we work from a copy.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'trial-decision', optionId: 'choose-untouched-original' }, text: '“Seal the original,” Fang said. “You keep the key. Tomorrow, show me the first failed core—and we work from a copy.” The failure would remain capable of contradicting them.' },
      { when: { kind: 'active-choice', choiceNodeId: 'trial-decision', optionId: 'choose-split-custody' }, text: '“Seal the original. You keep the key,” Fang said. “Tomorrow, show me the first failed core—and we work from a copy.” He kept command without taking custody.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-tests-order' } },
    { id: 'chun-tests-order', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-aftermath', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'gu-yue-chun', text: 'And if the copy learns faster than the original?', cueAssetIds: [], next: { type: 'goto', nodeId: 'fang-keeps-failure' } },
    { id: 'fang-keeps-failure', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-restraint', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'thought', speakerId: 'fang-yuan', text: 'She was not asking about moss. She wanted to know whether his restraint survived the moment restraint became expensive.', cueAssetIds: [], next: { type: 'goto', nodeId: 'fang-answers-cost' } },
    { id: 'fang-answers-cost', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reflection', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'fang-yuan', text: 'Then the difference becomes the result. We record it before we use it.', cueAssetIds: [], next: { type: 'goto', nodeId: 'scar-closes' } },
    { id: 'scar-closes', chapter: 'Chapter 11 · The Result', tableauId: 'substrate-held-warning', viewpoint: { kind: 'public' }, mode: 'action', label: 'Seal', text: 'Chun lowered the mineral lid. Violet light narrowed to a thread, then vanished beneath blank paper and dark stone.', cueAssetIds: ['stone-collection'], next: { type: 'goto', nodeId: 'key-remains' } },
    { id: 'key-remains', chapter: 'Chapter 11 · The Result', tableauId: 'cellar-disclosure', viewpoint: { kind: 'public' }, mode: 'action', label: 'Custody', text: 'The key disappeared into Chun’s sleeve. Fang watched the motion and did not ask for it.', cueAssetIds: ['cloth-shift'], next: { type: 'goto', nodeId: 'ending' } },
    { id: 'ending', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reflection', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'ending', speakerId: 'fang-yuan', label: 'Fate remains open', text: 'A seventy-percent technique was ordinary. A material that learned from failure could change who owned the next winter. More useful still was a witness another hand could keep.', cueAssetIds: [], next: { type: 'end' } },
  ],
};
