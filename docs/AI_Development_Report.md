# Campus Bites AI — AI Development Report

> Introduction to AI Programming, Assignment 4
> What I built myself, what I handed to AI, and where I got stuck.

---

## 1. AI Tools Used

I had an AI coding tool open the whole time. Listing the ones that left traces in the code and config:

- **EasyNext template.** The starting boilerplate already had Next.js 16, React 19, Tailwind, and shadcn/ui-style components. `src/components/ui/*`, `providers.tsx`, and `use-toast.ts` are left over from it.
- **Codex** did most of the code generation: the recommendation logic, the data, the reviews component, and the final A1–C4 fix round.
- **Cursor.** The `.cursor/` and `.cursorignore` files show it was used in the editor too.
- **Vercel** hosts the site. The project is linked through `.vercel/` and deploys whenever main is pushed.

## 2. What I Handed to AI

- The landing-page skeleton on top of the boilerplate (hero, problem, features, recommend, reviews, data sections)
- Filling `places.json` with 58 real place names from Bitgaram-dong / Naju Innovation City, and tagging each with metadata (budget, distance, mood, party, tags, reason)
- A first draft of the `scorePlace` scoring function
- The reviews component (`reviews-section.tsx`): form, star rating, localStorage save/delete, affiliation filter
- The final cleanup: splitting out the type filter, unifying dark mode, modernizing the eslint flat config, touching up README and metadata

My own part was deciding what to build, how the recommendation should rank, and what was wrong, then rolling back and fixing the AI output whenever it drifted from what I wanted.

## 3. Representative Prompts, and How I Fixed the Results

These are close to how I actually phrased them. I didn't tidy them up.

**Prompt 1: "Pull ~50–60 real restaurants/cafes/bars around KENTECH in Bitgaram-dong into JSON. Put budget, distance, mood, party, tags, and a reason on each."**
The places themselves were fine, but the metadata was a mess. Same price tier marked `mid` in one row and `high` in the next, a cafe randomly tagged `quick`, that kind of thing. So I pinned the enums down in `types/place.ts` (`budget/distance/mood/group`) and then went through the whole file by hand to make sure nothing slipped outside them. Ended up with 58 places: food 27, cafe 17, drink 14.

**Prompt 2: "When I pick conditions, score them and take the top 3. For cafe, study-friendly places should come up first."**
The first `scorePlace` just added every condition with roughly the same weight, so even when you picked cafe, the study cafes didn't actually come up first. Not what I wanted. I added a cafe-only branch and just hardcoded **+5** on the "공부하기 좋음" tag and +3 on "혼자 가기 좋음" to drag them up. That cafe-only bonus block in the code now is the result.

**Prompt 3: "I picked food but cafes and bars showed up in the results. Only show the type I selected."**
This was the bug that actually annoyed me (A2, below). The AI kept trying to "fix" it by cranking the type weight up in the score, but that never really works, a high-scoring bar would still elbow its way into a "food" search. Eventually I stopped fighting the score and just put `.filter(p => p.placeType === filters.placeType)` at the very front of `results`, so other types are gone before scoring even starts.

