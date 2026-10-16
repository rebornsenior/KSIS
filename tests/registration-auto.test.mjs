import {createHash,webcrypto} from 'node:crypto';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../google-apps-script/registration/Code.gs',import.meta.url),'utf8');
function fixture({email='owner@example.com',failChoices=false}={}) {
  const seed={formId:'2026',eventItemId:'1',nameItemId:'2',phoneItemId:'3',payerItemId:'4',eventValue:'2026-forum-37 | 원래 행사명',readers:['owner@example.com'],deleters:['owner@example.com']};
  const properties=new Map([['KSIS_REGISTRATION',JSON.stringify({events:{'2026-forum-37':seed}})]]);
  const forms=new Map(); let created=0,sequence=0;
  function form(id) {
    const items=[];
    function add(type) {
      const item={id:String(++sequence),type,title:'',choices:[],setTitle(value){this.title=value;return this;},setRequired(){return this;},getId(){return this.id;},getTitle(){return this.title;},getType(){return this.type;},asListItem(){return this;},getChoices(){return this.choices.map(value=>({getValue:()=>value}));},setChoiceValues(values){if(failChoices){failChoices=false;throw Error('RETRY');}this.choices=values;return this;},createResponse:value=>({value})};
      items.push(item); return item;
    }
    const f={getId:()=>id,getItems:()=>items,addListItem:()=>add('LIST'),addTextItem:()=>add('TEXT'),getItemById:id=>items.find(item=>item.id===String(id)),createResponse:()=>({withItemResponse:response=>({toPrefilledUrl:()=>`https://docs.google.com/forms/d/e/${id}/viewform?entry.1=${encodeURIComponent(response.value)}`})}),responses:[],getResponses:()=>f.responses,setDescription(){},setCollectEmail(){},setLimitOneResponsePerUser(){},setPublishingSummary(){},setPublished(){},accepting:true,setAcceptingResponses(value){this.accepting=value;}};
    forms.set(id,f);return f;
  }
  const base=form('2026');
  base.addListItem().setTitle('참가할 행사').setChoiceValues([seed.eventValue]);
  for(const title of ['신청자 이름','전화번호','입금자명'])base.addTextItem().setTitle(title);
  const ctx=vm.createContext({Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(_,value)=>Array.from(createHash('sha256').update(value).digest())},Session:{getActiveUser:()=>({getEmail:()=>email})},PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties.get(key)||null,setProperty:(key,value)=>properties.set(key,value)})},FormApp:{openById:id=>forms.get(id),create:()=>form('new-'+ ++created)},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})}});
  vm.runInContext(source+'\n'+readFileSync(new URL('../google-apps-script/registration/SyncForum37.gs',import.meta.url),'utf8'),ctx);
  return {run:request=>ctx.ksisRegistration(request),initialize:()=>ctx.setupRegistrationAutomation(),created:()=>created,base,forms,properties,migrate:()=>ctx.updateExistingRegistrationLabels(),refreshForum:()=>ctx.updateForum37Details(),setFail:()=>{failChoices=true;}};
}
const sync={action:'sync',eventId:'evt-new',category:'education',title:'다음 행사',date:'2026-12-30'};
test('initialization retains existing permissions and 2026 form',()=>{const f=fixture();f.initialize();f.run(sync);assert.equal(f.created(),0);assert.equal(f.base.getItems()[0].getChoices().length,2);});
test('2027 event uses 2027 even when registered earlier; retries reuse the form and choice',()=>{const f=fixture();f.initialize();const request={...sync,date:'2027-01-02'};const a=f.run(request);const b=f.run(request);assert.equal(a.year,'2027');assert.equal(a.registrationForm,b.registrationForm);assert.equal(f.created(),1);});
test('unauthorized caller cannot create forms or bootstrap access',()=>{const f=fixture({email:'other@example.com'});assert.throws(()=>f.initialize(),/FORBIDDEN/);assert.throws(()=>f.run(sync),/AUTOMATION_NOT_CONFIGURED/);assert.equal(f.created(),0);});
test('title edit updates visible label and preserves the prior answer as an alias',()=>{const f=fixture();f.initialize();f.run(sync);const before=JSON.parse(f.properties.get('KSIS_EVENT_evt-new'));f.run({...sync,title:'수정한 제목'});const after=JSON.parse(f.properties.get('KSIS_EVENT_evt-new'));assert.equal(after.eventValue,'2026.12.30 | 교육 특강 | "수정한 제목"');assert.ok(after.previousValues.includes(before.eventValue));assert.equal(f.base.getItems()[0].getChoices().length,2);});
test('moving a linked event between years stops without creating another form',()=>{const f=fixture();f.initialize();f.run(sync);assert.throws(()=>f.run({...sync,date:'2027-01-02'}),/EVENT_YEAR_CHANGED/);assert.equal(f.created(),0);});
test('failed option update can retry without duplicate annual forms',()=>{const f=fixture();f.initialize();f.setFail();assert.throws(()=>f.run({...sync,date:'2027-01-02'}),/RETRY/);f.run({...sync,date:'2027-01-02'});assert.equal(f.created(),1);});
test('invalid date never creates a form',()=>{const f=fixture();f.initialize();assert.throws(()=>f.run({...sync,date:'2027-02-30'}),/INVALID_EVENT_DATE/);assert.equal(f.created(),0);});

