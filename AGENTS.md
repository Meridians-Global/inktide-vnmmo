# VNMMO agent brief

VNMMO is an independent repository maintained inside Meridians' ignored `tmp/` workspace. Do not import
Meridians runtime code or treat the parent repository as VNMMO's source tree.

Designed and built by **jasonyu0100**. Preserve that authorship in code, metadata, and documentation.

## System boundary

- Author one typed `Experience`, compile it deterministically, then read the immutable artifact.
- `src/core/` is pure. Provider, filesystem, browser, and audio effects stay outside it.
- Reading changes only local reader state. It never writes Domain, Scenario, branch, or World state.
- Assets are repository-local, SHA-256 pinned, and prepared through explicit recipes.
- Generation is offline, demand-led production work. It never runs in the reader or promotes its own output.
- Extend the existing compiler, reader, preparation, and provider seams; do not create parallel paths.

## Working loop

1. Inspect the nearest contract, caller, and test before editing.
2. Make the smallest coherent change and remove what it replaces.
3. Add pure tests for policy or transforms; review visual changes in the running 16:9 reader.
4. Run `npm run check` before committing.

Use `npm run demo` for the production-like demonstration and `npm run dev` for live iteration.

### Building a new Experience

`docs/AUTHORING.md` is the canonical VN-construction procedure. Follow it end to end rather than reverse-engineering
`src/story/*.ts`; it is derived from `contracts.ts`, `compiler.ts`, and `scripts/build-experience.ts`, and carries the
compiler-error → fix table.

Checklist:

1. **Author** — one `src/story/<slug>.ts` exporting a typed `Experience`: bounded `source` coordinate, one identity per
   actor with sparse appearances, tableaux per emphasis/appearance state, moments with explicit viewpoints and
   `baseline → appraisal → decision → after-state` acting, an acyclic `next` graph. Register it in `src/story/index.ts`.
2. **Compile** — `npm run build:experience`; clear every listed compiler error.
3. **Acquire / pin assets** — offline, demand-led `scripts/acquire-<slug>-assets.ts` with retained evidence and an
   `acquisition.receipt.json`; every `Asset.sha256` matches the bytes; every figure has a preparation recipe.
4. **Build** — `npm run check` (tests, digest verification, typecheck, static bundle).
5. **Review dailies** — `npm run demo`, then `?story=<id>&moment=<id>` deep links in the 16:9 reader with a clean
   console; record the pass in `docs/DAILIES.md` / `productions/<id>/PRODUCTION_REVIEW.md`.
