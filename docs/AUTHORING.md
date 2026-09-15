# Authoring an Experience

This is the end-to-end procedure for building a new compiling `Experience` in this repository. It is
grounded in the code that enforces it: `src/core/contracts.ts` (the shape), `src/core/compiler.ts` (the
gate), `scripts/build-experience.ts` (verification and receipts), and the two worked examples
`src/story/moon-scar.ts` and `src/story/spider-memory.ts`. `docs/ARCHITECTURE.md` explains *why* these rules
exist; this document explains *how to satisfy them*. Designed and built by jasonyu0100.

The loop, in order:

```text
1 pick a bounded source scene      → Experience.source
2 model actors                     → Actor + sparse Appearance[]
3 acquire and pin assets           → Asset[] with sha256 (+ figure preparation)
4 compose tableaux                 → Tableau[]
5 sequence moments                 → Moment[] (mode · viewpoint · speaker · performanceBeat)
6 wire next, register the story    → goto / choice / end · src/story/index.ts
7 validate and review              → npm run check · npm run demo · ?story=&moment= dailies
```

Everything below is one file: `src/story/<slug>.ts` exporting a typed `Experience`. Keep it as plain data
(the examples use small `const` helpers for repeated recipes); the compiler parses it with Zod using `.strict()`
objects, so unknown keys are rejected.

## 1. Pick a bounded source scene

An Experience is a **presentation-only reconstruction** of one scene from an authorized source record. It never
writes Domain, Scenario, branch, or World state, and traversal choices change only the reading perspective.

Fill the envelope:

```ts
export const mySceneExperience: Experience = {
  schemaVersion: 2,
  id: 'my-scene-v1',                // catalog id; used by ?story=
  title: 'Title',
  subtitle: 'One-line framing',
  posture: 'catch-up',              // only legal value
  source: {
    domainId: 'N-IMP-…',            // the Domain the scene belongs to
    branchId: 'BRN-…',              // the branch being read
    asOfEntryId: 'SCN-…',           // the exact entry/scene/chapter coordinate
    sourceSha256: '<64 hex>',       // optional: digest of the source record you read
    note: 'Presentation-only reconstruction of … Traversal changes reading perspective, never Domain state.',
  },
  startNodeId: '…',
  assets: [], actors: [], tableaux: [], moments: [],
};
```

- `spider-memory` pins `sourceSha256` to the digest of the Domain JSON it read (the acquire script computes the
  same digest into `acquisition.receipt.json`). `moon-scar` uses human-readable coordinates without a digest.
  Prefer the digest whenever you read a concrete file: `sha256sum <source>`.
- Bound the scene tightly. Both examples are one chapter/scene, ten to twenty moments, two actors, one or two
  locations. That is the size at which every asset can be demanded by a specific moment.

## 2. Model actors

One actor = one stable identity. Appearance changes (wardrobe, mask, expression) never create a second actor.

```ts
{
  id: 'peter-parker', name: 'Peter Parker',
  identityVersion: 'peter-parker-v1',     // bump when the identity reference itself is regenerated
  defaultAppearanceId: 'civilian-guarded',
  stageHeightPercent: 88,                 // 45–92; one value per actor, shared by every appearance
  appearances: [
    { id: 'civilian-guarded', assetId: 'peter-civilian', stageName: 'Peter Parker', wardrobe: 'civilian-blue-overshirt', expression: 'guarded-fatigue',    concealment: 'civilian', projection: 'three-quarter', sourceFacing: 'left' },
    { id: 'spider-masked',    assetId: 'peter-masked',   stageName: 'Spider-Man',   wardrobe: 'damaged-spider-suit',     expression: 'guarded-injury',     concealment: 'masked',   projection: 'three-quarter', sourceFacing: 'left' },
    { id: 'spider-revealed',  assetId: 'peter-revealed', stageName: 'Peter Parker', wardrobe: 'damaged-spider-suit',     expression: 'vulnerable-honesty', concealment: 'revealed', projection: 'three-quarter', sourceFacing: 'left' },
  ],
}
```

Identity vs appearance:

