import {readFileSync} from 'node:fs';
import vm from 'node:vm';
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
  const calls=[];const ctx={window:{addEventListener(){},alert(){},KSISRegistration:{call:async request=>{calls.push(request);if(fail)throw Error('FORBIDDEN');return request.enabled?{eventId:request.eventId,year:'2026',registrationForm:'https://docs.google.com/forms/d/e/test/viewform'}:{eventId:request.eventId,disabled:true};}}},URL,crypto:{randomUUID:()=> 'new-id'}};
  vm.runInNewContext(source.slice(start,end)+'\nthis.sync=syncCalendarRegistration;',ctx);
  return {calls,sync:value=>ctx.sync({get:key=>key==='collection'?'calendar':new Data(value)})};
}
const base={title:'행사',date:'2026-06-16',registrationEventId:'old-id'};
test('switching off closes an existing event even if the persisted year is missing',async()=>{const f=fixture();const saved=await f.sync({...base,registrationEnabled:false});assert.equal(f.calls.length,1);assert.equal(f.calls[0].enabled,false);assert.equal(saved.get('registrationForm'),'');});
test('switching off cannot save successfully when Google closure fails',async()=>{await assert.rejects(fixture({fail:true}).sync({...base,registrationEnabled:false}),/FORBIDDEN/);});
test('a never-connected event saves without Google authentication',async()=>{const f=fixture();await f.sync({title:'일반 일정',date:'2026-06-16',registrationEnabled:false});assert.equal(f.calls.length,0);});
test('enabling a new event generates a stable ID and stores its connection year',async()=>{const f=fixture();const saved=await f.sync({title:'새 일정',date:'2026-06-16',registrationEnabled:true});assert.equal(saved.get('registrationEventId'),'evt-new-id');assert.equal(saved.get('registrationYear'),'2026');});
test('connection year has a schema field so CMS serialization preserves it',()=>{assert.ok(source.includes("name:'registrationYear',widget:'hidden'"));});
