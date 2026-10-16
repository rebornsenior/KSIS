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

  // Form URL is CMS content; private responses are fetched only in the local panel.
  const RegistrationFormControl = window.createClass({
    render() {
      const h=window.h, value=this.props.value || '';
      let embed='';
      try {
        const url=new URL(value);
        if(url.protocol==='https:' && url.hostname==='docs.google.com' && /^\/forms\/d\/(?:e\/)?[a-zA-Z0-9_-]+\/viewform$/.test(url.pathname)) {
          url.searchParams.set('embedded','true'); embed=url.href;
        }
      } catch {}
      return h('div',{},
        h('input',{type:'url',id:this.props.forID,value,placeholder:'Google Forms 신청자용 긴 링크',onChange:e=>this.props.onChange(e.target.value),style:{width:'100%',padding:'12px',border:'1px solid #cbd5e1',borderRadius:'4px'}}),
        h('p',{},'보기 전용 신청서입니다. 여기서는 입력·제출할 수 없습니다. 일정 저장은 화면 맨 위의 게시 버튼을 사용하세요.'),
        embed && h('a',{href:value,target:'_blank',rel:'noopener noreferrer'},'실제 신청서 새 창에서 확인 · 제출 시 실제 접수'),
        embed ? h('div',{inert:true,'aria-label':'보기 전용 신청서 미리보기'},h('iframe',{title:'참가 신청 폼 미리보기 · 입력 및 제출 불가',src:embed,tabIndex:-1,sandbox:'allow-scripts allow-same-origin',referrerPolicy:'no-referrer',style:{width:'100%',height:'750px',border:'1px solid #e2e8f0',borderRadius:'6px'}})) : h('p',{},'Google Forms의 /viewform 긴 주소를 입력하세요.')
      );
    }
  });
  CMS.registerWidget('registration-form',RegistrationFormControl);
  const RegistrationRosterControl = window.createClass({
    getInitialState() { return {open:false}; },
    componentDidMount() {
      if(!this.props.value) this.props.onChange('evt-'+crypto.randomUUID());
    },
    componentDidUpdate(previous) {
      if(previous.value!==this.props.value && this.state.open) this.setState({open:false});
    },
    render() {
      const h=window.h,value=this.props.value || '';
      return h('div',{},
        h('p',{},'「신청 받기」를 켜고 일정을 저장하면 행사 날짜의 연도에 맞는 공용 폼과 명단이 연결됩니다. 처음 연결할 때 구글 로그인이 필요합니다. 일정 삭제 전에는 신청 받기를 끄고 저장해 접수를 닫아 주세요.'),
        h('button',{type:'button',disabled:!value,onClick:()=>this.setState({open:!this.state.open}),style:{padding:'10px 16px',border:'1px solid #cbd5e1',borderRadius:'6px',background:'#002147',color:'white',cursor:'pointer'}},this.state.open?'신청 명단 닫기':'신청 명단 열기'),
        this.state.open && h('iframe',{key:value,title:'이 일정의 신청 명단 관리',src:'/admin/registration-manager.html?event='+encodeURIComponent(value),style:{width:'100%',height:'620px',border:'1px solid #e2e8f0',borderRadius:'6px',marginTop:'16px'}})
      );
    }
  });
  CMS.registerWidget('registration-roster',RegistrationRosterControl);
  const RegistrationRefreshControl=window.createClass({
    render() {
      const h=window.h;
      return h('div',{},
        h('button',{type:'button',onClick:()=>this.props.onChange(new Date().toISOString()),style:{padding:'10px 16px',border:'1px solid #cbd5e1',borderRadius:'6px',background:'#002147',color:'white',cursor:'pointer'}},'신청 연결 갱신 예약'),
        h('p',{'aria-live':'polite'},this.props.value?'갱신이 예약됐습니다. 신청 받기를 켜고 화면 맨 위의 게시 버튼으로 저장하세요.':'기존 일정의 폼 표시를 업데이트할 때 누르세요. 행사 내용이나 신청 응답은 바꾸지 않습니다.')
      );
    }
  });
  CMS.registerWidget('registration-refresh',RegistrationRefreshControl);
  const syncCalendarRegistration=async(entry)=>{
    let data=entry.get('data');
    if(entry.get('collection')!=='calendar') return data;
    const enabled=data.get('registrationEnabled')===true;
    if(!enabled && data.get('registrationRefreshRequested')) {
      window.alert('신청 연결을 갱신하려면 신청 받기를 켠 뒤 다시 게시하세요.');
      throw new Error('REGISTRATION_DISABLED');
    }
    if(!enabled && !data.get('registrationYear')) return data;
    const eventId=data.get('registrationEventId'),title=data.get('title'),date=data.get('date');
    if(!eventId || !title?.trim() || !date) throw new Error('신청 연결을 위해 일정 제목과 날짜를 입력해 주세요.');
    try {
      const result=await window.KSISRegistration.call({action:'sync',eventId,title,date,enabled});
      if(!enabled) {
        if(result?.eventId!==eventId || result.disabled!==true) throw new Error('INVALID_SYNC_RESULT');
        return data.set('registrationForm','').delete('registrationRefreshRequested');
      }
      let url;
      try {url=new URL(result?.registrationForm);} catch {throw new Error('INVALID_SYNC_RESULT');}
      if(result.eventId!==eventId || result.year!==date.slice(0,4) || url.protocol!=='https:' || url.hostname!=='docs.google.com' || !/^\/forms\/d\//.test(url.pathname)) throw new Error('INVALID_SYNC_RESULT');
      return data.set('registrationForm',url.href).set('registrationEventId',result.eventId).set('registrationYear',result.year).delete('registrationRefreshRequested');
    } catch(error) {
      const reason=error.message==='EVENT_LABEL_CONFLICT'?'같은 날짜와 제목을 사용한 다른 행사가 있어 명단을 구분할 수 없습니다. 제목을 다르게 입력해 주세요.':error.message==='EVENT_YEAR_CHANGED'?'이미 연결한 행사의 연도가 바뀌었습니다. 기존 신청 명단을 보존하기 위해 자동 이동을 중단했습니다.':error.message==='AUTOMATION_NOT_CONFIGURED' || error.message==='INVALID_ACTION'?'구글 연결 코드 업데이트가 먼저 필요합니다.':'구글 연결을 완료하지 못했습니다. ('+error.message+')';
      window.alert(reason+' 일정 저장을 중단했습니다. 다시 시도해 주세요.');
      throw error;
    }
  };
  const boardValidation=async({entry})=>{
    const group=entry.get('collection'), data=entry.get('data').toJS();
    let message='';
    if(['notices','insights'].includes(group)){
      if(data.sourceInfo?.length!==1) message='제목 위 표시를 하나 선택해 주세요.';
      else if(data.sourceInfo[0].type==='other' && !data.sourceInfo[0].label?.trim()) message='기타를 선택하면 표시할 이름을 반드시 입력해야 합니다.';
    }
    if(group==='insights' && (data.tags?.length || 0)>5) message='해시태그는 최대 5개입니다.';
    if(group==='insights' && (data.tags || []).some(tag=>Array.from(tag).length>15)) message='해시태그는 하나당 15자 이내로 입력해 주세요.';
    if(message){window.alert(message);throw new Error(message);}
    if(!localMode) await window.KSISContentGuard.check({entry});
    return syncCalendarRegistration(entry);
  };
  CMS.registerEventListener({name:'preSave',handler:boardValidation});
  CMS.registerEventListener({name:'prePublish',handler:boardValidation});

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
    collections: [...menus.map(([name, label]) => ({
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
        {label:'참가 대상 안내',name:'rsvps',widget:'list',required:false,field:{label:'참가 대상',name:'audience',widget:'string'},hint:'회원·일반 참가자 등의 안내만 입력하세요. 이름·전화번호 등 신청자 정보는 입력하지 마세요.'},
        {label:'신청 받기 · 저장 시 구글 폼 자동 연결',name:'registrationEnabled',widget:'boolean',default:false,required:false,hint:'저장 시 실제 구글 폼에 행사 옵션이 추가됩니다. 행사 연도 폼이 없으면 생성됩니다.'},
        {label:'신청 연결 갱신',name:'registrationRefreshRequested',widget:'registration-refresh',required:false},
        {label:'참가 신청 폼 · 화면 미리보기',name:'registrationForm',widget:'registration-form',required:false},
        {label:'신청 명단 관리 · 이 일정',name:'registrationEventId',widget:'registration-roster',required:false},
        {label:'관련 안내 링크',name:'link',widget:'string',required:false,pattern:['^https?://[^\\s]+$', 'http:// 또는 https:// 주소를 입력해 주세요.']},
      ],
    },
    ...['notices','insights'].map(name=>({
      name,label:name==='notices'?'BOARD · 공지사항':'BOARD · 인사이트',folder:'src/content/'+name,
      create:true,format:'json',identifier_field:'title',slug:'{{year}}{{month}}{{day}}-{{slug}}',
      ...(name==='insights'?{editor:{preview:false}}:{}),
      fields:[
        {label:'제목',name:'title',widget:'string'},
        {label:'날짜',name:'date',widget:'datetime',format:'YYYY.MM.DD',time_format:false},
        {label:'제목 위 표시 — 하나만 선택',name:'sourceInfo',widget:'list',min:1,max:1,types:[
          {label:'네이버 카페',name:'naver',widget:'object',fields:[{name:'label',widget:'hidden',default:'네이버 카페'}]},
          ...(name==='notices' ? menus.map(([group,label])=>({label,name:group,widget:'object',fields:[{name:'label',widget:'hidden',default:label}]})) : [{label:'뉴스',name:'news',widget:'object',fields:[{name:'label',widget:'hidden',default:'뉴스'}]}]),
          {label:'기타(직접 입력)',name:'other',widget:'object',fields:[{label:'표시할 이름 (필수)',name:'label',widget:'string',required:true,pattern:['.*\\S.*','표시할 이름을 입력해 주세요.']}]},
        ]},
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
    ],
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
