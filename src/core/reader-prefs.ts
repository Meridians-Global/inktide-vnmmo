import type { CompiledExperience } from './contracts';
import type { ReaderState } from './reader-state';

export type TextSpeed = 'instant' | 'fast' | 'normal' | 'slow';
export type TextSize = 'small' | 'medium' | 'large';
export type BoxOpacity = 'clear' | 'soft' | 'solid';
export type AutoDelay = 'brisk' | 'normal' | 'leisurely';
export type Volume = 'quiet' | 'normal' | 'loud';
export type Switch = 'on' | 'off';

/** Presentation preferences. Device-wide, never part of the reading coordinate. */
export type ReaderPrefs = {
  textSpeed: TextSpeed;
  textSize: TextSize;
  boxOpacity: BoxOpacity;
  autoDelay: AutoDelay;
  volume: Volume;
  music: Switch;
  sfx: Switch;
  voice: Switch;
};

export type Playback = 'manual' | 'auto' | 'skip';

export const DEFAULT_PREFS: ReaderPrefs = {
  textSpeed: 'normal',
  textSize: 'medium',
  boxOpacity: 'soft',
  autoDelay: 'normal',
  volume: 'normal',
  music: 'on',
  sfx: 'on',
  voice: 'on',
};

export const PREF_OPTIONS: { [K in keyof ReaderPrefs]: readonly ReaderPrefs[K][] } = {
  textSpeed: ['instant', 'fast', 'normal', 'slow'],
  textSize: ['small', 'medium', 'large'],
  boxOpacity: ['clear', 'soft', 'solid'],
  autoDelay: ['brisk', 'normal', 'leisurely'],
  volume: ['quiet', 'normal', 'loud'],
  music: ['on', 'off'],
  sfx: ['on', 'off'],
  voice: ['on', 'off'],
};

const MS_PER_CHAR: Record<TextSpeed, number> = { instant: 0, fast: 12, normal: 26, slow: 48 };
const AUTO_BASE_MS: Record<AutoDelay, number> = { brisk: 350, normal: 800, leisurely: 1800 };
const AUTO_MS_PER_CHAR: Record<AutoDelay, number> = { brisk: 10, normal: 20, leisurely: 40 };
const MASTER_LEVEL: Record<Volume, number> = { quiet: 0.45, normal: 0.75, loud: 1 };
/** Breath left after a spoken line finishes before AUTO advances. */
const AUTO_AFTER_VOICE_MS: Record<AutoDelay, number> = { brisk: 200, normal: 450, leisurely: 1000 };
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
  return { textSpeed: pick('textSpeed'), textSize: pick('textSize'), boxOpacity: pick('boxOpacity'), autoDelay: pick('autoDelay'), volume: pick('volume'), music: pick('music'), sfx: pick('sfx'), voice: pick('voice') };
}

/** Which audio channels the reader has switched on; every channel defaults on. */
export function audioChannels(prefs: ReaderPrefs): { music: boolean; sfx: boolean; voice: boolean } {
  return { music: prefs.music === 'on', sfx: prefs.sfx === 'on', voice: prefs.voice === 'on' };
}

export function revealMsPerChar(prefs: ReaderPrefs, reducedMotion: boolean): number {
  return reducedMotion ? 0 : MS_PER_CHAR[prefs.textSpeed];
}

export function masterLevel(prefs: ReaderPrefs): number {
  return MASTER_LEVEL[prefs.volume];
}

/**
 * Reading time granted after a line is fully revealed before AUTO advances.
 * A spoken line has already paced the reader, so only a short breath follows it.
 */
export function autoAdvanceMs(prefs: ReaderPrefs, text: string, spoken = false): number {
  if (spoken) return AUTO_AFTER_VOICE_MS[prefs.autoDelay];
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
