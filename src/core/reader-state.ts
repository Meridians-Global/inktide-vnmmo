// @jasonyu0100
import type { CompiledExperience, Moment } from './contracts';

export type RouteChoice = { nodeId: string; optionId: string };
export type ReaderState = {
  currentNodeId: string;
  history: string[];
  route: RouteChoice[];
  seenNodeIds: string[];
  isBacklogOpen: boolean;
  isMuted: boolean;
};

export type ReaderAction =
  | { type: 'advance' }
  | { type: 'choose'; optionId: string }
  | { type: 'back' }
  | { type: 'toggle-backlog' }
  | { type: 'toggle-muted' }
  | { type: 'restart' };

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function initialReaderState(experience: CompiledExperience): ReaderState {
  return {
    currentNodeId: experience.startNodeId,
    history: [],
    route: [],
    seenNodeIds: [experience.startNodeId],
    isBacklogOpen: false,
    isMuted: false,
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
  };
}

export function reduceReader(
  experience: CompiledExperience,
  state: ReaderState,
  action: ReaderAction,
): ReaderState {
  if (action.type === 'toggle-backlog') return { ...state, isBacklogOpen: !state.isBacklogOpen };
  if (action.type === 'toggle-muted') return { ...state, isMuted: !state.isMuted };
  if (action.type === 'restart') return initialReaderState(experience);
  if (action.type === 'back') {
    const previous = state.history.at(-1);
    if (!previous) return state;
    return { ...state, currentNodeId: previous, history: state.history.slice(0, -1), isBacklogOpen: false };
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
