const fail=(code,msg)=>Object.assign(new Error(code+(msg?': '+msg:'')),{code});
const isSplit=(t,i)=>i>0&&i<t.length&&/[\uD800-\uDBFF]/.test(t[i-1])&&/[\uDC00-\uDFFF]/.test(t[i]);   // an offset between the two halves of an emoji
export const MAX_EDITS=1000;
/** Apply `edits` (zero-based UTF-16 offsets into the ORIGINAL text, end exclusive) only if `baseRevision` equals `currentRevision`.
 *  Errors carry a `.code`: STALE_REVISION, CONTEXT_MISMATCH, OVERLAPPING_EDITS (TypeError for malformed input). At most MAX_EDITS edits per proposal. */
export function applyEdits(text,proposal,currentRevision) {
  if(typeof text!=='string'||!proposal||typeof proposal!=='object'||!Array.isArray(proposal.edits))throw new TypeError('text must be a string and the proposal {baseRevision, edits[]}');
  const {baseRevision,edits}=proposal;
  if(typeof baseRevision!=='string'||typeof currentRevision!=='string'||!baseRevision||!currentRevision)throw new TypeError('baseRevision and currentRevision must be non-empty strings');
  if(baseRevision!==currentRevision)throw fail('STALE_REVISION');
  if(!edits.length||edits.length>MAX_EDITS)throw new TypeError(`1..${MAX_EDITS} edits required`);
  const sorted=edits.map(e=>{
    if(!e||typeof e!=='object'||!Number.isSafeInteger(e.start)||!Number.isSafeInteger(e.end)||e.start<0||e.end<e.start||e.end>text.length||typeof e.text!=='string'||typeof e.expected!=='string')throw new TypeError('invalid edit');
    if(isSplit(text,e.start)||isSplit(text,e.end))throw new TypeError('edit offset splits a surrogate pair (an emoji)');
    if(text.slice(e.start,e.end)!==e.expected)throw fail('CONTEXT_MISMATCH');
    return {start:e.start,end:e.end,expected:e.expected,text:e.text};            // own, validated values only: inherited or getter properties are never read twice
  }).sort((a,b)=>a.start-b.start||a.end-b.end);
  for(let i=1;i<sorted.length;i++)if(sorted[i].start<sorted[i-1].end||sorted[i].start===sorted[i-1].start)throw fail('OVERLAPPING_EDITS');
  let out=text;for(const e of sorted.reverse())out=out.slice(0,e.start)+e.text+out.slice(e.end);return out;
}
