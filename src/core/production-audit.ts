// @jasonyu0100
import type { Experience, Moment } from './contracts';
import { detectPerformanceBeats } from './performance-beats';

type ChoicePurpose = Extract<Moment['next'], { type: 'choice' }>['purpose'];

export type ProductionTarget = Readonly<{
  requiredChoicePurposes: readonly ChoicePurpose[];
  minimumLocationCount: number;
  minimumReadingSeconds: number;
  readingWordsPerMinute: number;
  /** Choice purposes that must offer a plausible-but-wrong option alongside the grounded reads. */
  distractedChoicePurposes: readonly ChoicePurpose[];
  /** Consecutive staged moments an actor may hold one rendition before the run reads as a held pose. */
  maximumHeldPoseMoments: number;
  /** Renditions an actor needs before baseline → appraisal → decision acting is possible at all. */
  minimumActorRenditions: number;
}>;

export type ProductionDemand = Readonly<{
  id: string;
  lane: 'story' | 'performance' | 'set';
  priority: 'high' | 'medium';
  reason:
    | 'missing-choice-purpose'
    | 'minimum-location-count'
    | 'minimum-reading-duration'
    | 'missing-choice-payoff'
    | 'undistracted-choice'
    | 'static-pivotal-performance'
    | 'held-pose'
    | 'thin-rendition-set'
    | 'uncomposed-cg';
  momentIds: readonly string[];
  actorIds: readonly string[];
}>;

/** Evidence gathered outside the Experience; the caller reads receipts, the audit only compares. */
export type ProductionEvidence = Readonly<{
  /** SHA-256 of every CG generated from a typed composition brief. */
  composedCgSha256s: readonly string[];
}>;

export type ChoiceAudit = Readonly<{
  momentId: string;
  purpose: ChoicePurpose;
  weight: Extract<Moment['next'], { type: 'choice' }>['weight'];
  optionIds: readonly string[];
  convergenceMomentId: string | null;
  privateHolderIds: readonly string[];
  grantedInsightIds: readonly string[];
  requiredInsightIds: readonly string[];
  payoffMomentIds: readonly string[];
}>;

export type ActorAudit = Readonly<{
  actorId: string;
  definedAppearanceIds: readonly string[];
  usedAppearanceIds: readonly string[];
  unusedAppearanceIds: readonly string[];
  performanceMomentIds: readonly string[];
}>;

export type ProductionAudit = Readonly<{
  schemaVersion: 2;
  experienceId: string;
  inventory: Readonly<{
    moments: number;
    locations: readonly string[];
    tableaux: number;
    cutIns: number;
    cueMoments: number;
    reading: Readonly<{
      wordsPerMinute: number;
      shortestRouteWords: number;
      longestRouteWords: number;
      shortestRouteSeconds: number;
      longestRouteSeconds: number;
    }>;
  }>;
  choices: readonly ChoiceAudit[];
  actors: readonly ActorAudit[];
  demands: readonly ProductionDemand[];
}>;

export type ProductionPortfolioInput = Readonly<{
  audit: ProductionAudit;
  target: ProductionTarget;
  experienceSha256: string;
  productionAuditSha256: string;
  receiptSha256: string;
}>;

export type ProductionPortfolioReport = Readonly<{
  schemaVersion: 1;
  /** Mechanical coverage only. Human dailies remain the approval boundary. */
  status: 'targets-met' | 'open-demands' | 'needs-repair';
  experiences: readonly Readonly<{
    experienceId: string;
    status: 'targets-met' | 'open-demands' | 'needs-repair';
    experienceSha256: string;
    productionAuditSha256: string;
    receiptSha256: string;
    reading: ProductionAudit['inventory']['reading'];
    target: ProductionTarget;
    highPriorityDemandIds: readonly string[];
    mediumPriorityDemandIds: readonly string[];
  }>[];
  nextRepair: (ProductionDemand & Readonly<{ experienceId: string }>) | null;
}>;

type RouteReading = Readonly<{ words: number; moments: number }>;

