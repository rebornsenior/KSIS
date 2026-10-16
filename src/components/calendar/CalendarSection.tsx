import { registrationLink } from '../../registration-link';
import { useState, useEffect, FormEvent } from 'react';
import { CalendarEvent } from '../../types';
import { INITIAL_EVENTS } from '../../initialData';
import { Calendar as CalendarIcon, Clock, MapPin, Check, Plus, X, Users, Compass, ListTodo, ChevronDown, ChevronUp } from 'lucide-react';

interface CalendarSectionProps {
  forceGridView?: boolean;
}

export default function CalendarSection({ forceGridView = false }: CalendarSectionProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpCount, setRsvpCount] = useState('1');
  const [showRsvpSuccess, setShowRsvpSuccess] = useState(false);

  // States for Mobile Quick Optimization
  const [mobileView, setMobileView] = useState<'list' | 'grid'>(forceGridView ? 'grid' : 'list');

  useEffect(() => {
    if (forceGridView) {
      setMobileView('grid');
    }
  }, [forceGridView]);

  const [expandedMobileEventId, setExpandedMobileEventId] = useState<string | null>(null);
  const [mobileRsvpName, setMobileRsvpName] = useState('');
  const [mobileRsvpPhone, setMobileRsvpPhone] = useState('');
  const [mobileRsvpCount, setMobileRsvpCount] = useState('1');
  const [mobileSuccessId, setMobileSuccessId] = useState<string | null>(null);

  // Dynamic Year and Month State (Default to today's date)
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);

  // Dynamic calculations for start day offset and total days in month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const startDayOffset = new Date(currentYear, currentMonth - 1, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('kisis_events');
    if (saved) {
      try {
        const parsed: CalendarEvent[] = JSON.parse(saved);
        // Ensure all events in INITIAL_EVENTS are loaded with their latest information,
        // while preserving local registrations (RSVPs) saved in localStorage.
        const merged = INITIAL_EVENTS.map(initEvent => {
          const savedEvent = parsed.find(ev => ev.id === initEvent.id);
          if (savedEvent) {
            return {
              ...initEvent,
              // Merge local RSVPs with initial RSVPs, removing duplicates
              rsvps: Array.from(new Set([...initEvent.rsvps, ...savedEvent.rsvps]))
            };
          }
          return initEvent;
        });
        setEvents(merged);
        localStorage.setItem('kisis_events', JSON.stringify(merged));
      } catch (e) {
        setEvents(INITIAL_EVENTS);
      }
    } else {
      setEvents(INITIAL_EVENTS);
    }
  }, []);

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('kisis_events', JSON.stringify(newEvents));
    // Synced selected event if open
    if (selectedEvent) {
      const updated = newEvents.find((e) => e.id === selectedEvent.id);
      if (updated) setSelectedEvent(updated);
    }
  };

  const getEventForDay = (day: number) => {
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  const handleRsvpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !rsvpName.trim() || !rsvpPhone.trim()) return;

    const formattedRsvp = `${rsvpName.trim()} (${rsvpPhone.trim()}, ${rsvpCount}명)`;
    
    // Check if duplicate
    if (selectedEvent.rsvps.includes(formattedRsvp)) {
      alert('이미 신청을 완료해주셨습니다.');
      return;
    }

    const updatedEvents = events.map((ev) => {
      if (ev.id === selectedEvent.id) {
        return {
          ...ev,
          rsvps: [...ev.rsvps, formattedRsvp],
        };
      }
      return ev;
    });

    saveEvents(updatedEvents);
    setRsvpName('');
    setRsvpPhone('');
    setRsvpCount('1');
    setShowRsvpSuccess(true);
    setTimeout(() => setShowRsvpSuccess(false), 3000);
  };

  const handleMobileRsvpSubmit = (e: FormEvent, eventId: string) => {
    e.preventDefault();
    if (!mobileRsvpName.trim() || !mobileRsvpPhone.trim()) return;

    const targetEvent = events.find((ev) => ev.id === eventId);
    if (!targetEvent) return;

    const formattedRsvp = `${mobileRsvpName.trim()} (${mobileRsvpPhone.trim()}, ${mobileRsvpCount}명)`;

    if (targetEvent.rsvps.includes(formattedRsvp)) {
      alert('이미 해당 성명으로 신청을 완료해주셨습니다.');
      return;
    }

    const updatedEvents = events.map((ev) => {
      if (ev.id === eventId) {
        return {
          ...ev,
          rsvps: [...ev.rsvps, formattedRsvp],
        };
      }
      return ev;
    });

    saveEvents(updatedEvents);
    setMobileRsvpName('');
    setMobileRsvpPhone('');
    setMobileRsvpCount('1');
    setMobileSuccessId(eventId);
    
    // If we're updating current selectedEvent as well
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent({
        ...selectedEvent,
        rsvps: [...selectedEvent.rsvps, formattedRsvp]
      });
    }

    setTimeout(() => setMobileSuccessId(null), 3000);
  };

  return (
    <div className="w-full">
      {/* 📱 Mobile View Mode Switcher (Visible only on mobile screen) */}
      {!forceGridView && (
        <div className="flex md:hidden bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mobileView === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <ListTodo size={14} />
            일정 리스트형
          </button>
          <button
            type="button"
            onClick={() => setMobileView('grid')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mobileView === 'grid'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <CalendarIcon size={14} />
            달력형 일정표
          </button>
        </div>
      )}

      {/* 🖥️ Desktop / Tablet Layout: Always visible on md and up */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* 1. Calendar Grid Visual (8/12 of space on large screen) */}
        <div className="md:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
          {/* Centered header with prev/next buttons and select controls */}
          <div className="flex justify-center items-center mb-6 pb-4 border-b border-slate-100 relative">
            <div className="flex items-center gap-6">
              {/* Left triangle button */}
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-900 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center shadow-xs"
                title="이전 달"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M14 7l-5 5 5 5V7z" />
                </svg>
              </button>

              {/* Centered selector H3 */}
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 select-none tracking-tight">
                <span className="relative inline-block cursor-pointer bg-slate-50 hover:bg-blue-50 hover:text-blue-950 transition-all border border-slate-200/60 px-3 py-1.5 rounded-xl text-center">
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  >
                    {Array.from({ length: 15 }).map((_, i) => {
                      const yr = 2020 + i;
                      return <option key={yr} value={yr}>{yr}년</option>;
                    })}
                  </select>
                  {currentYear}년
                </span>
                <span className="relative inline-block cursor-pointer bg-slate-50 hover:bg-blue-50 hover:text-blue-950 transition-all border border-slate-200/60 px-3 py-1.5 rounded-xl text-center">
                  <select
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  >
                    {Array.from({ length: 12 }).map((_, i) => {
                      const m = 1 + i;
                      return <option key={m} value={m}>{m}월</option>;
                    })}
                  </select>
                  {currentMonth}월
                </span>
                <span className="text-slate-800">일정표</span>
              </h3>

              {/* Right triangle button */}
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-900 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center shadow-xs"
                title="다음 달"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M10 17l5-5-5-5v10z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 border-b border-slate-100 pb-2.5 mb-2">
            <div className="text-rose-500">일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div className="text-blue-900">토</div>
          </div>

          {/* Calendar days grid */}
          <div className="grid grid-cols-7 gap-2 min-h-[350px]">
            {/* Empty offset days leading to Monday */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/50 rounded-xl" />
            ))}

            {/* Valid Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayEvents = getEventForDay(dayNum);
              const today = new Date();
              const isToday = currentYear === today.getFullYear() && (currentMonth === today.getMonth() + 1) && dayNum === today.getDate();

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[70px] bg-white border rounded-xl p-1.5 flex flex-col justify-between transition-all select-none ${
                    dayEvents.length > 0
                      ? 'border-blue-900 bg-blue-50/10 cursor-pointer shadow-xs hover:bg-blue-50/20'
                      : 'border-slate-100 hover:bg-slate-50'
                  } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                  onClick={() => {
                    if (dayEvents.length > 0) {
                      setSelectedEvent(dayEvents[0]);
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-black rounded-lg w-5 h-5 flex items-center justify-center ${
                        (dayNum + startDayOffset - 1) % 7 === 0 // Sunday
                          ? 'text-rose-500'
                          : (dayNum + startDayOffset - 1) % 7 === 6 // Saturday
                          ? 'text-blue-800'
                          : 'text-slate-600'
                      } ${isToday ? 'bg-indigo-500 text-white font-extrabold' : ''}`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900" />
                    )}
                  </div>

                  {/* Event titles in grid day box */}
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 1).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-bold p-1 rounded-sm text-center leading-tight truncate ${
                          ev.category === 'forum'
                            ? 'bg-blue-900 text-white'
                            : ev.category === 'education'
                            ? 'bg-violet-600 text-white'
                            : ev.category === 'monetize'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {ev.title.slice(0, 7)}...
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Side Panel: Active events info & RSVP form (4/12 of space) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Quick Lists with Categories */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex-1">
            <h4 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-4.5 rounded-full bg-blue-900 inline-block" />
              해당 달의 전체 일정 ({currentMonth}월)
            </h4>

            <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
              {(() => {
                const currentMonthEvents = events.filter((ev) => {
                  const [yStr, mStr] = ev.date.split('-');
                  return Number(yStr) === currentYear && Number(mStr) === currentMonth;
                });

                if (currentMonthEvents.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400 font-bold text-xs">
                      이번 달에는 등록된 일정이 없습니다.
                    </div>
                  );
                }

                // Sort events by day
                const sortedEvents = [...currentMonthEvents].sort((a, b) => {
                  const dayA = Number(a.date.split('-')[2]);
                  const dayB = Number(b.date.split('-')[2]);
                  return dayA - dayB;
                });

                return sortedEvents.map((ev) => {
                  const [, , dayStr] = ev.date.split('-');
                  const isSelected = selectedEvent?.id === ev.id;

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-3 group ${
                        isSelected
                          ? 'bg-blue-900/5 border-blue-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md text-white bg-slate-400 flex items-center shrink-0">
                          {Number(dayStr)}일
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase shrink-0 ${
                          ev.category === 'forum'
                            ? 'bg-blue-900 text-white'
                            : ev.category === 'education'
                            ? 'bg-violet-600 text-white'
                            : ev.category === 'monetize'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}>
                          {ev.category === 'forum' ? '정기 포럼' : ev.category === 'education' ? '교육 특강' : ev.category === 'monetize' ? '수익 실무' : '친목 소모임'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden relative py-0.5">
                        <div className="flex whitespace-nowrap w-max group-hover-marquee">
                          <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm hover:text-blue-900 pr-12 transition-colors duration-200">
                            {ev.title}
                          </h5>
                          {/* Duplicate for seamless looping on hover */}
                          <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm hover:text-blue-900 pr-12 transition-colors duration-200 hidden group-hover:block">
                            {ev.title}
                          </h5>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Selected Event Details with RSVP form inside */}
          {selectedEvent ? (
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
              {/* Background design */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                  ACTIVE EVENT DETAILS
                </span>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white/40 hover:text-white p-1 rounded-md transition-colors cursor-pointer relative z-20"
                >
                  <X size={16} />
                </button>
              </div>

              <h4 className="text-lg font-black mt-2 leading-tight">
                {selectedEvent.title}
              </h4>
              <p className="text-white/70 text-xs font-semibold mt-3 leading-relaxed break-keep">
                {selectedEvent.description}
              </p>

              <div className="space-y-2 mt-4 pt-4 border-t border-white/10 text-xs text-white/80 font-semibold">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-emerald-400 flex-none" />
                  <span>{selectedEvent.date.split('-')[0]}년 {Number(selectedEvent.date.split('-')[1])}월 {Number(selectedEvent.date.split('-')[2])}일 • {selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-emerald-400 flex-none" />
                  <span>장소: {selectedEvent.location}</span>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <Users size={13} className="text-emerald-400 flex-none mt-0.5" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-white shrink-0">대상 :</span>
                    {selectedEvent.rsvps.length === 0 ? (
                      <span className="text-white/40 italic">첫 신청자를 기다리고 있습니다.</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {selectedEvent.rsvps.map((name, idx) => (
                          <span key={idx} className="bg-white/10 text-[10px] px-2 py-0.5 rounded-md font-bold text-white">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Compass size={13} className="text-emerald-400 flex-none" />
                  <span className="font-extrabold text-white shrink-0">신청 링크 :</span>
                  {registrationLink(selectedEvent) ? (
                    <a
                      href={registrationLink(selectedEvent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 hover:text-emerald-400 underline font-bold"
                    >
                      바로가기 ↗
                    </a>
                  ) : (
                    <span className="text-white/40 italic">준비 중</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex bg-slate-100/50 border border-dashed border-slate-300 rounded-3xl p-6 text-center flex-col items-center justify-center py-10 flex-1">
              <CalendarIcon size={32} className="text-slate-400 mb-2.5 animate-pulse" />
              <p className="text-slate-500 font-bold text-sm">일정을 맵핑하여 확인하기</p>
              <p className="text-slate-400 text-xs leading-relaxed mt-1 max-w-[200px]">
                좌측 달력에서 일정(푸른 테두리)을 선택하시면 상세 정보가 활성화됩니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 📱 Mobile Optimized Layout: Visible only on mobile screens */}
      <div className="block md:hidden">
        {mobileView === 'list' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 rounded-full bg-blue-900 inline-block" />
                다가오는 전체 일정 ({events.length}개)
              </h4>
              <span className="text-[10px] bg-blue-50 text-[#0d34a6] font-extrabold px-2.5 py-1 rounded-full">
                카드를 누르면 상세 정보/신청
              </span>
            </div>

            {events.map((ev) => {
              const [, mStr, dStr] = ev.date.split('-');
              const isExpanded = expandedMobileEventId === ev.id;
              const isSuccess = mobileSuccessId === ev.id;

              return (
                <div
                  key={ev.id}
                  className={`border transition-all rounded-2xl overflow-hidden text-left ${
                    isExpanded
                      ? 'border-blue-900 bg-white/50 shadow-md ring-1 ring-blue-900/10'
                      : 'border-slate-100 bg-white shadow-xs hover:border-slate-200'
                  }`}
                >
                  {/* Card Front Head */}
                  <div
                    onClick={() => setExpandedMobileEventId(isExpanded ? null : ev.id)}
                    className="p-4 flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md text-white bg-slate-900 flex items-center shrink-0">
                          {Number(mStr)}월 {Number(dStr)}일
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                          ev.category === 'forum'
                            ? 'bg-blue-900 text-white'
                            : ev.category === 'education'
                            ? 'bg-violet-600 text-white'
                            : ev.category === 'monetize'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}>
                          {ev.category === 'forum' ? '정기 포럼' : ev.category === 'education' ? '교육 특강' : ev.category === 'monetize' ? '수익 실무' : '친목 소모임'}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-slate-900 text-sm leading-snug pt-0.5">
                        {ev.title}
                      </h5>
                      <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1">
                        <Clock size={11} /> {ev.time} • {ev.location}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      {isExpanded ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
                    </div>
                  </div>

                  {/* Card Mobile Expanded Fields */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-1 border-t border-slate-100/80 bg-slate-50/50 space-y-4 animate-in fade-in duration-200">
                      {/* Description */}
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">상세 안내</span>
                        <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed break-keep">
                          {ev.description}
                        </p>
                      </div>

                      {/* Location Detail */}
                      <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <MapPin size={12} className="text-[#0d34a6]" />
                          <span>장소: {ev.location}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 font-semibold pl-4">
                          <span>기재된 정해진 장소로 정각 참여 바라며, 주차 및 대기 공지는 오픈 메신저로 개별 통보 드립니다.</span>
                        </div>
                      </div>

                      {/* Application Link */}
                      <div className="p-3 bg-white border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Compass size={12} className="text-[#0d34a6]" />
                          <span>신청 링크: </span>
                          {registrationLink(ev) ? (
                            <a
                              href={registrationLink(ev)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0d34a6] hover:underline font-extrabold"
                            >
                              바로가기 ↗
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">준비 중</span>
                          )}
                        </div>
                      </div>

                      {/* Attendees List */}
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                          <Users size={12} className="text-[#0d34a6]" />
                          <span>대상</span>
                        </div>
                        {ev.rsvps.length === 0 ? (
                          <p className="text-[11px] text-slate-400 font-bold mt-1.5 italic">이 첫 비즈니스 교류의 선도자가 되어 보세요.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ev.rsvps.map((name, idx2) => (
                              <span key={idx2} className="bg-slate-100 border border-slate-200/50 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-bold">
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-5 bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs">
            {/* Calendar Controller Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <button
                onClick={handlePrevMonth}
                className="p-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center"
              >
                이전 달
              </button>
              <span className="text-sm font-extrabold text-slate-900">
                {currentYear}년 {currentMonth}월 일년제
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center"
              >
                다음 달
              </button>
            </div>

            {/* Mobile Grid Layout - with tighter spacing */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1">
              <div className="text-rose-500">일</div>
              <div>월</div>
              <div>화</div>
              <div>수</div>
              <div>목</div>
              <div>금</div>
              <div className="text-blue-900">토</div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 min-h-[220px]">
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-mob-${i}`} className="bg-slate-50/20 rounded-md" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayEvents = getEventForDay(dayNum);
                const today = new Date();
                const isToday = currentYear === today.getFullYear() && (currentMonth === today.getMonth() + 1) && dayNum === today.getDate();

                return (
                  <div
                    key={`mob-day-${dayNum}`}
                    className={`min-h-[48px] bg-white border rounded-lg p-1 flex flex-col justify-between transition-all select-none ${
                      dayEvents.length > 0
                        ? 'border-blue-900 bg-blue-50/20 shadow-xs'
                        : 'border-slate-100'
                    } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-0' : ''}`}
                    onClick={() => {
                      if (dayEvents.length > 0) {
                        setSelectedEvent(dayEvents[0]);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span
                        className={`text-[10px] font-black rounded-md w-4 h-4 flex items-center justify-center ${
                          (dayNum + startDayOffset - 1) % 7 === 0 // Sunday
                            ? 'text-rose-500'
                            : (dayNum + startDayOffset - 1) % 7 === 6 // Saturday
                            ? 'text-blue-800'
                            : 'text-slate-600'
                        } ${isToday ? 'bg-indigo-500 text-white font-black' : ''}`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    <div className="w-full">
                      {dayEvents.slice(0, 1).map((ev) => {
                        const bgClassName = 
                          ev.category === 'forum'
                            ? 'bg-blue-900'
                            : ev.category === 'education'
                            ? 'bg-violet-600'
                            : ev.category === 'monetize'
                            ? 'bg-emerald-600'
                            : 'bg-amber-600';

                        return (
                          <div
                            key={ev.id}
                            className={`h-1.5 w-full rounded-sm ${bgClassName}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 선택된 날짜의 일정 상세 및 즉시 참가 신청 */}
            {selectedEvent ? (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-left animate-in fade-in duration-200">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md text-white bg-slate-950 shrink-0">
                        {Number(selectedEvent.date.split('-')[1])}월 {Number(selectedEvent.date.split('-')[2])}일 일자
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                        selectedEvent.category === 'forum'
                          ? 'bg-blue-900 text-white'
                          : selectedEvent.category === 'education'
                          ? 'bg-violet-600 text-white'
                          : selectedEvent.category === 'monetize'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {selectedEvent.category === 'forum' ? '정기 포럼' : selectedEvent.category === 'education' ? '교육 특강' : selectedEvent.category === 'monetize' ? '수익 실무' : '친목 소모임'}
                      </span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {selectedEvent.title}
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <p className="text-xs font-semibold text-slate-600 leading-relaxed break-keep">
                  {selectedEvent.description}
                </p>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Clock size={12} className="text-[#0d34a6]" />
                    <span>시간: {selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <MapPin size={12} className="text-[#0d34a6]" />
                    <span>장소: {selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Compass size={12} className="text-[#0d34a6]" />
                    <span>신청 링크: </span>
                    {registrationLink(selectedEvent) ? (
                      <a
                        href={registrationLink(selectedEvent)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0d34a6] hover:underline font-extrabold"
                      >
                        바로가기 ↗
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">준비 중</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[10.5px] text-slate-400 font-extrabold text-center leading-relaxed py-4 border-t border-slate-100">
                💡 달력에서 푸른 동그라미(혹은 테두리)가 있는 행사 날짜를 클릭하시면, 하단에 즉시 상세 일정 정보가 활성화됩니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
