import './styles.css';
import { CompiledExperience, type Actor, type Appearance, type CompiledAsset, type Moment, type Tableau } from '../core/contracts';
import { actorHue, presentLine } from '../core/presentation';
import { DEFAULT_PREFS, PREF_OPTIONS, audioChannels, autoAdvanceMs, canPlayThrough, cyclePref, masterLevel, revealMsPerChar, SKIP_HOLD_MS, type Playback, type ReaderPrefs } from '../core/reader-prefs';
import { availableChoiceOptions, backlog, currentMoment, initialReaderStateFromLink, reduceReader, resumeReaderState, type ReaderAction, type ReaderState } from '../core/reader-state';
import { AudioDirector } from './audio-director';
import { ProgressStore, type ProgressRecord } from './progress-store';

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

type CatalogEntry = { id: string; title: string; subtitle: string; url: string; coverUrl: string; chapters: number; moments: number };
type Catalog = { defaultExperienceId: string; experiences: CatalogEntry[] };

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing app root');

root.innerHTML = `
  <section class="reader-shell" data-tone="neutral">
    <div class="stage" tabindex="0" aria-label="Advance story">
      <img class="backdrop backdrop-previous" alt="" aria-hidden="true" />
      <img class="backdrop" alt="" />
      <div class="plate-scrim"></div>
      <div class="pov-veil" aria-hidden="true"></div>
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
      <div class="ending-layer" hidden>
        <span class="choice-posture">END OF PASSAGE</span>
        <p class="choice-heading ending-title"></p>
        <div class="ending-actions">
          <button type="button" class="choice-option" data-action="restart"><strong>Read again</strong><span>Start this Experience from its first moment</span></button>
          <button type="button" class="choice-option" data-action="home"><strong>Back to menu</strong><span>Choose another Experience</span></button>
        </div>
      </div>
      <div class="backlog-layer" hidden></div>
      <div class="insight-toast" role="status" aria-live="polite" hidden><span class="insight-eyebrow">INSIGHT</span><strong class="insight-title"></strong></div>
      <aside class="settings-layer" aria-label="Reader settings" hidden>
        <span class="settings-eyebrow">READER SETTINGS</span>
        <span class="settings-group">Text</span>
        <button type="button" class="setting-row" data-pref="textSpeed">
          <span><strong>Text speed</strong><small>How lines are revealed</small></span>
          <b data-pref-value="textSpeed"></b>
        </button>
        <button type="button" class="setting-row" data-pref="textSize">
          <span><strong>Text size</strong><small>Dialogue and narration</small></span>
          <b data-pref-value="textSize"></b>
        </button>
        <button type="button" class="setting-row" data-pref="boxOpacity">
          <span><strong>Text box</strong><small>How much stage shows through</small></span>
          <b data-pref-value="boxOpacity"></b>
        </button>
        <span class="settings-group">Playback</span>
        <button type="button" class="setting-row" data-pref="autoDelay">
          <span><strong>Auto pace</strong><small>Pause after each line in AUTO</small></span>
          <b data-pref-value="autoDelay"></b>
        </button>
        <span class="settings-group">Sound</span>
        <button type="button" class="setting-row" data-pref="volume">
          <span><strong>Volume</strong><small>Master level for every sound</small></span>
          <b data-pref-value="volume"></b>
        </button>
        <button type="button" class="setting-row" data-pref="music">
          <span><strong>Music</strong><small>Background score per scene</small></span>
          <b data-pref-value="music"></b>
        </button>
        <button type="button" class="setting-row" data-pref="sfx">
          <span><strong>Sound effects</strong><small>Ambience beds and material cues</small></span>
          <b data-pref-value="sfx"></b>
        </button>
        <button type="button" class="setting-row" data-pref="voice">
          <span><strong>Voice-over</strong><small class="voice-setting-note">Cast voices and narrator</small></span>
          <b data-pref-value="voice"></b>
        </button>
        <p>Beds duck under spoken lines; AUTO waits for the line to finish. Preferences are kept on this device.</p>
      </aside>
      <footer class="text-rail">
        <div class="text-copy">
          <span class="moment-label"></span>
          <strong class="speaker"><span class="speaker-name"></span><i class="voice-meter" aria-hidden="true"><b></b><b></b><b></b><b></b></i></strong>
          <p class="line"></p>
        </div>
        <span class="advance-cue" aria-hidden="true"></span>
      </footer>
      <nav class="transport" aria-label="Reading controls">
        <button type="button" data-action="home"><img class="transport-logo" src="/icon-192.png" alt="" />MENU</button>
        <button type="button" data-action="back">BACK</button>
        <button type="button" data-action="backlog">LOG</button>
        <button type="button" data-action="auto" aria-pressed="false">AUTO</button>
        <button type="button" data-action="skip" aria-pressed="false">SKIP</button>
        <button type="button" data-action="settings" aria-expanded="false">SETTINGS</button>
        <span class="progress"></span>
        <button type="button" data-action="next">NEXT</button>
      </nav>
      <section class="home-layer" aria-label="Experience menu" hidden>
        <header class="home-header">
          <img class="home-logo" src="/icon-512.png" alt="VNMMO" />
          <div>
            <span class="eyebrow">VNMMO</span>
            <h1>Choose an Experience</h1>
          <p>Reader-paced visual novels compiled from authorized world state. Progress is kept on this device.</p>
          </div>
        </header>
        <div class="home-grid"></div>
        <p class="home-hint">ENTER · read &nbsp; ESC · menu &nbsp; ↑ · back &nbsp; TAB · log &nbsp; A · auto &nbsp; S · skip &nbsp; 1–9 · choose</p>
      </section>
    </div>
    <p class="source-note"></p>
  </section>`;

