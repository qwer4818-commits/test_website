export type Affiliation = 'undergraduate' | 'graduate' | 'faculty' | 'staff';

export type Review = {
  id: string;
  placeName: string;
  affiliation: Affiliation;
  nickname: string;
  purpose: string;
  rating: number;
  content: string;
  createdAt: string;
  isLocal: boolean;
};

export const STORAGE_KEY = 'campus-bites-reviews';

export const affiliationLabels: Record<Affiliation, string> = {
  undergraduate: '학부생',
  graduate: '대학원생',
  faculty: '교수',
  staff: '교직원',
};

export const sampleReviews: Review[] = [
  {
    id: 'sample-1',
    placeName: '소로 커피로스터스',
    affiliation: 'graduate',
    nickname: '연구실커피',
    purpose: '논문 작업',
    rating: 5,
    content: '좌석 간격이 편하고 오래 머물기 좋아서 집중해서 작업하기 괜찮았어요.',
    createdAt: '2026-06-10T12:00:00.000Z',
    isLocal: false,
  },
  {
    id: 'sample-2',
    placeName: '지강한식당 나주점',
    affiliation: 'staff',
    nickname: '점심탐험대',
    purpose: '부서 점심',
    rating: 4,
    content: '여러 명이 함께 식사하기 편했고 메뉴 선택지가 무난했습니다.',
    createdAt: '2026-06-08T03:30:00.000Z',
    isLocal: false,
  },
  {
    id: 'sample-3',
    placeName: '범범초밥',
    affiliation: 'undergraduate',
    nickname: '공강한끼',
    purpose: '친구와 점심',
    rating: 4,
    content: '런치 세트가 있어서 예산을 맞추기 좋았고 지도 링크로 찾기도 쉬웠어요.',
    createdAt: '2026-06-05T04:20:00.000Z',
    isLocal: false,
  },
];

export function loadLocalReviews(): Review[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return (JSON.parse(stored) as Review[]).map((review) => ({
      ...review,
      isLocal: true,
    }));
  } catch {
    return [];
  }
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}
