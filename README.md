# Meridians VN Lab

Designed and built by [jasonyu0100](https://github.com/jasonyu0100).

A clean-room TypeScript proof for reader-paced Meridians Experiences. It keeps one authoring contract, one
pure compiler, one pure reader state machine, and one static web reader.

## Run

```bash
npm install
VN_ASSET_ROOT=/absolute/path/to/inktide/tmp npm run build:experience
npm run dev
```

Open `http://127.0.0.1:4190`. Click or press Space/Enter/↓ to advance, ↑ to step back, and Tab for the
backlog. Sound starts disabled because browsers require a reader gesture; use SOUND OFF to enable it.

`npm run check` runs pure tests, rebuilds the digest-pinned artifact, type-checks, and creates a static Vite
bundle. The prepared output lives under `public/generated/` and is deliberately ignored: it is regenerated
from the story and exact source bytes.

## Start here

- `src/core/contracts.ts` — the only authoring/runtime shape.
- `src/core/compiler.ts` — deterministic structural gate.
- `src/core/reader-state.ts` — deterministic reader transport.
- `src/story/moon-scar.ts` — one representative Experience.
- `docs/ARCHITECTURE.md` — decisions and non-goals.

This temporary repository is an experiment, not a second Meridians runtime. It exists to identify the
smallest stable contract worth porting later.
