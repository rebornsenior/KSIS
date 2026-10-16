import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../public/admin/vendor/decap-cms-3.8.3.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('class RE extends'),source.indexOf('OE(RE,"propTypes"'));
class Component{
  constructor(props){this.props=props;}
  setState(next){Object.assign(this.state,typeof next==='function'?next(this.state):next);}
}
const Picker=new Function('o','OE',code+';return RE;')({Component},(instance,key,value)=>instance[key]=value);
test('album dialog toggles multiple thumbnails and inserts every selected path',()=>{
  let inserted,closed=false;
  const picker=new Picker({albumMultiple:true,field:{},insertMedia:paths=>inserted=paths,closeMediaLibrary:()=>closed=true});
  const a={key:'a',path:'/media/a.jpg'},b={key:'b',path:'/media/b.jpg'};
  picker.handleAssetClick(a);picker.handleAssetClick(b);
  assert.equal(picker.state.selectedFiles.length,2);
  picker.handleAssetClick(a);assert.deepEqual(picker.state.selectedFiles,[b]);
  picker.handleAssetClick(a);picker.handleInsert();
  assert.deepEqual(inserted,[b.path,a.path]);assert.equal(closed,true);
});
test('cover-image dialog still inserts only the last selected photo',()=>{
  let inserted;
  const picker=new Picker({albumMultiple:false,insertMedia:paths=>inserted=paths,closeMediaLibrary(){}});
  picker.handleAssetClick({key:'a',path:'/a.jpg'});picker.handleAssetClick({key:'b',path:'/b.jpg'});picker.handleInsert();
  assert.equal(inserted,'/b.jpg');
});
test('album dialog persists every file from a multi-file upload',async()=>{
  const uploaded=[];
  const picker=new Picker({albumMultiple:true,config:new Map(),field:{},persistMedia:async file=>{uploaded.push(file.name);return {payload:{file:{path:'/media/'+file.name}}};}});
  const target={files:[{name:'a.jpg'},{name:'b.jpg'}],value:'files'};
  await picker.handlePersist({persist(){},stopPropagation(){},preventDefault(){},target});
  assert.deepEqual(uploaded,['a.jpg','b.jpg']);assert.equal(picker.state.selectedFiles.length,2);assert.equal(target.value,null);
});