const shell = root.querySelector<HTMLElement>('.reader-shell')!;
const stage = root.querySelector<HTMLElement>('.stage')!;
const backdrop = root.querySelector<HTMLImageElement>('.backdrop:not(.backdrop-previous)')!;
const backdropPrevious = root.querySelector<HTMLImageElement>('.backdrop-previous')!;
const insightToast = root.querySelector<HTMLElement>('.insight-toast')!;
const insightTitle = root.querySelector<HTMLElement>('.insight-title')!;
const advanceCue = root.querySelector<HTMLElement>('.advance-cue')!;
const autoButton = root.querySelector<HTMLButtonElement>('[data-action="auto"]')!;
const skipButton = root.querySelector<HTMLButtonElement>('[data-action="skip"]')!;
const figures = root.querySelector<HTMLElement>('.figures')!;
const cutInWrap = root.querySelector<HTMLElement>('.cut-in-wrap')!;
const cutIn = root.querySelector<HTMLImageElement>('.cut-in')!;
const atmosphereBack = root.querySelector<HTMLElement>('.atmosphere-back')!;
const atmosphereFront = root.querySelector<HTMLElement>('.atmosphere-front')!;
const artifactWrap = root.querySelector<HTMLElement>('.artifact-wrap')!;
const artifact = root.querySelector<HTMLImageElement>('.artifact')!;
const choiceLayer = root.querySelector<HTMLElement>('.choice-layer')!;
const endingLayer = root.querySelector<HTMLElement>('.ending-layer')!;
const endingTitle = root.querySelector<HTMLElement>('.ending-title')!;
const homeLayer = root.querySelector<HTMLElement>('.home-layer')!;
const homeGrid = root.querySelector<HTMLElement>('.home-grid')!;
const backlogLayer = root.querySelector<HTMLElement>('.backlog-layer')!;
const settingsLayer = root.querySelector<HTMLElement>('.settings-layer')!;
const line = root.querySelector<HTMLElement>('.line')!;
const speaker = root.querySelector<HTMLElement>('.speaker')!;
const speakerName_ = root.querySelector<HTMLElement>('.speaker-name')!;
const povVeil = root.querySelector<HTMLElement>('.pov-veil')!;
const momentLabel = root.querySelector<HTMLElement>('.moment-label')!;
const chapter = root.querySelector<HTMLElement>('.chapter')!;
const locationLabel = root.querySelector<HTMLElement>('.location')!;
const viewpointLabel = root.querySelector<HTMLElement>('.viewpoint')!;
const progress = root.querySelector<HTMLElement>('.progress')!;
const sourceNote = root.querySelector<HTMLElement>('.source-note')!;
const settingsButton = root.querySelector<HTMLButtonElement>('[data-action="settings"]')!;
const voiceButton = root.querySelector<HTMLButtonElement>('[data-pref="voice"]')!;
const voiceSettingNote = root.querySelector<HTMLElement>('.voice-setting-note')!;

