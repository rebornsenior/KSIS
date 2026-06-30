import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../constants';
import { Landmark, Users, Store, GraduationCap, Soup, BookOpen, Compass } from 'lucide-react';

// Import the subcomponents representing the 4 modular program areas
import ForumComponent from './Project/Forum';
import ProjectComponent from './Project/Project';
import ShoppingComponent from './Project/Shopping';
import EducationComponent from './Project/Education';

export default function Archive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'project';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedCategory(null);
  }, [currentTab]);

  const tabs = [
    {
      id: 'forum',
      name: '비즈니스 포럼',
      description: '정기적인 비즈니스 포럼을 통해 회원 간 전문성을 교류하고 리더십을 강화합니다.',
      icon: Landmark,
      color: '#3a6182',
      component: <ForumComponent />,
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
      name: '쇼핑몰',
      description: '회원들의 고품격 창작물과 서비스를 전람 전파하여 가임 시니어들의 수입화를 지원합니다.',
      icon: Store,
      color: '#D19D34',
      component: <ShoppingComponent />,
    },
    {
      id: 'education',
      name: 'AI · 마케팅 · 창업 교육',
      description: '생성형 AI 실무, 마케팅, 브랜드 설계창업 등 실제 성장을 지원하는 교육에 동참합니다.',
      icon: GraduationCap,
      color: '#d2833d',
      component: <EducationComponent />,
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
                  <ProjectComponent selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
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
