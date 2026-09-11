# Architecture

This lab proves one strategy: **author a bounded Experience, compile it, then read the immutable result**.

```text
authorized source coordinate
  → typed Experience (assets · actors · tableaux · moments · choices)
  → pure compiler (structure, identity, viewpoint, reachability)
  → preparation shell (verify digests, copy exact bytes, write receipt)
  → static reader (pure cursor reducer + DOM/audio adapters)
```

The compiler is the centre. It rejects structural errors before Vite or the browser is involved. The
preparation script is the only filesystem shell. The player never reads source folders and never calls a
generation provider. Reading changes only the local cursor; traversal choices do not write canon.

## Deliberate constraints

- A figure's scale and source-facing live on the actor, not in tableaux. A character therefore cannot grow
  between moments by accident.
- A tableau is a complete stable composition. Moments reference it; they do not accumulate fragile patches.
- Five slots are semantic positions, not hand-tuned pixel coordinates.
- A private POV may not jump directly into another private POV. A public beat must bridge the handoff.
- A speaking or thinking actor must be staged at full emphasis; the reader cannot hear a dimmed figure.
- All graph nodes must be reachable and acyclic in this proof.
- Every asset is copied only after its SHA-256 matches the authored lineage.
- UI and audio are adapters over compiled data. They contain no story policy.

## What is intentionally absent

No canonical writer, Scenario resolver, model API, asset generator, general animation engine, or duplicated
production-memory system. Those are upstream responsibilities. A later provider adapter should produce a
candidate asset plus provenance for approval; it should not become part of reading or compilation.
