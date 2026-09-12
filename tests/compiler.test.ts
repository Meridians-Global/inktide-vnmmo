import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compileExperience } from '../src/core/compiler';
import { moonScarExperience } from '../src/story/moon-scar';
import { spiderMemoryExperience } from '../src/story/spider-memory';
import { detectPerformanceBeats } from '../src/core/performance-beats';

describe('compileExperience', () => {
  it('compiles the prepared catch-up reading', () => {
    const result = compileExperience(moonScarExperience);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.experience.moments.length, 14);
  });

  it('can compile an experience into an isolated asset namespace', () => {
    const result = compileExperience(moonScarExperience, { assetUrlBase: '/generated/moon-scar/assets' });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.experience.assets[0]?.url, '/generated/moon-scar/assets/cleft-bg.jpg');
  });

  it('rejects direct private POV hopping', () => {
    const moments = moonScarExperience.moments.map((moment) =>
      moment.id === 'chun-speaks'
        ? { ...moment, viewpoint: { kind: 'private' as const, holderId: 'gu-yue-chun' } }
        : moment,
    );
    const result = compileExperience({ ...moonScarExperience, moments });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.includes('Private POV hop fang-private → chun-speaks needs a public bridge'));
  });

  it('rejects actor scale drift outside the actor registry', () => {
    const result = compileExperience({
      ...moonScarExperience,
      tableaux: moonScarExperience.tableaux.map((tableau) => ({
        ...tableau,
        figures: tableau.figures.map((figure) => ({ ...figure, scale: 1.3 })),
      })),
    });
    assert.equal(result.ok, false);
  });

  it('rejects actor presentation above the VN portrait-scale ceiling', () => {
    const result = compileExperience({
      ...moonScarExperience,
      actors: moonScarExperience.actors.map((actor) => ({ ...actor, stageHeightPercent: 93 })),
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.some((error) => error.includes('stageHeightPercent')));
  });

  it('keeps spatial atmosphere inside its declared stage region', () => {
    assert.equal(compileExperience(spiderMemoryExperience).ok, true);
    const tableaux = spiderMemoryExperience.tableaux.map((tableau) => tableau.id === 'apartment-empty'
      ? { ...tableau, atmosphere: [{ kind: 'rain' as const, layer: 'back' as const, region: { left: 80, top: 10, width: 29, height: 64 }, intensity: 24, seed: 1616 }] }
      : tableau);
    const result = compileExperience({ ...spiderMemoryExperience, tableaux });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.some((error) => error.includes('Atmosphere region must remain inside the stage')));
  });

  it('binds each pivotal answer to a distinct actor rendition', () => {
    const spiderAnswer = spiderMemoryExperience.moments.find((moment) => moment.id === 'mj-answer')!;
    const spiderTableau = spiderMemoryExperience.tableaux.find((tableau) => tableau.id === spiderAnswer.tableauId)!;
    assert.equal(spiderTableau.figures.find((figure) => figure.actorId === 'mj')?.appearanceId, 'conflicted-boundary');
    const moonAnswer = moonScarExperience.moments.find((moment) => moment.id === 'chun-answers')!;
    const moonTableau = moonScarExperience.tableaux.find((tableau) => tableau.id === moonAnswer.tableauId)!;
    assert.equal(moonTableau.figures.find((figure) => figure.actorId === 'gu-yue-chun')?.appearanceId, 'restrained-disclosure');
  });

  it('detects authored pivotal beats and their exact appearance shifts', () => {
    const spiderBeats = detectPerformanceBeats(spiderMemoryExperience);
    assert.deepEqual(spiderBeats.find((beat) => beat.momentId === 'mj-sees')?.changesAppearanceFrom, ['guarded-listening']);
    assert.equal(spiderBeats.find((beat) => beat.momentId === 'ride-home')?.appearanceId, 'reluctant-trust');
    const moonBeats = detectPerformanceBeats(moonScarExperience);
    assert.equal(moonBeats.find((beat) => beat.momentId === 'chun-answers')?.appearanceId, 'restrained-disclosure');
    assert.equal(moonBeats.filter((beat) => beat.importance === 'pivotal').length, 3);
  });

  it('rejects a pivotal beat without an explicit rendition', () => {
    const moments = moonScarExperience.moments.map((moment) => moment.id === 'chun-speaks'
      ? { ...moment, performanceBeat: { actorId: 'gu-yue-chun', phase: 'decision' as const, importance: 'pivotal' as const } }
      : moment);
    const result = compileExperience({ ...moonScarExperience, moments });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.includes('Pivotal performance chun-speaks needs an explicit appearance for gu-yue-chun'));
  });

  it('treats a CG cut-in as an embodied cast and rejects duplicate sprite layering', () => {
    const reveal = moonScarExperience.tableaux.find((tableau) => tableau.id === 'moon-scar-reveal')!;
    assert.deepEqual(reveal.cutIn?.representedActorIds, ['fang-yuan', 'gu-yue-chun']);
    assert.equal(reveal.cutIn?.framing, 'location-match');
    assert.equal(compileExperience(moonScarExperience).ok, true);
    const tableaux = moonScarExperience.tableaux.map((tableau) => tableau.id === reveal.id
      ? { ...tableau, figures: [{ actorId: 'fang-yuan', appearanceId: 'field-neutral', slot: 'left' as const, facing: 'right' as const, emphasis: 'active' as const }] }
      : tableau);
    const result = compileExperience({ ...moonScarExperience, tableaux });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.some((error) => error.includes('do not double-layer figures or artifact')));
  });

  it('rejects unreachable moments', () => {
    const orphan = { ...moonScarExperience.moments[0]!, id: 'orphan', next: { type: 'end' as const } };
    const result = compileExperience({ ...moonScarExperience, moments: [...moonScarExperience.moments, orphan] });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.includes('Unreachable moment: orphan'));
  });

  it('rejects a dimmed speaker', () => {
    const tableaux = moonScarExperience.tableaux.map((tableau) =>
      tableau.id === 'cleft-fang-active'
        ? { ...tableau, figures: tableau.figures.map((figure) => figure.actorId === 'fang-yuan' ? { ...figure, emphasis: 'supporting' as const } : figure) }
        : tableau,
    );
    const result = compileExperience({ ...moonScarExperience, tableaux });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.includes('Speaker fang-yuan must be active in moment fang-private'));
  });

  it('accepts an optional voice rendition and rejects a cue used as voice', () => {
    const voiceAsset = {
      id: 'chun-voice-test',
      kind: 'voice' as const,
      sourcePath: 'voice/chun-test.wav',
      sha256: '0'.repeat(64),
    };
    const voiced = {
      ...moonScarExperience,
      assets: [...moonScarExperience.assets, voiceAsset],
      moments: moonScarExperience.moments.map((moment) => moment.id === 'chun-speaks'
        ? { ...moment, voiceAssetId: voiceAsset.id }
        : moment),
    };
    assert.equal(compileExperience(voiced).ok, true);

    const wrongBus = {
      ...moonScarExperience,
      moments: moonScarExperience.moments.map((moment) => moment.id === 'chun-speaks'
        ? { ...moment, voiceAssetId: 'cloth-shift' }
        : moment),
    };
    const result = compileExperience(wrongBus);
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.some((error) => error.includes('invalid voice cloth-shift')));
  });

  it('requires deterministic preparation for figures', () => {
    const assets = moonScarExperience.assets.map((asset) =>
      asset.id === 'fang-neutral' ? { ...asset, preparation: undefined } : asset,
    );
    const result = compileExperience({ ...moonScarExperience, assets });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.includes('Figure asset fang-neutral needs an explicit preparation recipe'));
  });

  it('rejects figure preparation on non-figure assets', () => {
    const preparation = moonScarExperience.assets.find((asset) => asset.id === 'fang-neutral')!.preparation!;
    const assets = moonScarExperience.assets.map((asset) =>
      asset.id === 'cleft-bg' ? { ...asset, preparation } : asset,
    );
    const result = compileExperience({ ...moonScarExperience, assets });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.includes('Only figure assets may declare a preparation recipe: cleft-bg'));
  });

  it('rejects a tableau appearance outside its actor identity', () => {
    const tableaux = moonScarExperience.tableaux.map((tableau) =>
      tableau.id === 'cleft-fang-active'
        ? { ...tableau, figures: tableau.figures.map((figure) => figure.actorId === 'fang-yuan' ? { ...figure, appearanceId: 'masked' } : figure) }
        : tableau,
    );
    const result = compileExperience({ ...moonScarExperience, tableaux });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.includes('Tableau cleft-fang-active references missing appearance fang-yuan/masked'));
  });
});
