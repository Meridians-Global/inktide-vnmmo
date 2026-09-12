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
- Pivotal acting is authored as `baseline → appraisal → decision → after-state`, then detected from exact
  moment/tableau bindings. It is never guessed from prose keywords. A pivotal sprite beat must name an explicit
  appearance, making an emotional cut reviewable and preventing an unchanged default pose from passing as acting.
- A modern VN CG is a typed cut-in, not a background pretending to be a location. It declares the actors and
  artifact already embodied in the frame, and the compiler rejects duplicate sprite/prop layering. This keeps
  reusable tableaux and high-impact memory images as two coherent visual modes.
- CG framing is explicit. `location-match` keeps the established plate beneath a graded, edge-feathered camera
  push and carries the same ambience across the cut; `memory-full-frame` is reserved for an acknowledged break
  from physical continuity. Both return to the unchanged reading rail.
- An exact review URL reconstructs one deterministic start-to-moment path, including its traversal choices, so
  Back and backlog remain useful instead of treating the linked frame as an isolated slideshow.
- Five slots are semantic positions, not hand-tuned pixel coordinates.
- A private POV may not jump directly into another private POV. A public beat must bridge the handoff.
- A speaking or thinking actor must be staged at full emphasis; the reader cannot hear a dimmed figure.
- All graph nodes must be reachable and acyclic in this proof.
- Every source is consumed only after its SHA-256 matches the authored lineage. Receipts separately pin the
  source digest, preparation recipe, and prepared-output digest.
- Chroma is a generation aid, not the final matte. Isolated candidates pass through semantic segmentation,
  exterior-connected chroma rejection, partial-alpha colour reconstruction, boundary neutralisation, and
  transparent-RGB clearing. Inspection metrics remain in the acquisition receipt.
- Small local defects that do not justify identity regeneration may use a deterministic, spatially bounded
  preparation recipe. Iris correction records exact source/output hashes, geometric regions, colour predicate,
  and target colour; it cannot silently repaint a face.
- UI and audio are adapters over compiled data. They contain no story policy.
- Physical sound and voice are separate reader buses. Both begin off; ambience, music and material cues may
  be enabled without voice. A moment may bind one exact voice asset, but an Experience with none keeps that
  setting visibly unavailable. Silence therefore remains authored rather than being mistaken for missing media.

## What is intentionally absent

No canonical writer, Scenario resolver, general animation engine, or duplicated production-memory system.
The Replicate adapter is an offline production shell: it writes retained candidate/result evidence and never
runs in the reader. Generation remains demand-led and cannot promote its own output.
