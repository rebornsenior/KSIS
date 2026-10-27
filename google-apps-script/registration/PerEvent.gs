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
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    const config=JSON.parse(store.getProperty('KSIS_REGISTRATION') || '{}');
    const key='KSIS_EVENT_'+request.eventId;
    let event=JSON.parse(store.getProperty(key) || 'null') || (config.events || {})[request.eventId];
    const year=request.date.slice(0,4), month=request.date.slice(5,7);
    if(!request.enabled) {
      if(event?.structure==='per-event') {
        const file=DriveApp.getFileById(event.formId);
        if(!file.isTrashed()) {
          FormApp.openById(event.formId).setAcceptingResponses(false);
          file.setTrashed(true);
        }
        if(!file.isTrashed()) throw new Error('TRASH_NOT_CONFIRMED');
        // Mark only after Drive confirms. Retry is safe if CMS save fails.
        event.enabled=false;event.trashed=true;store.setProperty(key,JSON.stringify(event));
      } else if(event) {
        // Shared annual forms contain other events: remove only this option.
        ksisRetireAnnual_(event,request.eventId,store);
        event.enabled=false;store.setProperty(key,JSON.stringify(event));
      }
      return {eventId:request.eventId,disabled:true,year,schemaVersion:3};
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
    const fields=[['eventItemId','참가할 행사','LIST'],['nameItemId','신청자 이름','TEXT'],['phoneItemId','전화번호','TEXT'],['payerItemId','입금자명','TEXT']];
    for(const [field,title,type] of fields) {
      if(event[field])continue;
      const matches=form.getItems().filter(item=>item.getTitle()===title && String(item.getType())===type);
      if(matches.length>1)throw new Error('AMBIGUOUS_FORM_ITEMS');
      const item=matches[0] || (type==='LIST'?form.addListItem():form.addTextItem()).setTitle(title).setRequired(true);
      event[field]=String(item.getId());store.setProperty(key,JSON.stringify(event));
    }
    const category=request.category || event.category || 'other';
    const label=request.date.replace(/-/g,'.')+' | '+labels[category]+' | '+JSON.stringify(request.title.trim());
    event.previousValues=Array.from(new Set([...(event.previousValues || []),event.eventValue].filter(value=>value && value!==label)));
    event.eventValue=label;event.year=year;event.month=month;event.date=request.date;event.title=request.title.trim();event.category=category;event.labelVersion=2;event.folderId=folder.getId();
    store.setProperty(key,JSON.stringify(event));
    form.getItemById(Number(event.eventItemId)).asListItem().setChoiceValues([label]);
    for(const old of event.archivedForms || []) {
      if(old.enabled!==false){ksisRetireAnnual_(old,request.eventId,store);old.enabled=false;}
    }
    form.setDescription('이 행사 전용 참가 신청서입니다. 신청자 이름, 전화번호, 입금자명을 입력해 주세요. 무료 참가 대상자는 입금자명에 ‘해당 없음’을 입력해 주세요.');
    form.setCollectEmail(false);form.setLimitOneResponsePerUser(false);form.setPublishingSummary(false);
    form.setPublished(true);form.setAcceptingResponses(true);
    event.enabled=true;event.trashed=false;event.ready=true;
    store.setProperty(key,JSON.stringify(event));
    return ksisEventInfo_(request.eventId,event,form);
  } finally {lock.releaseLock();}
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
