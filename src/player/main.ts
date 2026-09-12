import './styles.css';
import { CompiledExperience, type Actor, type Appearance, type CompiledAsset, type Moment, type Tableau } from '../core/contracts';
import { backlog, currentMoment, initialReaderState, reduceReader, type ReaderAction, type ReaderState } from '../core/reader-state';
import { AudioDirector } from './audio-director';

const SLOT_POSITION: Record<string, number> = {
  'far-left': 12,
  left: 29,
  center: 50,
  right: 71,
  'far-right': 88,
};

const PROJECTION_SCALE: Record<Appearance['projection'], number> = {
  'full-body': 1,
  'three-quarter': 1.28,
  portrait: 1.55,
};

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing app root');

root.innerHTML = `
  <section class="reader-shell" data-tone="neutral">
    <div class="stage" tabindex="0" aria-label="Advance story">
      <img class="backdrop" alt="" />
      <div class="plate-scrim"></div>
      <div class="cut-in-wrap" aria-hidden="true"><img class="cut-in" alt="" /></div>
      <div class="atmosphere atmosphere-back" aria-hidden="true"></div>
      <header class="context-rail">
        <div><span class="eyebrow chapter"></span><strong class="location"></strong></div>
        <span class="viewpoint"></span>
      </header>
      <div class="figures" aria-hidden="true"></div>
      <div class="atmosphere atmosphere-front" aria-hidden="true"></div>
      <div class="artifact-wrap" aria-hidden="true"><img class="artifact" alt="" /></div>
      <div class="choice-layer" hidden></div>
      <div class="backlog-layer" hidden></div>
      <aside class="settings-layer" aria-label="Reader settings" hidden>
        <span class="settings-eyebrow">READER SETTINGS</span>
        <button type="button" class="setting-row" data-action="audio">
          <span><strong>Physical sound</strong><small>Ambience, music and material cues</small></span>
          <b class="sound-setting-value">OFF</b>
        </button>
        <button type="button" class="setting-row" data-action="voice">
          <span><strong>Voice-over</strong><small class="voice-setting-note">Optional spoken rendition</small></span>
          <b class="voice-setting-value">OFF</b>
        </button>
        <p>Silence is authored. Voice begins off.</p>
      </aside>
      <footer class="text-rail">
        <div class="text-copy">
          <span class="moment-label"></span>
          <strong class="speaker"></strong>
          <p class="line"></p>
        </div>
        <nav class="transport" aria-label="Reading controls">
          <button type="button" data-action="back">BACK</button>
          <button type="button" data-action="backlog">LOG</button>
          <button type="button" data-action="settings" aria-expanded="false">SETTINGS</button>
          <span class="progress"></span>
          <button type="button" data-action="next">NEXT</button>
        </nav>
      </footer>
    </div>
    <p class="source-note"></p>
  </section>`;

const shell = root.querySelector<HTMLElement>('.reader-shell')!;
const stage = root.querySelector<HTMLElement>('.stage')!;
const backdrop = root.querySelector<HTMLImageElement>('.backdrop')!;
const figures = root.querySelector<HTMLElement>('.figures')!;
const cutInWrap = root.querySelector<HTMLElement>('.cut-in-wrap')!;
const cutIn = root.querySelector<HTMLImageElement>('.cut-in')!;
const atmosphereBack = root.querySelector<HTMLElement>('.atmosphere-back')!;
const atmosphereFront = root.querySelector<HTMLElement>('.atmosphere-front')!;
const artifactWrap = root.querySelector<HTMLElement>('.artifact-wrap')!;
const artifact = root.querySelector<HTMLImageElement>('.artifact')!;
const choiceLayer = root.querySelector<HTMLElement>('.choice-layer')!;
const backlogLayer = root.querySelector<HTMLElement>('.backlog-layer')!;
const settingsLayer = root.querySelector<HTMLElement>('.settings-layer')!;
const line = root.querySelector<HTMLElement>('.line')!;
const speaker = root.querySelector<HTMLElement>('.speaker')!;
const momentLabel = root.querySelector<HTMLElement>('.moment-label')!;
const chapter = root.querySelector<HTMLElement>('.chapter')!;
const locationLabel = root.querySelector<HTMLElement>('.location')!;
const viewpointLabel = root.querySelector<HTMLElement>('.viewpoint')!;
const progress = root.querySelector<HTMLElement>('.progress')!;
const sourceNote = root.querySelector<HTMLElement>('.source-note')!;
const settingsButton = root.querySelector<HTMLButtonElement>('[data-action="settings"]')!;
const audioButton = root.querySelector<HTMLButtonElement>('[data-action="audio"]')!;
const voiceButton = root.querySelector<HTMLButtonElement>('[data-action="voice"]')!;
const soundSettingValue = root.querySelector<HTMLElement>('.sound-setting-value')!;
const voiceSettingValue = root.querySelector<HTMLElement>('.voice-setting-value')!;
const voiceSettingNote = root.querySelector<HTMLElement>('.voice-setting-note')!;