let catalog: Catalog;
let experience: CompiledExperience;
let state: ReaderState;
let audio: AudioDirector;
let prefs: ReaderPrefs = DEFAULT_PREFS;
let playback: Playback = 'manual';
const progressStore = new ProgressStore();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** One line reveal at a time; a click during reveal completes it instead of advancing. */
const reveal = {
  frame: 0,
  timer: 0,
  text: '',
  complete: true,
};

function cancelReveal(): void {
  cancelAnimationFrame(reveal.frame);
  clearTimeout(reveal.timer);
  reveal.frame = 0;
  reveal.timer = 0;
}

function finishReveal(): void {
  cancelReveal();
  reveal.complete = true;
  line.textContent = reveal.text;
  shell.dataset.revealing = 'false';
  schedulePlayback();
}

function startReveal(text: string): void {
  cancelReveal();
  reveal.text = text;
  const perChar = revealMsPerChar(prefs, reducedMotion.matches);
  if (perChar === 0 || playback === 'skip') {
    finishReveal();
    return;
  }
  reveal.complete = false;
  shell.dataset.revealing = 'true';
  line.textContent = '';
  const startedAt = performance.now();
  const step = (now: number): void => {
    const shown = Math.min(text.length, Math.floor((now - startedAt) / perChar));
    line.textContent = text.slice(0, shown);
    if (shown >= text.length) {
      finishReveal();
      return;
    }
    reveal.frame = requestAnimationFrame(step);
  };
  reveal.frame = requestAnimationFrame(step);
}

/** AUTO waits a reading pause after the reveal; SKIP steps through seen text on a short hold. */
function schedulePlayback(): void {
  clearTimeout(reveal.timer);
  if (!reveal.complete || shell.dataset.view !== 'reading') return;
  if (!canPlayThrough(experience, state, playback)) {
    if (playback === 'skip') setPlayback('manual');
    return;
  }
  if (playback === 'auto' && audio.isSpeaking) return;
  const delay = playback === 'skip' ? SKIP_HOLD_MS : autoAdvanceMs(prefs, reveal.text, spokenCurrentLine);
  reveal.timer = window.setTimeout(() => dispatch({ type: 'advance' }), delay);
}

/** AUTO/SKIP idle at a fork rather than dropping to manual; the reader's pick resumes them. */
function isAwaitingChoice(): boolean {
  return shell.dataset.view === 'reading' && currentMoment(experience, state).next.type === 'choice';
}

function setPlayback(next: Playback): void {
  playback = playback === next ? 'manual' : next;
  shell.dataset.playback = playback;
  autoButton.setAttribute('aria-pressed', String(playback === 'auto'));
  skipButton.setAttribute('aria-pressed', String(playback === 'skip'));
  if (playback === 'skip' && !reveal.complete) finishReveal();
  else schedulePlayback();
}

function applyPrefs(): void {
  shell.dataset.textSize = prefs.textSize;
  shell.dataset.boxOpacity = prefs.boxOpacity;
  audio?.setMasterLevel(masterLevel(prefs));
  audio?.setChannels(audioChannels(prefs));
  for (const key of Object.keys(PREF_OPTIONS) as (keyof ReaderPrefs)[]) {
    const value = settingsLayer.querySelector<HTMLElement>(`[data-pref-value="${key}"]`);
    if (value) value.textContent = prefs[key].toUpperCase();
  }
}

function setPref(key: keyof ReaderPrefs): void {
  prefs = cyclePref(prefs, key);
  applyPrefs();
  void progressStore.putPrefs(prefs);
  if (key === 'textSpeed' && !reveal.complete) startReveal(reveal.text);
  if (key === 'autoDelay') schedulePlayback();
  if (key === 'voice' && shell.dataset.view === 'reading') speak(prefs.voice === 'on' ? currentMoment(experience, state).voiceAssetId : undefined);
}

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

/**
 * Figures persist across moments keyed by actor so a re-staged actor glides/re-lights
 * instead of hard-cutting; actors leaving the tableau fade out before removal.
 */
