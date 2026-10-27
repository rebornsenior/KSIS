import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
const root=new URL('../',import.meta.url);
const source=readFileSync(new URL('google-apps-script/registration/Code.gs',root),'utf8')+'\n'+readFileSync(new URL('google-apps-script/registration/PerEvent.gs',root),'utf8');
function fixture(){
  const properties=new Map([['KSIS_AUTOMATION',JSON.stringify({managers:['owner'],readers:['owner'],deleters:['owner']})],['KSIS_REGISTRATION','{"events":{}}']]);
  const files=new Map(),forms=new Map(),folders=new Map();let id=0,email='owner',failMove=false,failTrash=false,failChoice=false;
  const iterator=items=>{let index=0;return {hasNext:()=>index<items.length,next:()=>items[index++]};};
  function folder(name,parent){const item={id:'folder-'+(++id),name,parent,isTrashed:()=>false,getId(){return this.id;},createFolder(name){return folder(name,this.id);},getFoldersByName(name){return iterator([...folders.values()].filter(f=>f.parent===this.id&&f.name===name));}};folders.set(item.id,item);return item;}
  function createForm(title){
    const formId='form-'+(++id),items=[];
    const file={trashed:false,getId:()=>formId,isTrashed(){return this.trashed;},setTrashed(value){if(failTrash)throw Error('TRASH_FAILED');this.trashed=value;return this;},moveTo(folder){if(failMove)throw Error('MOVE_FAILED');this.parent=folder.getId();return this;},setName(name){this.name=name;return this;}};files.set(formId,file);
    const form={id:formId,title,responses:[],accepting:false,getId:()=>formId,getItems:()=>items,getItemById:key=>items.find(item=>item.id===String(key)),
      add(type){const item={id:String(++id),type,title:'',choices:[],getId(){return this.id;},getType(){return this.type;},getTitle(){return this.title;},setTitle(value){this.title=value;return this;},setRequired(){return this;},asListItem(){return this;},setChoiceValues(values){if(failChoice)throw Error('CHOICE_FAILED');this.choices=values;return this;},getChoices(){return this.choices.map(value=>({getValue:()=>value}));},createResponse:value=>({value})};items.push(item);return item;},
      addListItem(){return this.add('LIST');},addTextItem(){return this.add('TEXT');},setTitle(value){this.title=value;},setDescription(){},setCollectEmail(){},setLimitOneResponsePerUser(){},setPublishingSummary(){},setPublished(){},setAcceptingResponses(value){this.accepting=value;},
      getResponses(){return this.responses;},getResponse(key){return this.responses.find(r=>r.getId()===key);},deleteResponse(key){this.responses=this.responses.filter(r=>r.getId()!==key);},createResponse(){return {withItemResponse(){return this;},toPrefilledUrl:()=>`https://docs.google.com/forms/d/${formId}/viewform`};}};forms.set(formId,form);return form;
  }
  const ctx={console,PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties.get(key)||null,setProperty:(key,value)=>properties.set(key,value)})},Session:{getActiveUser:()=>({getEmail:()=>email})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},FormApp:{create:createForm,openById:key=>{if(!forms.has(key)||files.get(key).trashed)throw Error('FORM_UNAVAILABLE');return forms.get(key);}},DriveApp:{createFolder:name=>folder(name,null),getFolderById:key=>folders.get(key),getFileById:key=>files.get(key)}};
  vm.runInNewContext(source,ctx);
  const event=key=>JSON.parse(properties.get('KSIS_EVENT_'+key));
  function addResponse(event,id='response'){
    const values={[event.eventItemId]:event.eventValue,[event.nameItemId]:'테스트 이름',[event.phoneItemId]:'테스트 번호',[event.payerItemId]:'테스트 입금자'};
    forms.get(event.formId).responses.push({getId:()=>id,getTimestamp:()=>new Date('2026-10-27T00:00:00Z'),getItemResponses:()=>Object.entries(values).map(([key,value])=>({getItem:()=>({getId:()=>key}),getResponse:()=>value}))});
  }
  return {run:r=>ctx.ksisRegistration(r),event,properties,forms,files,folders,createForm,addResponse,setEmail:value=>email=value,failMove:value=>failMove=value,failTrash:value=>failTrash=value,failChoice:value=>failChoice=value};
}
const request={action:'sync',formStructure:'per-event',eventId:'event-1',title:'행사',date:'2027-01-15',category:'forum',enabled:true};
test('per-event forms use year/month folders and prepare all 12 months; retries and edits reuse the form',()=>{
  const f=fixture();const info=f.run(request);assert.equal(info.schemaVersion,3);
  assert.equal(f.forms.size,1);assert.equal(f.folders.size,14);
  const event=f.event('event-1'),file=f.files.get(event.formId);assert.equal(f.folders.get(file.parent).name,'01월');
  f.run({...request,title:'수정 행사',date:'2028-02-20'});assert.equal(f.forms.size,1);assert.equal(f.event('event-1').formId,event.formId);assert.equal(f.folders.get(file.parent).name,'02월');
  assert.equal(f.folders.get(f.folders.get(file.parent).parent).name,'2028');
  f.run({...request,eventId:'event-2'});assert.equal(f.forms.size,2);assert.notEqual(f.event('event-2').formId,event.formId);
});
test('disable trashes only the event form, retry is idempotent, re-enable restores the same form and responses',()=>{
  const f=fixture();f.run(request);f.run({...request,eventId:'event-2'});const event=f.event('event-1');f.addResponse(event);
  f.run({...request,enabled:false});assert.equal(f.files.get(event.formId).trashed,true);assert.equal(f.files.get(f.event('event-2').formId).trashed,false);
  f.run({...request,enabled:false});assert.equal(f.forms.size,2);
  f.run(request);assert.equal(f.event('event-1').formId,event.formId);assert.equal(f.forms.get(event.formId).responses.length,1);assert.equal(f.files.get(event.formId).trashed,false);
});
test('partial form preparation retries without duplication and trash failure blocks success',()=>{
  const f=fixture();f.failMove(true);assert.throws(()=>f.run(request),/MOVE_FAILED/);assert.equal(f.forms.size,1);f.failMove(false);f.failChoice(true);assert.throws(()=>f.run(request),/CHOICE_FAILED/);f.failChoice(false);f.run(request);assert.equal(f.forms.size,1);
  f.failTrash(true);assert.throws(()=>f.run({...request,enabled:false}),/TRASH_FAILED/);assert.equal(f.event('event-1').enabled,true);f.failTrash(false);f.run({...request,enabled:false});assert.equal(f.files.get(f.event('event-1').formId).trashed,true);
});
test('signed-out/unauthorized callers and invalid event dates never create forms',()=>{
  const f=fixture();f.setEmail('stranger');assert.throws(()=>f.run(request),/FORBIDDEN/);f.setEmail('');assert.throws(()=>f.run(request),/SIGN_IN_REQUIRED/);f.setEmail('owner');assert.throws(()=>f.run({...request,date:'2027-02-30'}),/INVALID_EVENT_DATE/);assert.equal(f.forms.size,0);
});
test('migration preserves shared form and old roster, removes only the old choice and routes response deletion correctly',()=>{
  const f=fixture(),form=f.createForm('공용');const eventItem=form.addListItem().setTitle('참가할 행사').setChoiceValues(['old','other']);
  const legacy={formId:form.getId(),eventItemId:eventItem.getId(),eventValue:'old',nameItemId:form.addTextItem().getId(),phoneItemId:form.addTextItem().getId(),payerItemId:form.addTextItem().getId(),readers:['owner'],deleters:['owner'],year:'2027'};
  f.properties.set('KSIS_EVENT_event-1',JSON.stringify(legacy));f.addResponse(legacy,'old-response');f.run(request);
  const current=f.event('event-1');f.addResponse(current,'new-response');assert.equal(f.files.get(legacy.formId).trashed,false);assert.deepEqual(eventItem.choices,['other']);
  const roster=f.run({action:'list',eventId:'event-1'}).records;assert.equal(roster.length,2);
  const old=roster.find(r=>r.id==='1:old-response');assert.ok(old);
  f.run({action:'delete',eventId:'event-1',responseId:old.id,confirmDelete:true,expectedName:old.name,expectedSubmittedAt:old.submittedAt});assert.equal(form.responses.length,0);assert.equal(f.forms.get(current.formId).responses.length,1);
});