| Lives on the **actor** (identity) | Lives on each **appearance** |
| --- | --- |
| `id`, `name`, `identityVersion` | `stageName` — what the dialogue rail shows (`Spider-Man` while masked, `Peter Parker` once revealed) |
| `stageHeightPercent` — base scale; the reader never resizes per tableau | `wardrobe`, `expression`, `concealment` (`civilian` / `masked` / `revealed`) |
| `defaultAppearanceId` — used when a figure omits `appearanceId` | `projection` (`full-body` / `three-quarter` / `portrait`) → one fixed reader scale/crop table |
| | `sourceFacing` (`left` / `right`) — which way the rendition's pixels face; the reader flips deterministically to the requested `facing` |
| | `assetId` — must be a `figure` asset |

Keep appearances **sparse**: only add one when a moment demands a visible change (the examples carry 1–3 per
actor). Every appearance must own an exact prepared asset; an appearance you cannot show is not an appearance.
Actors that share a scene should share one `stageHeightPercent` and one preparation canvas so provider padding
cannot alter relative height.

## 3. Acquire and pin assets

Every `Asset` is a repository-local file plus its SHA-256. `scripts/build-experience.ts` re-hashes each source
and aborts on `Asset digest drift`, so a hash is a promise about exact bytes.

```ts
{ id: 'mj-guarded', kind: 'figure', sourcePath: 'assets/generated/<production>/mj-guarded.png', sha256: '…', preparation: { …normalize, matteCleanup: { spill: 'green', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 } } }
```

Kinds and where they are referenced:

| `kind` | Referenced by | Notes |
| --- | --- | --- |
| `background` | `Tableau.backgroundAssetId` | 16:9 empty plate; no people, UI, or text |
| `figure` | `Appearance.assetId` | **must** carry a `preparation` recipe; isolated on transparent PNG |
| `artifact` | `Tableau.artifact.assetId`, `CutIn.representedArtifactId` | isolated object PNG |
| `cg` | `Tableau.cutIn.assetId` | full 16:9 event image |
| `ambience`, `music` | `Tableau.ambienceAssetId` / `musicAssetId` | loops; ambience carries across cut-ins |
| `cue` | `Moment.cueAssetIds` | one-shot foley |
| `voice` | `Moment.voiceAssetId` | optional; an Experience with none shows voice as unavailable |

### Sources

- Reusable stock lives in `assets/stage-kit/{locations,characters,props,audio/{ambience,music,foley}}`.
  Deterministic ambience can be synthesised with `npm run generate:stage-audio`.
- Production-specific generation lives in `assets/generated/<production-id>/` with retained evidence under
  `productions/<production-id>/evidence/`.

### Running an acquire script

Acquisition is offline, demand-led, and evidence-bearing. Copy `scripts/acquire-spider-assets.ts` (or the
Moon-Scar variant) to `scripts/acquire-<slug>-assets.ts`, add an `acquire:<slug>` npm script, and edit the
`requests` list. The pattern each script follows:

1. `loadLocalEnvironment` + `requireSetting('REPLICATE_API_TOKEN')` (and `MERIDIANS_ROOT` if you digest a
   Domain record). Copy `.env.example` to `.env`; never commit it.
2. For each request, `existingAsset`/`reuseExisting` short-circuits when the output file and a succeeded
   `<id>.generate.result.json` (and `<id>.matte.result.json` for isolated subjects) already exist — re-runs
   resume rather than pay again. `REBUILD_MATTE_ID=<id>` (or `REBUILD_MATTE=1` in Moon-Scar) forces a matte rebuild.
3. Backgrounds/CGs: one `bytedance/seedream-4.5` prediction at `16:9`, saved as `.jpg`.
4. Figures/artifacts: generate at `3:4` (figures) or `1:1` (objects) on a **flat chroma field** named in the
   prompt (`#00FF66` green or `#FF00FF` magenta), then run `851-labs/background-remover` for a segmentation
   matte, then `refineSegmentedChromaMatte(source, segmented, w, h, matteRgb)` locally. Chroma is a generation
   aid; the refined matte is the asset. Save as `.png`.
5. Reference-conditioned renditions pass earlier outputs (normalised through the same recipe and compacted by
   `compactReference`) as `image_input`, with the prompt stating which reference owns identity and which owns
   only style.