function renderFigures(tableau: Tableau, moment: Moment, assets: Map<string, CompiledAsset>): void {
  const staged = new Set(tableau.figures.map((placement) => placement.actorId));
  for (const existing of figures.querySelectorAll<HTMLImageElement>('.figure')) {
    if (staged.has(existing.dataset.actorId!) || existing.classList.contains('figure-leaving')) continue;
    existing.classList.add('figure-leaving');
    const remove = (): void => existing.remove();
    existing.addEventListener('transitionend', remove, { once: true });
    if (reducedMotion.matches) remove();
  }
  for (const placement of tableau.figures) {
    const actor = byId(experience.actors, placement.actorId);
    const appearance = resolveAppearance(actor, placement.appearanceId);
    const asset = assets.get(appearance.assetId)!;
    let image = figures.querySelector<HTMLImageElement>(`.figure:not(.figure-leaving)[data-actor-id="${actor.id}"]`);
    const entering = !image && !reducedMotion.matches;
    if (!image) {
      image = document.createElement('img');
      image.className = 'figure';
      image.dataset.actorId = actor.id;
      figures.append(image);
    }
    const speaking = moment.speakerId === actor.id;
    const outsidePov = moment.viewpoint.kind === 'private' && moment.viewpoint.holderId !== actor.id;
    image.className = `figure figure-${placement.emphasis} figure-projection-${appearance.projection}${speaking ? ' figure-speaking' : ''}${outsidePov ? ' figure-outside-pov' : ''}${entering ? ' figure-entering' : ''}`;
    image.style.setProperty('--actor-hue', String(actorHue(actor.id)));
    if (image.dataset.appearanceId !== appearance.id) {
      image.src = asset.url;
      image.alt = appearance.stageName;
      image.dataset.appearanceId = appearance.id;
    }
    image.style.left = `${SLOT_POSITION[placement.slot]}%`;
    image.style.height = `${actor.stageHeightPercent * PROJECTION_SCALE[appearance.projection]}%`;
    image.style.transform = `translateX(-50%) ${facingTransform(appearance, placement.facing, placement.slot)}`;
    if (entering) requestAnimationFrame(() => image!.classList.remove('figure-entering'));
  }
}

/** Crossfade when the plate changes; the previous plate holds underneath while the new one fades in. */
function renderBackdrop(url: string): void {
  if (backdrop.dataset.url === url) return;
  if (backdrop.dataset.url && !reducedMotion.matches) {
    backdropPrevious.src = backdrop.src;
    backdropPrevious.hidden = false;
    backdrop.classList.remove('backdrop-fading');
    void backdrop.offsetWidth;
    backdrop.classList.add('backdrop-fading');
    backdrop.addEventListener('animationend', () => { backdropPrevious.hidden = true; }, { once: true });
  }
  backdrop.src = url;
  backdrop.dataset.url = url;
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

function viewpointSide(moment: Moment, tableau: Tableau): 'left' | 'center' | 'right' {
  if (moment.viewpoint.kind === 'public') return 'center';
  const holderId = moment.viewpoint.holderId;
  const placement = tableau.figures.find((figure) => figure.actorId === holderId);
  if (!placement) return 'center';
  const position = SLOT_POSITION[placement.slot]!;
  return position < 42 ? 'left' : position > 58 ? 'right' : 'center';
}

function renderChoice(moment: Moment): void {
  choiceLayer.replaceChildren();
  if (moment.next.type !== 'choice') {
    choiceLayer.hidden = true;
    return;
  }
  const posture = document.createElement('span');
  posture.className = 'choice-posture';
  posture.textContent = {
    observe: 'ATTENTION · HIDDEN PERSPECTIVE',
    interpret: 'READING · PERSPECTIVE',
    predict: 'FORECAST · READER MODEL',
    decide: 'DECISION · BRANCH',
  }[moment.next.purpose];
  const heading = document.createElement('p');
  heading.className = 'choice-heading';
  heading.textContent = moment.next.prompt;
  choiceLayer.className = `choice-layer choice-${moment.next.weight}`;
  choiceLayer.append(posture, heading);
  availableChoiceOptions(moment, state).forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-option';
    button.dataset.optionId = option.id;
    button.style.setProperty('--enter-delay', `${index * 70}ms`);
    const key = document.createElement('kbd');
    key.textContent = String(index + 1);
    const label = document.createElement('strong');
    label.textContent = option.label;
    const consequence = document.createElement('span');
    consequence.textContent = option.consequence;
    button.append(key, label, consequence);
    choiceLayer.append(button);
  });
  choiceLayer.hidden = false;
}

