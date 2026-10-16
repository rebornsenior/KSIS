/** Deploy as an API executable, never an anonymous owner-executed web app.
 * Configure KSIS_REGISTRATION in Script Properties (not in the public repo).
 * {events:{"stable-event-id":{formId:"EDIT_FORM_ID",eventItemId:"123",
 * eventValue:"stable-event-id | 행사명",nameItemId:"456",phoneItemId:"789",
 * payerItemId:"101",readers:["staff@example.com"],deleters:["staff@example.com"]}}}
 */
function ksisRegistration(request) {
  if (!request || !['list', 'delete', 'sync', 'info'].includes(request.action)) throw new Error('INVALID_ACTION');
  const email = Session.getActiveUser().getEmail().trim().toLowerCase();
  if (!email) throw new Error('SIGN_IN_REQUIRED');
  if (request.action === 'sync') return ksisSyncEvent_(request, email);
  if (typeof request.eventId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(request.eventId)) throw new Error('INVALID_EVENT_ID');
  const raw = PropertiesService.getScriptProperties().getProperty('KSIS_REGISTRATION');
  if (!raw) throw new Error('NOT_CONFIGURED');
  const config = JSON.parse(raw);
  let event = Object.prototype.hasOwnProperty.call(config.events || {}, request.eventId)
    ? config.events[request.eventId] : null;
  const savedEvent = PropertiesService.getScriptProperties().getProperty('KSIS_EVENT_'+request.eventId);
  const selectedEvent = savedEvent ? JSON.parse(savedEvent) : event;
  event = selectedEvent;
  if (!event) throw new Error('EVENT_NOT_CONFIGURED');
  const allowed = request.action === 'delete' ? event.deleters : event.readers;
  if (!Array.isArray(allowed) || !allowed.some(value => value.toLowerCase() === email)) throw new Error('FORBIDDEN');
  for (const key of ['formId', 'eventItemId', 'eventValue', 'nameItemId', 'phoneItemId', 'payerItemId']) {
    if (typeof event[key] !== 'string' || !event[key]) throw new Error('INVALID_EVENT_CONFIG');
  }
  const form = FormApp.openById(event.formId); // Also enforces the caller's Google Forms access.
  if (request.action === 'info') return ksisEventInfo_(request.eventId,event,form);
  function record(response) {
    const answers = {};
    response.getItemResponses().forEach(item => {
      answers[String(item.getItem().getId())] = item.getResponse();
    });
    if (![event.eventValue,...(event.previousValues || [])].includes(answers[event.eventItemId])) return null;
    return {id:response.getId(),eventId:request.eventId,
      name:String(answers[event.nameItemId] || ''),phone:String(answers[event.phoneItemId] || ''),
      payer:String(answers[event.payerItemId] || ''),submittedAt:response.getTimestamp().toISOString()};
  }
  if (request.action === 'list') {
    const records = form.getResponses().map(record).filter(Boolean);
    records.sort((a,b) => b.submittedAt.localeCompare(a.submittedAt));
    return {eventId:request.eventId,title:event.title || event.eventValue,records};
  }
  if (typeof request.responseId !== 'string' || !request.responseId || request.confirmDelete !== true) throw new Error('CONFIRM_REQUIRED');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const response = form.getResponse(request.responseId);
    const current = record(response);
    if (!current) throw new Error('EVENT_MISMATCH');
    // The UI must show this exact event/person and warn deletion is irreversible.
    if (current.name !== request.expectedName || current.submittedAt !== request.expectedSubmittedAt) throw new Error('RESPONSE_CHANGED');
    form.deleteResponse(request.responseId);
    if (form.getResponses().some(item => item.getId() === request.responseId)) throw new Error('DELETE_NOT_CONFIRMED');
    return {deleted:true,eventId:request.eventId,responseId:request.responseId};
  } finally { lock.releaseLock(); }
}

/** Run once manually as an existing registration administrator. No secret is needed. */
function setupRegistrationAutomation() {
  const store = PropertiesService.getScriptProperties();
  const config = JSON.parse(store.getProperty('KSIS_REGISTRATION') || '{}');
  const email = Session.getActiveUser().getEmail().trim().toLowerCase();
  const seed = config.events && config.events['2026-forum-37'];
  if (!email || !seed || !(seed.deleters || []).includes(email)) throw new Error('FORBIDDEN');
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    if (!store.getProperty('KSIS_AUTOMATION')) store.setProperty('KSIS_AUTOMATION', JSON.stringify({managers:[email],readers:seed.readers,deleters:seed.deleters}));
    if (!store.getProperty('KSIS_YEAR_2026')) store.setProperty('KSIS_YEAR_2026', JSON.stringify({formId:seed.formId,eventItemId:seed.eventItemId,nameItemId:seed.nameItemId,phoneItemId:seed.phoneItemId,payerItemId:seed.payerItemId}));
    return {ready:true};
  } finally { lock.releaseLock(); }
}

