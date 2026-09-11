import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compileExperience } from '../src/core/compiler';
import { currentMoment, initialReaderState, reduceReader } from '../src/core/reader-state';
import { moonScarExperience } from '../src/story/moon-scar';

const compiled = compileExperience(moonScarExperience);
if (!compiled.ok) throw new Error(compiled.errors.join('\n'));
const experience = compiled.experience;

describe('reader state', () => {
  it('can start from an exact valid review moment', () => {
    assert.equal(initialReaderState(experience, 'tally-bound').currentNodeId, 'tally-bound');
    assert.throws(() => initialReaderState(experience, 'missing'), /Cannot start reader at missing moment missing/);
  });
  it('advances and rewinds at moment grain', () => {
    const start = initialReaderState(experience);
    const advanced = reduceReader(experience, start, { type: 'advance' });
    assert.equal(currentMoment(experience, advanced).id, 'chun-arrives');
    const rewound = reduceReader(experience, advanced, { type: 'back' });
    assert.equal(rewound.currentNodeId, start.currentNodeId);
    assert.deepEqual(rewound.history, []);
    assert.deepEqual(rewound.seenNodeIds, ['cleft-location', 'chun-arrives']);
  });

  it('halts at a traversal choice until the reader commits', () => {
    let state = initialReaderState(experience);
    for (let index = 0; index < 8; index += 1) state = reduceReader(experience, state, { type: 'advance' });
    assert.equal(currentMoment(experience, state).id, 'question-choice');
    assert.deepEqual(reduceReader(experience, state, { type: 'advance' }), state);
    const chosen = reduceReader(experience, state, { type: 'choose', optionId: 'ask-loss' });
    assert.equal(currentMoment(experience, chosen).id, 'loss-question');
    assert.deepEqual(chosen.route, [{ nodeId: 'question-choice', optionId: 'ask-loss' }]);
  });

  it('does not move when an invalid option is requested', () => {
    let state = initialReaderState(experience);
    for (let index = 0; index < 8; index += 1) state = reduceReader(experience, state, { type: 'advance' });
    assert.deepEqual(reduceReader(experience, state, { type: 'choose', optionId: 'not-real' }), state);
  });
});