function wordCount(value: string): number {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

function minimumDisplayedWords(moment: Moment): number {
  return Math.min(wordCount(moment.text), ...(moment.readingVariants ?? []).map((variant) => wordCount(variant.text)));
}

function routeReading(
  momentId: string,
  moments: ReadonlyMap<string, Moment>,
  select: (routes: readonly RouteReading[]) => RouteReading,
  memo: Map<string, RouteReading>,
): RouteReading {
  const cached = memo.get(momentId);
  if (cached) return cached;
  const moment = moments.get(momentId);
  if (!moment) return { words: 0, moments: 0 };
  // Use the shortest prepared wording at each coordinate. This intentionally under-counts routes when
  // that variant is not reachable in the same reader state, keeping the duration claim conservative.
  const ownWords = minimumDisplayedWords(moment);
  let result: RouteReading;
  if (moment.next.type === 'end') {
    result = { words: ownWords, moments: 1 };
  } else if (moment.next.type === 'goto') {
    const child = routeReading(moment.next.nodeId, moments, select, memo);
    result = { words: ownWords + child.words, moments: 1 + child.moments };
  } else {
    const promptWords = wordCount(moment.next.prompt);
    const branches = moment.next.options.map((option) => {
      const child = routeReading(option.nodeId, moments, select, memo);
      return {
        words: ownWords + promptWords + wordCount(option.label) + wordCount(option.consequence) + child.words,
        moments: 1 + child.moments,
      };
    });
    result = select(branches);
  }
  memo.set(momentId, result);
  return result;
}

function readingInventory(experience: Experience, target: ProductionTarget, moments: ReadonlyMap<string, Moment>) {
  const byShortestWords = (routes: readonly RouteReading[]) => [...routes].sort((left, right) => left.words - right.words || left.moments - right.moments)[0]!;
  const byLongestWords = (routes: readonly RouteReading[]) => [...routes].sort((left, right) => right.words - left.words || right.moments - left.moments)[0]!;
  const shortest = routeReading(experience.startNodeId, moments, byShortestWords, new Map());
  const longest = routeReading(experience.startNodeId, moments, byLongestWords, new Map());
  const seconds = (words: number) => Math.ceil((words / target.readingWordsPerMinute) * 60);
  return {
    wordsPerMinute: target.readingWordsPerMinute,
    shortestRouteWords: shortest.words,
    longestRouteWords: longest.words,
    shortestRouteSeconds: seconds(shortest.words),
    longestRouteSeconds: seconds(longest.words),
  };
}

function destinations(moment: Moment): string[] {
  if (moment.next.type === 'goto') return [moment.next.nodeId];
  if (moment.next.type === 'choice') return moment.next.options.map((option) => option.nodeId);
  return [];
}

function shortestDistances(startId: string, moments: ReadonlyMap<string, Moment>): Map<string, number> {
  const distances = new Map<string, number>([[startId, 0]]);
  const queue = [startId];
  for (let index = 0; index < queue.length; index += 1) {
    const id = queue[index]!;
    const distance = distances.get(id)!;
    const moment = moments.get(id);
    if (!moment) continue;
    for (const nextId of destinations(moment)) {
      if (distances.has(nextId)) continue;
      distances.set(nextId, distance + 1);
      queue.push(nextId);
    }
  }
  return distances;
}

function nearestConvergence(optionStartIds: readonly string[], moments: ReadonlyMap<string, Moment>): string | null {
  const routes = optionStartIds.map((id) => shortestDistances(id, moments));
  if (routes.length === 0) return null;
  const common = [...routes[0]!.keys()].filter((id) => routes.every((route) => route.has(id)));
  common.sort((left, right) => {
    const leftDistances = routes.map((route) => route.get(left)!);
    const rightDistances = routes.map((route) => route.get(right)!);
    const leftScore = [Math.max(...leftDistances), leftDistances.reduce((sum, value) => sum + value, 0), left];
    const rightScore = [Math.max(...rightDistances), rightDistances.reduce((sum, value) => sum + value, 0), right];
    return leftScore[0] !== rightScore[0]
      ? Number(leftScore[0]) - Number(rightScore[0])
      : leftScore[1] !== rightScore[1]
        ? Number(leftScore[1]) - Number(rightScore[1])
        : String(leftScore[2]).localeCompare(String(rightScore[2]));
  });
  return common[0] ?? null;
}

function nodesBeforeConvergence(startId: string, convergenceId: string | null, moments: ReadonlyMap<string, Moment>): string[] {
  const visited = new Set<string>();
  const queue = [startId];
  for (let index = 0; index < queue.length; index += 1) {
    const id = queue[index]!;
    if (id === convergenceId || visited.has(id)) continue;
    visited.add(id);
    const moment = moments.get(id);
    if (moment) queue.push(...destinations(moment));
  }
  return [...visited];
}

function choicePayoffs(experience: Experience, choice: Moment): string[] {
  if (choice.next.type !== 'choice') return [];
  const optionIds = new Set(choice.next.options.map((option) => option.id));
  const grantedInsights = new Set(choice.next.options.flatMap((option) => option.grantsInsightIds ?? []));
  return experience.moments.flatMap((moment) => {
    const paysOff = moment.readingVariants?.some((variant) => {
      if (variant.when.kind === 'active-choice') {
        return variant.when.choiceNodeId === choice.id && optionIds.has(variant.when.optionId);
      }
      return variant.when.insightIds.some((id) => grantedInsights.has(id));
    });
    return paysOff ? [moment.id] : [];
  });
}

type HeldPoseRun = Readonly<{ actorId: string; momentIds: readonly string[] }>;

function stagedRendition(experience: Experience, moment: Moment, actorId: string): string | undefined {
  const tableau = experience.tableaux.find((candidate) => candidate.id === moment.tableauId);
  const actor = experience.actors.find((candidate) => candidate.id === actorId);
  const figure = tableau?.figures.find((candidate) => candidate.actorId === actorId);
  if (!actor || !figure) return undefined;
  return figure.appearanceId ?? actor.defaultAppearanceId;
}

/** Maximal goto-linked runs where a staged actor holds one rendition for more moments than the target allows. */
function heldPoseRuns(experience: Experience, moments: Map<string, Moment>, maximumMoments: number): HeldPoseRun[] {
  const predecessorCount = new Map<string, number>();
  for (const moment of experience.moments) {
    if (moment.next.type !== 'goto') continue;
    predecessorCount.set(moment.next.nodeId, (predecessorCount.get(moment.next.nodeId) ?? 0) + 1);
  }
  const runs: HeldPoseRun[] = [];
  for (const actor of experience.actors) {
    const continues = (from: Moment, to: Moment): boolean =>
      from.next.type === 'goto' &&
      (predecessorCount.get(to.id) ?? 0) === 1 &&
      stagedRendition(experience, from, actor.id) !== undefined &&
      stagedRendition(experience, from, actor.id) === stagedRendition(experience, to, actor.id);
    for (const start of experience.moments) {
      if (stagedRendition(experience, start, actor.id) === undefined) continue;
      const openedByPredecessor = experience.moments.some((previous) =>
        previous.next.type === 'goto' && previous.next.nodeId === start.id && continues(previous, start),
      );
      if (openedByPredecessor) continue;
      const momentIds = [start.id];
      let current = start;
      while (current.next.type === 'goto') {
        const following = moments.get(current.next.nodeId);
        if (!following || !continues(current, following)) break;
        momentIds.push(following.id);
        current = following;
      }
      if (momentIds.length > maximumMoments) runs.push({ actorId: actor.id, momentIds });
    }
  }
  return runs;
}

export function auditExperience(
  experience: Experience,
  target: ProductionTarget,
  evidence: ProductionEvidence = { composedCgSha256s: [] },
): ProductionAudit {
  const moments = new Map(experience.moments.map((moment) => [moment.id, moment]));
  const reading = readingInventory(experience, target, moments);
  const choices = experience.moments.flatMap((moment): ChoiceAudit[] => {
    if (moment.next.type !== 'choice') return [];
    const convergenceMomentId = nearestConvergence(moment.next.options.map((option) => option.nodeId), moments);
    const branchNodeIds = moment.next.options.flatMap((option) => nodesBeforeConvergence(option.nodeId, convergenceMomentId, moments));
    const privateHolderIds = [...new Set(branchNodeIds.flatMap((id) => {
      const branchMoment = moments.get(id);
      return branchMoment?.viewpoint.kind === 'private' ? [branchMoment.viewpoint.holderId] : [];
    }))].sort();
    return [{
      momentId: moment.id,
      purpose: moment.next.purpose,
      weight: moment.next.weight,
      optionIds: moment.next.options.map((option) => option.id),
      convergenceMomentId,
      privateHolderIds,
      grantedInsightIds: [...new Set(moment.next.options.flatMap((option) => option.grantsInsightIds ?? []))].sort(),
      requiredInsightIds: [...new Set(moment.next.options.flatMap((option) => option.requiresInsightIds ?? []))].sort(),
      payoffMomentIds: choicePayoffs(experience, moment),
    }];
  });

  const performanceBeats = detectPerformanceBeats(experience);
  const actors = experience.actors.map((actor): ActorAudit => {
    const definedAppearanceIds = actor.appearances.map((appearance) => appearance.id);
    const usedAppearanceIds = [...new Set(experience.tableaux.flatMap((tableau) => tableau.figures
      .filter((figure) => figure.actorId === actor.id)
      .map((figure) => figure.appearanceId ?? actor.defaultAppearanceId)))];
    return {
      actorId: actor.id,
      definedAppearanceIds,
      usedAppearanceIds,
      unusedAppearanceIds: definedAppearanceIds.filter((id) => !usedAppearanceIds.includes(id)),
      performanceMomentIds: performanceBeats.filter((beat) => beat.actorId === actor.id).map((beat) => beat.momentId),
    };
  });

  const demands: ProductionDemand[] = [];
  const coveredPurposes = new Set(choices.map((choice) => choice.purpose));
  for (const purpose of target.requiredChoicePurposes) {
    if (!coveredPurposes.has(purpose)) demands.push({
      id: `story:choice-purpose:${purpose}`,
      lane: 'story',
      priority: 'medium',
      reason: 'missing-choice-purpose',
      momentIds: [],
      actorIds: [],
    });
  }

  const locations = [...new Set(experience.tableaux.map((tableau) => tableau.location))];
  if (locations.length < target.minimumLocationCount) demands.push({
    id: `set:location-count:${target.minimumLocationCount}`,
    lane: 'set',
    priority: 'medium',
    reason: 'minimum-location-count',
    momentIds: [],
    actorIds: [],
  });

  if (reading.shortestRouteSeconds < target.minimumReadingSeconds) demands.push({
    id: `story:minimum-reading-seconds:${target.minimumReadingSeconds}`,
    lane: 'story',
    priority: 'high',
    reason: 'minimum-reading-duration',
    momentIds: [],
    actorIds: [],
  });

  for (const choice of choices) {
    if (!choice.convergenceMomentId || choice.payoffMomentIds.length === 0) demands.push({
      id: `story:choice-payoff:${choice.momentId}`,
      lane: 'story',
      priority: 'high',
      reason: 'missing-choice-payoff',
      momentIds: [choice.momentId],
      actorIds: choice.privateHolderIds,
    });
  }

  for (const moment of experience.moments) {
    if (moment.next.type !== 'choice' || !target.distractedChoicePurposes.includes(moment.next.purpose)) continue;
    if (moment.next.options.some((option) => option.distractor)) continue;
    demands.push({
      id: `story:choice-distractor:${moment.id}`,
      lane: 'story',
      priority: 'medium',
      reason: 'undistracted-choice',
      momentIds: [moment.id],
      actorIds: [],
    });
  }

  for (const actor of experience.actors) {
    if (actor.appearances.length >= target.minimumActorRenditions) continue;
    demands.push({
      id: `performance:renditions:${actor.id}`,
      lane: 'performance',
      priority: 'medium',
      reason: 'thin-rendition-set',
      momentIds: [],
      actorIds: [actor.id],
    });
  }

  for (const run of heldPoseRuns(experience, moments, target.maximumHeldPoseMoments)) {
    demands.push({
      id: `performance:held-pose:${run.actorId}:${run.momentIds[0]}`,
      lane: 'performance',
      priority: 'medium',
      reason: 'held-pose',
      momentIds: run.momentIds,
      actorIds: [run.actorId],
    });
  }

  const composed = new Set(evidence.composedCgSha256s);
  for (const asset of experience.assets) {
    if (asset.kind !== 'cg' || composed.has(asset.sha256)) continue;
    const cutInIds = experience.tableaux.filter((tableau) => tableau.cutIn?.assetId === asset.id).map((tableau) => tableau.id);
    demands.push({
      id: `set:cg-composition:${asset.id}`,
      lane: 'set',
      priority: 'medium',
      reason: 'uncomposed-cg',
      momentIds: experience.moments.filter((moment) => cutInIds.includes(moment.tableauId)).map((moment) => moment.id),
      actorIds: [],
    });
  }

  for (const beat of performanceBeats) {
    if (beat.importance === 'pivotal' && beat.changesAppearanceFrom.length === 0) demands.push({
      id: `performance:${beat.momentId}:${beat.actorId}`,
      lane: 'performance',
      priority: 'high',
      reason: 'static-pivotal-performance',
      momentIds: [beat.momentId],
      actorIds: [beat.actorId],
    });
  }

  return {
    schemaVersion: 2,
    experienceId: experience.id,
    inventory: {
      moments: experience.moments.length,
      locations,
      tableaux: experience.tableaux.length,
      cutIns: experience.tableaux.filter((tableau) => tableau.cutIn).length,
      cueMoments: experience.moments.filter((moment) => moment.cueAssetIds.length > 0).length,
      reading,
    },
    choices,
    actors,
    demands,
  };
}

export function summarizeProductionPortfolio(inputs: readonly ProductionPortfolioInput[]): ProductionPortfolioReport {
  const queue = inputs.flatMap(({ audit }, experienceIndex) => audit.demands.map((demand) => ({
    ...demand,
    experienceId: audit.experienceId,
    experienceIndex,
  })));
  queue.sort((left, right) => {
    const priority = { high: 0, medium: 1 } as const;
    return priority[left.priority] - priority[right.priority]
      || left.experienceIndex - right.experienceIndex
      || left.id.localeCompare(right.id);
  });

  const experiences = inputs.map(({ audit, target, experienceSha256, productionAuditSha256, receiptSha256 }) => {
    const highPriorityDemandIds = audit.demands.filter((demand) => demand.priority === 'high').map((demand) => demand.id);
    const mediumPriorityDemandIds = audit.demands.filter((demand) => demand.priority === 'medium').map((demand) => demand.id);
    const status = highPriorityDemandIds.length > 0
      ? 'needs-repair' as const
      : mediumPriorityDemandIds.length > 0
        ? 'open-demands' as const
        : 'targets-met' as const;
    return {
      experienceId: audit.experienceId,
      status,
      experienceSha256,
      productionAuditSha256,
      receiptSha256,
      reading: audit.inventory.reading,
      target,
      highPriorityDemandIds,
      mediumPriorityDemandIds,
    };
  });
  const next = queue[0];

  return {
    schemaVersion: 1,
    status: experiences.some((experience) => experience.status === 'needs-repair')
      ? 'needs-repair'
      : experiences.some((experience) => experience.status === 'open-demands')
        ? 'open-demands'
        : 'targets-met',
    experiences,
    nextRepair: next ? {
      experienceId: next.experienceId,
      id: next.id,
      lane: next.lane,
      priority: next.priority,
      reason: next.reason,
      momentIds: next.momentIds,
      actorIds: next.actorIds,
    } : null,
  };
}
