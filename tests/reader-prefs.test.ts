import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compileExperience } from '../src/core/compiler';
import { DEFAULT_PREFS, autoAdvanceMs, canPlayThrough, coercePrefs, cyclePref, revealMsPerChar } from '../src/core/reader-prefs';
import { initialReaderState, reduceReader } from '../src/core/reader-state';
import { moonScarExperience } from '../src/story/moon-scar';

const compiled = compileExperience(moonScarExperience);
if (!compiled.ok) throw new Error(compiled.errors.join('\n'));
const experience = compiled.experience;

describe('reader prefs', () => {
  it('cycles each preference through its options and wraps', () => {
    let prefs = DEFAULT_PREFS;
    assert.equal(cyclePref(prefs, 'textSpeed').textSpeed, 'slow');
    prefs = cyclePref(cyclePref(prefs, 'textSpeed'), 'textSpeed');
    assert.equal(prefs.textSpeed, 'instant');
    assert.equal(cyclePref(prefs, 'textSize').textSize, 'large');
    assert.equal(prefs.textSize, 'medium');
  });

  it('coerces unknown or partial persisted values back to defaults field by field', () => {
    assert.deepEqual(coercePrefs(undefined), DEFAULT_PREFS);
    assert.deepEqual(coercePrefs({ textSpeed: 'warp', textSize: 'large' }), { ...DEFAULT_PREFS, textSize: 'large' });
  });

  it('reveals instantly under reduced motion or the instant setting and scales AUTO delay with line length', () => {
    assert.equal(revealMsPerChar(DEFAULT_PREFS, true), 0);
    assert.equal(revealMsPerChar({ ...DEFAULT_PREFS, textSpeed: 'instant' }, false), 0);
    assert.ok(revealMsPerChar(DEFAULT_PREFS, false) > 0);
    assert.ok(autoAdvanceMs(DEFAULT_PREFS, 'A long sentence about fate.') > autoAdvanceMs(DEFAULT_PREFS, 'Yes.'));
    assert.ok(autoAdvanceMs({ ...DEFAULT_PREFS, autoDelay: 'brisk' }, 'Yes.') < autoAdvanceMs({ ...DEFAULT_PREFS, autoDelay: 'leisurely' }, 'Yes.'));
  });

  it('AUTO stops at forks; SKIP additionally stops at unread text and while a panel is open', () => {
    const start = initialReaderState(experience);
    assert.equal(canPlayThrough(experience, start, 'manual'), false);
    assert.equal(canPlayThrough(experience, start, 'auto'), true);
    assert.equal(canPlayThrough(experience, start, 'skip'), false);
    assert.equal(canPlayThrough(experience, reduceReader(experience, start, { type: 'toggle-settings' }), 'auto'), false);

    const advanced = reduceReader(experience, start, { type: 'advance' });
    const backAtStart = reduceReader(experience, advanced, { type: 'back' });
    assert.equal(canPlayThrough(experience, backAtStart, 'skip'), true);

    const fork = initialReaderState(experience, 'question-choice');
    assert.equal(canPlayThrough(experience, fork, 'auto'), false);
  });
});
