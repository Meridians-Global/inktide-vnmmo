// @jasonyu0100
import type { CompiledExperience, Moment } from './contracts';
import { availableChoiceOptions, currentMoment, initialReaderState, reduceReader, type ReaderAction, type ReaderState } from './reader-state';

export type DailiesStep =
  | { type: 'advance' }
  | { type: 'choose'; optionId: string }
  | { type: 'back' };

export type DailiesFramePlan = Readonly<{
  frameId: string;
  momentId: string;
  tableauId: string;
  reading: 'base' | 'variant';
  route: readonly Readonly<{ nodeId: string; optionId: string }>[];
  insightIds: readonly string[];
  availableOptionIds: readonly string[];
  text: string;
  steps: readonly DailiesStep[];
}>;

function shortHash(value: string): string {
  let hash = 0x811c9dc5;
  for (const char of value) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0').slice(0, 6);
}

function readingKey(experience: CompiledExperience, state: ReaderState): { key: string; moment: Moment; options: string[] } {
  const moment = currentMoment(experience, state);
  const options = availableChoiceOptions(moment, state).map((option) => option.id);
  return { key: [moment.id, moment.tableauId, moment.text, options.join('+')].join('\u0000'), moment, options };
}

function stateKey(state: ReaderState): string {
  return [
    state.currentNodeId,
    state.route.map((choice) => `${choice.nodeId}=${choice.optionId}`).join(','),
    state.insightIds.join(','),
  ].join('|');
}

/**
 * Enumerate every distinct on-screen reading (moment × resolved text × visible
 * options) reachable through the real reader reducer, each with the shortest
 * action sequence from the authored beginning that produces it. Back is a
 * legal action so insight-gated rereads are discovered too.
 */
export function planDailies(experience: CompiledExperience, limit = 20_000): DailiesFramePlan[] {
  const base = experience.moments.map((moment) => moment.id);
  const start = initialReaderState(experience);
  const frames = new Map<string, DailiesFramePlan>();
  const visited = new Set<string>([stateKey(start)]);
  const queue: Array<{ state: ReaderState; steps: DailiesStep[] }> = [{ state: start, steps: [] }];

  const record = (state: ReaderState, steps: DailiesStep[]): void => {
    const { key, moment, options } = readingKey(experience, state);
    if (frames.has(key)) return;
    const baseMoment = experience.moments.find((candidate) => candidate.id === moment.id)!;
    const isBase = moment.text === baseMoment.text && moment.tableauId === baseMoment.tableauId
      && options.length === (baseMoment.next.type === 'choice' ? baseMoment.next.options.filter((option) => !option.requiresInsightIds).length : 0);
    const frameId = isBase ? moment.id : `${moment.id}--${shortHash(key)}`;
    frames.set(key, {
      frameId,
      momentId: moment.id,
      tableauId: moment.tableauId,
      reading: isBase ? 'base' : 'variant',
      route: state.route,
      insightIds: state.insightIds,
      availableOptionIds: options,
      text: moment.text,
      steps,
    });
  };

  record(start, []);
  let explored = 0;
  while (queue.length > 0 && explored < limit) {
    const { state, steps } = queue.shift()!;
    explored += 1;
    const moment = currentMoment(experience, state);
    const actions: DailiesStep[] = moment.next.type === 'goto'
      ? [{ type: 'advance' }]
      : availableChoiceOptions(moment, state).map((option) => ({ type: 'choose', optionId: option.id }));
    if (state.history.length > 0) actions.push({ type: 'back' });
    for (const action of actions) {
      const next = reduceReader(experience, state, action satisfies ReaderAction);
      const key = stateKey(next);
      if (visited.has(key)) continue;
      visited.add(key);
      const nextSteps: DailiesStep[] = [...steps, action];
      record(next, nextSteps);
      queue.push({ state: next, steps: nextSteps });
    }
  }

  return [...frames.values()].toSorted((left, right) =>
    base.indexOf(left.momentId) - base.indexOf(right.momentId) || left.frameId.localeCompare(right.frameId),
  );
}
