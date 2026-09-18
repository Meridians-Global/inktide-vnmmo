import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compileExperience } from '../src/core/compiler';
import { availableChoiceOptions, currentMoment, hasInsightsInOrder, initialReaderState, initialReaderStateFromLink, reduceReader, resumeReaderState } from '../src/core/reader-state';
import { moonScarExperience } from '../src/story/moon-scar';
import { spiderMemoryExperience } from '../src/story/spider-memory';

const compiled = compileExperience(moonScarExperience);
if (!compiled.ok) throw new Error(compiled.errors.join('\n'));
const experience = compiled.experience;

describe('reader state', () => {
  it('can start from an exact valid review moment', () => {
    const state = initialReaderState(experience, 'tally-bound');
    assert.equal(state.currentNodeId, 'tally-bound');
    assert.equal(state.history.at(-1), 'crescent-reading');
    assert.throws(() => initialReaderState(experience, 'missing'), /Cannot start reader at missing moment missing/);
  });

  it('fails closed at the authored beginning when a URL requests an illegal coordinate', () => {
    const spiderCompiled = compileExperience(spiderMemoryExperience);
    if (!spiderCompiled.ok) throw new Error(spiderCompiled.errors.join('\n'));
    const spider = spiderCompiled.experience;

    assert.equal(initialReaderStateFromLink(spider, 'peter-restraint').currentNodeId, 'peter-restraint');
    assert.equal(initialReaderStateFromLink(spider, 'room-without-verdict').currentNodeId, spider.startNodeId);
    assert.equal(initialReaderStateFromLink(spider, 'missing').currentNodeId, spider.startNodeId);
  });

  it('resumes a persisted coordinate with its rebuilt legal path', () => {
    const resumed = resumeReaderState(experience, { currentNodeId: 'tally-bound' });
    assert.equal(resumed.currentNodeId, 'tally-bound');
    assert.deepEqual(resumed.history, initialReaderState(experience, 'tally-bound').history);
    assert.equal(resumed.isBacklogOpen, false);
    assert.equal(resumeReaderState(experience, { currentNodeId: 'missing' }).currentNodeId, experience.startNodeId);
    assert.equal(resumeReaderState(experience, null).currentNodeId, experience.startNodeId);
  });

  it('can go back from a deep-linked moment through a deterministic branch path', () => {
    const state = initialReaderState(experience, 'chun-answers');
    assert.deepEqual(state.route.at(-1), { nodeId: 'question-choice', optionId: 'ask-rank' });
    const privateReading = reduceReader(experience, state, { type: 'back' });
    assert.equal(privateReading.currentNodeId, 'rank-chun-private');
    const question = reduceReader(experience, privateReading, { type: 'back' });
    assert.equal(question.currentNodeId, 'rank-question');
    const choice = reduceReader(experience, question, { type: 'back' });
    assert.equal(choice.currentNodeId, 'question-choice');
  });

  it('keeps overlays mutually exclusive', () => {
    const start = initialReaderState(experience);
    const settings = reduceReader(experience, start, { type: 'toggle-settings' });
    assert.equal(settings.isSettingsOpen, true);
    assert.equal(settings.isBacklogOpen, false);
    const backlogOpen = reduceReader(experience, settings, { type: 'toggle-backlog' });
    assert.equal(backlogOpen.isBacklogOpen, true);
    assert.equal(backlogOpen.isSettingsOpen, false);
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
    const state = initialReaderState(experience, 'question-choice');
    assert.equal(currentMoment(experience, state).id, 'question-choice');
    assert.deepEqual(reduceReader(experience, state, { type: 'advance' }), state);
    const chosen = reduceReader(experience, state, { type: 'choose', optionId: 'ask-loss' });
    assert.equal(currentMoment(experience, chosen).id, 'loss-question');
    assert.deepEqual(chosen.route.at(-1), { nodeId: 'question-choice', optionId: 'ask-loss' });
  });

  it('forgets an abandoned active route while retaining what the reader saw', () => {
    let state = initialReaderState(experience, 'question-choice');
    state = reduceReader(experience, state, { type: 'choose', optionId: 'ask-loss' });
    assert.deepEqual(state.route.at(-1), { nodeId: 'question-choice', optionId: 'ask-loss' });
    state = reduceReader(experience, state, { type: 'back' });
    assert.equal(state.route.some((choice) => choice.nodeId === 'question-choice'), false);
    assert.deepEqual(state.route.at(-1), { nodeId: 'evidence-reading-choice', optionId: 'trace-empty-cells' });
    assert.ok(state.seenNodeIds.includes('loss-question'));
  });

  it('resolves a delayed public reading from the active traversal choice', () => {
    let state = initialReaderState(experience, 'question-choice');
    state = reduceReader(experience, state, { type: 'choose', optionId: 'ask-loss' });
    state = reduceReader(experience, state, { type: 'advance' });
    state = reduceReader(experience, state, { type: 'advance' });
    assert.equal(currentMoment(experience, state).id, 'chun-answers');
    assert.match(currentMoment(experience, state).text, /missing three/);

    state = reduceReader(experience, state, { type: 'back' });
    state = reduceReader(experience, state, { type: 'back' });
    state = reduceReader(experience, state, { type: 'back' });
    state = reduceReader(experience, state, { type: 'choose', optionId: 'ask-rank' });
    state = reduceReader(experience, state, { type: 'advance' });
    state = reduceReader(experience, state, { type: 'advance' });
    assert.match(currentMoment(experience, state).text, /At rank two/);
  });

  it('does not move when an invalid option is requested', () => {
    const state = initialReaderState(experience, 'question-choice');
    assert.deepEqual(reduceReader(experience, state, { type: 'choose', optionId: 'not-real' }), state);
  });

  it('retains semantic reader insights across Back and clears them on Restart', () => {
    const spiderCompiled = compileExperience(spiderMemoryExperience);
    if (!spiderCompiled.ok) throw new Error(spiderCompiled.errors.join('\n'));
    const spider = spiderCompiled.experience;
    let state = initialReaderState(spider, 'perspective-choice');
    assert.deepEqual(availableChoiceOptions(currentMoment(spider, state), state).map((option) => option.id), ['read-peter', 'read-mj']);
    assert.equal(reduceReader(spider, state, { type: 'choose', optionId: 'hold-both' }), state);

    state = reduceReader(spider, state, { type: 'choose', optionId: 'read-peter' });
    assert.ok(state.insightIds.includes('peter-restraint-understood'));
    state = reduceReader(spider, state, { type: 'back' });
    assert.ok(state.insightIds.includes('peter-restraint-understood'));
    state = reduceReader(spider, state, { type: 'choose', optionId: 'read-mj' });
    assert.ok(state.insightIds.includes('peter-restraint-understood'));
    assert.ok(state.insightIds.includes('mj-memory-boundary-understood'));
    state = reduceReader(spider, state, { type: 'back' });

    assert.deepEqual(availableChoiceOptions(currentMoment(spider, state), state).map((option) => option.id), ['read-peter', 'read-mj', 'hold-both']);
    assert.equal(currentMoment(spider, reduceReader(spider, state, { type: 'choose', optionId: 'hold-both' })).id, 'both-truths-reading');
    assert.throws(() => initialReaderState(spider, 'both-truths-reading'), /Cannot reconstruct reader path/);
    assert.deepEqual(reduceReader(spider, state, { type: 'restart' }).insightIds, []);
  });

  it('carries an abandoned observational route into a later public reading', () => {
    const spiderCompiled = compileExperience(spiderMemoryExperience);
    if (!spiderCompiled.ok) throw new Error(spiderCompiled.errors.join('\n'));
    const spider = spiderCompiled.experience;
    let state = initialReaderState(spider, 'room-reading-choice');

    state = reduceReader(spider, state, { type: 'choose', optionId: 'watch-threshold' });
    assert.deepEqual(state.insightIds, ['threshold-distance-noticed']);
    state = reduceReader(spider, state, { type: 'back' });
    state = reduceReader(spider, state, { type: 'choose', optionId: 'watch-mj-grip' });
    assert.deepEqual(state.insightIds, ['threshold-distance-noticed', 'mj-grip-noticed']);

    state = initialReaderState(spider, 'small-defence-returns');
    assert.doesNotMatch(currentMoment(spider, state).text, /Two small defences/);
    state = { ...state, insightIds: ['threshold-distance-noticed', 'mj-grip-noticed'] };
    assert.match(currentMoment(spider, state).text, /Two small defences/);
  });

  it('preserves first-look bias when two private readings are synthesized', () => {
    const spiderCompiled = compileExperience(spiderMemoryExperience);
    if (!spiderCompiled.ok) throw new Error(spiderCompiled.errors.join('\n'));
    const spider = spiderCompiled.experience;

    assert.equal(hasInsightsInOrder(['a', 'aside', 'b'], ['a', 'b']), true);
    assert.equal(hasInsightsInOrder(['b', 'a'], ['a', 'b']), false);

    const synthesize = (first: 'read-peter' | 'read-mj', second: 'read-peter' | 'read-mj') => {
      let state = initialReaderState(spider, 'perspective-choice');
      state = reduceReader(spider, state, { type: 'choose', optionId: first });
      state = reduceReader(spider, state, { type: 'back' });
      state = reduceReader(spider, state, { type: 'choose', optionId: second });
      state = reduceReader(spider, state, { type: 'back' });
      state = reduceReader(spider, state, { type: 'choose', optionId: 'hold-both' });
      return currentMoment(spider, state);
    };

    const peterFirst = synthesize('read-peter', 'read-mj');
    const mjFirst = synthesize('read-mj', 'read-peter');
    assert.match(peterFirst.text, /restraint had made love look costly/);
    assert.equal(peterFirst.tableauId, 'revealed-peter-appraisal');
    assert.match(mjFirst.text, /boundary had made memory’s absence decisive/);
    assert.equal(mjFirst.tableauId, 'revealed-mj-appraisal');

    const synthesizeMoonScar = (first: 'read-fang-calculation' | 'read-chun-warning', second: 'read-fang-calculation' | 'read-chun-warning') => {
      let state = initialReaderState(experience, 'reliquary-reading-choice');
      state = reduceReader(experience, state, { type: 'choose', optionId: first });
      state = reduceReader(experience, state, { type: 'back' });
      state = reduceReader(experience, state, { type: 'choose', optionId: second });
      state = reduceReader(experience, state, { type: 'back' });
      state = reduceReader(experience, state, { type: 'choose', optionId: 'hold-leverage-warning' });
      return currentMoment(experience, state);
    };

    const fangFirst = synthesizeMoonScar('read-fang-calculation', 'read-chun-warning');
    const chunFirst = synthesizeMoonScar('read-chun-warning', 'read-fang-calculation');
    assert.match(fangFirst.text, /Leverage appeared first/);
    assert.equal(fangFirst.tableauId, 'substrate-fang-appraisal');
    assert.match(chunFirst.text, /Warning appeared first/);
    assert.equal(chunFirst.tableauId, 'substrate-chun-appraisal');
  });

  it('lets the reader predict conduct without changing the authored event', () => {
    const spiderCompiled = compileExperience(spiderMemoryExperience);
    if (!spiderCompiled.ok) throw new Error(spiderCompiled.errors.join('\n'));
    const spider = spiderCompiled.experience;

    const readSpiderPrediction = (optionId: 'expect-retreat' | 'expect-return-choice') => {
      let state = initialReaderState(spider, 'restraint-forecast');
      state = reduceReader(spider, state, { type: 'choose', optionId });
      state = reduceReader(spider, state, { type: 'advance' });
      return { state, moment: currentMoment(spider, state) };
    };
    const retreat = readSpiderPrediction('expect-retreat');
    const returned = readSpiderPrediction('expect-return-choice');
    assert.equal(retreat.moment.id, 'peter-offers-distance');
    assert.equal(returned.moment.id, 'peter-offers-distance');
    assert.match(retreat.moment.text, /then stayed/);
    assert.match(returned.moment.text, /decision with her/);
    assert.deepEqual(retreat.state.insightIds, returned.state.insightIds);

    const readFangPrediction = (optionId: 'expect-seize' | 'expect-preserve') => {
      let state = initialReaderState(experience, 'fang-conduct-forecast');
      state = reduceReader(experience, state, { type: 'choose', optionId });
      state = reduceReader(experience, state, { type: 'advance' });
      state = reduceReader(experience, state, { type: 'advance' });
      return { state, moment: currentMoment(experience, state) };
    };
    const seized = readFangPrediction('expect-seize');
    const preserved = readFangPrediction('expect-preserve');
    assert.equal(seized.moment.id, 'conduct-prediction-settles');
    assert.equal(preserved.moment.id, 'conduct-prediction-settles');
    assert.match(seized.moment.text, /revised the reading/);
    assert.match(preserved.moment.text, /prediction held/);
    assert.deepEqual(seized.state.insightIds, preserved.state.insightIds);
  });
});
