// @jasonyu0100
import { ExperienceSchema, type CompileResult, type Experience, type Moment, type Next } from './contracts';

type ReadingVariant = NonNullable<Moment['readingVariants']>[number];
type ActiveChoiceReadingVariant = ReadingVariant & { when: Extract<ReadingVariant['when'], { kind: 'active-choice' }> };
type ReaderInsightReadingVariant = ReadingVariant & { when: Extract<ReadingVariant['when'], { kind: 'reader-insights' }> };
type ReaderInsightOrderReadingVariant = ReadingVariant & { when: Extract<ReadingVariant['when'], { kind: 'reader-insight-order' }> };

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

function canReach(startId: string, targetId: string, moments: Map<string, Moment>): boolean {
  const pending = [startId];
  const visited = new Set<string>();
  while (pending.length > 0) {
    const nodeId = pending.pop();
    if (!nodeId || visited.has(nodeId)) continue;
    if (nodeId === targetId) return true;
    visited.add(nodeId);
    const moment = moments.get(nodeId);
    if (moment) pending.push(...destinations(moment.next));
  }
  return false;
}

function canLearnInsightBeforeMoment(insightId: string, targetId: string, moments: Map<string, Moment>): boolean {
  for (const moment of moments.values()) {
    if (moment.next.type !== 'choice') continue;
    const grantsInsight = moment.next.options.some((option) => option.grantsInsightIds?.includes(insightId));
    if (!grantsInsight) continue;
    const forwardGrant = moment.next.options.some((option) =>
      option.grantsInsightIds?.includes(insightId) && canReach(option.nodeId, targetId, moments),
    );
    const rereadGate = moment.next.options.some((option) =>
      option.requiresInsightIds?.includes(insightId) && canReach(option.nodeId, targetId, moments),
    );
    if (forwardGrant || rereadGate) return true;
  }
  return false;
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
  const insightIds = new Set(experience.readerInsights.map((insight) => insight.id));
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
    ['reader insight', experience.readerInsights.map((item) => item.id)],
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
    if (tableau.cutIn) {
      const cutIn = assetsById.get(tableau.cutIn.assetId);
      if (!cutIn || cutIn.kind !== 'cg') errors.push(`Tableau ${tableau.id} needs a CG cut-in asset`);
      for (const actorId of tableau.cutIn.representedActorIds) {
        if (!actorsById.has(actorId)) errors.push(`Tableau ${tableau.id} CG represents missing actor ${actorId}`);
      }
      if (tableau.cutIn.representedArtifactId) {
        const representedArtifact = assetsById.get(tableau.cutIn.representedArtifactId);
        if (!representedArtifact || representedArtifact.kind !== 'artifact') {
          errors.push(`Tableau ${tableau.id} CG represents missing artifact ${tableau.cutIn.representedArtifactId}`);
        }
      }
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
    for (const variant of moment.readingVariants ?? []) {
      if (!variant.voiceAssetId) continue;
      const voice = assetsById.get(variant.voiceAssetId);
      if (!voice || voice.kind !== 'voice') errors.push(`Moment ${moment.id} references invalid voice ${variant.voiceAssetId}`);
    }
    if (moment.mode === 'dialogue' && !moment.speakerId) errors.push(`Dialogue moment ${moment.id} needs a speaker`);
    if (moment.mode === 'thought') {
      if (!moment.speakerId) errors.push(`Thought moment ${moment.id} needs a speaker`);
      if (moment.viewpoint.kind !== 'private' || moment.viewpoint.holderId !== moment.speakerId) {
        errors.push(`Thought moment ${moment.id} must be private to its speaker`);
      }
    }
    if (moment.speakerId && tableau && !tableau.figures.some((figure) => figure.actorId === moment.speakerId) && !tableau.cutIn?.representedActorIds.includes(moment.speakerId)) {
      errors.push(`Speaker ${moment.speakerId} is not staged in moment ${moment.id}`);
    }
    if (moment.speakerId && tableau) {
      const speakerFigure = tableau.figures.find((figure) => figure.actorId === moment.speakerId);
      if (speakerFigure && speakerFigure.emphasis !== 'active') {
        errors.push(`Speaker ${moment.speakerId} must be active in moment ${moment.id}`);
      }
    }
    if (moment.performanceBeat && tableau) {
      const performanceFigure = tableau.figures.find((figure) => figure.actorId === moment.performanceBeat?.actorId);
      const representedInCutIn = tableau.cutIn?.representedActorIds.includes(moment.performanceBeat.actorId);
      if (!performanceFigure && !representedInCutIn) {
        errors.push(`Performance actor ${moment.performanceBeat.actorId} is not staged in moment ${moment.id}`);
      } else if (moment.performanceBeat.importance === 'pivotal' && performanceFigure && !performanceFigure.appearanceId) {
        errors.push(`Pivotal performance ${moment.id} needs an explicit appearance for ${moment.performanceBeat.actorId}`);
      }
    }
    if (moment.next.type === 'choice') {
      const immediatelyAvailable = moment.next.options.filter((option) => !option.requiresInsightIds);
      if (immediatelyAvailable.length < 2) {
        errors.push(`Choice ${moment.id} needs at least two options available without prior reader knowledge`);
      }
      for (const option of moment.next.options) {
        for (const duplicate of findDuplicates(option.grantsInsightIds ?? [])) {
          errors.push(`Choice ${moment.id}/${option.id} grants duplicate reader insight ${duplicate}`);
        }
        for (const duplicate of findDuplicates(option.requiresInsightIds ?? [])) {
          errors.push(`Choice ${moment.id}/${option.id} requires duplicate reader insight ${duplicate}`);
        }
        for (const grantedId of option.grantsInsightIds ?? []) {
          if (!insightIds.has(grantedId)) errors.push(`Choice ${moment.id}/${option.id} grants undeclared reader insight ${grantedId}`);
        }
        for (const requiredId of option.requiresInsightIds ?? []) {
          if (!insightIds.has(requiredId)) errors.push(`Choice ${moment.id}/${option.id} requires undeclared reader insight ${requiredId}`);
          const learnableBeforeChoice = experience.moments.some((candidate) =>
            candidate.next.type === 'choice' && candidate.next.options.some((candidateOption) =>
              candidateOption.grantsInsightIds?.includes(requiredId) &&
              (candidate.id === moment.id || canReach(candidateOption.nodeId, moment.id, momentsById)),
            ),
          );
          if (!learnableBeforeChoice) errors.push(`Choice ${moment.id}/${option.id} requires reader insight ${requiredId} that cannot be learned before the gate`);
        }
      }
    }
    if (moment.readingVariants) {
      if (moment.viewpoint.kind !== 'public') errors.push(`Reading variants on ${moment.id} require a public viewpoint`);
      const variantKinds = new Set(moment.readingVariants.map((variant) => variant.when.kind));
      if (variantKinds.size > 1) errors.push(`Reading variants on ${moment.id} must use one condition kind`);
      const activeChoiceVariants = moment.readingVariants.filter(
        (variant): variant is ActiveChoiceReadingVariant => variant.when.kind === 'active-choice',
      );
      const insightVariants = moment.readingVariants.filter(
        (variant): variant is ReaderInsightReadingVariant => variant.when.kind === 'reader-insights',
      );
      const insightOrderVariants = moment.readingVariants.filter(
        (variant): variant is ReaderInsightOrderReadingVariant => variant.when.kind === 'reader-insight-order',
      );
      const choiceNodeIds = new Set(activeChoiceVariants.map((variant) => variant.when.choiceNodeId));
      if (choiceNodeIds.size > 1) errors.push(`Active-choice reading variants on ${moment.id} must share one choice coordinate`);
      const variantCoordinates = moment.readingVariants.map((variant) => variant.when.kind === 'active-choice'
        ? `active-choice/${variant.when.choiceNodeId}/${variant.when.optionId}`
        : variant.when.kind === 'reader-insights'
          ? `reader-insights/${[...variant.when.insightIds].sort().join('+')}`
          : `reader-insight-order/${variant.when.insightIds.join('>')}`);
      for (const duplicate of findDuplicates(variantCoordinates)) {
        errors.push(`Duplicate reading variant on ${moment.id}: ${duplicate}`);
      }
      for (const variant of moment.readingVariants) {
        if (!variant.tableauId) continue;
        const variantTableau = tableauxById.get(variant.tableauId);
        if (!variantTableau) {
          errors.push(`Reading variant ${moment.id} references missing tableau ${variant.tableauId}`);
          continue;
        }
        if (!tableau) continue;
        const baseMaterial = {
          location: tableau.location,
          backgroundAssetId: tableau.backgroundAssetId,
          ambienceAssetId: tableau.ambienceAssetId,
          musicAssetId: tableau.musicAssetId,
          tone: tableau.tone,
          atmosphere: tableau.atmosphere ?? [],
          artifactAssetId: tableau.artifact?.assetId,
          cutIn: tableau.cutIn,
        };
        const variantMaterial = {
          location: variantTableau.location,
          backgroundAssetId: variantTableau.backgroundAssetId,
          ambienceAssetId: variantTableau.ambienceAssetId,
          musicAssetId: variantTableau.musicAssetId,
          tone: variantTableau.tone,
          atmosphere: variantTableau.atmosphere ?? [],
          artifactAssetId: variantTableau.artifact?.assetId,
          cutIn: variantTableau.cutIn,
        };
        const baseActorIds = tableau.figures.map((figure) => figure.actorId).toSorted();
        const variantActorIds = variantTableau.figures.map((figure) => figure.actorId).toSorted();
        const preservesActorRenditions = baseActorIds.every((actorId) => {
          const actor = actorsById.get(actorId);
          const baseFigure = tableau.figures.find((figure) => figure.actorId === actorId);
          const variantFigure = variantTableau.figures.find((figure) => figure.actorId === actorId);
          if (!actor || !baseFigure || !variantFigure) return false;
          const baseAppearance = actor.appearances.find((appearance) => appearance.id === (baseFigure.appearanceId ?? actor.defaultAppearanceId));
          const variantAppearance = actor.appearances.find((appearance) => appearance.id === (variantFigure.appearanceId ?? actor.defaultAppearanceId));
          if (!baseAppearance || !variantAppearance) return false;
          return JSON.stringify({
            assetId: baseAppearance.assetId,
            stageName: baseAppearance.stageName,
            wardrobe: baseAppearance.wardrobe,
            expression: baseAppearance.expression,
            concealment: baseAppearance.concealment,
            sourceFacing: baseAppearance.sourceFacing,
          }) === JSON.stringify({
            assetId: variantAppearance.assetId,
            stageName: variantAppearance.stageName,
            wardrobe: variantAppearance.wardrobe,
            expression: variantAppearance.expression,
            concealment: variantAppearance.concealment,
            sourceFacing: variantAppearance.sourceFacing,
          });
        });
        if (
          JSON.stringify(baseMaterial) !== JSON.stringify(variantMaterial) ||
          JSON.stringify(baseActorIds) !== JSON.stringify(variantActorIds) ||
          !preservesActorRenditions
        ) {
          errors.push(`Reading variant ${moment.id}/${variant.tableauId} changes material scene continuity`);
        }
        if (moment.speakerId) {
          const speakerFigure = variantTableau.figures.find((figure) => figure.actorId === moment.speakerId);
          const speakerInCutIn = variantTableau.cutIn?.representedActorIds.includes(moment.speakerId);
          if (!speakerFigure && !speakerInCutIn) {
            errors.push(`Reading variant ${moment.id}/${variant.tableauId} does not stage speaker ${moment.speakerId}`);
          } else if (speakerFigure && speakerFigure.emphasis !== 'active') {
            errors.push(`Reading variant ${moment.id}/${variant.tableauId} must keep speaker ${moment.speakerId} active`);
          }
        }
      }
      for (const variant of activeChoiceVariants) {
        const choice = momentsById.get(variant.when.choiceNodeId);
        const option = choice?.next.type === 'choice'
          ? choice.next.options.find((candidate) => candidate.id === variant.when.optionId)
          : undefined;
        if (!option) {
          errors.push(`Reading variant ${moment.id}/${variant.when.choiceNodeId}/${variant.when.optionId} references a missing choice option`);
        } else if (!canReach(option.nodeId, moment.id, momentsById)) {
          errors.push(`Reading variant ${moment.id}/${variant.when.choiceNodeId}/${variant.when.optionId} must be downstream of its chosen route`);
        }
      }
      for (const variant of insightVariants) {
        for (const duplicate of findDuplicates(variant.when.insightIds)) {
          errors.push(`Reading variant ${moment.id} requires duplicate reader insight ${duplicate}`);
        }
        for (const insightId of variant.when.insightIds) {
          if (!insightIds.has(insightId)) {
            errors.push(`Reading variant ${moment.id} requires undeclared reader insight ${insightId}`);
            continue;
          }
          const learnableBeforeMoment = canLearnInsightBeforeMoment(insightId, moment.id, momentsById);
          if (!learnableBeforeMoment) {
            errors.push(`Reading variant ${moment.id} requires reader insight ${insightId} that cannot be learned before it`);
          }
        }
      }
      for (const variant of insightOrderVariants) {
        for (const duplicate of findDuplicates(variant.when.insightIds)) {
          errors.push(`Reading variant ${moment.id} orders duplicate reader insight ${duplicate}`);
        }
        for (const insightId of variant.when.insightIds) {
          if (!insightIds.has(insightId)) {
            errors.push(`Reading variant ${moment.id} orders undeclared reader insight ${insightId}`);
            continue;
          }
          const learnableBeforeMoment = canLearnInsightBeforeMoment(insightId, moment.id, momentsById);
          if (!learnableBeforeMoment) {
            errors.push(`Reading variant ${moment.id} orders reader insight ${insightId} that cannot be learned before it`);
          }
        }
      }
      const orderGroups = new Map<string, ReaderInsightOrderReadingVariant[]>();
      for (const variant of insightOrderVariants) {
        const key = [...variant.when.insightIds].sort().join('+');
        orderGroups.set(key, [...(orderGroups.get(key) ?? []), variant]);
      }
      for (const [key, variants] of orderGroups) {
        if (variants.length !== 2) {
          errors.push(`Reader-insight-order variants on ${moment.id} need both traversal orders for ${key}`);
        }
      }
      for (let left = 0; left < insightVariants.length; left += 1) {
        for (let right = left + 1; right < insightVariants.length; right += 1) {
          const leftIds = new Set(insightVariants[left]!.when.insightIds);
          const rightIds = new Set(insightVariants[right]!.when.insightIds);
          const leftContainsRight = [...rightIds].every((id) => leftIds.has(id));
          const rightContainsLeft = [...leftIds].every((id) => rightIds.has(id));
          if (leftContainsRight || rightContainsLeft) continue;
          const union = new Set([...leftIds, ...rightIds]);
          const hasCombinedVariant = insightVariants.some((candidate) =>
            union.size === candidate.when.insightIds.length && candidate.when.insightIds.every((id) => union.has(id)),
          );
          if (!hasCombinedVariant) {
            errors.push(`Reader-insight variants on ${moment.id} are ambiguous without a combined variant for ${[...union].sort().join(', ')}`);
          }
        }
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

  for (const insight of experience.readerInsights) {
    const granted = experience.moments.some((moment) => moment.next.type === 'choice' && moment.next.options.some((option) => option.grantsInsightIds?.includes(insight.id)));
    const harvestedByChoice = experience.moments.some((moment) => moment.next.type === 'choice' && moment.next.options.some((option) => option.requiresInsightIds?.includes(insight.id)));
    const harvestedByReading = experience.moments.some((moment) => moment.readingVariants?.some((variant) =>
      variant.when.kind !== 'active-choice' && variant.when.insightIds.includes(insight.id),
    ));
    if (!granted) errors.push(`Reader insight ${insight.id} is never learned`);
    if (!harvestedByChoice && !harvestedByReading) errors.push(`Reader insight ${insight.id} is never harvested`);
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
