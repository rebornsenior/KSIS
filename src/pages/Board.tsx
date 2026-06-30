import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../constants';
import { 
  ExternalLink, 
  Megaphone, 
  Lightbulb, 
  ChevronLeft,
  ChevronRight, 
  Calendar,
  ArrowRight,
  X
} from 'lucide-react';

import foodculture1 from '../images/project/community/foodculture/1.webp';
import foodculture2 from '../images/project/community/foodculture/2.webp';
import foodculture3 from '../images/project/community/foodculture/3.webp';
import foodculture4 from '../images/project/community/foodculture/4.webp';
import foodculture5 from '../images/project/community/foodculture/5.webp';
import foodculture6 from '../images/project/community/foodculture/6.webp';
import foodculture7 from '../images/project/community/foodculture/7.webp';
import foodculture8 from '../images/project/community/foodculture/8.webp';
import foodculture9 from '../images/project/community/foodculture/9.webp';
import foodculture10 from '../images/project/community/foodculture/10.webp';
import foodculture11 from '../images/project/community/foodculture/11.webp';
import foodculture12 from '../images/project/community/foodculture/12.webp';
import foodculture13 from '../images/project/community/foodculture/13.webp';
import foodculture14 from '../images/project/community/foodculture/14.webp';
import foodculture15 from '../images/project/community/foodculture/15.webp';
import foodculture16 from '../images/project/community/foodculture/16.webp';
import foodculture17 from '../images/project/community/foodculture/17.webp';
import foodculture18 from '../images/project/community/foodculture/18.webp';
import foodculture19 from '../images/project/community/foodculture/19.webp';
import foodculture20 from '../images/project/community/foodculture/20.webp';
import foodculture21 from '../images/project/community/foodculture/21.webp';
import foodculture22 from '../images/project/community/foodculture/22.webp';
import foodculture23 from '../images/project/community/foodculture/23.webp';
import local1 from '../images/project/community/local/1.webp';
import local2 from '../images/project/community/local/2.webp';
import local3 from '../images/project/community/local/3.webp';
import local4 from '../images/project/community/local/4.webp';
import bookclub1 from '../images/project/community/bookclub/1.webp';

// Project specific images
import edu_1_1 from '../images/project/AI/1_1/1.jpg';
import edu_1_2 from '../images/project/AI/1_1/2.jpg';
import edu_1_3 from '../images/project/AI/1_1/3.jpg';
import edu_1_4 from '../images/project/AI/1_1/4.jpg';
import edu_1_5 from '../images/project/AI/1_1/5.jpg';
import edu_1_6 from '../images/project/AI/1_1/6.jpg';

import edu_2_1 from '../images/project/AI/1_2/2.webp';

import forum_1_1 from '../images/project/forum/1_1/1.jpg';
import forum_1_2 from '../images/project/forum/1_1/2.jpg';
import forum_1_3 from '../images/project/forum/1_1/3.jpg';
import forum_1_4 from '../images/project/forum/1_1/4.jpg';
import forum_1_5 from '../images/project/forum/1_1/5.jpg';

import forum_2_1 from '../images/project/forum/1_2/2.webp';

interface PostItem {
  id: string;
  category: string;
  title: string;
  date: string;
  url: string;
}

const NOTICES_DATA: PostItem[] = [
  {
    id: 'n1',
    category: '행사 안내',
    title: '제34회 비즈니스교류회 - "돈 되는 스토리는 따로 있다" 참가 신청 안내',
    date: '2026.06.24',
    url: 'https://cafe.naver.com/ksis1/641'
  }
];

const INSIGHTS_DATA: PostItem[] = [
  {
    id: 'i1',
    category: '여행',
    title: '요코하마 미나토미라이에서 배운 연결의 힘 — 개항제 현장에서 본 협회의 미래',
    date: '2026.06.01',
    url: 'https://cafe.naver.com/ksis1/637'
  }
];

const GALLERY_ITEMS = [
  {
    id: 1,
    title: '제1회 AI+SaaS 실전 비즈니스 프로젝트 발표회',
    img: edu_1_1,
    images: [edu_1_1, edu_1_2, edu_1_3, edu_1_4, edu_1_5, edu_1_6]
  },
  {
    id: 2,
    title: '소상공인 AI활용 지원사업 신청 준비 AI 컨설팅',
    img: edu_2_1,
    images: [edu_2_1]
  },
  {
    id: 3,
    title: '제33회 비즈니스교류회 - 유튜브 채널 제작 특강',
    img: forum_1_1,
    images: [forum_1_1, forum_1_2, forum_1_3, forum_1_4, forum_1_5]
  },
  {
    id: 4,
    title: '제34회 비즈니스교류회 - 돈 되는 스토리는 따로 있다',
    img: forum_2_1,
    images: [forum_2_1]
  },
  {
    id: 5,
    title: '시니어 식문화 교류회 및 시식회',
    img: foodculture1,
    images: [
      foodculture1, foodculture2, foodculture3, foodculture4, foodculture5,
      foodculture6, foodculture7, foodculture8, foodculture9, foodculture10,
      foodculture11, foodculture12, foodculture13, foodculture14, foodculture15,
      foodculture16, foodculture17, foodculture18, foodculture19, foodculture20,
      foodculture21, foodculture22, foodculture23
    ]
  },
  {
    id: 6,
    title: '북촌 한옥마을 투어 및 로컬 네트워킹',
    img: local1,
    images: [local1, local2, local3, local4]
  },
  {
    id: 7,
    title: '시니어 독서 모임 "북클럽" 세션',
    img: bookclub1,
    images: [bookclub1]
  }
];

