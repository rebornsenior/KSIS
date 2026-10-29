import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { loadPosts } from '../content/load';

export default function MemberCompaniesSection() {
  const track = useRef<HTMLDivElement>(null);
  const companies = loadPosts('shopping').slice(0, 8);
  const [perPage, setPerPage] = useState(() => window.matchMedia('(min-width: 1024px)').matches ? 4 : 2);
  const [activePage, setActivePage] = useState(0);
  const pages = Array.from({length: Math.max(1, Math.ceil(companies.length/perPage))}, (_, index) => companies.slice(index*perPage, (index+1)*perPage));
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const resize = () => {setPerPage(media.matches ? 4 : 2);setActivePage(0);track.current?.scrollTo({left:0,behavior:'instant' as ScrollBehavior});};
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    const element=track.current;
    if(!element)return;
    let first=true;
    const observer=new ResizeObserver(()=>{if(first){first=false;return;}element.scrollTo({left:activePage*element.clientWidth,behavior:'instant' as ScrollBehavior});});
    observer.observe(element);
    return ()=>observer.disconnect();
  }, [activePage]);
  const goToPage = (index: number) => {
    const next=Math.max(0,Math.min(index,pages.length-1));
    setActivePage(next);
    track.current?.scrollTo({left:next*track.current.clientWidth,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  };
  const move = (direction: number) => goToPage(activePage+direction);
  return (
    <section id="member-companies-section" aria-labelledby="member-companies-heading" className="py-12 md:py-24 px-6 md:px-12 lg:px-16 xl:px-20 bg-white">
      <div className="max-w-[1720px] mx-auto space-y-10 md:space-y-16">
        <div className="text-center space-y-4">
          <h2 id="member-companies-heading" className="text-[15vw] md:text-[96px] text-[#002147] opacity-[0.10] md:opacity-10 md:pt-[20px] font-bold tracking-tight md:tracking-[-0.05em] whitespace-nowrap overflow-visible relative left-0 md:left-0 w-full md:w-auto text-center md:text-center mb-0">회원사 소개</h2>
          <p className="text-[14px] md:text-lg text-slate-700 font-medium break-keep leading-[1.6] tracking-[-0.02em]">
            다양한 분야에서 활동하는 회원사들의 브랜드와 서비스를 소개합니다.<br />
            회원사 간 교류와 협력을 통해 새로운 기회를 만들고 함께 성장하는 네트워크를 이어갑니다.
          </p>
          <div className="flex justify-center pt-2 md:pt-3">
            <Link to="/archive?tab=shopping" className="group inline-flex items-center gap-2 pb-[2px] md:pb-[4px] text-[#0d34a6] font-medium border-b border-[#0d34a6] md:border-transparent md:hover:border-[#0d34a6] transition-colors">
              <span>View all</span><ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute right-0 -top-8 flex items-center gap-2" role="group" aria-label="회원사 페이지">
            {pages.map((_, index) => (
              <button key={index} type="button" onClick={() => goToPage(index)} aria-label={(index+1)+' / '+pages.length+' 페이지'} aria-current={activePage === index ? 'page' : undefined} className="flex h-6 w-6 items-center justify-center">
                <span aria-hidden="true" className={activePage === index ? 'h-2 w-2 rounded-full bg-[#d2833d]' : 'h-[2px] w-4 rounded-full bg-slate-300'} />
              </button>
            ))}
          </div>
          <div ref={track} className="flex overflow-x-hidden pb-4" aria-label="회원사 미리보기" tabIndex={0}>
            {pages.map((page, pageIndex) => (
              <div key={pageIndex} className="flex w-full shrink-0 justify-center gap-4 md:gap-8" role="group" aria-label={(pageIndex+1)+'번째 회원사 페이지'}>
              {page.map(company => (
              <Link key={company.id} to="/archive?tab=shopping" className="group block shrink-0 w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-6rem)/4)] min-w-0">
                <div className="h-32 sm:h-40 lg:h-[230px] relative overflow-hidden bg-slate-100">
                  <img src={company.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover blur-xl scale-110" referrerPolicy="no-referrer" />
                  <img src={company.image} alt={company.name + " 대표 이미지"} loading="lazy" className="absolute inset-0 w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="pt-3 space-y-2">
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#d2833d]">
                    {(company.tags || []).filter((tag: string) => tag.trim()).slice(0, 4).map((tag: string, index: number) => <span key={index}>#{tag.replace(/^#+/, "").trim()}</span>)}
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-[#002147] break-keep">{company.name}</h3>
                  <p className="text-xs md:text-sm text-slate-500 break-keep">{company.representative}</p>
                </div>
              </Link>
              ))}
              </div>
            ))}
          </div>
          {companies.length > 1 && <div className="flex justify-center gap-3 pt-4 md:hidden">
            <button type="button" onClick={() => move(-1)} aria-label="이전 회원사" className="p-2 rounded-full border border-slate-200 bg-slate-100 text-[#002147] hover:bg-[#d2833d] hover:border-[#d2833d] hover:text-white active:bg-[#d2833d] active:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => move(1)} aria-label="다음 회원사" className="p-2 rounded-full border border-slate-200 bg-slate-100 text-[#002147] hover:bg-[#d2833d] hover:border-[#d2833d] hover:text-white active:bg-[#d2833d] active:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>}
          {companies.length > 2 && <div className="hidden md:block">
            <button type="button" onClick={() => move(-1)} aria-label="이전 회원사" className="absolute -left-10 top-1/3 p-2 rounded-full bg-slate-100 text-[#002147] hover:bg-[#d2833d] hover:text-white active:bg-[#d2833d] active:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => move(1)} aria-label="다음 회원사" className="absolute -right-10 top-1/3 p-2 rounded-full bg-slate-100 text-[#002147] hover:bg-[#d2833d] hover:text-white active:bg-[#d2833d] active:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>}
        </div>
      </div>
    </section>
  );
}
