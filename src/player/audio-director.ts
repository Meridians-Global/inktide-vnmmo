import type { CompiledAsset, Tableau } from '../core/contracts';

type Loop = { audio: HTMLAudioElement; assetId: string; level: number };

const AMBIENCE_LEVEL = 0.22;
const MUSIC_LEVEL = 0.16;
const CUE_LEVEL = 0.4;
const VOICE_LEVEL = 0.9;
/** Beds sit back while a line is spoken, then return. */
const DUCK = 0.38;
const FADE_MS = 900;

/**
 * Runtime audio for the reader: looping ambience/music beds, one-shot cues and one
 * spoken line at a time. Playback failures (autoplay policy, missing codec) are
 * swallowed and retried on the next user gesture via `unlock()`.
 */
export type AudioChannels = Readonly<{ music: boolean; sfx: boolean; voice: boolean }>;

export class AudioDirector {
  private ambience: Loop | undefined;
  private music: Loop | undefined;
  private activeVoice: HTMLAudioElement | undefined;
  private isMusicEnabled = true;
  private isSfxEnabled = true;
  private isVoiceEnabled = true;
  private masterLevel = 1;
  private pendingTableau: Tableau | undefined;
  private fades = new Map<HTMLAudioElement, number>();
  onVoiceEnd: (() => void) | undefined;

  constructor(private readonly assets: Map<string, CompiledAsset>) {}

  /** BGM is the music bed; SFX covers ambience beds and one-shot cues; voice is the spoken line. */
  setChannels(channels: AudioChannels): void {
    this.isMusicEnabled = channels.music;
    this.isSfxEnabled = channels.sfx;
    this.isVoiceEnabled = channels.voice;
    if (!channels.music) this.music?.audio.pause();
    if (!channels.sfx) this.ambience?.audio.pause();
    if (!channels.voice) this.stopVoice();
    if (this.pendingTableau) this.sync(this.pendingTableau);
  }

  setMasterLevel(level: number): void {
    this.masterLevel = Math.max(0, Math.min(1, level));
    const duck = this.activeVoice && !this.activeVoice.paused ? DUCK : 1;
    if (this.ambience) this.ambience.audio.volume = this.ambience.level * this.masterLevel * duck;
    if (this.music) this.music.audio.volume = this.music.level * this.masterLevel * duck;
    if (this.activeVoice) this.activeVoice.volume = VOICE_LEVEL * this.masterLevel;
  }

  /** Call from a user gesture: resumes beds the browser refused to autoplay. */
  unlock(): void {
    for (const [loop, enabled] of [[this.ambience, this.isSfxEnabled], [this.music, this.isMusicEnabled]] as const) {
      if (enabled && loop && loop.audio.paused) this.safePlay(loop.audio);
    }
  }

  sync(tableau: Tableau): void {
    this.pendingTableau = tableau;
    const duck = this.activeVoice && !this.activeVoice.paused ? DUCK : 1;
    if (this.isSfxEnabled) this.ambience = this.syncLoop(this.ambience, tableau.ambienceAssetId, AMBIENCE_LEVEL, duck);
    if (this.isMusicEnabled) this.music = this.syncLoop(this.music, tableau.musicAssetId, MUSIC_LEVEL, duck);
  }

  playCues(assetIds: string[]): void {
    if (!this.isSfxEnabled) return;
    for (const assetId of assetIds) {
      const asset = this.assets.get(assetId);
      if (!asset || asset.kind !== 'cue') continue;
      const audio = new Audio(asset.url);
      audio.volume = CUE_LEVEL * this.masterLevel;
      this.safePlay(audio);
    }
  }

  playVoice(assetId?: string): void {
    this.stopVoice();
    if (!this.isVoiceEnabled || !assetId) return;
    const asset = this.assets.get(assetId);
    if (!asset || asset.kind !== 'voice') return;
    const voice = new Audio(asset.url);
    voice.volume = VOICE_LEVEL * this.masterLevel;
    voice.addEventListener('ended', () => {
      if (this.activeVoice !== voice) return;
      this.activeVoice = undefined;
      this.setDuck(1);
      this.onVoiceEnd?.();
    });
    voice.addEventListener('error', () => {
      if (this.activeVoice !== voice) return;
      this.activeVoice = undefined;
      this.setDuck(1);
      this.onVoiceEnd?.();
    });
    this.activeVoice = voice;
    this.setDuck(DUCK);
    voice.play().catch(() => {
      if (this.activeVoice !== voice) return;
      this.activeVoice = undefined;
      this.setDuck(1);
      this.onVoiceEnd?.();
    });
  }

  /** True from the moment a line is issued until it ends, fails, or is stopped — `play()` resolves asynchronously. */
  get isSpeaking(): boolean {
    return Boolean(this.activeVoice && !this.activeVoice.ended);
  }

  stopVoice(): void {
    if (!this.activeVoice) return;
    this.activeVoice.pause();
    this.activeVoice = undefined;
    this.setDuck(1);
  }

  /** Leaving the reader: everything fades and is released. */
  stop(): void {
    this.stopVoice();
    for (const loop of [this.ambience, this.music]) if (loop) this.fadeOut(loop.audio);
    this.ambience = undefined;
    this.music = undefined;
    this.pendingTableau = undefined;
  }

  private setDuck(duck: number): void {
    for (const loop of [this.ambience, this.music]) {
      if (loop) this.fadeTo(loop.audio, loop.level * this.masterLevel * duck, FADE_MS / 3);
    }
  }

  private syncLoop(current: Loop | undefined, assetId: string | undefined, level: number, duck: number): Loop | undefined {
    const asset = assetId ? this.assets.get(assetId) : undefined;
    if (!asset) {
      if (current) this.fadeOut(current.audio);
      return undefined;
    }
    if (current && current.assetId === assetId) {
      if (current.audio.paused) this.safePlay(current.audio);
      return current;
    }
    if (current) this.fadeOut(current.audio);
    const audio = new Audio(asset.url);
    audio.loop = true;
    audio.volume = 0;
    this.safePlay(audio);
    this.fadeTo(audio, level * this.masterLevel * duck, FADE_MS);
    return { audio, assetId: asset.id, level };
  }

  private fadeOut(audio: HTMLAudioElement): void {
    this.fadeTo(audio, 0, FADE_MS, () => audio.pause());
  }

  private fadeTo(audio: HTMLAudioElement, target: number, duration: number, done?: () => void): void {
    const existing = this.fades.get(audio);
    if (existing) cancelAnimationFrame(existing);
    const from = audio.volume;
    const startedAt = performance.now();
    const step = (now: number): void => {
      const progress = Math.max(0, Math.min(1, (now - startedAt) / duration));
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * progress));
      if (progress < 1) {
        this.fades.set(audio, requestAnimationFrame(step));
        return;
      }
      this.fades.delete(audio);
      done?.();
    };
    this.fades.set(audio, requestAnimationFrame(step));
  }

  private safePlay(audio: HTMLAudioElement): void {
    audio.play().catch(() => undefined);
  }
}
