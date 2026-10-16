import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../public/admin/setup.js',import.meta.url),'utf8');
const start=source.indexOf('  const closeCalendarRegistration=');
const end=source.indexOf("  CMS.registerEventListener({name:'preUnpublish'",start);
function fixture({fail=false,confirmed=true}={}) {
  const calls=[],alerts=[];
  const context={window:{alert:message=>alerts.push(message),KSISRegistration:{call:async request=>{calls.push(request);if(fail)throw Error('FORBIDDEN');return {eventId:request.eventId,disabled:confirmed};}}}};
  vm.runInNewContext(source.slice(start,end)+'\nthis.close=closeCalendarRegistration;',context);
  const entry=(data={},collection='calendar')=>({get:key=>key==='collection'?collection:{get:key=>data[key]}});
  return {close:context.close,calls,alerts,entry};
}
const linked={registrationEnabled:true,registrationYear:'2026',registrationEventId:'event-id',title:'테스트 행사',date:'2026-10-16'};
test('deleting a connected schedule closes only its form option before deletion',async()=>{const f=fixture();await f.close({entry:f.entry(linked)});assert.equal(f.calls.length,1);assert.equal(f.calls[0].action,'sync');assert.equal(f.calls[0].enabled,false);assert.equal(f.calls[0].eventId,linked.registrationEventId);});
test('unrelated and unconnected entries never touch Google Forms',async()=>{const f=fixture();await f.close({entry:f.entry({})});await f.close({entry:f.entry(linked,'forum')});assert.equal(f.calls.length,0);});
test('failed or unconfirmed Google cleanup blocks schedule deletion',async()=>{for(const options of [{fail:true},{confirmed:false}]){const f=fixture(options);await assert.rejects(f.close({entry:f.entry(linked)}));assert.equal(f.alerts.length,1);}});
test('a previously closed event remains safe to delete without removing responses',async()=>{const f=fixture();await f.close({entry:f.entry({...linked,registrationEnabled:false})});assert.equal(f.calls[0].enabled,false);assert.ok(!f.calls.some(call=>call.action==='delete'));});
