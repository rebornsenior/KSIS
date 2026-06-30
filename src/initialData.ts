import { CalendarEvent } from './types';

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    date: '2026-06-13',
    title: '유튜브, AI, 창업.. 하나로 연결되는 시간',
    description: '한국시니어교류협회 6월 초청강연',
    category: 'education',
    time: '08:00 - 10:00',
    location: '한국시니어교류협회 사무실 (마포구 신촌로 200-1, 황금바늘빌딩 2층, 이대역에서 100m)',
    rsvps: ['한국시니어교류협회 회원및 추천동반인,일반인'],
    link: 'https://cafe.naver.com/ksis1/632'
  },
  {
    id: '2',
    date: '2026-06-16',
    title: '바람이 전하는 노래- 우리세대의 기억과 위로',
    description: '6월 문화가 있는 날',
    category: 'other',
    time: '17:00 -',
    location: '메가박스 동대문 8관 (중구 장충단로 247굿모닝시티 9층, 동대문역사문화공원역(DDP) 14번 출구)',
    rsvps: ['한국시니어교류협회 회원, 추천동반인'],
    link: 'https://cafe.naver.com/ksis1/635'
  },
  {
    id: '3',
    date: '2026-06-24',
    title: '북촌 한 바퀴 | 북촌, 책이 사는 골목',
    description: '2026 한국시니어교류협회 로컬교류분과 첫 모임',
    category: 'other',
    time: '15:00 - 18:00',
    location: '글로벌 스타트업 허브 타워 3층',
    rsvps: ['한국시니어교류협회 회원'],
    link: 'https://cafe.naver.com/ksis1/634'
  },
  {
    id: '4',
    date: '2026-06-22',
    title: '2026년 혁신 소상공인 AI활용 지원사업 - 돈 되는 스토리는 따로 있다',
    description: 'AI 지원 도구를 활용하여 참가자가 스스로 사업계획을 정리하고 신청 서식을 작성할 수 있도록 돕는 교육 프로그램',
    category: 'education',
    time: '09:00 - 11:00, 14:00 - 16:00',
    location: '교류협회 사무실 (마포구 신촌로 200-1, 2층)',
    rsvps: ['프로그램 신청 희망자, 소상공인 대표, AI를 활용하여 사업 경쟁력을 강화하고자 하는 사업자, 한국시니어교류협회 회원'],
    link: 'https://cafe.naver.com/ksis1/645'
  },
  {
    id: '5',
    date: '2026-07-04',
    title: '제34회 비즈니스교류회 - 돈 되는 스토리는 따로 있다',
    description: '내가 살아온 시간을 다시 읽고, 그 안에서 나만의 콘텐츠와 브랜드 자산을 발견하는 시간',
    category: 'forum',
    time: '08:00 - 10:00',
    location: '교류협회 사무실 (마포구 신촌로 200-1, 2층)',
    rsvps: ['한국시니어교류협회 회원, 회원 추천 동반인, 일반 참가자'],
    link: 'https://cafe.naver.com/ksis1/641'
  }
];
