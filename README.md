<img width="3024" height="1296" alt="Meridians Readme Banner" src="https://github.com/user-attachments/assets/a8216b78-7e15-45cc-b42d-2b5ff1ff35ce" />

# Inktide VNMMO

Designed and built by [jasonyu0100](https://github.com/jasonyu0100).

The Inktide VNMMO begins in black and white. Its seeded universe starts as a manga.

This independent repository owns a TypeScript system library for reader-paced visual-novel Experiences. It
keeps one authoring contract, one pure compiler, one pure reader state machine, and one static web reader.
It currently lives under Meridians' `tmp/` workspace for rapid experimentation, but it has its own Git
history and remote. It is a presentation system: it does not write Meridians Domain or Scenario state.

## Run

```bash
npm install
npm run check
npm run dev -- --port 4190
```

Open `http://127.0.0.1:4190`. The catalog opens the Spider-Man rehearsal by default; use
`?story=moon-scar-reading-v1` for the earlier proof. Add `&moment=<moment-id>` to deep-link exact dailies.
Click or press Space/Enter/↓ to advance, ↑ to step back, and Tab for the backlog. Sound starts disabled
because browsers require a reader gesture; use SOUND OFF to enable it.

`npm run check` runs pure tests, rebuilds the digest-pinned artifact, type-checks, and creates a static Vite
bundle. Builds use the repository's exact `assets/` sources by default, so reading and validation require no
API key or Meridians checkout. Prepared output under `public/generated/` is ignored and reproducibly rebuilt.

Offline Replicate acquisition is optional. Copy `.env.example` to `.env`, set `REPLICATE_API_TOKEN`, and
point `MERIDIANS_ROOT` at a local Meridians checkout only when a production needs its authorized source
record. Provider jobs write candidates and retained evidence; they never run inside the reader.

## Start here

- `src/core/contracts.ts` — the only authoring/runtime shape.
- `src/core/compiler.ts` — deterministic structural gate.
- `src/core/figure-normalization.ts` — padding-invariant actor preparation.
- `src/core/reader-state.ts` — deterministic reader transport.
- `src/story/spider-memory.ts` — dual-identity and viewpoint rehearsal.
- `src/story/moon-scar.ts` — an earlier representative Experience on the same contract.
- `scripts/acquire-spider-assets.ts` — resumable, evidence-bearing Replicate acquisition and preparation.
- `docs/ARCHITECTURE.md` — decisions and non-goals.
