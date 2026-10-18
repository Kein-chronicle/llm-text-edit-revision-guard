---
name: revision-bound-edit
description: Apply context-checked edits only to the exact revision they were proposed against. Use when applying AI-proposed edits or delayed review suggestions.
---

# revision-bound-edit

Apply context-checked edits only to the exact revision they were proposed against.

## Workflow

1. Confirm the input contract and exclusions below before transforming user data.
2. Import the named exports from `scripts/edit.mjs`. Node.js 22+; no npm dependencies. Browser use requires a modern ES module runtime.
3. Run `node --test tests/run.mjs` from this skill folder. The tests contain concrete inputs, expected outputs and rejection cases.
4. Integrate the pure function into the caller. Surface thrown errors as an invalid input result; do not replace failure with empty success.
5. Preserve the original data and inspect a representative output before adding writes or exports.

## Contract and limits

Ranges are zero-based UTF-16 offsets, end exclusive, in the original snapshot. Caller owns revision generation, approval and atomic compare-and-swap persistence. The pure function neither writes a file nor prevents races between validation and storage.

## Verification

Run `node --test tests/run.mjs` after copying this folder into an agent's skill directory. Keep `scripts/` and `tests/` together; there are no references to a private source repository. The assertions in `tests/run.mjs` are executable usage examples.
