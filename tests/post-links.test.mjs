import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/content/post-links.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {postPath,postListPath}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
test('every published program article has a unique route with a lossless Korean slug',()=>{
 const routes=new Set();
 for(const group of ['forum','foodculture','bookclub','local','education','notices']){
  const folder=new URL('../src/content/'+group+'/',import.meta.url);
  for(const file of readdirSync(folder).filter(name=>name.endsWith('.json'))){
   const data=JSON.parse(readFileSync(new URL(file,folder),'utf8'));
   const slug=data.slug||file.slice(0,-5);
   const route=postPath(group,slug);
   assert.equal(decodeURIComponent(route.split('/').pop()),slug);
   assert.equal(routes.has(route),false,route);routes.add(route);
  }
 }
 assert.ok(routes.size>0);
});
test('list return paths retain the correct program and all three community categories',()=>{
 for(const [group,expected] of Object.entries({forum:'/archive?tab=forum',education:'/archive?tab=education',foodculture:'/archive?tab=project&category=food',bookclub:'/archive?tab=project&category=book',local:'/archive?tab=project&category=local',notices:'/community?tab=notice'}))assert.equal(postListPath(group),expected);
});
test('article URLs encode query and path delimiters within a slug',()=>{
 const slug='한글 제목/?#%';
 const route=postPath('foodculture',slug);
 assert.equal(route.split('/').length,4);
 assert.equal(decodeURIComponent(route.split('/').pop()),slug);
 assert.throws(()=>postPath('unknown','test'));
 assert.throws(()=>postPath('forum',''));
});
