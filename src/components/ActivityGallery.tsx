import {useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {ArrowDown,ChevronLeft,ChevronRight,X,ExternalLink} from 'lucide-react';
import {loadPosts} from '../content/load';
import {sortPosts,postDate} from '../content/sort-posts';
import './ActivityGallery.css';

type Album={id:string;title:string;date:string;image:string;images:{url:string;caption?:string}[];relatedUrl?:string};
const albums=sortPosts(loadPosts('gallery')) as Album[];
export function galleryLink(value?:string){
  if(!value)return '';
  if(/^\/#\/post\/[a-z]+\/[\w%.-]+$/.test(value))return value;
  try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}
}
export default function ActivityGallery(){
  const reduced=useReducedMotion();
  const [desktop,setDesktop]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [album,setAlbum]=useState<Album|null>(null);
  const [index,setIndex]=useState(0);
  const [introHeight,setIntroHeight]=useState(420);
  const hold=useRef<HTMLDivElement>(null),intro=useRef<HTMLDivElement>(null),end=useRef<HTMLDivElement>(null);
  const close=useRef<HTMLButtonElement>(null),opener=useRef<HTMLButtonElement|null>(null);
  const jumpTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const holding=desktop&&!reduced&&albums.length>6;
  useEffect(()=>{
    const media=matchMedia('(min-width: 1024px)');const update=()=>setDesktop(media.matches);update();media.addEventListener('change',update);
    return()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    if(!intro.current)return;
    const observer=new ResizeObserver(()=>setIntroHeight(intro.current?.offsetHeight || 420));observer.observe(intro.current);
    return()=>observer.disconnect();
  },[desktop]);
  useEffect(()=>{
    if(!holding||expanded)return;
    const update=()=>{if(hold.current && hold.current.getBoundingClientRect().top< -180)setExpanded(true);};
    update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update);
  },[holding,expanded]);
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
  const card=(item:Album,i:number)=> <motion.button type="button" className="activity-gallery__card" key={item.id}
    initial={reduced?false:{opacity:0,y:14}} whileInView={reduced?{}:{opacity:1,y:0}} viewport={{once:true,amount:0.1}}
    transition={{duration:reduced?0:.45,delay:reduced?0:(i%6)*.045}}
    aria-label={'사진 앨범 열기: '+item.title}
    onClick={event=>{opener.current=event.currentTarget;setIndex(0);setAlbum(item);}}>
      <img src={item.image} alt={item.title} loading="lazy" />
      <span className="activity-gallery__caption"><strong>{item.title}</strong><time>{postDate(item.date)}</time></span>
    </motion.button>;
  const jump=()=>{setExpanded(true);if(jumpTimer.current)clearTimeout(jumpTimer.current);jumpTimer.current=setTimeout(()=>end.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'end'}),reduced?0:650);};
  return <section id="gallery-section" className="activity-gallery">
    <div ref={hold} style={{height:holding?introHeight+320:undefined}}>
      <div ref={intro} className={holding?'activity-gallery__intro activity-gallery__intro--hold':'activity-gallery__intro'}>
        <div className="activity-gallery__heading"><div><span>KSIS ACTIVITY GALLERY</span><h2>협회 주요 활동 갤러리</h2><p>{holding&&!expanded?'아래로 스크롤하면 활동 앨범이 펼쳐집니다.':'사진을 눌러 활동 앨범을 확인하세요.'}</p></div>
          <button type="button" className="activity-gallery__jump" onClick={jump} aria-label="갤러리 끝으로" title="갤러리 끝으로"><ArrowDown size={22}/></button>
        </div>
        <div className="activity-gallery__grid">{(desktop?albums.slice(0,6):albums).map(card)}</div>
      </div>
    </div>
    {desktop&&albums.length>6&&<motion.div className="activity-gallery__more" initial={false} animate={{gridTemplateRows:expanded||!holding?'1fr':'0fr',opacity:expanded||!holding?1:0}} transition={{duration:reduced?0:.6,ease:[.22,1,.36,1]}} aria-hidden={holding&&!expanded} inert={holding&&!expanded?true:undefined}>
      <div><div className="activity-gallery__grid">{albums.slice(6).map(card)}</div></div>
    </motion.div>}
    {!albums.length&&<p>등록된 활동 앨범이 없습니다.</p>}
    <div ref={end}/>
    <AnimatePresence>{album&&<motion.div className="activity-gallery__overlay" role="dialog" aria-modal="true" aria-labelledby="activity-album-title" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setAlbum(null)}>
      <div className="activity-gallery__dialog" onClick={event=>event.stopPropagation()}>
        <button ref={close} type="button" className="activity-gallery__close" aria-label="앨범 닫기" onClick={()=>setAlbum(null)}><X/></button>
        <h3 id="activity-album-title">{album.title}</h3><p>{postDate(album.date)} · {index+1} / {photos.length}</p>
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
