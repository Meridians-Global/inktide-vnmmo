// @jasonyu0100
import type { CompiledExperience, Moment } from './contracts';

export type RouteChoice = { nodeId: string; optionId: string };
export type ReaderState = {
  currentNodeId: string;
  history: string[];
  route: RouteChoice[];
  seenNodeIds: string[];
  isBacklogOpen: boolean;
  isSettingsOpen: boolean;
  isMuted: boolean;
  isVoiceEnabled: boolean;
};

export type ReaderAction =
  | { type: 'advance' }
  | { type: 'choose'; optionId: string }
  | { type: 'back' }
  | { type: 'toggle-backlog' }
  | { type: 'toggle-settings' }
  | { type: 'toggle-muted' }
  | { type: 'toggle-voice' }
  | { type: 'restart' };

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function pathToMoment(experience: CompiledExperience, targetId: string): { history: string[]; route: RouteChoice[] } | undefined {
  const moments = new Map(experience.moments.map((moment) => [moment.id, moment]));
  const visit = (
    nodeId: string,
    history: string[],
    route: RouteChoice[],
    visiting: Set<string>,
  ): { history: string[]; route: RouteChoice[] } | undefined => {
    if (nodeId === targetId) return { history, route };
    if (visiting.has(nodeId)) return undefined;
    const moment = moments.get(nodeId);
    if (!moment || moment.next.type === 'end') return undefined;
    const nextVisiting = new Set(visiting).add(nodeId);
    const transitions: Array<{ nodeId: string; optionId?: string }> = moment.next.type === 'goto'
      ? [{ nodeId: moment.next.nodeId }]
      : moment.next.options.map((option) => ({ nodeId: option.nodeId, optionId: option.id }));
    for (const transition of transitions) {
      const found = visit(
        transition.nodeId,
        [...history, nodeId],
        transition.optionId ? [...route, { nodeId, optionId: transition.optionId }] : route,
        nextVisiting,
      );
      if (found) return found;
    }
    return undefined;
  };
  return visit(experience.startNodeId, [], [], new Set());
}

export function initialReaderState(experience: CompiledExperience, startNodeId = experience.startNodeId): ReaderState {
  if (!experience.moments.some((moment) => moment.id === startNodeId)) {
    throw new Error(`Cannot start reader at missing moment ${startNodeId}`);
  }
  const seeded = pathToMoment(experience, startNodeId);
  if (!seeded) throw new Error(`Cannot reconstruct reader path to moment ${startNodeId}`);
  return {
    currentNodeId: startNodeId,
    history: seeded.history,
    route: seeded.route,
    seenNodeIds: unique([...seeded.history, startNodeId]),
    isBacklogOpen: false,
    isSettingsOpen: false,
    isMuted: true,
    isVoiceEnabled: false,
  };
}

export function currentMoment(experience: CompiledExperience, state: ReaderState): Moment {
  const moment = experience.moments.find((candidate) => candidate.id === state.currentNodeId);
  if (!moment) throw new Error(`Compiled experience lost moment ${state.currentNodeId}`);
  return moment;
}

function moveTo(state: ReaderState, nodeId: string): ReaderState {
  return {
    ...state,
    currentNodeId: nodeId,
    history: [...state.history, state.currentNodeId],
    seenNodeIds: unique([...state.seenNodeIds, nodeId]),
    isBacklogOpen: false,
    isSettingsOpen: false,
  };
}

export function reduceReader(
  experience: CompiledExperience,
  state: ReaderState,
  action: ReaderAction,
): ReaderState {
  if (action.type === 'toggle-backlog') return { ...state, isBacklogOpen: !state.isBacklogOpen, isSettingsOpen: false };
  if (action.type === 'toggle-settings') return { ...state, isSettingsOpen: !state.isSettingsOpen, isBacklogOpen: false };
  if (action.type === 'toggle-muted') return { ...state, isMuted: !state.isMuted };
  if (action.type === 'toggle-voice') return { ...state, isVoiceEnabled: !state.isVoiceEnabled };
  if (action.type === 'restart') return initialReaderState(experience);
  if (action.type === 'back') {
    const previous = state.history.at(-1);
    if (!previous) return state;
    return { ...state, currentNodeId: previous, history: state.history.slice(0, -1), isBacklogOpen: false, isSettingsOpen: false };
  }

  const moment = currentMoment(experience, state);
  if (action.type === 'advance') {
    if (moment.next.type !== 'goto') return state;
    return moveTo(state, moment.next.nodeId);
  }
  if (moment.next.type !== 'choice') return state;
  const option = moment.next.options.find((candidate) => candidate.id === action.optionId);
  if (!option) return state;
  return {
    ...moveTo(state, option.nodeId),
    route: [...state.route, { nodeId: moment.id, optionId: option.id }],
  };
}

export function backlog(experience: CompiledExperience, state: ReaderState): Moment[] {
  return [...state.history, state.currentNodeId]
    .map((id) => experience.moments.find((moment) => moment.id === id))
    .filter((moment): moment is Moment => Boolean(moment));
}