test('closing an event keeps its mapping and removes only its own dropdown choice',()=>{const f=fixture();f.initialize();f.run(sync);f.run({...sync,enabled:false});assert.equal(f.base.getItems()[0].getChoices().length,1);assert.equal(JSON.parse(f.properties.get('KSIS_EVENT_evt-new')).enabled,false);f.run(sync);assert.equal(f.base.getItems()[0].getChoices().length,2);});
test('missing automation initialization stops before creating any Google form',()=>{const f=fixture();assert.throws(()=>f.run(sync),/AUTOMATION_NOT_CONFIGURED/);assert.equal(f.created(),0);});

function responseFor(form,value,id='test-response') {
  return {getId:()=>id,getTimestamp:()=>new Date('2026-10-16T00:00:00Z'),getItemResponses:()=>form.getItems().map((item,index)=>({getItem:()=>item,getResponse:()=>index===0?value:index===1?'가상 신청자':'테스트'}))};
}
test('new dropdown label contains date, category and title, never the internal event ID',()=>{const f=fixture();f.initialize();f.run(sync);const event=JSON.parse(f.properties.get('KSIS_EVENT_evt-new'));assert.equal(event.eventValue,'2026.12.30 | 교육 특강 | "다음 행사"');assert.ok(!event.eventValue.includes(sync.eventId));});
test('legacy label migration retains existing responses and removes the ID from the dropdown',()=>{const f=fixture();f.initialize();const oldValue=f.base.getItems()[0].getChoices()[0].getValue();f.base.responses.push(responseFor(f.base,oldValue));f.run({...sync,eventId:'2026-forum-37',category:'forum',title:'제37회 비즈니스교류회',date:'2026-11-07'});assert.equal(f.run({action:'list',eventId:'2026-forum-37'}).records.length,1);assert.equal(f.base.getItems()[0].getChoices()[0].getValue(),'2026.11.07 | 정기 포럼 | "제37회 비즈니스교류회"');});
test('responses submitted under both old and new labels stay in the same event roster',()=>{const f=fixture();f.initialize();f.run(sync);const oldValue=JSON.parse(f.properties.get('KSIS_EVENT_evt-new')).eventValue;f.base.responses.push(responseFor(f.base,oldValue,'old'));f.run({...sync,title:'바뀐 행사명'});const newValue=JSON.parse(f.properties.get('KSIS_EVENT_evt-new')).eventValue;f.base.responses.push(responseFor(f.base,newValue,'new'));assert.equal(f.run({action:'list',eventId:sync.eventId}).records.length,2);});
test('two events cannot claim identical date/title labels, including historical labels',()=>{const f=fixture();f.initialize();f.run(sync);assert.throws(()=>f.run({...sync,eventId:'evt-other'}),/EVENT_LABEL_CONFLICT/);f.run({...sync,title:'수정된 제목'});assert.throws(()=>f.run({...sync,eventId:'evt-other'}),/EVENT_LABEL_CONFLICT/);});
test('all calendar categories produce the exact visible date/category/title format',()=>{
  const labels={forum:'정기 포럼',education:'교육 특강',monetize:'수익 실무',other:'친목 소모임'};
  for(const [category,label] of Object.entries(labels)) {
    const f=fixture();f.initialize();const info=f.run({...sync,category});
    assert.equal(f.base.getItems()[0].getChoices()[1].getValue(),'2026.12.30 | '+label+' | '+JSON.stringify('다음 행사'));
    assert.equal(info.labelVersion,2);assert.equal(info.category,category);
  }
});
test('changing category preserves old and new responses and closing removes the choice',()=>{
  const f=fixture();f.initialize();f.run(sync);
  const old=JSON.parse(f.properties.get('KSIS_EVENT_evt-new')).eventValue;
  f.base.responses.push(responseFor(f.base,old,'before'));
  f.run({...sync,category:'other'});
  const current=JSON.parse(f.properties.get('KSIS_EVENT_evt-new')).eventValue;
  f.base.responses.push(responseFor(f.base,current,'after'));
  assert.equal(f.run({action:'list',eventId:'evt-new'}).records.length,2);
  f.run({...sync,enabled:false});
  assert.ok(!f.base.getItems()[0].getChoices().some(c=>[old,current].includes(c.getValue())));
  assert.equal(f.base.responses.length,2);
});
test('unknown category cannot create or mutate a form',()=>{
  const f=fixture();f.initialize();assert.throws(()=>f.run({...sync,category:'unknown'}),/INVALID_EVENT_CATEGORY/);
  assert.equal(f.base.getItems()[0].getChoices().length,1);assert.equal(f.created(),0);
});
test('one-time legacy label refresh is repeatable and keeps original responses',()=>{
  const f=fixture();f.initialize();const old=f.base.getItems()[0].getChoices()[0].getValue();
  f.base.responses.push(responseFor(f.base,old));f.migrate();f.migrate();
  assert.equal(f.base.getItems()[0].getChoices().length,1);
  assert.equal(f.base.getItems()[0].getChoices()[0].getValue(),'2026.11.07 | 정기 포럼 | "제37회 비즈니스교류회"');
  assert.equal(f.run({action:'list',eventId:'2026-forum-37'}).records.length,1);
});

