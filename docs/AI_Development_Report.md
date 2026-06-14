# Campus Bites AI — AI Development Report

> Introduction to AI Programming, Assignment 4
> A write-up of what I built myself, what I handed to AI, and where I got stuck along the way.

---

## 1. AI Tools Used

I built this with an AI coding tool in hand from start to finish. Listing mainly the traces left in the code/config:

- **EasyNext template** — started from a boilerplate that already had Next.js 16 + React 19 + Tailwind + shadcn/ui-style components. `src/components/ui/*`, `providers.tsx`, and `use-toast.ts` are leftovers of that.
- **Codex (code generation/edits)** — I handed it the recommendation logic, the data, the reviews component, and the final A1–C4 fix round.
- **Cursor** — judging by `.cursor/` and `.cursorignore`, it was used at the editor stage too.
- **Vercel** — the project is linked via `.vercel/` and deploys on each push to GitHub main.

## 2. What I Handed to AI

- Laying out the landing-page skeleton on top of the boilerplate (hero / problem / features / recommend / reviews / data sections)
- Filling `places.json` with 58 real place names from Bitgaram-dong / Naju Innovation City, attaching metadata to each (budget / distance / mood / party / tags / reason)
- A first draft of the `scorePlace` scoring function
- The reviews component (`reviews-section.tsx`) — form, star rating, localStorage save/delete, affiliation filter
- The final cleanup: splitting out the type filter, unifying dark mode, modernizing the eslint flat config, touching up README/metadata

What I did was decide *what to build / how the recommendation should rank / what was wrong*, and roll back and fix the AI output whenever it diverged from intent.

## 3. Representative Prompts, and How I Fixed the Results

Rendered close to how I actually phrased them. Not cleaned up.

**Prompt 1 — "Pull ~50–60 real restaurants/cafes/bars around KENTECH in Bitgaram-dong into JSON. Put budget, distance, mood, party, tags, and a reason on each."**
The AI gathered the places fine, but the metadata was all over the place. Same price tier marked `mid` here and `high` there; a cafe tagged `quick` in places. So I locked the enums down in `types/place.ts` as `budget/distance/mood/group`, then swept the data by hand so no value leaked outside them. Final: 58 places (food 27 · cafe 17 · drink 14).

**Prompt 2 — "When I pick conditions, score them and take the top 3. For cafe, study-friendly places should come up first."**
The first-draft `scorePlace` just added every condition with similar weight, so even picking cafe wouldn't float a "study cafe" to the top. So I added a cafe-only branch and hardcoded **+5** for the tag "공부하기 좋음" and +3 for "혼자 가기 좋음" to force the order I wanted. (The cafe-only bonus block in the current code is the result.)

**Prompt 3 — "I picked food but cafes and bars showed up in the results. Only show the type I selected."**
This was the core bug (A2 below). The AI tried to "soften" it by giving the type more weight inside the score, but then a higher-scoring other type still slips in. I decided this isn't a score problem, and put `.filter(p => p.placeType === filters.placeType)` at the very front of the `results` computation so the **candidate pool itself is cut by type before** scoring.

**Prompt 4 — "Dark mode is fighting itself in two places. Merge it onto next-themes."**
The page had a local `dark` state plus `document.documentElement.classList.toggle`, which clashed with `next-themes`' theme. I ripped out the local toggle and switched to only `useTheme()`'s `resolvedTheme/setTheme`. The "무드 바꾸기" button is now a single line: `setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')`.

**Prompt 5 — "Add review writing. Star rating and affiliation (undergrad/grad/faculty/staff), and it should survive a refresh."**
The component skeleton came out well. But server render and localStorage collided into a hydration warning, so I split it: render only the sample reviews on first paint, then load local reviews in a post-mount `useEffect`.

**Prompt 6 — "Show one line on the card about why it was recommended. The reason is fixed so it's weak. Make the score also spit out which conditions matched."**
I changed `scorePlace` from returning just a number to `{ score, reasons }`. Each spot that adds points now pushes a reason phrase into `reasons`, and the card got an "이 조건이 맞아서 추천: …" line under the fixed `reason`. Since the return shape changed, I matched up `results`' `.map(...).sort(...).slice(...)` too — but I didn't touch the score math at all, so the ranking is unchanged (sim confirmed identical 26/21/17, 14/14/14). The type match (+4) is already guaranteed by the filter, so I deliberately left it out of `reasons`.

**Prompt 7 — "Link the recommend cards to reviews. Show how many reviews each place has, and 'write review' should auto-select that place in the review form."**
The review state was trapped inside `reviews-section.tsx`, so the cards couldn't count it. Not wanting to over-refactor, I pulled only the shared data/types out to `src/lib/reviews.ts` and lifted the review state (`localReviews`) up to `Home`. `ReviewsSection` became controlled via props. To make the form re-switch even when the same place is pressed twice, I attached a `nonce` to the request so the `useEffect` re-runs (without it the place value is the same and the effect won't fire).

## 4. Bugs, Errors, Limitations Found — and Fixes

Not an abstract "improved it," but the spots where I actually got stuck.

