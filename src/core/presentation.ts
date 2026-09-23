// @jasonyu0100
import type { Actor, CompiledExperience, Moment } from './contracts';

/**
 * How a moment reads on screen. The mode is authored; the register decides the
 * typographic voice: spoken lines are quoted, thoughts are unquoted and inward,
 * narration and action carry no speaker, establishing text reads as a title card.
 */
export type Register = Moment['mode'];

export type PovShift = 'none' | 'enter-private' | 'exit-private' | 'holder-change';

export type LinePresentation = Readonly<{
  register: Register;
  eyebrow: string;
  speakerName: string;
  speakerHue: number | undefined;
  text: string;
  quoted: boolean;
  povShift: PovShift;
  /** Actors staged in the tableau who are not the private holder; they recede while the reader is inside one head. */
  outsidePovActorIds: readonly string[];
}>;

const OPENING_QUOTES = /^["“„«‘]/;

/** Stable hue per actor so a name and its rim light stay the same colour across every Experience build. */
export function actorHue(actorId: string): number {
  let hash = 0x811c9dc5;
  for (const char of actorId) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  // Skip the muddy 60–160° band so accents stay legible on the dark rail.
  return (hash % 260) < 60 ? hash % 260 : (hash % 260) + 100;
}

export function quoteSpokenLine(text: string): { text: string; quoted: boolean } {
  if (OPENING_QUOTES.test(text)) return { text, quoted: false };
  return { text: `“${text}”`, quoted: true };
}

export function povShift(previous: Moment | undefined, current: Moment): PovShift {
  if (!previous) return current.viewpoint.kind === 'private' ? 'enter-private' : 'none';
  if (previous.viewpoint.kind === 'public' && current.viewpoint.kind === 'private') return 'enter-private';
  if (previous.viewpoint.kind === 'private' && current.viewpoint.kind === 'public') return 'exit-private';
  if (previous.viewpoint.kind === 'private' && current.viewpoint.kind === 'private' && previous.viewpoint.holderId !== current.viewpoint.holderId) {
    return 'holder-change';
  }
  return 'none';
}

function eyebrowFor(moment: Moment, holder: Actor | undefined): string {
  if (moment.mode === 'thought' && holder) return `${holder.name} · thinks`;
  if (moment.mode === 'dialogue') return moment.label ?? 'Dialogue';
  return moment.label ?? moment.mode;
}

export function presentLine(
  experience: CompiledExperience,
  moment: Moment,
  previous: Moment | undefined,
  speakerName: string,
): LinePresentation {
  const viewpoint = moment.viewpoint;
  const holder = viewpoint.kind === 'private'
    ? experience.actors.find((actor) => actor.id === viewpoint.holderId)
    : undefined;
  const tableau = experience.tableaux.find((candidate) => candidate.id === moment.tableauId);
  const spoken = moment.mode === 'dialogue' && Boolean(moment.speakerId);
  const { text, quoted } = spoken ? quoteSpokenLine(moment.text) : { text: moment.text, quoted: false };
  return {
    register: moment.mode,
    eyebrow: eyebrowFor(moment, holder),
    speakerName: moment.mode === 'thought' ? '' : speakerName,
    speakerHue: moment.speakerId ? actorHue(moment.speakerId) : undefined,
    text,
    quoted,
    povShift: povShift(previous, moment),
    outsidePovActorIds: holder && tableau
      ? tableau.figures.map((figure) => figure.actorId).filter((actorId) => actorId !== holder.id)
      : [],
  };
}
