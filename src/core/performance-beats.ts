// @jasonyu0100
import type { Experience } from './contracts';

export type DetectedPerformanceBeat = Readonly<{
  momentId: string;
  actorId: string;
  phase: 'baseline' | 'appraisal' | 'decision' | 'after-state';
  importance: 'supporting' | 'pivotal';
  appearanceId: string;
  changesAppearanceFrom: readonly string[];
}>;

function destinations(moment: Experience['moments'][number]): string[] {
  if (moment.next.type === 'goto') return [moment.next.nodeId];
  if (moment.next.type === 'choice') return moment.next.options.map((option) => option.nodeId);
  return [];
}

function appearanceFor(experience: Experience, tableauId: string, actorId: string): string | undefined {
  const actor = experience.actors.find((candidate) => candidate.id === actorId);
  const figure = experience.tableaux.find((tableau) => tableau.id === tableauId)?.figures.find((candidate) => candidate.actorId === actorId);
  const tableau = experience.tableaux.find((candidate) => candidate.id === tableauId);
  if (figure) return figure.appearanceId ?? actor?.defaultAppearanceId;
  return tableau?.cutIn?.representedActorIds.includes(actorId) ? 'cg-embodied' : undefined;
}

export function detectPerformanceBeats(experience: Experience): DetectedPerformanceBeat[] {
  const incoming = new Map<string, string[]>();
  for (const moment of experience.moments) {
    for (const destination of destinations(moment)) {
      incoming.set(destination, [...(incoming.get(destination) ?? []), moment.id]);
    }
  }

  return experience.moments.flatMap((moment) => {
    if (!moment.performanceBeat) return [];
    const appearanceId = appearanceFor(experience, moment.tableauId, moment.performanceBeat.actorId);
    if (!appearanceId) return [];
    const predecessorAppearances = (incoming.get(moment.id) ?? [])
      .map((id) => experience.moments.find((candidate) => candidate.id === id))
      .filter((candidate): candidate is Experience['moments'][number] => Boolean(candidate))
      .map((candidate) => appearanceFor(experience, candidate.tableauId, moment.performanceBeat!.actorId))
      .filter((candidate): candidate is string => Boolean(candidate));
    return [{
      momentId: moment.id,
      actorId: moment.performanceBeat.actorId,
      phase: moment.performanceBeat.phase,
      importance: moment.performanceBeat.importance,
      appearanceId,
      changesAppearanceFrom: [...new Set(predecessorAppearances.filter((candidate) => candidate !== appearanceId))],
    }];
  });
}
