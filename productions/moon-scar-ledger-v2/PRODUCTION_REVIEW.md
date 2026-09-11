# Moon-Scar Ledger v2 — production review

Status: **candidate rehearsal**. This pass demonstrates a reproducible visual modernization; it does not
approve the generated assets as a final style family.

## Audience claim

At a 16:9 reader scale, Moon-Scar should read as a modern visual novel: actors are larger than life, keep
stable relative scale and facing, cede the centre for an evidence object, and remain legible beneath a fixed
dialogue rail. The acquisition may improve assets, but the reader must remain deterministic and offline.

## Reusable work proved

- One actor owns one base scale. Projection changes use the reader's fixed full-body/three-quarter/portrait
  crop table; a moment cannot silently resize the character.
- Five slots and exact source-facing metadata produce repeatable inward-facing two-shots.
- Trusted legacy SFX assets enter through exact source and receipt coordinates rather than visual memory.
- Replicate generation is demand-led and records inputs, predictions, selected outputs, byte digests, and
  rejected attempts before a story binds an asset.
- Chroma plus semantic segmentation is treated as an intermediate matte. Deterministic local refinement
  removes exterior screen colour, reconstructs partial-alpha colour, neutralises the boundary, and clears
  hidden RGB.
- Empty stage plates, actors, artifacts, editorial UI, ambience, music, and cues remain distinct bindings.

## Dailies

Strongest moment: `moon-scar`. The Moon-Scar Gu cleanly owns the centre while Fang and Chun frame it at
opposing depths. The reveal reads before the text explains it.

Most visible remaining failure: style continuity. Fang has the best line economy and material rendering;
Chun and the mountain plate remain more coarsely pixel-textured. The mountain plate also contains a small
unrequested stool at far right. Those are candidate defects, not reasons to hide the stable composition.

Single next repair: generate one identity-locked Gu Yue Chun speaking/listening close pair using Fang's
approved contour, texture, and palette reference, then prove the exchange at `tally-bound` with the current
scale/projection/blocking unchanged. Do not broaden into an expression sheet.

## Retained negative evidence

The v2 location plates introduced people or interface-like composition. The v2 artifacts expanded isolated
object requests into character-filled CGs. Their exact bytes remain under `evidence/rejected/`; provider
events and results remain alongside the acquisition receipt. They are excluded from the Experience.
