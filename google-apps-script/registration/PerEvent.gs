/** Per-event forms. Helpers are private to scripts.run. */
function ksisSyncPerEvent_(request,email) {
  const store=PropertiesService.getScriptProperties();
  const access=JSON.parse(store.getProperty('KSIS_AUTOMATION') || '{}');
  if(!Array.isArray(access.managers)) throw new Error('AUTOMATION_NOT_CONFIGURED');
  if(!access.managers.includes(email)) throw new Error('FORBIDDEN');
  if(typeof request.eventId!=='string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(request.eventId)) throw new Error('INVALID_EVENT_ID');
  if(typeof request.enabled!=='boolean') throw new Error('INVALID_ACTION');
  if(typeof request.title!=='string' || !request.title.trim() || request.title.length>200) throw new Error('INVALID_EVENT_TITLE');
  if(typeof request.date!=='string' || !/^20\d{2}-\d{2}-\d{2}$/.test(request.date) || new Date(request.date+'T00:00:00Z').toISOString().slice(0,10)!==request.date) throw new Error('INVALID_EVENT_DATE');
  const labels={forum:'정기 포럼',education:'교육 특강',monetize:'수익 실무',other:'친목 소모임'};
  if(request.category!==undefined && !Object.prototype.hasOwnProperty.call(labels,request.category)) throw new Error('INVALID_EVENT_CATEGORY');
  const feeRows=ksisNormalizeFees_(request.participationFee);
  const questions=ksisNormalizeQuestions_(request.registrationQuestions);
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    const config=JSON.parse(store.getProperty('KSIS_REGISTRATION') || '{}');
    const key='KSIS_EVENT_'+request.eventId;
    let event=JSON.parse(store.getProperty(key) || 'null') || (config.events || {})[request.eventId];
    const year=request.date.slice(0,4), month=request.date.slice(5,7);
    if(!request.enabled) {
      if(event?.structure==='per-event') {
        // A confirmed closure must remain retryable even when the trashed file
        // can no longer be retrieved by Drive for the current caller.
        if(event.enabled===false && event.trashed===true) {
          return {eventId:request.eventId,disabled:true,year,schemaVersion:4};
        }
        const file=DriveApp.getFileById(event.formId);
        let trashDenied=false;
        if(!file.isTrashed()) {
          FormApp.openById(event.formId).setAcceptingResponses(false);
          try {file.setTrashed(true);} catch(error) {
            // Editors can close a shared form but only its owner can trash it.
            // Keep closure successful; never claim the file was trashed.
            if(!/access denied|permission|권한/i.test(String(error.message || error))) throw error;
            trashDenied=true;
          }
        }
        if(!file.isTrashed() && !trashDenied)throw new Error('TRASH_NOT_CONFIRMED');
        event.enabled=false;event.trashed=file.isTrashed();event.trashPending=!event.trashed;
        store.setProperty(key,JSON.stringify(event));
      } else if(event) {
        // Shared annual forms contain other events: remove only this option.
        ksisRetireAnnual_(event,request.eventId,store);
        event.enabled=false;store.setProperty(key,JSON.stringify(event));
      }
      return {eventId:request.eventId,disabled:true,year,schemaVersion:4,trashPending:event?.trashPending===true};
    }
    if(!event || event.structure!=='per-event') {
      const archives=event ? [event] : [];
      const form=FormApp.create(ksisFormTitle_(request.date,request.title),false);
      event={structure:'per-event',formId:form.getId(),archivedForms:archives,readers:access.readers || access.managers,deleters:access.deleters || access.managers,enabled:false,ready:false};
      store.setProperty(key,JSON.stringify(event));
    }
    const file=DriveApp.getFileById(event.formId);
    // Re-enable restores the same form and its responses, never creates a duplicate.
    if(file.isTrashed()) file.setTrashed(false);
    const form=FormApp.openById(event.formId);
    const folder=ksisEventFolder_(store,year,month);
    file.moveTo(folder);
    file.setName(ksisFormTitle_(request.date,request.title));
    form.setTitle(ksisFormTitle_(request.date,request.title));
    const eventItemTitle='참가할 행사';
    if(!event.eventItemId) {
      const matches=form.getItems().filter(item=>item.getTitle()===eventItemTitle && String(item.getType())==='LIST');
      if(matches.length>1)throw new Error('AMBIGUOUS_FORM_ITEMS');
      const item=matches[0] || form.addListItem().setTitle(eventItemTitle).setRequired(true);
      event.eventItemId=String(item.getId());store.setProperty(key,JSON.stringify(event));
    }
    const core=[['name','nameItemId','신청자 이름'],['phone','phoneItemId','전화번호'],['payer','payerItemId','입금자명']];
    for(const [id,field,legacyTitle] of core) {
      const question=questions.find(item=>item.id===id);
      if(!event[field]) {
        const matches=form.getItems().filter(item=>item.getTitle()===legacyTitle && String(item.getType())==='TEXT');
        if(matches.length>1)throw new Error('AMBIGUOUS_FORM_ITEMS');
        const item=matches[0] || form.addTextItem();
        event[field]=String(item.getId());store.setProperty(key,JSON.stringify(event));
      }
      form.getItemById(Number(event[field])).asTextItem().setTitle(question.title).setHelpText(question.help).setRequired(question.required);
    }
    ksisSyncExtraQuestions_(form,event,questions,store,key);
    ksisSyncFeeItem_(form,event,feeRows,store,key);
    const category=request.category || event.category || 'other';
    const label=request.date.replace(/-/g,'.')+' | '+labels[category]+' | '+JSON.stringify(request.title.trim());
    event.previousValues=Array.from(new Set([...(event.previousValues || []),event.eventValue].filter(value=>value && value!==label)));
    event.eventValue=label;event.year=year;event.month=month;event.date=request.date;event.title=request.title.trim();event.category=category;event.participationFee=feeRows;event.registrationQuestions=questions;event.labelVersion=2;event.folderId=folder.getId();
    store.setProperty(key,JSON.stringify(event));
    form.getItemById(Number(event.eventItemId)).asListItem().setChoiceValues([label]);
    for(const old of event.archivedForms || []) {
      if(old.enabled!==false){ksisRetireAnnual_(old,request.eventId,store);old.enabled=false;}
    }
    const feeText=feeRows.length ? '\n\n참가비 안내\n'+feeRows.map(row=>'- '+row.grade+': '+row.amount.toLocaleString('ko-KR')+'원'+(row.note?' ('+row.note+')':'')).join('\n') : '\n\n참가비가 없는 행사입니다.';
    form.setDescription('이 행사 전용 참가 신청서입니다. 신청자 이름, 전화번호, 입금자명을 입력해 주세요. 무료 참가 대상자는 입금자명에 ‘해당 없음’을 입력해 주세요.'+feeText);
    form.setCollectEmail(false);form.setLimitOneResponsePerUser(false);form.setPublishingSummary(false);
    form.setPublished(true);form.setAcceptingResponses(true);
    event.enabled=true;event.trashed=false;event.trashPending=false;event.ready=true;
    store.setProperty(key,JSON.stringify(event));
    return ksisEventInfo_(request.eventId,event,form);
  } finally {lock.releaseLock();}
}

