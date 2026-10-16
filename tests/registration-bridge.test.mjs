import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../google-apps-script/registration/Code.gs',import.meta.url),'utf8');
function setup({email='staff@example.com',deleteFails=false,previousValue=false}={}) {
  const event={formId:'fixture',eventItemId:'1',eventValue:previousValue?'새 행사명':'event-a',previousValues:previousValue?['event-a']:[],nameItemId:'2',phoneItemId:'3',payerItemId:'4',readers:['staff@example.com'],deleters:['staff@example.com']};
  const data=[['r1','event-a','가상 A'],['r2','event-b','가상 B']];
  const response=row=>({getId:()=>row[0],getTimestamp:()=>new Date('2026-10-16T00:00:00Z'),getItemResponses:()=>[row[1],row[2],'010-XXXX-0000','가상'].map((value,i)=>({getItem:()=>({getId:()=>i+1}),getResponse:()=>value}))});
  let deleted=0;
  const form={getResponses:()=>data.map(response),getResponse:id=>response(data.find(row=>row[0]===id)),deleteResponse:id=>{deleted++;if(!deleteFails)data.splice(data.findIndex(row=>row[0]===id),1);}};
  const context=vm.createContext({Session:{getActiveUser:()=>({getEmail:()=>email})},PropertiesService:{getScriptProperties:()=>({getProperty:key=>key==='KSIS_REGISTRATION'?JSON.stringify({events:{a:event}}):null})},FormApp:{openById:()=>form},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})}});
  vm.runInContext(source,context);
  return {run:request=>context.ksisRegistration(request),deleted:()=>deleted};
}
const deletion={action:'delete',eventId:'a',responseId:'r1',confirmDelete:true,expectedName:'가상 A',expectedSubmittedAt:'2026-10-16T00:00:00.000Z'};
test('list only returns the selected event',()=>{const s=setup();assert.equal(s.run({action:'list',eventId:'a'}).records.length,1);});
test('unknown or signed-out callers cannot list',()=>{for(const email of ['', 'other@example.com'])assert.throws(()=>setup({email}).run({action:'list',eventId:'a'}));});
test('other event response cannot be deleted',()=>{const s=setup();assert.throws(()=>s.run({...deletion,responseId:'r2'}),/EVENT_MISMATCH/);assert.equal(s.deleted(),0);});
test('confirmation and matching identity required',()=>{const s=setup();assert.throws(()=>s.run({...deletion,confirmDelete:false}),/CONFIRM_REQUIRED/);assert.throws(()=>s.run({...deletion,expectedName:'different'}),/RESPONSE_CHANGED/);assert.equal(s.deleted(),0);});
test('delete reports success only after removal',()=>{const s=setup();assert.equal(s.run(deletion).deleted,true);assert.equal(s.run({action:'list',eventId:'a'}).records.length,0);assert.throws(()=>setup({deleteFails:true}).run(deletion),/DELETE_NOT_CONFIRMED/);});

test('deletion still works for responses using an old dropdown label',()=>{const s=setup({previousValue:true});assert.equal(s.run({action:'list',eventId:'a'}).records.length,1);assert.equal(s.run(deletion).deleted,true);});
