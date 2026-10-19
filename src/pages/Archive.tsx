import {postTab} from '../content/post-links';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../constants';
import { Landmark, Users, Store, GraduationCap, Soup, BookOpen, Compass } from 'lucide-react';

// Import the subcomponents representing the 4 modular program areas
import ForumComponent from './Project/Forum';
import ProjectComponent from './Project/Project';
import ShoppingComponent from './Project/Shopping';
import EducationComponent from './Project/Education';

export default function Archive({postGroup,post}: {postGroup?:string;post?:any} = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = postGroup ? postTab(postGroup) : searchParams.get('tab') || 'project';
  const categoryParam=searchParams.get('category');
  const selectedCategory=post?.category || (['food','book','local'].includes(categoryParam || '') ? categoryParam : null);
  const setSelectedCategory=(category:string|null)=>{
    const next=new URLSearchParams(searchParams);
    next.set('tab','project');
    if(category)next.set('category',category);else next.delete('category');
    setSearchParams(next);
  };
  const [companyCategory, setCompanyCategory] = useState('전체');
  const [companyQuery, setCompanyQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const tabs = [
    {
      id: 'forum',
      name: '비즈니스 포럼',
      description: '정기적인 비즈니스 포럼을 통해 회원 간 전문성을 교류하고 리더십을 강화합니다.',
      icon: Landmark,
      color: '#3a6182',
      component: <ForumComponent previewPost={post} />,
    },
    {
      id: 'project',
      name: '소모임 프로젝트',
      description: '관심사 기반의 소모임 활동을 통해 자연스러운 관계 형성과 비즈니스 교류의 기회를 만듭니다.',
      icon: Users,
      color: '#98b7a5',
      component: <ProjectComponent />,
    },
    {
      id: 'shopping',
      name: '회원사 소개',
      description: <>회원사의 다양한 브랜드와 서비스를 소개합니다.<br />교류와 협력으로 기회를 넓히고 함께 성장합니다.</>,
      icon: Store,
      color: '#D19D34',
      component: <ShoppingComponent category={companyCategory} query={companyQuery} />,
    },
    {
      id: 'education',
      name: 'AI · 마케팅 · 창업 교육',
      description: '생성형 AI 실무, 마케팅, 브랜드 설계창업 등 실제 성장을 지원하는 교육에 동참합니다.',
      icon: GraduationCap,
      color: '#d2833d',
      component: <EducationComponent previewPost={post} />,
    },
  ];

  const projectCategories = [
    {
      id: null,
      name: '전체 보기',
      tag: 'ALL VIEWS',
      icon: Landmark,
      color: '#3a6182',
    },
    {
      id: 'food',
      name: '식문화',
      tag: 'FOOD CULTURE',
      icon: Soup,
      color: '#98b7a5',
    },
    {
      id: 'book',
      name: '북클럽',
      tag: 'BOOK CLUB',
      icon: BookOpen,
      color: '#D19D34',
    },
    {
      id: 'local',
      name: '로컬 탐방',
      tag: 'LOCAL TOUR',
      icon: Compass,
      color: '#d2833d',
    },
  ];

  const activeTabInfo = tabs.find((t) => t.id === currentTab) || tabs[1];

  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategory(catId);
    setTimeout(() => {
      if (listRef.current) {
        const topOfOffset = listRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: topOfOffset, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Unified Header Section */}
      <section className="pt-12 pb-6 md:pt-28 md:pb-16 px-6 md:px-12 lg:px-16 xl:px-20 bg-white border-b border-slate-200">
        <div className="max-w-[1720px] mx-auto space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-4">
            <span className="text-xs md:text-sm font-extrabold text-amber-600 tracking-wider uppercase block">
              KSIS CORE PROGRAMS
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight break-keep" style={{ color: COLORS.navy }}>
              {activeTabInfo.name}
            </h1>
            <p className="text-sm md:text-lg text-slate-500 max-w-3xl leading-relaxed break-keep">
              {activeTabInfo.description}
            </p>
          </div>

          {currentTab === 'shopping' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
              <nav aria-label="회원사 업종 필터" className="flex items-center gap-7">
                {['전체', '식품', '제조', '기타'].map(category => (
                  <button key={category} type="button" aria-pressed={companyCategory === category}
                    onClick={() => setCompanyCategory(category)}
                    className={'text-sm py-2 border-b-2 transition-colors ' + (companyCategory === category ? 'font-bold text-[#002147] border-[#002147]' : 'text-slate-500 border-transparent hover:text-[#002147]')}>
                    {category}
                  </button>
                ))}
              </nav>
              <input type="search" aria-label="회원사 검색" placeholder="회원사명 · 대표명 · 키워드 검색"
                value={companyQuery} onChange={event => setCompanyQuery(event.target.value)}
                className="w-full sm:w-80 border-b border-slate-300 bg-transparent py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#002147]" />
            </div>
          )}
          {/* Master 4-Tab Switcher removed as we now use a dedicated visual Portal page inside Project Component */}
        </div>
      </section>

      {/* Primary Container with Fade/Animate transitions */}
      <main className="flex-grow pt-8 pb-20 px-6 md:px-12 lg:px-16 xl:px-20">
        <div className="max-w-[1720px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {currentTab === 'project' ? (
                <div ref={listRef}>
                  <ProjectComponent selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} previewPost={post} />
                </div>
              ) : (
                activeTabInfo.component
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
