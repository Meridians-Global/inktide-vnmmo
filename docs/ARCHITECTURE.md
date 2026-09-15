# Architecture

This repository follows one strategy: **author a bounded Experience, compile it, then read the immutable result**.

```text
authorized source coordinate
  → typed Experience (assets · actors · tableaux · moments · choices)
  → pure compiler (structure, identity, viewpoint, reachability)
  → read-only production audit (choice topology · payoff · exact gaps)
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
- Every figure declares one exact preparation recipe. The builder can first apply explicit chroma despill, an
  alpha floor, bounded low-chroma light-fringe removal, and an explicit alpha-erosion count, then trims the visible alpha envelope, scales
  it into a fixed subject box without distortion, centres it horizontally, and grounds it above a fixed
  bottom padding on a fixed transparent canvas. Provider padding therefore cannot change body scale or feet.
- A tableau is a complete stable composition. Moments reference it; they do not accumulate fragile patches.
- Pivotal acting is authored as `baseline → appraisal → decision → after-state`, then detected from exact
  moment/tableau bindings. It is never guessed from prose keywords. A pivotal sprite beat must name an explicit
  appearance, making an emotional cut reviewable and preventing an unchanged default pose from passing as acting.
- A modern VN CG is a typed cut-in, not a background pretending to be a location. It declares the actors and
  artifact already embodied in the frame, and the compiler rejects duplicate sprite/prop layering. This keeps
  reusable tableaux and high-impact memory images as two coherent visual modes.
- CG framing is explicit and selected by dramatic purpose rather than inherited from the default sprite stage.
  `location-match` keeps the established plate beneath a graded, edge-feathered artifact push;
  `relationship-close` replaces the reusable figures with a full-frame two-shot whose eyelines and emotional
  distance carry the event; `memory-full-frame` is reserved for an acknowledged break from physical continuity.
  Every mode carries ambience across the cut and returns to the same unchanged reading rail.
- An exact review URL reconstructs one deterministic start-to-moment path, including its traversal choices, so
  Back and backlog remain useful instead of treating the linked frame as an isolated slideshow.
- Reader knowledge is an explicit semantic insight set, distinct from page history, active route, character state,
  and world state. Texture-choice options may grant or require declared insight IDs; unavailable readings are omitted
  rather than teased as disabled options. The compiler proves that every declared insight is both learnable and
  harvested downstream. Back preserves this reading memory, Restart clears it, and direct deep links cannot
  fabricate a route whose prerequisites were never understood.
  Cross-route synthesis can therefore reward attentive rereading without granting either character knowledge from
  the other's private POV or writing anything canonical.
- Active route choice and cumulative reader knowledge are deliberately different. Back removes the abandoned active
  choice but retains semantic insights learned on that route. A later public moment may declare prepared
  `readingVariants` keyed either to one active upstream choice or to one or more persistent reader insights. The
  compiler proves each source can precede the callback and rejects mixed condition kinds or ambiguous multi-insight
  readings without an explicit combined variant. This supports immediate route echoes and delayed observational
  payoffs without world flags, runtime prose generation, or a second state writer.
- Insight acquisition order is preserved separately from membership. A public synthesis may use
  `reader-insight-order` to acknowledge which of exactly two private readings the reader encountered first. Both
  permutations are mandatory, so rereading can change interpretive emphasis without silently privileging one route,
  changing availability, or writing character/world state.
- A reading variant may select a prepared `tableauId` for editorial emphasis. Compilation rejects any variant that
  changes material scene continuity: location, background, ambience/music, tone/atmosphere, artifact, cut-in, actor
  set, exact actor asset, wardrobe, expression, concealment, or source facing. Only framing coordinates—projection,
  slot, emphasis, and shot composition—may change, and any speaker must remain staged and active.
- Choice `weight` and `purpose` are separate. Weight says whether a traversal is interpretive texture or a genuine
  fork; purpose says whether the reader observes evidence, selects an interpretation, predicts conduct, or commits a
  decision. Prediction routes must reconverge on the same authored event and may vary only its reader-facing account,
  so calibration cannot masquerade as authority over the character.
- Five slots are semantic positions, not hand-tuned pixel coordinates.
- A private POV may not jump directly into another private POV. A public beat must bridge the handoff.
- A speaking or thinking actor must be staged at full emphasis; the reader cannot hear a dimmed figure.
- All graph nodes must be reachable and acyclic in this proof.
- Every source is consumed only after its SHA-256 matches the authored lineage. Receipts separately pin the
  source digest, preparation recipe, and prepared-output digest.
- Chroma is a generation aid, not the final matte. Isolated candidates pass through semantic segmentation,
  exterior-connected chroma rejection, partial-alpha colour reconstruction, boundary neutralisation, and
  transparent-RGB clearing. Inspection metrics remain in the acquisition receipt.
- Character nuance and anatomical repair default to a reference-based visual edit, not a pixel algorithm. The
  canonical rendition locks identity, wardrobe, projection, facing, scale and registration; the typed variation
  states the one feature or performance dimension allowed to change. Every take is then checked at source scale
  and in its real tableau. Older bounded iris recipes remain reproducible legacy evidence, not the preferred
  acting workflow.
- UI and audio are adapters over compiled data. They contain no story policy.
- Expansion planning is a derived audit over the same Experience, not a second authoring language. Each choice is
  projected into exact option, nearest-convergence, private-holder, insight, and payoff coordinates. Explicit
  per-Experience targets may expose a missing decision posture or location family, while pivotal acting detection
  exposes a performance that does not change from its incoming rendition. The build pins this projection beside
  the immutable Experience so an outer writer or asset worker can consume the gap without inventing state. A
  deterministic portfolio projection then joins exact Experience, audit, and receipt digests and selects one next
  repair by declared priority. It can gate high-priority gaps, but it cannot confer artistic approval.
- The stage is a fixed camera aperture, not a focus-scrollable container. True CSS clipping preserves one coordinate
  system for context, figures, artifacts, atmosphere, dialogue and transport even when a nested control receives focus.
  An illegal review URL fails closed to the authored beginning while the strict core initializer still rejects it.
- Physical sound and voice are separate reader buses. Both begin off; ambience, music and material cues may
  be enabled without voice. A moment may bind one exact voice asset, but an Experience with none keeps that
  setting visibly unavailable. Silence therefore remains authored rather than being mistaken for missing media.

## What is intentionally absent

No canonical writer, Scenario resolver, general animation engine, or duplicated production-memory system.
The Replicate adapter is an offline production shell: it writes retained candidate/result evidence and never
runs in the reader. Generation remains demand-led and cannot promote its own output.
