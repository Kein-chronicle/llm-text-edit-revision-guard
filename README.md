# llm-text-edit-revision-guard

**Apply AI-proposed text edits only to the exact revision they were written against, with expected-text checks and overlap rejection.**

[![test](https://github.com/Kein-chronicle/llm-text-edit-revision-guard/actions/workflows/test.yml/badge.svg)](https://github.com/Kein-chronicle/llm-text-edit-revision-guard/actions/workflows/test.yml) ![license](https://img.shields.io/badge/license-MIT-blue.svg) ![dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)

## Why

An LLM proposes edits against a snapshot, a person approves them minutes later, and by then the document has moved. Applying offsets to the new text corrupts it. Each edit carries the text it expects to replace, and the whole proposal carries the revision it was made against.

## Install

**As a Claude Code skill** (Claude uses it when the task matches the skill description):

```sh
git clone https://github.com/Kein-chronicle/llm-text-edit-revision-guard.git ~/.claude/skills/revision-bound-edit
```

For a single project, clone into `<project>/.claude/skills/revision-bound-edit` instead, then start a new Claude Code session.

**As a library** (Node.js 22+, no dependencies):

```sh
npm install github:Kein-chronicle/llm-text-edit-revision-guard
```

or copy the one file you need: `scripts/edit.mjs` is self-contained.

**Requires:** Node.js 22+.

## Quick start

Run the quickstart:

```console
$ node examples/quickstart.mjs
The slow brown fox jumps over the sleepy dog.
refused: document moved on (rev-8) -> STALE_REVISION
refused: text under the range changed -> CONTEXT_MISMATCH
refused: two edits overlap -> OVERLAPPING_EDITS
```

The output above is real: it is produced by the files in `examples/`.

## API

```js
import { applyEdits } from 'llm-text-edit-revision-guard';

applyEdits('The quick brown fox.', {
  baseRevision: 'rev-7',
  edits: [{ start: 4, end: 9, expected: 'quick', text: 'slow' }],   // zero-based UTF-16 offsets, end exclusive
}, 'rev-7');                                                        // current revision -> 'The slow brown fox.'
```

Throws an `Error` with `.code` `STALE_REVISION` (revision moved), `CONTEXT_MISMATCH` (the text under a range changed) or `OVERLAPPING_EDITS`, and `TypeError` for malformed input, including an offset inside an emoji's surrogate pair. At most 1000 edits per proposal. Edits are applied back to front, so offsets stay valid.

## Limits

- Pure function: it neither writes files nor prevents a race between validation and storage. Make the final write an atomic compare-and-swap.
- Ranges are UTF-16 code-unit offsets into the original snapshot.

## Related projects

These solve neighbouring problems; use them when they fit better.

- **diff-match-patch, JSON Patch (RFC 6902)**: patch formats; they do not bind to a revision
- **Yjs and other CRDT/OT libraries**: merge concurrent edits; this refuses them

## More from the same collection

Small, tested tools that grew out of running AI agents and game/app pipelines for months:

- [**pdf-page-range-parser**](https://github.com/Kein-chronicle/pdf-page-range-parser): Parse "1-3, 5, 8-" page selections into exact ranges without silently sorting or deduplicating, and reject anything ambiguous.
- [**pdf-annotation-rotation**](https://github.com/Kein-chronicle/pdf-annotation-rotation): Rotate PDF/canvas annotations (boxes, lines, ink, source masks) a quarter turn in display coordinates, without mutating the input.
- [**pdf-text-position-table-extract**](https://github.com/Kein-chronicle/pdf-text-position-table-extract): Rebuild a rectangular table from positioned text fragments (x, baseline, size, text), keeping empty cells in place.

## Development

```sh
node --test tests/run.mjs
```

The tests include inputs that are supposed to be rejected, so a green run also shows the checks can fail. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).

If this saved you a debugging session, a star helps other people find it. Bug reports and failing test cases are even better.

<sub>Keywords: ai-agents, text-editing, patch, optimistic-concurrency, javascript, esm, llm, zero-dependencies</sub>