let insightTimer = 0;
function showInsights(insightIds: string[]): void {
  const gained = experience.readerInsights.filter((insight) => insightIds.includes(insight.id));
  if (gained.length === 0) return;
  insightTitle.textContent = gained.map((insight) => insight.meaning).join(' · ');
  insightToast.hidden = false;
  clearTimeout(insightTimer);
  insightTimer = window.setTimeout(() => { insightToast.hidden = true; }, 3200);
}

function renderEnding(moment: Moment): void {
  endingLayer.hidden = moment.next.type !== 'end';
  endingTitle.textContent = experience.title;
}

function renderHome(progress: Map<string, ProgressRecord>): void {
  homeGrid.replaceChildren();
  for (const entry of catalog.experiences) {
    const saved = progress.get(entry.id);
    const card = document.createElement('article');
    card.className = 'home-card';
    card.dataset.storyId = entry.id;
    const cover = document.createElement('img');
    cover.className = 'home-cover';
    cover.src = entry.coverUrl;
    cover.alt = '';
    const body = document.createElement('div');
    body.className = 'home-card-body';
    const title = document.createElement('h2');
    title.textContent = entry.title;
    const subtitle = document.createElement('p');
    subtitle.textContent = entry.subtitle;
    const meta = document.createElement('span');
    meta.className = 'home-meta';
    const read = saved ? saved.state.seenNodeIds.length : 0;
    meta.textContent = `${entry.chapters} ${entry.chapters === 1 ? 'chapter' : 'chapters'} · ${entry.moments} moments${saved ? ` · ${Math.min(100, Math.round((read / entry.moments) * 100))}% read` : ''}`;
    if (saved) {
      const bar = document.createElement('span');
      bar.className = 'home-progress';
      bar.style.setProperty('--read', `${Math.min(100, (read / entry.moments) * 100)}%`);
      cover.after(bar);
    }
    const actions = document.createElement('div');
    actions.className = 'home-actions';
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'home-open';
    open.dataset.openStory = entry.id;
    open.dataset.resume = saved ? 'true' : 'false';
    open.textContent = saved ? 'RESUME' : 'READ';
    actions.append(open);
    if (saved) {
      const restart = document.createElement('button');
      restart.type = 'button';
      restart.className = 'home-restart';
      restart.dataset.openStory = entry.id;
      restart.dataset.resume = 'false';
      restart.textContent = 'START OVER';
      actions.append(restart);
    }
    body.append(title, subtitle, meta, actions);
    card.append(cover, body);
    homeGrid.append(card);
  }
  homeLayer.hidden = false;
  shell.dataset.view = 'home';
  const url = new URL(window.location.href);
  url.searchParams.delete('story');
  url.searchParams.delete('moment');
  window.history.replaceState(null, '', url);
  homeGrid.querySelector<HTMLButtonElement>('.home-open')?.focus();
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
    const presented = presentLine(experience, moment, undefined, speakerName(moment));
    name.textContent = presented.speakerName || presented.eyebrow;
    if (presented.speakerHue !== undefined) name.style.setProperty('--actor-hue', String(presented.speakerHue));
    entry.className = `backlog-entry backlog-${presented.register}`;
    const text = document.createElement('p');
    text.textContent = presented.text;
    entry.append(name, text);
    backlogLayer.append(entry);
  }
  backlogLayer.hidden = false;
}

