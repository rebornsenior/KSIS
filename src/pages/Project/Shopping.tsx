import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../../constants';
import { Store, ArrowUpRight, User, Tag, Globe, ExternalLink } from 'lucide-react';
import callimHero from '../../images/project/shopping-mall/callim.webp';
import callimLogo from '../../images/project/shopping-mall/callim_logo.png';

export default function ShoppingComponent() {
  const companies = [
    {
      id: 1,
      name: '주식회사 캘리엠',
      representative: '박서영 대표자 / 회원님',
      category: 'all',
      categoryName: '기타소품 / 디자인',
      tagline: '일상의 작은 순간에 특별한 가치를 더하는 감성 디자인 기업, 캘리엠(Calli-M)입니다.',
      descParagraphs: [
        `캘리엠(Calli-M)은 감성 디자인 콘텐츠를 기반으로 문구, 굿즈, 관광기념품을 기획·제작하는 디자인 전문기업입니다. 'Little Things, More Precious'라는 brand 철학 아래, 일상의 작은 경험과 이야기를 상품과 콘텐츠로 재해석하여 새로운 가치를 만들어가고 있습니다.`,
        `자체 브랜드 상품 개발은 물론 기업·기관의 브랜드 굿즈, 홍보물, 관광상품 개발 등 다양한 프로젝트를 수행하고 있으며, 디자인을 통해 사람과 지역, 그리고 비즈니스를 연결하는 역할을 지향합니다.`
      ],
      image: callimHero,
      logo: callimLogo,
      link: 'https://calli-m.com'
    }
  ];

  const handleOpenStore = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-slate-50 min-h-[600px] pb-12">
      {/* Introduction Banner */}
      <div className="mb-10 p-6 bg-amber-50/50 rounded-2xl border border-amber-100/80 max-w-4xl">
        <p className="text-xs font-semibold text-amber-800 flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-600" />
          회원사 상생 비즈니스 채널
        </p>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed break-keep">
          우리 협회 회원님들께서 직접 경영하시는 우수 기업의 공식 홈페이지 및 온·오프라인 스토어를 연람하고 곧바로 이동하실 수 있는 공간화 채널입니다. 회원님들의 활발한 교류협력과 비즈니스 성장을 기원합니다.
        </p>
      </div>

      {/* Simplified, elegant horizontal design flow */}
      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {companies.map((com, index) => (
            <motion.div
              layout
              key={com.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Main row layout: Horizontal on PC, vertical stacked on Mobile */}
              <div className="flex flex-col lg:flex-row min-h-[460px]">
                
                {/* 1. Image Area (Occupies Left Column on PC) */}
                <div className="w-full lg:w-[45%] h-64 sm:h-80 lg:h-auto relative overflow-hidden bg-slate-100 shrink-0">
                  <img 
                    src={com.image} 
                    alt={com.name} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:hidden" />
                  
                  {/* Category overlay tags */}
                  <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                    <span className="bg-[#002147] text-white backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black tracking-wide uppercase shadow-sm">
                      {com.categoryName}
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 lg:hidden flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-black text-white drop-shadow-sm mb-1">{com.name}</h3>
                      <p className="text-white/85 text-xs font-semibold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        {com.representative}
                      </p>
                    </div>
                    {com.logo && (
                      <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-white/95 flex items-center justify-center p-1.5">
                        <img 
                          src={com.logo} 
                          alt={`${com.name} 로고`}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Content Details Area (Occupies Right Column on PC) */}
                <div className="w-full lg:w-[55%] p-6 sm:p-8 lg:p-12 flex flex-col justify-between space-y-8 bg-white">
                  
                  <div className="space-y-6">
                    {/* Header tags for PC */}
                    <div className="hidden lg:flex items-center justify-between">
                      <span className="text-xs font-black tracking-widest text-amber-600 uppercase flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        주요 기업 동정 및 정보
                      </span>
                      <span className="text-sm font-semibold text-slate-400 font-sans flex items-center gap-1">
                        KSIS 정회원사
                      </span>
                    </div>

                    {/* Company Name & Representative */}
                    <div className="hidden lg:flex items-center justify-between gap-4 w-full">
                      <div className="space-y-1.5">
                        <h3 className="text-3xl font-extrabold text-[#002147] tracking-tight">
                          {com.name}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                          <span className="px-2.5 py-0.5 bg-slate-100 rounded text-xs text-slate-600 font-extrabold">대표</span>
                          <span>{com.representative}</span>
                        </div>
                      </div>
                      {com.logo && (
                        <div className="w-[58px] h-[58px] shrink-0 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1">
                          <img 
                            src={com.logo} 
                            alt={`${com.name} 로고`} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    <hr className="hidden lg:block border-slate-100" />

                    {/* One-Line Tagline with gold quote bar */}
                    <div className="pl-4 border-l-4 border-amber-500/80 bg-amber-50/20 py-2 rounded-r-xl">
                      <p className="text-base md:text-[17px] font-black text-slate-800 leading-normal break-keep">
                        "{com.tagline}"
                      </p>
                    </div>

                    {/* Detailed Multi-Paragraph Body Description */}
                    <div className="space-y-4">
                      {com.descParagraphs.map((para, pIdx) => (
                        <p 
                          key={pIdx} 
                          className="text-slate-600 text-sm md:text-[15px] leading-relaxed md:leading-loose font-medium break-keep text-justify"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Immediate Direct Connect Store Button */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="text-left">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-widest">STORE ADDRESS</span>
                      <p className="text-xs font-semibold text-slate-500 truncate max-w-[280px] font-mono mt-0.5">{com.link}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleOpenStore(com.link)}
                      className="py-4 px-6 md:px-8 bg-[#002147] hover:bg-[#003366] text-white font-extrabold rounded-2xl transition-all duration-250 text-sm cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 group shrink-0 active:scale-95"
                    >
                      <Globe className="w-4 h-4 text-amber-400" />
                      공식 홈페이지 및 스토어 바로가기
                      <ExternalLink className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {companies.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 text-slate-400">
            해당 업종 카테고리의 기업 리스트가 존재하지 않습니다.
          </div>
        )}
      </div>

    </div>
  );
}
