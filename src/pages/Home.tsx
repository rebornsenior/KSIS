import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, Archive, Users, BarChart3, ArrowUpRight, Handshake, ChartNoAxesCombined, UsersRound, FileText, ClipboardList, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { COLORS, ROUTES } from '../constants';
import heroImg1 from '../images/hero-01.webp';
import heroImg2 from '../images/hero-02.webp';
import heroImg3 from '../images/hero-03.webp';
import heroImg4 from '../images/hero-04.webp';
import CalendarSection from '../components/calendar/CalendarSection';

const heroImages = [heroImg1, heroImg2, heroImg3, heroImg4];

const heroImagePositions = [
  'object-[75%_center]', // 1번 슬라이드
  'object-[90%_center]', // 2번 슬라이드
  'object-[75%_center]', // 3번 슬라이드
  'object-[90%_center]', // 4번 슬라이드
];

const slideContents = [
  {
    heading: (
      <>
        가장 빛나는 커리어의 완성 <br />
        <span className="text-[#dcb46a] md:text-[#A68B5B]">인생 2막</span> 플랫폼
      </>
    ),
    description: (
      <>
        경험이 자신이 되고 꿈이 비즈니스가 되는 이곳에서 당신의 다음 장을 설계하세요.
      </>
    )
  },
  {
    heading: (
      <>
        <span className="text-[#dcb46a] md:text-[#A68B5B]">세대</span>를 넘어 <span className="text-[#dcb46a] md:text-[#A68B5B]">경험</span>을 연결하는 <br />
        비즈니스 플랫폼
      </>
    ),
   description: (
      <>
        전 세대를 아우르는 전문가 네트워크를 통해 서로의 역량을 자산화하고 <br className="hidden md:block" />
        동반 성장의 기회를 설계합니다.
      </>
    )
  },
  {
    heading: (
      <>
        지식을 <span className="text-[#dcb46a] md:text-[#A68B5B]">자산</span>으로 <br />
        네트워크를 <span className="text-[#dcb46a] md:text-[#A68B5B]">성공</span>으로
      </>
    ),
    description: (
      <>
        개인이 보유한 무형의 지식을 측정 가능한 비즈니스 자산으로 전환하며 <br className="hidden md:block" />
        모두가 동반 성장하는 강력한 파트너십을 구축합니다.
      </>
    )
  },
  {
    heading: (
      <>
        <span className="text-[#dcb46a] md:text-[#A68B5B]">경륜</span>의 지혜와 <span className="text-[#dcb46a] md:text-[#A68B5B]">젊은</span> 감각이 <br />
        만나는 혁신의 무대
      </>
    ),
    description: (
      <>
        시니어의 깊은 노하우와 청년 전문가의 협업으로 <br className="hidden md:block" />
        실질적인 해법과 새로운 가치를 창출합니다.
      </>
    )
  }
];

const programs = [
  {
    id: 1,
    name: '비즈니스 포럼',
    title: '비즈니스 네트워킹 / 역량 강화',
    description: '정기적인 비즈니스 포럼을 통해 회원 간 전문성을 교류하고, 실전 비즈니스 역량을 함께 강화합니다.',
    category: 'Forum'
  },
  {
    id: 2,
    name: '소모임 프로젝트',
    title: '식문화 / 북클럽 / 로컬탐방',
    description: '관심사 기반의 소모임 활동을 통해 자연스러운 관계 형성과 비즈니스 교류의 기회를 만듭니다.',
    category: 'Project'
  },
  {
    id: 3,
    name: '쇼핑몰',
    title: '커머스 구축 / 수익화 지원',
    description: '회원들의 상품과 서비스를 소개하고 판매할 수 있는 쇼핑몰 기반 플랫폼을 구축하여 수익화를 지원합니다.',
    category: 'Platform'
  },
  {
    id: 4,
    name: 'AI · 마케팅 · 창업 교육',
    title: '실무 교육 / 디지털 역량 강화',
    description: 'AI 활용, 마케팅, 창업 교육 등 실전에 필요한 교육 프로그램을 통해 새로운 도전과 성장을 돕습니다.',
    category: 'Education'
  }
];