// Private helpers end in underscore and cannot be invoked through scripts.run.
function ksisSyncEvent_(request, email) {
  const store = PropertiesService.getScriptProperties();
  const access = JSON.parse(store.getProperty('KSIS_AUTOMATION') || '{}');
  if (!Array.isArray(access.managers)) throw new Error('AUTOMATION_NOT_CONFIGURED');
  if (!access.managers.includes(email)) throw new Error('FORBIDDEN');
  if (typeof request.eventId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(request.eventId)) throw new Error('INVALID_EVENT_ID');
  if (typeof request.title !== 'string' || !request.title.trim() || request.title.length > 200) throw new Error('INVALID_EVENT_TITLE');
  if (typeof request.date !== 'string' || !/^20\d{2}-\d{2}-\d{2}$/.test(request.date) || new Date(request.date+'T00:00:00Z').toISOString().slice(0,10)!==request.date) throw new Error('INVALID_EVENT_DATE');
  const categoryLabels={forum:'정기 포럼',education:'교육 특강',monetize:'수익 실무',other:'친목 소모임'};
  if(request.category!==undefined && !Object.prototype.hasOwnProperty.call(categoryLabels,request.category)) throw new Error('INVALID_EVENT_CATEGORY');
  const year = request.date.slice(0,4);
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const config = JSON.parse(store.getProperty('KSIS_REGISTRATION') || '{}');
    const legacy = (config.events || {})[request.eventId];
    let event = JSON.parse(store.getProperty('KSIS_EVENT_'+request.eventId) || 'null') || legacy;
    if (event && event.year && event.year!==year) throw new Error('EVENT_YEAR_CHANGED');
    if (legacy && !event.year && !request.eventId.startsWith(year+'-')) throw new Error('EVENT_YEAR_CHANGED');
    let registry = JSON.parse(store.getProperty('KSIS_YEAR_'+year) || 'null');
    if(request.enabled===false) {
      if(!event || !registry) return {eventId:request.eventId,disabled:true,year};
      const existingForm=FormApp.openById(registry.formId);
      const list=existingForm.getItemById(Number(event.eventItemId)).asListItem();
      registry.inactiveValues=Array.from(new Set([...(registry.inactiveValues || []),event.eventValue,...(event.previousValues || [])]));
      const remaining=list.getChoices().map(choice=>choice.getValue()).filter(value=>!registry.inactiveValues.includes(value));
      if(remaining.length) list.setChoiceValues(remaining);
      else {
        // Google dropdowns cannot have zero choices. Remove the closed event
        // name, leave a neutral placeholder, and close submissions entirely.
        existingForm.setAcceptingResponses(false);
        list.setChoiceValues(['현재 신청 가능한 행사가 없습니다']);
      }
      event.enabled=false;
      store.setProperty('KSIS_EVENT_'+request.eventId,JSON.stringify(event));
      store.setProperty('KSIS_YEAR_'+year,JSON.stringify(registry));
      return {eventId:request.eventId,disabled:true,year};
    }
    if (!registry) {
      const created = FormApp.create(year+'년 한국시니어교류협회 참가 신청',false);
      registry = {formId:created.getId()};
      // Journal immediately so a retry reuses a partially prepared form.
      store.setProperty('KSIS_YEAR_'+year,JSON.stringify(registry));
    }
    const form = FormApp.openById(registry.formId);
    const fields = [['eventItemId','참가할 행사','LIST'],['nameItemId','신청자 이름','TEXT'],['phoneItemId','전화번호','TEXT'],['payerItemId','입금자명','TEXT']];
    for (const [key,title,type] of fields) {
      if (registry[key]) continue;
      const matches = form.getItems().filter(item=>item.getTitle()===title && String(item.getType())===type);
      if (matches.length>1) throw new Error('AMBIGUOUS_FORM_ITEMS');
      const item = matches[0] || (type==='LIST'?form.addListItem():form.addTextItem()).setTitle(title).setRequired(true);
      registry[key] = String(item.getId());
      store.setProperty('KSIS_YEAR_'+year,JSON.stringify(registry));
    }
    if (event && event.formId!==registry.formId) throw new Error('EVENT_YEAR_CHANGED');
    const list = form.getItemById(Number(registry.eventItemId)).asListItem();
    const oldValues=event ? Array.from(new Set([event.eventValue,...(event.previousValues || [])])) : [];
    const category=request.category || (event && event.category) || 'other';
    const label=request.date.replace(/-/g,'.')+' | '+categoryLabels[category]+' | '+JSON.stringify(request.title.trim());
    const choices=list.getChoices().map(choice=>choice.getValue());
    // Google dropdown answers contain only visible text. Reserve every historical
    // label permanently so two events can never share the same response value.
    for(const value of [...oldValues,label]) {
      const key=ksisChoiceKey_(registry.formId,value);
      const owner=store.getProperty(key);
      if(owner && owner!==request.eventId) throw new Error('EVENT_LABEL_CONFLICT');
      if(value===label && choices.includes(label) && !oldValues.includes(label) && owner!==request.eventId) throw new Error('EVENT_LABEL_CONFLICT');
    }
    for(const value of [...oldValues,label]) store.setProperty(ksisChoiceKey_(registry.formId,value),request.eventId);
    if (!event) event = {formId:registry.formId,eventItemId:registry.eventItemId,nameItemId:registry.nameItemId,phoneItemId:registry.phoneItemId,payerItemId:registry.payerItemId,readers:access.readers || access.managers,deleters:access.deleters || access.managers};
    event.previousValues=oldValues.filter(value=>value!==label);
    event.eventValue=label;
    event.year=year; event.enabled=true;
    event.title=request.title.trim(); event.date=request.date; event.category=category; event.labelVersion=2;
    // Persist aliases before replacing the dropdown: old responses stay readable,
    // including if Google rejects the choice update and the caller retries.
    store.setProperty('KSIS_EVENT_'+request.eventId,JSON.stringify(event));
    registry.inactiveValues=(registry.inactiveValues || []).filter(value=>!oldValues.includes(value) && value!==label);
    const nextChoices=choices.filter(value=>value!=='현재 신청 가능한 행사가 없습니다' && !oldValues.includes(value) && value!==label && !registry.inactiveValues.includes(value));
    nextChoices.push(label);
    list.setChoiceValues(nextChoices);
    store.setProperty('KSIS_YEAR_'+year,JSON.stringify(registry));
    if (!registry.ready) {
      form.setDescription('참가할 행사를 선택한 뒤 신청자 이름, 전화번호, 입금자명을 입력해 주세요. 무료 참가 대상자는 입금자명에 ‘해당 없음’을 입력해 주세요.');
      form.setCollectEmail(false); form.setLimitOneResponsePerUser(false); form.setPublishingSummary(false);
      form.setPublished(true); form.setAcceptingResponses(true);
      registry.ready = true; store.setProperty('KSIS_YEAR_'+year,JSON.stringify(registry));
    }
    form.setAcceptingResponses(true);
    return ksisEventInfo_(request.eventId,event,form);
  } finally { lock.releaseLock(); }
}

