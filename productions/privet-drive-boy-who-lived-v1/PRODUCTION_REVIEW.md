# Privet Drive — The Boy Who Lived v1 — production review

Status: **candidate rehearsal**. Third Experience, built end to end from `docs/AUTHORING.md` as a test of the
workflow, the manifest-driven acquisition kit, and reference-conditioned CG. Assets are candidates, not an
approved style family.

## Source

Bounded adaptation of chapter 1 of the supplied condensed retelling (`sourceSha256` in `src/story/boy-who-lived.ts`):
Vernon's strange Tuesday → the cat → cloaks and the Potter name → Dumbledore, McGonagall and the Put-Outer →
Hagrid → the doorstep. The `domainId` / `branchId` / `asOfEntryId` are an adaptation coordinate for that
artifact, not a verified Meridians coordinate. Authorization of the underlying material is an author decision.

## Audience claim

An introduction the reader can finish in one sitting (34 moments, four choice purposes) that lets them **choose
what Vernon lets himself see** (observe / interpret), **guess why the curse failed** (predict) and **decide what
Dumbledore leaves the Dursleys** (decide), with each decision surfacing later as a changed reading rather than a
changed world.

## Reusable work proved

- One manifest (`scripts/acquire-boy-who-lived-assets.ts`) drives all fourteen visual assets through
  `scripts/lib/acquisition-kit.ts`; the script contains prompts and identities only.
- Identity chains run on **local pinned bytes**: `dumbledore-grave-v1` ← `dumbledore-arrival-v1`,
  `mcgonagall-grief-v1` ← `mcgonagall-stern-v1`, `hagrid-weeping-v1` ← `hagrid-bundle-v1`, and the
  `doorstep-cg-v1` cut-in ← the three approved arrival sprites. The CG therefore reads as the same cast.
- Cache reuse is digest-gated (prompt + aspect ratio), so tightening a prompt regenerates only that id
  (`REBUILD_IDS=hagrid-weeping-v1` after the first take was barefoot and glossy).
- Deterministic ambience/cues (`scripts/generate-privet-audio.ts`) pinned like provider assets.
- Pivotal acting is carried by existing renditions selected by function: Dumbledore `arrival → grave` at the
  confirmation, McGonagall `stern → grief` when she breaks, Hagrid `bundle → weeping` after the doorstep.

## Dailies

Captured by `npm run dailies` (42 frames, 10 variant readings, 0 console errors). Strongest moment:
`doorstep` — the location-matched CG concentrates all three identities over the same night plate, and the
lightning-scar text lands before McGonagall's question. `cat-becomes-woman` is the cleanest two-shot; the cat
artifact → McGonagall sprite swap sells the Animagus beat without a CG.

Most visible remaining failures:

- `doorstep-cg-v1` foregrounds the trio; the bundle on the step reads only from the text. A relationship-close
  take centred on the blankets and scar is the obvious candidate second CG.
- `hagrid-weeping-v1` renders slightly glossier than the two matte-flat sprites beside it.
- Morning plate is a wide street; Vernon's `far-left` position leaves the cat artifact slightly small on phones.

Single next repair: a `relationship-close` CG for `doorstep` (bundle + scar, referenced from the current
CG for palette/lighting), reviewed against the existing frame in `DIFF.html`. Do not broaden into an expression sheet.

## Compiler lessons crystallised

Three rules surfaced while wiring choices and were added to the error table in `docs/AUTHORING.md`:
reading variants require a public viewpoint (split private thoughts per option instead), every granted insight
must be harvested, and multi-insight variants on one moment need a combined variant for every reachable union.
