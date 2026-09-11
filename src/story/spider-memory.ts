import type { Experience } from '../core/contracts';

const generated = 'vn-lab-assets/spider-man-memory-between-us-v1';
const stageKit = 'meridians-stage-kit/assets';
const normalize = {
  kind: 'figure-normalize' as const,
  recipeVersion: 1 as const,
  canvas: { width: 896, height: 1024 },
  subjectBox: { width: 850, height: 960 },
  bottomPadding: 24,
};

export const spiderMemoryExperience: Experience = {
  schemaVersion: 2,
  id: 'spider-memory-between-us-v1',
  title: 'The Memory Between Us',
  subtitle: 'A dual-identity visual-novel rehearsal',
  posture: 'catch-up',
  source: {
    domainId: 'N-IMP-mtwby1q31jbg',
    branchId: 'BRN-SPI-MAIN',
    asOfEntryId: 'SCN-SPI-16',
    sourceSha256: '930e7e571a364a00453a054513a7000a44453052c4cce7a5dafae592e1cd3a2d',
    note: 'Presentation-only reconstruction of Scene 16. Traversal changes reading perspective, never Domain state.',
  },
  startNodeId: 'rain-location',
  assets: [
    { id: 'mj-apartment', kind: 'background', sourcePath: `${generated}/mj-apartment-stage-crop-v1.png`, sha256: '5f3b25e81b7ee78e9b8b5655bd7aa42b3ea3863379ba3b1dc61c85e633332aa8' },
    { id: 'peter-civilian', kind: 'figure', sourcePath: `${generated}/peter-civilian-guarded.png`, sha256: 'cdb2f9a35f688f92745b9a9ce9902fd0a2ed5050f7b152904d1148d106cdfc64', preparation: normalize },
    { id: 'peter-masked', kind: 'figure', sourcePath: `${generated}/peter-spider-masked.png`, sha256: 'f1dabc95b76c58e2933dbfff9a4b1fadaccf12b8bc563446c649e4c584025ff6', preparation: normalize },
    { id: 'peter-revealed', kind: 'figure', sourcePath: `${generated}/peter-spider-revealed.png`, sha256: '0957f3da81aae82ad29406acd6dd2ad6c62e3a266b60a1e54e4bb517c04c6743', preparation: normalize },
    { id: 'mj-guarded', kind: 'figure', sourcePath: `${generated}/mj-guarded.png`, sha256: '9b0a15ecd6ca5c8157c69a9449094a06f49672f48430ed8d1a848f31f9c6d310', preparation: { ...normalize, matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 } } },
    { id: 'interior-room', kind: 'ambience', sourcePath: `${stageKit}/audio/ambience/interior-room.wav`, sha256: 'b97136cf6eba23c088dd07b3e8a57a316ea8208778f31648e778a1607dd85044' },
    { id: 'cloth-shift', kind: 'cue', sourcePath: `${stageKit}/audio/foley/cloth-shift-v1.wav`, sha256: 'b2c9deb349f3843b222b5365bb5e131a8974a4c1271846b3f517c43d96b70591' },
  ],
  actors: [
    {
      id: 'peter-parker', name: 'Peter Parker', identityVersion: 'peter-parker-v1', defaultAppearanceId: 'civilian-guarded', stageHeightPercent: 68,
      appearances: [
        { id: 'civilian-guarded', assetId: 'peter-civilian', stageName: 'Peter Parker', wardrobe: 'civilian-blue-overshirt', expression: 'guarded-fatigue', concealment: 'civilian', projection: 'full-body', sourceFacing: 'left' },
        { id: 'spider-masked', assetId: 'peter-masked', stageName: 'Spider-Man', wardrobe: 'damaged-spider-suit', expression: 'guarded-injury', concealment: 'masked', projection: 'full-body', sourceFacing: 'left' },
        { id: 'spider-revealed', assetId: 'peter-revealed', stageName: 'Peter Parker', wardrobe: 'damaged-spider-suit', expression: 'vulnerable-honesty', concealment: 'revealed', projection: 'full-body', sourceFacing: 'left' },
      ],
    },
    {
      id: 'mj', name: 'MJ', identityVersion: 'mj-v1', defaultAppearanceId: 'guarded-listening', stageHeightPercent: 68,
      appearances: [
        { id: 'guarded-listening', assetId: 'mj-guarded', stageName: 'MJ', wardrobe: 'olive-jacket', expression: 'guarded-listening', concealment: 'civilian', projection: 'full-body', sourceFacing: 'right' },
      ],
    },
  ],
  tableaux: [
    { id: 'apartment-empty', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', ambienceAssetId: 'interior-room', shot: 'wide', tone: 'intimate', figures: [] },
    { id: 'masked-two-shot', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', ambienceAssetId: 'interior-room', shot: 'conversation', tone: 'cold', figures: [
      { actorId: 'mj', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-masked', slot: 'right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'masked-peter-active', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', ambienceAssetId: 'interior-room', shot: 'conversation', tone: 'cold', figures: [
      { actorId: 'mj', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'peter-parker', appearanceId: 'spider-masked', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'revealed-peter-active', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', ambienceAssetId: 'interior-room', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mj', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'revealed-mj-active', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', ambienceAssetId: 'interior-room', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mj', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'right', facing: 'left', emphasis: 'supporting' },
    ] },
  ],
  moments: [
    { id: 'rain-location', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'apartment-empty', viewpoint: { kind: 'public' }, mode: 'location', label: 'Night', text: 'Rain softened the city beyond MJ’s window. Inside, there was nowhere for either of them to hide.', cueAssetIds: [], next: { type: 'goto', nodeId: 'distance' } },
    { id: 'distance', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-two-shot', viewpoint: { kind: 'public' }, mode: 'action', label: 'Distance', text: 'She kept the couch between them. Spider-Man stayed by the door, injured and careful not to come closer.', cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-boundary' } },
    { id: 'mj-boundary', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-two-shot', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mj', text: 'You remember a life with me. I remember a stranger making choices for me.', cueAssetIds: [], next: { type: 'goto', nodeId: 'peter-mask-thought' } },
    { id: 'peter-mask-thought', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-peter-active', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'thought', speakerId: 'peter-parker', text: 'The mask made danger simple. Peter Parker was the part that could still ask to be forgiven.', cueAssetIds: [], next: { type: 'goto', nodeId: 'peter-protection' } },
    { id: 'peter-protection', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-peter-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'peter-parker', text: 'I came to warn you, not to make you believe me. What happened to your memory was my decision—and it was wrong.', cueAssetIds: [], next: { type: 'goto', nodeId: 'unmask' } },
    { id: 'unmask', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-active', viewpoint: { kind: 'public' }, mode: 'action', label: 'Revelation', text: 'He removed the mask. The hero did not leave; he became visibly human.', cueAssetIds: ['cloth-shift'], next: { type: 'goto', nodeId: 'name' } },
    { id: 'name', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'peter-parker', text: 'My name is Peter Parker. I loved you before the spell. That truth belongs to me; it does not obligate you.', cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-sees' } },
    { id: 'mj-sees', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-active', viewpoint: { kind: 'private', holderId: 'mj' }, mode: 'thought', speakerId: 'mj', text: 'His face carried the grief of recognition. Mine could only answer with sympathy.', cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-answer' } },
    { id: 'mj-answer', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mj', text: 'I can understand why the girl in your memories loved you. But I am standing here without them.', cueAssetIds: [], next: { type: 'goto', nodeId: 'perspective-choice' } },
    { id: 'perspective-choice', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-active', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Reading', text: 'The same silence held two different losses.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', prompt: 'Whose accepted perspective do you read?', options: [
      { id: 'read-peter', label: 'Peter · the cost of restraint', consequence: 'Read the truth he chooses not to use as leverage.', nodeId: 'peter-restraint' },
      { id: 'read-mj', label: 'MJ · the boundary of memory', consequence: 'Read the life she refuses to counterfeit.', nodeId: 'mj-boundary-private' },
    ] } },
    { id: 'peter-restraint', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-active', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'thought', speakerId: 'peter-parker', text: 'Love could explain why he stayed. It could not grant permission to decide for her again.', cueAssetIds: [], next: { type: 'goto', nodeId: 'shared-silence' } },
    { id: 'mj-boundary-private', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-active', viewpoint: { kind: 'private', holderId: 'mj' }, mode: 'thought', speakerId: 'mj', text: 'Being grateful for his sacrifice did not require inheriting another woman’s answer.', cueAssetIds: [], next: { type: 'goto', nodeId: 'shared-silence' } },
    { id: 'shared-silence', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-active', viewpoint: { kind: 'public' }, mode: 'action', label: 'Silence', text: 'Peter lowered the mask. MJ did not step back, but she did not close the distance.', cueAssetIds: [], next: { type: 'goto', nodeId: 'ride-home' } },
    { id: 'ride-home', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mj', text: 'I still need to get home. Can you take me?', cueAssetIds: [], next: { type: 'goto', nodeId: 'ending' } },
    { id: 'ending', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-active', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'ending', speakerId: 'peter-parker', label: 'What remains', text: 'He could protect her without possessing her answer. For tonight, that had to be enough.', cueAssetIds: [], next: { type: 'end' } },
  ],
};
