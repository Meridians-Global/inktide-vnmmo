import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compileExperience } from '../src/core/compiler';
import type { Experience, Moment } from '../src/core/contracts';
import { resolveReadingMoment } from '../src/core/reader-state';
import { planVoiceLines, voiceLineAssetId, withVoiceLines, type VoiceCast } from '../src/core/voice-cast';
import { casts } from '../src/story/casting';
import { experiences as stories } from '../src/story';

const cast: VoiceCast = {
  narrator: { voiceId: 'narrator-voice', speed: 1, pitch: 0, emotion: 'auto', note: '' },
  actors: { hero: { voiceId: 'hero-voice', speed: 1.1, pitch: -1, emotion: 'auto', note: '' } },
  deliveries: { ending: { emotion: 'sad' } },
};

const pub = { kind: 'public' } as const;
const moments: Moment[] = [
  { id: 'open', chapter: 'c', mode: 'narration', viewpoint: pub, text: 'It rained.', tableauId: 't', cueAssetIds: [], next: { type: 'goto', nodeId: 'line' } },
  { id: 'line', chapter: 'c', mode: 'dialogue', viewpoint: pub, speakerId: 'hero', text: 'Hello.', tableauId: 't', cueAssetIds: [], readingVariants: [{ when: { kind: 'reader-insights', insightIds: ['x'] }, text: 'Hello again.' }], next: { type: 'goto', nodeId: 'think' } },
  { id: 'think', chapter: 'c', mode: 'thought', speakerId: 'hero', viewpoint: { kind: 'private', holderId: 'hero' }, text: 'Why.', tableauId: 't', cueAssetIds: [], next: { type: 'goto', nodeId: 'ending' } },
  { id: 'ending', chapter: 'c', mode: 'ending', viewpoint: pub, text: 'Fin.', tableauId: 't', cueAssetIds: [], next: { type: 'end' } },
];

const experience = { id: 'x', assets: [], moments } as unknown as Experience;

describe('voice cast', () => {
  it('routes speakers to their actor voice and everything else to the narrator, with stable ids', () => {
    const lines = planVoiceLines(experience, cast);
    assert.deepEqual(lines.map((line) => line.assetId), ['voice-open', 'voice-line', 'voice-line-v1', 'voice-think', 'voice-ending']);
    assert.equal(lines[0]!.profile.voiceId, 'narrator-voice');
    assert.equal(lines[1]!.profile.voiceId, 'hero-voice');
    assert.equal(lines[2]!.text, 'Hello again.');
    assert.equal(lines[2]!.variantIndex, 0);
    assert.equal(voiceLineAssetId('line', 0), 'voice-line-v1');
  });

  it('shapes delivery: thoughts slow and calm, endings slow, explicit deliveries override', () => {
    const lines = planVoiceLines(experience, cast);
    const think = lines.find((line) => line.momentId === 'think')!;
    assert.ok(think.profile.speed < 1.1);
    assert.equal(think.profile.emotion, 'calm');
    const ending = lines.find((line) => line.momentId === 'ending')!;
    assert.ok(ending.profile.speed < 1);
    assert.equal(ending.profile.emotion, 'sad');
  });

  it('refuses a speaker with no cast profile', () => {
    assert.throws(() => planVoiceLines(experience, { ...cast, actors: {} }), /no profile for speaker hero/);
  });

  it('attaches pinned lines to moments and variants, dropping stale lines that match nothing', () => {
    const attached = withVoiceLines(experience, [
      { assetId: 'voice-line', momentId: 'line', sourcePath: 'a.mp3', sha256: '1' },
      { assetId: 'voice-line-v1', momentId: 'line', variantIndex: 0, sourcePath: 'b.mp3', sha256: '2' },
      { assetId: 'voice-gone', momentId: 'gone', sourcePath: 'c.mp3', sha256: '3' },
      { assetId: 'voice-line-v2', momentId: 'line', variantIndex: 1, sourcePath: 'd.mp3', sha256: '4' },
    ]);
    const line = attached.moments.find((moment) => moment.id === 'line')!;
    assert.equal(line.voiceAssetId, 'voice-line');
    assert.equal(line.readingVariants?.[0]?.voiceAssetId, 'voice-line-v1');
    assert.deepEqual(attached.assets.map((asset) => asset.id), ['voice-line', 'voice-line-v1']);
    assert.equal(attached.assets[0]!.kind, 'voice');
    assert.equal(attached.moments.find((moment) => moment.id === 'open')!.voiceAssetId, undefined);
  });

  it('a resolved reading variant speaks its own line, or the base line when it has none', () => {
    const base = { ...moments[1]!, voiceAssetId: 'voice-line', readingVariants: [
      { when: { kind: 'reader-insights', insightIds: ['x'] }, text: 'Hello again.', voiceAssetId: 'voice-line-v1' },
      { when: { kind: 'reader-insights', insightIds: ['y'] }, text: 'Hello, twice.' },
    ] } satisfies Moment;
    assert.equal(resolveReadingMoment(base, { route: [], insightIds: ['x'] }).voiceAssetId, 'voice-line-v1');
    assert.equal(resolveReadingMoment(base, { route: [], insightIds: ['y'] }).voiceAssetId, 'voice-line');
    assert.equal(resolveReadingMoment(base, { route: [], insightIds: [] }).voiceAssetId, 'voice-line');
  });

  it('every registered story has a full cast and every moment compiles with a voice line', () => {
    for (const story of stories) {
      const storyCast = casts[story.id];
      assert.ok(storyCast, `${story.id} has no voice cast`);
      const planned = planVoiceLines(story, storyCast);
      assert.equal(planned.length, story.moments.reduce((count, moment) => count + 1 + (moment.readingVariants?.length ?? 0), 0));
      const compiled = compileExperience(story);
      assert.ok(compiled.ok, compiled.ok ? '' : compiled.errors.join('\n'));
      for (const moment of story.moments) assert.ok(moment.voiceAssetId, `${story.id}/${moment.id} has no voice line`);
    }
  });
});
