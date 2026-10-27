import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../public/admin/setup.js',import.meta.url),'utf8');
const start=source.indexOf('  let pendingRegistrationId=');
const end=source.indexOf('  const boardValidation=',start);
class Data {
  constructor(value){this.value=value;}
  get(key){return this.value[key];}
  set(key,value){return new Data({...this.value,[key]:value});}
  delete(key){const copy={...this.value};delete copy[key];return new Data(copy);}
}
function fixture({fail=false}={}){
  const calls=[];const ctx={window:{addEventListener(){},alert(){},KSISRegistration:{call:async request=>{calls.push(request);if(fail)throw Error('FORBIDDEN');return request.enabled?{eventId:request.eventId,year:'2026',schemaVersion:3,labelVersion:2,registrationForm:'https://docs.google.com/forms/d/e/test/viewform'}:{eventId:request.eventId,disabled:true,schemaVersion:3};}}},URL,TextEncoder,Uint8Array,crypto:{subtle:webcrypto.subtle,randomUUID:()=> 'new-id'}};
  vm.runInNewContext(source.slice(start,end)+'\nthis.sync=syncCalendarRegistration;',ctx);
  return {calls,sync:(value,metadata={})=>ctx.sync({get:key=>key==='collection'?'calendar':key==='data'?new Data(value):metadata[key]})};
}
const base={title:'행사',date:'2026-06-16',registrationEventId:'old-id'};
test('switching off closes an existing event even if the persisted year is missing',async()=>{const f=fixture();const saved=await f.sync({...base,registrationEnabled:false});assert.equal(f.calls.length,1);assert.equal(f.calls[0].enabled,false);assert.equal(saved.get('registrationForm'),'');});
test('switching off cannot save successfully when Google closure fails',async()=>{await assert.rejects(fixture({fail:true}).sync({...base,registrationEnabled:false}),/FORBIDDEN/);});
test('a never-connected event saves without Google authentication',async()=>{const f=fixture();await f.sync({title:'일반 일정',date:'2026-06-16',registrationEnabled:false});assert.equal(f.calls.length,0);});
test('enabling a new event generates a stable ID and stores its connection year',async()=>{const f=fixture();const saved=await f.sync({title:'새 일정',date:'2026-06-16',registrationEnabled:true});assert.equal(saved.get('registrationEventId'),'evt-new-id');assert.equal(saved.get('registrationYear'),'2026');});
test('connection year has a schema field so CMS serialization preserves it',()=>{assert.ok(source.includes("name:'registrationYear',widget:'hidden'"));});

test('an old workflow draft reuses the confirmed Google event ID when enabled or closed',async()=>{
  for(const enabled of [true,false]) {
    const f=fixture();
    const result=await f.sync({...base,registrationEventId:'evt-d829e7c9-231a-47e0-9244-7b5a256f1231',registrationEnabled:enabled});
    assert.equal(f.calls[0].eventId,'evt-976cd8e1-1c7e-46f6-b9e8-e04a115fe169');
    assert.equal(result.get('registrationEventId'),f.calls[0].eventId);
  }
});
test('an existing unlinked schedule keeps its ID across editor reloads and subsequent metadata saves',async()=>{
  const data={title:'기존 일정',date:'2026-06-16',registrationEnabled:true};
  const metadata={path:'src/content/calendar/existing.json',newRecord:false};
  const first=await fixture().sync(data,metadata);
  const retry=await fixture().sync(data,metadata);
  assert.equal(first.get('registrationEventId'),retry.get('registrationEventId'));
  const edited=await fixture().sync({...data,title:'제목 수정',registrationEventId:first.get('registrationEventId')},metadata);
  assert.equal(edited.get('registrationEventId'),first.get('registrationEventId'));
  const other=await fixture().sync(data,{...metadata,path:'src/content/calendar/other.json'});
  assert.notEqual(other.get('registrationEventId'),first.get('registrationEventId'));
});

test('saving sends the selected category to Google rather than silently dropping it',async()=>{
  for(const category of ['forum','education','monetize','other']) {
    const f=fixture();await f.sync({...base,category,registrationEnabled:true});
    assert.equal(f.calls[0].category,category);
  }
});
