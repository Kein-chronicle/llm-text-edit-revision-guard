import { applyEdits } from '../scripts/edit.mjs';

const doc = 'The quick brown fox jumps over the lazy dog.';
const proposal = {
  baseRevision: 'rev-7',
  edits: [
    { start: 4,  end: 9,  expected: 'quick', text: 'slow' },
    { start: 35, end: 39, expected: 'lazy',  text: 'sleepy' },
  ],
};
console.log(applyEdits(doc, proposal, 'rev-7'));

const attempts = {
  'document moved on (rev-8)':   () => applyEdits(doc, proposal, 'rev-8'),
  'text under the range changed': () => applyEdits(doc.replace('quick', 'quiet'), proposal, 'rev-7'),
  'two edits overlap':            () => applyEdits(doc, { baseRevision: 'rev-7', edits: [{ start: 4, end: 9, expected: 'quick', text: 'a' }, { start: 6, end: 9, expected: 'ick', text: 'b' }] }, 'rev-7'),
};
for (const [label, fn] of Object.entries(attempts)) {
  try { fn(); console.log('applied?!', label); } catch (e) { console.log('refused:', label, '->', e.message); }
}