6. Every prediction writes `<evidence>.events.ndjson` + `<evidence>.result.json`; `replicateInputDigest` records
   the request digest. Rejected takes stay on disk and are listed under `reviews` with a reason.
7. Finish by writing `productions/<production-id>/evidence/acquisition.receipt.json` with `source`, `model`,
   `matteModel`, `requestDigests`, `assets` (each with `sourcePath`, `sha256`, `predictionIds`, URLs, and, in
   Moon-Scar, `matteInspection`), `reviews`, and any deterministic `preparedAssets` (e.g. the apartment stage
   crop records its source digest and extract rectangle).

`tests/production-evidence.test.ts` re-hashes every asset named in every `acquisition.receipt.json`, so add
your production id there once its receipt exists, and keep receipts and bytes in lockstep.

Small local repairs that do not justify regeneration (e.g. iris colour) go through `npm run prepare:eyes`
(`scripts/prepare-eye-corrections.ts`): a bounded recipe with exact source/output hashes written to
`eye-correction.receipt.json`. Lost provider outputs can be re-downloaded with
`npm run recover:replicate -- <prediction-id> <evidence-name> <target>`.

### Figure preparation recipe

Every `figure` asset needs a `preparation` (compiler: `Figure asset X needs an explicit preparation recipe`;
non-figures may not have one). The build applies it and records both the source and output digests in
`public/generated/<experience>/receipt.json`.

```ts
const normalize = {
  kind: 'figure-normalize' as const, recipeVersion: 1 as const,
  canvas: { width: 896, height: 1024 },      // fixed transparent canvas
  subjectBox: { width: 850, height: 960 },   // alpha envelope is scaled into this box without distortion
  bottomPadding: 24,                          // feet ground here, so scale is padding-invariant
};
// optional, applied before normalisation for residual chroma spill:
matteCleanup: { spill: 'green' | 'blue' | 'magenta', alphaFloor: 8, edgeAlphaCeiling: 249, channelMargin: 18 }
```

Use one recipe per production for every actor in the scene. Add `matteCleanup` only when the acquisition
receipt's matte inspection shows residual screen-colour boundary pixels.

### Recording lineage

After files land, fill `sha256` with `sha256sum assets/generated/<production>/<file>` (or copy from the
acquisition receipt). Version file names (`-v2`, `-eye-fixed-v1`) rather than overwriting, so a hash never
silently points at different bytes.

## 4. Compose tableaux

