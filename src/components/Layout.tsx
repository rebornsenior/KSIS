import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { COLORS, ROUTES } from '../constants';
import symbolLogo from '../images/logo/symbol.png';
import typoLogo from '../images/logo/typo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'HOME', path: ROUTES.HOME },
    { name: 'ABOUT', path: ROUTES.ABOUT },
    { name: 'PROJECT', path: '/?goto=project', isHash: true },
    { name: 'CALENDAR', path: ROUTES.CALENDAR },
    { name: 'BOARD', path: ROUTES.COMMUNITY },
  ];

  const isLinkActive = (item: typeof navItems[0]) => {
    if (item.isHash) {
      return location.pathname === ROUTES.HOME && location.search.includes('goto=project');
    }
    if (item.path === ROUTES.HOME) {
      return location.pathname === ROUTES.HOME && !location.search.includes('goto=project');
    }
    return location.pathname === item.path;
  };

  const handleLinkClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.isHash) {
      if (location.pathname === ROUTES.HOME) {
        e.preventDefault();
        const element = document.getElementById('project-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', '/#/?goto=project');
        }
      }
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-6 md:px-12 lg:px-16 xl:px-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img src={symbolLogo} alt="KSIS" className="h-10 w-auto object-contain" />
          <img 
            src={typoLogo} 
            alt="한국시니어교류협회" 
            className="h-10 w-auto object-contain" 
          />
        </Link>
 
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={(e) => handleLinkClick(item, e)}
              className={`text-sm font-medium transition-colors hover:opacity-100 ${
                isLinkActive(item) ? 'opacity-100' : 'opacity-60'
              }`}
              style={{ color: COLORS.navy }}
            >
              {item.name}
              {isLinkActive(item) && (
                <motion.div
                  layoutId="underline"
                  className="h-0.5 mt-0.5"
                  style={{ backgroundColor: COLORS.gold }}
                />
              )}
            </Link>
          ))}
          <a 
            href="https://cafe.naver.com/ksis1"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-full text-xs font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: COLORS.navy }}
          >
            네이버 카페
          </a>
        </div>
 
        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X color={COLORS.navy} /> : <Menu color={COLORS.navy} />}
        </button>
      </div>
 
      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-t p-6 flex flex-col gap-4 md:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={(e) => {
                setIsOpen(false);
                handleLinkClick(item, e);
              }}
              className="text-lg font-medium py-2 border-b border-slate-100"
              style={{ color: COLORS.navy }}
            >
              {item.name}
            </Link>
          ))}
          <a 
            href="https://cafe.naver.com/ksis1"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full py-4 rounded-xl text-center font-bold text-white mt-4 block"
            style={{ backgroundColor: COLORS.navy }}
          >
            네이버 카페 바로가기
          </a>
        </motion.div>
      )}
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="py-16 px-6 md:px-12 lg:px-16 xl:px-20" style={{ backgroundColor: COLORS.navy, color: COLORS.beige }}>
      <div className="max-w-[1720px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <img src={symbolLogo} alt="KSIS" className="h-8 w-auto object-contain" />
            <span className="font-bold text-lg">한국시니어교류협회</span>
          </div>
          <p className="hidden md:block text-sm opacity-60 leading-relaxed max-w-sm">
            한국시니어교류협회는 은퇴 후에도 빛나는 시니어 전문가들의 지혜와 역량을 연결하여, 지속 가능한 내일을 만들어갑니다.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest opacity-40">Contact</h4>
          <ul className="space-y-4 text-sm opacity-70">
            <li>서울특별시 서울시 마포구 신촌로 200-1</li>
            <li>대표번호: 02-363-8777</li>
            <li>이메일: contact@ksis1.org</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest opacity-40">Quick Links</h4>
          <ul className="space-y-4 text-sm opacity-70">
            <li><Link to={ROUTES.HOME} className="hover:opacity-100 transition-opacity">홈</Link></li>
            <li><Link to={ROUTES.ABOUT} className="hover:opacity-100 transition-opacity">소개</Link></li>
            <li><Link to={ROUTES.ARCHIVE} className="hover:opacity-100 transition-opacity">프로그램</Link></li>
            <li><Link to={ROUTES.CALENDAR} className="hover:opacity-100 transition-opacity">일정</Link></li>
            <li><Link to={ROUTES.COMMUNITY} className="hover:opacity-100 transition-opacity">네이버 카페</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-[1720px] mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-40">
        <p>© 2026 사단법인 한국시니어교류협회. All Rights Reserved.</p>
        <div className="flex gap-6">
          <span>개인정보처리방침</span>
          <span>이용약관</span>
        </div>
      </div>
    </footer>
  );
};

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: COLORS.offWhite }}>
      <Navbar />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
