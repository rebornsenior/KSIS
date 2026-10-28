import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../public/admin/registration-client.js',import.meta.url),'utf8');
function fixture(mode,schemaVersion=4,failure=null) {
  const timers=[];let popups=0,calls=0;
  const context={location:{origin:'https://www.rebornsenior.com'},window:{google:{accounts:{oauth2:{initTokenClient:options=>({requestAccessToken(){popups++;if(mode==='blocked')options.error_callback({type:'popup_failed_to_open'});if(mode==='success')options.callback({access_token:'test-credential',expires_in:3600});}})}}}},document:{},AbortSignal,setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout(){},fetch:async()=>{calls++;return failure ? {ok:false,status:failure.status,json:async()=>({error:failure.error})} : {ok:true,json:async()=>({response:{result:{ready:true,schemaVersion}}})};}};
  vm.runInNewContext(source,context);
  return {api:context.window.KSISRegistration,timers,popups:()=>popups,calls:()=>calls};
}
test('blocked login popup fails promptly and never sends a Google mutation request',async()=>{const f=fixture('blocked');await assert.rejects(f.api.call({action:'sync'}),/POPUP_BLOCKED/);assert.equal(f.calls(),0);});
test('a login that never returns has a bounded timeout and remains retryable',async()=>{const f=fixture('silent');const attempt=f.api.connect();f.timers[0]();await assert.rejects(attempt,/LOGIN_TIMEOUT/);const retry=f.api.connect();f.timers[1]();await assert.rejects(retry,/LOGIN_TIMEOUT/);assert.equal(f.popups(),2);});
test('explicit pre-connection is reused for saving without opening a second popup',async()=>{const f=fixture('success');await f.api.connect();await f.api.call({action:'sync'});await f.api.call({action:'sync'});assert.equal(f.popups(),1);assert.equal(f.calls(),2);});

test('per-event requests check backend version before mutation and reject an old backend',async()=>{
  const old=fixture('success',2);
  await assert.rejects(old.api.call({action:'sync',formStructure:'per-event'}),/REGISTRATION_CODE_OUTDATED/);
  assert.equal(old.calls(),1);
  const current=fixture('success',4);
  await current.api.call({action:'sync',formStructure:'per-event'});
  assert.equal(current.calls(),2);assert.equal(current.popups(),1);
});

 test('HTTP deployment failures are distinct from exceptions inside a running script',async()=>{
  for(const [status,code] of [[404,'API_DEPLOYMENT_NOT_ACCESSIBLE'],[403,'API_EXECUTION_FORBIDDEN']]) {
    const f=fixture('success',4,{status,error:{status:status===404?'NOT_FOUND':'PERMISSION_DENIED'}});
    await assert.rejects(f.api.call({action:'sync',formStructure:'per-event'}),new RegExp(code));
    assert.equal(f.calls(),1);
  }
  const f=fixture('success',4,{status:200,error:{details:[{errorMessage:'NOT_FOUND'}]}});
  await assert.rejects(f.api.call({action:'info'}),/^Error: NOT_FOUND$/);
});
