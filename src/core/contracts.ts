// @jasonyu0100
import { z } from 'zod';

export const SlotSchema = z.enum(['far-left', 'left', 'center', 'right', 'far-right']);
export type Slot = z.infer<typeof SlotSchema>;

export const AssetSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['background', 'figure', 'artifact', 'ambience', 'music', 'cue']),
  sourcePath: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type Asset = z.infer<typeof AssetSchema>;

export const ActorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  renditionAssetId: z.string().min(1),
  sourceFacing: z.enum(['left', 'right']),
  stageHeightPercent: z.number().min(45).max(78),
}).strict();
export type Actor = z.infer<typeof ActorSchema>;

const FigureSchema = z.object({
  actorId: z.string().min(1),
  slot: SlotSchema,
  facing: z.enum(['left', 'right', 'inward']),
  emphasis: z.enum(['active', 'supporting', 'recessed']),
}).strict();

const ArtifactPlacementSchema = z.object({
  assetId: z.string().min(1),
  slot: SlotSchema,
  footprint: z.enum(['study', 'large']),
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
}).strict();
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
  cueAssetIds: z.array(z.string().min(1)).default([]),
  next: NextSchema,
}).strict();
export type Moment = z.infer<typeof MomentSchema>;

export const ExperienceSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  posture: z.literal('catch-up'),
  source: z.object({
    domainId: z.string().min(1),
    branchId: z.string().min(1),
    asOfEntryId: z.string().min(1),
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
