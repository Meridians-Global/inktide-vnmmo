// @jasonyu0100
import type { CompiledExperience, Moment } from './contracts';

export type RouteChoice = { nodeId: string; optionId: string };
export type ReaderState = {
  currentNodeId: string;
  history: string[];
  route: RouteChoice[];
  seenNodeIds: string[];
  insightIds: string[];
  isBacklogOpen: boolean;
  isSettingsOpen: boolean;
};

export type ReaderAction =
  | { type: 'advance' }
  | { type: 'choose'; optionId: string }
  | { type: 'back' }
  | { type: 'toggle-backlog' }
  | { type: 'toggle-settings' }
  | { type: 'restart' };

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function availableChoiceOptions(moment: Moment, state: Pick<ReaderState, 'insightIds'>) {
  if (moment.next.type !== 'choice') return [];
  const insights = new Set(state.insightIds);
  return moment.next.options.filter((option) =>
    !option.requiresInsightIds || option.requiresInsightIds.every((insightId) => insights.has(insightId)),
  );
}

export function hasInsightsInOrder(acquiredInsightIds: string[], requiredInsightIds: string[]): boolean {
  let requiredIndex = 0;
  for (const insightId of acquiredInsightIds) {
    if (insightId === requiredInsightIds[requiredIndex]) requiredIndex += 1;
    if (requiredIndex === requiredInsightIds.length) return true;
  }
  return requiredInsightIds.length === 0;
}

export function resolveReadingMoment(moment: Moment, state: Pick<ReaderState, 'route' | 'insightIds'>): Moment {
  const activeChoices = new Map(state.route.map((choice) => [choice.nodeId, choice.optionId]));
  const insights = new Set(state.insightIds);
  const variant = moment.readingVariants
    ?.filter(({ when }) => {
      if (when.kind === 'active-choice') return activeChoices.get(when.choiceNodeId) === when.optionId;
      if (when.kind === 'reader-insight-order') return hasInsightsInOrder(state.insightIds, when.insightIds);
      return when.insightIds.every((insightId) => insights.has(insightId));
    })
    .toSorted((left, right) => {
      const leftSpecificity = left.when.kind === 'active-choice' ? 0 : left.when.insightIds.length;
      const rightSpecificity = right.when.kind === 'active-choice' ? 0 : right.when.insightIds.length;
      return rightSpecificity - leftSpecificity;
    })[0];
  return variant ? {
    ...moment,
    text: variant.text,
    ...(variant.tableauId ? { tableauId: variant.tableauId } : {}),
    voiceAssetId: variant.voiceAssetId ?? moment.voiceAssetId,
  } : moment;
}

function pathToMoment(experience: CompiledExperience, targetId: string): { history: string[]; route: RouteChoice[]; insightIds: string[] } | undefined {
  const moments = new Map(experience.moments.map((moment) => [moment.id, moment]));
  const visit = (
    nodeId: string,
    history: string[],
    route: RouteChoice[],
    insightIds: string[],
    visiting: Set<string>,
  ): { history: string[]; route: RouteChoice[]; insightIds: string[] } | undefined => {
    if (nodeId === targetId) return { history, route, insightIds };
    if (visiting.has(nodeId)) return undefined;
    const moment = moments.get(nodeId);
    if (!moment || moment.next.type === 'end') return undefined;
    const nextVisiting = new Set(visiting).add(nodeId);
    const pathState = { insightIds };
    const transitions: Array<{ nodeId: string; optionId?: string; grantsInsightIds?: string[] }> = moment.next.type === 'goto'
      ? [{ nodeId: moment.next.nodeId }]
      : availableChoiceOptions(moment, pathState).map((option) => ({
        nodeId: option.nodeId,
        optionId: option.id,
        ...(option.grantsInsightIds ? { grantsInsightIds: option.grantsInsightIds } : {}),
      }));
    for (const transition of transitions) {
      const found = visit(
        transition.nodeId,
        [...history, nodeId],
        transition.optionId ? [...route, { nodeId, optionId: transition.optionId }] : route,
        unique([...insightIds, ...(transition.grantsInsightIds ?? [])]),
        nextVisiting,
      );
      if (found) return found;
    }
    return undefined;
  };
  return visit(experience.startNodeId, [], [], [], new Set());
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
    insightIds: seeded.insightIds,
    isBacklogOpen: false,
    isSettingsOpen: false,
  };
}

/**
 * Resolve an untrusted URL coordinate without granting reader-only knowledge.
 * The strict initializer remains the source of truth; the presentation shell
 * falls back to the authored beginning when a link cannot be reached legally.
 */
export function initialReaderStateFromLink(experience: CompiledExperience, requestedNodeId?: string): ReaderState {
  if (!requestedNodeId) return initialReaderState(experience);
  try {
    return initialReaderState(experience, requestedNodeId);
  } catch {
    return initialReaderState(experience);
  }
}

/**
 * Resume a persisted reader state. Only the moment coordinate is trusted; the legal path, route and insights
 * are rebuilt by the strict initializer so a stale save from an older compile can never grant unearned knowledge.
 */
export function resumeReaderState(experience: CompiledExperience, saved: Pick<ReaderState, 'currentNodeId'> | null | undefined): ReaderState {
  return initialReaderStateFromLink(experience, saved?.currentNodeId);
}

export function currentMoment(experience: CompiledExperience, state: ReaderState): Moment {
  const moment = experience.moments.find((candidate) => candidate.id === state.currentNodeId);
  if (!moment) throw new Error(`Compiled experience lost moment ${state.currentNodeId}`);
  return resolveReadingMoment(moment, state);
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
  if (action.type === 'restart') return initialReaderState(experience);
  if (action.type === 'back') {
    const previous = state.history.at(-1);
    if (!previous) return state;
    const previousMoment = experience.moments.find((moment) => moment.id === previous);
    const route = previousMoment?.next.type === 'choice'
      ? state.route.filter((choice) => choice.nodeId !== previous)
      : state.route;
    return { ...state, currentNodeId: previous, history: state.history.slice(0, -1), route, isBacklogOpen: false, isSettingsOpen: false };
  }

  const moment = currentMoment(experience, state);
  if (action.type === 'advance') {
    if (moment.next.type !== 'goto') return state;
    return moveTo(state, moment.next.nodeId);
  }
  if (moment.next.type !== 'choice') return state;
  const option = availableChoiceOptions(moment, state).find((candidate) => candidate.id === action.optionId);
  if (!option) return state;
  return {
    ...moveTo(state, option.nodeId),
    route: [...state.route.filter((choice) => choice.nodeId !== moment.id), { nodeId: moment.id, optionId: option.id }],
    insightIds: unique([...state.insightIds, ...(option.grantsInsightIds ?? [])]),
  };
}

export function backlog(experience: CompiledExperience, state: ReaderState): Moment[] {
  return [...state.history, state.currentNodeId]
    .map((id) => experience.moments.find((moment) => moment.id === id))
    .filter((moment): moment is Moment => Boolean(moment))
    .map((moment) => resolveReadingMoment(moment, state));
}
