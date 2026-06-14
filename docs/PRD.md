# Campus Bites AI — PRD

> A context-based restaurant / cafe / bar recommendation web app for the KENTECH community
> Introduction to AI Programming, Assignment 4

This document is written against the actual repository code (`src/`) and data (`src/data/places.json`). On-screen copy, the scoring rules, and the data counts all match the current code; anything that can't be confirmed from the code is collected under `[To confirm]` at the end. Quoted strings in Korean (e.g. button labels) are the literal on-screen text, kept verbatim so the doc can be checked against the code.

---

## 1. Product Overview

Campus Bites AI narrows down a small decision that KENTECH people make almost every day — "now that today's done, should I grab food or hit a cafe?" Instead of typing keywords into a search box and digging through reviews, you pick your current situation across five fields (budget, walking distance, mood, party type) and it immediately surfaces three matching places.

The key point: it gives the *impression* of "AI picks for you," but under the hood it is an **explainable, rule-based scoring recommendation that never calls an external generative AI (LLM)**. You can explain why each place rose to the top through the scoring rules, and it runs instantly off static data with no network calls. The recommendation area says so explicitly — "외부 생성형 AI가 아닌, 선택 조건과 장소 속성을 비교하는 설명 가능한 규칙 기반 추천입니다" (an explainable rule-based recommendation that compares your chosen conditions against place attributes, not an external generative AI).

On top of that, a reviews section where members leave star ratings and visit notes complements the static recommendation with real usage context. Reviews, within this demo's scope, are stored only in the browser's `localStorage`.

The data is **58 places** gathered from real place names in the Naju Innovation City / Bitgaram-dong living area (food 27, cafe 17, drink 14).

## 2. Target Users

The product explicitly targets the **whole KENTECH community**. An earlier version had narrowed this to "college students / STUDENTS" only; this widens it.

- Undergraduates — a fast, cheap meal during a gap between classes; a casual outing with friends
- Graduate students — a cafe near the lab to sit and work for a while; a spot to hole up alone near a paper deadline
- Faculty — a restaurant suitable for meetings or hosting guests
- Staff — department lunches, team dinners

The affiliation options in the review form (`undergraduate / graduate / faculty / staff`) and the affiliation filter map directly onto these four groups.

## 3. Project Goals

1. **Cut decision fatigue.** Not search — pick conditions, get three places. It should be over in a few clicks.
2. **Explainability.** The recommendation must not be a black box. A person should be able to follow which attribute matches produced the score.
3. **Local realism.** Use real Bitgaram-dong / Naju Innovation City candidates, not made-up places.
4. **Member participation.** Don't only push recommendations one way — let reviews enrich the data.

Non-goals (out of scope this round): live business hours / crowd levels, a server DB, login, real distance computation, LLM calls.

## 4. Core User Scenario

Jimin, a graduate student, finishes a seminar at 4pm. She has two hours before a dinner appointment and wants to sit alone and finish some code.

