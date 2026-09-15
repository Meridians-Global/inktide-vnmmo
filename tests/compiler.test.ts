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
    if (result.ok) assert.equal(result.experience.moments.length, 40);
    const spider = compileExperience(spiderMemoryExperience);
    assert.equal(spider.ok, true);
    if (spider.ok) assert.equal(spider.experience.moments.length, 39);
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

  it('uses traversal choices to reveal private perspective before an honest public reconvergence', () => {
    const cases = [
      {
        experience: spiderMemoryExperience,
        choiceId: 'name-reading-choice',
        privateIds: ['peter-name-private', 'mj-name-private'],
        bottleneckId: 'name-settles',
      },
      {
        experience: moonScarExperience,
        choiceId: 'question-choice',
        privateIds: ['rank-chun-private', 'loss-chun-private'],
        bottleneckId: 'chun-answers',
      },
    ];

    for (const fixture of cases) {
      const choice = fixture.experience.moments.find((moment) => moment.id === fixture.choiceId)!;
      assert.equal(choice.next.type, 'choice');
      if (choice.next.type !== 'choice') continue;
      assert.deepEqual(choice.next.options.map((option) => option.nodeId), fixture.privateIds.map((id) => {
        if (id === 'rank-chun-private') return 'rank-question';
        if (id === 'loss-chun-private') return 'loss-question';
        return id;
      }));
      for (const privateId of fixture.privateIds) {
        const privateMoment = fixture.experience.moments.find((moment) => moment.id === privateId)!;
        assert.equal(privateMoment.viewpoint.kind, 'private');
        assert.equal(privateMoment.next.type === 'goto' && privateMoment.next.nodeId, fixture.bottleneckId);
      }
    }
  });

  it('rejects undeclared and unharvested reader insights', () => {
    const malformedMoments = spiderMemoryExperience.moments.map((moment) => moment.id === 'perspective-choice' && moment.next.type === 'choice'
      ? {
        ...moment,
        next: {
          ...moment.next,
          options: moment.next.options.map((option) => option.id === 'hold-both'
            ? { ...option, requiresInsightIds: ['missing-insight'] }
            : option),
        },
      }
      : moment);
    const result = compileExperience({ ...spiderMemoryExperience, moments: malformedMoments });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.includes('Choice perspective-choice/hold-both requires undeclared reader insight missing-insight'));
      assert.ok(result.errors.includes('Choice perspective-choice/hold-both requires reader insight missing-insight that cannot be learned before the gate'));
      assert.ok(result.errors.includes('Reading variant both-truths-reading orders reader insight peter-restraint-understood that cannot be learned before it'));
      assert.ok(result.errors.includes('Reading variant both-truths-reading orders reader insight mj-memory-boundary-understood that cannot be learned before it'));
    }
  });

  it('rejects declared reader insights without both a learning and harvest coordinate', () => {
    const result = compileExperience({
      ...spiderMemoryExperience,
      readerInsights: [...spiderMemoryExperience.readerInsights, { id: 'decorative-insight', meaning: 'Nothing downstream reads it.' }],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.includes('Reader insight decorative-insight is never learned'));
      assert.ok(result.errors.includes('Reader insight decorative-insight is never harvested'));
    }
  });

  it('keeps delayed reading variants public, choice-bound, and downstream', () => {
    assert.equal(compileExperience(moonScarExperience).ok, true);
    const privateVariants = moonScarExperience.moments.map((moment) => moment.id === 'fang-private'
      ? {
        ...moment,
        readingVariants: [{ when: { kind: 'active-choice' as const, choiceNodeId: 'question-choice', optionId: 'ask-rank' }, text: 'Leaked reader knowledge.' }],
      }
      : moment);
    const result = compileExperience({ ...moonScarExperience, moments: privateVariants });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.includes('Reading variants on fang-private require a public viewpoint'));
      assert.ok(result.errors.includes('Reading variant fang-private/question-choice/ask-rank must be downstream of its chosen route'));
    }

    const missingOption = moonScarExperience.moments.map((moment) => moment.id === 'chun-answers'
      ? {
        ...moment,
        readingVariants: [{ when: { kind: 'active-choice' as const, choiceNodeId: 'question-choice', optionId: 'not-an-option' }, text: 'Impossible variant.' }],
      }
      : moment);
    const missing = compileExperience({ ...moonScarExperience, moments: missingOption });
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.ok(missing.errors.includes('Reading variant chun-answers/question-choice/not-an-option references a missing choice option'));
  });

  it('rejects ambiguous persistent-insight callbacks without a combined reading', () => {
    const moments = spiderMemoryExperience.moments.map((moment) => moment.id === 'small-defence-returns'
      ? { ...moment, readingVariants: moment.readingVariants?.slice(0, 2) }
      : moment);
    const result = compileExperience({ ...spiderMemoryExperience, moments });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.includes('Reader-insight variants on small-defence-returns are ambiguous without a combined variant for mj-grip-noticed, threshold-distance-noticed'));
    }
  });

  it('requires both traversal orders for an order-sensitive synthesis', () => {
    const moments = spiderMemoryExperience.moments.map((moment) => moment.id === 'both-truths-reading'
      ? { ...moment, readingVariants: moment.readingVariants?.slice(0, 1) }
      : moment);
    const result = compileExperience({ ...spiderMemoryExperience, moments });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.includes('Reader-insight-order variants on both-truths-reading need both traversal orders for mj-memory-boundary-understood+peter-restraint-understood'));
    }
  });

  it('allows a reading to change camera emphasis without changing the material scene', () => {
    assert.equal(compileExperience(spiderMemoryExperience).ok, true);
    const synthesis = spiderMemoryExperience.moments.find((moment) => moment.id === 'both-truths-reading')!;
    assert.deepEqual(synthesis.readingVariants?.map((variant) => variant.tableauId), [
      'revealed-peter-appraisal',
      'revealed-mj-appraisal',
    ]);

    const tableaux = spiderMemoryExperience.tableaux.map((tableau) => tableau.id === 'revealed-peter-appraisal'
      ? { ...tableau, location: 'A different room' }
      : tableau);
    const result = compileExperience({ ...spiderMemoryExperience, tableaux });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.includes('Reading variant both-truths-reading/revealed-peter-appraisal changes material scene continuity'));
    }
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

  it('frames pivotal CGs by dramatic purpose rather than the default sprite tableau', () => {
    const relic = moonScarExperience.tableaux.find((tableau) => tableau.id === 'moon-scar-reveal')!;
    const unmask = spiderMemoryExperience.tableaux.find((tableau) => tableau.id === 'unmask-cg')!;
    assert.equal(relic.cutIn?.framing, 'location-match');
    assert.equal(unmask.cutIn?.framing, 'relationship-close');
    assert.deepEqual(unmask.cutIn?.representedActorIds, ['mj', 'peter-parker']);
    assert.equal(spiderMemoryExperience.moments.find((moment) => moment.id === 'unmask')?.tableauId, 'unmask-cg');
  });

  it('returns from each pivotal CG to a changed physical tableau', () => {
    const moonScar = moonScarExperience.moments.find((moment) => moment.id === 'moon-scar')!;
    const moonReturn = moonScarExperience.moments.find((moment) => moment.id === 'chun-hesitates')!;
    const spiderUnmask = spiderMemoryExperience.moments.find((moment) => moment.id === 'unmask')!;
    const spiderReturn = spiderMemoryExperience.moments.find((moment) => moment.id === 'name')!;
    assert.equal(moonScar.next.type === 'goto' && moonScar.next.nodeId, 'chun-hesitates');
    assert.equal(moonReturn.tableauId, 'moon-scar-aftermath');
    assert.equal(spiderUnmask.next.type === 'goto' && spiderUnmask.next.nodeId, 'name');
    assert.equal(spiderReturn.tableauId, 'revealed-peter-active');
    assert.notEqual(moonScar.tableauId, moonReturn.tableauId);
    assert.notEqual(spiderUnmask.tableauId, spiderReturn.tableauId);
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
