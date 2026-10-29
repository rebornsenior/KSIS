import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../public/admin/setup.js',import.meta.url),'utf8');
const start=source.indexOf('  const closeCalendarRegistration=');
const end=source.indexOf("  CMS.registerEventListener({name:'preUnpublish'",start);
function fixture({fail=false,confirmed=true,trashPending=false}={}) {
  const calls=[],alerts=[];
  const context={window:{addEventListener(){},alert:message=>alerts.push(message),KSISRegistration:{call:async request=>{calls.push(request);if(fail)throw Error('FORBIDDEN');return {eventId:request.eventId,schemaVersion:4,disabled:confirmed,trashPending};}}}};
  vm.runInNewContext(source.slice(source.indexOf('  let pendingRegistrationId='),source.indexOf('  const boardValidation='))+source.slice(start,end)+'\nthis.close=closeCalendarRegistration;',context);
  const entry=(data={},collection='calendar')=>({get:key=>key==='collection'?collection:{get:key=>data[key]}});
  return {close:context.close,calls,alerts,entry};
}
const linked={registrationEnabled:true,registrationYear:'2026',registrationEventId:'event-id',title:'테스트 행사',date:'2026-10-16'};
test('deleting a connected schedule trashes only the selected event form before deletion',async()=>{const f=fixture();await f.close({entry:f.entry(linked)});assert.equal(f.calls.length,1);assert.equal(f.calls[0].action,'sync');assert.equal(f.calls[0].enabled,false);assert.equal(f.calls[0].eventId,linked.registrationEventId);});
test('unrelated and unconnected entries never touch Google Forms',async()=>{const f=fixture();await f.close({entry:f.entry({})});await f.close({entry:f.entry(linked,'forum')});assert.equal(f.calls.length,0);});
test('failed or unconfirmed Google cleanup blocks schedule deletion',async()=>{for(const options of [{fail:true},{confirmed:false}]){const f=fixture(options);await assert.rejects(f.close({entry:f.entry(linked)}));assert.equal(f.alerts.length,1);}});
test('a form left outside the trash blocks schedule deletion',async()=>{const f=fixture({trashPending:true});await assert.rejects(f.close({entry:f.entry(linked)}),/FORM_TRASH_PERMISSION_REQUIRED/);assert.equal(f.alerts.length,1);assert.match(f.alerts[0],/일정 삭제를 중단/);});
test('a previously closed event remains safe to delete without removing responses',async()=>{const f=fixture();await f.close({entry:f.entry({...linked,registrationEnabled:false})});assert.equal(f.calls[0].enabled,false);assert.ok(!f.calls.some(call=>call.action==='delete'));});

test('deleting a legacy draft closes the actual Google event rather than the stale ID',async()=>{
  const f=fixture();await f.close({entry:f.entry({...linked,registrationEventId:'evt-d829e7c9-231a-47e0-9244-7b5a256f1231'})});
  assert.equal(f.calls[0].eventId,'evt-976cd8e1-1c7e-46f6-b9e8-e04a115fe169');
});

test('repeated cleanup in the same editor reuses confirmed closure',async()=>{
  const f=fixture();
  await f.close({entry:f.entry(linked)});
  await f.close({entry:f.entry({...linked,registrationEnabled:false})});
  assert.equal(f.calls.length,1);
});
