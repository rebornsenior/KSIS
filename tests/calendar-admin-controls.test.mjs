import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/admin/setup.js',import.meta.url),'utf8');
function controls(connect){
  const widgets={};
  const window={createClass:definition=>definition,h:(type,props,...children)=>({type,props:props||{},children}),KSISRegistration:{connect}};
  vm.runInNewContext(source.slice(source.indexOf('  const AudienceControl ='),source.indexOf('  const RegistrationRosterControl =')),{window,CMS:{registerWidget:(name,control)=>widgets[name]=control}});
  return widgets;
}
function mount(control,value){const changes=[];const instance={...control,props:{value,onChange:value=>changes.push(value)},state:control.getInitialState?.()||{},setState(patch){Object.assign(this.state,patch);}};return {instance,changes};}
test('enabling registration connects first; cancellation never enables; disabling does not connect',async()=>{
  let count=0;const widget=controls(async()=>{count++;})['registration-enabled'];
  const {instance,changes}=mount(widget,false);
  await instance.render().children[0].props.onClick();
  assert.equal(count,1);assert.deepEqual(changes,[true]);
  instance.props.value=true;await instance.render().children[0].props.onClick();
  assert.equal(count,1);assert.deepEqual(changes,[true,false]);
  const failure=mount(controls(async()=>{throw Error('LOGIN_CANCELLED');})['registration-enabled'],false);
  await failure.instance.render().children[0].props.onClick();
  assert.equal(failure.changes.length,0);assert.equal(failure.instance.state.error,true);assert.equal(failure.instance.state.busy,false);
});
test('audience opens with an input and adds a plain input while preserving existing values',()=>{
  const widget=controls(async()=>{})['event-audience'];
  const {instance,changes}=mount(widget,[]);
  const tree=instance.render();assert.equal(tree.children[0].children[0].type,'input');
  tree.children[0].children[0].props.onChange({target:{value:'일반 참가자'}});
  assert.deepEqual([...changes[0]],['일반 참가자']);
  instance.props.value=['협회 회원'];instance.render().children.at(-1).props.onClick();
  assert.deepEqual([...changes.at(-1)],['협회 회원','']);
});
