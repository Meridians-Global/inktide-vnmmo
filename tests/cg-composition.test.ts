import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { composePrompt, validateComposition, type CgComposition } from '../src/core/cg-composition';

const twoShot: CgComposition = {
  scale: 'full',
  camera: { height: 'low', angle: 'over-shoulder' },
  placements: [
    { subject: 'the dark-robed cultivator', third: 'left', plane: 'fore', facing: 'into-depth', vector: 'gaze across the valley' },
    { subject: 'the white-robed elder', third: 'right', plane: 'mid', facing: 'screen-left', vector: 'open hand pointing down at the caravan' },
  ],
  planes: { fore: 'snow-dusted rock ledge', mid: 'a switchback road with a caravan', far: 'dawn-lit peaks' },
  light: { key: 'cold dawn glow', from: 'behind the far ridge', mood: 'hushed and expectant' },
  leadingLine: 'the road winding from the ledge to the peaks',
  negativeSpace: 'lower-quarter',
};

describe('cg composition', () => {
  it('compiles a valid brief to prompt text that names camera, thirds, depth, light and reserved space', () => {
    const prompt = composePrompt(twoShot);
    for (const fragment of ['camera low', 'over the shoulder', 'left third', 'right third', 'foreground snow-dusted', 'from behind the far ridge', 'lower quarter', 'no centred symmetric lineup']) {
      assert.ok(prompt.includes(fragment), `missing ${fragment}`);
    }
  });

  it('rejects the flat lineup: same third, same plane, everyone facing camera, subject in reserved space', () => {
    const lineup: CgComposition = {
      ...twoShot,
      placements: twoShot.placements.map((placement) => ({ ...placement, third: 'centre', plane: 'mid', facing: 'toward-camera' })),
    };
    const errors = validateComposition(lineup);
    assert.equal(errors.length, 3);
    assert.throws(() => composePrompt(lineup), /Invalid CG composition/);
    const collision: CgComposition = { ...twoShot, negativeSpace: 'left-third' };
    assert.match(validateComposition(collision).join(), /reserved for negative space/);
    assert.deepEqual(validateComposition(twoShot), []);
  });
});