- **A2 — the type-mixing bug (the big one).** Symptom: even picking place type "밥 (food)," cafes/bars showed up among the three results. It was clearest in the food · low-budget · far · cozy combo. Cause: the recommendation sorted all 58 places on one score table and cut the top 3, and the type weight (+4) alone couldn't stop another type from overtaking on score. Fix: apply the `placeType` filter **before** scoring in `results`. Verification: in §5 below I ran five combos and confirmed every result came back single-type.
- **B1 — dark mode managed twice.** Symptom: the toggle wouldn't take in one go, or the theme flickered on refresh. Cause: a page-local state plus `classList.toggle` touched the class independently of `next-themes`. Fix: unify onto a single source (`next-themes`). The page now has neither `classList.toggle` nor a local dark state.
- **B2 — scoring rules cleanup.** There used to be cross-type penalties like "cafe→restaurant -2," but once types were split by filter, the cross penalties became meaningless (no other type is in the pool to begin with). So I removed the penalties and kept only the bonuses and gentle nudges that fit the situation within the same type. The PRD's scoring table matches the code 1:1.
- **B3 — preventing the "AI picks it" misconception.** I added "외부 생성형 AI가 아닌, 선택 조건과 장소 속성을 비교하는 설명 가능한 규칙 기반 추천입니다" to the recommendation area so it doesn't look like it's calling an LLM.
- **Review hydration warning.** Symptom: a server/client mismatch warning in the console. Cause: trying to render localStorage data on first paint that the server doesn't have. Fix: fill local reviews only in a post-mount `useEffect` (`react-hooks/set-state-in-effect` is the intended pattern here, so only that line is lint-excepted).
- **Remaining limitations.** Lots of ties — food/drink lack cafe-style tag bonuses, so several places land on the same score and the JSON array order becomes the tiebreak (close to arbitrary). Reviews aren't shared because they're localStorage. Distance isn't a real computation but a category the user picks. The data is hand-curated, so it can drift from real business status.

## 5. What I Verified Myself

To avoid just writing "passed," I separate what I actually ran from what I only checked by reading the code.

- **`npm run lint` — ran it, passed.** `eslint .`, exit code 0, no warnings/errors. (Re-ran after each of features 1·2·3, 0 every time.)
- **`npm run build` — ran it, passed.** Next.js 16.2.6 (Turbopack), compiled, TypeScript passed, 4 static pages generated, `/` prerendered as static (exit code 0). Still passes after all three features.
- **Dynamic recommendation reasons — confirmed by running a sim.** Lifting out the scoring function and running it, the scores were identical to before (no ranking regression) and the `reasons` array matched the conditions met. E.g. the #1 for cafe · low-budget · near · cozy · solo (헤이키커피) was "예산 맞음 · 도보 거리 적합 · 편하게 머물기 좋음 · 혼밥 적합 · 공부하기 좋음 · 혼자 가기 좋음 · 혼자 집중하기 좋음 · 편안한 분위기".
- **Empty state — confirmed by code review.** The guidance card renders only when `results.length === 0`. Current data never hits zero (every type has 3+), but the defensive code is there.
- **Review count / write-review link — confirmed by code review.** A card's "후기 N개" counts (sample + local) reviews by placeName (the 3 sample places have 1 each). The button does a `#reviews` scroll + nonce bump to switch the form's place. Actual click-testing in a browser is left as a human task.
- **Recommendation regression sim — ran it.** Lifting `places.json` and `scorePlace` verbatim, I ran five combos:
  - food · low-budget · far · cozy · solo → 로뎀나무 / 우리할매떡볶이 / 정씨네 (all food)
  - food · low-budget · near · quick · solo → 우리할매떡볶이 / 정씨네 / 첨단공원국밥 (all food, 14-point tie)
  - cafe · low-budget · near · cozy · solo → 헤이키커피 / 소로 커피로스터스 / 멜로우 (all cafe, study cafes first)
  - drink · mid-budget · near · trendy · friend → 트레비어 / 요리신 / 요릿집 (all drink)
  - drink · high-budget · far · trendy · team → 루야네 심야식당 / 재간댁삼겹살 / 육온담 (all drink)
  - → all five combos single-type. Confirmed A2 is actually fixed.
- **Data counts — ran it.** Counting by script: total 58, food 27 / cafe 17 / drink 14, and every place has a `walk` field. Matches the README's "58 places."
- **Dark-mode unification / rule-based notice / removal of old "STUDENTS·대학생" copy — confirmed by code review.** I did not actually open the screen and click through (manual browser checks are left as a human task).

## 6. What I Decided vs. What AI Implemented

- **Decided (me):** widen the target from "college students" to the whole KENTECH community / go with an explainable rule rather than an LLM for recommendations / separate types with a filter, not the score / favor study cafes only for cafe / keep reviews in localStorage only within the demo scope.
  - Why: for an assignment, being able to explain "why was this recommended" mattered, and a demo is cleaner if it runs instantly without a server. Type mixing leaks again if you push on it with the score, so I judged it right to block it structurally.
- **Decided (me) — this round:** pull recommendation reasons directly from the score computation rather than padding the data text (it fits G2's intent better) / keep the review link minimal when lifting state (pull only the shared data into `lib`, only the state into `Home`, no new library or global store) / don't pad empty slots.
- **Implemented (AI):** component/JSX skeletons, the first data draft, the score-function draft, the review form/save logic, config modernization (eslint flat config, tailwind ESM import, tsconfig). This round's `reasons` collection, empty-state branch, and props lift-up were also AI first drafts that I then fixed for return shape / regression / re-trigger (nonce).

## 7. Final Deployment

- **GitHub:** https://github.com/qwer4818-commits/test_website (branch: main)
- **Vercel:** https://testlanding-theta.vercel.app

On 2026-06-14, after confirming via deploy/commit timestamps and the static HTML that the existing production deploy was older than commit `d73cbe6`, I redeployed with `vercel --prod`. The Vercel API metadata's `githubCommitSha` was `d73cbe6d1a0e0108e48207490d9a9c14858e77b8`, status `READY`/`PROMOTED`. The stable URL responded publicly with HTTP 200 and zero redirects, and the static HTML contained the new-feature strings "이 조건이 맞아서 추천", "이 장소 후기 쓰기", "후기", and "KENTECH 전체 구성원".
