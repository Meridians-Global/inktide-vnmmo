import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compileExperience } from '../src/core/compiler';
import { actorHue, povShift, presentLine, quoteSpokenLine } from '../src/core/presentation';
import { moonScarExperience } from '../src/story/moon-scar';

const compiled = compileExperience(moonScarExperience);
if (!compiled.ok) throw new Error(compiled.errors.join('\n'));
const experience = compiled.experience;
const byId = (id: string) => experience.moments.find((moment) => moment.id === id)!;

describe('presentation', () => {
  it('quotes spoken lines once and leaves authored quotes alone', () => {
    assert.deepEqual(quoteSpokenLine('Rank is a rumor.'), { text: '“Rank is a rumor.”', quoted: true });
    assert.deepEqual(quoteSpokenLine('“Already quoted.”'), { text: '“Already quoted.”', quoted: false });
  });

  it('gives each actor a stable legible hue', () => {
    const hues = experience.actors.map((actor) => actorHue(actor.id));
    assert.deepEqual(hues, experience.actors.map((actor) => actorHue(actor.id)));
    for (const hue of hues) assert.ok(hue < 60 || hue >= 160, `hue ${hue} sits in the muddy band`);
  });

  it('detects perspective shifts between consecutive moments', () => {
    const publicMoment = experience.moments.find((moment) => moment.viewpoint.kind === 'public')!;
    const privateMoment = experience.moments.find((moment) => moment.viewpoint.kind === 'private')!;
    const otherHolder = experience.moments.find((moment) => moment.viewpoint.kind === 'private' && moment.viewpoint.holderId !== (privateMoment.viewpoint as { holderId: string }).holderId);
    assert.equal(povShift(undefined, publicMoment), 'none');
    assert.equal(povShift(undefined, privateMoment), 'enter-private');
    assert.equal(povShift(publicMoment, privateMoment), 'enter-private');
    assert.equal(povShift(privateMoment, publicMoment), 'exit-private');
    assert.equal(povShift(publicMoment, publicMoment), 'none');
    if (otherHolder) assert.equal(povShift(privateMoment, otherHolder), 'holder-change');
  });

  it('renders thoughts inward: no speaker name, thinker in the eyebrow, others recede', () => {
    const thought = experience.moments.find((moment) => moment.mode === 'thought')!;
    const presented = presentLine(experience, thought, undefined, 'Fang Yuan');
    const holder = experience.actors.find((actor) => actor.id === thought.speakerId)!;
    assert.equal(presented.register, 'thought');
    assert.equal(presented.speakerName, '');
    assert.equal(presented.eyebrow, `${holder.name} · thinks`);
    assert.equal(presented.quoted, false);
    assert.ok(!presented.outsidePovActorIds.includes(holder.id));
  });

  it('renders dialogue quoted with the speaker named and hued', () => {
    const dialogue = experience.moments.find((moment) => moment.mode === 'dialogue')!;
    const presented = presentLine(experience, dialogue, undefined, 'Name');
    assert.equal(presented.speakerName, 'Name');
    assert.equal(presented.speakerHue, actorHue(dialogue.speakerId!));
    assert.ok(presented.text.startsWith('“'));
  });

  it('narration carries no speaker and no quotes', () => {
    const narration = experience.moments.find((moment) => moment.mode === 'narration' && !moment.speakerId)!;
    const presented = presentLine(experience, narration, byId(narration.id), '');
    assert.equal(presented.speakerName, '');
    assert.equal(presented.speakerHue, undefined);
    assert.equal(presented.text, narration.text);
  });
});
