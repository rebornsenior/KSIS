import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../public/admin/content-guard.js', import.meta.url), 'utf8');
function fixture({draft = false, fail = false} = {}) {
  const data = {name:'시험 제목',date:'2026.10.14'};
  const context = {
    window:{alert:message=>assert.equal(typeof message,'string')}, localStorage:{getItem:()=>JSON.stringify({token:'mock'})},
    AbortSignal, TextDecoder, Uint8Array, atob,
    fetch:async url => {
      if (fail) return {ok:false};
      let result;
      if (url.includes('/pulls?')) result = draft ? [{head:{ref:'cms/forum/draft'}}] : [];
      else if (url.includes('/git/trees/')) result = {tree: draft && url.includes('/main?') ? [] : [{type:'blob',path:'src/content/forum/existing.json',sha:'test'}]};
      else result = {content:Buffer.from(JSON.stringify(data)).toString('base64')};
      return {ok:true,json:async()=>result};
    },
  };
  vm.runInNewContext(source,context);
  const entry = ({name='시험 제목',date='2026-10-14',newRecord=true,path}={}) => ({get:key=>({collection:'forum',newRecord,path,data:{toJS:()=>({name,date})}}[key])});
  return {check:context.window.KSISContentGuard.check,entry};
}
test('reject duplicate published title/date; allow distinct post and editing itself',async()=>{
  const {check,entry}=fixture();
  await assert.rejects(check({entry:entry()}),/같은 날짜와 제목/);
  await check({entry:entry({name:'다른 글'})});
  await check({entry:entry({newRecord:false,path:'src/content/forum/existing.json'})});
});
test('check unpublished drafts too',async()=>{
  const {check,entry}=fixture({draft:true});
  await assert.rejects(check({entry:entry()}),/같은 날짜와 제목/);
});
test('network failure must stop saving',async()=>{
  const {check,entry}=fixture({fail:true});
  await assert.rejects(check({entry:entry()}),/확인에 실패/);
});
