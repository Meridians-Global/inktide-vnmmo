import './styles.css';
import { CompiledExperience, type Actor, type CompiledAsset, type Moment, type Tableau } from '../core/contracts';
import { backlog, currentMoment, initialReaderState, reduceReader, type ReaderAction, type ReaderState } from '../core/reader-state';
import { AudioDirector } from './audio-director';

const SLOT_POSITION: Record<string, number> = {
  'far-left': 12,
  left: 29,
  center: 50,
  right: 71,
  'far-right': 88,
};

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing app root');

root.innerHTML = `
  <section class="reader-shell" data-tone="neutral">
    <div class="stage" tabindex="0" aria-label="Advance story">
      <img class="backdrop" alt="" />
      <div class="plate-scrim"></div>
      <header class="context-rail">
        <div><span class="eyebrow chapter"></span><strong class="location"></strong></div>
        <span class="viewpoint"></span>
      </header>
      <div class="figures" aria-hidden="true"></div>
      <div class="artifact-wrap" aria-hidden="true"><img class="artifact" alt="" /></div>
      <div class="choice-layer" hidden></div>
      <div class="backlog-layer" hidden></div>
      <footer class="text-rail">
        <div class="text-copy">
          <span class="moment-label"></span>
          <strong class="speaker"></strong>
          <p class="line"></p>
        </div>
        <nav class="transport" aria-label="Reading controls">
          <button type="button" data-action="back">BACK</button>
          <button type="button" data-action="backlog">LOG</button>
          <button type="button" data-action="audio">SOUND OFF</button>
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
const artifactWrap = root.querySelector<HTMLElement>('.artifact-wrap')!;
const artifact = root.querySelector<HTMLImageElement>('.artifact')!;
const choiceLayer = root.querySelector<HTMLElement>('.choice-layer')!;
const backlogLayer = root.querySelector<HTMLElement>('.backlog-layer')!;
const line = root.querySelector<HTMLElement>('.line')!;
const speaker = root.querySelector<HTMLElement>('.speaker')!;
const momentLabel = root.querySelector<HTMLElement>('.moment-label')!;
const chapter = root.querySelector<HTMLElement>('.chapter')!;
const locationLabel = root.querySelector<HTMLElement>('.location')!;
const viewpointLabel = root.querySelector<HTMLElement>('.viewpoint')!;
const progress = root.querySelector<HTMLElement>('.progress')!;
const sourceNote = root.querySelector<HTMLElement>('.source-note')!;
const audioButton = root.querySelector<HTMLButtonElement>('[data-action="audio"]')!;

let experience: CompiledExperience;
let state: ReaderState;
let audio: AudioDirector;

function byId<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Missing compiled item ${id}`);
  return item;
}

function facingTransform(actor: Actor, facing: 'left' | 'right' | 'inward', slot: string): string {
  const resolved = facing === 'inward' ? (SLOT_POSITION[slot]! < 50 ? 'right' : 'left') : facing;
  return actor.sourceFacing === resolved ? 'scaleX(1)' : 'scaleX(-1)';
}

function renderFigures(tableau: Tableau, assets: Map<string, CompiledAsset>): void {
  figures.replaceChildren();
  for (const placement of tableau.figures) {
    const actor = byId(experience.actors, placement.actorId);
    const asset = assets.get(actor.renditionAssetId)!;
    const image = document.createElement('img');
    image.className = `figure figure-${placement.emphasis}`;
    image.src = asset.url;
    image.alt = actor.name;
    image.style.left = `${SLOT_POSITION[placement.slot]}%`;
    image.style.height = `${actor.stageHeightPercent}%`;
    image.style.transform = `translateX(-50%) ${facingTransform(actor, placement.facing, placement.slot)}`;
    figures.append(image);
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
  return byId(experience.actors, moment.speakerId).name;
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

function render(): void {
  const assets = new Map(experience.assets.map((asset) => [asset.id, asset]));
  const moment = currentMoment(experience, state);
  const tableau = byId(experience.tableaux, moment.tableauId);
  const background = assets.get(tableau.backgroundAssetId)!;
  const ordinal = experience.moments.findIndex((candidate) => candidate.id === moment.id) + 1;
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
  audioButton.textContent = state.isMuted ? 'SOUND OFF' : 'SOUND ON';
  renderFigures(tableau, assets);
  renderArtifact(tableau, assets);
  renderChoice(moment);
  renderBacklog();
  audio.setEnabled(!state.isMuted);
  audio.sync(tableau);
}

function dispatch(action: ReaderAction): void {
  const before = currentMoment(experience, state);
  const nextState = reduceReader(experience, state, action);
  const didMove = nextState.currentNodeId !== state.currentNodeId;
  state = nextState;
  if (didMove) audio.playCues(currentMoment(experience, state).cueAssetIds);
  if (action.type === 'toggle-muted' && !state.isMuted) audio.playCues(before.cueAssetIds);
  render();
}

root.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const option = target.closest<HTMLButtonElement>('[data-option-id]');
  if (option?.dataset.optionId) return dispatch({ type: 'choose', optionId: option.dataset.optionId });
  const action = target.closest<HTMLButtonElement>('[data-action]')?.dataset.action;
  if (action === 'back') return dispatch({ type: 'back' });
  if (action === 'backlog') return dispatch({ type: 'toggle-backlog' });
  if (action === 'audio') return dispatch({ type: 'toggle-muted' });
  if (action === 'next') return dispatch({ type: 'advance' });
  if (target.closest('.text-rail') || target.closest('.context-rail')) return;
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
  const response = await fetch('/generated/experience.json');
  if (!response.ok) throw new Error('Prepared experience is missing. Run npm run build:experience.');
  experience = await response.json() as CompiledExperience;
  state = initialReaderState(experience);
  audio = new AudioDirector(new Map(experience.assets.map((asset) => [asset.id, asset])));
  state = { ...state, isMuted: true };
  sourceNote.textContent = `${experience.title} · ${experience.source.note}`;
  render();
  stage.focus();
}

void start();