function renderSettings(): void {
  const hasVoice = experience.moments.some((moment) => Boolean(moment.voiceAssetId));
  settingsLayer.hidden = !state.isSettingsOpen;
  settingsButton.setAttribute('aria-expanded', String(state.isSettingsOpen));
  voiceButton.disabled = !hasVoice;
  voiceSettingNote.textContent = hasVoice ? 'Cast voices and narrator' : 'Not present in this Experience';
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
  void progressStore.put({ experienceId: experience.id, state });
  shell.dataset.view = 'reading';
  homeLayer.hidden = true;
  shell.dataset.tone = tableau.tone;
  const previousId = shell.dataset.momentId;
  const previous = previousId ? experience.moments.find((candidate) => candidate.id === previousId) : undefined;
  const presented = presentLine(experience, moment, previous, speakerName(moment));
  shell.dataset.momentId = moment.id;
  shell.dataset.mode = moment.mode;
  shell.dataset.viewpoint = moment.viewpoint.kind;
  shell.dataset.povSide = viewpointSide(moment, tableau);
  renderPovShift(presented.povShift);
  renderBackdrop(background.url);
  chapter.textContent = moment.chapter;
  locationLabel.textContent = tableau.location;
  viewpointLabel.textContent = moment.viewpoint.kind === 'public'
    ? 'PUBLIC VIEW'
    : `${byId(experience.actors, moment.viewpoint.holderId).name.toUpperCase()} · PRIVATE`;
  momentLabel.textContent = presented.eyebrow;
  speakerName_.textContent = presented.speakerName;
  speaker.hidden = !presented.speakerName;
  if (presented.speakerHue !== undefined) speaker.style.setProperty('--actor-hue', String(presented.speakerHue));
  line.className = `line line-${presented.register}${presented.quoted ? ' line-quoted' : ''}`;
  if (reveal.text !== presented.text || !reveal.complete) startReveal(presented.text);
  else schedulePlayback();
  progress.textContent = `${String(ordinal).padStart(2, '0')} / ${String(experience.moments.length).padStart(2, '0')}`;
  renderFigures(tableau, moment, assets);
  renderCutIn(tableau, assets);
  renderAtmosphere(tableau);
  renderArtifact(tableau, assets);
  renderChoice(moment);
  renderEnding(moment);
  renderBacklog();
  renderSettings();
  audio.sync(tableau);
}

/**
 * A change of viewpoint is a camera move, not a label swap: the veil irises in
 * on the holder (or lifts back to the public plate) and the badge re-enters.
 */
function renderPovShift(shift: ReturnType<typeof presentLine>['povShift']): void {
  povVeil.style.setProperty('--pov-x', { left: '29%', center: '50%', right: '71%' }[shell.dataset.povSide ?? 'center']!);
  if (shift === 'none' || reducedMotion.matches) return;
  shell.dataset.povShift = shift;
  for (const element of [shell, viewpointLabel]) {
    element.classList.remove('pov-shifting');
    void element.offsetWidth;
    element.classList.add('pov-shifting');
  }
}

function advance(): void {
  if (!reveal.complete) return finishReveal();
  dispatch({ type: 'advance' });
}

function dispatch(action: ReaderAction): void {
  if (shell.dataset.view === 'home') return;
  if (playback !== 'manual' && (action.type === 'back' || action.type === 'restart' || action.type === 'toggle-backlog' || action.type === 'toggle-settings')) setPlayback('manual');
  const before = currentMoment(experience, state);
  const nextState = reduceReader(experience, state, action);
  const didMove = nextState.currentNodeId !== state.currentNodeId;
  const gainedInsights = nextState.insightIds.filter((id) => !state.insightIds.includes(id));
  state = nextState;
  render();
  if (didMove) {
    const current = currentMoment(experience, state);
    audio.playCues(current.cueAssetIds);
    speak(current.voiceAssetId);
    showInsights(gainedInsights);
  }
}

/** Whether the line on screen has a spoken rendition playing; AUTO paces off it instead of text length. */
let spokenCurrentLine = false;

function speak(voiceAssetId: string | undefined): void {
  audio.playVoice(voiceAssetId);
  spokenCurrentLine = audio.isSpeaking;
  shell.dataset.speaking = String(audio.isSpeaking);
}

async function openExperience(entry: CatalogEntry, entryPoint: { momentId?: string; resume: boolean }): Promise<void> {
  const [response, saved] = await Promise.all([fetch(entry.url), entryPoint.resume ? progressStore.get(entry.id) : progressStore.clear(entry.id).then(() => null)]);
  if (!response.ok) throw new Error('Prepared experience is missing. Run npm run build:experience.');
  experience = await response.json() as CompiledExperience;
  state = entryPoint.momentId ? initialReaderStateFromLink(experience, entryPoint.momentId) : resumeReaderState(experience, saved?.state);
  audio?.stop();
  audio = new AudioDirector(new Map(experience.assets.map((asset) => [asset.id, asset])));
  audio.setMasterLevel(masterLevel(prefs));
  audio.setChannels(audioChannels(prefs));
  audio.onVoiceEnd = () => {
    shell.dataset.speaking = 'false';
    schedulePlayback();
  };
  sourceNote.textContent = `${experience.title} · ${experience.source.note}`;
  reveal.text = '';
  backdrop.dataset.url = '';
  delete shell.dataset.momentId;
  figures.replaceChildren();
  shell.dataset.view = 'reading';
  shell.classList.remove('shell-opening');
  void shell.offsetWidth;
  shell.classList.add('shell-opening');
  render();
  speak(currentMoment(experience, state).voiceAssetId);
  stage.focus();
}