let experience: CompiledExperience;
let state: ReaderState;
let audio: AudioDirector;

function byId<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Missing compiled item ${id}`);
  return item;
}

function resolveAppearance(actor: Actor, appearanceId?: string): Appearance {
  return byId(actor.appearances, appearanceId ?? actor.defaultAppearanceId);
}

function facingTransform(appearance: Appearance, facing: 'left' | 'right' | 'inward', slot: string): string {
  const resolved = facing === 'inward' ? (SLOT_POSITION[slot]! < 50 ? 'right' : 'left') : facing;
  return appearance.sourceFacing === resolved ? 'scaleX(1)' : 'scaleX(-1)';
}

function renderFigures(tableau: Tableau, assets: Map<string, CompiledAsset>): void {
  figures.replaceChildren();
  for (const placement of tableau.figures) {
    const actor = byId(experience.actors, placement.actorId);
    const appearance = resolveAppearance(actor, placement.appearanceId);
    const asset = assets.get(appearance.assetId)!;
    const image = document.createElement('img');
    image.className = `figure figure-${placement.emphasis} figure-projection-${appearance.projection}`;
    image.src = asset.url;
    image.alt = appearance.stageName;
    image.style.left = `${SLOT_POSITION[placement.slot]}%`;
    image.style.height = `${actor.stageHeightPercent * PROJECTION_SCALE[appearance.projection]}%`;
    image.style.transform = `translateX(-50%) ${facingTransform(appearance, placement.facing, placement.slot)}`;
    image.dataset.actorId = actor.id;
    image.dataset.appearanceId = appearance.id;
    figures.append(image);
  }
}

function renderCutIn(tableau: Tableau, assets: Map<string, CompiledAsset>): void {
  if (!tableau.cutIn) {
    cutInWrap.hidden = true;
    return;
  }
  cutIn.src = assets.get(tableau.cutIn.assetId)!.url;
  cutInWrap.className = `cut-in-wrap cut-in-${tableau.cutIn.framing}`;
  cutInWrap.hidden = false;
}

function fraction(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function renderAtmosphere(tableau: Tableau): void {
  for (const [layer, container] of [['back', atmosphereBack], ['front', atmosphereFront]] as const) {
    const effects = (tableau.atmosphere ?? []).filter((effect) => effect.layer === layer);
    const signature = JSON.stringify(effects);
    if (container.dataset.signature === signature) continue;
    container.replaceChildren();
    container.dataset.signature = signature;
    effects.forEach((effect, effectIndex) => {
      const region = document.createElement('div');
      region.className = `atmosphere-region atmosphere-${effect.kind}`;
      region.style.left = `${effect.region.left}%`;
      region.style.top = `${effect.region.top}%`;
      region.style.width = `${effect.region.width}%`;
      region.style.height = `${effect.region.height}%`;
      for (let index = 0; index < effect.intensity; index += 1) {
        const particle = document.createElement('i');
        const base = effect.seed + effectIndex * 101 + index * 17;
        particle.style.setProperty('--x', `${fraction(base) * 100}%`);
        particle.style.setProperty('--delay', `${-fraction(base + 1) * 6}s`);
        particle.style.setProperty('--duration', `${2.8 + fraction(base + 2) * 4.2}s`);
        particle.style.setProperty('--drift', `${-10 + fraction(base + 3) * 20}px`);
        particle.style.setProperty('--scale', `${0.55 + fraction(base + 4) * 0.9}`);
        region.append(particle);
      }
      container.append(region);
    });
  }
}

function renderArtifact(tableau: Tableau, assets: Map<string, CompiledAsset>): void {
  if (!tableau.artifact) {
    artifactWrap.hidden = true;
    return;
  }
  const asset = assets.get(tableau.artifact.assetId)!;
  artifact.src = asset.url;
  artifact.className = `artifact artifact-${tableau.artifact.footprint}`;
  artifactWrap.style.left = `${SLOT_POSITION[tableau.artifact.slot]}%`;
  artifactWrap.hidden = false;
}

function speakerName(moment: Moment): string {
  if (!moment.speakerId) return '';
  const actor = byId(experience.actors, moment.speakerId);
  const tableau = byId(experience.tableaux, moment.tableauId);
  const placement = tableau.figures.find((figure) => figure.actorId === actor.id);
  return resolveAppearance(actor, placement?.appearanceId).stageName;
}

function renderChoice(moment: Moment): void {
  choiceLayer.replaceChildren();
  if (moment.next.type !== 'choice') {
    choiceLayer.hidden = true;
    return;
  }
  const posture = document.createElement('span');
  posture.className = 'choice-posture';
  posture.textContent = 'TRAVERSAL · NO WORLD WRITE';
  const heading = document.createElement('p');
  heading.className = 'choice-heading';
  heading.textContent = moment.next.prompt;
  choiceLayer.append(posture, heading);
  for (const option of moment.next.options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-option';
    button.dataset.optionId = option.id;
    const label = document.createElement('strong');
    label.textContent = option.label;
    const consequence = document.createElement('span');
    consequence.textContent = option.consequence;
    button.append(label, consequence);
    choiceLayer.append(button);
  }
  choiceLayer.hidden = false;
}

function renderBacklog(): void {
  backlogLayer.replaceChildren();
  if (!state.isBacklogOpen) {
    backlogLayer.hidden = true;
    return;
  }
  const heading = document.createElement('div');
  heading.className = 'backlog-heading';
  heading.textContent = 'PASSAGE LOG';
  backlogLayer.append(heading);
  for (const moment of backlog(experience, state).toReversed()) {
    const entry = document.createElement('div');
    entry.className = 'backlog-entry';
    const name = document.createElement('strong');
    name.textContent = speakerName(moment) || moment.label || moment.mode;
    const text = document.createElement('p');
    text.textContent = moment.text;
    entry.append(name, text);
    backlogLayer.append(entry);
  }
  backlogLayer.hidden = false;
}

function renderSettings(): void {
  const hasVoice = experience.moments.some((moment) => Boolean(moment.voiceAssetId));
  settingsLayer.hidden = !state.isSettingsOpen;
  settingsButton.setAttribute('aria-expanded', String(state.isSettingsOpen));
  soundSettingValue.textContent = state.isMuted ? 'OFF' : 'ON';
  voiceSettingValue.textContent = state.isVoiceEnabled ? 'ON' : 'OFF';
  voiceButton.disabled = !hasVoice;
  voiceSettingNote.textContent = hasVoice ? 'Optional spoken rendition' : 'Not present in this Experience';
}

function render(): void {
  const assets = new Map(experience.assets.map((asset) => [asset.id, asset]));
  const moment = currentMoment(experience, state);
  const tableau = byId(experience.tableaux, moment.tableauId);
  const background = assets.get(tableau.backgroundAssetId)!;
  const ordinal = experience.moments.findIndex((candidate) => candidate.id === moment.id) + 1;
  const url = new URL(window.location.href);
  url.searchParams.set('story', experience.id);
  url.searchParams.set('moment', moment.id);
  window.history.replaceState(null, '', url);
  shell.dataset.tone = tableau.tone;
  shell.dataset.mode = moment.mode;
  backdrop.src = background.url;
  chapter.textContent = moment.chapter;
  locationLabel.textContent = tableau.location;
  viewpointLabel.textContent = moment.viewpoint.kind === 'public'
    ? 'PUBLIC VIEW'
    : `${byId(experience.actors, moment.viewpoint.holderId).name.toUpperCase()} · PRIVATE`;
  momentLabel.textContent = moment.label || moment.mode;
  speaker.textContent = speakerName(moment);
  speaker.hidden = !moment.speakerId;
  line.textContent = moment.text;
  line.className = `line line-${moment.mode}`;
  progress.textContent = `${String(ordinal).padStart(2, '0')} / ${String(experience.moments.length).padStart(2, '0')}`;
  renderFigures(tableau, assets);
  renderCutIn(tableau, assets);
  renderAtmosphere(tableau);
  renderArtifact(tableau, assets);
  renderChoice(moment);
  renderBacklog();
  renderSettings();
  audio.setPhysicalSoundEnabled(!state.isMuted);
  audio.setVoiceEnabled(state.isVoiceEnabled);
  audio.sync(tableau);
}

function dispatch(action: ReaderAction): void {
  const before = currentMoment(experience, state);
  const nextState = reduceReader(experience, state, action);
  const didMove = nextState.currentNodeId !== state.currentNodeId;
  state = nextState;
  render();
  if (didMove) {
    const current = currentMoment(experience, state);
    audio.playCues(current.cueAssetIds);
    audio.playVoice(current.voiceAssetId);
  }
  if (action.type === 'toggle-muted' && !state.isMuted) audio.playCues(before.cueAssetIds);
  if (action.type === 'toggle-voice' && state.isVoiceEnabled) audio.playVoice(before.voiceAssetId);
}

root.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const option = target.closest<HTMLButtonElement>('[data-option-id]');
  if (option?.dataset.optionId) return dispatch({ type: 'choose', optionId: option.dataset.optionId });
  const action = target.closest<HTMLButtonElement>('[data-action]')?.dataset.action;
  if (action === 'back') return dispatch({ type: 'back' });
  if (action === 'backlog') return dispatch({ type: 'toggle-backlog' });
  if (action === 'settings') return dispatch({ type: 'toggle-settings' });
  if (action === 'audio') return dispatch({ type: 'toggle-muted' });
  if (action === 'voice') return dispatch({ type: 'toggle-voice' });
  if (action === 'next') return dispatch({ type: 'advance' });
  if (target.closest('.text-rail') || target.closest('.context-rail') || target.closest('.settings-layer')) return;
  dispatch({ type: 'advance' });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') dispatch({ type: 'back' });
  if (event.key === 'Tab') {
    event.preventDefault();
    dispatch({ type: 'toggle-backlog' });
  }
  if ([' ', 'Enter', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    dispatch({ type: 'advance' });
  }
});

async function start(): Promise<void> {
  const catalogResponse = await fetch('/generated/catalog.json');
  if (!catalogResponse.ok) throw new Error('Prepared catalog is missing. Run npm run build:experience.');
  const catalog = await catalogResponse.json() as {
    defaultExperienceId: string;
    experiences: { id: string; url: string }[];
  };
  const requestedId = new URLSearchParams(window.location.search).get('story') ?? catalog.defaultExperienceId;
  const selected = catalog.experiences.find((candidate) => candidate.id === requestedId) ?? catalog.experiences[0];
  if (!selected) throw new Error('Prepared catalog has no experiences.');
  const response = await fetch(selected.url);
  if (!response.ok) throw new Error('Prepared experience is missing. Run npm run build:experience.');
  experience = await response.json() as CompiledExperience;
  const requestedMomentId = new URLSearchParams(window.location.search).get('moment');
  const startMomentId = requestedMomentId && experience.moments.some((moment) => moment.id === requestedMomentId)
    ? requestedMomentId
    : experience.startNodeId;
  state = initialReaderState(experience, startMomentId);
  audio = new AudioDirector(new Map(experience.assets.map((asset) => [asset.id, asset])));
  sourceNote.textContent = `${experience.title} · ${experience.source.note}`;
  render();
  stage.focus();
}

void start();
