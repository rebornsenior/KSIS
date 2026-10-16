import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const output=ts.transpileModule(readFileSync(new URL('../src/content/sort-posts.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {sortPosts,postDate}=await import('data:text/javascript;base64,'+Buffer.from(output).toString('base64'));
test('latest date overrides legacy order and sorting never mutates content',()=>{
 const posts=[{date:'2026.06.14',order:1},{date:'2026-6-12',order:2},{date:'2026.10.16',order:999},{date:''}];
 assert.deepEqual(sortPosts(posts).map(p=>p.date),['2026.10.16','2026.06.14','2026-6-12','']);
 assert.deepEqual(sortPosts(posts,'oldest').map(p=>p.date),['2026-6-12','2026.06.14','2026.10.16','']);
 assert.equal(posts[0].date,'2026.06.14');assert.equal(postDate('2026-6-2'),'2026.06.02');
});