export default function Home() {
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number>(0);
  const [touchEndX, setTouchEndX] = useState<number>(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  useEffect(() => {
    const handleScrollToProject = () => {
      const isProjectGoto = window.location.hash === '#project-section' || 
                            location.search.includes('goto=project') ||
                            window.location.href.includes('goto=project');
      if (isProjectGoto) {
        const element = document.getElementById('project-section');
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }
    };

    handleScrollToProject();
    window.addEventListener('hashchange', handleScrollToProject);
    return () => window.removeEventListener('hashchange', handleScrollToProject);
  }, [location.search]);

  const coreValues = [
    {
      title: '연결',
      description: '전 세대를 아우르는 전문가 풀을 활용하여 최적의 비즈니스 파트너와 프로젝트를 매칭합니다.',
      icon: Handshake,
    },
    {
      title: '자산화',
      description: '개인의 오랜 실무 경험과 핵심 노하우를 구체적인 비즈니스 모델로 전환하여, 실질적인 수익과 가치 창출을 지원합니다.',
      icon: ChartNoAxesCombined,
    },
    {
      title: '동반성장',
      description: '회원 간의 협력적 비즈니스를 통해 사회적 가치와 경제적 성과를 동시에 달성합니다.',
      icon: UsersRound,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative h-[calc(100dvh-80px)] md:h-auto min-h-[560px] md:min-h-[85vh] flex items-center px-6 md:px-12 lg:px-16 xl:px-20 py-12 md:py-20 bg-slate-900 overflow-hidden"
      >
        {/* Background Carousel with crossfade */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: idx === currentSlide ? 0.7 : 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img 
                src={img} 
                alt={`Hero Background ${idx + 1}`} 
                className={`w-full h-full object-cover ${heroImagePositions[idx]} md:object-center`}
              />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 md:from-slate-900 via-slate-900/10 to-transparent md:via-slate-900/60 z-1" />
        </div>

        {/* Carousel Navigation Buttons on ends */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full bg-slate-900/40 hover:bg-slate-950/70 text-white/70 hover:text-white transition-all backdrop-blur-sm group border border-white/10 shadow-lg cursor-pointer hidden md:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:scale-110" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full bg-slate-900/40 hover:bg-slate-950/70 text-white/70 hover:text-white transition-all backdrop-blur-sm group border border-white/10 shadow-lg cursor-pointer hidden md:flex"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:scale-110" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Mobile bottom-pinned button: persistently aligned right above the dot indicators */}
        <div className="absolute bottom-16 left-0 right-0 flex md:hidden justify-center z-20">
          <a
            href="https://cafe.naver.com/ksis1"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[220px] px-4 py-3 rounded-[35px] flex items-center justify-center gap-2 text-sm font-bold backdrop-blur-sm"
            style={{ 
              color: COLORS.white,
              border: '0.8px solid transparent',
              backgroundImage: 'linear-gradient(rgba(2, 6, 23, 0.4), rgba(2, 6, 23, 0.4)), linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 35%, rgba(255, 255, 255, 0.3) 70%, rgba(255, 255, 255, 0.02) 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box'
            }}
          >
            네이버 카페 바로가기
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="max-w-[1720px] mx-auto w-full relative z-10 h-auto py-4 md:py-0">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl h-auto md:h-auto md:block translate-y-24 md:translate-y-0"
          >
            <div className="relative md:top-0">
              <motion.h1 
                key={`h1-${currentSlide}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-bold text-white tracking-tight leading-[1.4] md:leading-[1.2] text-[clamp(24px,7.5vw,34px)] md:text-[65px]"
              >
                {slideContents[currentSlide].heading}
              </motion.h1>
       
              <div className="relative md:h-auto mt-[15px] md:mt-8">
                <motion.p 
                  key={`p-${currentSlide}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="min-h-[74px] md:min-h-0 text-[clamp(13px,3.8vw,16px)] md:text-2xl text-white/60 md:text-white/70 font-light leading-relaxed max-w-2xl break-keep"
                >
                  {slideContents[currentSlide].description}
                </motion.p>
              </div>
            </div>

            <div className="hidden md:flex flex-col sm:flex-row gap-4 mt-8">
              <a
                href="https://cafe.naver.com/ksis1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[220px] mx-auto md:w-auto md:mx-0 px-4 py-3 md:px-[35px] md:py-5 rounded-[35px] md:rounded-[35px] flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg font-bold backdrop-blur-sm transition-all hover:bg-white/5"
                style={{ 
                  color: COLORS.white,
                  border: '0.8px solid transparent',
                  backgroundImage: 'linear-gradient(rgba(2, 6, 23, 0.4), rgba(2, 6, 23, 0.4)), linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 35%, rgba(255, 255, 255, 0.3) 70%, rgba(255, 255, 255, 0.02) 100%)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box'
                }}
              >
                네이버 카페 바로가기
                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="pt-24 pb-16 md:pt-[150px] md:pb-20 px-6 md:px-12 lg:px-16 xl:px-20 bg-white flex flex-col justify-center" id="about-section" style={{ minHeight: '500px' }}>
        <div className="max-w-[1200px] mx-auto w-full text-center space-y-6">

          {/* Heading */}
          <h2 className="text-[15vw] md:text-[96px] text-[#002147] opacity-[0.10] md:opacity-10 md:pt-[20px] font-bold tracking-tight md:tracking-[-0.05em] whitespace-nowrap overflow-visible relative left-0 md:left-0 w-full md:w-auto text-center md:text-center mb-0">ABOUT</h2>

          {/* Description Text underneath */}
          <div className="space-y-4 md:space-y-5 text-slate-700 max-w-4xl mx-auto" style={{ marginTop: '18px' }}>
            <p className="text-[14px] md:text-lg text-slate-700 font-medium break-keep" style={{ lineHeight: '1.6', letterSpacing: '-0.02em' }}>
              한국시니어교류협회(KSIS)는 나이와 세대의 경계를 허물고,  <br className="hidden md:block" />
              전 세대를 아우르는 전문가 네트워크를 통해 서로의 역량을 자산화하는 오픈 플랫폼입니다.
            </p>
            <p className="text-[14px] md:text-lg text-slate-700 md:whitespace-nowrap font-medium break-keep" style={{ lineHeight: '1.6', letterSpacing: '-0.02em' }}>
              시니어의 완숙한 경륜과 젊은 세대의 혁신적인감각을 융합하여 단순한 교류를 넘어선 실질적인 비즈니스 기회를 창출합니다.
            </p>
            <p className="text-[14px] md:text-lg text-slate-700 font-medium mx-auto break-keep" style={{ lineHeight: '1.6', width: '960px', maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto', letterSpacing: '-0.02em' }}>
              서로의 역량을 신뢰하고 함께 성장하는 상생의 생태계, 가장 프로페셔널한 인생 2막의 미래를 설계해 드립니다.
            </p>
          </div>

          {/* Read more Button */}
          <div className="flex justify-center pt-2 md:pt-3">
            <Link 
              to={ROUTES.ABOUT} 
              className="group inline-flex items-center gap-2 pb-[2px] md:pb-[4px] text-[#0d34a6] font-medium border-b border-[#0d34a6] md:border-transparent md:hover:border-[#0d34a6] transition-colors"
            >
              <span>Read more</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CORE VALUE Section */}
      <section className="pt-24 pb-0 md:pb-[150px] px-6 md:px-12 lg:px-16 xl:px-20" style={{ backgroundColor: '#ffffff', paddingTop: '0px' }}>
        <div className="max-w-[1720px] mx-auto">


          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8 w-full">
            {coreValues.map((value, idx) => {
              const mobileBg = idx === 1 ? 'bg-white' : 'bg-[#edf3ff]';
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className={`group flex flex-col items-center md:items-start justify-center md:justify-between text-center md:text-left w-screen h-[240px] md:w-full md:h-[350px] relative left-1/2 -translate-x-1/2 md:static md:translate-x-0 border-0 ${mobileBg} px-8 py-8 md:p-10 rounded-none md:rounded-[32px] ${idx === 1 ? 'md:border md:border-[#f1f3f5] md:border-solid' : ''}`}
                >
                  <div className="flex flex-col gap-[2px] w-full md:contents">
                    {/* Header layout: stacked on mobile, ordered as div -> h3 -> span via flex order; ordered as div -> span -> h3 on desktop */}
                    <div className="flex flex-col items-center md:items-start gap-[6px] w-full mb-0 md:block">
                      {/* Number Div */}
                      <div className="text-[19px] md:text-[24px] font-bold leading-none text-[#4E5968]/40 tracking-tighter md:tracking-wide mb-0 md:mb-6 order-1 text-center md:text-left">
                        0{idx + 1}
                      </div>

                      {/* Korean Title (h3) - ordered second on mobile, comes before span on PC */}
                      <h3 className="font-bold text-[32px] md:text-[45px] tracking-[0.03em] md:tracking-normal leading-none mb-0 md:mb-2 text-[#4E5968] order-2 md:order-none text-center md:text-left">
                        {value.title}
                      </h3>

                      {/* English Tag (span) - ordered third on mobile, comes after h3 on PC */}
                      <span className="text-[13px] md:text-[15px] font-semibold md:font-bold text-[#191F28]/80 uppercase tracking-tight block leading-none md:mt-0 md:mb-4 md:pl-[3px] self-center md:self-start order-3 md:order-none text-center md:text-left">
                        {idx === 1 ? 'Assetization' : (idx === 2 ? 'Growth' : 'Connect')}
                      </span>
                    </div>
                  </div>

                  <div className="w-full mt-[45px] md:mt-0">
                    <p className="text-[14px] md:text-[15px] text-[#191F28] font-medium md:leading-[1.8] break-keep text-center md:text-left" style={{ lineHeight: '1.6', letterSpacing: '-0.02em' }}>
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Competency Archive Section */}
      <section id="project-section" className="pt-12 pb-24 md:py-24 px-6 md:px-12 lg:px-16 xl:px-20" style={{ backgroundColor: COLORS.offWhite }}>
        <div className="max-w-[1720px] mx-auto space-y-16">
          <div className="flex flex-col items-center justify-center gap-6 text-center w-full">
            <div className="space-y-4 flex flex-col items-center w-full">

              <h2 className="text-[15vw] md:text-[96px] text-[#002147] opacity-[0.10] md:opacity-10 pt-[40px] md:pt-[20px] font-bold tracking-tight md:tracking-[-0.05em] whitespace-nowrap overflow-visible relative left-0 w-full text-center self-center mb-0">PROJECT</h2>
              <p className="text-[14px] md:text-lg text-slate-700 max-w-2xl md:max-w-none md:whitespace-nowrap font-medium text-center mx-auto break-keep" style={{ lineHeight: '1.6', letterSpacing: '-0.02em' }}>
               KSIS가 운영하는 포럼, 프로젝트, 플랫폼, 교육 프로그램을 통해 교류와 수익화, 성장을 함께 만들어갑니다.
              </p>
            </div>
            
            <Link 
              to={ROUTES.ARCHIVE} 
              className="group inline-flex items-center gap-2 pb-[2px] md:pb-[4px] text-[#0d34a6] font-medium border-b border-[#0d34a6] md:border-transparent md:hover:border-[#0d34a6] transition-colors h-fit mx-auto"
            >
              <span>전체 프로그램 보기</span>
              <ChevronRight className="w-4 h-4 transition-transform md:group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((program, i) => {
              const styles = [
                {
                  bgColor: 'bg-[#3a6182]',
                  textColor: 'text-white',
                  titleColor: 'text-white',
                  descColor: 'text-white/85',
                  buttonClass: 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                },
                {
                  bgColor: 'bg-[#98b7a5]',
                  textColor: 'text-white',
                  titleColor: 'text-white',
                  descColor: 'text-white/85',
                  buttonClass: 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                },
                {
                  bgColor: 'bg-[#D19D34]',
                  textColor: 'text-white',
                  titleColor: 'text-white',
                  descColor: 'text-white',
                  buttonClass: 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                },
                {
                  bgColor: 'bg-[#d2833d]',
                  textColor: 'text-white',
                  titleColor: 'text-white',
                  descColor: 'text-white/85',
                  buttonClass: 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                },
              ];
              const currentStyle = styles[i % styles.length];

              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`${currentStyle.bgColor} p-8 rounded-[32px] shadow-sm border border-transparent group md:hover:shadow-xl transition-all flex flex-col justify-between text-left`}
                >
                  <div>
                    <h3 className={`text-2xl font-extrabold mb-1 tracking-tight ${currentStyle.titleColor}`}>{program.name}</h3>
                    <p className={`text-[15px] font-semibold leading-snug break-keep mb-4 ${currentStyle.descColor}`}>{program.title}</p>
                    <div className="space-y-2 mb-8">
                      <p className={`text-sm leading-relaxed line-clamp-4 break-keep ${currentStyle.descColor}`}>
                        {program.description}
                      </p>
                    </div>
                  </div>
                  <Link to={`${ROUTES.ARCHIVE}?tab=${program.category === 'Forum' ? 'forum' : program.category === 'Project' ? 'project' : program.category === 'Platform' ? 'shopping' : 'education'}`} className="block w-full">
                    <button className={`w-full py-4 rounded-xl border ${currentStyle.buttonClass} text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer`}>
                      프로그램 자세히 보기
                      <FileText className="w-4 h-4" />
                    </button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="pt-12 pb-24 md:py-24 px-6 md:px-12 lg:px-16 xl:px-20 bg-white">
        <div className="max-w-[1720px] mx-auto">
          <div className="mb-16 space-y-4">
            <h2 className="text-[15vw] md:text-[96px] text-[#002147] opacity-[0.10] md:opacity-10 md:pt-[20px] font-bold tracking-tight md:tracking-[-0.05em] whitespace-nowrap overflow-visible relative left-0 md:left-0 w-full md:w-auto text-center md:text-center mb-0">CALENDAR</h2>
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-[14px] md:text-lg text-slate-700 font-medium break-keep" style={{ lineHeight: '1.6', letterSpacing: '-0.02em' }}>다양한 공식 포럼과 교육 행사 일정을 확인하고 간편히 참가 신청해보세요.</p>
            </div>
          </div>
          <CalendarSection forceGridView={true} />
        </div>
      </section>

      {/* Board Section */}
<section className="py-24 px-6 md:px-12 lg:px-16 xl:px-20 md:pt-[150px] border-t border-slate-200 bg-white">
  <div className="max-w-[1720px] mx-auto space-y-12">
    <div className="flex flex-col items-center justify-center gap-6 text-center w-full">
      <div className="space-y-4 flex flex-col items-center w-full">
        <h2 className="text-[15vw] md:text-[96px] text-[#002147] opacity-[0.10] md:opacity-10 md:pt-[20px] font-bold tracking-tight md:tracking-[-0.05em] whitespace-nowrap overflow-visible relative left-0 w-full text-center self-center mb-0">
          BOARD
        </h2>
        <p className="text-[14px] md:text-lg text-slate-700 max-w-2xl md:max-w-none md:whitespace-nowrap font-medium text-center mx-auto break-keep" style={{ lineHeight: '1.6', letterSpacing: '-0.02em' }}>
          협회의 주요 소식을 한눈에 확인해 보세요.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6">
      {[
        {
          label: '공지사항',
          description: '협회 운영 소식과 주요 안내사항을 확인할 수 있습니다.',
          link: `${ROUTES.COMMUNITY}?tab=notice`,
          icon: Archive
        },
        {
          label: '인사이트',
          description: '시니어 비즈니스, AI, 창업, 마케팅 관련 콘텐츠를 제공합니다.',
          link: `${ROUTES.COMMUNITY}?tab=insight`,
          icon: BarChart3
        },
        {
          label: '갤러리',
          description: '포럼, 소모임, 교육 등 협회 활동 현장을 기록합니다.',
          link: `${ROUTES.COMMUNITY}?goto=gallery`,
          icon: Users
        }
      ].map((item, i) => {
        const Icon = item.icon;

        return (
          <Link
            key={i}
            to={item.link}
            className="group bg-white border border-slate-100 rounded-[16px] md:rounded-[24px] p-4 md:p-8 min-h-[120px] md:min-h-[240px] shadow-sm md:hover:shadow-xl transition-all flex flex-col items-center md:items-start text-center md:text-left justify-center md:justify-between"
          >
            <div className="flex flex-col items-center md:items-start w-full">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center mb-3 md:mb-8">
                <Icon className="w-5 h-5 md:w-6 h-6 text-slate-400 md:group-hover:text-[#0d34a6] transition-colors" />
              </div>

              <h3 className="text-sm sm:text-base md:text-2xl font-bold mb-0 md:mb-3" style={{ color: COLORS.navy }}>
                {item.label}
              </h3>

              <p className="hidden md:block text-sm text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="hidden md:inline-flex mt-8 items-center gap-2 pb-1 text-[#0d34a6] font-medium border-b border-[#0d34a6] md:border-transparent md:group-hover:border-[#0d34a6] transition-colors w-fit">
              바로가기
              <ChevronRight className="w-4 h-4 transition-transform md:group-hover:translate-x-1" />
            </div>
          </Link>
        );
      })}
    </div>
  </div>
</section>

      {/* Archiving Section */}
      <section className="py-24 px-6 md:px-12 lg:px-16 xl:px-20 border-t border-slate-200 bg-white">
        <div className="max-w-[1720px] mx-auto space-y-12">
          {/* Section Header styled exactly like BOARD */}
          <div className="flex flex-col items-center justify-center gap-6 text-center w-full">
            <div className="space-y-4 flex flex-col items-center w-full">
              <h2 className="text-[15vw] md:text-[96px] text-[#002147] opacity-[0.10] md:opacity-10 md:pt-[20px] font-bold tracking-tight md:tracking-[-0.05em] whitespace-nowrap overflow-visible relative left-0 w-full text-center self-center mb-0">
                ARCHIVE
              </h2>
              <p className="text-[14px] md:text-lg text-slate-700 max-w-2xl md:max-w-none font-medium text-center mx-auto break-keep" style={{ lineHeight: '1.6', letterSpacing: '-0.02em' }}>
                회원님의 경험을 협회의 자산으로 남깁니다.<br className="hidden md:block" />
                협회가 회원님의 경험과 전문성을 더 잘 이해하고, 필요할 때 회원 간 연결을 돕기 위한 간단한 설문입니다.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.a 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              href="https://docs.google.com/forms/d/e/1FAIpQLSfD6UlCs7viWi2XEdh66bMSQMENsLlON0p0fCQgpBg7d1_Dsw/viewform?pli=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-5 bg-[#002147] hover:bg-[#003366] text-white font-extrabold rounded-2xl transition-all text-base md:text-lg cursor-pointer shadow-md hover:shadow-lg active:scale-95 group"
            >
              <span>구글 폼 입력하러 가기</span>
              <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
          </div>
        </div>
      </section>
    </div>
  );
}
