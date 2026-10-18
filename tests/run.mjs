import test from 'node:test';
import assert from 'node:assert/strict';

import {applyEdits} from '../scripts/edit.mjs';
const edit={baseRevision:'v1',edits:[{start:0,end:3,expected:'cat',text:'kitten'},{start:4,end:7,expected:'dog',text:'puppy'}]};
test('bottom-up edits use original positions',()=>assert.equal(applyEdits('cat dog',edit,'v1'),'kitten puppy'));
test('stale, wrong context and overlapping proposals fail atomically',()=>{
 assert.throws(()=>applyEdits('cat dog',edit,'v2'),/STALE/);
 assert.throws(()=>applyEdits('bat dog',edit,'v1'),/CONTEXT/);
 assert.throws(()=>applyEdits('cat dog',{baseRevision:'v1',edits:[edit.edits[0],edit.edits[0]]},'v1'),/OVERLAPPING/);
 assert.throws(()=>applyEdits('x',{baseRevision:'v1',edits:[]},'v1'));
});
test('insertions and Unicode use explicit UTF-16 offsets',()=>{
 assert.equal(applyEdits('😀a',{baseRevision:'r',edits:[{start:2,end:3,expected:'a',text:'b'}]},'r'),'😀b');
 assert.equal(applyEdits('ab',{baseRevision:'r',edits:[{start:1,end:1,expected:'',text:'X'}]},'r'),'aXb');
});

test('review findings: malformed input never corrupts or throws the wrong error',()=>{
 const inherited=Object.create({start:0,end:1,expected:'a',text:'b'});
 assert.equal(applyEdits('a',{baseRevision:'r',edits:[inherited]},'r'),'b');      // validated and applied from the same values: never 'undefined'
 assert.throws(()=>applyEdits('a',{baseRevision:'r',edits:[{start:0,end:1,expected:'a',text:5}]},'r'),TypeError);
 assert.throws(()=>applyEdits('a',{baseRevision:'',edits:[{start:0,end:1,expected:'a',text:'b'}]},''),TypeError);
 assert.throws(()=>applyEdits('😀a',{baseRevision:'r',edits:[{start:1,end:2,expected:'\ude00',text:'x'}]},'r'),/surrogate/);
 assert.throws(()=>applyEdits('a',null,'r'),TypeError);
 const e=(()=>{try{applyEdits('cat',{baseRevision:'v1',edits:[{start:0,end:3,expected:'cat',text:'x'}]},'v2')}catch(x){return x}})();
 assert.equal(e.code,'STALE_REVISION');
 assert.equal(applyEdits('abc',{baseRevision:'r',edits:[{start:0,end:1,expected:'a',text:''}]},'r'),'bc');
 assert.equal(applyEdits('aXa',{baseRevision:'r',edits:[{start:0,end:1,expected:'a',text:'1'},{start:2,end:3,expected:'a',text:'2'}]},'r'),'1X2');
 assert.throws(()=>applyEdits('a',{baseRevision:'r',edits:Array.from({length:1001},()=>({start:0,end:1,expected:'a',text:'b'}))},'r'),/1\.\.1000/);
});