export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const activeTab = searchParams.get('tab') || 'notice';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<typeof GALLERY_ITEMS[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset to page 1 whenever activeTab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (searchParams.get('goto') === 'gallery') {
      const element = document.getElementById('gallery-section');
      if (element) {
        // Wait slightly for layout to settle
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      // Ensure we scroll to the top when navigating normally or switching tabs
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.search, searchParams]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const hasSelectedGalleryItem = !!selectedGalleryItem;
  const galleryItemId = selectedGalleryItem?.id;
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasSelectedGalleryItem || !galleryItemId) return;
      if (e.key === 'ArrowRight') {
        if (selectedGalleryItem) {
          setCurrentImageIndex((prev) => (prev + 1) % selectedGalleryItem.images.length);
        }
      } else if (e.key === 'ArrowLeft') {
        if (selectedGalleryItem) {
          setCurrentImageIndex((prev) => 
            prev === 0 ? selectedGalleryItem.images.length - 1 : prev - 1
          );
        }
      } else if (e.key === 'Escape') {
        setSelectedGalleryItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSelectedGalleryItem, galleryItemId]);

  const activePosts = activeTab === 'insight' ? INSIGHTS_DATA : NOTICES_DATA;

  const POSTS_PER_PAGE = 5;
  const totalPages = Math.ceil(activePosts.length / POSTS_PER_PAGE);
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = activePosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Subheader/Hero Section styled like Core Programs */}
      <section className="pt-12 pb-6 md:pt-28 md:pb-16 px-6 md:px-12 lg:px-16 xl:px-20 bg-white border-b border-slate-200">
        <div className="max-w-[1720px] mx-auto space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-4 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight break-keep text-[#002147]">
              BOARD
            </h1>
            <p className="text-sm md:text-lg text-slate-500 max-w-3xl leading-relaxed break-keep mx-auto md:mx-0">
              협회의 주요 공지사항과 시니어 비즈니스, AI, 브랜드 마케팅 전문 칼럼을 확인해보세요.<br />
              제목을 누르면 자세한 연재글이 수록된 공식 네이버 카페로 바로 이동합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Main Board Content Area */}
      <main className="flex-grow py-12 px-6 md:px-12 lg:px-16 xl:px-20">
        <div className="max-w-[1720px] mx-auto space-y-8">
          
          {/* Tab Navigation Menu */}
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-fit border border-slate-200 shadow-inner">
            <button
              onClick={() => handleTabChange('notice')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-[15px] font-bold transition-all relative cursor-pointer ${
                activeTab === 'notice'
                  ? 'bg-white text-[#002147] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Megaphone className={`w-4 h-4 ${activeTab === 'notice' ? 'text-[#002147]' : 'text-slate-400'}`} />
              <span>공지사항</span>
              {activeTab === 'notice' && (
                <motion.div
                  layoutId="boardTabUnderline"
                  className="absolute inset-0 border border-slate-200/50 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => handleTabChange('insight')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-[15px] font-bold transition-all relative cursor-pointer ${
                activeTab === 'insight'
                  ? 'bg-white text-[#002147] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lightbulb className={`w-4 h-4 ${activeTab === 'insight' ? 'text-[#002147]' : 'text-slate-400'}`} />
              <span>인사이트</span>
              {activeTab === 'insight' && (
                <motion.div
                  layoutId="boardTabUnderline"
                  className="absolute inset-0 border border-slate-200/50 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Post Lists Column */}
            <div className="space-y-8">
              {/* List of Posts */}
              <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-md p-6 md:p-10">
              <div className="space-y-2 mb-6 border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#002147] flex items-center gap-2">
                    {activeTab === 'insight' ? '전문 인사이트 칼럼' : '협회 공식 알림판'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">총 {activePosts.length}개의 전문 글이 수록되어 있습니다.</p>
                </div>
                <a 
                  href="https://cafe.naver.com/ksis1" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 px-3 py-1.5 rounded-lg w-fit transition-colors cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  클릭하면 네이버 카페로 바로 연결됩니다
                </a>
              </div>

              <div className="divide-y divide-slate-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeTab}-${currentPage}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    {currentPosts.map((post) => (
                      <a
                        key={post.id}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 -mx-3 md:-mx-5 rounded-2xl hover:bg-slate-50/80 transition-all text-left"
                      >
                        <div className="space-y-2.5 flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[11px] font-extrabold tracking-wider px-2.5 py-1 rounded-md text-amber-700 bg-amber-50 uppercase border border-amber-100/50">
                              {post.category}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-[#1EC800]/10 text-[#1EC800] rounded-md border border-[#1EC800]/15">
                              <span className="font-black italic">N</span> 네이버 카페
                            </span>
                          </div>
                          <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug group-hover:text-[#002147] group-hover:underline decoration-slate-300 transition-colors break-keep pr-4">
                            {post.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-100/40 md:border-none pt-3 md:pt-0">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium font-mono">{post.date}</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 group-hover:text-[#002147] transition-all">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap hidden sm:inline">바로가기</span>
                            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#002147] group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-8 mt-6 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 rounded-lg border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === 1
                        ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                        : 'text-slate-600 hover:text-[#002147] hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#002147] text-white border-[#002147] shadow-sm'
                          : 'text-slate-500 border-transparent hover:text-[#002147] hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 rounded-lg border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === totalPages
                        ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                        : 'text-slate-600 hover:text-[#002147] hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>


          </div>

        </div>
      </div>
    </main>

    {/* Full-width Activity Gallery Carousel */}
    <section id="gallery-section" className="w-full bg-slate-100 py-16 border-t border-slate-200 overflow-hidden relative">
      <div className="px-6 md:px-12 lg:px-16 xl:px-20 max-w-[1720px] mx-auto mb-8">
        <span className="text-xs md:text-sm font-extrabold text-amber-600 tracking-wider uppercase block">
          KSIS ACTIVITY GALLERY
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#002147] mt-1">
          협회 주요 활동 갤러리
        </h2>
      </div>

      {/* Carousel Outer Container with full viewport width */}
      <div className="relative w-full group/arrows">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 hover:bg-[#002147] text-slate-700 hover:text-white flex items-center justify-center transition-all shadow-lg cursor-pointer md:opacity-0 md:group-hover/arrows:opacity-100 border border-slate-200"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 hover:bg-[#002147] text-slate-700 hover:text-white flex items-center justify-center transition-all shadow-lg cursor-pointer md:opacity-0 md:group-hover/arrows:opacity-100 border border-slate-200"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-[10px] overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {GALLERY_ITEMS.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                setSelectedGalleryItem(item);
                setCurrentImageIndex(0);
              }}
              className="flex-shrink-0 w-[calc(50%-5px)] sm:w-[calc(33.333%-6.67px)] md:w-[calc(25%-7.5px)] lg:w-[calc(20%-8px)] xl:w-[calc(16.666%-8.33px)] aspect-square relative overflow-hidden group cursor-pointer snap-start"
            >
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-start p-6 text-left">
                <p className="text-white font-extrabold text-xs sm:text-sm md:text-base tracking-tight break-keep border-l-2 border-amber-500 pl-3">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Lightbox Modal */}
    <AnimatePresence>
      {selectedGalleryItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/65 backdrop-blur-xs p-4 sm:p-6 select-none"
          onClick={() => setSelectedGalleryItem(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedGalleryItem(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 sm:p-3 rounded-full transition-all cursor-pointer z-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Header area */}
          <div className="text-center max-w-4xl px-4 mb-4 sm:mb-8 mt-12 sm:mt-0">
            <h3 className="text-white text-base sm:text-lg md:text-xl font-extrabold tracking-tight line-clamp-2">
              {selectedGalleryItem.title}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1.5 sm:mt-2 bg-slate-800/50 inline-block px-3 py-1 rounded-full border border-slate-700/30">
              {currentImageIndex + 1} / {selectedGalleryItem.images.length}
            </p>
          </div>

          {/* Large Image View with navigation buttons */}
          <div 
            className="relative w-full max-w-4xl aspect-[4/3] md:aspect-[16/10] max-h-[60vh] flex items-center justify-center bg-slate-950/20 rounded-2xl overflow-hidden border border-slate-800/30"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={selectedGalleryItem.images[currentImageIndex]}
                alt={`${selectedGalleryItem.title} - ${currentImageIndex + 1}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="max-w-full max-h-full object-contain"
              />
            </AnimatePresence>

            {/* Left Button inside modal (only if multiple images exist) */}
            {selectedGalleryItem.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => 
                      prev === 0 ? selectedGalleryItem.images.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all border border-white/10 hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % selectedGalleryItem.images.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all border border-white/10 hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail indicators at the bottom */}
          {selectedGalleryItem.images.length > 1 && (
            <div 
              className="flex justify-center gap-2 mt-4 sm:mt-8 overflow-x-auto max-w-full px-4 py-1.5 scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedGalleryItem.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2 cursor-pointer ${
                    idx === currentImageIndex 
                      ? 'border-amber-500 scale-105 ring-2 ring-amber-500/20' 
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
}
