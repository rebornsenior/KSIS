import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import ts from 'typescript';
const root=new URL('../',import.meta.url);
test('all migrated albums retain photos and point to real posts',()=>{
  const files=readdirSync(new URL('src/content/gallery/',root));
  assert.equal(files.length,7);
  let total=0;
  for(const file of files){
    const album=JSON.parse(readFileSync(new URL('src/content/gallery/'+file,root),'utf8'));
    assert.ok(album.title);assert.match(album.date,/^\d{4}-\d{2}-\d{2}$/);
    assert.ok(album.images.length);total+=album.images.length;
    for(const path of [album.image,...album.images.map(photo=>photo.url)])assert.ok(existsSync(new URL(path.slice(1),root)),path);
    if(album.relatedUrl)assert.ok(existsSync(new URL('src/content/'+album.relatedUrl.replace('/#/post/','')+'.json',root)));
  }
  assert.equal(total,41);
});
test('related article links allow site posts and web links, never executable URLs',async()=>{
  const component=readFileSync(new URL('src/components/ActivityGallery.tsx',root),'utf8');
  const source=component.slice(component.indexOf('export function galleryLink'),component.indexOf('export default'));
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
  const {galleryLink}=await import('data:text/javascript;base64,'+Buffer.from(output).toString('base64'));
  assert.equal(galleryLink('/#/post/forum/post-one'),'/#/post/forum/post-one');
  assert.equal(galleryLink('https://cafe.naver.com/ksis1'),'https://cafe.naver.com/ksis1');
  for(const value of ['javascript:alert(1)','data:text/html,test','//evil.example',''])assert.equal(galleryLink(value),'');
});
