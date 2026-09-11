// @jasonyu0100
import { ExperienceSchema, type CompileResult, type Experience, type Moment, type Next } from './contracts';

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function destinations(next: Next): string[] {
  if (next.type === 'goto') return [next.nodeId];
  if (next.type === 'choice') return next.options.map((option) => option.nodeId);
  return [];
}

function detectCycle(startId: string, moments: Map<string, Moment>): boolean {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visiting.add(nodeId);
    const moment = moments.get(nodeId);
    if (moment && destinations(moment.next).some(visit)) return true;
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };
  return visit(startId);
}

export function compileExperience(input: unknown, options: { assetUrlBase?: string } = {}): CompileResult {
  const parsed = ExperienceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`) };
  }

  const experience: Experience = parsed.data;
  const errors: string[] = [];
  const assetIds = new Set(experience.assets.map((asset) => asset.id));
  const assetsById = new Map(experience.assets.map((asset) => [asset.id, asset]));
  const actorsById = new Map(experience.actors.map((actor) => [actor.id, actor]));
  const tableauxById = new Map(experience.tableaux.map((tableau) => [tableau.id, tableau]));
  const momentsById = new Map(experience.moments.map((moment) => [moment.id, moment]));

  for (const asset of experience.assets) {
    if (asset.kind === 'figure' && !asset.preparation) {
      errors.push(`Figure asset ${asset.id} needs an explicit preparation recipe`);
    }
    if (asset.kind !== 'figure' && asset.preparation) {
      errors.push(`Only figure assets may declare a preparation recipe: ${asset.id}`);
    }
  }

  for (const [label, values] of [
    ['asset', experience.assets.map((item) => item.id)],
    ['actor', experience.actors.map((item) => item.id)],
    ['tableau', experience.tableaux.map((item) => item.id)],
    ['moment', experience.moments.map((item) => item.id)],
  ] as const) {
    for (const duplicate of findDuplicates(values)) errors.push(`Duplicate ${label} id: ${duplicate}`);
  }

  if (!momentsById.has(experience.startNodeId)) errors.push(`Missing start moment: ${experience.startNodeId}`);

  for (const actor of experience.actors) {
    const appearanceIds = actor.appearances.map((appearance) => appearance.id);
    for (const duplicate of findDuplicates(appearanceIds)) errors.push(`Duplicate appearance id on ${actor.id}: ${duplicate}`);
    if (!appearanceIds.includes(actor.defaultAppearanceId)) {
      errors.push(`Actor ${actor.id} references missing default appearance ${actor.defaultAppearanceId}`);
    }
    for (const appearance of actor.appearances) {
      const rendition = assetsById.get(appearance.assetId);
      if (!rendition) errors.push(`Appearance ${actor.id}/${appearance.id} references missing asset ${appearance.assetId}`);
      else if (rendition.kind !== 'figure') errors.push(`Appearance ${actor.id}/${appearance.id} must reference a figure asset`);
    }
  }

  for (const tableau of experience.tableaux) {
    const background = assetsById.get(tableau.backgroundAssetId);
    if (!background || background.kind !== 'background') errors.push(`Tableau ${tableau.id} needs a background asset`);
    for (const audioId of [tableau.ambienceAssetId, tableau.musicAssetId].filter(Boolean) as string[]) {
      if (!assetIds.has(audioId)) errors.push(`Tableau ${tableau.id} references missing audio ${audioId}`);
    }
    for (const duplicate of findDuplicates(tableau.figures.map((figure) => figure.slot))) {
      errors.push(`Tableau ${tableau.id} places multiple figures in ${duplicate}`);
    }
    for (const figure of tableau.figures) {
      const actor = actorsById.get(figure.actorId);
      if (!actor) errors.push(`Tableau ${tableau.id} references missing actor ${figure.actorId}`);
      else if (figure.appearanceId && !actor.appearances.some((appearance) => appearance.id === figure.appearanceId)) {
        errors.push(`Tableau ${tableau.id} references missing appearance ${figure.actorId}/${figure.appearanceId}`);
      }
    }
    if (tableau.artifact) {
      const asset = assetsById.get(tableau.artifact.assetId);
      if (!asset || asset.kind !== 'artifact') errors.push(`Tableau ${tableau.id} needs an artifact asset`);
    }
  }

  for (const moment of experience.moments) {
    const tableau = tableauxById.get(moment.tableauId);
    if (!tableau) errors.push(`Moment ${moment.id} references missing tableau ${moment.tableauId}`);
    for (const cueId of moment.cueAssetIds) {
      const cue = assetsById.get(cueId);
      if (!cue || cue.kind !== 'cue') errors.push(`Moment ${moment.id} references invalid cue ${cueId}`);
    }
    if (moment.voiceAssetId) {
      const voice = assetsById.get(moment.voiceAssetId);
      if (!voice || voice.kind !== 'voice') errors.push(`Moment ${moment.id} references invalid voice ${moment.voiceAssetId}`);
    }
    if (moment.mode === 'dialogue' && !moment.speakerId) errors.push(`Dialogue moment ${moment.id} needs a speaker`);
    if (moment.mode === 'thought') {
      if (!moment.speakerId) errors.push(`Thought moment ${moment.id} needs a speaker`);
      if (moment.viewpoint.kind !== 'private' || moment.viewpoint.holderId !== moment.speakerId) {
        errors.push(`Thought moment ${moment.id} must be private to its speaker`);
      }
    }
    if (moment.speakerId && tableau && !tableau.figures.some((figure) => figure.actorId === moment.speakerId)) {
      errors.push(`Speaker ${moment.speakerId} is not staged in moment ${moment.id}`);
    }
    if (moment.speakerId && tableau) {
      const speakerFigure = tableau.figures.find((figure) => figure.actorId === moment.speakerId);
      if (speakerFigure && speakerFigure.emphasis !== 'active') {
        errors.push(`Speaker ${moment.speakerId} must be active in moment ${moment.id}`);
      }
    }
    for (const nextId of destinations(moment.next)) {
      const nextMoment = momentsById.get(nextId);
      if (!nextMoment) {
        errors.push(`Moment ${moment.id} links to missing moment ${nextId}`);
        continue;
      }
      if (
        moment.viewpoint.kind === 'private' &&
        nextMoment.viewpoint.kind === 'private' &&
        moment.viewpoint.holderId !== nextMoment.viewpoint.holderId
      ) {
        errors.push(`Private POV hop ${moment.id} → ${nextId} needs a public bridge`);
      }
    }
  }

  const reachable = new Set<string>();
  const pending = momentsById.has(experience.startNodeId) ? [experience.startNodeId] : [];
  while (pending.length > 0) {
    const nodeId = pending.pop();
    if (!nodeId || reachable.has(nodeId)) continue;
    reachable.add(nodeId);
    const moment = momentsById.get(nodeId);
    if (moment) pending.push(...destinations(moment.next));
  }
  for (const moment of experience.moments) {
    if (!reachable.has(moment.id)) errors.push(`Unreachable moment: ${moment.id}`);
  }
  if (momentsById.has(experience.startNodeId) && detectCycle(experience.startNodeId, momentsById)) {
    errors.push('Experience graph must be acyclic');
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    experience: {
      ...experience,
      assets: experience.assets.map((asset) => ({
        ...asset,
        url: `${options.assetUrlBase ?? '/generated/assets'}/${asset.id}.${asset.sourcePath.split('.').at(-1)}`,
      })),
    },
  };
}
