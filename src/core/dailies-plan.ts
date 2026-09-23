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

type Relevance = Readonly<{ insightIds: ReadonlySet<string>; choiceNodeIds: ReadonlySet<string> }>;

/** Only insights and route entries that some variant or option gate reads can change a reading. */
function relevance(experience: CompiledExperience): Relevance {
  const insightIds = new Set<string>();
  const choiceNodeIds = new Set<string>();
  for (const moment of experience.moments) {
    for (const variant of moment.readingVariants ?? []) {
      if (variant.when.kind === 'active-choice') choiceNodeIds.add(variant.when.choiceNodeId);
      else for (const id of variant.when.insightIds) insightIds.add(id);
    }
    if (moment.next.type === 'choice') {
      for (const option of moment.next.options) for (const id of option.requiresInsightIds ?? []) insightIds.add(id);
    }
  }
  return { insightIds, choiceNodeIds };
}

function stateKey(state: ReaderState, reversing: boolean, relevant: Relevance): string {
  return [
    reversing ? 'back' : 'forward',
    state.currentNodeId,
    state.route.filter((choice) => relevant.choiceNodeIds.has(choice.nodeId)).map((choice) => `${choice.nodeId}=${choice.optionId}`).join(','),
    state.insightIds.filter((id) => relevant.insightIds.has(id)).join(','),
  ].join('|');
}

/**
 * Enumerate every distinct on-screen reading (moment × resolved text × visible
 * options) reachable through the real reader reducer, each with the shortest
 * action sequence from the authored beginning that produces it. Back is a
 * legal action so insight-gated rereads are discovered too. Because insights
 * survive Back, unbounded reversal grows the state space with the power set of
 * every option, so reversal is a budgeted macro: a run of Back steps to an
 * earlier choice that must re-choose an option that grants a new insight or was
 * unlocked by one, after which the replay keeps the route already walked and
 * only branches into newly unlocked options. Paths with fewer reversals are
 * exhausted first so the forward reading is always fully covered before
 * `limit` can truncate deeper rereads.
 */
export function planDailies(experience: CompiledExperience, limit = 50_000, maxReversals = 2): DailiesFramePlan[] {
  const base = experience.moments.map((moment) => moment.id);
  const start = initialReaderState(experience);
  const frames = new Map<string, DailiesFramePlan>();
  const relevant = relevance(experience);
  const cheapestVisit = new Map<string, number>([[stateKey(start, false, relevant), 0]]);
  type Pending = { state: ReaderState; steps: DailiesStep[]; backs: number };
  const queues: Pending[][] = Array.from({ length: maxReversals + 1 }, () => []);
  queues[0]?.push({ state: start, steps: [], backs: 0 });
  const nextPending = (): Pending | undefined => queues.find((queue) => queue.length > 0)?.shift();

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
  const enqueue = (state: ReaderState, steps: DailiesStep[], backs: number, reversing: boolean): void => {
    const key = stateKey(state, reversing, relevant);
    if ((cheapestVisit.get(key) ?? Infinity) <= backs) return;
    cheapestVisit.set(key, backs);
    record(state, steps);
    queues[backs]?.push({ state, steps, backs });
  };

  for (let pending = nextPending(); pending && explored < limit; pending = nextPending()) {
    const { state, steps, backs } = pending;
    explored += 1;
    const moment = currentMoment(experience, state);
    const reversing = steps.at(-1)?.type === 'back';
    const alreadyChosen = new Set(steps.flatMap((step) => (step.type === 'choose' ? [step.optionId] : [])));
    const available = availableChoiceOptions(moment, state);
    const candidates = reversing
      // A reversal is only worth its cost when the re-choice teaches something new.
      ? available.filter((option) => !alreadyChosen.has(option.id)
        && (option.requiresInsightIds !== undefined || (option.grantsInsightIds ?? []).some((id) => !state.insightIds.includes(id))))
      : backs === 0
        ? available
        // Replaying after a reversal keeps the route already walked (every route was covered
        // forward) and only branches into options the new insights have unlocked.
        : available.filter((option) => option.requiresInsightIds !== undefined || alreadyChosen.has(option.id)
          || !available.some((other) => alreadyChosen.has(other.id)) && option === available[0]);
    const actions: DailiesStep[] = moment.next.type === 'goto'
      ? (reversing ? [] : [{ type: 'advance' }])
      : candidates.map((option) => ({ type: 'choose', optionId: option.id }));
    for (const action of actions) {
      enqueue(reduceReader(experience, state, action satisfies ReaderAction), [...steps, action], backs, false);
    }
    if (reversing || backs >= maxReversals) continue;
    let rewound = state;
    const rewindSteps = [...steps];
    while (rewound.history.length > 0) {
      rewound = reduceReader(experience, rewound, { type: 'back' });
      rewindSteps.push({ type: 'back' });
      if (currentMoment(experience, rewound).next.type === 'choice') enqueue(rewound, [...rewindSteps], backs + 1, true);
    }
  }

  return [...frames.values()].toSorted((left, right) =>
    base.indexOf(left.momentId) - base.indexOf(right.momentId) || left.frameId.localeCompare(right.frameId),
  );
}
