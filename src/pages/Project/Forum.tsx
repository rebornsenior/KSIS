import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../../constants';
import { Users, FileText, Calendar, MapPin, X, Landmark, GraduationCap } from 'lucide-react';
import { forumsData } from './forum';

interface ForumCardProps {
  forum: any;
  categories: Array<{ id: string; name: string; icon: any; color: string }>;
  setSelectedForum: (forum: any) => void;
  key?: string;
}

function ForumCard({ forum, categories, setSelectedForum }: ForumCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const catInfo = categories.find((c) => c.id === forum.category);
  const Icon = catInfo ? catInfo.icon : Users;
  const iconColor = catInfo ? catInfo.color : '#64748B';

  return (
    <motion.div
      layout
      key={`desktop-${forum.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      onClick={() => setSelectedForum(forum)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-none overflow-hidden border transition-all duration-300 flex flex-col sm:flex-row cursor-pointer group min-h-[220px]"
      style={{
        borderColor: isHovered ? iconColor : '#E2E8F0',
        boxShadow: isHovered 
          ? `0 16px 32px -8px ${iconColor}20, 0 4px 12px -3px ${iconColor}10` 
          : '0 4px 10px -2px rgba(15, 23, 42, 0.02), 0 2px 4px -1px rgba(15, 23, 42, 0.02)',
      }}
    >
      {/* 왼쪽에 4:3 비율 썸네일 */}
      {forum.image && (
        <div 
          className="w-full sm:w-[293px] relative overflow-hidden shrink-0 bg-slate-50 border-r border-slate-100"
          style={{ aspectRatio: '4/3' }}
        >
          <img 
            src={forum.image} 
            alt={forum.name}
            className="w-full h-full object-cover object-top transition-transform duration-500"
            style={{
              transform: isHovered ? 'scale(1.06)' : 'scale(1)',
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      )}

      {/* 오른쪽에 제목(강조) / 진행자 이름 / 본문 설명 */}
      <div className="flex-1 p-6 md:p-7.5 flex flex-col justify-between min-w-0">
        <div className="space-y-3.5">
          <div className="flex items-center justify-end">
            <span className="text-[11px] text-slate-400 font-bold font-mono">
              {forum.date || '2026.06.20'}
            </span>
          </div>

          <div className="space-y-[11px]">
            {/* 제목(강조) */}
            <h3 
              className="text-xl md:text-[30px] font-black leading-snug break-keep transition-colors duration-300 text-slate-900 line-clamp-2"
              style={{ color: isHovered ? iconColor : '#002147' }}
            >
              {forum.name}
            </h3>

            {/* 작성자 이름 */}
            <p 
              className="text-xs md:text-[14px] font-extrabold transition-colors duration-300 flex items-center gap-1.5" 
              style={{ color: isHovered ? iconColor : COLORS.gold }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isHovered ? iconColor : COLORS.gold }} />
              작성자: {forum.specialty}
            </p>
          </div>
        </div>

        {/* 본문 설명과 더보기 버튼의 수평 정렬 (동일 y축 위치) */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* 본문 설명 */}
          <p className="flex-1 text-[13.5px] md:text-[14.5px] text-slate-500 leading-relaxed font-medium break-keep line-clamp-2 md:line-clamp-3">
            {forum.desc}
          </p>

          {/* 더보기 버튼 */}
          <div className="shrink-0 flex justify-end">
            <div 
              className="px-4.5 py-2.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all duration-300"
              style={{
                backgroundColor: isHovered ? iconColor : '#F8FAFC',
                borderColor: isHovered ? iconColor : '#E2E8F0',
                color: isHovered ? '#FFFFFF' : '#1E293B',
              }}
            >
              포럼 참관기 및 보기
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ForumComponent() {
  const [selectedForum, setSelectedForum] = useState<any | null>(null);

  const categories = [
    { id: 'regular', name: '비즈니스 네트워킹', icon: Landmark, color: '#0d9488' },
    { id: 'special', name: '역량강화', icon: GraduationCap, color: '#7950F2' }
  ];

  const forums = forumsData;
  const filteredForums = forums;

  const handleSelectForum = (forum: any) => {
    setSelectedForum(forum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedForum) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-transparent border-0 shadow-none"
      >
        {/* Back navigation header - Frameless & Transparent */}
        <div className="py-4 border-b border-slate-200/60 flex items-center justify-between bg-transparent">
          <button
            onClick={() => setSelectedForum(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs md:text-sm hover:bg-slate-50 hover:text-[#002147] hover:border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            ← 목록으로 돌아가기
          </button>
          
          {selectedForum.date && (
            <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {selectedForum.date}
            </span>
          )}
        </div>

        {/* Content area - Expanded to max-w-6xl & Frameless */}
        <div className="max-w-6xl mx-auto py-8 md:py-12 space-y-8 px-4 sm:px-6 md:px-8">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-black text-[#002147] leading-tight break-keep">
              {selectedForum.name}
            </h1>
            
            <div className="flex items-center gap-3 bg-slate-100/50 p-4 rounded-none border border-slate-200/40 w-fit">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-extrabold text-xs">
                {selectedForum.specialty ? selectedForum.specialty[0] : '포'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">작성자</span>
                <p className="text-sm font-extrabold text-[#002147]">{selectedForum.specialty}</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-200/60" />
          
          {/* Body Text Blocks */}
          <div className="space-y-6">
            {selectedForum.contentBlocks && (
              <div className="space-y-8">
                {selectedForum.contentBlocks.map((block: any, idx: number) => {
                  if (block.type === 'heading') {
                    return (
                      <h2 
                        key={idx} 
                        className="text-base md:text-xl font-extrabold text-[#002147] border-l-4 pl-3.5 md:pl-4 py-0.5 mt-8 first:mt-0"
                        style={{ borderColor: COLORS.gold }}
                      >
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.type === 'text') {
                    return (
                      <p 
                        key={idx} 
                        className="text-slate-600 text-[17px] md:text-[18.5px] leading-relaxed md:leading-loose font-medium break-keep whitespace-pre-line"
                      >
                        {block.text}
                      </p>
                    );
                  }
                  if (block.type === 'quote') {
                    return (
                      <div 
                        key={idx}
                        className="my-6 p-5 md:p-7 rounded-none border-l-[5px] border-[#002147] text-slate-800 italic font-semibold text-xs md:text-sm leading-relaxed md:leading-loose bg-slate-100/50 border border-slate-200/30 whitespace-pre-line"
                      >
                        {block.text}
                      </div>
                    );
                  }
                  if (block.type === 'image') {
                    return (
                      <div key={idx} className="my-6 overflow-hidden rounded-none border border-slate-200/40 shadow-sm max-w-4xl">
                        <img src={block.src} alt={block.alt || '강연 이미지'} className="w-full h-auto object-cover" />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-slate-200/60 flex justify-center">
            <button 
              onClick={() => setSelectedForum(null)}
              className="px-8 py-3.5 bg-[#002147] hover:bg-[#003366] text-white font-extrabold rounded-none transition-colors text-sm cursor-pointer shadow-md"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[500px]">
      {/* List Content */}
      <div className="mt-6 md:mt-8">
        {/* Unified Responsive 1-Column List View */}
        <motion.div 
          layout
          className="flex flex-col gap-6 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredForums.map((forum) => (
              <ForumCard
                key={String(forum.id)}
                forum={forum}
                categories={categories}
                setSelectedForum={handleSelectForum}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredForums.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            등록된 비즈니스 포럼 리스트가 존재하지 않습니다.
          </div>
        )}
      </div>
    </div>
  );
}
