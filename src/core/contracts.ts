// @jasonyu0100
import { z } from 'zod';

export const SlotSchema = z.enum(['far-left', 'left', 'center', 'right', 'far-right']);
export type Slot = z.infer<typeof SlotSchema>;

export const FigurePreparationSchema = z.object({
  kind: z.literal('figure-normalize'),
  recipeVersion: z.literal(1),
  canvas: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).strict(),
  subjectBox: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).strict(),
  bottomPadding: z.number().int().nonnegative(),
  matteCleanup: z.object({
    spill: z.enum(['green', 'blue', 'magenta']),
    alphaFloor: z.number().int().min(0).max(254),
    edgeAlphaCeiling: z.number().int().min(1).max(255),
    channelMargin: z.number().int().min(0).max(255),
  }).strict().optional(),
}).strict();
export type FigurePreparation = z.infer<typeof FigurePreparationSchema>;

export const AssetSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['background', 'figure', 'artifact', 'cg', 'ambience', 'music', 'cue', 'voice']),
  sourcePath: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  preparation: FigurePreparationSchema.optional(),
}).strict();
export type Asset = z.infer<typeof AssetSchema>;

export const AppearanceSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  stageName: z.string().min(1),
  wardrobe: z.string().min(1),
  expression: z.string().min(1),
  concealment: z.enum(['civilian', 'masked', 'revealed']),
  projection: z.enum(['full-body', 'three-quarter', 'portrait']),
  sourceFacing: z.enum(['left', 'right']),
}).strict();
export type Appearance = z.infer<typeof AppearanceSchema>;

export const ActorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  identityVersion: z.string().min(1),
  defaultAppearanceId: z.string().min(1),
  stageHeightPercent: z.number().min(45).max(92),
  appearances: z.array(AppearanceSchema).min(1),
}).strict();
export type Actor = z.infer<typeof ActorSchema>;

const FigureSchema = z.object({
  actorId: z.string().min(1),
  appearanceId: z.string().min(1).optional(),
  slot: SlotSchema,
  facing: z.enum(['left', 'right', 'inward']),
  emphasis: z.enum(['active', 'supporting', 'recessed']),
}).strict();

const ArtifactPlacementSchema = z.object({
  assetId: z.string().min(1),
  slot: SlotSchema,
  footprint: z.enum(['study', 'large']),
}).strict();

const CutInSchema = z.object({
  assetId: z.string().min(1),
  framing: z.enum(['location-match', 'relationship-close', 'memory-full-frame']),
  representedActorIds: z.array(z.string().min(1)).min(1).max(5),
  representedArtifactId: z.string().min(1).optional(),
}).strict();

const AtmosphereRegionSchema = z.object({
  left: z.number().min(0).max(100),
  top: z.number().min(0).max(100),
  width: z.number().positive().max(100),
  height: z.number().positive().max(100),
}).strict().refine((region) => region.left + region.width <= 100 && region.top + region.height <= 100, 'Atmosphere region must remain inside the stage');

const AtmosphereSchema = z.object({
  kind: z.enum(['rain', 'snow', 'dust']),
  layer: z.enum(['back', 'front']),
  region: AtmosphereRegionSchema,
  intensity: z.number().int().min(4).max(36),
  seed: z.number().int(),
}).strict();

export const TableauSchema = z.object({
  id: z.string().min(1),
  location: z.string().min(1),
  backgroundAssetId: z.string().min(1),
  ambienceAssetId: z.string().min(1).optional(),
  musicAssetId: z.string().min(1).optional(),
  shot: z.enum(['wide', 'conversation', 'artifact']),
  tone: z.enum(['cold', 'neutral', 'intimate', 'ominous']),
  figures: z.array(FigureSchema).max(5),
  artifact: ArtifactPlacementSchema.optional(),
  cutIn: CutInSchema.optional(),
  atmosphere: z.array(AtmosphereSchema).max(3).optional(),
}).strict().refine((tableau) => !tableau.cutIn || (tableau.figures.length === 0 && !tableau.artifact), 'A CG cut-in embodies its declared cast and artifact; do not double-layer figures or artifact');
export type Tableau = z.infer<typeof TableauSchema>;

export const ViewpointSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('public') }).strict(),
  z.object({ kind: z.literal('private'), holderId: z.string().min(1) }).strict(),
]);
export type Viewpoint = z.infer<typeof ViewpointSchema>;

const GotoSchema = z.object({ type: z.literal('goto'), nodeId: z.string().min(1) }).strict();
const EndSchema = z.object({ type: z.literal('end') }).strict();
const ChoiceSchema = z.object({
  type: z.literal('choice'),
  posture: z.literal('traversal'),
  prompt: z.string().min(1),
  options: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    consequence: z.string().min(1),
    nodeId: z.string().min(1),
  }).strict()).min(2).max(4),
}).strict();

export const NextSchema = z.discriminatedUnion('type', [GotoSchema, ChoiceSchema, EndSchema]);
export type Next = z.infer<typeof NextSchema>;

export const MomentSchema = z.object({
  id: z.string().min(1),
  chapter: z.string().min(1),
  tableauId: z.string().min(1),
  viewpoint: ViewpointSchema,
  mode: z.enum(['location', 'narration', 'dialogue', 'thought', 'action', 'artifact', 'ending']),
  label: z.string().min(1).optional(),
  speakerId: z.string().min(1).optional(),
  text: z.string().min(1),
  voiceAssetId: z.string().min(1).optional(),
  cueAssetIds: z.array(z.string().min(1)).default([]),
  performanceBeat: z.object({
    actorId: z.string().min(1),
    phase: z.enum(['baseline', 'appraisal', 'decision', 'after-state']),
    importance: z.enum(['supporting', 'pivotal']),
  }).strict().optional(),
  next: NextSchema,
}).strict();
export type Moment = z.infer<typeof MomentSchema>;

export const ExperienceSchema = z.object({
  schemaVersion: z.literal(2),
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  posture: z.literal('catch-up'),
  source: z.object({
    domainId: z.string().min(1),
    branchId: z.string().min(1),
    asOfEntryId: z.string().min(1),
    sourceSha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    note: z.string().min(1),
  }).strict(),
  startNodeId: z.string().min(1),
  assets: z.array(AssetSchema),
  actors: z.array(ActorSchema),
  tableaux: z.array(TableauSchema),
  moments: z.array(MomentSchema),
}).strict();
export type Experience = z.infer<typeof ExperienceSchema>;

export type CompiledAsset = Asset & { url: string };
export type CompiledExperience = Omit<Experience, 'assets'> & { assets: CompiledAsset[] };

export type CompileResult =
  | { ok: true; experience: CompiledExperience }
  | { ok: false; errors: string[] };
