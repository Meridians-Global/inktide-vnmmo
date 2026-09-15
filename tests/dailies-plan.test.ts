import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compileExperience } from '../src/core/compiler';
import { planDailies } from '../src/core/dailies-plan';
import { currentMoment, initialReaderState, reduceReader } from '../src/core/reader-state';
import { experiences } from '../src/story';

describe('dailies plan', () => {
  for (const authored of experiences) {
    const compiled = compileExperience(authored);
    if (!compiled.ok) throw new Error(compiled.errors.join('\n'));
    const experience = compiled.experience;
    const plan = planDailies(experience);

    it(`${experience.id}: covers every moment and never repeats a reading`, () => {
      const covered = new Set(plan.map((frame) => frame.momentId));
      for (const moment of experience.moments) assert.ok(covered.has(moment.id), `moment not reachable: ${moment.id}`);
      assert.equal(new Set(plan.map((frame) => frame.frameId)).size, plan.length, 'frame ids are unique');
      assert.equal(plan.filter((frame) => frame.reading === 'base').length, new Set(plan.filter((frame) => frame.reading === 'base').map((frame) => frame.momentId)).size, 'one base reading per moment');
    });

    it(`${experience.id}: covers every authored reading variant`, () => {
      const variantTexts = new Set(experience.moments.flatMap((moment) => (moment.readingVariants ?? []).map((variant) => variant.text)));
      const plannedTexts = new Set(plan.map((frame) => frame.text));
      for (const text of variantTexts) assert.ok(plannedTexts.has(text), `variant reading not reachable: ${text.slice(0, 40)}`);
    });

    it(`${experience.id}: every step sequence replays through the real reducer to its frame`, () => {
      for (const frame of plan) {
        let state = initialReaderState(experience);
        for (const step of frame.steps) {
          state = reduceReader(experience, state, step.type === 'choose' ? { type: 'choose', optionId: step.optionId } : { type: step.type });
        }
        const moment = currentMoment(experience, state);
        assert.equal(moment.id, frame.momentId, frame.frameId);
        assert.equal(moment.text, frame.text, frame.frameId);
        assert.equal(moment.tableauId, frame.tableauId, frame.frameId);
      }
    });
  }

  it('is deterministic', () => {
    const compiled = compileExperience(experiences[0]!);
    if (!compiled.ok) throw new Error(compiled.errors.join('\n'));
    assert.deepEqual(planDailies(compiled.experience), planDailies(compiled.experience));
  });
});
