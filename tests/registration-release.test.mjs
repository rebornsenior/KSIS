import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root=new URL('../',import.meta.url);
const source=readFileSync(new URL('public/admin/registration-client.js',root),'utf8');
function client(origin) {
  const scripts=[];
  const ctx=vm.createContext({setTimeout:()=>1,clearTimeout(){},location:{origin},window:{},document:{createElement:()=>({}),head:{append:s=>scripts.push(s)}}});
  vm.runInContext(source,ctx);return {api:ctx.window.KSISRegistration,scripts};
}
test('official www admin and configured localhost origins can load Google auth',()=>{
  for(const origin of ['https://www.rebornsenior.com','http://localhost:3004','http://127.0.0.1:3004']) assert.equal(client(origin).scripts.length,1);
});
test('other origins cannot start authentication or load Google scripts',async()=>{
  for(const origin of ['https://example.com','https://www.rebornsenior.com.evil.test','http://127.0.0.1:8000']) {
    const c=client(origin);assert.equal(c.scripts.length,0);await assert.rejects(c.api.call({action:'list'}),/UNSUPPORTED_ORIGIN/);
  }
});
const js=ts.transpileModule(readFileSync(new URL('src/registration-link.ts',root),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {registrationLink}=await import('data:text/javascript,'+encodeURIComponent(js));
const form='https://docs.google.com/forms/d/e/test/viewform?entry.1=event';
test('calendar application link uses only the enabled form, never the related link',()=>{
  assert.equal(registrationLink({registrationEnabled:true,registrationForm:form,link:'https://cafe.naver.com/old'}),form);
  assert.equal(registrationLink({link:'https://cafe.naver.com/old'}),undefined);
  assert.equal(registrationLink({registrationEnabled:false,registrationForm:form}),undefined);
});
test('enabled events fail closed when the application form URL is missing or untrusted',()=>{
  for(const registrationForm of ['',undefined,'javascript:alert(1)','https://example.com/forms/d/e/test/viewform']) assert.equal(registrationLink({registrationEnabled:true,registrationForm}),undefined);
});
test('sample pages are excluded and manager requires a specific event',()=>{
  for(const name of ['shared-form-demo.html','registration-live.html','registration-live.js']) assert.equal(existsSync(new URL('public/admin/'+name,root)),false);
  const manager=readFileSync(new URL('public/admin/registration-manager.js',root),'utf8');
  const doc={body:{textContent:''}};
  vm.runInNewContext(manager,{location:{origin:'https://www.rebornsenior.com',search:''},URLSearchParams,document:doc});
  assert.equal(doc.body.textContent,'올바른 일정 연결이 아닙니다.');
});