A tableau is a complete, stable composition. Moments reference it; they do not patch it. Make a new tableau
for every distinct emphasis/appearance state you need (the examples have one per "who is active and in what
appearance").

```ts
{ id: 'revealed-mj-active', location: 'MJ’s Apartment · Rain', backgroundAssetId: 'mj-apartment', ambienceAssetId: 'rain-window',
  shot: 'conversation', tone: 'intimate', atmosphere: [rainAtWindow], figures: [
    { actorId: 'mj',           appearanceId: 'conflicted-boundary', slot: 'left',  facing: 'right', emphasis: 'active' },
    { actorId: 'peter-parker', appearanceId: 'spider-revealed',     slot: 'right', facing: 'left',  emphasis: 'supporting' },
  ] }
```

- **Five semantic slots**: `far-left · left · center · right · far-right`. One figure per slot (duplicate slot
  is a compiler error), at most five figures. A two-shot uses `left`/`right`; an artifact study pushes figures to
  `far-left`/`far-right` and gives the object `center`.
- **Emphasis**: `active` (full, speaking), `supporting` (present, dimmed), `recessed` (background). The
  speaker of any moment using this tableau must be `active` — so an exchange between two actors needs two
  tableaux, one per active speaker.
- **Facing**: `left` / `right` / `inward`; resolved against the appearance's `sourceFacing`, never guessed.
- **`appearanceId`** is optional (defaults to `defaultAppearanceId`) but **required** on the figure that carries a
  `pivotal` performance beat.
- **Artifact**: `{ assetId, slot, footprint: 'study' | 'large' }` — one isolated object in one slot, typically
  `center`; pair with `shot: 'artifact'`.
- **Audio**: `ambienceAssetId` / `musicAssetId` are per tableau; keep them identical across a location so the
  bed does not restart between moments.
- **Atmosphere** (≤3): `{ kind: 'rain' | 'snow' | 'dust', layer: 'back' | 'front', region: { left, top, width, height } (percent, inside the stage), intensity: 4–36, seed }`. Define once per location and reuse.

### CG cut-ins

A cut-in replaces the sprite stage with one authored image. It **must** have `figures: []` and no `artifact`
(`A CG cut-in embodies its declared cast and artifact; do not double-layer figures or artifact`). Instead it
declares what the frame already contains:

```ts
cutIn: { assetId: 'moon-scar-cg', framing: 'location-match', representedActorIds: ['fang-yuan', 'gu-yue-chun'], representedArtifactId: 'moon-scar-gu' }
```

| `framing` | Use when | Example |
| --- | --- | --- |
| `location-match` | the established plate stays; a graded artifact/event push on top | `moon-scar-reveal` |
| `relationship-close` | a full-frame two-shot whose eyelines carry an irreversible beat | `unmask-cg` |
| `memory-full-frame` | an acknowledged break from physical continuity (memory, vision) | — no example yet |

`representedActorIds` (1–5) lets a speaker or performance actor be "staged" in the cut-in without a figure.
Keep `backgroundAssetId` and `ambienceAssetId` set to the surrounding location so the audio bed carries across.

## 5. Sequence moments

```ts
{ id: 'unmask', chapter: 'Scene 16 · The Memory Between Us', tableauId: 'unmask-cg', viewpoint: { kind: 'public' },
  mode: 'action', label: 'Revelation', text: 'He removed the mask. …', cueAssetIds: ['cloth-shift'],
  performanceBeat: { actorId: 'peter-parker', phase: 'decision', importance: 'pivotal' },
  next: { type: 'goto', nodeId: 'name' } }
```

**Modes** and their rules:

| `mode` | `speakerId` | `viewpoint` | Typical use |
| --- | --- | --- | --- |
| `location` | none | public | establishing plate, empty tableau, `label: 'Night'` |
| `narration` | none | any | narrator line, choice prompt host |
| `action` | none | any | stage business; often carries a `cueAssetIds` foley |
| `dialogue` | **required** | any | spoken line; rail shows the appearance's `stageName` |
| `thought` | **required** | **must be `{ kind: 'private', holderId: speakerId }`** | interior line |
| `artifact` | none | any | object study; tableau usually `shot: 'artifact'` |
| `ending` | optional | any | final beat; pair with `next: { type: 'end' }` |

**Viewpoints**: `{ kind: 'public' }` or `{ kind: 'private', holderId }`. The reader labels private moments
`<NAME> · PRIVATE`. Rule: **a private moment may not link directly to a private moment held by someone else** —
insert a public beat (`Private POV hop A → B needs a public bridge`). Same-holder private runs are fine.

**Speaker staging**: whenever `speakerId` is set, that actor must be in the tableau's `figures` **or** in its
`cutIn.representedActorIds`; if present as a figure, its `emphasis` must be `active`.

**Pivotal acting** is authored as a four-phase arc on one actor, each phase a moment whose tableau makes the
change visible:

```text
baseline  → the actor's default/guarded appearance, before the turn
appraisal → the actor registers the change (often a private thought)          e.g. mj-sees
decision  → the irreversible act; tableau uses the NEW explicit appearance     e.g. unmask, mj-answer, chun-answers
after-state → what remains; a third appearance or the same, held               e.g. ride-home, moon-scar
```

`performanceBeat: { actorId, phase, importance: 'supporting' | 'pivotal' }`. The actor must be staged
(figure or cut-in), and a **pivotal** beat on a figure requires an explicit `appearanceId` on that figure — an
unchanged default pose cannot pass as acting. `src/core/performance-beats.ts` detects these transitions from the
exact bindings for review; it never reads the prose.

Keep `chapter` identical across a scene (it is the header). `label` is a short display tag; without it the
rail shows the mode. `cueAssetIds` must be `cue` assets; `voiceAssetId` must be a `voice` asset.

## 6. Wire `next`, keep the graph honest, register

```ts
next: { type: 'goto', nodeId: 'distance' }
next: { type: 'end' }
next: { type: 'choice', posture: 'traversal', prompt: 'Whose accepted perspective do you read?', options: [
  { id: 'read-peter', label: 'Peter · the cost of restraint', consequence: 'Read the truth he chooses not to use as leverage.', nodeId: 'peter-restraint' },
  { id: 'read-mj',    label: 'MJ · the boundary of memory',   consequence: 'Read the life she refuses to counterfeit.',      nodeId: 'mj-boundary-private' },
] }
```

- Choices have 2–4 options and are `traversal` only: they choose *which accepted passage is read*, and both
  branches rejoin (`shared-silence`, `chun-answers`). They do not write canon.
- Every moment must be reachable from `startNodeId`; the graph must be acyclic (no "loop back" moments —
  Back is a reader-transport feature, not a story edge). Order the `moments` array in reading order; the reader's
  ordinal counter uses array position.
- The private→private bridge rule applies to every edge, including each choice option.
- Register in `src/story/index.ts`: `export const experiences = [spiderMemoryExperience, moonScarExperience, myScene];`.
  The first entry is the catalog default.

## 7. Validate and review

```bash
npm run test               # pure tests: compiler policy, matte, normalization, reader state, production evidence
npm run build:experience   # compile every registered Experience, verify every sha256, prepare figures,
                           # write public/generated/<id>/{experience.json,receipt.json} + catalog.json
npm run check              # test + build:experience + typecheck + vite build — run before every commit
npm run demo               # full check-equivalent build, then serve the exact bundle at http://127.0.0.1:4190
npm run dev                # live iteration only; not the review surface
```

Compiler errors surface from `build:experience` as `Experience <id> failed compilation:` followed by one line per
error. Fix them all; the compiler reports the whole list, not just the first.

Dailies in the 16:9 reader:

- `http://127.0.0.1:4190/?story=<experience-id>` opens a specific Experience; `&moment=<moment-id>` deep-links an
  exact frame. The reader reconstructs the deterministic start→moment path (including the choices it took), so
  Back and the backlog (Tab) work from a deep link.
- Review every tableau at least once, each appearance cut (`baseline → decision`), each cut-in in and out (ambience
  should not restart), the choice screen, and the ending. Enable sound in SETTINGS to check cues.
- Watch the browser console: it must stay clean.
- Record what you saw in `docs/DAILIES.md` (strongest moment · repaired · honest capability reading · largest
  remaining limit · single next repair) and, for a production, `productions/<id>/PRODUCTION_REVIEW.md`. Dailies
  are agent review, not audience approval; nothing is promoted beyond candidate by a dailies pass.

## Common compiler errors → fix

Messages are verbatim from `src/core/compiler.ts`. Zod schema failures appear first as `<path>: <message>`.

| Error | Fix |
| --- | --- |
| `<path>: Invalid input` / `Unrecognized key` / enum errors | The shape violates `contracts.ts`: wrong enum value, missing required field, unknown key (objects are `.strict()`), `sha256` not 64 lowercase hex, `stageHeightPercent` outside 45–92, `choice.options` not 2–4, `figures` > 5. |
| `Atmosphere region must remain inside the stage` | `left + width ≤ 100` and `top + height ≤ 100`. |
| `A CG cut-in embodies its declared cast and artifact; do not double-layer figures or artifact` | A tableau with `cutIn` needs `figures: []` and no `artifact`; list them in `representedActorIds` / `representedArtifactId`. |
| `Figure asset X needs an explicit preparation recipe` | Add `preparation: normalize` to every `kind: 'figure'` asset. |
| `Only figure assets may declare a preparation recipe: X` | Remove `preparation` from non-figure assets. |
| `Duplicate asset/actor/tableau/moment id: X` | Ids are unique per collection. |
| `Missing start moment: X` | `startNodeId` must name an existing moment. |
| `Duplicate appearance id on ACTOR: X` | Appearance ids unique within one actor. |
| `Actor X references missing default appearance Y` | `defaultAppearanceId` must be one of the actor's `appearances[].id`. |
| `Appearance A/B references missing asset X` / `must reference a figure asset` | Appearance `assetId` must be an existing `kind: 'figure'` asset. |
| `Tableau X needs a background asset` | `backgroundAssetId` must be an existing `kind: 'background'` asset. |
| `Tableau X references missing audio Y` | `ambienceAssetId` / `musicAssetId` must exist in `assets`. |
| `Tableau X places multiple figures in SLOT` | One figure per slot; use another of the five slots or another tableau. |
| `Tableau X references missing actor Y` / `missing appearance Y/Z` | Figure `actorId` and optional `appearanceId` must exist. |
| `Tableau X needs an artifact asset` | `artifact.assetId` must be an existing `kind: 'artifact'` asset. |
| `Tableau X needs a CG cut-in asset` | `cutIn.assetId` must be an existing `kind: 'cg'` asset. |
| `Tableau X CG represents missing actor Y` / `missing artifact Y` | `representedActorIds` must be actor ids; `representedArtifactId` an `artifact` asset. |
| `Moment X references missing tableau Y` | `tableauId` must exist. |
| `Moment X references invalid cue Y` / `invalid voice Y` | `cueAssetIds` → `kind: 'cue'`; `voiceAssetId` → `kind: 'voice'`. |
| `Dialogue moment X needs a speaker` | Set `speakerId` or change `mode`. |
| `Thought moment X needs a speaker` | Set `speakerId`. |
| `Thought moment X must be private to its speaker` | `viewpoint: { kind: 'private', holderId: <speakerId> }`. |
| `Speaker X is not staged in moment Y` | Add the actor to the tableau's `figures` or to `cutIn.representedActorIds`. |
| `Speaker X must be active in moment Y` | Set that figure's `emphasis: 'active'` — usually means a new tableau for this speaker. |
| `Performance actor X is not staged in moment Y` | `performanceBeat.actorId` must be a figure or represented in the cut-in. |
| `Pivotal performance X needs an explicit appearance for Y` | Give that figure an `appearanceId`; a pivotal beat cannot ride the default. |
| `Moment X links to missing moment Y` | Every `goto.nodeId` / option `nodeId` must exist. |
| `Private POV hop X → Y needs a public bridge` | Insert a public moment between two private moments with different holders. |
| `Unreachable moment: X` | Link to it from the start graph or delete it. |
| `Experience graph must be acyclic` | Remove the back-edge; the reader owns Back. |

Build-time (not compiler) failures from `scripts/build-experience.ts`:

| Error | Fix |
| --- | --- |
| `Asset digest drift: X` | The file at `sourcePath` no longer matches `sha256`. Re-hash, or restore the pinned bytes; never edit an asset in place — version the file name. |
| `ENOENT … <sourcePath>` | Path is relative to the repo root (or `VN_ASSET_ROOT`); check spelling and that the acquire script actually wrote it. |

## Open questions

Gaps or ambiguities noticed while writing this guide. They are recorded here rather than changed in code.

1. `Tableau.ambienceAssetId` / `musicAssetId` are checked for existence only, not for `kind` (`ambience` /
   `music`); a `cue` or `background` id there compiles. Cues and voice *are* kind-checked.
2. A speaker staged only through `cutIn.representedActorIds` bypasses the `active` emphasis rule, and the rail
   resolves its `stageName` from the actor's default appearance (no figure placement exists). During `unmask`
   this is invisible because the moment has no speaker; a dialogue line over a cut-in would show the default
   stage name even if the CG depicts another appearance.
3. A `pivotal` performance beat on an actor represented only in a cut-in is exempt from the explicit-appearance
   requirement (`unmask` relies on this). Whether the cut-in asset itself should carry an appearance reference is
   undecided.
4. `artifact.slot` is not checked against figure slots; an artifact and a figure may share `center`.
5. `mode: 'ending'` does not require `next: { type: 'end' }`, and `end` does not require `mode: 'ending'`.
6. `identityVersion` uniqueness across actors is not enforced; `sourceSha256` on `Experience.source` is
   optional and is not verified against any file at build time.
7. `Figure.facing: 'inward'` is resolved by the reader from slot position (`src/player/main.ts`
   `facingTransform`): slots left of centre face right, everything else — including `center` — faces left. The
   contract does not state this, so a `center` figure marked `inward` has an implicit rather than authored facing.
8. The acquire scripts are per-production copies rather than one parameterised tool; a new production must
   fork one and update `tests/production-evidence.test.ts`'s hard-coded production list by hand.
