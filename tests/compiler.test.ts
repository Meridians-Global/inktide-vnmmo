import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compileExperience } from '../src/core/compiler';
import { moonScarExperience } from '../src/story/moon-scar';

describe('compileExperience', () => {
  it('compiles the prepared catch-up reading', () => {
    const result = compileExperience(moonScarExperience);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.experience.moments.length, 14);
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
});
