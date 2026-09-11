# Meridians VN Lab

Designed and built by [jasonyu0100](https://github.com/jasonyu0100).

A clean-room TypeScript proof for reader-paced Meridians Experiences. It keeps one authoring contract, one
pure compiler, one pure reader state machine, and one static web reader.

## Run

```bash
npm install
cp .env.example .env # then set VN_ASSET_ROOT
npm run check
npm run dev -- --port 4190
```

Open `http://127.0.0.1:4190`. The catalog opens the Spider-Man rehearsal by default; use
`?story=moon-scar-reading-v1` for the earlier proof. Add `&moment=<moment-id>` to deep-link exact dailies.
Click or press Space/Enter/↓ to advance, ↑ to step back, and Tab for the
backlog. Sound starts disabled because browsers require a reader gesture; use SOUND OFF to enable it.

`npm run check` runs pure tests, rebuilds the digest-pinned artifact, type-checks, and creates a static Vite
bundle. The prepared output lives under `public/generated/` and is deliberately ignored: it is regenerated
from the story and exact source bytes.

## Start here

- `src/core/contracts.ts` — the only authoring/runtime shape.
- `src/core/compiler.ts` — deterministic structural gate.
- `src/core/figure-normalization.ts` — padding-invariant actor preparation.
- `src/core/reader-state.ts` — deterministic reader transport.
- `src/story/spider-memory.ts` — dual-identity and viewpoint rehearsal from the imported local Domain.
- `src/story/moon-scar.ts` — earlier representative Experience retained on the same contract.
- `scripts/acquire-spider-assets.ts` — resumable, evidence-bearing Replicate acquisition and preparation.
- `docs/ARCHITECTURE.md` — decisions and non-goals.

This temporary repository is an experiment, not a second Meridians runtime. It exists to identify the
smallest stable contract worth porting later.
