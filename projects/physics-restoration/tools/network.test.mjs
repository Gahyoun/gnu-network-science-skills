import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adjacency,egoNodes,measures,pageRank} from '../assets/network-model.mjs';
test('directed ego traversal respects incoming, outgoing and hop limits',()=>{
 const nodes=['a','b','c','d','isolated'].map(id=>({id})),edges=[{source:'a',target:'b'},{source:'b',target:'c'},{source:'d',target:'a'}],adj=adjacency(nodes,edges);
 assert.deepEqual([...egoNodes('a',1,'out',adj)].sort(),['a','b']);
 assert.deepEqual([...egoNodes('a',2,'out',adj)].sort(),['a','b','c']);
 assert.deepEqual([...egoNodes('a',2,'in',adj)].sort(),['a','d']);
 assert.deepEqual([...egoNodes('a',1,'both',adj)].sort(),['a','b','d']);
 const m=measures(nodes,edges);assert.equal(m.components,2);assert.equal(m.density,3/20);assert.equal(m.reciprocity,0);
});
test('PageRank conserves probability with dangling nodes and ranks a linked target above an isolate',()=>{
 const nodes=['a','b','c'].map(id=>({id})),edges=[{source:'a',target:'b'}],rank=pageRank(nodes,edges);
 assert.ok(Math.abs([...rank.values()].reduce((a,b)=>a+b,0)-1)<1e-12);assert.ok(rank.get('b')>rank.get('a'));assert.equal(rank.get('a'),rank.get('c'));
 const reciprocal=measures(nodes,[...edges,{source:'b',target:'a'}]);assert.equal(reciprocal.reciprocity,1);
 assert.deepEqual(pageRank([],[]),new Map());assert.equal(measures([],[]).density,0);
});
