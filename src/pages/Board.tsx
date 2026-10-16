import ActivityGallery from '../components/ActivityGallery';
import {boardPosts} from '../content/board';
import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

import { 
  ExternalLink, 
  Megaphone, 
  Lightbulb, 
  ChevronLeft,
  ChevronRight, 
  Calendar,


} from 'lucide-react';


// Project specific images




const NOTICES_DATA=boardPosts('notices');
const INSIGHTS_DATA=boardPosts('insights');



export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const activeTab = searchParams.get('tab') || 'notice';
  const [sortOrder,setSortOrder]=useState<'newest'|'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset to page 1 whenever activeTab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab,sortOrder]);

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

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const activePosts = [...(activeTab === 'insight' ? INSIGHTS_DATA : NOTICES_DATA)].sort((a,b)=> (sortOrder==='newest'?-1:1)*a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));

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
              제목을 누르면 홈페이지 게시글 또는 관련 외부 페이지로 이동합니다.
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
                  <p className="text-xs text-slate-400 mt-1">총 {activePosts.length}개의 글이 수록되어 있습니다.</p>
                </div>
                <select aria-label="글 정렬 순서" value={sortOrder} onChange={e=>setSortOrder(e.target.value as 'newest'|'oldest')} className="text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-2">
                  <option value="newest">최신순</option><option value="oldest">오래된순</option>
                </select>              </div>

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
                        target={post.internal ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 -mx-3 md:-mx-5 rounded-2xl hover:bg-slate-50/80 transition-all text-left"
                      >
                        <div className="space-y-2.5 flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 items-center">
                            {(activeTab==='insight' ? post.tags : post.internal && post.label ? [post.label] : []).map((tag:string)=>(
                              <span key={tag} className="text-[11px] font-extrabold tracking-wider px-2.5 py-1 rounded-md text-amber-700 bg-amber-50 uppercase border border-amber-100/50">{tag}</span>
                            ))}
                            {(activeTab==='insight' || !post.internal) && <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-[#1EC800]/10 text-[#1EC800] rounded-md border border-[#1EC800]/15">{activeTab==='insight' ? post.sourceLabel : '네이버 카페'}</span>}
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
              {totalPages > 0 && (
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

    {/* CMS-managed activity albums */}
    <ActivityGallery />

  </div>
);
}
