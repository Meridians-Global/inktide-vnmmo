import type { CompiledExperience } from './contracts';
import type { ReaderState } from './reader-state';

export type TextSpeed = 'instant' | 'fast' | 'normal' | 'slow';
export type TextSize = 'small' | 'medium' | 'large';
export type BoxOpacity = 'clear' | 'soft' | 'solid';
export type AutoDelay = 'brisk' | 'normal' | 'leisurely';

/** Presentation preferences. Device-wide, never part of the reading coordinate. */
export type ReaderPrefs = {
  textSpeed: TextSpeed;
  textSize: TextSize;
  boxOpacity: BoxOpacity;
  autoDelay: AutoDelay;
};

export type Playback = 'manual' | 'auto' | 'skip';

export const DEFAULT_PREFS: ReaderPrefs = {
  textSpeed: 'normal',
  textSize: 'medium',
  boxOpacity: 'soft',
  autoDelay: 'normal',
};

export const PREF_OPTIONS: { [K in keyof ReaderPrefs]: readonly ReaderPrefs[K][] } = {
  textSpeed: ['instant', 'fast', 'normal', 'slow'],
  textSize: ['small', 'medium', 'large'],
  boxOpacity: ['clear', 'soft', 'solid'],
  autoDelay: ['brisk', 'normal', 'leisurely'],
};

const MS_PER_CHAR: Record<TextSpeed, number> = { instant: 0, fast: 12, normal: 26, slow: 48 };
const AUTO_BASE_MS: Record<AutoDelay, number> = { brisk: 700, normal: 1400, leisurely: 2400 };
const AUTO_MS_PER_CHAR: Record<AutoDelay, number> = { brisk: 18, normal: 34, leisurely: 55 };
export const SKIP_HOLD_MS = 90;

export function cyclePref<K extends keyof ReaderPrefs>(prefs: ReaderPrefs, key: K): ReaderPrefs {
  const options = PREF_OPTIONS[key];
  const index = options.indexOf(prefs[key]);
  return { ...prefs, [key]: options[(index + 1) % options.length] };
}

/** Reject unknown persisted values field by field so an older save can never produce an impossible preference. */
export function coercePrefs(candidate: unknown): ReaderPrefs {
  if (!candidate || typeof candidate !== 'object') return DEFAULT_PREFS;
  const record = candidate as Record<string, unknown>;
  const pick = <K extends keyof ReaderPrefs>(key: K): ReaderPrefs[K] => {
    const options = PREF_OPTIONS[key] as readonly string[];
    const value = record[key];
    return typeof value === 'string' && options.includes(value) ? (value as ReaderPrefs[K]) : DEFAULT_PREFS[key];
  };
  return { textSpeed: pick('textSpeed'), textSize: pick('textSize'), boxOpacity: pick('boxOpacity'), autoDelay: pick('autoDelay') };
}

export function revealMsPerChar(prefs: ReaderPrefs, reducedMotion: boolean): number {
  return reducedMotion ? 0 : MS_PER_CHAR[prefs.textSpeed];
}

/** Reading time granted after a line is fully revealed before AUTO advances. */
export function autoAdvanceMs(prefs: ReaderPrefs, text: string): number {
  return AUTO_BASE_MS[prefs.autoDelay] + text.length * AUTO_MS_PER_CHAR[prefs.autoDelay];
}

/**
 * Whether continuous playback may carry the reader past the current moment.
 * AUTO stops only at forks and endings. SKIP additionally refuses to step into
 * unread text, so it can only fast-forward through what was already earned.
 */
export function canPlayThrough(experience: CompiledExperience, state: ReaderState, playback: Playback): boolean {
  if (playback === 'manual' || state.isBacklogOpen || state.isSettingsOpen) return false;
  const moment = experience.moments.find((candidate) => candidate.id === state.currentNodeId);
  if (!moment || moment.next.type !== 'goto') return false;
  return playback === 'auto' || state.seenNodeIds.includes(moment.next.nodeId);
}
