<img width="3024" height="1296" alt="Meridians Readme Banner" src="https://github.com/user-attachments/assets/a8216b78-7e15-45cc-b42d-2b5ff1ff35ce" />

# Inktide VNMMO

Designed and built by [jasonyu0100](https://github.com/jasonyu0100).

The Inktide VNMMO begins in black and white. Its seeded universe starts as a manga.

This independent repository owns a TypeScript system library for reader-paced visual-novel Experiences. It
keeps one authoring contract, one pure compiler, one pure reader state machine, and one static web reader.
It currently lives under Meridians' `tmp/` workspace for rapid experimentation, but it has its own Git
history and remote. It is a presentation system: it does not write Meridians Domain or Scenario state.

## Demo

```bash
npm install
npm run demo
```

Open `http://127.0.0.1:4190`. The catalog opens the Spider-Man rehearsal by default; use
`?story=moon-scar-reading-v1` for the earlier proof. Add `&moment=<moment-id>` to deep-link exact dailies.
If a URL requests a reader-memory-gated coordinate without its prerequisite readings, the player returns to
the authored beginning instead of fabricating knowledge or leaving a blank stage.
Click or press Space/Enter/↓ to advance, ↑ to step back, and Tab for the backlog. Sound starts disabled
because browsers require a reader gesture; open SETTINGS to enable physical sound. Voice-over is a separate,
optional rendition lane and always begins off. An Experience without exact voice assets says so rather than
offering a false control. `npm run demo` verifies the source assets, compiles every Experience, type-checks
the system, builds the static reader, and serves that exact production bundle. Use `npm run dev` only for
live iteration.

Some texture choices reveal private perspective rather than changing the world. The reader keeps semantic local
insights separately from page history and the active route: Back can expose a later synthesis after both relevant
perspectives have been understood, while Restart clears that memory.
Unavailable synthesis options remain absent, and exact review links cannot invent prerequisite knowledge.
Prepared public reading variants can also echo the active choice after routes reconverge. Back abandons that active
route without erasing what the reader has seen, keeping delayed callbacks distinct from cumulative reader knowledge.
Persistent insight callbacks are a second, quieter device: an early observational detour can change the wording of a
later public beat even after its active route is gone. Multiple compatible clues require an explicit combined reading,
so authored synthesis wins over array order.
Those callbacks bind exact actor renditions when the observation has a physical payoff: MJ's released grip appears on
the return beat itself, while Chun's held-warning posture is introduced before and reused after the pivotal CG.
Order-sensitive synthesis is a third reader-only device. When two private readings are both known, the combined
passage can remember which one arrived first; the compiler requires both orderings, preventing an author from
accidentally turning traversal order into an unacknowledged preferred route.
The same prepared variant may select a closer tableau, but only as editorial emphasis: the compiler requires the
location, background, sound bed, artifact, cast, exact actor assets, wardrobe, expression, concealment, and facing to
remain unchanged. This lets an appraisal become visually larger-than-life without disguising a new scene as memory.
Texture choices can also ask the reader to predict conduct. Both predictions reconverge on one authored event, then
the prepared payoff says whether the reader's model was confirmed or corrected. Choice purpose (`observe`,
`interpret`, `predict`, or `decide`) controls its editorial framing independently of branch weight.
The reader stage is a fixed camera aperture (`overflow: clip`), so keyboard or button focus cannot scroll the
context, actors, dialogue, or controls out of their authored 16:9 coordinates.
Generated stills can opt into bounded matte cleanup during fixed-canvas normalization: chroma despill, a
low-chroma light-fringe rule, and an explicit bounded alpha-erosion count. These are preparation metadata, not
global CSS disguises; the production receipt must still retain any visible residual contour as a candidate defect.

`npm run produce` is the repeatable author-to-dailies handoff: it runs pure tests, rebuilds the
digest-pinned Experiences, type-checks, creates the static Vite bundle, and prints one portfolio status.
The build also writes `public/generated/production-report.json`, binding each Experience, audit and receipt
digest to a deterministic next repair. `targets-met` means only that declared mechanical targets are met;
human dailies still own artistic approval. `npm run produce:strict` exits non-zero while any high-priority
repair remains. Builds use the repository's exact `assets/` sources by default, so reading and validation
require no API key or Meridians checkout. Prepared output under `public/generated/` is ignored and
reproducibly rebuilt.

`npm run audit:experiences` is the fast production-planning loop. It compiles the same typed Experiences, derives
each choice's branch starts, nearest reconvergence, private holders and exact later payoffs, then reports declared
story, set and performance gaps. It also walks every valid route and checks the shortest conservative reading time
against an explicit per-Experience target; mutually exclusive branch prose cannot inflate the result. Every full build writes that same read-only projection to
`public/generated/<experience-id>/production-audit.json` and pins its digest in the existing build receipt. The
audit never writes story content, promotes art, or invents a consequence; it turns the current authored graph into
machine-readable work orders so later writing and generation can request only reachable gaps.

Offline Replicate acquisition is optional. Copy `.env.example` to `.env`, set `REPLICATE_API_TOKEN`, and
point `MERIDIANS_ROOT` at a local Meridians checkout only when a production needs its authorized source
record. Provider jobs write candidates and retained evidence; they never run inside the reader.

`npm run acquire:moon-scar` reproduces the current Moon-Scar acquisition from retained predictions when
available. It imports exact legacy SFX lineage, generates only demanded coordinates, and prepares isolated
assets through the shared chroma/segmentation matte. Prefer `REBUILD_MATTE_ID=<asset-id>` for a narrow repair;
`REBUILD_MATTE=1` deliberately rebuilds every isolated matte. `npm run prepare:eyes` reproduces older bounded,
hash-pinned iris corrections; new character nuance and anatomy repairs use a canonical reference plus a narrowly
typed visual edit, then pass identity, full-body framing, facing, scale and contextual-tableau review.

## Start here

- `src/core/contracts.ts` — the only authoring/runtime shape.
- `src/core/compiler.ts` — deterministic structural gate.
- `src/core/figure-normalization.ts` — padding-invariant actor preparation.
- `src/core/chroma-matte.ts` — deterministic chroma garbage matte and boundary repair.
- `src/core/reader-state.ts` — deterministic reader transport.
- `src/core/performance-beats.ts` — explicit pivotal acting detection and appearance-transition evidence.
- `src/core/production-audit.ts` — deterministic choice, inventory, acting-gap, and expansion-demand projection.
- `src/story/spider-memory.ts` — dual-identity and viewpoint rehearsal.
- `src/story/moon-scar.ts` — an earlier representative Experience on the same contract.
- `src/story/production-targets.ts` — explicit per-Experience expansion targets; never hidden generator policy.
- `scripts/acquire-spider-assets.ts` — resumable, evidence-bearing Replicate acquisition and preparation.
- `scripts/acquire-moon-scar-assets.ts` — demand-led Moon-Scar acquisition and legacy SFX transfer.
- `productions/moon-scar-ledger-v2/PRODUCTION_REVIEW.md` — exact dailies and remaining audience limit.
- `docs/ARCHITECTURE.md` — decisions and non-goals.
