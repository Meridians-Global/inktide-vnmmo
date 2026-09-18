// @jasonyu0100
import type { Asset, Experience, Moment } from './contracts';

export type VoiceEmotion = 'auto' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'calm' | 'fluent' | 'neutral';

/** One character's spoken identity: a system voice plus the offsets that make it theirs. */
export type VoiceProfile = Readonly<{
  voiceId: string;
  speed: number;
  pitch: number;
  emotion: VoiceEmotion;
  note: string;
}>;

/** Casting sheet for one Experience. The narrator speaks every line without a speaker. */
export type VoiceCast = Readonly<{
  narrator: VoiceProfile;
  actors: Readonly<Record<string, VoiceProfile>>;
  /** Per-line delivery overrides keyed by moment id (or `momentId#variantIndex`). */
  deliveries?: Readonly<Record<string, Partial<Pick<VoiceProfile, 'speed' | 'pitch' | 'emotion'>>>>;
}>;

export type VoiceLine = Readonly<{
  /** Stable asset id derived from the coordinate, so a regenerated line replaces itself. */
  assetId: string;
  momentId: string;
  variantIndex?: number;
  speakerId?: string;
  text: string;
  profile: VoiceProfile;
}>;

/** Pinned result of generating a line; committed next to the story so the reader never generates. */
export type VoiceLineAsset = Readonly<{
  assetId: string;
  momentId: string;
  variantIndex?: number;
  sourcePath: string;
  sha256: string;
}>;

const round = (value: number): number => Math.round(value * 100) / 100;

function deliveryKey(momentId: string, variantIndex?: number): string {
  return variantIndex === undefined ? momentId : `${momentId}#${variantIndex}`;
}

export function voiceLineAssetId(momentId: string, variantIndex?: number): string {
  return variantIndex === undefined ? `voice-${momentId}` : `voice-${momentId}-v${variantIndex + 1}`;
}

/** Thoughts are read closer and slower than speech; narration stays even. */
function shapeDelivery(profile: VoiceProfile, moment: Moment): VoiceProfile {
  if (moment.mode === 'thought') return { ...profile, speed: round(profile.speed * 0.94), emotion: profile.emotion === 'auto' ? 'calm' : profile.emotion };
  if (moment.mode === 'ending') return { ...profile, speed: round(profile.speed * 0.92) };
  return profile;
}

/** Every spoken line an Experience needs, in reading order, with its cast delivery resolved. */
export function planVoiceLines(experience: Experience, cast: VoiceCast): VoiceLine[] {
  const lines: VoiceLine[] = [];
  for (const moment of experience.moments) {
    const base = moment.speakerId ? cast.actors[moment.speakerId] : cast.narrator;
    if (!base) throw new Error(`Voice cast for ${experience.id} has no profile for speaker ${moment.speakerId}`);
    const shaped = shapeDelivery(base, moment);
    const push = (text: string, variantIndex?: number): void => {
      const override = cast.deliveries?.[deliveryKey(moment.id, variantIndex)];
      lines.push({
        assetId: voiceLineAssetId(moment.id, variantIndex),
        momentId: moment.id,
        ...(variantIndex === undefined ? {} : { variantIndex }),
        ...(moment.speakerId ? { speakerId: moment.speakerId } : {}),
        text,
        profile: { ...shaped, ...override },
      });
    };
    push(moment.text);
    moment.readingVariants?.forEach((variant, index) => push(variant.text, index));
  }
  return lines;
}

/**
 * Attach generated voice lines to an authored Experience. Lines whose coordinate no
 * longer exists are dropped, so stale generations cannot make the graph fail to compile.
 */
export function withVoiceLines(experience: Experience, lines: readonly VoiceLineAsset[]): Experience {
  const byMoment = new Map<string, VoiceLineAsset[]>();
  for (const line of lines) byMoment.set(line.momentId, [...(byMoment.get(line.momentId) ?? []), line]);
  const used = new Set<string>();
  const moments = experience.moments.map((moment) => {
    const own = byMoment.get(moment.id) ?? [];
    const base = own.find((line) => line.variantIndex === undefined);
    if (base) used.add(base.assetId);
    const readingVariants = moment.readingVariants?.map((variant, index) => {
      const line = own.find((candidate) => candidate.variantIndex === index);
      if (!line) return variant;
      used.add(line.assetId);
      return { ...variant, voiceAssetId: line.assetId };
    });
    return {
      ...moment,
      ...(base ? { voiceAssetId: base.assetId } : {}),
      ...(readingVariants ? { readingVariants } : {}),
    };
  });
  const assets: Asset[] = lines
    .filter((line) => used.has(line.assetId))
    .map((line) => ({ id: line.assetId, kind: 'voice', sourcePath: line.sourcePath, sha256: line.sha256 }));
  return { ...experience, assets: [...experience.assets, ...assets], moments };
}
