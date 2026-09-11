import type { CompiledAsset, Tableau } from '../core/contracts';

export class AudioDirector {
  private activeAmbience: HTMLAudioElement | undefined;
  private activeMusic: HTMLAudioElement | undefined;
  private activeVoice: HTMLAudioElement | undefined;
  private isPhysicalSoundEnabled = false;
  private isVoiceEnabled = false;

  constructor(private readonly assets: Map<string, CompiledAsset>) {}

  setPhysicalSoundEnabled(isEnabled: boolean): void {
    this.isPhysicalSoundEnabled = isEnabled;
    if (!isEnabled) {
      this.activeAmbience?.pause();
      this.activeMusic?.pause();
    }
  }

  setVoiceEnabled(isEnabled: boolean): void {
    this.isVoiceEnabled = isEnabled;
    if (!isEnabled) this.activeVoice?.pause();
  }

  sync(tableau: Tableau): void {
    if (!this.isPhysicalSoundEnabled) return;
    this.activeAmbience = this.syncLoop(this.activeAmbience, tableau.ambienceAssetId, 0.2);
    this.activeMusic = this.syncLoop(this.activeMusic, tableau.musicAssetId, 0.1);
  }

  playCues(assetIds: string[]): void {
    if (!this.isPhysicalSoundEnabled) return;
    for (const assetId of assetIds) {
      const asset = this.assets.get(assetId);
      if (!asset) continue;
      const audio = new Audio(asset.url);
      audio.volume = 0.32;
      void audio.play();
    }
  }

  playVoice(assetId?: string): void {
    this.activeVoice?.pause();
    this.activeVoice = undefined;
    if (!this.isVoiceEnabled || !assetId) return;
    const asset = this.assets.get(assetId);
    if (!asset || asset.kind !== 'voice') return;
    const voice = new Audio(asset.url);
    voice.volume = 0.82;
    void voice.play();
    this.activeVoice = voice;
  }

  private syncLoop(current: HTMLAudioElement | undefined, assetId: string | undefined, volume: number): HTMLAudioElement | undefined {
    const asset = assetId ? this.assets.get(assetId) : undefined;
    if (!asset) {
      current?.pause();
      return undefined;
    }
    if (current?.dataset.assetId === assetId) return current;
    current?.pause();
    const next = new Audio(asset.url);
    next.dataset.assetId = assetId;
    next.loop = true;
    next.volume = volume;
    void next.play();
    return next;
  }
}