function ksisEventInfo_(eventId,event,form) {
  const item = form.getItemById(Number(event.eventItemId)).asListItem();
  const url = form.createResponse().withItemResponse(item.createResponse(event.eventValue)).toPrefilledUrl();
  return {eventId,title:event.title || event.eventValue,date:event.date || '',year:event.year || '',category:event.category || '',labelVersion:event.labelVersion || 1,registrationForm:url};
}

function ksisChoiceKey_(formId,value) {
  const digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value,Utilities.Charset.UTF_8);
  const hash=digest.map(byte=>('0'+((byte+256)%256).toString(16)).slice(-2)).join('');
  return 'KSIS_CHOICE_'+formId+'_'+hash;
}
/** One-time display migration for the two confirmed existing events.
 * Preserves old response values as aliases. Skips closed events.
 */
function updateExistingRegistrationLabels() {
  const store=PropertiesService.getScriptProperties();
  const config=JSON.parse(store.getProperty('KSIS_REGISTRATION') || '{}');
  const email=Session.getActiveUser().getEmail().trim().toLowerCase();
  const targets=[
    {eventId:'2026-forum-37',date:'2026-11-07',title:'제37회 비즈니스교류회',category:'forum'},
    {eventId:'evt-976cd8e1-1c7e-46f6-b9e8-e04a115fe169',date:'2026-06-16',title:'바람이 전하는 노래- 우리세대의 기억과 위로',category:'other'}
  ];
  const results=targets.map(target=>{
    const event=JSON.parse(store.getProperty('KSIS_EVENT_'+target.eventId) || 'null') || (config.events || {})[target.eventId];
    if(!event || event.enabled===false) return {eventId:target.eventId,skipped:true};
    const result=ksisSyncEvent_({...target,title:event.title || target.title,date:event.date || target.date,enabled:true},email);
    return {eventId:result.eventId,labelVersion:result.labelVersion,category:result.category};
  });
  console.log(JSON.stringify(results,null,2));
  return results;
}
