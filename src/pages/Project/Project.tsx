import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../../constants';
import { Soup, BookOpen, Compass, FileText, Users, User, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

function GallerySlider({ images }: { images: Array<{ url: string; caption?: string }> }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full bg-slate-50 border border-slate-100 p-2.5 sm:p-4 rounded-[24px] shadow-3xs my-6 select-none">
      {/* Slider view container */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] sm:aspect-[16/10] bg-slate-100 flex items-center justify-center">
        {/* Active Image */}
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].caption || `갤러리 이미지 ${currentIndex + 1}`}
          className="w-full h-full object-contain object-center rounded-xl"
          referrerPolicy="no-referrer"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#002147] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#002147] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Slide Counter Overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white tracking-widest font-mono z-10 shadow-3xs">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Styled slide indicator dots (Caption removed) */}
      <div className="mt-3 text-center font-sans">
        {images.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 pt-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx 
                    ? 'w-5 h-1.5 bg-[#002147]' 
                    : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`${idx + 1}번 이미지로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Community category modular imports
import { foodculturePosts } from './community/foodculture';
import { bookclubPosts } from './community/bookclub';
import { localPosts } from './community/local';

interface ExpertCardProps {
  exp: any;
  categories: Array<{ id: string; name: string; icon: any; color: string }>;
  setSelectedExpert: (exp: any) => void;
  key?: string;
}

function ExpertCard({ exp, categories, setSelectedExpert }: ExpertCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const catInfo = categories.find((c) => c.id === exp.category);
  const Icon = catInfo ? catInfo.icon : Users;
  const iconColor = catInfo ? catInfo.color : '#64748B';

  return (
    <motion.div
      layout
      key={`desktop-${exp.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.25 }}
      onClick={() => setSelectedExpert(exp)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white p-8 rounded-[32px] shadow-sm border transition-all flex flex-col justify-between cursor-pointer"
      style={{
        borderColor: isHovered ? iconColor : '#F1F5F9',
        boxShadow: isHovered ? `0 20px 25px -5px ${iconColor}15, 0 8px 10px -6px ${iconColor}15` : undefined,
      }}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
            style={{ 
              backgroundColor: isHovered ? `${iconColor}25` : `${iconColor}15`,
              transform: isHovered ? 'scale(1.05)' : 'none'
            }}
          >
            <Icon className="w-6 h-6 animate-none" style={{ color: iconColor }} />
          </div>
          <span 
            className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors duration-300"
            style={{ 
              backgroundColor: isHovered ? `${iconColor}15` : '#F1F5F9',
              color: isHovered ? iconColor : '#64748B'
            }}
          >
            {exp.categoryName}
          </span>
        </div>
        <h3 
          className="text-xl font-bold mb-2 leading-normal break-keep transition-colors duration-300"
          style={{ color: isHovered ? iconColor : '#002147' }}
        >
          {exp.name}
        </h3>
        <p 
          className="text-sm font-bold mb-4 transition-colors duration-300" 
          style={{ color: isHovered ? iconColor : COLORS.gold }}
        >
          {exp.specialty}
        </p>
        <p className="text-sm text-slate-500 leading-relaxed min-h-[72px] line-clamp-3 mb-8">
          {exp.desc}
        </p>
      </div>
      <button 
        className="w-full py-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300"
        style={{
          backgroundColor: isHovered ? iconColor : '#F8FAFC',
          borderColor: isHovered ? iconColor : '#F1F5F9',
          color: isHovered ? '#FFFFFF' : '#0F172A',
        }}
      >
        더보기
        <FileText className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ProjectPortalProps {
  onSelectCategory: (cat: string) => void;
}

function ProjectPortal({ onSelectCategory }: ProjectPortalProps) {
  const portalCategories = [
    {
      id: 'food',
      name: '식문화',
      engName: 'FOOD CULTURE',
      description: '음식을 매개로 다양한 분야의 사람들과 교류하는 네트워킹 모임입니다. 함께 식사하며 경험과 정보를 나누고 새로운 협업의 기회를 만들어갑니다. 즐거운 만남이 비즈니스와 지역사회 성장으로 이어지는 연결의 장입니다.',
      icon: Soup,
      color: '#98b7a5',
      leader: '이선진 대표',
      company: '어니스트케이(주) 대표이사',
    },
    {
      id: 'book',
      name: '북클럽',
      engName: 'BOOK CLUB',
      description: '북클럽책을 통해 배우고 성장하며 인적 네트워크를 넓혀가는 독서 모임입니다. 독서와 토론을 통해 다양한 경험과 전문성을 공유합니다. 지식의 교류를 넘어 새로운 아이디어와 협업의 기회를 만들어갑니다.',
      icon: BookOpen,
      color: '#D19D34',
      leader: '원동업 대표',
      company: '돌멩이국 출판사 대표',
    },
    {
      id: 'local',
      name: '로컬탐방',
      engName: 'LOCAL TOUR',
      description: '지역의 문화와 자원을 함께 탐방하며 새로운 가치를 발견하는 모임입니다. 로컬 공간과 사람을 연결하고 지역 기반의 다양한 정보를 공유합니다. 탐방과 교류를 통해 협업과 비즈니스 기회를 발굴해 나갑니다.',
      icon: Compass,
      color: '#d2833d',
      leader: '박현정 대표',
      company: '북촌탁구',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-12 max-w-[1720px] mx-auto py-4 md:py-8 font-sans">
      <div className="text-center space-y-2 md:space-y-3 max-w-2xl mx-auto pb-4">
        <h2 className="text-2xl md:text-4.5xl font-black text-[#002147] tracking-tight break-keep leading-tight">
          어떤 소모임의 이야기를 함께 들어볼까요?
        </h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed break-keep max-w-lg mx-auto">
          관심 있는 분야의 카테고리를 선택해 보세요. 멤버들의 생생한 지혜와 따뜻한 동행이 깃든 탐방 타임라인 카드로 이동합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {portalCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08, ease: 'easeOut' }}
              whileHover={{ 
                y: -8, 
                boxShadow: `0 20px 40px -10px rgba(15, 23, 42, 0.08), 0 0 15px -3px ${cat.color}15`, 
                borderColor: `${cat.color}45` 
              }}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-8 transition-all duration-300 cursor-pointer h-full min-h-[300px] md:min-h-[340px]"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.45) 100%)`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: `${cat.color}25`,
                boxShadow: `0 8px 32px 0 rgba(15, 23, 42, 0.03), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.1)`,
              }}
            >
              {/* 카드 상단 컬러 라인 포인트 */}
              <div 
                className="absolute top-0 left-0 right-0 h-[5px] w-full z-20 transition-transform duration-300 origin-top group-hover:scale-y-[1.2]"
                style={{ backgroundColor: cat.color }}
              />

              <div className="space-y-5">
                {/* Visual Category Color Patch */}
                <div 
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-35 group-hover:scale-110 transition-all duration-500" 
                  style={{ backgroundColor: cat.color }}
                />

                {/* Left Bottom Sub-glow for Glassmorphic depth */}
                <div 
                  className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full blur-3xl opacity-12 group-hover:opacity-25 transition-all duration-500" 
                  style={{ backgroundColor: cat.color }}
                />

                {/* Icon Row */}
                <div className="flex justify-between items-center relative z-10">
                  <div 
                    className="w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all bg-white/80 backdrop-blur-md border border-white/60 group-hover:scale-110 shadow-3xs"
                    style={{ color: cat.color }}
                  >
                    <Icon className="w-5.5 h-5.5 md:w-6 md:h-6" style={{ color: cat.color }} />
                  </div>
                </div>

                {/* Category Text Description */}
                <div className="space-y-2 relative z-10">
                  <h3 className="text-[30px] font-black text-[#002147] tracking-wide group-hover:text-amber-500 transition-colors">
                    {cat.name}
                  </h3>
                  
                  {/* 담당자 정보 */}
                  <div className="py-3.5 border-t border-b border-slate-100/60 my-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 bg-slate-50/40 -mx-6 md:-mx-8 px-6 md:px-8 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                      {/* 사람 모양 컬러 미니 인디케이터 */}
                      <span 
                        className="w-5.5 h-5.5 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                          backgroundColor: `${cat.color}15`, 
                          color: cat.color 
                        }}
                      >
                        <User className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                      <span className="text-[#002147] font-black text-sm md:text-[15px] tracking-tight">{cat.leader}</span>
                    </div>
                    <div 
                      className="text-[11px] md:text-[11.5px] px-2.5 py-1 rounded-lg font-extrabold border transition-all duration-300 shadow-3xs"
                      style={{
                        color: cat.color,
                        borderColor: `${cat.color}35`,
                        backgroundColor: `${cat.color}08`,
                      }}
                    >
                      {cat.company}
                    </div>
                  </div>

                  <p className="text-[14px] text-slate-500 leading-relaxed font-medium break-keep">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Enter Button */}
              <div className="pt-6 relative z-10">
                <div 
                  className="w-full py-3.5 rounded-2xl text-center text-xs font-extrabold transition-all border shadow-3xs flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                    color: '#1E293B',
                  }}
                >
                  {cat.name} 더보기
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProjectComponent({
  selectedCategory: propCategory,
  setSelectedCategory: propSetSelectedCategory
}: {
  selectedCategory?: string | null;
  setSelectedCategory?: (cat: string | null) => void;
}) {
  const [internalCategory, setInternalCategory] = useState<string | null>(null);
  const selectedCategory = propCategory !== undefined ? propCategory : internalCategory;
  const setSelectedCategory = propSetSelectedCategory || setInternalCategory;
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);

  const categories = [
    { id: 'food', name: '식문화', icon: Soup, color: '#98b7a5' },
    { id: 'book', name: '북클럽', icon: BookOpen, color: '#D19D34' },
    { id: 'local', name: '로컬탐방', icon: Compass, color: '#d2833d' },
  ];

  const experts = [
    ...foodculturePosts,
    ...bookclubPosts,
    ...localPosts
  ];

  const filteredExperts = selectedCategory
    ? experts.filter((exp) => exp.category === selectedCategory)
    : experts;

  if (selectedCategory === null) {
    return (
      <ProjectPortal onSelectCategory={setSelectedCategory} />
    );
  }

  const activeCatInfo = categories.find((c) => c.id === selectedCategory);

  if (selectedExpert) {
    return (
      <div className="min-h-[500px] py-4 md:py-6">
        {/* Navigation Bar / Custom Breadcrumb Back Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <button 
            onClick={() => {
              setSelectedExpert(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-2xl border border-slate-200 hover:border-slate-300 shadow-3xs transition-all text-sm cursor-pointer w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-500" />
            뒤로 가기 (소모임 글 목록)
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 self-end sm:self-auto uppercase tracking-wide">
            <span>소모임 프로젝트</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-500">{activeCatInfo?.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 line-clamp-1 max-w-[200px]">{selectedExpert.name}</span>
          </div>
        </div>

        {/* Article Layout */}
        <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">


          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-widest bg-slate-100 text-slate-500 uppercase">
                {selectedExpert.categoryName}
              </span>
              {selectedExpert.date && (
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {selectedExpert.date}
                </span>
              )}
            </div>
            
            <h2 className="text-2xl md:text-4xl font-black text-[#002147] leading-tight break-keep">
              {selectedExpert.name}
            </h2>
          </div>

          <hr className="border-slate-100" />
          
          <div className="flex items-center gap-4 bg-slate-50/70 p-4.5 rounded-2xl border border-slate-100/80 max-w-md">
            <div className="w-11 h-11 rounded-full bg-[#002147]/5 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#002147]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">글쓴이 및 기획자</span>
              <p className="text-sm font-extrabold text-[#002147]">{selectedExpert.specialty}</p>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8 pt-4">
            {selectedExpert.contentBlocks ? (
              <div className="space-y-8 md:space-y-10">
                {selectedExpert.contentBlocks.map((block: any, idx: number) => {
                  if (block.type === 'heading') {
                    return (
                      <h4 
                        key={idx} 
                        className="text-lg md:text-2xl font-extrabold text-[#002147] border-l-4 pl-3.5 md:pl-4 py-0.5 mt-8 first:mt-0"
                        style={{ borderColor: COLORS.gold }}
                      >
                        {block.text}
                      </h4>
                    );
                  }
                  if (block.type === 'text') {
                    return (
                      <p 
                        key={idx} 
                        className="text-slate-600 text-sm md:text-base leading-relaxed md:leading-loose font-medium break-keep whitespace-pre-line"
                      >
                        {block.text}
                      </p>
                    );
                  }
                  if (block.type === 'quote') {
                    return (
                      <div 
                        key={idx}
                        className="my-6 py-4 px-6 bg-slate-50 text-[#002147] font-bold text-sm md:text-base leading-relaxed md:leading-loose whitespace-pre-line rounded-2xl border-l-4 border-amber-500 select-none"
                      >
                        {block.text}
                      </div>
                    );
                  }
                  if (block.type === 'gallery') {
                    const layout = block.layout || (block.images && block.images.length > 1 ? 'slider' : 'grid');
                    
                    if (layout === 'slider') {
                      return (
                        <div key={idx} className="my-6">
                          <GallerySlider images={block.images} />
                        </div>
                      );
                    }
                    
                    if (layout === 'scroll' || layout === 'carousel') {
                      return (
                        <div key={idx} className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 snap-x no-scrollbar my-6">
                          {block.images.map((img: any, imgIdx: number) => (
                            <div key={imgIdx} className="snap-start shrink-0 w-[80%] sm:w-[60%] md:w-[45%] bg-slate-50 rounded-2xl border border-slate-100 p-2 shadow-3xs">
                              <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-slate-100">
                                <img 
                                  src={img.url} 
                                  alt={img.caption || '갤러리 이미지'} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              {img.caption && (
                                <p className="mt-2 text-xs md:text-sm font-semibold text-slate-500 text-center truncate px-1">
                                  {img.caption}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    
                    if (layout === 'asymmetric' || layout === 'featured') {
                      const firstImage = block.images[0];
                      const subImages = block.images.slice(1);
                      return (
                        <div key={idx} className="space-y-4 my-6">
                          {firstImage && (
                            <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2.5 shadow-sm">
                              <div className="relative overflow-hidden rounded-xl aspect-[16/9] md:aspect-[21/9] bg-slate-100">
                                <img 
                                  src={firstImage.url} 
                                  alt={firstImage.caption || '대표 이미지'} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              {firstImage.caption && (
                                <p className="mt-2 text-xs md:text-sm font-bold text-slate-500 text-center">
                                  {firstImage.caption}
                                </p>
                              )}
                            </div>
                          )}
                          {subImages.length > 0 && (
                            <div className={`grid grid-cols-2 md:grid-cols-${Math.min(subImages.length, 3)} gap-4`}>
                              {subImages.map((img: any, imgIdx: number) => (
                                <div key={imgIdx} className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-1.5 shadow-3xs">
                                  <div className="relative overflow-hidden rounded-lg aspect-square bg-slate-100">
                                    <img 
                                      src={img.url} 
                                      alt={img.caption || '갤러리 이미지'} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  {img.caption && (
                                    <p className="mt-1.5 text-[11px] md:text-xs font-semibold text-slate-500 text-center truncate">
                                      {img.caption}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const cols = block.cols || 1;
                    let gridColsClass = "grid-cols-1";
                    if (cols === 2) {
                      gridColsClass = "grid-cols-1 md:grid-cols-2";
                    } else if (cols === 3) {
                      gridColsClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
                    } else if (cols >= 4) {
                      gridColsClass = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
                    }

                    const aspect = block.aspectRatio || 'original';
                    
                    return (
                      <div key={idx} className={`grid ${gridColsClass} gap-5 md:gap-6 my-6`}>
                        {block.images.map((img: any, imgIdx: number) => {
                          let imageClass = "transition-transform duration-500 ease-out";
                          
                          if (aspect === 'square') {
                            imageClass += " w-full aspect-square object-cover rounded-xl";
                          } else if (aspect === 'video') {
                            imageClass += " w-full aspect-video object-cover rounded-xl";
                          } else if (aspect === 'classic') {
                            imageClass += " w-full aspect-[4/3] object-cover rounded-xl";
                          } else if (aspect === 'match-height') {
                            imageClass += " h-full w-auto max-w-full object-contain mx-auto rounded-xl";
                          } else {
                            imageClass += " w-full h-auto object-contain rounded-xl block";
                          }

                          return (
                            <div key={imgIdx} className="relative overflow-hidden rounded-2xl w-full bg-slate-50 border border-slate-100 p-2 shadow-3xs">
                              <div className={`relative overflow-hidden rounded-xl ${aspect === 'match-height' ? 'h-40 sm:h-52 md:h-[240px] flex items-center justify-center bg-slate-50/50' : ''}`}>
                                <img 
                                  src={img.url} 
                                  alt={img.caption || '갤러리 이미지'} 
                                  className={imageClass}
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 tracking-wider block uppercase">상세 이야기</span>
                {selectedExpert.detailBody ? (
                  <div className="text-slate-600 text-sm md:text-base leading-relaxed md:leading-loose font-medium break-keep whitespace-pre-line space-y-4">
                    {selectedExpert.detailBody.trim()}
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed break-keep">
                    {selectedExpert.desc}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-10 border-t border-slate-100 flex items-center justify-center">
            <button 
              onClick={() => {
                setSelectedExpert(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-[#002147] hover:bg-[#003366] text-white font-bold rounded-2xl transition-colors text-sm cursor-pointer shadow-md flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              글 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[500px]">
      {/* Category Navigation Bar / Custom Breadcrumb Back Button */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <button 
          onClick={() => setSelectedCategory(null)}
          className="group flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-extrabold rounded-2xl border border-slate-200 hover:border-slate-300 shadow-3xs transition-all text-sm cursor-pointer w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-500" />
          뒤로 가기 (소모임 카테고리)
        </button>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 self-end sm:self-auto uppercase tracking-wide">
          <span>소모임 프로젝트</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800" style={{ color: activeCatInfo?.color }}>{activeCatInfo?.name}</span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="mt-2">
        {/* Desktop/Tablet Grid View */}
        <motion.div 
          layout
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredExperts.map((exp) => (
              <ExpertCard 
                key={`desktop-${exp.id}`}
                exp={exp} 
                categories={categories} 
                setSelectedExpert={setSelectedExpert} 
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Mobile 1-Column List View */}
        <motion.div 
          layout
          className="block md:hidden divide-y divide-slate-100"
        >
          <AnimatePresence mode="popLayout">
            {filteredExperts.map((exp) => {
              const catInfo = categories.find((c) => c.id === exp.category);
              const iconColor = catInfo ? catInfo.color : '#00a896';

              return (
                <motion.div
                  layout
                  key={`mobile-${exp.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setSelectedExpert(exp)}
                  className="flex justify-between items-start py-5.5 cursor-pointer active:bg-slate-100/40 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span 
                      className="text-[11px] font-bold underline underline-offset-4 decoration-1 tracking-wider uppercase inline-block cursor-pointer hover:opacity-80"
                      style={{ color: iconColor, textDecorationColor: `${iconColor}50` }}
                    >
                      {exp.categoryName}
                    </span>
                    <h3 className="text-[15.5px] font-bold text-slate-900 leading-snug break-keep line-clamp-2 pt-0.5">
                      {exp.name}
                    </h3>
                    <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-2 font-normal font-sans break-keep pt-0.5">
                      {exp.desc}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400 font-medium font-sans">
                      <span>{exp.specialty}</span>
                      <span>•</span>
                      <span>{exp.date || '2026.06.18'}</span>
                    </div>
                  </div>

                  {exp.image && (
                    <div className="w-[76px] h-[76px] rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-3xs self-center">
                      <img 
                        src={exp.image} 
                        alt={exp.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredExperts.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            등록된 소모임 프로젝트가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
