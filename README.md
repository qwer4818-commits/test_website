# Campus Bites AI

Campus Bites AI is a context-based recommendation web app that helps the whole KENTECH community — undergraduates, graduate students, faculty, and staff — quickly pick a restaurant or cafe around Naju Innovation City / Bitgaram-dong.

## Features

- Top-3 recommendations based on place type, budget, walking distance, mood, and party type
- Each result card shows the conditions that actually matched on an "이 조건이 맞아서 추천: …" line; an empty-state card appears when nothing matches
- 58 real candidate places with a recommendation reason, menu, price range, address, and map links
- Write reviews with KENTECH affiliation, visit purpose, and a star rating
- Each result card shows that place's review count plus an "이 장소 후기 쓰기" button that preselects the place in the form
- Browser `localStorage`-backed reviews that persist across reloads, filtering by affiliation, and deletion of your own reviews
- Dark mode and a responsive mobile/desktop UI

The recommendation is not an external generative-AI API call — it is an explainable, rule-based scoring method. Reviews, within the scope of this demo, are stored only in the current browser.

## Getting Started

Node.js 20 or later is recommended.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Verify

```bash
npm run lint
npm run build
```

## Tech Stack

- Next.js 16 App Router
- React 19, TypeScript
- Tailwind CSS
- Lucide Icons

## Deployment

- GitHub: https://github.com/qwer4818-commits/test_website
- Vercel: https://testlanding-theta.vercel.app

As of 2026-06-14, the latest recommendation and review features are deployed to production.
