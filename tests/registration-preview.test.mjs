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

test('preview isolates Google login/drafts and strips prefills without changing the actual application link',()=>{
  const value='https://docs.google.com/forms/d/e/test/viewform?usp=pp_url&entry.123=old-answer&authuser=0#draft';
  const all=nodes(context.control.render.call({props:{value,onChange(){}}}));
  const frame=all.find(node=>node.tag==='iframe');
  assert.equal(frame.props.credentialless,'');
  const preview=new URL(frame.props.src);
  assert.equal(preview.search,'?embedded=true');
  assert.equal(all.find(node=>node.tag==='a').props.href,value);
  assert.ok(!frame.props.sandbox.includes('allow-forms'));
});
