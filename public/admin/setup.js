/* Local filesystem editing locally; individual GitHub OAuth on the production domain. */
const localMode = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
if (!localMode && location.origin !== 'https://www.rebornsenior.com') {
  document.body.textContent = '관리자 화면은 https://www.rebornsenior.com/admin/ 에서 이용해 주세요.';
} else if (!window.CMS) {
  document.body.textContent = '글쓰기 도구를 불러오지 못했습니다. 인터넷 연결 후 새로고침해 주세요.';
} else {
  const AlignmentControl = window.createClass({
    render() {
      const h = window.h;
      const choices = [['left','왼쪽'],['center','중앙'],['right','오른쪽'],['justify','양쪽']];
      return h('div', {role:'group', 'aria-label':'정렬', style:{display:'flex',gap:'8px',flexWrap:'wrap'}},
        ...choices.filter(([value]) => value !== 'justify' || this.props.field.get('allowJustify')).map(([value,label]) => {
          const selected = (this.props.value || 'left') === value;
          return h('button', {key:value,type:'button','aria-pressed':selected,title:label + ' 정렬',
            onClick:() => this.props.onChange(value),style:{padding:'8px',border:'1px solid #cbd5e1',borderRadius:'4px',background:selected ? '#002147' : '#fff',color:selected ? '#fff' : '#002147'}},
            h('svg',{width:22,height:20,viewBox:'0 0 22 20','aria-hidden':true},
              ...[0,1,2,3].map(i => {
                const width = value === 'justify' || i % 2 === 0 ? 18 : 12;
                const x = value === 'right' ? 20-width : value === 'center' ? (22-width)/2 : 2;
                return h('line',{key:i,x1:x,x2:x+width,y1:3+i*4,y2:3+i*4,stroke:'currentColor',strokeWidth:1.5});
              })), h('span',{style:{display:'block',fontSize:'12px'}},label));
        }));
    },
  });
  CMS.registerWidget('alignment', AlignmentControl);
  const CompanyTagsControl = window.createClass({
    tags() { return this.props.value?.toJS ? this.props.value.toJS() : (this.props.value || []); },
    addTag() {
      const tags = this.tags();
      if (tags.length >= 4) {
        window.alert('해시태그는 최대 4개까지 추가할 수 있습니다. 기존 태그를 삭제한 뒤 추가해 주세요.');
        return;
      }
      this.props.onChange([...tags, '']);
    },
    isValid() {
      const tags = this.tags();
      return tags.length <= 4 && tags.every(tag => /^(?=.{1,10}$)[^#\s](?:[^#\r\n]*[^#\s])?$/.test(tag))
        ? true : '해시태그는 최대 4개, 각 공백 포함 1~10자로 입력하세요. #과 앞뒤 공백은 제외해 주세요.';
    },
    render() {
      const h = window.h, tags = this.tags();
      return h('div', {},
        ...tags.map((tag, index) => h('div', {key:index, style:{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}},
          h('input', {type:'text', value:tag, maxLength:10, placeholder:'예: 따뜻한 그림', 'aria-label':`${index + 1}번 해시태그`,
            style:{border:'1px solid #cbd5e1',borderRadius:'4px',background:'#f8fafc',color:'#1e293b',padding:'10px 12px',fontSize:'14px',width:'100%',minWidth:0,boxSizing:'border-box'},
            onChange:event => this.props.onChange(tags.map((value, i) => i === index ? event.target.value : value))}),
          h('button', {type:'button', 'aria-label':`${index + 1}번 해시태그 삭제`,
            onClick:() => this.props.onChange(tags.filter((_, i) => i !== index))}, '삭제'))),
        h('button', {type:'button', onClick:() => this.addTag()}, '태그 추가'));
    },
  });
  CMS.registerWidget('company-tags', CompanyTagsControl);
  const MemberCategoriesControl = window.createClass({
    items() { const value=this.props.value; return value?.toJS ? value.toJS() : (value || []); },
    render() {
      const h=window.h, items=this.items();
      const update=next=>this.props.onChange(next);
      return h('div', {},
        ...items.map((item,index)=>h('div',{key:item.id,style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}},
          h('input',{type:'text',value:item.label || '',placeholder:'분류명 입력','aria-label':(index+1)+'번 분류명',
            onChange:event=>update(items.map((row,i)=>i===index ? {...row,label:event.target.value} : row)),
            style:{flex:1,minWidth:0,padding:'12px',border:'1px solid #cbd5e1',borderRadius:'4px'}}),
          h('button',{type:'button','aria-label':(index+1)+'번 분류 삭제',onClick:()=>update(items.filter((_,i)=>i!==index)),style:{padding:'10px',cursor:'pointer'}},'삭제'))),
        h('button',{type:'button',disabled:items.length>=6,onClick:()=>update([...items,{id:'industry-'+crypto.randomUUID(),label:''}]),style:{padding:'10px 16px',cursor:'pointer'}},'분류 추가'),
        h('p',{style:{color:'#64748b',fontSize:'12px',marginTop:'8px'}},'최대 6개 · '+items.length+'/6 · 빈칸은 채우거나 삭제해 주세요.')
      );
    }
  });
  CMS.registerWidget('member-categories', MemberCategoriesControl);
  // Album picker uses its own media control identity so a native multi-selection
  // is consumed once and preserves the existing object/caption data format.
  const AlbumPhotosControl=window.createClass({
    getInitialState(){return {controlID:'ksis-album-'+Math.random().toString(36).slice(2)};},
    shouldComponentUpdate(next){return this.props.value!==next.value||this.props.mediaPaths!==next.mediaPaths||this.props.getAsset!==next.getAsset;},
    componentDidUpdate(){
      const paths=this.props.mediaPaths.get(this.state.controlID);
      if(!paths)return;
      this.props.onRemoveInsertedMedia(this.state.controlID);
      const current=this.props.value?.toJS?this.props.value.toJS():(this.props.value||[]);
      const selected=paths?.toJS?paths.toJS():Array.isArray(paths)?paths:[paths];
      const unique=[...new Set(selected.filter(Boolean))];
      this.props.onChange(unique.map(url=>current.find(photo=>photo.url===url)||{url}));
    },
    isValid(){return !!this.props.value?.size || !!this.props.value?.length;},
    componentWillUnmount(){this.props.onRemoveMediaControl(this.state.controlID);},
    render(){
      const h=window.h,photos=this.props.value?.toJS?this.props.value.toJS():(this.props.value||[]);
      const update=next=>this.props.onChange(next);
      const library=this.props.field.get('media_library').set('allow_multiple',true).setIn(['config','multiple'],true);
      return h('div',{},
        h('button',{type:'button',onClick:()=>this.props.onOpenMediaLibrary({controlID:this.state.controlID,forImage:true,value:photos.map(photo=>photo.url),allowMultiple:true,config:library.get('config'),field:this.props.field})},'사진 선택 · 여러 장 추가'),
        h('p',{},'선택 창에서 사진을 여러 장 클릭한 뒤 「선택한 것으로 결정」을 누르세요.'),
        ...photos.map((photo,index)=>h('div',{key:photo.url,style:{display:'flex',gap:8,alignItems:'center',marginTop:8}},
          h('img',{src:String(this.props.getAsset(photo.url)),alt:'',style:{width:64,height:64,objectFit:'cover'}}),
          h('input',{type:'text',value:photo.caption||'',placeholder:'사진 설명 (선택사항)','aria-label':(index+1)+'번 사진 설명',style:{flex:1,padding:8},onChange:event=>update(photos.map((item,i)=>i===index?{...item,caption:event.target.value}:item))}),
          h('button',{type:'button',disabled:index===0,'aria-label':(index+1)+'번 사진 앞으로',onClick:()=>{const next=[...photos];[next[index-1],next[index]]=[next[index],next[index-1]];update(next);}},'↑'),
          h('button',{type:'button',onClick:()=>update(photos.filter((_,i)=>i!==index))},'삭제'))));
    }
  });
  CMS.registerWidget('album-photos',AlbumPhotosControl);

  // Form URL is CMS content; private responses are fetched only in the local panel.
  const RegistrationFormControl = window.createClass({
    render() {
      const h=window.h, value=this.props.value || '';
      let valid=false;
      try {
        const url=new URL(value);
        valid=url.protocol==='https:' && url.hostname==='docs.google.com' && /^\/forms\/d\/(?:e\/)?[a-zA-Z0-9_-]+\/viewform$/.test(url.pathname);
      } catch {}
      if(!valid) return null;
      return h('div',{},h('strong',{},'게시된 신청 폼'),h('p',{},h('a',{href:value,target:'_blank',rel:'noopener noreferrer',style:{display:'inline-block',padding:'11px 18px',marginTop:'8px',background:'#002147',color:'#fff',borderRadius:'6px',fontWeight:700,textDecoration:'none'}},'실제 Google Form 열기 ↗')));
    }
  });
  CMS.registerWidget('registration-form',RegistrationFormControl);
  const AudienceControl = window.createClass({
    items() {const value=this.props.value;return value?.toJS ? value.toJS() : (value || []);},
    render() {
      const h=window.h, saved=this.items(), items=saved.length?saved:[''];
      return h('div',{},...items.map((value,index)=>h('div',{key:index,style:{display:'flex',gap:'8px',marginBottom:'10px'}},
        h('input',{type:'text',value,placeholder:'예: 협회 회원, 일반 참가자','aria-label':(index+1)+'번 참가 대상',onChange:event=>this.props.onChange(items.map((item,i)=>i===index?event.target.value:item)),style:{flex:1,minWidth:0,padding:'12px',border:'1px solid #cbd5e1',borderRadius:'4px'}}),
        h('button',{type:'button',disabled:items.length===1,onClick:()=>this.props.onChange(items.filter((_,i)=>i!==index)),style:{padding:'8px'}},'삭제'))),
        h('button',{type:'button',onClick:()=>this.props.onChange([...items,'']),style:{padding:'8px 14px'}},'참가 대상 추가'));
    }
  });
  CMS.registerWidget('event-audience',AudienceControl);
  const RegistrationEnabledControl = window.createClass({
    getInitialState(){return {busy:false,message:'',error:false};},
    render(){
      const h=window.h, enabled=this.props.value===true;
      return h('div',{},
        h('button',{type:'button',role:'switch','aria-checked':enabled,disabled:this.state.busy,onClick:async()=>{
          if(enabled){this.props.onChange(false);this.setState({message:'저장·게시하면 이 행사 신청서가 구글 드라이브 휴지통으로 이동합니다.',error:false});return;}
          this.setState({busy:true,message:'구글 로그인 창에서 계정을 선택해 주세요.',error:false});
          try{await window.KSISRegistration.connect();this.props.onChange(true);this.setState({message:'구글 연결 완료. 일정을 저장·게시하면 행사별 신청서가 연도·월 폴더에 자동 생성됩니다.',error:false});}
          catch(error){this.setState({error:true,message:error.message==='GOOGLE_NOT_READY'?'구글 연결 준비가 완료됐습니다. 신청받기를 한 번 더 눌러 주세요.':'구글 연결을 완료하지 못했습니다. 팝업을 허용한 뒤 신청받기를 다시 눌러 주세요.'});}
          finally{this.setState({busy:false});}
        },style:{padding:'12px 20px',border:'1px solid #002147',borderRadius:'6px',background:enabled?'#002147':'white',color:enabled?'white':'#002147',fontSize:'16px',fontWeight:700,cursor:'pointer'}},this.state.busy?'구글 연결 중…':enabled?'신청받기 켜짐':'신청받기 켜기'),
        h('p',{style:{fontSize:'16px',fontWeight:700,lineHeight:1.6,marginTop:'12px',color:'#002147'}},'신청받기를 켜고 구글 계정을 선택한 뒤 일정을 저장·게시하세요. 행사별 신청서가 연도·월 폴더에 자동 생성됩니다.'),
        h('p',{'aria-live':'polite',role:this.state.error?'alert':'status',style:{color:this.state.error?'#b91c1c':'#334155'}},this.state.message));
    }
  });
  CMS.registerWidget('registration-enabled',RegistrationEnabledControl);
  const defaultRegistrationQuestions=()=>[
    {id:'name',type:'text',title:'신청자 이름',required:true},
    {id:'phone',type:'text',title:'전화번호',required:true},
    {id:'payer',type:'text',title:'입금자명',required:false},
  ];
  const defaultRegistrationFees=()=>[
    {grade:'플래티넘 회원',amount:'10000',note:'10회 무료(이후 1만원/80% 할인)'},
    {grade:'골드 회원',amount:'15000',note:'5회 무료(이후 1만5천원/70% 할인)'},
    {grade:'실버 회원',amount:'25000',note:'2회 무료(이후 2만5천원/50% 할인)'},
    {grade:'브론즈 회원',amount:'35000',note:'30% 할인'},
    {grade:'추천동반인',amount:'20000',note:''},
    {grade:'일반인',amount:'50000',note:''},
  ];
  const RegistrationBuilderControl = window.createClass({
    config(){
      const raw=this.props.value?.toJS?this.props.value.toJS():this.props.value;
      const fees=Array.isArray(raw)?raw:(Array.isArray(raw?.fees)?raw.fees:[]);
      return {questions:Array.isArray(raw?.questions)?raw.questions:defaultRegistrationQuestions(),fees,paid:typeof raw?.paid==='boolean'?raw.paid:fees.length>0};
    },
    render(){
      const h=window.h,{questions,fees,paid}=this.config();
      const update=(key,next)=>this.props.onChange({...this.config(),[key]:next});
      const editQuestion=(index,patch)=>update('questions',questions.map((question,i)=>i===index?{...question,...patch}:question));
      const editFee=(index,patch)=>update('fees',fees.map((fee,i)=>i===index?{...fee,...patch}:fee));
      const inputStyle={width:'100%',boxSizing:'border-box',padding:'9px',border:'1px solid #cbd5e1',borderRadius:'4px'};
      const panelStyle={padding:'16px',border:'1px solid #cbd5e1',borderRadius:'8px',background:'#fff',minWidth:0};
      return h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,320px),1fr))',gap:'20px',alignItems:'start'}},
        h('div',{style:panelStyle},h('strong',{},'신청 항목 편집'),
          h('p',{style:{fontSize:'13px',color:'#64748b'}},'질문 유형·필수 여부·삭제를 설정할 수 있습니다. 입력 내용은 오른쪽 미리보기에 즉시 반영됩니다.'),
          ...questions.map((question,index)=>h('div',{key:question.id,style:{padding:'12px',border:'1px solid #e2e8f0',borderRadius:'6px',marginTop:'12px'}},
            h('input',{type:'text',value:question.title||'',placeholder:'질문 제목','aria-label':(index+1)+'번 질문 제목',onChange:event=>editQuestion(index,{title:event.target.value}),style:inputStyle}),
            h('div',{style:{display:'flex',gap:'8px',alignItems:'center',marginTop:'8px'}},
              h('select',{value:question.type||'text',onChange:event=>editQuestion(index,{type:event.target.value,options:['select','checkbox'].includes(event.target.value)?(question.options?.length?question.options:['']):[]})},
                ...[['text','짧은 답변'],['paragraph','긴 답변'],['select','단일 선택'],['checkbox','복수 선택']].map(([value,label])=>h('option',{key:value,value},label))),
              h('label',{},h('input',{type:'checkbox',checked:question.required!==false,onChange:event=>editQuestion(index,{required:event.target.checked})}),'필수'),
              h('button',{type:'button',onClick:()=>update('questions',questions.filter((_,i)=>i!==index))},'삭제')),
            h('input',{type:'text',value:question.help||'',placeholder:'질문 안내 문구 (선택)',onChange:event=>editQuestion(index,{help:event.target.value}),style:{...inputStyle,marginTop:'8px'}}),
            ['select','checkbox'].includes(question.type) && h('div',{style:{marginTop:'8px'}},...(question.options||[]).map((option,optionIndex)=>h('div',{key:optionIndex,style:{display:'flex',gap:'6px',marginTop:'6px'}},h('input',{type:'text',value:option,placeholder:'선택지 '+(optionIndex+1),onChange:event=>editQuestion(index,{options:question.options.map((value,i)=>i===optionIndex?event.target.value:value)}),style:{...inputStyle,flex:1}}),h('button',{type:'button',disabled:optionIndex===0,onClick:()=>{const options=[...question.options];[options[optionIndex-1],options[optionIndex]]=[options[optionIndex],options[optionIndex-1]];editQuestion(index,{options});}},'↑'),h('button',{type:'button',disabled:optionIndex===question.options.length-1,onClick:()=>{const options=[...question.options];[options[optionIndex],options[optionIndex+1]]=[options[optionIndex+1],options[optionIndex]];editQuestion(index,{options});}},'↓'),h('button',{type:'button',onClick:()=>editQuestion(index,{options:question.options.filter((_,i)=>i!==optionIndex)})},'삭제'))),h('button',{type:'button',onClick:()=>editQuestion(index,{options:[...(question.options||[]),'']}),style:{marginTop:'6px'}},'선택지 추가')))),
          h('button',{type:'button',onClick:()=>update('questions',[...questions,{id:'q-'+crypto.randomUUID(),type:'text',title:'',required:false}]),style:{marginTop:'12px'}},'질문 추가'),
          h('div',{style:{marginTop:'24px'}},h('strong',{},'등급별 참가비'),
        h('label',{style:{display:'flex',alignItems:'center',gap:'8px',fontWeight:600}},
          h('input',{type:'checkbox',checked:paid,onChange:event=>this.props.onChange({...this.config(),paid:event.target.checked,fees:event.target.checked?(fees.length?fees:[{grade:'일반인',amount:'0',note:'',temporary:true}]):[]})}),
          '참가비를 받는 행사'),
        ...(paid?fees:[]).map((fee,index)=>h('div',{key:index,style:{padding:'12px',border:'1px solid #e2e8f0',borderRadius:'6px',marginTop:'8px'}},
          h('input',{type:'text',value:fee.grade||'',placeholder:'회원 등급 또는 참가 유형','aria-label':(index+1)+'번 등급',onChange:event=>editFee(index,{grade:event.target.value}),style:inputStyle}),
          h('input',{type:'number',min:0,value:fee.amount??'',placeholder:'금액(원)','aria-label':(index+1)+'번 금액',onChange:event=>editFee(index,{amount:event.target.value}),style:{...inputStyle,marginTop:'8px'}}),
          h('input',{type:'text',value:fee.note||'',placeholder:'안내 사항 (예: 10회 무료, 이후 80% 할인)','aria-label':(index+1)+'번 안내',onChange:event=>editFee(index,{note:event.target.value}),style:{...inputStyle,marginTop:'8px'}}),
          h('button',{type:'button',onClick:()=>update('fees',fees.filter((_,i)=>i!==index)),style:{marginTop:'8px'}},'삭제'))),
        paid && h('button',{type:'button',onClick:()=>update('fees',[...fees,{grade:'',amount:'',note:''}]),style:{marginTop:'8px',padding:'8px 14px'}},h('span',{style:{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'20px',height:'20px',border:'1px solid currentColor',borderRadius:'50%',marginRight:'6px',fontWeight:700}},'+'),'등급·참가 유형 추가'),
        paid && h('button',{type:'button',onClick:()=>{const defaults=defaultRegistrationFees();const hasDefaults=defaults.every(base=>fees.some(fee=>fee.grade===base.grade));const withoutTemporary=fees.filter(fee=>!(fee.temporary || (fee.grade==='일반인' && String(fee.amount)==='0' && !fee.note)));const custom=withoutTemporary.filter(fee=>!defaults.some(base=>fee.grade===base.grade && String(fee.amount)===base.amount && (fee.note||'')===base.note));update('fees',hasDefaults?(custom.length?custom:[{grade:'',amount:'',note:''}]):custom.concat(defaults));},style:{display:'block',marginTop:'14px'}},'기본 참가비 양식 불러오기'),
        paid && h('p',{style:{fontSize:'12px',color:'#64748b'}},'등급명·금액·안내 사항이 Google Form에 표시됩니다.'))),
        h('div',{style:{...panelStyle,background:'#f8fafc'}},h('strong',{},'참가 신청용 Google Form 미리보기'),h('p',{style:{fontSize:'12px',color:'#64748b'}},'저장 후 생성될 Google Form의 항목 구성입니다. 입력·제출은 할 수 없습니다.'),
          h('div',{style:{...panelStyle,marginTop:'12px'}},'참가할 행사 *',h('p',{style:{color:'#94a3b8'}},'현재 일정')),
          ...questions.map((question,index)=>h('div',{key:question.id,style:{...panelStyle,marginTop:'12px'}},
            h('div',{},(question.title||'질문 제목')+(question.required!==false?' *':'')),
            question.help && h('p',{style:{fontSize:'12px',color:'#64748b'}},question.help),
            ['select','checkbox'].includes(question.type) ? h('ul',{},...(question.options||[]).filter(Boolean).map((option,i)=>h('li',{key:i},(question.type==='checkbox'?'□ ':'○ ')+option))) : h('p',{style:{color:'#94a3b8',fontSize:'13px'}},'내 답변'))),
          paid && h('div',{style:{...panelStyle,marginTop:'12px'}},h('strong',{},'회원 등급 / 참가 유형'),h('p',{style:{fontSize:'12px',color:'#64748b',marginTop:'6px'}},'본인의 등급을 선택하면 해당 참가비와 안내 사항을 확인할 수 있습니다.'),
            h('select',{style:{width:'100%',padding:'10px',border:'1px solid #cbd5e1',borderRadius:'4px',marginTop:'8px'}},h('option',{},'선택해 주세요'),...(fees||[]).map((fee,index)=>h('option',{key:index},String(fee.grade||'등급')+' · '+String(fee.amount||'0')+'원'+(fee.note?' ('+fee.note+')':''))))),

        ));
    }
  });
  CMS.registerWidget('registration-builder',RegistrationBuilderControl);
  const RegistrationRosterControl = window.createClass({
    getInitialState() { return {open:false,connection:''}; },

    componentDidUpdate(previous) {
      if(previous.value!==this.props.value && this.state.open) this.setState({open:false});
    },
    render() {
      const h=window.h,value=this.props.value || '';
      return h('div',{},
        h('p',{style:{fontSize:'14px',lineHeight:1.6}},value?'이 일정의 신청자 명단을 확인합니다. 신청받기를 끄고 저장하거나 일정을 삭제하면 이 행사 폼이 휴지통으로 이동합니다.': '신청받기를 켜고 저장·게시하면 명단을 확인할 수 있습니다.'),
        h('button',{type:'button',disabled:!value,onClick:()=>this.setState({open:!this.state.open}),style:{padding:'10px 16px',border:'1px solid #cbd5e1',borderRadius:'6px',background:'#002147',color:'white',cursor:'pointer'}},this.state.open?'신청 명단 닫기':'신청 명단 열기'),
        this.state.open && h('iframe',{key:value,title:'이 일정의 신청 명단 관리',src:'/admin/registration-manager.html?event='+encodeURIComponent(value),style:{width:'100%',height:'620px',border:'1px solid #e2e8f0',borderRadius:'6px',marginTop:'16px'}})
      );
    }
  });
  CMS.registerWidget('registration-roster',RegistrationRosterControl);
  let pendingRegistrationId=null;
  window.addEventListener('hashchange',()=>{pendingRegistrationId=null;});
  // Confirmed from the form's label ownership record on 2026-10-16.
  // Repair older workflow drafts too, without changing the form or its responses.
  const registrationIdMigrations=Object.freeze({
    'evt-d829e7c9-231a-47e0-9244-7b5a256f1231':'evt-976cd8e1-1c7e-46f6-b9e8-e04a115fe169'
  });
  const registrationIdFor=async(entry,data,generate)=>{
    const saved=data.get('registrationEventId');
    if(saved) return registrationIdMigrations[saved] || saved;
    if(!generate) return '';
    // Existing files keep the same identity even if Google succeeds but CMS save
    // fails, or the editor is reopened in another tab before metadata is saved.
    const path=!entry.get('newRecord') && (entry.get('path') || entry.get('slug'));
    if(path) {
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('ksis:calendar:'+path));
      return 'evt-'+Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
    }
    return pendingRegistrationId ||= 'evt-'+crypto.randomUUID();
  };
  const syncCalendarRegistration=async(entry)=>{
    let data=entry.get('data').delete('registrationRefreshRequested');
    if(entry.get('collection')!=='calendar') return data;
    const enabled=data.get('registrationEnabled')===true;
    if(!enabled && data.get('registrationRefreshRequested')) {
      window.alert('신청 연결을 갱신하려면 신청 받기를 켠 뒤 다시 게시하세요.');
      throw new Error('REGISTRATION_DISABLED');
    }
    if(!enabled && !data.get('registrationYear') && !data.get('registrationForm') && !data.get('registrationEventId')) return data;
    const eventId=await registrationIdFor(entry,data,enabled),title=data.get('title'),date=data.get('date');
    data=data.set('registrationEventId',eventId);
    if(!eventId || !title?.trim() || !date) throw new Error('신청 연결을 위해 일정 제목과 날짜를 입력해 주세요.');
    try {
      const participationFee=data.get('participationFee');
      const raw=participationFee?.toJS ? participationFee.toJS() : participationFee;
      const feeRows=raw?.paid===false?[]:(Array.isArray(raw) ? raw : (Array.isArray(raw?.fees) ? raw.fees : []));
      const questions=Array.isArray(raw?.questions) ? raw.questions : defaultRegistrationQuestions();
      const result=await window.KSISRegistration.call({action:'sync',formStructure:'per-event',eventId,title,date,category:data.get('category') || 'other',participationFee:feeRows,registrationQuestions:questions,enabled});
      if(!enabled) {
        if(result?.eventId!==eventId || result.disabled!==true || result.schemaVersion!==4) throw new Error('INVALID_SYNC_RESULT');
        return data.set('registrationForm','').delete('registrationRefreshRequested');
      }
      if(result?.schemaVersion!==4 || result?.labelVersion!==2) throw new Error('REGISTRATION_CODE_OUTDATED');
      let url;
      try {url=new URL(result?.registrationForm);} catch {throw new Error('INVALID_SYNC_RESULT');}
      if(result.eventId!==eventId || result.year!==date.slice(0,4) || url.protocol!=='https:' || url.hostname!=='docs.google.com' || !/^\/forms\/d\//.test(url.pathname)) throw new Error('INVALID_SYNC_RESULT');
      return data.set('registrationForm',url.href).set('registrationEventId',result.eventId).set('registrationYear',result.year).delete('registrationRefreshRequested');
    } catch(error) {
      const reason=['POPUP_BLOCKED','LOGIN_TIMEOUT','GOOGLE_NOT_READY','LOGIN_CANCELLED'].includes(error.message)?'구글 연결을 다시 진행하려면 신청받기를 끈 뒤 다시 켜 주세요.':error.message==='EVENT_LABEL_CONFLICT'?'기존 구글 폼의 행사 연결 정보와 충돌했습니다. 제목은 바꾸지 말고 연결 정보를 확인해 주세요.':error.message==='EVENT_YEAR_CHANGED'?'이미 연결한 행사의 연도가 바뀌었습니다. 기존 신청 명단을 보존하기 위해 자동 이동을 중단했습니다.':error.message==='AUTOMATION_NOT_CONFIGURED' || error.message==='INVALID_ACTION' || error.message==='REGISTRATION_CODE_OUTDATED'?'구글 연결 코드 업데이트가 먼저 필요합니다.':'구글 연결을 완료하지 못했습니다. ('+error.message+')';
      window.alert(reason+' 일정 저장을 중단했습니다. 다시 시도해 주세요.');
      throw error;
    }
  };
  const boardValidation=async({entry})=>{
    const group=entry.get('collection'), data=entry.get('data').toJS();
    let message='';
    if(group==='insights'){
      if(data.sourceInfo?.length!==1) message='제목 위 표시를 하나 선택해 주세요.';
      else if(data.sourceInfo[0].type==='other' && !data.sourceInfo[0].label?.trim()) message='기타를 선택하면 표시할 이름을 반드시 입력해야 합니다.';
    }
    if(group==='notices' && data.noticeCategory && !['participation','association','recruitment'].includes(data.noticeCategory)) message='공지 분류를 다시 선택해 주세요.';
    if(group==='insights' && (data.tags?.length || 0)>5) message='해시태그는 최대 5개입니다.';
    if(group==='insights' && (data.tags || []).some(tag=>Array.from(tag).length>15)) message='해시태그는 하나당 15자 이내로 입력해 주세요.';
    if(group==='calendar' && (!Array.isArray(data.rsvps) || !data.rsvps.length || data.rsvps.some(item=>typeof item!=='string' || !item.trim()))) message='참가 대상을 입력해 주세요. 빈 입력칸은 채우거나 삭제해 주세요.';
    if(group==='calendar' && data.registrationEnabled===true) {
      const config=data.participationFee;
      const fees=config?.paid===false?[]:(Array.isArray(config)?config:(Array.isArray(config?.fees) ? config.fees : []));
      const questions=Array.isArray(config?.questions)?config.questions:defaultRegistrationQuestions();
      if(fees.some(item=>!String(item?.grade || '').trim() || String(item?.amount ?? '').trim()==='' || !Number.isFinite(Number(item.amount)) || Number(item.amount)<0)) message='참가비 등급과 금액을 입력해 주세요. 빈 입력칸은 채우거나 삭제해 주세요.';
      if(questions.length>20 || questions.some(item=>!String(item?.title || '').trim() || !['text','paragraph','select','checkbox'].includes(item?.type) || (['select','checkbox'].includes(item.type) && (!Array.isArray(item.options) || item.options.some(option=>!String(option).trim()) || item.options.length<2)))) message='신청 질문의 제목과 선택지를 확인해 주세요. 선택형 질문에는 두 개 이상의 선택지가 필요합니다.';
    }
    if(message){window.alert(message);throw new Error(message);}
    if(group === 'member_filters') {
      const categories = data.categories || [];
      const ids = categories.map(item => String(item.id || '').trim());
      const names = categories.map(item => String(item.label || '').normalize('NFKC').trim().replace(/\s+/g, '').toLocaleLowerCase());
      if(categories.length > 6 || names.some(name => !name) || new Set(names).size !== names.length || names.includes(String(data.allLabel || '').normalize('NFKC').trim().replace(/\s+/g, '').toLocaleLowerCase())) {
        const message = categories.length > 6 ? '업종 분류는 최대 6개까지 등록할 수 있습니다.' : names.some(name => !name) ? '분류명을 입력하거나 해당 줄을 삭제해 주세요.' : '분류명이 중복됩니다. 전체 보기 문구와 다른 이름을 입력해 주세요.';
        window.alert(message); throw new Error(message);
      }
      if(ids.some(id => !id || id === '전체') || new Set(ids).size !== ids.length || categories.some(item => !String(item.label || '').trim())) {
        throw new Error('분류 정보를 확인해 주세요. 새로 추가한 줄을 삭제하고 다시 추가해 주세요.');
      }
      return entry.get('data');
    }
    if(!localMode) await window.KSISContentGuard.check({entry});
    const result = await syncCalendarRegistration(entry);
    if (group === 'calendar') return result;
    let user = null;
    try { user = JSON.parse(localStorage.getItem('decap-cms-user') || 'null'); } catch {}
    const author = user?.name || user?.login || user?.email || (localMode ? '로컬 관리자' : '작성자 미상');
    const now = new Date().toISOString();
    return result.set('cmsCreatedAt', result.get('cmsCreatedAt') || now)
      .set('cmsUpdatedAt', now).set('cmsAuthor', result.get('cmsAuthor') || author)
      .set('cmsEditor', author);
  };
  CMS.registerEventListener({name:'preSave',handler:boardValidation});
  CMS.registerEventListener({name:'prePublish',handler:boardValidation});
  const closeCalendarRegistration=async({entry})=>{
    if(!entry || entry.get('collection')!=='calendar') return;
    const data=entry.get('data');
    if(!data.get('registrationEnabled') && !data.get('registrationYear') && !data.get('registrationForm') && !data.get('registrationEventId')) return;
    const eventId=await registrationIdFor(entry,data,false),title=data.get('title'),date=data.get('date');
    try {
      if(!eventId || !title || !date) throw new Error('MISSING_REGISTRATION_METADATA');
      const result=await window.KSISRegistration.call({action:'sync',formStructure:'per-event',eventId,title,date,enabled:false});
      if(result?.eventId!==eventId || result.disabled!==true || result.schemaVersion!==4) throw new Error('CLOSE_NOT_CONFIRMED');
    } catch(error) {
      window.alert('구글 폼의 행사 접수를 닫지 못해 일정 삭제를 중단했습니다. 구글 계정을 연결한 뒤 다시 삭제해 주세요. ('+error.message+')');
      throw error;
    }
  };
  CMS.registerEventListener({name:'preUnpublish',handler:closeCalendarRegistration});

  const alignField = {label:'글 정렬',name:'align',widget:'alignment',required:false,allowJustify:true};
  const blocks = {
    label: '본문 — 위에서 아래 순서대로 표시됩니다', name: 'contentBlocks', widget: 'list',
    types: [
      { label: '문단', name: 'text', widget: 'object', fields: [{label: '내용', name: 'text', widget: 'text'}, alignField] },
      { label: '소제목', name: 'heading', widget: 'object', fields: [{label: '소제목', name: 'text', widget: 'string'}, alignField] },
      { label: '일반 링크', name: 'link', widget: 'object', fields: [
        {label:'표시할 문구', name:'text', widget:'string'},
        {label:'주소 (https://로 시작)', name:'url', widget:'string', pattern:['^https?://[^\\s]+$', 'http:// 또는 https:// 주소를 입력해 주세요.']},
        {...alignField,label:'카드 위치',allowJustify:false},
      ] },
      { label: '강조박스', name: 'quote', widget: 'object', fields: [{label: '내용', name: 'text', widget: 'text'}, alignField] },
      { label: '사진 한 장', name: 'image', widget: 'object', fields: [
        {label: '사진 첨부', name: 'src', widget: 'image'},
        {label: '사진 설명', name: 'alt', widget: 'string', required: false},
        {...alignField,label:'사진 위치',allowJustify:false},
      ] },
      { label: '사진 여러 장 · 슬라이더', name: 'gallery', widget: 'object', fields: [
        {label: '표시 방식', name: 'layout', widget: 'select', default: 'slider', options: [
          {label: '슬라이더', value: 'slider'}, {label: '격자', value: 'grid'},
          {label: '가로 스크롤', value: 'scroll'}, {label: '대표 사진 강조', value: 'featured'},
        ]},
        {label: '갤러리 사진 — 표시 순서', name: 'images', widget: 'list', fields: [
          {label: '사진 첨부', name: 'url', widget: 'image'},
          {label: '설명', name: 'caption', widget: 'string', required: false},
        ]},
      ] },
    ],
  };
  const menus = [
    ['forum', '비즈니스 포럼'], ['foodculture', '소모임 · 식문화'],
    ['bookclub', '소모임 · 북클럽'], ['local', '소모임 · 로컬탐방'],
    ['education', 'AI · 마케팅 · 창업 교육'],
  ];
  CMS.init({ config: {
    load_config_file: false, locale: 'ko',
    backend: localMode ? {name:'git-gateway'} : {
      name:'github',repo:'rebornsenior/KSIS',branch:'main',
      base_url:'https://www.rebornsenior.com',auth_endpoint:'api/auth',
    },
    ...(localMode ? {local_backend:{url:'http://127.0.0.1:8081/api/v1'}} : {publish_mode:'editorial_workflow'}),
    media_folder: 'public/media', public_folder: '/media',
    collections: [{name:'member_filters',label:'회원사 분류 관리',editor:{preview:false},files:[{name:'filters',label:'분류 관리',file:'src/content/settings/member-filters.json',fields:[{label:'전체 보기 문구',name:'allLabel',widget:'string'},{label:'업종 분류',name:'categories',widget:'member-categories',required:false}]}]}, ...menus.map(([name, label]) => ({
      name, label, folder: `src/content/${name}`, create: true, format: 'json',
      identifier_field: 'name', slug: '{{year}}{{month}}{{day}}-{{slug}}',
      description: localMode ? '로컬 파일 저장 모드입니다. 이 컴퓨터의 글·사진 파일에만 저장하며 GitHub 전송과 공개 배포는 하지 않습니다.' : '초안 저장과 공개 게시를 구분합니다. 공개 게시 후 배포 완료까지 기다려 주세요.',
      fields: [
        {label: '제목', name: 'name', widget: 'string'},
        {label: '날짜', name: 'date', widget: 'datetime', format: 'YYYY.MM.DD', date_format: 'YYYY.MM.DD', time_format: false},
        {label: '작성자 / 강연자', name: 'specialty', widget: 'string'},
        {label: '목록에 표시할 소개', name: 'desc', widget: 'text'},
        {label: '대표 사진', name: 'image', widget: 'image'},
        {label: '분류', name: 'category', widget: 'hidden', default: ({foodculture:'food',bookclub:'book',local:'local',education:'marketing'})[name] || 'forum'},
        {label: '분류 이름', name: 'categoryName', widget: 'string', default: label},
        ...(name === 'education' ? [{label: '교육 기간', name: 'duration', widget: 'string', required: false}] : []),
        {...blocks, types: blocks.types.map(t => t.name === 'gallery' && (name === 'forum' || name === 'education')
          ? {...t, fields: [{label:'표시 방식', name:'layout', widget:'hidden', default:'slider'}, ...t.fields.slice(1)]} : t)},
      ],
    })), {
      name:'shopping', label:'회원사 소개', folder:'src/content/shopping',
      create:true, format:'json', identifier_field:'name', slug:'{{slug}}', editor:{preview:false},
      description:'기업을 추가하면 PROJECT 회원사 소개 목록에 표시됩니다. 회사 설명은 빈 줄로 문단을 나눌 수 있습니다.',
      fields:[
        {label:'회사명',name:'name',widget:'string'},
        {label:'업종 분류',name:'industry',widget:'relation',collection:'member_filters',file:'filters',search_fields:['categories.*.label'],value_field:'categories.*.id',display_fields:['categories.*.label'],hint:'회원사 소개 페이지의 업종 필터에 사용됩니다.'},
        {label:'대표명',name:'representative',widget:'string'},
        {label:'짧은 한줄 소개',name:'tagline',widget:'string'},
        {label:'해시태그',name:'tags',widget:'company-tags',required:false,hint:'최대 4개 · 각 10자 이내(공백 포함). # 없이 하나씩 입력하세요. 홈페이지에서 #이 자동으로 붙습니다.'},
        {label:'회사 설명',name:'description',widget:'text',hint:'문단 사이에 빈 줄을 넣으면 홈페이지에서도 문단이 나뉩니다.'},
        {label:'회사 링크',name:'link',widget:'string',pattern:['^https?://[^\\s]+$','http:// 또는 https:// 주소를 입력해 주세요.']},
        {label:'회사 로고',name:'logo',widget:'image'},
        {label:'회사 대표 이미지 · 왼쪽',name:'image',widget:'image',hint:'권장 비율 4:3 · 권장 크기 1200×900px 이상. 화면 크기에 따라 가장자리가 잘릴 수 있으니 주요 이미지와 문구는 중앙에 배치해 주세요.'},
        {name:'categoryName',widget:'hidden',required:false,default:'KSIS 정회원사'},
      ],
    }, {
      name:'calendar', label:'협회 일정', folder:'src/content/calendar',
      create:true, format:'json', identifier_field:'title',
      slug:'{{year}}{{month}}{{day}}-{{slug}}', editor:{preview:false},
      description:'일정을 게시하면 홈 화면과 캘린더에 함께 반영됩니다. 참가 대상은 안내 문구이며 신청자 명단이 아닙니다.',
      fields:[
        {label:'기존 일정 식별자',name:'id',widget:'hidden',required:false},
        {label:'일정 제목',name:'title',widget:'string'},
        {label:'일정 날짜',name:'date',widget:'datetime',format:'YYYY-MM-DD',date_format:'YYYY-MM-DD',time_format:false},
        {label:'시간 안내',name:'time',widget:'string',hint:'예: 09:00 - 11:00, 14:00 - 16:00'},
        {label:'장소',name:'location',widget:'string'},
        {label:'일정 설명',name:'description',widget:'text'},
        {label:'분류',name:'category',widget:'select',options:[{label:'정기 포럼',value:'forum'},{label:'교육 특강',value:'education'},{label:'수익 실무',value:'monetize'},{label:'친목 소모임',value:'other'}]},
        {label:'참가 대상',name:'rsvps',widget:'event-audience',required:true,hint:'참가 가능한 대상을 입력하세요. 예: 협회 회원, 일반 참가자'},
        {label:'참가 신청 접수',name:'registrationEnabled',widget:'registration-enabled',default:false,required:true},
        {label:'신청 질문·참가비 편집',name:'participationFee',widget:'registration-builder',required:true,conditional:{field:'registrationEnabled',value:true}},
        {label:' ',name:'registrationForm',widget:'registration-form',required:true},
        {label:'이 행사 신청자 명단',name:'registrationEventId',widget:'registration-roster',required:false},
        {label:'신청 연결 연도',name:'registrationYear',widget:'hidden',required:false},
        {label:'행사 상세 안내 링크',name:'link',widget:'string',required:false,pattern:['^https?://[^\\s]+$', 'http:// 또는 https:// 주소를 입력해 주세요.']},
      ],
    },
    {
      name:'gallery',label:'활동 갤러리',folder:'src/content/gallery',create:true,format:'json',identifier_field:'title',slug:'{{year}}{{month}}{{day}}-{{slug}}',
      fields:[
        {label:'앨범 제목',name:'title',widget:'string'},
        {label:'작성자',name:'author',widget:'string',pattern:['.*\\S.*','작성자 이름을 입력해 주세요.']},
        {label:'활동 날짜',name:'date',widget:'datetime',format:'YYYY-MM-DD',time_format:false},
        {label:'대표 사진',name:'image',widget:'image'},
        {label:'앨범 사진',name:'images',widget:'album-photos',media_library:{allow_multiple:true},required:true},
        {label:'관련 게시글 링크 (선택사항)',name:'relatedUrl',widget:'string',required:false,pattern:['^(https?://|/#[/]post/)','홈페이지 게시글 경로 /#/post/... 또는 https:// 주소를 입력하세요.'],hint:'연결한 경우 앨범에 관련 게시글 보기 버튼이 표시됩니다.'},
      ],
    },
    ...['notices','insights'].map(name=>({
      name,label:name==='notices'?'공지사항':'인사이트',folder:'src/content/'+name,
      create:true,format:'json',identifier_field:'title',slug:'{{year}}{{month}}{{day}}-{{slug}}',
      ...(name==='insights'?{editor:{preview:false}}:{}),
      fields:[
        {label:'제목',name:'title',widget:'string'},
        {label:'날짜',name:'date',widget:'datetime',format:'YYYY.MM.DD',time_format:false},
        ...(name==='notices' ? [
          {label:'공지 분류 (선택사항)',name:'noticeCategory',widget:'select',required:false,options:[{label:'참가 신청',value:'participation'},{label:'협회 소식',value:'association'},{label:'모집 안내',value:'recruitment'}],hint:'해당하는 분류가 없으면 선택하지 않아도 됩니다.'},
        ] : [
                  {label:'제목 위 표시 — 하나만 선택',name:'sourceInfo',widget:'list',min:1,max:1,types:[
          {label:'네이버 카페',name:'naver',widget:'object',fields:[{name:'label',widget:'hidden',default:'네이버 카페'}]},
          ...(name==='notices' ? menus.map(([group,label])=>({label,name:group,widget:'object',fields:[{name:'label',widget:'hidden',default:label}]})) : [{label:'뉴스',name:'news',widget:'object',fields:[{name:'label',widget:'hidden',default:'뉴스'}]}]),
          {label:'기타(직접 입력)',name:'other',widget:'object',fields:[{label:'표시할 이름 (필수)',name:'label',widget:'string',required:true,pattern:['.*\\S.*','표시할 이름을 입력해 주세요.']}]},
        ]}
        ]),
        ...(name==='notices' ? [
          {label:'작성자',name:'specialty',widget:'string'},
          {label:'소개',name:'desc',widget:'text',required:false},
          {label:'대표 사진',name:'image',widget:'image',required:false},
          blocks,
        ] : [
          {label:'외부 링크',name:'url',widget:'string',pattern:['^https?://[^\\s]+$','http:// 또는 https:// 주소를 입력해 주세요.']},
          {label:'해시태그 — 최대 5개, 각각 15자',name:'tags',widget:'list',max:5,required:false,field:{label:'태그 (15자 이내)',name:'tag',widget:'string'}},
        ]),
      ],
    })),
    ].map(collection => (collection.name === 'calendar' || collection.files) ? collection : ({
      ...collection,
      summary: collection.name === 'shopping'
        ? '{{name}} ⟦KSIS⟧ {{representative}}'
        : '{{' + (collection.identifier_field || 'title') + '}} ⟦KSIS⟧ {{cmsUpdatedAt}} ⟦KSIS⟧ {{cmsAuthor}} ⟦KSIS⟧ {{date}} ⟦KSIS⟧ {{specialty}} ⟦KSIS⟧ {{author}}',
      fields: [...collection.fields, ...['cmsCreatedAt','cmsUpdatedAt','cmsAuthor','cmsEditor'].map(name => ({name,widget:'hidden',required:false}))],
    })),
  }});
  const SliderPreview = window.createClass({
    getInitialState() { return {index:0}; },
    render() {
      const h = window.h;
      const images = this.props.images || [];
      if (!images.length) return h('p', {}, '갤러리에 사진을 추가해 주세요.');
      const index = Math.min(this.state.index, images.length - 1);
      const move = delta => this.setState({index:(index + delta + images.length) % images.length});
      return h('div', {style:{position:'relative', margin:'24px 0', padding:'16px', background:'#f8fafc', borderRadius:'24px'}},
        h('img', {src:String(this.props.getAsset(images[index].url)), alt:images[index].caption || '', style:{width:'100%', height:'320px', objectFit:'contain', background:'#f1f5f9', borderRadius:'16px'}}),
        images.length > 1 && h('button', {type:'button', 'aria-label':'이전 사진', onClick:() => move(-1), style:{position:'absolute',left:'24px',top:'45%'}}, '❮'),
        images.length > 1 && h('button', {type:'button', 'aria-label':'다음 사진', onClick:() => move(1), style:{position:'absolute',right:'24px',top:'45%'}}, '❯'),
        h('p', {style:{textAlign:'center'}}, `${index + 1} / ${images.length}`));
    },
  });
  const WebsitePreview = window.createClass({
    componentDidMount() {
      this.receive = event => {
        if (event.origin === location.origin && event.source === this.frame?.contentWindow && event.data?.type === 'ksis-preview-ready') this.send();
      };
      window.addEventListener('message', this.receive);
      this.retry = setInterval(() => this.send(), 1500);
    },
    componentWillUnmount() { window.removeEventListener('message', this.receive); clearInterval(this.retry); },
    componentDidUpdate() { this.send(); },
    send() {
      if (!this.frame) return;
      const props = this.props;
      const post = props.entry.get('data').toJS();
      const asset = value => value ? String(props.getAsset(value)) : '';
      post.name = post.name || post.title;
      post.image = asset(post.image);
      post.contentBlocks = (post.contentBlocks || []).map(block => ({...block,
        ...(block.src ? {src:asset(block.src)} : {}),
        ...(block.images ? {images:block.images.map(img => ({...img,url:asset(img.url)}))} : {}),
      }));
      this.frame.contentWindow.postMessage({type:'ksis-preview',group:props.entry.get('collection'),post}, location.origin);
    },
    render() {
      return window.h('div', {},
        window.h('p', {}, '기존 홈페이지 표시 확인 · 저장/공개하지 않습니다'),
        window.h('iframe', {title:'실제 홈페이지 글 미리보기', src:location.origin + '/#/content-preview',
          ref:frame => {this.frame = frame;}, onLoad:() => this.send(),
          style:{width:'100%',height:'1100px',border:0}}));
    },
  });
  for (const [name] of menus) CMS.registerPreviewTemplate(name, WebsitePreview);
  CMS.registerPreviewTemplate('notices', WebsitePreview);
  function preview({entry, getAsset}) {
    const h = window.h;
    const data = entry.get('data').toJS();
    return h('article', {style: {padding: '24px', color: '#002147', fontFamily: 'sans-serif'}},
      h('p', {}, '입력 내용 확인 · 홈페이지와 동일한 미리보기는 추후 연결'),
      h('h1', {}, data.name || '제목'), h('p', {}, data.date || ''),
      ...(data.contentBlocks || []).map((b, i) => {
        if (b.type === 'image') return h('img', {key:i, src:String(getAsset(b.src)), alt:b.alt || '', style:{maxWidth:'100%'}});
        if (b.type === 'gallery') {
          if (!b.layout || b.layout === 'slider') return h(SliderPreview, {key:i, images:b.images, getAsset});
          return h('div', {key:i}, ...(b.images || []).map((img,j) => h('figure', {key:j}, h('img',{src:String(getAsset(img.url)),style:{maxWidth:'100%'}}),h('figcaption',{},img.caption || ''))));
        }
        const community = !['forum', 'education'].includes(entry.get('collection'));
        const quoteStyle = community
          ? {borderLeft:'4px solid #f59e0b', borderRadius:'16px', padding:'16px 24px', background:'#f8fafc', fontWeight:'bold'}
          : {borderLeft:'5px solid #002147', padding:'20px', background:'#f1f5f9', fontWeight:600, fontStyle:'italic'};
        return h(b.type === 'heading' ? 'h2' : b.type === 'quote' ? 'blockquote' : 'p', {key:i, style:{whiteSpace:'pre-wrap', ...(b.type === 'quote' ? quoteStyle : {})}}, b.text || '');
      }));
  }
}