async function goHome(): Promise<void> {
  cancelReveal();
  if (playback !== 'manual') setPlayback(playback);
  audio?.stop();
  renderHome(await progressStore.all());
}

for (const gesture of ['pointerdown', 'keydown'] as const) {
  window.addEventListener(gesture, () => audio?.unlock(), { passive: true });
}

root.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const opener = target.closest<HTMLButtonElement>('[data-open-story]');
  if (opener?.dataset.openStory) {
    const entry = catalog.experiences.find((candidate) => candidate.id === opener.dataset.openStory);
    if (!entry) return;
    void openExperience(entry, { resume: opener.dataset.resume === 'true' });
    return;
  }
  if (shell.dataset.view === 'home') return;
  const option = target.closest<HTMLButtonElement>('[data-option-id]');
  if (option?.dataset.optionId) return dispatch({ type: 'choose', optionId: option.dataset.optionId });
  const action = target.closest<HTMLButtonElement>('[data-action]')?.dataset.action;
  if (action === 'home') return void goHome();
  if (action === 'restart') return dispatch({ type: 'restart' });
  if (action === 'back') return dispatch({ type: 'back' });
  if (action === 'backlog') return dispatch({ type: 'toggle-backlog' });
  if (action === 'settings') return dispatch({ type: 'toggle-settings' });
  if (action === 'auto') return setPlayback('auto');
  if (action === 'skip') return setPlayback('skip');
  if (action === 'next') return advance();
  const pref = target.closest<HTMLButtonElement>('[data-pref]')?.dataset.pref as keyof ReaderPrefs | undefined;
  if (pref) return setPref(pref);
  if (target.closest('.context-rail') || target.closest('.settings-layer') || target.closest('.transport')) return;
  if (isAwaitingChoice()) return void (reveal.complete || finishReveal());
  if (playback !== 'manual') return setPlayback(playback);
  advance();
});

window.addEventListener('keydown', (event) => {
  if (shell.dataset.view === 'home') return;
  if (event.key === 'Escape') {
    if (state.isSettingsOpen || state.isBacklogOpen) return dispatch({ type: state.isSettingsOpen ? 'toggle-settings' : 'toggle-backlog' });
    return void goHome();
  }
  if (event.key === 'ArrowUp') dispatch({ type: 'back' });
  if (event.key === 'Tab') {
    event.preventDefault();
    dispatch({ type: 'toggle-backlog' });
  }
  if (event.key === 'a' || event.key === 'A') setPlayback('auto');
  if (event.key === 's' || event.key === 'S') setPlayback('skip');
  if (/^[1-9]$/.test(event.key) && !choiceLayer.hidden && reveal.complete) {
    const option = choiceLayer.querySelectorAll<HTMLButtonElement>('[data-option-id]')[Number(event.key) - 1];
    if (option?.dataset.optionId) dispatch({ type: 'choose', optionId: option.dataset.optionId });
  }
  if ([' ', 'Enter', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    if (isAwaitingChoice()) return void (reveal.complete || finishReveal());
    if (playback !== 'manual') return setPlayback(playback);
    advance();
  }
});

async function start(): Promise<void> {
  const catalogResponse = await fetch('/generated/catalog.json');
  if (!catalogResponse.ok) throw new Error('Prepared catalog is missing. Run npm run build:experience.');
  catalog = await catalogResponse.json() as Catalog;
  if (catalog.experiences.length === 0) throw new Error('Prepared catalog has no experiences.');
  prefs = await progressStore.prefs();
  applyPrefs();
  shell.dataset.playback = playback;
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('story');
  const selected = requestedId ? catalog.experiences.find((candidate) => candidate.id === requestedId) : undefined;
  if (!selected) {
    renderHome(await progressStore.all());
    return;
  }
  const momentId = params.get('moment');
  await openExperience(selected, momentId ? { momentId, resume: true } : { resume: true });
}

void start();
