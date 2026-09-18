# Narrative → VN porting: what is automated, what stays manual

Findings from building the third Experience (`privet-drive-boy-who-lived-v1`) from a supplied prose source with
`docs/AUTHORING.md` as the only procedure. The question was: which parts of porting a narrative into a compiling
`Experience` are mechanical enough to automate without taking creative authority away from the author?

## Where the time went

| Stage | Share | Nature |
| --- | --- | --- |
| Reading the source, choosing the bounded scene, deciding what the reader *does* (four choice purposes) | ~15% | Judgment |
| Prose: condensing, viewpoint, reading variants, choice labels/consequences | ~30% | Judgment |
| Prompt vocabulary + identity descriptions for four actors, three plates, three artifacts, one CG | ~15% | Judgment, reusable |
| Provider plumbing, retries, reference wiring, mattes, receipts, hashes | ~10% → ~2% | Mechanical — now in the kit |
| Wiring tableaux/moments, satisfying the compiler, registering, targets | ~15% | Mechanical + judgment |
| Compile → dailies → look → fix (three compiler rounds, one audit round, one asset regen) | ~15% | Evidence loop |

## Automated in this pass (code, reusable)

1. **`scripts/lib/acquisition-kit.ts`** — a production acquire script is now a manifest. The kit owns
   digest-gated resume, 429 back-off, local-byte `references`, matte + inspection, events/results/receipt.
   Reference chains (sprite → expression variant → CG) are declared, not hand-wired.
2. **Deterministic audio** (`scripts/generate-privet-audio.ts`) — ambience/cues without a provider.
3. **Dailies capture fixed for the persistent reader** — `capture-dailies` deep-links `&moment=<startNodeId>`
   so IndexedDB progress from the previous frame can no longer shift the replay.
4. **Compiler error → fix table** extended with the three variant/insight rules this story hit.

## Evaluated, not built (candidate tools)

| Tool | Value | Risk if automated wrong | Verdict |
| --- | --- | --- | --- |
| **Scene manifest → typed skeleton** (`actors`, `tableaux`, `moments` with `goto` chain from a YAML/JSON beat list) | Removes the boilerplate of 34 moment literals and 15 tableau literals; ids/tableau reuse become consistent | Authors stop reading `contracts.ts`; skeleton hides viewpoint and acting decisions | **Build next** as `scripts/scaffold-experience.ts` — emits a `.ts` the author then edits; never re-runs over an edited file |
| **Beat extraction from prose** (LLM: actors, locations, dialogue vs narration, candidate private thoughts, candidate forks) | Fast first outline; surfaces candidate choice sites | Invents lines, flattens viewpoint, chooses forks for outcome theatre | **Advisory only** — output is a review document, never a story file. Human picks the bounded scene and every choice purpose |
| **Compiler-guided repair loop** (parse error strings → suggested edits) | The errors are already precise and enumerable | Auto-applied edits erase intent (e.g. demoting a pivotal beat to silence the audit) | **Suggest, don't apply** — extend `climb:step` to print the table row for each error next to the moment source line |
| **Prompt-brief generator** (actor description + performance + style → `AcquisitionRequest`) | Already partially the `figure()` helper in the manifest | Style drift if the shared vocabulary lives per-script | Move `style` / `exclusions` / `plate` / `isolated` to the kit as named presets with versions |
| **Reference gate** (identity check of a variant against its reference before it is admitted) | The Hagrid take that went barefoot/glossy was caught by eye | False positives block good takes | Keep human; record the rejection reason in the receipt (`reviews`), as Moon-Scar does |
| **Meridians hand-off** (`source` coordinate verified against a Domain/Branch; branch candidates as bounded scenes) | Makes the `source` field truthful | Importing runtime code across the boundary | Contract-level only: a `SourceCoordinateProof` JSON the Meridians side writes and the compiler verifies by digest |

## Authority boundary (unchanged)

Automation produces **evidence and suggestions**: receipts, digests, frames, diffs, audit demands, error tables,
skeletons. Humans decide **scope, prose, viewpoint, acting, choice meaning, asset acceptance and authorization**.
No tool in this repository writes or promotes story or asset content on its own, and the reader stays
presentation-only.

## Next bounded step

`scripts/scaffold-experience.ts`: take a small beat manifest (locations, actors with appearance ids, ordered beats
with `mode`/`speaker`/`viewpoint`/`tableau`), emit a compiling `src/story/<slug>.ts` skeleton with placeholder
text and a linear `goto` chain, and stop. Choices, variants, insights and acting are then added by hand where the
author wants the reader to lean in.
