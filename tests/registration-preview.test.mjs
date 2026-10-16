import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const setup=readFileSync(new URL('../public/admin/setup.js',import.meta.url),'utf8');
const start=setup.indexOf('  const RegistrationFormControl');
const end=setup.indexOf("  CMS.registerWidget('registration-form'",start);
const context=vm.createContext({URL,window:{createClass:component=>component,h:(tag,props,...children)=>({tag,props,children})}});
vm.runInContext(setup.slice(start,end)+'\nthis.control=RegistrationFormControl;',context);
const nodes=tree=>[tree,...tree.children.filter(value=>value && typeof value==='object').flatMap(nodes)];
test('embedded registration preview cannot be focused or submitted from the editor',()=>{
  const tree=context.control.render.call({props:{value:'https://docs.google.com/forms/d/e/test/viewform',onChange(){}}});
  const all=nodes(tree),frame=all.find(node=>node.tag==='iframe');
  assert.equal(frame.props.tabIndex,-1);
  assert.ok(!frame.props.sandbox.split(' ').includes('allow-forms'));
  assert.ok(all.some(node=>node.props?.inert===true && node.children.includes(frame)));
  assert.ok(!all.some(node=>node.tag==='input' && ['name','phone','payer'].includes(node.props.name)));
  assert.equal(all.find(node=>node.tag==='a').props.target,'_blank');
});
test('untrusted URLs cannot create a preview frame or an external action link',()=>{
  for(const value of ['javascript:alert(1)','https://example.com/forms/d/e/test/viewform']) {
    const all=nodes(context.control.render.call({props:{value,onChange(){}}}));
    assert.ok(!all.some(node=>node.tag==='iframe' || node.tag==='a'));
  }
});

test('preview never loads Google, cookies or saved drafts; real application link stays intact',()=>{
  const value='https://docs.google.com/forms/d/e/test/viewform?usp=pp_url&entry.123='+encodeURIComponent('2026.11.07 | 정기 포럼 | "행사 <img src=x onerror=alert(1)>"');
  const all=nodes(context.control.render.call({props:{value,onChange(){}}}));
  const frame=all.find(node=>node.tag==='iframe');
  assert.equal(frame.props.src,undefined);
  assert.equal(frame.props.sandbox,'');
  assert.ok(frame.props.srcDoc.includes('Content-Security-Policy'));
  assert.ok(frame.props.srcDoc.includes('default-src &#39;none&#39;'));
  assert.ok(frame.props.srcDoc.includes('&lt;img'));
  assert.ok(!frame.props.srcDoc.includes('<img'));
  assert.ok(!frame.props.srcDoc.includes('<script'));
  assert.ok(!frame.props.srcDoc.includes('<form'));
  for(const label of ['참가할 행사','신청자 이름','전화번호','입금자명']) assert.ok(frame.props.srcDoc.includes(label));
  assert.equal(all.find(node=>node.tag==='a').props.href,value);
});
