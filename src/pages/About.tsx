import { motion } from 'motion/react';
import ciLogo from '../images/logo/ci.png';

export default function About() {
  const ciColors = [
    {
      name: 'Blue',
      hex: '#3F6B8D',
      meaning: '여가 (인정, 조화)',
    },
    {
      name: 'Green',
      hex: '#9CB8A8',
      meaning: '건강 (평화, 휴식)',
    },
    {
      name: 'Yellow',
      hex: '#E8C36A',
      meaning: '배움 (희망, 행복)',
    },
    {
      name: 'Orange',
      hex: '#D8863A',
      meaning: '일 (활기, 역동)',
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero / Title Section */}
      <section className="pt-4 pb-4 md:pt-[150px] md:pb-16 px-4 md:px-12 lg:px-16 xl:px-20 bg-white flex flex-col justify-center min-h-[120px] md:min-h-[340px]">
        <div className="max-w-[1200px] mx-auto w-full text-center space-y-1.5 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[10vw] md:text-[96px] text-[#002147] opacity-[0.10] font-bold tracking-tight md:tracking-[-0.05em] whitespace-nowrap overflow-visible relative left-0 w-full text-center mb-0 leading-none select-none">
              IDENTITY
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-1 md:space-y-4 text-slate-700 max-w-4xl mx-auto mt-1 md:mt-[18px]"
          >
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#002147] break-keep leading-tight">
              한국시니어교류협회 CI
            </h1>
            <p className="text-sm md:text-lg text-slate-500 font-semibold tracking-wider uppercase">
              K SENIOR INTERACTION SOCIETY
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. CI Image Section (흰 배경과 충분한 여백 및 반응형 - 카드 디자인 제거) */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-16 xl:px-20 bg-white border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-10">Signature Logo</span>
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-[1000px] flex justify-center items-center"
          >
            <img 
              src={ciLogo} 
              alt="한국시니어교류협회 CI" 
              className="w-full max-w-full h-auto max-h-[280px] object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* 3. CI Meaning Section */}
      <section className="py-24 px-6 md:px-12 lg:px-16 xl:px-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-[15vw] md:text-[96px] text-[#002147] opacity-[0.10] font-bold tracking-tight md:tracking-[-0.05em] whitespace-nowrap overflow-visible text-center mb-0 leading-none select-none">
              MEANING
            </h2>
          </div>

          <div className="space-y-6 md:space-y-8 text-slate-700 max-w-3xl mx-auto text-left md:text-center text-[14px] md:text-lg font-medium leading-relaxed break-keep" style={{ letterSpacing: '-0.02em', marginTop: '32px' }}>
            <p className="text-slate-800 font-semibold pl-4 border-l-4 md:border-l-0 border-[#3F6B8D] md:pl-0">
              ㅣ를 사람의 모습으로 형상화하고 S를 시니어가 걸어온 길에 비유하여 굽이굽이 인생길을 헤쳐서 우뚝 선 시니어의 모습을 담았습니다.
            </p>
            <p className="text-slate-600">
              기존의 정형화된 협회로고의 디자인에서 벗어나 손글씨 형태로 작업하였으며 레트로 위주의 색상을 사용하였습니다.
            </p>
            <p className="text-slate-600">
              각 이니셜의 색상은 한국 시니어 교류협회가 추구하는 여가/건강/배움/일을 의미합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Color Meaning Section */}
      <section className="py-24 px-6 md:px-12 lg:px-16 xl:px-20 bg-white border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-[15vw] md:text-[96px] text-[#002147] opacity-[0.10] font-bold tracking-tight md:tracking-[-0.05em] whitespace-nowrap overflow-visible text-center mb-0 leading-none select-none">
              COLORS
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto pt-4">
            {ciColors.map((color) => (
              <div key={color.name} className="flex flex-col items-center text-center space-y-4">
                <div 
                  className="w-16 h-16 rounded-full shadow-sm border border-slate-100 transition-transform duration-300 hover:scale-105" 
                  style={{ backgroundColor: color.hex }}
                />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#002147]">{color.name}</h4>
                  <p className="text-xs font-mono text-slate-400">{color.hex}</p>
                  <p className="text-[14px] font-medium text-slate-600 break-keep">{color.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
