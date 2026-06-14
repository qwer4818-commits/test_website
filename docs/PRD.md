# Campus Bites AI — PRD

> A context-based restaurant / cafe / bar recommendation web app for the KENTECH community
> Introduction to AI Programming, Assignment 4

---

## 1. Product Overview

Campus Bites AI helps with a small, everyday decision for people at KENTECH. Once today's classes or work are done, where do you actually go? You pick the place type (food, cafe, or drink) and the app picks which specific place. There's no keyword searching or scrolling through reviews. You set five things about your situation (place type, budget, walking distance, mood, and who's coming with you), and three matching places show up right away.

It looks like "AI chooses for you," but there is no LLM behind it. The ranking is a plain scoring function, so every result can be traced back to the rules, and it runs off static data with no network call. The recommendation panel says this outright: "외부 생성형 AI가 아닌, 선택 조건과 장소 속성을 비교하는 설명 가능한 규칙 기반 추천입니다" (a rule-based recommendation that compares your conditions against each place's attributes, not an external generative AI).

There is also a reviews section. Members leave a star rating and a short note, which adds real usage context on top of the static list. For this demo the reviews stay in the browser's `localStorage`.

The dataset is 58 real places from the Naju Innovation City / Bitgaram-dong area: 27 food, 17 cafe, 14 drink.

## 2. Target Users

The target is the whole KENTECH community, not just students. (An earlier draft said "대학생 / STUDENTS" and we widened it.)

- Undergraduates: a quick, cheap meal in a gap between classes, or a casual outing with friends.
- Graduate students: a cafe near the lab to work for a couple of hours, or somewhere to sit alone before a deadline.
- Faculty: a restaurant that works for a meeting or for hosting a guest.
- Staff: department lunches and team dinners.

These four map onto the affiliation options in the review form (`undergraduate / graduate / faculty / staff`) and onto the affiliation filter.

## 3. Project Goals

1. **Cut down the choosing.** No searching. Pick a few conditions, get three places, done in a few clicks.
2. **Stay explainable.** The result should not be a black box. You should be able to trace which matches produced the score.
3. **Stay realistic to the area.** Use actual Bitgaram-dong / Naju Innovation City places rather than invented ones.
4. **Let members contribute.** Recommendations go one way, but reviews feed back into the data.

Out of scope this round: live hours or crowd levels, a server database, login, real distance computation, and any LLM call.

## 4. Core User Scenario

Jimin, a graduate student, finishes a seminar at 4pm. She has two hours before a dinner appointment and wants to sit alone and finish some code.

1. She opens the page and taps "지금 추천받기" (get recommendations now) at the top.
2. She picks place type **카페 (cafe)**, budget **under ₩10,000**, distance **5-min walk**, mood **stay a while**, party **solo**.
3. Three places appear on the right. Because she chose cafe, places tagged "공부하기 좋음" (good for studying) rise to the top. The #1 for this combo is 헤이키커피 나주혁신점.
4. She reads each card's menu, price range, address, and reason, then checks the location through the Naver Map / Google Maps links.
5. After visiting, she opens the reviews section, sets affiliation to "대학원생" (graduate student), and leaves a star rating with a one-line note. Next time she returns in the same browser, that review is still there.

## 5. Feature List

Priority is split into Must (no product without it), Should (needed for completeness), and Nice (good to have).

### Must
- **Condition-based Top-3.** Five selects: place type, budget, distance, mood, party. Pick them and the three highest-scoring places render immediately. See `scorePlace` and `results` in `src/app/page.tsx`.
- **Single-type guarantee.** Only the chosen type comes back. If you pick food, cafes and bars can't sneak in, because `results` filters on `placeType === filters.placeType` before doing anything else.
- **Empty state.** If that filter leaves nothing, the panel shows a card reading "선택한 조건에 맞는 장소가 없어요. 조건을 바꿔보세요." With one or two matches it just shows those, it does not pad up to three. (The current data never actually hits zero; this is defensive.)
- **Dynamic reasons.** Each card keeps its fixed `reason`, and adds a line under it: "이 조건이 맞아서 추천: …". As `scorePlace` scores a place it also collects which conditions matched (budget match, distance fits, good for solo, good for studying, and so on). This is the concrete support for goal G2.
- **Real place data.** 58 entries, each with menu, price, address, reason, and tags (`src/data/places.json`).
- **Map links.** Every card links out to Naver Map and Google Maps (`createMapLinks`).

### Should
- **Community reviews** with a 1–5 star rating, affiliation, nickname, visit purpose, and body. Saved to `localStorage` so they survive a reload (`src/components/reviews-section.tsx`).
- **Affiliation filter and average rating.** Filter by all / undergraduate / graduate / faculty / staff; the average rating and review count sit at the top.
- **Delete your own review.** The delete button only shows on reviews saved locally, the ones you wrote.
- **Review-to-card link.** Each result card shows that place's review count ("후기 N개"), and "이 장소 후기 쓰기" scrolls down to the reviews and pre-selects that place in the form. The review state sits in `Home` (`localReviews`), `ReviewsSection` is driven by props, and the shared types and data live in `src/lib/reviews.ts`.
- **Dark mode** on `next-themes`. The "무드 바꾸기" button flips light and dark.

### Nice
- **Cafe weighting.** Choosing cafe adds points for tags like "공부하기 좋음" and "혼자 가기 좋음", so the study cafe most students want comes up first.
- **Sample reviews.** Three are preloaded so the section isn't empty on a first visit.
- **Responsive layout** for mobile and desktop.

> Note: favorites/bookmarks, login, and server storage are not Must or Should this round. They are unimplemented and out of scope.

## 6. Page Structure

One page (a single route, `/`, with an SPA feel), stitched together by anchor navigation. Top nav: Problem · Features · Recommend · Reviews · Data.

| Anchor | Section | Contents |
|--------|---------|----------|
| `#hero` | Hero | One-line value proposition, "지금 추천받기" CTA, "무드 바꾸기" (dark toggle), target/input/recommendation summary cards |
| `#problem` | Problem | The daily fatigue of picking a place, plus a snapshot of 58 real candidates (food/cafe/drink counts shown dynamically) |
| `#features` | Core features | Fast condition-based recommendation, diverse member situations, community reviews. Three cards |
| `#recommend` | Recommendation MVP | Five selects plus the "rule-based recommendation" notice on the left; Top-3 result cards on the right (reason line, map links, review count, "write review" button). Guidance card if zero candidates |
| `#reviews` | Reviews | Submission form (affiliation, nickname, purpose, rating, body) plus affiliation filter plus review list |
| `#coverage` | Data status | Total count, food/cafe/drink split, current stage (MVP) note |

The counts (`totalCount`, `foodCount`, `cafeCount`, `drinkCount`) are not hardcoded. They are counted from `places.json` at render time, so adding data updates the on-screen numbers by itself.

## 7. Technical Requirements

- **Framework:** Next.js 16 (App Router, Turbopack), React 19
- **Language:** TypeScript 5 (strict)
- **Styling:** Tailwind CSS 3.4, dark mode via the `class` strategy
- **Theme:** `next-themes` (`ThemeProvider attribute="class" defaultTheme="system" enableSystem`)
- **Icons:** lucide-react
- **State/data:** client `useState` only. Recommendations import static JSON. Reviews use `localStorage`. No server, DB, or external API.
- **Data model (`src/types/place.ts`):** `Place = { name, placeType, address, budget, distance, mood, group, menu, walk, price, tags[], reason }`. Enums: `placeType: food|cafe|drink`, `budget: low|mid|high`, `distance: near|medium|far`, `mood: quick|cozy|trendy`, `group: solo|friend|team`.
- **Review model (`src/lib/reviews.ts`):** `Review = { id, placeName, affiliation, nickname, purpose, rating, content, createdAt, isLocal }`, `affiliation: undergraduate|graduate|faculty|staff`, storage key `campus-bites-reviews`, id from `crypto.randomUUID()`. The types, sample data, and `loadLocalReviews`/`formatDate` live in this module and are shared by `page.tsx` and `reviews-section.tsx`. The review state (`localReviews`) is owned by `Home`, and `ReviewsSection` is controlled via props.
- **Scripts:** `dev = next dev --turbopack`, `build = next build`, `lint = eslint .`
- **Deployment:** push to GitHub main, Vercel auto-deploys.

### Recommendation scoring rules (exactly as in code)

`scorePlace(place, filters)` adds points per match. Weights:

| Condition | Points |
|-----------|--------|
| Place type matches | +4 |
| Budget matches | +3 |
| Distance matches | +3 |
| Mood matches | +2 |
| Party matches | +2 |
| (nudge) party = team but place is friend | +1 |
| (nudge) distance = near but place is medium | +1 |
| (nudge) budget = mid but place is low | +1 |

On top of that, there are bonuses applied **only when "cafe" is the selected place type**.

| Cafe-only condition | Points |
|---------------------|--------|
| Tag "공부하기 좋음" (good for studying) | +5 |
| Tag "혼자 가기 좋음" (good to go alone) | +3 |
| Party is solo | +2 |
| Mood is cozy | +2 |
| Tag "대화하기 좋음" (good for talking) | +1 |
| Tag "감각적인 공간" (stylish space) | +1 |

`scorePlace` returns `{ score, reasons }`, not just a number. `reasons` collects a short phrase each time points are added (budget match · walking distance fits · good for solo · good for studying, and so on), and the card's "이 조건이 맞아서 추천:" line joins them with `·`. The data file is not touched; this is display and computation only.

`results` runs in four steps. Filter to the chosen type, attach `{ score, reasons }` to each remaining place, sort by score descending, then take the top three. The place-type weight (+4) is really only a tiebreaker now, so a type match is not pushed into `reasons` (the filter already guarantees it). The thing that actually keeps types apart is that filter, not the score.

## 7-A. Acceptance Criteria

To call the added or improved features "done," each of these should hold.

- **Single type:** for any combination, all three results are the selected type. Passed across five simulated combos.
- **Empty state:** if the selected type has zero candidates, a guidance card appears and the card grid is not rendered. With one or two, only that many show.
- **Recommendation reasons:** every result card shows the "이 조건이 맞아서 추천: …" line below the fixed `place.reason`, and that text matches the conditions that actually contributed to the score. If nothing matched, the line is hidden.
- **Review count:** a card's "후기 N개" equals the number of (sample + localStorage) reviews whose place name matches.
- **Review link:** pressing "이 장소 후기 쓰기" scrolls to `#reviews` and switches the form's place select to that place. It works even when the same place is pressed twice (re-triggered via a nonce).
- **No regression:** after all of the above, `npm run lint` and `npm run build` still pass.

## 8. Design Requirements

- Warm cream and orange gradient background, rounded cards and pill buttons, backdrop blur for a soft tone.
- Dark mode keeps the same structure but shifts to a dark navy palette. Colors are handled with Tailwind `dark:` variants.
- Accent colors are teal for labels and orange for numbers and stars. Stars are shown filled or empty.
- Korean body text dominates and only the section labels are uppercase English (for example `CORE FEATURES`). The labels are kept short so the two tones don't clash.
- Keyboard and screen-reader support: the rating input is a `role="radiogroup"`, each star has `aria-checked` and `aria-label`, and the delete button has an `aria-label` too.
- A responsive grid that drops to one column on mobile and multiple columns on desktop.

## 9. Milestones

Dates come from the actual commit history. The assignment is due 2026-06-14.

- **M1, Setup (2026-05-11):** create the Next.js 16 project from the EasyNext template, first commit (`Initial commit from Create Next App`).
- **M2, Landing + recommendation MVP (2026-05-14):** hero through data sections, five selects, first `scorePlace`, initial place data (`Build Campus Bites AI landing page`).
- **M3, Data expansion (2026-06-14):** grow the Bitgaram-dong / Naju Innovation City candidates to 58 and classify them into food/cafe/drink.
- **M4, Reviews feature (2026-06-14):** add `reviews-section.tsx` with localStorage, affiliation filter, delete, and average rating.
- **M5, Fix round A1–C4 (2026-06-14):** split out the type filter (A2), unify dark mode (B1), tidy the scoring rules (B2), add the rule-based notice (B3), clean up README/metadata/eslint/tsconfig (C-series), and add the empty-state, dynamic-reason, and review-link features.
- **M6, Verify and deploy (2026-06-14):** confirm `npm run lint` and `npm run build` pass, push main, deploy to Vercel.

### Deployment check (2026-06-14)

- Vercel production was redeployed at commit `d73cbe6`.
- Deploy status was `READY`/`PROMOTED`, and the stable URL is https://testlanding-theta.vercel.app.
- The public URL responded HTTP 200 with no redirects, and the served HTML contained "이 조건이 맞아서 추천", "이 장소 후기 쓰기", "후기", and "KENTECH 전체 구성원".

## 10. Current Limitations (post-fix)

After the A2 fix, the old "a different type shows up in the results" problem is gone (checked by simulation). What's left:

- The recommendation is static and deterministic. Same input, same three places, every time. It has no sense of time of day, day of week, or whether a place is actually open right now.
- Strict type separation cuts both ways. Because the type filter is hard, a cafe that would genuinely fit your situation never appears when you picked food. That is intentional, but it is still a limitation.
- Ties are common. Food and drink don't get the cafe tag bonuses, so several places often share a score. The food · low-budget · near · quick · solo combo produces a lot of 14-point ties, and when that happens the order falls back to the order in the JSON file, which is basically arbitrary.
- Distance is a category you pick, not a measured value. This is by design for a no-backend demo: each place has a fixed `near/medium/far` attribute and there is no geolocation or walking-time math. The `walk` field is just descriptive text (for example "차량 이동권", drive-over range). Real, location-based distance would be the obvious next step.
- Reviews are not shared. They live in `localStorage`, so no one else and no other device sees them, and clearing browser data deletes them.
- The data is curated by hand from public sources (DiningCode and similar), so it can fall out of date with a place's real status.
