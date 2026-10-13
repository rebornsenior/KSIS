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
    collections: menus.map(([name, label]) => ({
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
