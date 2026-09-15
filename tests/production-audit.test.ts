import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { auditExperience, summarizeProductionPortfolio } from '../src/core/production-audit';
import { moonScarExperience } from '../src/story/moon-scar';
import { spiderMemoryExperience } from '../src/story/spider-memory';
import { productionTargetFor } from '../src/story/production-targets';
import type { Experience } from '../src/core/contracts';

// Moon-Scar with Fang Yuan's pivotal decision at `question-choice` left on his baseline rendition.
const staticFangDecision: Experience = {
  ...moonScarExperience,
  tableaux: moonScarExperience.tableaux.map((tableau) => tableau.id !== 'fang-question' ? tableau : {
    ...tableau,
    figures: tableau.figures.map((figure) => figure.actorId !== 'fang-yuan' ? figure : { ...figure, appearanceId: 'field-neutral' }),
  }),
};

describe('production audit', () => {
  it('derives exact choice convergence and payoff coordinates', () => {
    const audit = auditExperience(spiderMemoryExperience, productionTargetFor(spiderMemoryExperience.id));
    const nameReading = audit.choices.find((choice) => choice.momentId === 'name-reading-choice');
    const forecast = audit.choices.find((choice) => choice.momentId === 'restraint-forecast');

    assert.equal(nameReading?.convergenceMomentId, 'name-settles');
    assert.deepEqual(nameReading?.privateHolderIds, ['mj', 'peter-parker']);
    assert.deepEqual(nameReading?.payoffMomentIds, ['name-settles']);
    assert.equal(forecast?.convergenceMomentId, 'peter-offers-distance');
    assert.deepEqual(forecast?.payoffMomentIds, ['peter-offers-distance']);
  });

  it('turns declared production targets and static pivotal acting into typed demands', () => {
    const spider = auditExperience(spiderMemoryExperience, productionTargetFor(spiderMemoryExperience.id));
    const moon = auditExperience(moonScarExperience, productionTargetFor(moonScarExperience.id));

    assert.ok(!spider.demands.some((demand) => demand.lane === 'story' || demand.lane === 'set'));
    assert.ok(!moon.demands.some((demand) => demand.lane === 'story' || demand.lane === 'set'));
    assert.ok(!moon.demands.some((demand) => demand.lane === 'performance'));
    const staticMoon = auditExperience(staticFangDecision, productionTargetFor(moonScarExperience.id));
    assert.ok(staticMoon.demands.some((demand) => demand.id === 'performance:question-choice:fang-yuan'));
  });

  it('measures the shortest valid route instead of summing mutually exclusive branches', () => {
    const spider = auditExperience(spiderMemoryExperience, productionTargetFor(spiderMemoryExperience.id));
    const moon = auditExperience(moonScarExperience, productionTargetFor(moonScarExperience.id));

    assert.equal(spider.inventory.reading.wordsPerMinute, 180);
    assert.ok(spider.inventory.reading.shortestRouteWords <= spider.inventory.reading.longestRouteWords);
    assert.ok(moon.inventory.reading.shortestRouteWords <= moon.inventory.reading.longestRouteWords);
    assert.ok(spider.inventory.reading.shortestRouteSeconds >= 180);
    assert.ok(moon.inventory.reading.shortestRouteSeconds >= 180);
  });

  it('keeps defined, used and unused appearances distinct', () => {
    const audit = auditExperience(spiderMemoryExperience, productionTargetFor(spiderMemoryExperience.id));
    const peter = audit.actors.find((actor) => actor.actorId === 'peter-parker');

    assert.ok(peter);
    assert.ok(peter.usedAppearanceIds.includes('spider-masked'));
    assert.ok(peter.unusedAppearanceIds.includes('civilian-guarded'));
    assert.equal(peter.definedAppearanceIds.length, peter.usedAppearanceIds.length + peter.unusedAppearanceIds.length);
  });

  it('selects one deterministic next repair without implying artistic approval', () => {
    const spiderTarget = productionTargetFor(spiderMemoryExperience.id);
    const moonTarget = productionTargetFor(moonScarExperience.id);
    const report = summarizeProductionPortfolio([
      {
        audit: auditExperience(spiderMemoryExperience, spiderTarget),
        target: spiderTarget,
        experienceSha256: 'spider-experience',
        productionAuditSha256: 'spider-audit',
        receiptSha256: 'spider-receipt',
      },
      {
        audit: auditExperience(staticFangDecision, moonTarget),
        target: moonTarget,
        experienceSha256: 'moon-experience',
        productionAuditSha256: 'moon-audit',
        receiptSha256: 'moon-receipt',
      },
    ]);

    assert.equal(report.status, 'needs-repair');
    assert.equal(report.experiences[0]?.status, 'targets-met');
    assert.equal(report.experiences[1]?.status, 'needs-repair');
    assert.equal(report.nextRepair?.id, 'performance:question-choice:fang-yuan');
    assert.equal(report.nextRepair?.experienceId, moonScarExperience.id);
  });
});
