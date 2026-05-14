'use client';

import { useEffect, useState } from 'react';
import placesData from '@/data/places.json';
import type {
  Budget,
  Distance,
  Group,
  Mood,
  Place,
  PlaceType,
} from '@/types/place';

type Filters = {
  placeType: PlaceType;
  budget: Budget;
  distance: Distance;
  mood: Mood;
  group: Group;
};

const defaultFilters: Filters = {
  placeType: 'food',
  budget: 'low',
  distance: 'near',
  mood: 'quick',
  group: 'solo',
};

const places = placesData as Place[];
const foodCount = places.filter((place) => place.placeType === 'food').length;
const cafeCount = places.filter((place) => place.placeType === 'cafe').length;
const drinkCount = places.filter((place) => place.placeType === 'drink').length;
const totalCount = places.length;

function createMapLinks(place: Place) {
  const query = encodeURIComponent(`${place.name} ${place.address}`);

  return {
    naver: `https://map.naver.com/p/search/${query}`,
    google: `https://www.google.com/maps/search/?api=1&query=${query}`,
  };
}

function scorePlace(place: Place, filters: Filters) {
  let score = 0;

  if (place.placeType === filters.placeType) score += 4;
  if (place.budget === filters.budget) score += 3;
  if (place.distance === filters.distance) score += 3;
  if (place.mood === filters.mood) score += 2;
  if (place.group === filters.group) score += 2;

  if (filters.placeType === 'cafe' && place.placeType === 'food') score -= 2;
  if (filters.placeType === 'drink' && place.placeType === 'cafe') score -= 1;
  if (filters.group === 'team' && place.group === 'friend') score += 1;
  if (filters.distance === 'near' && place.distance === 'medium') score += 1;
  if (filters.budget === 'mid' && place.budget === 'low') score += 1;

  if (filters.placeType === 'cafe') {
    if (place.tags.includes('공부하기 좋음')) score += 5;
    if (place.tags.includes('혼자 가기 좋음')) score += 3;
    if (place.group === 'solo') score += 2;
    if (place.mood === 'cozy') score += 2;
    if (place.tags.includes('대화하기 좋음')) score += 1;
    if (place.tags.includes('감각적인 공간')) score += 1;
  }

  return score;
}

function getSummary(filters: Filters) {
  const placeTypeMap = {
    food: '밥',
    cafe: '카페',
    drink: '술',
  };
  const budgetMap = {
    low: '학생 예산',
    mid: '적당한 가격대',
    high: '조금 여유 있는 선택',
  };
  const distanceMap = {
    near: '가까운 거리',
    medium: '적당한 이동',
    far: '조금 멀어도 되는 선택',
  };
  const moodMap = {
    quick: '빠른 식사',
    cozy: '편하게 머무는 분위기',
    trendy: '요즘 인기 있는 곳',
  };
  if (filters.placeType === 'cafe') {
    return {
      title: 'KENTECH 주변 공부하기 좋은 카페 추천',
      caption: `${budgetMap[filters.budget]}, ${distanceMap[filters.distance]}, ${filters.group === 'solo' ? '혼자 집중하기' : '함께 머물기'} 상황을 함께 반영했어요.`,
    };
  }

  return {
    title: `KENTECH 주변 ${placeTypeMap[filters.placeType]} ${moodMap[filters.mood]} 추천`,
    caption: `${budgetMap[filters.budget]}, ${distanceMap[filters.distance]}, ${filters.group === 'solo' ? '혼자' : filters.group === 'friend' ? '친구와 함께' : '모임'} 상황을 함께 반영했어요.`,
  };
}

