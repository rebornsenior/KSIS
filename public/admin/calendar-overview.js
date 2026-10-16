/* Calendar overview for the Decap calendar collection only. No response data. */
(() => {
  const id='ksis-calendar-overview';
  const categories={forum:'정기 포럼',education:'교육 특강',monetize:'수익 실무',other:'친목 소모임'};
  let events=[],month=new Date(),selected='',initialized=false,generation=0;
  month=new Date(month.getFullYear(),month.getMonth(),1);
  const key=date=>date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');
  const el=(tag,text,attrs={})=>{
    const node=document.createElement(tag);if(text!==null)node.textContent=text;
    for(const [name,value] of Object.entries(attrs))node.setAttribute(name,value);
    return node;
  };
  function render(panel) {
    if(!panel.isConnected)return;
    panel.replaceChildren();
    const top=el('div',null,{class:'kc-top'}),nav=el('div',null,{class:'kc-nav'});
    const button=(text,label,fn)=>{const b=el('button',text,{type:'button','aria-label':label});b.onclick=fn;return b;};
    nav.append(button('‹','이전 달',()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);selected='';render(panel);}),el('h2',month.getFullYear()+'년 '+(month.getMonth()+1)+'월'),button('›','다음 달',()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);selected='';render(panel);}));
    const actions=el('div',null,{class:'kc-actions'});
    actions.append(button('이번 달','이번 달로 이동',()=>{const now=new Date();month=new Date(now.getFullYear(),now.getMonth(),1);selected='';render(panel);}),button('새로고침','게시 일정 새로고침',()=>load(panel)));
    top.append(nav,actions);panel.append(top);
    const grid=el('div',null,{class:'kc-layout'}),calendar=el('div',null,{class:'kc-calendar'}),list=el('div',null,{class:'kc-events'});
    const cells=el('div',null,{class:'kc-days',role:'group','aria-label':'월간 일정 날짜'});
    for(const day of ['일','월','화','수','목','금','토'])cells.append(el('span',day,{class:'kc-weekday'}));
    for(let i=0;i<month.getDay();i++)cells.append(el('span','',{'aria-hidden':'true'}));
    const monthly=events.filter(event=>event.date.startsWith(key(month)));
    const today=new Date(),todayKey=key(today)+'-'+String(today.getDate()).padStart(2,'0');
    for(let day=1;day<=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();day++) {
      const date=key(month)+'-'+String(day).padStart(2,'0'),count=monthly.filter(event=>event.date===date).length;
      const b=button(String(day),date+' · '+count+'개 일정',()=>{selected=selected===date?'':date;render(panel);});
      b.className='kc-day'+(count?' kc-has-events':'')+(date===todayKey?' kc-today':'')+(date===selected?' kc-selected':'');
      b.setAttribute('aria-pressed',String(date===selected));
      if(count)b.append(el('span',String(count),{class:'kc-count','aria-hidden':'true'}));
      cells.append(b);
    }
    calendar.append(cells,el('p','날짜를 누르면 오른쪽 목록에서 해당 날짜가 강조됩니다.',{class:'kc-note'}));
    list.append(el('h3','이 달의 일정',{}),el('p','총 '+monthly.length+'개 · 날짜순',{class:'kc-note'}));
    const rows=el('div',null,{class:'kc-rows'});
    if(!monthly.length)rows.append(el('p','이 달에는 등록된 일정이 없습니다.',{class:'kc-empty'}));
    for(const event of monthly) {
      const link=el('a',null,{href:'#/collections/calendar/entries/'+encodeURIComponent(event.slug),class:'kc-event'+(event.date===selected?' kc-highlight':'')});
      const weekday=['일','월','화','수','목','금','토'][new Date(event.date+'T12:00:00').getDay()];
      link.append(el('span',event.date.replace(/-/g,'.')+' ('+weekday+')'+(event.time?' · '+event.time:''),{class:'kc-date'}),el('strong',event.title),el('span',categories[event.category] || event.category || '일정',{class:'kc-category'}));
      rows.append(link);
    }
    list.append(rows);grid.append(calendar,list);panel.append(grid);
    panel.append(el('p','게시된 일정 기준입니다. 제목을 누르면 해당 일정 편집 화면으로 이동합니다.',{class:'kc-note'}));
  }
  async function load(panel) {
    const current=++generation;
    panel.replaceChildren(el('p','일정을 불러오고 있습니다.',{role:'status'}));
    try {
      const response=await fetch('/admin/calendar-index.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw Error();
      const data=await response.json();
      if(!Array.isArray(data))throw Error();
      if(current!==generation || !panel.isConnected)return;
      events=data.filter(event=>typeof event.slug==='string' && !/[\\/]/.test(event.slug) && typeof event.title==='string' && /^\d{4}-\d{2}-\d{2}$/.test(event.date)).sort((a,b)=>a.date.localeCompare(b.date)||String(a.time||'').localeCompare(String(b.time||''))||a.title.localeCompare(b.title,'ko'));
      if(!initialized) {
        initialized=true;
        if(events.length && !events.some(event=>event.date.startsWith(key(month)))) {
          const nearest=events.reduce((a,b)=>Math.abs(Date.parse(a.date)-Date.now())<Math.abs(Date.parse(b.date)-Date.now())?a:b);
          const [year,m]=nearest.date.split('-').map(Number);month=new Date(year,m-1,1);
        }
      }
      render(panel);
    } catch {
      if(current!==generation || !panel.isConnected)return;
      panel.replaceChildren(el('p','달력을 불러오지 못했습니다. 다시 불러오기를 눌러 주세요.',{role:'alert'}));
      const retry=el('button','다시 불러오기',{type:'button'});retry.onclick=()=>load(panel);panel.append(retry);
    }
  }
  function mount() {
    const old=document.getElementById(id);
    if(!/^#\/collections\/calendar\/?$/.test(location.hash)) {if(old){old.remove();generation++;}return;}
    if(old)return;
    const heading=[...document.querySelectorAll('h1')].find(node=>node.textContent.trim()==='협회 일정');
    if(!heading)return;
    const header=heading.parentElement?.parentElement;
    if(!header?.parentElement)return;
    const panel=el('section',null,{id,'aria-label':'협회 일정 달력과 월별 목록'});
    header.after(panel);load(panel);
  }
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='/admin/calendar-overview.css';document.head.append(stylesheet);
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',mount);mount();
})();
