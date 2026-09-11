# Architecture

This repository follows one strategy: **author a bounded Experience, compile it, then read the immutable result**.

```text
authorized source coordinate
  → typed Experience (assets · actors · tableaux · moments · choices)
  → pure compiler (structure, identity, viewpoint, reachability)
  → preparation shell (verify sources, prepare figures, write outputs + receipt)
  → static reader (pure cursor reducer + DOM/audio adapters)
```

The compiler is the centre. It rejects structural errors before Vite or the browser is involved. The
preparation script is the only filesystem shell. The player never reads source folders and never calls a
generation provider. Reading changes only the local cursor; traversal choices do not write canon.

## Deliberate constraints

- Stable identity is separate from appearance. One actor owns an identity version, one stage-height contract,
  and sparse appearances that bind wardrobe, expression, concealment, projection, facing, stage name, and exact
  asset. Peter Parker and Spider-Man therefore remain one actor while the reader can stage the mask honestly.
- Base figure scale lives on the actor, while source-facing and projection live on the appearance. Neither can
  drift inside a tableau. The reader maps `full-body`, `three-quarter`, and `portrait` to one fixed scale/crop
  table, so close framing is repeatable rather than a scene-level size correction. Requested facing is resolved
  deterministically against the rendition rather than guessed from pixels.
- Every figure declares one exact preparation recipe. The builder can first apply explicit chroma despill and
  an alpha floor, then trims the visible alpha envelope, scales
  it into a fixed subject box without distortion, centres it horizontally, and grounds it above a fixed
  bottom padding on a fixed transparent canvas. Provider padding therefore cannot change body scale or feet.
- A tableau is a complete stable composition. Moments reference it; they do not accumulate fragile patches.
- Five slots are semantic positions, not hand-tuned pixel coordinates.
- A private POV may not jump directly into another private POV. A public beat must bridge the handoff.
- A speaking or thinking actor must be staged at full emphasis; the reader cannot hear a dimmed figure.
- All graph nodes must be reachable and acyclic in this proof.
- Every source is consumed only after its SHA-256 matches the authored lineage. Receipts separately pin the
  source digest, preparation recipe, and prepared-output digest.
- Chroma is a generation aid, not the final matte. Isolated candidates pass through semantic segmentation,
  exterior-connected chroma rejection, partial-alpha colour reconstruction, boundary neutralisation, and
  transparent-RGB clearing. Inspection metrics remain in the acquisition receipt.
- UI and audio are adapters over compiled data. They contain no story policy.

## What is intentionally absent

No canonical writer, Scenario resolver, general animation engine, or duplicated production-memory system.
The Replicate adapter is an offline production shell: it writes retained candidate/result evidence and never
runs in the reader. Generation remains demand-led and cannot promote its own output.