export default function Home() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const results = [...places]
    .map((place) => ({ ...place, score: scorePlace(place, filters) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const summary = getSummary(filters);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_25%),linear-gradient(135deg,#f4efe7_0%,#f9b572_100%)] px-4 py-6 text-[#141414] transition-colors dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_20%),linear-gradient(135deg,#101114_0%,#25324a_100%)] dark:text-[#f6f2ec]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-full border border-black/10 bg-white/60 px-6 py-5 shadow-[0_24px_60px_rgba(55,35,15,0.16)] backdrop-blur md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-white/5">
          <a href="#hero" className="text-lg font-bold tracking-wide">
            Campus Bites AI
          </a>
          <nav className="flex flex-wrap gap-5 text-sm text-[#5a544f] dark:text-[#c7c0b8]">
            <a href="#problem">Problem</a>
            <a href="#features">Features</a>
            <a href="#recommend">Recommend</a>
            <a href="#coverage">Data</a>
          </nav>
        </header>

        <section
          id="hero"
          className="grid gap-6 py-4 md:grid-cols-[1.2fr_0.9fr] md:items-center"
        >
          <div>
            <p className="mb-4 text-sm font-semibold tracking-[0.18em] text-teal-700 dark:text-teal-300">
              AI FOOD DISCOVERY FOR STUDENTS
            </p>
            <h1 className="text-5xl font-bold leading-[0.92] tracking-[-0.05em] md:text-7xl">
              오늘 수업 끝나고
              <br />
              밥 먹을지 카페 갈지
              <br />
              AI가 바로 골라줘요
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5a544f] dark:text-[#c7c0b8]">
              Campus Bites AI는 대학생의 예산, 이동 거리, 혼밥 여부, 수업 사이
              빈 시간까지 반영해서 지금 가기 좋은 식당과 카페를 추천하는
              서비스예요.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#recommend"
                className="rounded-full bg-black px-6 py-3 font-medium text-[#f4efe7] dark:bg-[#f4efe7] dark:text-[#101114]"
              >
                지금 추천받기
              </a>
              <button
                type="button"
                onClick={() => setDark((current) => !current)}
                className="rounded-full border border-black/10 px-6 py-3 dark:border-white/10"
              >
                무드 바꾸기
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                'KENTECH 생활권 기준',
                'DiningCode 실제 후보 확장',
                '학생 상황형 추천 MVP',
              ].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-black/10 bg-white/20 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white/60 p-6 shadow-[0_24px_60px_rgba(55,35,15,0.16)] backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="mb-6 flex items-center gap-3 text-sm text-[#5a544f] dark:text-[#c7c0b8]">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_0_8px_rgba(255,107,44,0.12)]" />
              <span>student lunch decision engine</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Target', '대학생 캠퍼스 생활'],
                ['Core Input', '예산, 거리, 분위기'],
                ['Recommendation', 'AI 맞춤 장소 3곳'],
                ['Moment', '점심, 공강, 카페, 저녁약속'],
              ].map(([label, value]) => (
                <article
                  key={label}
                  className="rounded-3xl border border-black/10 bg-white/20 p-5 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="mb-2 text-sm text-[#5a544f] dark:text-[#c7c0b8]">
                    {label}
                  </p>
                  <h2 className="text-2xl font-semibold leading-tight">{value}</h2>
                </article>
              ))}
            </div>
            <p className="mt-5 leading-7 text-[#5a544f] dark:text-[#c7c0b8]">
              현재 추천 후보는 KENTECH 인근 생활권으로 보이는 나주 혁신도시,
              빛가람동 식당, 카페, 저녁 장소 데이터를 바탕으로 구성되어 있어요.
              최근에는 DiningCode 검색 결과에서 보이는 실제 후보도 함께
              확장해서 반영했어요.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                '범범초밥',
                '소로 커피로스터스',
                '멘시루',
                '정씨네',
                '스테이케이션',
                '재간댁삼겹살',
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-black/10 bg-white/20 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="problem" className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-teal-700 dark:text-teal-300">
                PROBLEM
              </p>
              <h2 className="text-4xl font-bold tracking-[-0.04em]">
                대학생이 매일 겪는 식사와 카페 선택 스트레스
              </h2>
            </div>
          </div>

          <div className="grid gap-5 rounded-[1.75rem] border border-black/10 bg-white/60 p-6 shadow-[0_24px_60px_rgba(55,35,15,0.16)] backdrop-blur md:grid-cols-[0.9fr_1.1fr] dark:border-white/10 dark:bg-white/5">
            <div>
              <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-teal-700 dark:text-teal-300">
                REAL DATA SNAPSHOT
              </p>
              <h3 className="text-3xl font-semibold">
                KENTECH 생활권 실제 후보 {totalCount}곳 반영
              </h3>
              <p className="mt-4 leading-7 text-[#5a544f] dark:text-[#c7c0b8]">
                현재 화면에 반영된 데이터는 나주 혁신도시와 빛가람동에서 확인한
                실제 장소명 기준입니다. 밥 {foodCount}곳, 카페 {cafeCount}곳,
                술 {drinkCount}곳으로 구성돼 있어요.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                '세컨디포레스트 나주혁신점',
                '범범초밥',
                '지강한식당 나주점',
                '멘시루',
                '육온담',
                '이화원',
                '테네오',
                '도화',
                '월간맥주',
                '소로 커피로스터스',
                '빛가람미촌',
                '강남룸소주방',
                '프랭크커핀바 나주혁신도시점',
                '빛다르다',
              ].map((item) => (
                <span
                  key={item}
                  className="h-fit rounded-full border border-black/10 bg-white/20 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-teal-700 dark:text-teal-300">
              CORE FEATURES
            </p>
            <h2 className="text-4xl font-bold tracking-[-0.04em]">
              검색이 아니라 상황형 추천으로
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Feature 1', 'AI 질문 3개로 빠른 추천', '오늘 기분, 예산, 이동 가능 거리만 답하면 후보를 바로 압축합니다.'],
              ['Feature 2', '캠퍼스 중심 거리 계산', '학교 정문, 기숙사, 도서관 같은 출발 지점 기준으로 현실적인 동선을 제안합니다.'],
              ['Feature 3', '밥·카페·술 카테고리 추천', '공강 점심, 공부 카페, 가벼운 술자리처럼 학생 생활 흐름에 맞춰 고를 수 있습니다.'],
            ].map(([step, title, body]) => (
              <article
                key={title}
                className="rounded-3xl border border-black/10 bg-white/20 p-5 dark:border-white/10 dark:bg-white/5"
              >
                <p className="mb-3 text-sm font-semibold text-orange-600">{step}</p>
                <h3 className="text-2xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-[#5a544f] dark:text-[#c7c0b8]">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="recommend" className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-teal-700 dark:text-teal-300">
              TRY THE MVP
            </p>
            <h2 className="text-4xl font-bold tracking-[-0.04em]">
              지금 상황으로 바로 추천받기
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[2rem] border border-black/10 bg-white/60 p-6 shadow-[0_24px_60px_rgba(55,35,15,0.16)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="장소 유형"
                  value={filters.placeType}
                  onChange={(value) => updateFilter('placeType', value as PlaceType)}
                  options={[
                    ['food', '밥'],
                    ['cafe', '카페'],
                    ['drink', '술'],
                  ]}
                />
                <SelectField
                  label="예산"
                  value={filters.budget}
                  onChange={(value) => updateFilter('budget', value as Budget)}
                  options={[
                    ['low', '1만원 이하'],
                    ['mid', '1만원대'],
                    ['high', '2만원 이상'],
                  ]}
                />
                <SelectField
                  label="이동 거리"
                  value={filters.distance}
                  onChange={(value) => updateFilter('distance', value as Distance)}
                  options={[
                    ['near', '도보 5분'],
                    ['medium', '도보 10분'],
                    ['far', '도보 15분+'],
                  ]}
                />
                <SelectField
                  label="분위기"
                  value={filters.mood}
                  onChange={(value) => updateFilter('mood', value as Mood)}
                  options={[
                    ['quick', '빨리 먹기'],
                    ['cozy', '편하게 오래 있기'],
                    ['trendy', '요즘 인기 있는 곳'],
                  ]}
                />
                <SelectField
                  label="동행"
                  value={filters.group}
                  onChange={(value) => updateFilter('group', value as Group)}
                  options={[
                    ['solo', '혼밥'],
                    ['friend', '친구 1~2명'],
                    ['team', '팀플/모임'],
                  ]}
                />
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <p className="text-sm leading-6 text-[#5a544f] dark:text-[#c7c0b8]">
                  카페를 선택하면 기본적으로 공부하기 좋은 카페가 먼저 추천되도록 설정돼 있어요.
                </p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/10 bg-white/60 p-6 shadow-[0_24px_60px_rgba(55,35,15,0.16)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-teal-700 dark:text-teal-300">
                    TOP PICKS
                  </p>
                  <h3 className="text-3xl font-semibold">{summary.title}</h3>
                </div>
                <p className="max-w-xs text-sm leading-6 text-[#5a544f] dark:text-[#c7c0b8]">
                  {summary.caption}
                </p>
              </div>
              <div className="grid gap-4">
                {results.map((place, index) => {
                  const links = createMapLinks(place);

                  return (
                    <article
                      key={place.name}
                      className="rounded-3xl border border-black/10 bg-white/20 p-5 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="mb-2 text-sm text-[#5a544f] dark:text-[#c7c0b8]">
                            추천 {index + 1}
                          </p>
                          <h4 className="text-2xl font-semibold">{place.name}</h4>
                        </div>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black font-semibold text-[#f4efe7] dark:bg-[#f4efe7] dark:text-[#101114]">
                          {index + 1}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#5a544f] dark:text-[#c7c0b8]">
                        {place.menu} · {place.price} · {place.walk}
                      </p>
                      <p className="mt-3 font-medium">{place.address}</p>
                      <p className="mt-3 leading-7 text-[#5a544f] dark:text-[#c7c0b8]">
                        {place.reason}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {place.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-black/10 bg-white/20 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={links.naver}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-black/10 bg-white/20 px-4 py-2 text-sm dark:border-white/10 dark:bg-white/10"
                        >
                          네이버지도
                        </a>
                        <a
                          href={links.google}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-black/10 bg-white/20 px-4 py-2 text-sm dark:border-white/10 dark:bg-white/10"
                        >
                          구글맵
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </section>

        <section id="coverage" className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-teal-700 dark:text-teal-300">
              DATA COVERAGE
            </p>
            <h2 className="text-4xl font-bold tracking-[-0.04em]">
              지금 반영된 KENTECH 주변 데이터
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                String(totalCount),
                '초기 장소 후보',
                '빛가람동과 나주 혁신도시 생활권에서 확인한 밥집, 술집 느낌 장소, 카페 후보를 반영했어요.',
              ],
              [
                `${foodCount} / ${cafeCount} / ${drinkCount}`,
                '밥 · 카페 · 술',
                `밥 ${foodCount}곳, 카페 ${cafeCount}곳, 술 ${drinkCount}곳으로 나눠서 상황별 추천이 가능하게 구성했어요.`,
              ],
              [
                'MVP',
                '현재 단계',
                '공개적으로 확인 가능한 후보와 DiningCode 기반 추가 상호를 함께 반영한 데모 버전이라 이후 학교 커뮤니티 후기까지 붙이면 더 좋아집니다.',
              ],
            ].map(([count, title, body]) => (
              <article
                key={title}
                className="rounded-3xl border border-black/10 bg-white/60 p-6 shadow-[0_24px_60px_rgba(55,35,15,0.16)] backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                <p className="mb-3 text-3xl font-bold text-orange-600">{count}</p>
                <h3 className="text-2xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-[#5a544f] dark:text-[#c7c0b8]">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
