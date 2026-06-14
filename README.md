# Campus Bites AI

Campus Bites AI는 학부생, 대학원생, 교수, 교직원을 포함한 KENTECH 전체 구성원이 나주혁신도시·빛가람동의 식당과 카페를 빠르게 고를 수 있도록 돕는 상황 기반 추천 웹 앱입니다.

## 주요 기능

- 장소 유형, 예산, 이동 거리, 분위기, 동행 조건 기반 상위 3곳 추천
- 추천 카드마다 "이 조건이 맞아서 추천: …" 줄로 일치 조건을 그대로 표시, 후보가 0개면 안내 카드
- 58개 실제 장소 후보와 추천 이유, 메뉴, 가격대, 주소, 지도 링크
- KENTECH 소속, 방문 목적, 별점과 후기 작성
- 추천 카드에서 그 장소의 후기 수 표시 + "이 장소 후기 쓰기"로 폼 자동 선택
- 브라우저 `localStorage` 기반 후기 유지, 소속별 필터, 작성 후기 삭제
- 다크 모드와 모바일·데스크톱 반응형 UI

현재 추천은 외부 생성형 AI API가 아닌 설명 가능한 규칙 기반 점수 방식입니다. 후기 역시 데모 범위에서는 현재 브라우저에만 저장됩니다.

## Getting Started

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인할 수 있습니다.

## 검증

```bash
npm run lint
npm run build
```

## 기술 구성

- Next.js 16 App Router
- React 19, TypeScript
- Tailwind CSS
- Lucide Icons

## 배포

- GitHub: https://github.com/qwer4818-commits/test_website
- Vercel: https://testlanding-theta.vercel.app

2026-06-14 기준 최신 추천·후기 기능이 production에 배포되어 있습니다.
