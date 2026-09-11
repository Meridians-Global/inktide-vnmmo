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
