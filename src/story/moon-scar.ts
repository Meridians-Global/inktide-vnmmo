import type { Experience } from '../core/contracts';

const base = 'assets/stage-kit';

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
    { id: 'cleft-bg', kind: 'background', sourcePath: `${base}/locations/mountain-cleft-chamber/candidates/background-plate-v2.png`, sha256: '7901ddccbebc4766a36fdb3889e3f909812778e8a3e8cb2b8a1a4322ad845822' },
    { id: 'cellar-bg', kind: 'background', sourcePath: `${base}/locations/gu-yue-chun-secret-cellar/candidates/background-plate-imagegen-v1.png`, sha256: '26e37171d18ba861d7bc69752edb287b368309830dba130f30dc66052be2175b' },
    { id: 'fang-neutral', kind: 'figure', sourcePath: `${base}/characters/fang-yuan/candidates/high-detail-transparent-v1.png`, sha256: '26cce8d9ad66257dd31b1791633902d3a42144bd49464af5d7073a9582886e2a', preparation: { kind: 'figure-normalize', recipeVersion: 1, canvas: { width: 896, height: 1024 }, subjectBox: { width: 850, height: 960 }, bottomPadding: 24 } },
    { id: 'chun-neutral', kind: 'figure', sourcePath: `${base}/characters/gu-yue-chun/candidates/canonical-transparent-v1.png`, sha256: '85187b4d8ca7a169bd5bb75fd94200d063db91bec8adc918c21b276bc93d4b4e', preparation: { kind: 'figure-normalize', recipeVersion: 1, canvas: { width: 896, height: 1024 }, subjectBox: { width: 850, height: 960 }, bottomPadding: 24 } },
    { id: 'sealed-substrate', kind: 'artifact', sourcePath: `${base}/props/moonlit-moss-lineage/candidates/states-imagegen-v2/sealed-substrate.png`, sha256: 'e35a7dd821ec26b2e9e0ddb824b3e006602c3f3644f799824ddf8efa85d4a39c' },
    { id: 'moon-scar-gu', kind: 'artifact', sourcePath: `${base}/props/moonlit-moss-lineage/candidates/states-imagegen-v2/moon-scar-gu.png`, sha256: 'ce900a2efd20e21fc7a3ac6de5f6d623ceec8b04e5be1b99c20ce757ee15b04a' },
    { id: 'winter-wind', kind: 'ambience', sourcePath: `${base}/audio/ambience/winter-wind.wav`, sha256: 'f8a696b14987176d9b840e147011818d63f3cc4c54592403f640d94b0b69eecc' },
    { id: 'interior-room', kind: 'ambience', sourcePath: `${base}/audio/ambience/interior-room.wav`, sha256: 'b97136cf6eba23c088dd07b3e8a57a316ea8208778f31648e778a1607dd85044' },
    { id: 'tension-drone', kind: 'music', sourcePath: `${base}/audio/music/subterranean-tension-drone-v1.wav`, sha256: 'dd57f7c71b7c01362afad3255390d0ddee3e9ab8a4ffe9a992c514223b410c0c' },
    { id: 'stone-mechanism', kind: 'cue', sourcePath: `${base}/audio/foley/stone-mechanism-v1.wav`, sha256: 'eb8ec3cba42097a523f156f78d95ea9077d2878ad39dd2a88964c37cc2e27c8d' },
    { id: 'cloth-shift', kind: 'cue', sourcePath: `${base}/audio/foley/cloth-shift-v1.wav`, sha256: 'b2c9deb349f3843b222b5365bb5e131a8974a4c1271846b3f517c43d96b70591' },
    { id: 'stone-collection', kind: 'cue', sourcePath: `${base}/audio/foley/small-stone-collection-v1.wav`, sha256: '43ecf5b25a16244110b48185c95e14b7b0f6a90feb101e064a9d2e37a00c0790' },
  ],
  actors: [
    { id: 'fang-yuan', name: 'Fang Yuan', identityVersion: 'fang-yuan-v2', defaultAppearanceId: 'field-neutral', stageHeightPercent: 67, appearances: [
      { id: 'field-neutral', assetId: 'fang-neutral', stageName: 'Fang Yuan', wardrobe: 'black-grey-field-robes', expression: 'controlled-neutral', concealment: 'civilian', projection: 'full-body', sourceFacing: 'right' },
    ] },
    { id: 'gu-yue-chun', name: 'Gu Yue Chun', identityVersion: 'gu-yue-chun-v1', defaultAppearanceId: 'field-neutral', stageHeightPercent: 67, appearances: [
      { id: 'field-neutral', assetId: 'chun-neutral', stageName: 'Gu Yue Chun', wardrobe: 'green-field-robes', expression: 'attentive-neutral', concealment: 'civilian', projection: 'full-body', sourceFacing: 'left' },
    ] },
  ],
  tableaux: [
    {
      id: 'cleft-establishing', location: 'Mountain Cleft · Unregistered Harvest', backgroundAssetId: 'cleft-bg', ambienceAssetId: 'winter-wind', shot: 'wide', tone: 'cold', figures: [],
    },
    {
      id: 'cleft-chun-active', location: 'Mountain Cleft · Unregistered Harvest', backgroundAssetId: 'cleft-bg', ambienceAssetId: 'winter-wind', shot: 'conversation', tone: 'cold', figures: [
        { actorId: 'fang-yuan', slot: 'left', facing: 'right', emphasis: 'supporting' },
        { actorId: 'gu-yue-chun', slot: 'right', facing: 'left', emphasis: 'active' },
      ],
    },
    {
      id: 'cleft-fang-active', location: 'Mountain Cleft · Unregistered Harvest', backgroundAssetId: 'cleft-bg', ambienceAssetId: 'winter-wind', shot: 'conversation', tone: 'cold', figures: [
        { actorId: 'fang-yuan', slot: 'left', facing: 'right', emphasis: 'active' },
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
      id: 'substrate-study', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'recessed' },
        { actorId: 'gu-yue-chun', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
      ], artifact: { assetId: 'sealed-substrate', slot: 'center', footprint: 'study' },
    },
    {
      id: 'fang-question', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'conversation', tone: 'intimate', figures: [
        { actorId: 'fang-yuan', slot: 'left', facing: 'right', emphasis: 'active' },
        { actorId: 'gu-yue-chun', slot: 'right', facing: 'left', emphasis: 'supporting' },
      ],
    },
    {
      id: 'moon-scar-reveal', location: 'Gu Yue Clan · Chun’s Cellar', backgroundAssetId: 'cellar-bg', ambienceAssetId: 'interior-room', musicAssetId: 'tension-drone', shot: 'artifact', tone: 'ominous', figures: [
        { actorId: 'fang-yuan', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
        { actorId: 'gu-yue-chun', slot: 'far-right', facing: 'left', emphasis: 'active' },
      ], artifact: { assetId: 'moon-scar-gu', slot: 'center', footprint: 'large' },
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
    { id: 'question-choice', chapter: 'Chapter 11 · The Result', tableauId: 'fang-question', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'thought', speakerId: 'fang-yuan', text: 'The number was bait. The useful question was what Chun had chosen not to measure.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', prompt: 'Which accepted passage do you read?', options: [
      { id: 'ask-rank', label: 'Ask what the result becomes at rank two.', consequence: 'Tests the technique’s ceiling.', nodeId: 'rank-question' },
      { id: 'ask-loss', label: 'Ask where the missing thirty percent went.', consequence: 'Tests the accounting.', nodeId: 'loss-question' },
    ] } },
    { id: 'rank-question', chapter: 'Chapter 11 · The Result', tableauId: 'fang-question', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'fang-yuan', text: 'And once the aperture reaches rank two?', cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-answers' } },
    { id: 'loss-question', chapter: 'Chapter 11 · The Result', tableauId: 'fang-question', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'fang-yuan', text: 'The missing three—failure, theft, or transformation?', cueAssetIds: [], next: { type: 'goto', nodeId: 'chun-answers' } },
    { id: 'chun-answers', chapter: 'Chapter 11 · The Result', tableauId: 'cellar-conversation', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'gu-yue-chun', text: 'Neither. The moss was not consumed. It was teaching the stone to remember moonlight.', cueAssetIds: [], next: { type: 'goto', nodeId: 'moon-scar' } },
    { id: 'moon-scar', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reveal', viewpoint: { kind: 'public' }, mode: 'artifact', label: 'Moon-Scar Gu', text: 'A thin violet seam opened across the vessel. The cellar’s shadows bent toward it.', cueAssetIds: ['stone-mechanism'], next: { type: 'goto', nodeId: 'ending' } },
    { id: 'ending', chapter: 'Chapter 11 · The Result', tableauId: 'moon-scar-reflection', viewpoint: { kind: 'private', holderId: 'fang-yuan' }, mode: 'ending', speakerId: 'fang-yuan', label: 'Fate remains open', text: 'A seventy-percent technique was ordinary. A material that learned from failure could change who owned the next winter.', cueAssetIds: [], next: { type: 'end' } },
  ],
};
