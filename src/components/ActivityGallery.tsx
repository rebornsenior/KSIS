import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {ArrowDown,ArrowUp,ChevronLeft,ChevronRight,X,ExternalLink} from 'lucide-react';
import {loadPosts} from '../content/load';
import {sortPosts,postDate} from '../content/sort-posts';
import './ActivityGallery.css';

type Album={id:string;title:string;date:string;author?:string;image:string;images:{url:string;caption?:string}[];relatedUrl?:string};
const albums=sortPosts(loadPosts('gallery')) as Album[];
// Local stress preview only: no sample entries are saved or included in production.
const previewCount=import.meta.env.DEV && ['localhost','127.0.0.1','[::1]'].includes(location.hostname)
  ? Math.min(300,Math.max(0,Number(new URLSearchParams(location.search).get('galleryPreview')) || 0)) : 0;
const visibleAlbums=previewCount && albums.length
  ? Array.from({length:previewCount},(_,index)=>({...albums[index%albums.length],id:`preview-${index}`,title:`[미리보기 ${index+1}] ${albums[index%albums.length].title}`})) : albums;
export function galleryLink(value?:string){
  if(!value)return '';
  if(/^\/#\/post\/[a-z]+\/[\w%.-]+$/.test(value))return value;
  try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}
}
export default function ActivityGallery(){
  const reduced=useReducedMotion();
  const [expanded,setExpanded]=useState(false);
  const [album,setAlbum]=useState<Album|null>(null);
  const [index,setIndex]=useState(0);
  const [fullHeight,setFullHeight]=useState(0);
  const [showJump,setShowJump]=useState(false);
  const [jumpBottom,setJumpBottom]=useState(24);
  const viewport=useRef<HTMLDivElement>(null),grid=useRef<HTMLDivElement>(null),end=useRef<HTMLDivElement>(null);
  const close=useRef<HTMLButtonElement>(null),opener=useRef<HTMLButtonElement|null>(null);
  const jumpTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{
    const update=()=>{
      const bounds=viewport.current?.getBoundingClientRect();
      const footerTop=document.querySelector('footer')?.getBoundingClientRect().top;
      setJumpBottom(footerTop===undefined?24:Math.max(24,innerHeight-footerTop+16));
      setShowJump(!!bounds && bounds.top<innerHeight-100 && bounds.bottom>80);
    };
    update();
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update);
    return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
  },[fullHeight,expanded]);
  useEffect(()=>{
    if(!grid.current)return;
    const measure=()=>setFullHeight(grid.current?.offsetHeight || 0);
    measure();const observer=new ResizeObserver(measure);observer.observe(grid.current);
    return()=>observer.disconnect();
  },[]);
  useEffect(()=>()=>{if(jumpTimer.current)clearTimeout(jumpTimer.current);},[]);
  const photos=album?.images?.length?album.images:album?[{url:album.image}]:[];
  useEffect(()=>{
    if(!album)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape')setAlbum(null);
      if(event.key==='ArrowRight')setIndex(value=>(value+1)%photos.length);
      if(event.key==='ArrowLeft')setIndex(value=>(value-1+photos.length)%photos.length);
      if(event.key==='Tab'){
        const dialog=close.current?.closest('[role="dialog"]');
        const controls=Array.from(dialog?.querySelectorAll('button,a[href]') || []) as HTMLElement[];
        const first=controls[0],last=controls[controls.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    window.addEventListener('keydown',key);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',key);opener.current?.focus();};
  },[album,photos.length]);
  const shownAlbums=expanded?visibleAlbums:visibleAlbums.slice(0,12);
  const card=(item:Album)=> <motion.div className="activity-gallery__tile" key={item.id}
    initial={false} animate={{opacity:1,y:0}}
    transition={{duration:reduced?0:.25}}
    ><button type="button" className="activity-gallery__card"
    aria-label={'사진 앨범 열기: '+item.title}
    onClick={event=>{opener.current=event.currentTarget;setIndex(0);setAlbum(item);}}>
      <img src={item.image} alt={item.title} loading="lazy" />
      <span className="activity-gallery__caption"><span><strong>{item.title}</strong><time>{postDate(item.date)}</time></span></span>
    </button></motion.div>;
  const jump=()=>{setExpanded(true);if(jumpTimer.current)clearTimeout(jumpTimer.current);jumpTimer.current=setTimeout(()=>end.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'end'}),reduced?0:650);};
  const jumpToStart=()=>{
    if(jumpTimer.current){clearTimeout(jumpTimer.current);jumpTimer.current=null;}
    document.getElementById('gallery-section')?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
  };
  return <section id="gallery-section" className="activity-gallery">
    <div className="activity-gallery__heading"><span>KSIS ACTIVITY GALLERY</span><h2>협회 주요 활동 갤러리</h2></div>
    <div ref={viewport} className="activity-gallery__viewport">
      <div ref={grid} id="activity-gallery-grid" className="activity-gallery__grid">{shownAlbums.map(card)}</div>

    </div>
    {visibleAlbums.length>12&&<div className="activity-gallery__expand">
      <p>앨범 {visibleAlbums.length}개 중 {shownAlbums.length}개 표시</p>
      <button type="button" aria-expanded={expanded} aria-controls="activity-gallery-grid" onClick={()=>{
        if(jumpTimer.current){clearTimeout(jumpTimer.current);jumpTimer.current=null;}
        if(expanded)jumpToStart();
        setExpanded(!expanded);
      }}>
        <span>{expanded?'앨범 접기':`나머지 ${visibleAlbums.length-12}개 펼쳐보기`}</span>
        {expanded?<ArrowUp size={20}/>:<ArrowDown size={20}/>}
      </button>
    </div>}
    {showJump&&!album&&expanded&&visibleAlbums.length>12&&createPortal(<div className="activity-gallery__jump-row activity-gallery__jump-row--floating" style={{position:'fixed',left:'auto',right:'16px',bottom:`calc(${jumpBottom}px + env(safe-area-inset-bottom, 0px))`,transform:'none',flexDirection:'column',gap:'8px',zIndex:50}}>
      <button type="button" className="activity-gallery__jump" style={{width:'auto',padding:'0 14px',borderRadius:'22px',display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',fontWeight:700}} onClick={jumpToStart} aria-label="갤러리 처음으로" title="갤러리 처음으로"><ArrowUp size={18}/><span>갤러리 처음으로</span></button>
      <button type="button" className="activity-gallery__jump" style={{width:'auto',padding:'0 14px',borderRadius:'22px',display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',fontWeight:700}} onClick={jump} aria-label="갤러리 끝으로" title="갤러리 끝으로"><ArrowDown size={18}/><span>갤러리 끝으로</span></button>
    </div>,document.body)}
    {!albums.length&&<p>등록된 활동 앨범이 없습니다.</p>}
    <div ref={end}/>
    <AnimatePresence>{album&&<motion.div className="activity-gallery__overlay" role="dialog" aria-modal="true" aria-labelledby="activity-album-title" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setAlbum(null)}>
      <div className="activity-gallery__dialog" onClick={event=>event.stopPropagation()}>
        <button ref={close} type="button" className="activity-gallery__close" aria-label="앨범 닫기" onClick={()=>setAlbum(null)}><X/></button>
        <h3 id="activity-album-title">{album.title}</h3><p>{album.author && <>{album.author} · </>}{postDate(album.date)} · {index+1} / {photos.length}</p>
        <div className="activity-gallery__photo"><img src={photos[index]?.url} alt={photos[index]?.caption || album.title}/>
          {photos.length>1&&<><button type="button" aria-label="이전 사진" onClick={()=>setIndex((index-1+photos.length)%photos.length)}><ChevronLeft/></button><button type="button" aria-label="다음 사진" onClick={()=>setIndex((index+1)%photos.length)}><ChevronRight/></button></>}
        </div>
        {photos[index]?.caption&&<p>{photos[index].caption}</p>}
        {galleryLink(album.relatedUrl)&&<a className="activity-gallery__related" href={galleryLink(album.relatedUrl)} target={album.relatedUrl?.startsWith('/')?undefined:'_blank'} rel="noopener noreferrer">관련 게시글 보기 <ExternalLink size={16}/></a>}
        {photos.length>1&&<div className="activity-gallery__thumbs">{photos.map((photo,i)=><button type="button" key={i} onClick={()=>setIndex(i)} aria-label={(i+1)+'번 사진'} aria-pressed={i===index}><img src={photo.url} alt=""/></button>)}</div>}
      </div>
    </motion.div>}</AnimatePresence>
  </section>;
}