**Prompt 4: "Dark mode is fighting itself in two places. Merge it onto next-themes."**
The page was keeping its own `dark` state and also calling `document.documentElement.classList.toggle`, and the two were fighting `next-themes`. I just tore out the local toggle and let `useTheme()`'s `resolvedTheme/setTheme` handle everything. The "무드 바꾸기" button is one line now: `setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')`.

**Prompt 5: "Add review writing. Star rating and affiliation (undergrad/grad/faculty/staff), and it should survive a refresh."**
The component skeleton was actually solid. The catch was a hydration warning from server render bumping into localStorage. So I split it up: only the sample reviews paint on the first render, and the local ones come in afterward in a post-mount `useEffect`.

**Prompt 6: "Show one line on the card about why it was recommended. The reason is fixed so it's weak. Make the score also spit out which conditions matched."**
I made `scorePlace` return `{ score, reasons }` instead of just a number. Every place that adds points now also pushes a little reason phrase into `reasons`, and the card shows an "이 조건이 맞아서 추천: …" line under the fixed `reason`. Changing the return shape meant I had to fix up the `.map(...).sort(...).slice(...)` in `results` too, but I was careful not to touch the actual score math, so the ranking didn't move. A quick sim gave me the exact same numbers (26/21/17, then 14/14/14). The type match (+4) is already guaranteed by the filter, so I left it out of `reasons` on purpose.

**Prompt 7: "Link the recommend cards to reviews. Show how many reviews each place has, and 'write review' should auto-select that place in the review form."**
The review state was stuck inside `reviews-section.tsx`, so the cards had no way to count it. I didn't want to rip the whole thing apart, so I pulled just the shared data and types out into `src/lib/reviews.ts` and lifted the review state (`localReviews`) up to `Home`. `ReviewsSection` is controlled through props now. One annoying detail: if you click "write review" on the same place twice, the form wouldn't move, because the place value never changed and the `useEffect` just sat there. I ended up bolting a `nonce` onto the request to kick the effect each time.

## 4. Bugs, Errors, and Limitations, and How I Fixed Them

Not a vague "improved it," but the spots where I actually got stuck.

- **A2, the type-mixing bug (the big one).** Picking place type "밥 (food)" still gave me cafes and bars in the three results, worst in the food · low-budget · far · cozy combo. The reason: it scored all 58 places on one table and took the top 3, and a +4 type weight just isn't enough to stop a really high-scoring cafe from jumping in. The fix was to filter by `placeType` before scoring in `results`. I checked it in §5 by running five combos, and every one came back single-type.
- **B1, dark mode managed twice.** The toggle wouldn't take in one click and the theme flickered on refresh. Turned out a page-local state plus `classList.toggle` were touching the class behind `next-themes`'s back. I moved everything onto the one source (`next-themes`); the page now has no `classList.toggle` and no local dark state.
- **B2, scoring rules cleanup.** There were these cross-type penalties like "cafe to restaurant, -2" sitting in the old code. Once the filter split the types apart they did nothing, since the other type isn't even in the pool anymore. I pulled them out and kept only the bonuses and small nudges that make sense within one type. The PRD table matches the code one to one now.
- **B3, the "AI picks it" misconception.** I dropped "외부 생성형 AI가 아닌, 선택 조건과 장소 속성을 비교하는 설명 가능한 규칙 기반 추천입니다" into the recommend area so nobody assumes there's an LLM behind it.
- **Review hydration warning.** The console kept throwing a server/client mismatch. Took me a moment to see why: I was painting localStorage reviews on the first render, and the server has no localStorage. The fix was to hold off and load the local reviews after mount in a `useEffect`. (`react-hooks/set-state-in-effect` is the intended pattern there, so I lint-excepted just that one line.)
- **Remaining limitations.** Ties happen a lot, because food and drink don't get the cafe tag bonuses, so several places end on the same score and the JSON order quietly becomes the tiebreak. Reviews don't sync anywhere, since they're just localStorage. Distance is something you pick, not something measured, which is on purpose for a no-backend demo, with real location-based distance as a later step. And the data is hand-curated, so it can go stale versus a place's real status.

## 5. What I Verified Myself

To avoid just writing "passed," I separate what I actually ran from what I only checked by reading the code.

- **`npm run lint`: ran it, passed.** `eslint .`, exit code 0, no warnings or errors. I re-ran it after each of features 1, 2, and 3, and it was 0 every time.
- **`npm run build`: ran it, passed.** Next.js 16.2.6 (Turbopack), compiled, TypeScript passed, 4 static pages generated, `/` prerendered as static, exit code 0. Still passes after all three features.
- **Dynamic reasons: confirmed by running a sim.** Lifting the scoring function out and running it, the scores were identical to before (no ranking regression) and the `reasons` array matched the conditions met. For example the #1 for cafe · low-budget · near · cozy · solo (헤이키커피) came out as "예산 맞음 · 도보 거리 적합 · 편하게 머물기 좋음 · 혼밥 적합 · 공부하기 좋음 · 혼자 가기 좋음 · 혼자 집중하기 좋음 · 편안한 분위기".
- **Empty state: confirmed by reading the code.** The guidance card renders only when `results.length === 0`. The current data never hits zero (every type has at least 3), but the defensive branch is there.
- **Review count and write-review link: confirmed by reading the code.** A card's "후기 N개" counts the (sample + local) reviews by placeName, and the 3 sample places have 1 each. The button does a `#reviews` scroll plus a nonce bump to switch the form's place. Actual click-testing in a browser I left as a manual check.
- **Recommendation regression sim: ran it.** Lifting `places.json` and `scorePlace` out verbatim, I ran five combos:
  - food · low-budget · far · cozy · solo: 로뎀나무 / 우리할매떡볶이 / 정씨네 (all food)
  - food · low-budget · near · quick · solo: 우리할매떡볶이 / 정씨네 / 첨단공원국밥 (all food, 14-point tie)
  - cafe · low-budget · near · cozy · solo: 헤이키커피 / 소로 커피로스터스 / 멜로우 (all cafe, study cafes first)
  - drink · mid-budget · near · trendy · friend: 트레비어 / 요리신 / 요릿집 (all drink)
  - drink · high-budget · far · trendy · team: 루야네 심야식당 / 재간댁삼겹살 / 육온담 (all drink)

  All five came back single-type, which confirms A2 is actually fixed.
- **Data counts: ran it.** Counting by script: total 58, food 27 / cafe 17 / drink 14, and every place has a `walk` field. This matches the README's "58 places."
- **Dark-mode unification, rule-based notice, and removal of the old "STUDENTS·대학생" copy: confirmed by reading the code.** I did not open the screen and click through; manual browser checks are left as a human task.

## 6. What I Decided vs. What AI Implemented

- **Decided (me):** widen the target from "college students" to the whole KENTECH community; use an explainable rule rather than an LLM for recommendations; separate types with a filter instead of the score; favor study cafes only when cafe is selected; keep reviews in localStorage for the demo.
  - Why: for an assignment, being able to explain "why was this recommended" mattered to me, and a demo is cleaner when it runs instantly with no server. Type mixing leaks again if you push on it with the score, so blocking it structurally felt like the right call.
- **Decided (me), this round:** pull the recommendation reasons straight from the score computation rather than padding the data text, since that fits goal G2 better; keep the review link minimal when lifting state (only the shared data into `lib`, only the state into `Home`, no new library or global store); don't pad empty slots.
- **Implemented (AI):** component and JSX skeletons, the first data draft, the score-function draft, the review form and save logic, and the config modernization (eslint flat config, tailwind ESM import, tsconfig). This round's `reasons` collection, empty-state branch, and props lift-up were also AI first drafts, which I then fixed for the return shape, the regression, and the re-trigger (nonce).

## 7. Final Deployment

- **GitHub:** https://github.com/qwer4818-commits/test_website (branch: main)
- **Vercel:** https://testlanding-theta.vercel.app

The site is deployed to Vercel production and is publicly reachable. Vercel redeploys from main on each push, and I also ran `vercel --prod` directly to promote the build. When I checked, the stable URL returned HTTP 200 with no redirects, and the served HTML contained the feature strings "이 조건이 맞아서 추천", "이 장소 후기 쓰기", "후기", and "KENTECH 전체 구성원".
