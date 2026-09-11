import type { CompiledAsset, Tableau } from '../core/contracts';

export class AudioDirector {
  private activeAmbience: HTMLAudioElement | undefined;
  private activeMusic: HTMLAudioElement | undefined;
  private isEnabled = false;

  constructor(private readonly assets: Map<string, CompiledAsset>) {}

  setEnabled(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
    if (!isEnabled) {
      this.activeAmbience?.pause();
      this.activeMusic?.pause();
    }
  }

  sync(tableau: Tableau): void {
    if (!this.isEnabled) return;
    this.activeAmbience = this.syncLoop(this.activeAmbience, tableau.ambienceAssetId, 0.2);
    this.activeMusic = this.syncLoop(this.activeMusic, tableau.musicAssetId, 0.1);
  }

  playCues(assetIds: string[]): void {
    if (!this.isEnabled) return;
    for (const assetId of assetIds) {
      const asset = this.assets.get(assetId);
      if (!asset) continue;
      const audio = new Audio(asset.url);
      audio.volume = 0.32;
      void audio.play();
    }
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