function ksisNormalizeFees_(value) {
  if(!Array.isArray(value)) return [];
  if(value.length>20)throw new Error('TOO_MANY_FEES');
  return value.map(row=>{
    const grade=String(row?.grade || '').trim(),raw=String(row?.amount ?? '').trim(),amount=Number(raw),note=String(row?.note || '').trim();
    if(!grade || grade.length>100 || raw==='' || !Number.isFinite(amount) || amount<0 || amount>100000000 || note.length>300)throw new Error('INVALID_FEE');
    return {grade,amount,note};
  });
}
function ksisNormalizeQuestions_(value) {
  const defaults=[{id:'name',type:'text',title:'신청자 이름',required:true},{id:'phone',type:'text',title:'전화번호',required:true},{id:'payer',type:'text',title:'입금자명',required:false}];
  if(value===undefined || value===null)return defaults.map(item=>({...item,help:'',options:[]}));
  if(!Array.isArray(value) || value.length>20)throw new Error('INVALID_QUESTIONS');
  const seen=new Set();
  const questions=value.map(item=>{
    const id=String(item?.id || ''),type=String(item?.type || ''),title=String(item?.title || '').trim(),help=String(item?.help || '').trim();
    const required=item?.required!==false;
    if(!/^(?:name|phone|payer|q-[a-zA-Z0-9-]{1,70})$/.test(id) || seen.has(id) || !['text','paragraph','select','checkbox'].includes(type) || !title || title.length>150 || help.length>500)throw new Error('INVALID_QUESTIONS');
    seen.add(id);

    const options=['select','checkbox'].includes(type) ? item.options : [];
    if(!Array.isArray(options) || options.length>30 || (['select','checkbox'].includes(type) && options.length<2))throw new Error('INVALID_QUESTION_OPTIONS');
    const cleanOptions=options.map(option=>String(option).trim());
    if(cleanOptions.some(option=>!option || option.length>150) || new Set(cleanOptions).size!==cleanOptions.length)throw new Error('INVALID_QUESTION_OPTIONS');
    return {id,type,title,help,required,options:cleanOptions};
  });

  return questions;
}
function ksisSyncExtraQuestions_(form,event,questions,store,key) {
  const saved=event.questionItems || {};
  const extras=questions.filter(item=>!['name','phone','payer'].includes(item.id));
  const ids=new Set(extras.map(item=>item.id));
  for(const id of Object.keys(saved)) {
    if(ids.has(id))continue;
    const old=form.getItems().find(item=>String(item.getId())===String(saved[id].itemId));
    if(old)form.deleteItem(old);
    delete saved[id];event.questionItems=saved;store.setProperty(key,JSON.stringify(event));
  }
  const types={text:'TEXT',paragraph:'PARAGRAPH_TEXT',select:'LIST',checkbox:'CHECKBOX'};
  const create={text:()=>form.addTextItem(),paragraph:()=>form.addParagraphTextItem(),select:()=>form.addListItem(),checkbox:()=>form.addCheckboxItem()};
  for(const question of extras) {
    let mapping=saved[question.id];
    let item=mapping && form.getItems().find(found=>String(found.getId())===String(mapping.itemId));
    if(item && String(item.getType())!==types[question.type]) {
      form.deleteItem(item);item=null;delete saved[question.id];store.setProperty(key,JSON.stringify(event));
    }
    if(!item) {
      item=create[question.type]();saved[question.id]={itemId:String(item.getId()),type:question.type};
      event.questionItems=saved;store.setProperty(key,JSON.stringify(event));
    }
    item=question.type==='text'?item.asTextItem():question.type==='paragraph'?item.asParagraphTextItem():question.type==='select'?item.asListItem():item.asCheckboxItem();
    item.setTitle(question.title).setHelpText(question.help).setRequired(question.required);
    if(question.type==='select' || question.type==='checkbox')item.setChoiceValues(question.options);
  }
  event.questionItems=saved;
}
function ksisSyncFeeItem_(form,event,fees,store,key) {
  let item=event.feeItemId && form.getItems().find(found=>String(found.getId())===String(event.feeItemId));
  if(!fees.length) {
    if(item)form.deleteItem(item);
    delete event.feeItemId;store.setProperty(key,JSON.stringify(event));return;
  }
  if(!item) {
    item=form.addListItem();event.feeItemId=String(item.getId());store.setProperty(key,JSON.stringify(event));
  }
  item=item.asListItem();
  item.setTitle('회원 등급 / 참가 유형').setHelpText('본인의 등급을 선택하면 해당 참가비와 안내 사항을 확인할 수 있습니다.').setRequired(true);
  item.setChoiceValues(fees.map(fee=>fee.grade+' · '+fee.amount.toLocaleString('ko-KR')+'원'+(fee.note?' ('+fee.note+')':'')));
}
function ksisFormTitle_(date,title) {
  return date+' | '+JSON.stringify(String(title).trim())+' 참가신청';
}
function ksisEventFolder_(store,year,month) {
  const rootKey='KSIS_FORM_ROOT';
  let rootId=store.getProperty(rootKey);
  if(!rootId){rootId=DriveApp.createFolder('협회 행사 신청서').getId();store.setProperty(rootKey,rootId);}
  const root=DriveApp.getFolderById(rootId);
  if(root.isTrashed())throw new Error('FORM_FOLDER_TRASHED');
  function child(parent,name,key) {
    const saved=store.getProperty(key);
    if(saved){const folder=DriveApp.getFolderById(saved);if(folder.isTrashed())throw new Error('FORM_FOLDER_TRASHED');return folder;}
    const matches=parent.getFoldersByName(name);
    const folder=matches.hasNext()?matches.next():parent.createFolder(name);
    store.setProperty(key,folder.getId());return folder;
  }
  const annual=child(root,year,'KSIS_FORM_FOLDER_'+year);
  // Prepare all twelve months once, including months without an event yet.
  let selected;
  for(let index=1;index<=12;index++){
    const number=String(index).padStart(2,'0');
    const folder=child(annual,number+'월','KSIS_FORM_FOLDER_'+year+'_'+number);
    if(number===month)selected=folder;
  }
  return selected;
}
function ksisRetireAnnual_(event,eventId,store) {
  const form=FormApp.openById(event.formId);
  const list=form.getItemById(Number(event.eventItemId)).asListItem();
  const old=[event.eventValue,...(event.previousValues || [])];
  const remaining=list.getChoices().map(choice=>choice.getValue()).filter(value=>!old.includes(value));
  if(remaining.length)list.setChoiceValues(remaining);
  else {form.setAcceptingResponses(false);list.setChoiceValues(['현재 신청 가능한 행사가 없습니다']);}
  if(event.year){
    const key='KSIS_YEAR_'+event.year,registry=JSON.parse(store.getProperty(key) || 'null');
    if(registry){registry.inactiveValues=Array.from(new Set([...(registry.inactiveValues || []),...old]));store.setProperty(key,JSON.stringify(registry));}
  }
}