1. She opens the page and taps "지금 추천받기" (get recommendations now) at the top.
2. She picks place type **카페 (cafe)**, budget **under ₩10,000**, distance **5-min walk**, mood **stay a while**, party **solo**.
3. Three places appear on the right. Because she chose cafe, places tagged "공부하기 좋음" (good for studying) rise to the top (the #1 for this combo is 헤이키커피 나주혁신점).
4. She reads each card's menu, price range, address, and reason, then checks the location via the Naver Map / Google Maps links.
5. After visiting, in the reviews section she sets affiliation to "대학원생" (graduate student) and leaves a star rating and a one-line note. Next time she returns in the same browser, that review is still there.

## 5. Feature List

Priorities are split into Must (no product without it) / Should (needed for completeness) / Nice (good to have).

### Must
- **Condition-based Top-3 recommendation** — five selects: place type, budget, distance, mood, party. On selection, scores are computed and the top three are rendered. (`scorePlace`, `results` in `src/app/page.tsx`)
- **Single-type guarantee** — only the selected place type appears in results. Pick food and cafes/bars never get mixed in. (`results` filters by `placeType === filters.placeType` first)
- **Empty-state handling** — if the type filter leaves zero candidates, show a guidance card: "선택한 조건에 맞는 장소가 없어요. 조건을 바꿔보세요." (no places match — try changing the conditions). With 1–2 it shows only what exists, without padding empty slots. (With current data zero never happens, but it's handled defensively.)
- **Dynamic recommendation reasons** — cards don't just carry the fixed `reason` text; below it, an "이 조건이 맞아서 추천: …" (recommended because these matched) line is added. As `scorePlace` awards points, it also collects which conditions matched (budget match, walking distance fits, good for solo, good for studying, etc.). → direct support for G2 (understanding the basis of a recommendation).
- **Real place data** — 58 places, each with menu / price / address / reason / tags. (`src/data/places.json`)
- **Map links** — each card links straight to Naver Map and Google Maps. (`createMapLinks`)

### Should
- **Community reviews** — star rating (1–5), affiliation, nickname, visit purpose, body. Stored in `localStorage`, persists across reloads. (`src/components/reviews-section.tsx`)
- **Filter by affiliation / average rating** — filter by all / undergraduate / graduate / faculty / staff. Average rating and review count shown at the top.
- **Delete your own review** — the delete button appears only on locally saved (your own) reviews.
- **Review ↔ recommend-card link** — each result card shows that place's review count ("후기 N개"), and pressing "이 장소 후기 쓰기" (write a review for this place) scrolls to the reviews section while auto-selecting that place in the form's place select. The review state lives in `Home` (`localReviews`) and `ReviewsSection` is controlled via props. Shared data/types are split out into `src/lib/reviews.ts`.
- **Dark mode** — unified on `next-themes`. The "무드 바꾸기" (change the mood) button toggles light/dark.

### Nice
- **Cafe-specific weighting** — picking cafe gives extra points to tags like "공부하기 좋음 / 혼자 가기 좋음," so the "study cafe" students look for most rises first.
- **Seeded sample reviews** — three example reviews preloaded so the section doesn't look empty.
- **Responsive layout** — handles both mobile and desktop.

> Note: favorites/bookmarks, login, and server storage are not Must/Should this round (unimplemented, and non-goals).

## 6. Page Structure

A single page (one route, `/`, with an SPA feel) stitched together by anchor navigation. Top nav: Problem · Features · Recommend · Reviews · Data.

| Anchor | Section | Contents |
|--------|---------|----------|
| `#hero` | Hero | One-line value proposition, "지금 추천받기" CTA, "무드 바꾸기" (dark toggle), target/input/recommendation summary cards |
| `#problem` | Problem | The daily fatigue of picking a place + a snapshot of 58 real candidates (food/cafe/drink counts shown dynamically) |
| `#features` | Core features | Fast condition-based recommendation, diverse member situations, community reviews — three cards |
| `#recommend` | Recommendation MVP | Five selects + the "rule-based recommendation" notice on the left; Top-3 result cards on the right (reason line · map links · review count · "write review" button). Guidance card if zero candidates |
| `#reviews` | Reviews | Submission form (affiliation · nickname · purpose · rating · body) + affiliation filter + review list |
| `#coverage` | Data status | Total count, food/cafe/drink split, current stage (MVP) note |

The count displays (`totalCount`, `foodCount`, `cafeCount`, `drinkCount`) are not hardcoded — they're derived by counting `places.json`, so growing the data updates the on-screen numbers automatically.

## 7. Technical Requirements

- **Framework:** Next.js 16 (App Router, Turbopack), React 19
- **Language:** TypeScript 5 (strict)
- **Styling:** Tailwind CSS 3.4, dark mode via the `class` strategy
- **Theme:** `next-themes` (`ThemeProvider attribute="class" defaultTheme="system" enableSystem`)
- **Icons:** lucide-react
- **State/data:** client `useState` only. Recommendations import static JSON. Reviews use `localStorage`. No server, DB, or external API.
- **Data model (`src/types/place.ts`):** `Place = { name, placeType, address, budget, distance, mood, group, menu, walk, price, tags[], reason }`. Enums: `placeType: food|cafe|drink`, `budget: low|mid|high`, `distance: near|medium|far`, `mood: quick|cozy|trendy`, `group: solo|friend|team`.
- **Review model (`src/lib/reviews.ts`):** `Review = { id, placeName, affiliation, nickname, purpose, rating, content, createdAt, isLocal }`, `affiliation: undergraduate|graduate|faculty|staff`, storage key `campus-bites-reviews`, id from `crypto.randomUUID()`. Types, sample data, and `loadLocalReviews`/`formatDate` live in this module and are shared by `page.tsx` and `reviews-section.tsx`. The review state (`localReviews`) is owned by `Home`, and `ReviewsSection` is controlled via props.
- **Scripts:** `dev = next dev --turbopack`, `build = next build`, `lint = eslint .`
- **Deployment:** push to GitHub main → Vercel auto-deploy.

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

`scorePlace` returns not just a score but `{ score, reasons }`. `reasons` is an array collecting the reason phrase each time points are added (budget match · walking distance fits · good for solo · good for studying …), and the card's "이 조건이 맞아서 추천:" line joins this array with `·`. The data (`places.json`) is left untouched — only display/computation logic was added.

In the end, `results` is: (1) filter to the selected type first → (2) attach `{ score, reasons }` to each place → (3) sort by score descending → (4) slice the top three. The place-type weight (+4) effectively remains only as a tiebreaker, which is why a type match is *not* added to `reasons` (it's already guaranteed by the filter). What actually separates types is not the score but the filter in front of it.

## 7-A. Acceptance Criteria

To call the added/improved features "done," the following must hold.

- **Single type:** for any combination, all three results are the selected type. (Passed across five simulated combos.)
- **Empty state:** if the selected type has zero candidates, a guidance card appears in the results area and the card grid is not rendered. With 1–2, only that many show.
- **Recommendation reasons:** every result card shows an "이 조건이 맞아서 추천: …" line below the fixed `place.reason`, and that text matches the conditions that actually contributed to the score. If nothing matched, the line is hidden.
- **Review count:** a card's "후기 N개" equals the number of (sample + localStorage) reviews whose place name matches.
- **Review link:** pressing "이 장소 후기 쓰기" scrolls to `#reviews` and switches the form's place select to that place. It works even when the same place is pressed again (re-triggered via a nonce).
- **No regression:** after adding the above, `npm run lint` and `npm run build` still pass.

## 8. Design Requirements

- Warm cream/orange gradient background, rounded cards and pill buttons, backdrop blur for a soft tone.
- Dark mode keeps the same structure but shifts to a dark navy palette. Colors handled via Tailwind `dark:` variants.
- Accent colors are teal (labels) and orange (numbers, stars). Stars shown as filled/empty.
- Korean body text dominates and only section labels are uppercase English (e.g. `CORE FEATURES`). Labels are kept short so the two tones don't clash.
- Keyboard/screen-reader considerations: the rating input is a `role="radiogroup"`, each star has `aria-checked` and `aria-label`. The delete button also has an `aria-label`.
- Responsive grid that drops to one column on mobile and multiple columns on desktop.

## 9. Milestones

Only the range confirmable from code and commits is listed. Exact dates are `[To confirm]`.

- **M1 — Setup:** create the Next.js 16 project from the EasyNext template, first commit (`Initial commit from Create Next App`).
- **M2 — Landing + recommendation MVP:** hero–data sections, five selects, first `scorePlace`, initial place data. (`Build Campus Bites AI landing page`)
- **M3 — Data expansion:** grow Bitgaram-dong / Naju Innovation City candidates to 58 and classify into food/cafe/drink.
- **M4 — Reviews feature:** add `reviews-section.tsx`, localStorage · affiliation filter · delete · average rating.
- **M5 — Fix round (A1–C4):** split out the type filter (A2), unify dark mode (B1), tidy the scoring rules (B2), rule-based notice (B3), README/metadata/eslint·tsconfig cleanup (C-series).
- **M6 — Verify · deploy:** confirm `npm run lint`/`npm run build` pass, push main, deploy to Vercel.

### Deployment check (2026-06-14)

- Vercel production was redeployed at commit `d73cbe6d1a0e0108e48207490d9a9c14858e77b8`.
- Deploy status was `READY`/`PROMOTED`; the stable URL is https://testlanding-theta.vercel.app.
- The public URL responded HTTP 200 with zero redirects, and the static HTML contained "이 조건이 맞아서 추천", "이 장소 후기 쓰기", "후기", and "KENTECH 전체 구성원".

## 10. Current Limitations (post-fix)

After the A2 fix, the old problem of "a different type mixed into the results" **no longer occurs** (confirmed by simulation). The real limitations as of now are:

- **The recommendation is static and deterministic.** The same input always yields the same three places. It knows nothing about time of day, day of week, or real-time open/closed status.
- **The flip side of type separation.** Because types are strictly filtered, a contextually great cafe never surfaces when you pick food (an intentional trade-off).
- **Many ties.** The food/drink paths lack cafe-style tag bonuses, so several places land on the same score (e.g. many 14-point ties in the food · low-budget · near · quick · solo combo). Order is then decided by the original JSON array order (stable sort) — effectively an arbitrary tiebreak.
- **Distance isn't real distance.** It's just a categorical value the user picks, and the `walk` field is descriptive text like "차량 이동권" (drive-over range).
- **Reviews aren't shared.** Being `localStorage`, they aren't visible to other people or other devices, and clearing browser data wipes them.
- **The data is hand-curated.** Based on public info (DiningCode etc.), so it can drift from the latest business status.

---

### `[To confirm]` (not determinable from code)
- The exact makeup / division of labor among the AI tools used (Codex / EasyNext / Cursor / Vercel CLI — traces are visible, but who did what can't be pinned down from code)
- The actual dates of M1–M6
