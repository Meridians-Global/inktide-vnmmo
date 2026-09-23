import type { Experience } from '../core/contracts';
import { withVoiceLines } from '../core/voice-cast';
import { spiderMemoryVoiceLines } from './generated/spider-memory.voices';

const generated = 'assets/generated/spider-man-memory-between-us-v1';
const stageKit = 'assets/stage-kit';
const normalize = {
  kind: 'figure-normalize' as const,
  recipeVersion: 1 as const,
  canvas: { width: 896, height: 1024 },
  subjectBox: { width: 850, height: 960 },
  bottomPadding: 24,
};
const rainAtWindow = { kind: 'rain' as const, layer: 'back' as const, region: { left: 28, top: 10, width: 29, height: 64 }, intensity: 24, seed: 1616 };

const authored: Experience = {
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
  readerInsights: [
    { id: 'threshold-distance-noticed', standing: 'grounded', meaning: 'Peter keeps the exit available so MJ never has to move around him.' },
    { id: 'mj-grip-noticed', standing: 'grounded', meaning: 'MJ holds her jacket seam as a private boundary she can release only by choice.' },
    { id: 'peter-restraint-understood', standing: 'grounded', meaning: 'Peter recognizes that love cannot authorize another decision on MJ’s behalf.' },
    { id: 'mj-memory-boundary-understood', standing: 'grounded', meaning: 'MJ can honour Peter’s sacrifice without inheriting the erased relationship.' },
    { id: 'name-as-plea-assumed', standing: 'mistaken', meaning: 'You heard the name as a request for recognition rather than a return of evidence.' },
    { id: 'mj-owes-assumed', standing: 'mistaken', meaning: 'You read MJ’s stillness as a debt being counted toward the man who erased himself for her.' },
    { id: 'peter-pleads-assumed', standing: 'mistaken', meaning: 'You expected Peter to ask her to try to remember.' },
    { id: 'rescue-as-care-assumed', standing: 'mistaken', meaning: 'You took the spectacular route home for the more caring one.' },
  ],
  assets: [
    { id: 'mj-apartment', kind: 'background', sourcePath: `${generated}/mj-apartment-stage-crop-v1.png`, sha256: '5f3b25e81b7ee78e9b8b5655bd7aa42b3ea3863379ba3b1dc61c85e633332aa8' },
    { id: 'apartment-hallway', kind: 'background', sourcePath: `${generated}/apartment-hallway-night-v4.jpg`, sha256: '69670baac88885f3c7b046477442095178309fcf7b5560aba6247cfd63f83955' },
    { id: 'peter-civilian', kind: 'figure', sourcePath: `${generated}/peter-civilian-guarded.png`, sha256: 'cdb2f9a35f688f92745b9a9ce9902fd0a2ed5050f7b152904d1148d106cdfc64', preparation: normalize },
    { id: 'peter-masked', kind: 'figure', sourcePath: `${generated}/peter-spider-masked.png`, sha256: 'f1dabc95b76c58e2933dbfff9a4b1fadaccf12b8bc563446c649e4c584025ff6', preparation: normalize },
    { id: 'peter-revealed', kind: 'figure', sourcePath: `${generated}/peter-spider-revealed.png`, sha256: '0957f3da81aae82ad29406acd6dd2ad6c62e3a266b60a1e54e4bb517c04c6743', preparation: normalize },
    { id: 'peter-choice-staying', kind: 'figure', sourcePath: `${generated}/peter-choice-returned-staying-v3.png`, sha256: '4e87dbaa1e49422daf28964e0760cea28ff11ea5dba860345b2e8fa3166e0c32', preparation: { ...normalize, matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18, lightFringe: { minChannel: 220, maxChroma: 36, passes: 3 }, alphaErodePasses: 6 } } },
    { id: 'mj-guarded', kind: 'figure', sourcePath: `${generated}/mj-guarded-eye-refined-v3.png`, sha256: 'cf4ab5dd9777159677ec9bd84a6404e938692e0fde209a0142db1b2edbe42751', preparation: { ...normalize, matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 } } },
    { id: 'mj-conflicted', kind: 'figure', sourcePath: `${generated}/mj-conflicted-boundary-eye-refined-v2.png`, sha256: '0450ea37f0c50fe80ae0a02a9054c07bc6b7e5feb955f3da4386a0c556a28d9f', preparation: { ...normalize, matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 } } },
    { id: 'mj-trust', kind: 'figure', sourcePath: `${generated}/mj-reluctant-trust-eye-refined-v1.png`, sha256: 'ef4b02084577485c232a683caffdfd9e80a67b7703826e166f1562605bdfa644', preparation: { ...normalize, matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 } } },
    { id: 'mj-choice-listening', kind: 'figure', sourcePath: `${generated}/mj-choice-returned-listening-v1.png`, sha256: 'a248fc1bc2eaf894f9d27e28b10a6212f1cd909c4e2ddcf6744537758ef2f270', preparation: { ...normalize, matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 } } },
    { id: 'spider-unmask-cg', kind: 'cg', sourcePath: `${generated}/spider-unmask-revelation-cg-v4a.jpg`, sha256: '8d7c3389c6943b2e521c9a968023c90cec7f0a0086f023f9d4b7e450cc6cfd8a' },
    { id: 'rain-window', kind: 'ambience', sourcePath: `${generated}/rain-at-window-v1.wav`, sha256: 'f42d5166588b5af6ee40ef321aaeb2e2ecc09c6d1427c347e07acaa27c9d2dcc' },
    { id: 'cloth-shift', kind: 'cue', sourcePath: `${stageKit}/audio/foley/cloth-shift-v1.wav`, sha256: 'b2c9deb349f3843b222b5365bb5e131a8974a4c1271846b3f517c43d96b70591' },
    { id: 'distant-siren', kind: 'cue', sourcePath: `${generated}/distant-siren-v1.wav`, sha256: '52b83fdab791d42e6568693ac86a7216f8991de053975982535d22899c707860' },
    { id: 'between-us-theme', kind: 'music', sourcePath: `${generated}/score/between-us-theme.mp3`, sha256: '89c120217129f9347e66eb06f750f6eb54353e1aaf0cce2278e25be2e3678caf' },
    { id: 'stairs-resolve', kind: 'music', sourcePath: `${generated}/score/stairs-resolve.mp3`, sha256: 'b96d48a09873afc1ce4ff06c4df9aa5d9507747aaa85fccc42caba27b7bc2581' },
    { id: 'mask-pull', kind: 'cue', sourcePath: `${generated}/score/mask-pull.wav`, sha256: '657535e1418f09574ddb8a3b8be3140bfd1ca314a302163e92c1ce61a73ee697' },
    { id: 'door-latch', kind: 'cue', sourcePath: `${generated}/score/door-latch.wav`, sha256: 'a276471a30159b135194ee390345968b0fa98c4ff01017cf6d1fc39058978789' },
  ],
  actors: [
    {
      id: 'peter-parker', name: 'Peter Parker', identityVersion: 'peter-parker-v1', defaultAppearanceId: 'civilian-guarded', stageHeightPercent: 88,
      appearances: [
        { id: 'civilian-guarded', assetId: 'peter-civilian', stageName: 'Peter Parker', wardrobe: 'civilian-blue-overshirt', expression: 'guarded-fatigue', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
        { id: 'spider-masked', assetId: 'peter-masked', stageName: 'Spider-Man', wardrobe: 'damaged-spider-suit', expression: 'guarded-injury', concealment: 'masked', projection: 'three-quarter', sourceFacing: 'left' },
        { id: 'spider-revealed', assetId: 'peter-revealed', stageName: 'Peter Parker', wardrobe: 'damaged-spider-suit', expression: 'vulnerable-honesty', concealment: 'revealed', projection: 'three-quarter', sourceFacing: 'left' },
        { id: 'spider-revealed-appraisal', assetId: 'peter-revealed', stageName: 'Peter Parker', wardrobe: 'damaged-spider-suit', expression: 'vulnerable-honesty', concealment: 'revealed', projection: 'portrait', sourceFacing: 'left' },
        { id: 'choice-returned-staying', assetId: 'peter-choice-staying', stageName: 'Peter Parker', wardrobe: 'damaged-spider-suit', expression: 'restrained-choice-return', concealment: 'revealed', projection: 'three-quarter', sourceFacing: 'left' },
      ],
    },
    {
      id: 'mj', name: 'MJ', identityVersion: 'mj-v1', defaultAppearanceId: 'guarded-listening', stageHeightPercent: 88,
      appearances: [
        { id: 'guarded-listening', assetId: 'mj-guarded', stageName: 'MJ', wardrobe: 'olive-jacket', expression: 'guarded-listening', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
        { id: 'conflicted-boundary', assetId: 'mj-conflicted', stageName: 'MJ', wardrobe: 'olive-jacket', expression: 'conflicted-boundary', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
        { id: 'conflicted-boundary-appraisal', assetId: 'mj-conflicted', stageName: 'MJ', wardrobe: 'olive-jacket', expression: 'conflicted-boundary', concealment: 'civilian', projection: 'portrait', sourceFacing: 'right' },
        { id: 'reluctant-trust', assetId: 'mj-trust', stageName: 'MJ', wardrobe: 'olive-jacket', expression: 'reluctant-trust', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
        { id: 'choice-returned-listening', assetId: 'mj-choice-listening', stageName: 'MJ', wardrobe: 'olive-jacket', expression: 'choice-returned-listening', concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'right' },
      ],
    },
  ],
  tableaux: [
    { id: 'apartment-empty', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'wide', tone: 'intimate', atmosphere: [rainAtWindow], figures: [] },
    { id: 'masked-two-shot', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'cold', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-masked', slot: 'right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'masked-peter-active', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'cold', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'peter-parker', appearanceId: 'spider-masked', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    {
      id: 'unmask-cg', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [],
      cutIn: { assetId: 'spider-unmask-cg', framing: 'relationship-close', representedActorIds: ['mj', 'peter-parker'] },
    },
    { id: 'revealed-peter-active', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'revealed-peter-appraisal', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', appearanceId: 'conflicted-boundary', slot: 'far-left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed-appraisal', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'revealed-mj-appraisal', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', appearanceId: 'conflicted-boundary-appraisal', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'far-right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'revealed-name-settles', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', appearanceId: 'guarded-listening', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'revealed-mj-active', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', appearanceId: 'conflicted-boundary', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'revealed-shared-silence', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', appearanceId: 'conflicted-boundary', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'revealed-mj-trust', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', appearanceId: 'reluctant-trust', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'revealed-choice-returned', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', appearanceId: 'choice-returned-listening', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'peter-parker', appearanceId: 'choice-returned-staying', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'revealed-small-defences', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', musicAssetId: 'between-us-theme', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
      { actorId: 'mj', appearanceId: 'choice-returned-listening', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'hallway-empty', location: 'Apartment Hallway · After Midnight', backgroundAssetId: 'apartment-hallway', musicAssetId: 'stairs-resolve', ambienceAssetId: 'rain-window', shot: 'wide', tone: 'cold', figures: [] },
    { id: 'hallway-mj-active', location: 'Apartment Hallway · After Midnight', backgroundAssetId: 'apartment-hallway', musicAssetId: 'stairs-resolve', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mj', appearanceId: 'reluctant-trust', slot: 'left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'right', facing: 'left', emphasis: 'supporting' },
    ] },
    { id: 'hallway-peter-active', location: 'Apartment Hallway · After Midnight', backgroundAssetId: 'apartment-hallway', musicAssetId: 'stairs-resolve', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'intimate', figures: [
      { actorId: 'mj', appearanceId: 'reluctant-trust', slot: 'left', facing: 'right', emphasis: 'supporting' },
      { actorId: 'peter-parker', appearanceId: 'choice-returned-staying', slot: 'right', facing: 'left', emphasis: 'active' },
    ] },
    { id: 'hallway-shared-distance', location: 'Apartment Hallway · After Midnight', backgroundAssetId: 'apartment-hallway', musicAssetId: 'stairs-resolve', ambienceAssetId: 'rain-window', shot: 'conversation', tone: 'cold', figures: [
      { actorId: 'mj', appearanceId: 'choice-returned-listening', slot: 'far-left', facing: 'right', emphasis: 'active' },
      { actorId: 'peter-parker', appearanceId: 'spider-revealed', slot: 'far-right', facing: 'left', emphasis: 'active' },
    ] },
  ],
  moments: [
    { id: 'rain-location', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'apartment-empty', viewpoint: { kind: 'public' }, mode: 'location', label: 'Night', text: 'Rain softened the city beyond MJ’s window. Inside, there was nowhere for either of them to hide.', cueAssetIds: [], next: { type: 'goto', nodeId: 'distance' } },
    { id: 'distance', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-two-shot', viewpoint: { kind: 'public' }, mode: 'action', label: 'Distance', text: 'She kept the couch between them. Spider-Man stayed by the door, injured and careful not to come closer.', cueAssetIds: [], next: { type: 'goto', nodeId: 'room-reading-choice' } },
    { id: 'room-reading-choice', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-two-shot', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Attention', text: 'Before either of them spoke, the room had already chosen what it would reveal.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'observe', prompt: 'Which small defence do you notice?', options: [
      { id: 'watch-threshold', label: 'Watch the threshold', consequence: 'Learn why Peter has left the path to the door open.', nodeId: 'threshold-reading', grantsInsightIds: ['threshold-distance-noticed'] },
      { id: 'watch-mj-grip', label: 'Watch MJ’s hand', consequence: 'Learn what she is holding before she answers him.', nodeId: 'mj-grip-reading', grantsInsightIds: ['mj-grip-noticed'] },
    ] } },
    { id: 'threshold-reading', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-peter-active', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'thought', speakerId: 'peter-parker', text: 'The door stayed within reach. If she wanted the conversation over, he would be the one who moved.', cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-boundary' } },
    { id: 'mj-grip-reading', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-two-shot', viewpoint: { kind: 'private', holderId: 'mj' }, mode: 'thought', speakerId: 'mj', text: 'Her fingers stayed at the seam of her jacket: one small boundary that still belonged entirely to her.', cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-boundary' } },
    { id: 'mj-boundary', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-two-shot', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mj', text: 'You remember a life with me. I remember a stranger making choices for me.', cueAssetIds: [], next: { type: 'goto', nodeId: 'peter-mask-thought' } },
    { id: 'peter-mask-thought', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-peter-active', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'thought', speakerId: 'peter-parker', text: 'The mask made danger simple. Peter Parker was the part that could still ask to be forgiven.', cueAssetIds: [], next: { type: 'goto', nodeId: 'peter-protection' } },
    { id: 'peter-protection', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'masked-peter-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'peter-parker', text: 'I came to warn you, not to make you believe me. What happened to your memory was my decision—and it was wrong.', cueAssetIds: [], next: { type: 'goto', nodeId: 'unmask' } },
    { id: 'unmask', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'unmask-cg', viewpoint: { kind: 'public' }, mode: 'action', label: 'Revelation', text: 'He removed the mask. The hero did not leave; he became visibly human.', cueAssetIds: ['mask-pull'], performanceBeat: { actorId: 'peter-parker', phase: 'decision', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'name' } },
    { id: 'name', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'peter-parker', text: 'My name is Peter Parker. I loved you before the spell. That truth belongs to me; it does not obligate you.', cueAssetIds: [], next: { type: 'goto', nodeId: 'name-reading-choice' } },
    { id: 'name-reading-choice', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-shared-silence', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Attention', text: 'The name entered the room once. It landed in two different histories.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'interpret', prompt: 'Where do you let the name land?', options: [
      { id: 'stay-with-peter', label: 'Stay with Peter', consequence: 'Read what it costs him to say a name erased from everyone else.', nodeId: 'peter-name-private' },
      { id: 'watch-mj-receive', label: 'Watch MJ receive it', consequence: 'Read the difference between understanding a stranger and remembering him.', nodeId: 'mj-name-private' },
      { id: 'hear-a-plea', label: 'Hear it reach for her', consequence: 'Read the name as a question waiting to be answered in kind.', nodeId: 'plea-reading', distractor: true, grantsInsightIds: ['name-as-plea-assumed'] },
    ] } },
    { id: 'plea-reading', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-shared-silence', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Attention', text: 'You heard the name reach for her: a claim, quietly made, waiting for its echo.', cueAssetIds: [], next: { type: 'goto', nodeId: 'name-settles' } },
    { id: 'peter-name-private', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-active', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'thought', speakerId: 'peter-parker', text: 'For four years, Peter Parker had been the name he removed from every life he touched. Saying it without demanding recognition felt like returning evidence, not reclaiming a place.', cueAssetIds: [], next: { type: 'goto', nodeId: 'name-settles' } },
    { id: 'mj-name-private', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-active', viewpoint: { kind: 'private', holderId: 'mj' }, mode: 'thought', speakerId: 'mj', text: 'The name explained the grief in his face. It did not place a memory in hers—and he had finally left that difference intact.', cueAssetIds: [], next: { type: 'goto', nodeId: 'name-settles' } },
    { id: 'name-settles', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-name-settles', viewpoint: { kind: 'public' }, mode: 'action', label: 'The same room', text: 'MJ repeated the name once, quietly. Peter did not move closer.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'name-reading-choice', optionId: 'stay-with-peter' }, text: 'MJ repeated the name once, testing its weight. Peter heard it return without mistaking sound for recognition.' },
      { when: { kind: 'active-choice', choiceNodeId: 'name-reading-choice', optionId: 'watch-mj-receive' }, text: 'MJ repeated the stranger’s name carefully. It identified the person before her without manufacturing a shared past.' },
      { when: { kind: 'active-choice', choiceNodeId: 'name-reading-choice', optionId: 'hear-a-plea' }, text: 'MJ repeated the name once, quietly. Peter did not move closer, and did not wait for it to come back changed.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-sees' } },
    { id: 'mj-sees', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-appraisal', viewpoint: { kind: 'private', holderId: 'mj' }, mode: 'thought', speakerId: 'mj', text: 'His face carried the grief of recognition. Mine could only answer with sympathy.', cueAssetIds: [], performanceBeat: { actorId: 'mj', phase: 'appraisal', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'mj-answer' } },
    { id: 'mj-answer', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mj', text: 'I can understand why the girl in your memories loved you. But I am standing here without them.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['name-as-plea-assumed'] }, text: 'I can understand why the girl in your memories loved you. You are not asking me to be her—I can hear that. But I am standing here without them.' },
    ], cueAssetIds: [], performanceBeat: { actorId: 'mj', phase: 'decision', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'perspective-choice' } },
    { id: 'perspective-choice', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-active', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Reading', text: 'The same silence held two different losses.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'interpret', prompt: 'Which truth do you stay with?', options: [
      { id: 'read-peter', label: 'Peter · the cost of restraint', consequence: 'Read the truth he chooses not to use as leverage.', nodeId: 'peter-restraint', grantsInsightIds: ['peter-restraint-understood'] },
      { id: 'read-mj', label: 'MJ · the boundary of memory', consequence: 'Read the life she refuses to counterfeit.', nodeId: 'mj-boundary-private', grantsInsightIds: ['mj-memory-boundary-understood'] },
      { id: 'hold-both', label: 'Hold both truths', consequence: 'Available because you have read both losses without collapsing either into the other.', nodeId: 'both-truths-reading', requiresInsightIds: ['peter-restraint-understood', 'mj-memory-boundary-understood'] },
      { id: 'read-debt', label: 'MJ · the debt of sacrifice', consequence: 'Read what she owes a man who gave up everything for her.', nodeId: 'mj-debt-reading', distractor: true, grantsInsightIds: ['mj-owes-assumed'] },
    ] } },
    { id: 'mj-debt-reading', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-appraisal', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Reading', text: 'You read her stillness as a debt being counted: a man had erased himself for her, and gratitude was waiting for its shape.', cueAssetIds: [], next: { type: 'goto', nodeId: 'shared-silence' } },
    { id: 'peter-restraint', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-appraisal', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'thought', speakerId: 'peter-parker', text: 'Love could explain why he stayed. It could not grant permission to decide for her again.', cueAssetIds: [], next: { type: 'goto', nodeId: 'shared-silence' } },
    { id: 'mj-boundary-private', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-appraisal', viewpoint: { kind: 'private', holderId: 'mj' }, mode: 'thought', speakerId: 'mj', text: 'Being grateful for his sacrifice did not require inheriting another woman’s answer.', cueAssetIds: [], next: { type: 'goto', nodeId: 'shared-silence' } },
    { id: 'both-truths-reading', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-shared-silence', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Two truths', text: 'He could love her and still have wronged her. She could honour the sacrifice and still refuse the life it presumed. Understanding made neither truth disappear.', readingVariants: [
      { when: { kind: 'reader-insight-order', insightIds: ['peter-restraint-understood', 'mj-memory-boundary-understood'] }, text: 'Peter’s restraint had made love look costly. MJ’s boundary then revealed why cost could not purchase consent. Holding both truths made neither disappear.', tableauId: 'revealed-peter-appraisal' },
      { when: { kind: 'reader-insight-order', insightIds: ['mj-memory-boundary-understood', 'peter-restraint-understood'] }, text: 'MJ’s boundary had made memory’s absence decisive. Peter’s restraint then revealed love learning not to overrule it. Holding both truths made neither disappear.', tableauId: 'revealed-mj-appraisal' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'room-without-verdict' } },
    { id: 'room-without-verdict', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-shared-silence', viewpoint: { kind: 'public' }, mode: 'action', label: 'No verdict', text: 'Neither of them named the pause forgiveness. For the first time, the room did not require one pain to overrule the other.', cueAssetIds: [], next: { type: 'goto', nodeId: 'shared-silence' } },
    { id: 'shared-silence', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-shared-silence', viewpoint: { kind: 'public' }, mode: 'action', label: 'Silence', text: 'A distant siren crossed the rain. Peter lowered the mask. MJ did not step back—but she did not close the distance.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'perspective-choice', optionId: 'read-peter' }, text: 'A distant siren crossed the rain. Peter lowered the mask and kept the distance he had finally learned not to cross.' },
      { when: { kind: 'active-choice', choiceNodeId: 'perspective-choice', optionId: 'read-mj' }, text: 'A distant siren crossed the rain. MJ did not step back—but kindness did not become consent to a remembered life.' },
      { when: { kind: 'active-choice', choiceNodeId: 'perspective-choice', optionId: 'hold-both' }, text: 'A distant siren crossed the rain. Peter lowered the mask. MJ stayed. The distance between them remained real and, for once, mutually visible.' },
      { when: { kind: 'active-choice', choiceNodeId: 'perspective-choice', optionId: 'read-debt' }, text: 'A distant siren crossed the rain. Peter lowered the mask. MJ did not step back—and nothing in her stillness was counting.' },
    ], cueAssetIds: ['distant-siren'], next: { type: 'goto', nodeId: 'small-defence-returns' } },
    { id: 'small-defence-returns', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-small-defences', viewpoint: { kind: 'public' }, mode: 'action', label: 'What remained', text: 'The couch still divided the room. Neither of them treated the pause as permission.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['threshold-distance-noticed'] }, text: 'The path to the door remained open behind Peter. What first looked like distance now read as a promise that MJ would never have to move around him.' },
      { when: { kind: 'reader-insights', insightIds: ['mj-grip-noticed'] }, text: 'MJ’s hand loosened at her jacket seam. The movement was not forgiveness; it was one defence becoming unnecessary.' },
      { when: { kind: 'reader-insights', insightIds: ['threshold-distance-noticed', 'mj-grip-noticed'] }, text: 'The exit remained open behind Peter as MJ’s hand loosened at her jacket seam. Two small defences changed without either becoming surrender.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'restraint-forecast' } },
    { id: 'restraint-forecast', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-shared-silence', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Your reading', text: 'The silence had become legible enough to risk a prediction.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'predict', prompt: 'What do you expect Peter to do next?', options: [
      { id: 'expect-retreat', label: 'Retreat before she can refuse him', consequence: 'Test whether restraint means disappearing again.', nodeId: 'forecast-retreat' },
      { id: 'expect-return-choice', label: 'Return the immediate choice to MJ', consequence: 'Test whether he can remain present without deciding for her.', nodeId: 'forecast-return-choice' },
      { id: 'expect-plead', label: 'Ask her to try to remember', consequence: 'Test whether the truth, once spoken, asks for something back.', nodeId: 'forecast-plead', distractor: true, grantsInsightIds: ['peter-pleads-assumed'] },
    ] } },
    { id: 'forecast-plead', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-appraisal', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Prediction', text: 'You read the lowered mask as the last step before asking: try. Just try to remember.', cueAssetIds: [], next: { type: 'goto', nodeId: 'peter-offers-distance' } },
    { id: 'forecast-retreat', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-appraisal', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Prediction', text: 'You read the open door as preparation to vanish before her answer could hurt him.', cueAssetIds: [], next: { type: 'goto', nodeId: 'peter-offers-distance' } },
    { id: 'forecast-return-choice', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-appraisal', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Prediction', text: 'You read the open door as evidence that staying no longer required him to control the exit.', cueAssetIds: [], next: { type: 'goto', nodeId: 'peter-offers-distance' } },
    { id: 'peter-offers-distance', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-choice-returned', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'peter-parker', text: 'I can call a cab. Or I can take you home. You choose.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'restraint-forecast', optionId: 'expect-retreat' }, text: 'Peter looked toward the open door, then stayed. “I can call a cab. Or I can take you home. You choose.”' },
      { when: { kind: 'active-choice', choiceNodeId: 'restraint-forecast', optionId: 'expect-return-choice' }, text: 'Peter left the open door behind him and the decision with her. “I can call a cab. Or I can take you home. You choose.”' },
      { when: { kind: 'active-choice', choiceNodeId: 'restraint-forecast', optionId: 'expect-plead' }, text: 'Peter did not ask her to remember. “I can call a cab. Or I can take you home. You choose.”' },
    ], cueAssetIds: [], performanceBeat: { actorId: 'peter-parker', phase: 'decision', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'ride-home' } },
    { id: 'ride-home', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-trust', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mj', text: 'I still need to get home. Can you take me?', cueAssetIds: [], performanceBeat: { actorId: 'mj', phase: 'after-state', importance: 'pivotal' }, next: { type: 'goto', nodeId: 'departure-decision' } },
    { id: 'departure-decision', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-shared-silence', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Decision', text: 'Help could still become control in the distance between an offer and a door. The departure needed one rule Peter could not reinterpret for her.', cueAssetIds: [], next: { type: 'choice', posture: 'traversal', weight: 'texture', purpose: 'decide', prompt: 'Which boundary should govern the way home?', options: [
      { id: 'choose-ordinary-route', label: 'No shortcuts', consequence: 'Hold Peter to the ordinary door, the stairs, and MJ’s chosen pace.', nodeId: 'ordinary-route-reading' },
      { id: 'choose-visible-route', label: 'No disappearance', consequence: 'Hold Peter to remaining visible until MJ chooses to end the encounter.', nodeId: 'visible-route-reading' },
      { id: 'choose-swing', label: 'The fast way home', consequence: 'Let him carry her above the streets, the one way only he can.', nodeId: 'swing-route-reading', distractor: true, grantsInsightIds: ['rescue-as-care-assumed'] },
    ] } },
    { id: 'swing-route-reading', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-shared-silence', viewpoint: { kind: 'public' }, mode: 'narration', label: 'Decision', text: 'You wanted him to carry her home above the streets, the one gift only he could give. MJ’s rule went the other way.', cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-names-route' } },
    { id: 'ordinary-route-reading', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-trust', viewpoint: { kind: 'private', holderId: 'mj' }, mode: 'thought', speakerId: 'mj', text: 'No web, no window, no spectacular rescue. If he meant to return the choice, he could survive the slow indignity of the stairs.', cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-names-route' } },
    { id: 'visible-route-reading', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-peter-appraisal', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'thought', speakerId: 'peter-parker', text: 'Leaving first would spare him the answer and make her carry his absence again. This time, he would remain until she dismissed him.', cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-names-route' } },
    { id: 'mj-names-route', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'revealed-mj-trust', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mj', text: 'The stairs. No webbing. Stay where I can see you.', cueAssetIds: [], next: { type: 'goto', nodeId: 'door-opens' } },
    { id: 'door-opens', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'hallway-empty', viewpoint: { kind: 'public' }, mode: 'location', label: 'Beyond the room', text: 'MJ opened the apartment door herself. The hallway was dry, ordinary, and bright enough to make every step accountable.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['rescue-as-care-assumed'] }, text: 'MJ opened the apartment door herself. The hallway was dry, ordinary, and bright enough to make every step accountable—no window, no sky, nothing that only he could do.' },
    ], cueAssetIds: ['door-latch'], next: { type: 'goto', nodeId: 'hallway-threshold' } },
    { id: 'hallway-threshold', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'hallway-shared-distance', viewpoint: { kind: 'public' }, mode: 'action', label: 'The threshold', text: 'She crossed first. Peter followed one full pace behind, the mask loose at his side.', readingVariants: [
      { when: { kind: 'active-choice', choiceNodeId: 'departure-decision', optionId: 'choose-ordinary-route' }, text: 'She crossed first and chose the stairs. Peter followed one full pace behind, accepting an ordinary route he could not optimize into a rescue.' },
      { when: { kind: 'active-choice', choiceNodeId: 'departure-decision', optionId: 'choose-visible-route' }, text: 'She crossed first. Peter stayed one full pace behind and plainly visible, refusing the old instinct to make pain disappear by disappearing himself.' },
      { when: { kind: 'active-choice', choiceNodeId: 'departure-decision', optionId: 'choose-swing' }, text: 'She crossed first and took the stairs. Peter followed one full pace behind, the rooftops he could have offered her left unmentioned.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'mj-corrects-promise' } },
    { id: 'mj-corrects-promise', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'hallway-mj-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'mj', text: 'Taking me home is not a promise about tomorrow. It is one walk, tonight.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['mj-owes-assumed'] }, text: 'Taking me home is not a promise about tomorrow, and it is not a payment. It is one walk, tonight.' },
    ], cueAssetIds: [], next: { type: 'goto', nodeId: 'peter-hears-limit' } },
    { id: 'peter-hears-limit', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'hallway-peter-active', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'thought', speakerId: 'peter-parker', text: 'Once, he would have heard the limit as a door closing. Now he heard its other meaning: she had trusted him with something small enough not to own.', cueAssetIds: [], next: { type: 'goto', nodeId: 'peter-accepts-limit' } },
    { id: 'peter-accepts-limit', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'hallway-peter-active', viewpoint: { kind: 'public' }, mode: 'dialogue', speakerId: 'peter-parker', text: 'One walk. Tonight. You set the pace.', cueAssetIds: [], next: { type: 'goto', nodeId: 'stairs-begin' } },
    { id: 'stairs-begin', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'hallway-shared-distance', viewpoint: { kind: 'public' }, mode: 'action', label: 'A smaller beginning', text: 'MJ turned toward the stairwell. Peter waited for her first step, then matched neither her stride nor her silence—only the distance she had chosen.', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['peter-pleads-assumed'] }, text: 'MJ turned toward the stairwell. Peter had asked her for nothing—not even to remember. He waited for her first step, then matched neither her stride nor her silence—only the distance she had chosen.' },
    ], cueAssetIds: ['distant-siren'], next: { type: 'goto', nodeId: 'ending' } },
    { id: 'ending', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'hallway-shared-distance', viewpoint: { kind: 'private', holderId: 'peter-parker' }, mode: 'ending', speakerId: 'peter-parker', label: 'What remains', text: 'He could protect her without possessing her answer. The city below still needed Spider-Man; the next stair required only Peter Parker to stay one pace behind.', cueAssetIds: [], next: { type: 'end' } },
  ],
};

export const spiderMemoryExperience: Experience = withVoiceLines(authored, spiderMemoryVoiceLines);
