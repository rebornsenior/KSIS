import AuthorBadge from '../../components/AuthorBadge';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../../constants';
import { BookOpen, Calendar, Mail, FileText, Award, Layers, X } from 'lucide-react';
import { educationsData } from './education/index';
import { GallerySlider } from './Project';
import ContentLink from '../../components/ContentLink';
import { textAlignment, headingAlignment, quoteAlignment, imageAlignment } from '../../content/alignment';

interface EducationCardProps {
  clas: any;
  categories: any[];
  setSelectedClass: any;
  key?: any;
}

function EducationCard({ clas, categories, setSelectedClass }: EducationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const catInfo = categories.find((c) => c.id === clas.category);
  const iconColor = catInfo ? catInfo.color : '#64748B';

  return (
    <motion.div
      layout
      key={`desktop-${clas.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      onClick={() => setSelectedClass(clas)}
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
      {clas.image && (
        <div 
          className="w-full sm:w-[293px] relative overflow-hidden shrink-0 bg-slate-50 border-r border-slate-100"
          style={{ aspectRatio: '4/3' }}
        >
          <img 
            src={clas.image} 
            alt={clas.name}
            className="w-full h-full object-cover object-top transition-transform duration-500"
            style={{
              transform: isHovered ? 'scale(1.06)' : 'scale(1)',
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      )}

      {/* 오른쪽에 제목(강조) / 강사 이름 / 본문 설명 */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between min-w-0">
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                {clas.duration}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold font-mono">
              {clas.date || '2026.06.14'}
            </span>
          </div>

          <div className="space-y-[11px]">
            {/* 제목(강조) */}
            <h3 
              className="text-xl md:text-[30px] font-black leading-snug break-keep transition-colors duration-300 text-slate-900 line-clamp-2"
              style={{ color: isHovered ? iconColor : '#002147' }}
            >
              {clas.name}
            </h3>

            {/* 작성자 이름 */}
            <p 
              className="text-xs md:text-[14px] font-extrabold transition-colors duration-300 flex items-center gap-1.5" 
              style={{ color: isHovered ? iconColor : COLORS.gold }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isHovered ? iconColor : COLORS.gold }} />
              작성자: {clas.specialty}
            </p>
          </div>
        </div>

        {/* 본문 설명 */}
        <p className="mt-4 text-[13.5px] md:text-[14.5px] text-slate-500 leading-relaxed font-medium break-keep line-clamp-3">
          {clas.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function EducationComponent({ previewPost }: { previewPost?: any } = {}) {
  const [storedClass, setSelectedClass] = useState<any | null>(null);
  const selectedClass = previewPost || storedClass;

  const categories = [
    { id: 'digital', name: '실무 교육', icon: BookOpen, color: '#0d9488' },
    { id: 'marketing', name: '디지털 역량 강화', icon: Layers, color: '#4F46E5' }
  ];

  const classes = educationsData;

  const handleSelectClass = (clas: any) => {
    setSelectedClass(clas);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedClass) {
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
            onClick={() => setSelectedClass(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs md:text-sm hover:bg-slate-50 hover:text-[#002147] hover:border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            ← 목록으로 돌아가기
          </button>
          
          {selectedClass.date && (
            <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {selectedClass.date}
            </span>
          )}
        </div>

        {/* Content area - Expanded to max-w-6xl & Frameless */}
        <div className="max-w-6xl mx-auto py-8 md:py-12 space-y-8 px-4 sm:px-6 md:px-8">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-black text-[#002147] leading-tight break-keep">
              {selectedClass.name}
            </h1>
            
            <AuthorBadge name={selectedClass.specialty} />
          </div>

          <hr className="border-slate-200/60" />
          
          {/* Body Text Blocks */}
          <div className="space-y-6">
            {selectedClass.contentBlocks && (
              <div className="space-y-8">
                {selectedClass.contentBlocks.map((block: any, idx: number) => {
                  if (block.type === 'heading') {
                    return (
                      <h2 
                        key={idx} 
                        className="text-lg md:text-2xl font-extrabold text-[#002147] border-l-4 pl-3.5 md:pl-4 py-0.5 mt-8 first:mt-0"
                        style={{ borderColor: COLORS.gold, ...headingAlignment(block.align) }}
                      >
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.type === 'text') {
                    return (
                      <p 
                        key={idx} style={textAlignment(block.align)}
                        className="text-slate-600 text-sm md:text-base leading-relaxed md:leading-loose font-medium break-keep whitespace-pre-line"
                      >
                        {block.text}
                      </p>
                    );
                  }
                  if (block.type === 'link') {
                    return <ContentLink key={idx} url={block.url} text={block.text} align={block.align} />;
                  }
                  if (block.type === 'quote') {
                    return (
                      <div 
                        key={idx} style={quoteAlignment(block.align)}
                        className="my-6 p-5 md:p-7 rounded-none border-2 border-amber-600 text-[#002147] font-bold text-sm md:text-base leading-relaxed md:leading-loose whitespace-pre-line"
                      >
                        {block.text}
                      </div>
                    );
                  }
                  if (block.type === 'gallery') {
                    return <GallerySlider key={idx} images={block.images || []} />;
                  }
                  if (block.type === 'image') {
                    return (
                      <div key={idx} style={imageAlignment(block.align)} className="my-6 overflow-hidden rounded-none border border-slate-200/40 shadow-sm max-w-4xl">
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
              onClick={() => setSelectedClass(null)}
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
      {/* Grid Content */}
      <div className="mt-1.5 sm:mt-4">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {classes.map((clas) => (
              <EducationCard
                key={clas.id}
                clas={clas}
                categories={categories}
                setSelectedClass={handleSelectClass}
              />
            ))}
          </AnimatePresence>
        </div>

        {classes.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            해당 등급의 교육 과정이 존재하지 않습니다.
          </div>
        )}
      </div>
    </div>
  );
}
