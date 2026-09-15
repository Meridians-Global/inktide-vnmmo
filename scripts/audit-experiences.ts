import { compileExperience } from '../src/core/compiler';
import { auditExperience } from '../src/core/production-audit';
import { experiences } from '../src/story';
import { productionTargetFor } from '../src/story/production-targets';

for (const experience of experiences) {
  const compiled = compileExperience(experience);
  if (!compiled.ok) throw new Error(`Experience ${experience.id} failed compilation:\n${compiled.errors.join('\n')}`);
  const audit = auditExperience(experience, productionTargetFor(experience.id));
  console.log(`\n${experience.title} · ${audit.inventory.moments} moments · ${audit.inventory.locations.length} locations · ${audit.choices.length} choices · ${audit.inventory.reading.shortestRouteSeconds}–${audit.inventory.reading.longestRouteSeconds}s at ${audit.inventory.reading.wordsPerMinute} WPM`);
  for (const choice of audit.choices) {
    console.log(`  choice ${choice.momentId} [${choice.purpose}/${choice.weight}] → ${choice.convergenceMomentId ?? 'OPEN'} · payoff ${choice.payoffMomentIds.join(', ') || 'MISSING'}`);
  }
  if (audit.demands.length === 0) console.log('  no declared production gaps');
  for (const demand of audit.demands) {
    console.log(`  ${demand.priority.toUpperCase()} ${demand.id} [${demand.lane}]${demand.momentIds.length > 0 ? ` · ${demand.momentIds.join(', ')}` : ''}`);
  }
}
