'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { MessageSquareText, Star, Trash2 } from 'lucide-react';

type Affiliation = 'undergraduate' | 'graduate' | 'faculty' | 'staff';

type Review = {
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

const STORAGE_KEY = 'campus-bites-reviews';

const affiliationLabels: Record<Affiliation, string> = {
  undergraduate: '학부생',
  graduate: '대학원생',
  faculty: '교수',
  staff: '교직원',
};

const sampleReviews: Review[] = [
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

function loadLocalReviews() {
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export default function ReviewsSection({ placeNames }: { placeNames: string[] }) {
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [placeName, setPlaceName] = useState(placeNames[0] ?? '');
  const [affiliation, setAffiliation] = useState<Affiliation>('undergraduate');
  const [nickname, setNickname] = useState('');
  const [purpose, setPurpose] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Hydrate browser-only reviews after the server-rendered page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalReviews(loadLocalReviews());
  }, []);

  const reviews = useMemo(
    () => [...localReviews, ...sampleReviews],
    [localReviews],
  );

  const visibleReviews =
    filter === 'all'
      ? reviews
      : reviews.filter((review) => review.affiliation === filter);

  const averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  function saveLocalReviews(nextReviews: Review[]) {
    setLocalReviews(nextReviews);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextReviews));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNickname = nickname.trim();
    const trimmedPurpose = purpose.trim();
    const trimmedContent = content.trim();

    if (!placeName || !trimmedNickname || !trimmedPurpose || !trimmedContent) {
      setStatus('모든 입력 항목을 작성해주세요.');
      return;
    }

    const review: Review = {
      id: crypto.randomUUID(),
      placeName,
      affiliation,
      nickname: trimmedNickname,
      purpose: trimmedPurpose,
      rating,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
      isLocal: true,
    };

    saveLocalReviews([review, ...localReviews]);
    setNickname('');
    setPurpose('');
    setContent('');
    setRating(5);
    setStatus('후기가 등록되었습니다. 이 브라우저에 안전하게 저장했어요.');
  }

  function deleteReview(id: string) {
    saveLocalReviews(localReviews.filter((review) => review.id !== id));
    setStatus('작성한 후기를 삭제했습니다.');
  }

  return (
    <section id="reviews" className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-sm font-semibold text-teal-700 dark:text-teal-300">
            KENTECH COMMUNITY REVIEWS
          </p>
          <h2 className="text-4xl font-bold">
            구성원이 직접 남기는 방문 후기
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-[#5a544f] dark:text-[#c7c0b8]">
            학부생, 대학원생, 교수, 교직원의 실제 이용 맥락을 함께 보면 장소를
            고르기가 더 쉬워집니다.
          </p>
        </div>
        <div className="flex items-center gap-3 border-l-4 border-orange-500 pl-4">
          <Star className="h-7 w-7 fill-orange-500 text-orange-500" />
          <div>
            <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
            <p className="text-sm text-[#5a544f] dark:text-[#c7c0b8]">
              공개된 후기 {reviews.length}개
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-lg border border-black/10 bg-white/60 p-6 shadow-[0_20px_45px_rgba(55,35,15,0.12)] dark:border-white/10 dark:bg-white/5"
        >
          <div className="mb-5 flex items-center gap-3">
            <MessageSquareText className="h-5 w-5 text-teal-700 dark:text-teal-300" />
            <h3 className="text-2xl font-semibold">후기 작성</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewField label="장소">
              <select
                value={placeName}
                onChange={(event) => setPlaceName(event.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-[#20242c]"
              >
                {placeNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </ReviewField>

            <ReviewField label="KENTECH 소속">
              <select
                value={affiliation}
                onChange={(event) =>
                  setAffiliation(event.target.value as Affiliation)
                }
                className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-[#20242c]"
              >
                {Object.entries(affiliationLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </ReviewField>

            <ReviewField label="닉네임">
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={18}
                placeholder="예: 연구실미식가"
                className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-3 placeholder:text-black/35 dark:border-white/10 dark:bg-[#20242c] dark:placeholder:text-white/35"
              />
            </ReviewField>

            <ReviewField label="방문 목적">
              <input
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                maxLength={24}
                placeholder="예: 연구실 회식"
                className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-3 placeholder:text-black/35 dark:border-white/10 dark:bg-[#20242c] dark:placeholder:text-white/35"
              />
            </ReviewField>
          </div>

          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium">별점</legend>
            <div
              className="flex gap-1"
              role="radiogroup"
              aria-label={`별점, 현재 ${rating}점 선택됨`}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  onClick={() => setRating(value)}
                  className="p-1"
                  aria-label={`${value}점`}
                >
                  <Star
                    className={`h-7 w-7 ${
                      value <= rating
                        ? 'fill-orange-500 text-orange-500'
                        : 'text-black/20 dark:text-white/25'
                    }`}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <ReviewField label="후기">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={240}
              rows={5}
              placeholder="가격, 분위기, 모임 적합성처럼 다른 구성원에게 도움이 될 내용을 적어주세요."
              className="w-full resize-none rounded-lg border border-black/10 bg-white/80 px-3 py-3 leading-6 placeholder:text-black/35 dark:border-white/10 dark:bg-[#20242c] dark:placeholder:text-white/35"
            />
          </ReviewField>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-[#5a544f] dark:text-[#c7c0b8]">
              데모 버전에서는 현재 브라우저에만 저장됩니다.
            </p>
            <button
              type="submit"
              className="rounded-lg bg-black px-5 py-3 font-medium text-white dark:bg-white dark:text-black"
            >
              후기 등록
            </button>
          </div>

          <p className="mt-3 min-h-5 text-sm font-medium text-teal-800 dark:text-teal-300">
            {status}
          </p>
        </form>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-2xl font-semibold">최근 후기</h3>
            <label className="flex items-center gap-2 text-sm">
              <span>소속 필터</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-lg border border-black/10 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-[#20242c]"
              >
                <option value="all">전체</option>
                {Object.entries(affiliationLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3">
            {visibleReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-lg border border-black/10 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h4 className="text-xl font-semibold">{review.placeName}</h4>
                      <span className="rounded border border-teal-700/25 bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-200">
                        {affiliationLabels[review.affiliation]}
                      </span>
                    </div>
                    <p className="text-sm text-[#5a544f] dark:text-[#c7c0b8]">
                      {review.nickname} · {review.purpose} ·{' '}
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  {review.isLocal && (
                    <button
                      type="button"
                      onClick={() => deleteReview(review.id)}
                      className="p-2 text-black/50 hover:text-red-700 dark:text-white/50 dark:hover:text-red-300"
                      aria-label={`${review.placeName} 후기 삭제`}
                      title="후기 삭제"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="mt-3 flex gap-0.5" aria-label={`${review.rating}점`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-4 w-4 ${
                        value <= review.rating
                          ? 'fill-orange-500 text-orange-500'
                          : 'text-black/15 dark:text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 leading-7 text-[#393633] dark:text-[#ddd6ce]">
                  {review.content}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