test('37th forum title update reuses the existing event and preserves old responses',()=>{
  const f=fixture();f.initialize();
  const old=f.base.getItems()[0].getChoices()[0].getValue();
  f.base.responses.push(responseFor(f.base,old));
  f.refreshForum();f.refreshForum();
  const event=JSON.parse(f.properties.get('KSIS_EVENT_2026-forum-37'));
  assert.equal(event.title,'김형환 교수 "1인기업 시대로의 변화, 역발상적 경영리더십 분석"');
  assert.ok(event.previousValues.includes(old));
  assert.equal(f.base.getItems()[0].getChoices().length,1);
  assert.equal(f.run({action:'list',eventId:'2026-forum-37'}).records.length,1);
  assert.equal(f.created(),0);
});

class CmsData {
  constructor(value){this.value=value;}
  get(key){return this.value[key];}
  set(key,value){return new CmsData({...this.value,[key]:value});}
  delete(key){const value={...this.value};delete value[key];return new CmsData(value);}
  toJS(){return {...this.value};}
}
const cmsSource=readFileSync(new URL('../public/admin/setup.js',import.meta.url),'utf8');
function editorFor(backend) {
  const hooks={};
  const context={localMode:true,URL,TextEncoder,Uint8Array,crypto:webcrypto,
    CMS:{registerEventListener:({name,handler})=>{hooks[name]=handler;}},
    window:{addEventListener(){},alert(){},KSISRegistration:{call:async request=>backend.run(request)}}};
  vm.runInNewContext(cmsSource.slice(cmsSource.indexOf('  let pendingRegistrationId='),cmsSource.indexOf('  const alignField =')),context);
  return {async save(value,metadata={}) {
    const data=value instanceof CmsData?value:new CmsData(value);
    const entry={get:key=>key==='collection'?'calendar':key==='data'?data:metadata[key]};
    const saved=await hooks.preSave({entry});
    await hooks.prePublish({entry:{get:key=>key==='data'?saved:entry.get(key)}});
    return saved;
  }};
}
test('Decap save/publish applies on/off/on and edits to every category for both new and existing schedules',async()=>{
  for(const newRecord of [true,false]) for(const category of ['forum','education','monetize','other']) {
    const f=fixture();f.initialize();
    const metadata={newRecord,path:'src/content/calendar/arbitrary-event.json'};
    let saved=await editorFor(f).save({title:'일반 행사',date:'2026-12-30',category,registrationEnabled:true},metadata);
    const eventId=saved.get('registrationEventId');
    assert.notEqual(eventId,'2026-forum-37');
    let event=JSON.parse(f.properties.get('KSIS_EVENT_'+eventId));
    f.base.responses.push(responseFor(f.base,event.eventValue));
    saved=await editorFor(f).save(saved.set('registrationEnabled',false),{...metadata,newRecord:false});
    assert.ok(!f.base.getItems()[0].getChoices().some(choice=>choice.getValue()===event.eventValue));
    assert.equal(saved.get('registrationForm'),'');
    saved=await editorFor(f).save(saved.set('registrationEnabled',true).set('title','수정 제목').set('date','2026-12-29'),{...metadata,newRecord:false});
    assert.equal(saved.get('registrationEventId'),eventId);
    event=JSON.parse(f.properties.get('KSIS_EVENT_'+eventId));
    assert.ok(event.eventValue.startsWith('2026.12.29 | '));
    assert.equal(f.run({action:'list',eventId}).records.length,1);
    assert.equal(f.base.getItems()[0].getChoices().filter(choice=>choice.getValue()===event.eventValue).length,1);
  }
});
test('turning off the last event removes its name, closes the form and re-enabling removes the placeholder',async()=>{
  const f=fixture();f.initialize();f.base.getItems()[0].setChoiceValues([]);
  const editor=editorFor(f);
  let saved=await editor.save({title:'마지막 행사',date:'2026-12-30',category:'forum',registrationEnabled:true},{path:'last.json',newRecord:false});
  const eventId=saved.get('registrationEventId');
  const label=JSON.parse(f.properties.get('KSIS_EVENT_'+eventId)).eventValue;
  f.base.responses.push(responseFor(f.base,label));
  saved=await editor.save(saved.set('registrationEnabled',false));
  assert.equal(f.base.accepting,false);
  assert.deepEqual(Array.from(f.base.getItems()[0].getChoices(),choice=>choice.getValue()),['현재 신청 가능한 행사가 없습니다']);
  saved=await editor.save(saved.set('registrationEnabled',true));
  assert.equal(f.base.accepting,true);
  assert.deepEqual(Array.from(f.base.getItems()[0].getChoices(),choice=>choice.getValue()),[label]);
  assert.equal(f.run({action:'list',eventId}).records.length,1);
});
