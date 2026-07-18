---
status: active
last-updated: 2026-07-18
owner: Philip
---

# Tasks — mynichi

> **The plan + the task checklist, in one file.** Part 1 is the technical plan (how we build what `SPEC.md` describes). Part 2 is the task checklist (Now / Backlog / Shipped).

---

# Part 1 — Plan (how we build it)

## Stack

- **Monorepo**: Bun workspaces + Turborepo (same shape as `pathtraveled`). Bun >= 1.2.
- **App (native-first + web)**: Expo SDK 54 / React Native 0.81, `expo-router`, TypeScript strict.
  - **react-strict-dom (RSD)** for shared UI components wherever possible (`html.*` + StyleX-style `css.create`): real DOM on web, RN mapping on native. Fall back to RN primitives/Expo modules where RSD has no answer (camera, canvas/handwriting, audio).
  - One codebase targets iOS (first), Android (later), and web (Expo web export, static).
- **API**: Bun + Hono (Bun is fast enough for our API shape: it's an orchestrator around model calls and dictionary data, not a compute engine). `zod` for validation.
- **Data**:
  - **On device**: `expo-sqlite` as the local source of truth (lists, review state, settings). Local-first: the free tier works fully offline except cloud model calls.
  - **Cloud (premium sync + auth)**: Supabase (Postgres + Auth). Sync is a premium feature.
  - **Dictionary**: prebuilt SQLite bundle generated from JMdict + KANJIDIC2 + KRADFILE/RADKFILE (radical decomposition) + KanjiVG (strokes); shipped with the app, queried locally. Build pipeline lives in `packages/dict-pipeline`.
- **Japanese NLP**: kuromoji-based tokenization for furigana/readings (API-side; `kuromoji`/`@patdx/kuromoji` on Bun), wanakana for kana/romaji conversion (client + server).
- **OCR**: on-device first (Apple Vision `VNRecognizeTextRequest` via native module on iOS; ML Kit on Android), cloud fallback (Claude vision) for hard images. Practical translation + explanations: Claude API.
- **AI Practice**:
  - **Local**: Apple Foundation Models (Apple Intelligence, iOS 18+/26 APIs) via a small Expo native module. Minimum specs surfaced in-app: iPhone 15 Pro / A17 Pro or newer.
  - **Cloud**: Claude via our API (no-training, zero-retention posture documented in-app).
  - **Voice**: on-device STT/TTS by default (`AVSpeechSynthesizer` / iOS dictation) so voice never leaves the device; cloud TTS only if/when we find one matching the privacy promise.
- **Billing**: RevenueCat (App Store IAP + Stripe for web) so one entitlement works across platforms. Plans: `free`, `premium` ($20/mo, $168/yr = $14/mo).
- **i18n**: `i18next` + `expo-localization`. Locales: en, de, zh, es, pt, fr, it, tl, th, ko.
- **State/data fetching**: zustand (app state) + TanStack Query (server data).

## Architecture Overview

```
mynichi/
├── SPEC.md / TASKS.md / AGENTS.md / README.md
├── package.json  turbo.json  bun.lock          # bun workspaces + turbo
├── apps/
│   ├── native/          # Expo app: iOS + Android + web export (expo-router)
│   │   ├── app/         # routes: (tabs)/translate, lists, dictionary, practice, settings
│   │   ├── components/  # RSD-first shared components
│   │   ├── theme/       # design tokens (colors, type, spacing)
│   │   └── modules/     # native modules (ocr, apple-intelligence) when added
│   ├── web/             # marketing site (Vite + React + Tailwind v4 + GSAP/Lenis/Vanta)
│   │                    #   serves mynichi.app root; /vs/* comparison pages as extra entries
│   └── api/             # Bun + Hono: /translate, /enrich, /practice, /billing webhooks
├── packages/
│   ├── core/            # shared types, zod schemas, jp-text utils (wanakana wrappers)
│   └── dict-pipeline/   # scripts: JMdict/KANJIDIC2/KanjiVG/RADKFILE -> dict.sqlite
```

Flow: app talks to local SQLite for everything it can; calls `api` for model work (OCR fallback, practical translation, enrichment, cloud AI practice); Supabase for auth + premium sync; RevenueCat SDK for entitlements.

## Data Model

Core entities (local SQLite, mirrored to Postgres for premium sync):

- **User** (id, locale, plan, ai_mode: cloud|local, created_at)
- **List** (id, name, category: life|work|real-estate|health|tech|food|travel|custom, icon/color, created_at)
- **ListItem** (id, list_id, kind: kanji|word|phrase|grammar, text, reading, furigana_ruby, meaning, example, source: manual|photo|dictionary, source_ref, created_at)
- **ReviewState** (item_id, axis: recognition|writing, due_at, interval, ease, lapses) for SRS (FSRS algorithm). Kanji items carry both axes so stroke-order practice schedules independently of recognition; other kinds use recognition only.
- **Translation** (id, image_ref?, raw_text, segments[] {surface, reading, furigana}, literal_en, practical_en, created_at) history
- **PracticeSession** (id, scenario, source_lists[], transcript[], model: cloud|local, created_at)
- Dictionary tables are read-only from the bundled `dict.sqlite` (entries, kanji, radicals, strokes, confusables).

## Integrations & APIs

- **Claude API**: practical translation, quick-add enrichment, cloud conversation partner. System prompts live in `apps/api/src/prompts/`.
- **Apple**: Vision (OCR), Foundation Models (local AI), Speech (STT/TTS). Each wrapped in a thin Expo native module with a mockable TS interface.
- **Supabase**: auth (Apple sign-in first), Postgres sync for premium.
- **RevenueCat**: entitlements, webhooks to `apps/api`.
- **Vercel**: web hosting (`mynichi.app`) + API hosting (Hono on Vercel Functions). If model-call latency or streaming limits bite, move `apps/api` to Fly.io (Bun server) without code changes (Hono is runtime-agnostic).

## Infrastructure & Deployment

- **GitHub**: `nekko-labs/mynichi`. Every change ships as a PR with auto-merge (merge commit), never direct to main (nekko-apfs convention adopted org-wide).
- **Web**: one Vercel deploy (project `mynichi`, domain `mynichi.app`) assembled by `scripts/build-site.mjs` into root `dist/`: the marketing site (`apps/web`, Vite) at `/`, the Expo web export at `/app` (expo `experiments.baseUrl: "/app"`). Old app tab paths (/lists etc.) redirect to /app/* via vercel.json.
- **API**: Vercel Functions initially (see above).
- **iOS**: EAS Build + TestFlight, then App Store.
- **Env/secrets**: `.env` at repo root (gitignored), `.env.example` checked in; Vercel/EAS hold their own copies.

## Design System & UI/UX

**"Sketchbook" design language**: the app should feel like an artist's daily sketchbook of life in Japan.

- **Minimal structure**: generous whitespace, no card borders (separation by spacing + soft paper-tint fills), no heavy chrome, large friendly headings.
- **Colorful, artistic accents**: hand-drawn feel via organic shapes, slightly irregular underlines/highlights (like marker strokes), illustrated spot art. Color does the work borders would.
- **Palette (tokens in `apps/native/theme/tokens.ts`)**:
  - Paper: warm off-white `#FAF7F0` (dark: deep sumi `#17161A`)
  - Ink (text): sumi `#2A2732`
  - Accents: hanko red `#E4573D`, indigo ai-iro `#3E5C9A`, matcha `#7FA65A`, yuzu `#F2B441`, sakura `#F2A7B8`. Each top-level feature owns an accent (Translate=indigo, Lists=matcha, Dictionary=yuzu, Practice=sakura/red).
- **Typography**: Klee One (Japanese handwriting-style, covers Latin) for headings/brand; Zen Kaku Gothic New for body/UI. Furigana rendered as proper ruby text.
- **Motion**: small, paper-like (fade + slight rise), no bouncy gamification.
- **States**: every screen defines loading (ink-brush shimmer), empty (illustrated + one-line prompt), error (plain language + retry), success.
- **Accessibility**: dynamic type support, 4.5:1 contrast minimum, VoiceOver labels on all interactive elements.

## Coding Conventions

Extends `obsurdian/knowledgebase/principles/coding.md`. Project-specific:

- TypeScript strict everywhere; no `any` without a comment.
- RSD-first components: build UI with `react-strict-dom` `html.*`; wrap platform-specific fallbacks behind a component in `components/` so screens never import RN primitives directly.
- All Japanese-text helpers live in `packages/core/jp` (one tested implementation of furigana/ruby segmentation, kana conversion).
- API routes validated with zod at the edge; typed client generated for the app (`packages/core/api`).
- Tests: bun test for packages/api; component tests only where logic lives (SRS scheduler, jp utils, dict queries).
- Never use the em dash in any writing, code comments included.

## Constraints

- **Privacy is a product feature**: no analytics SDK that ships voice/text content; model calls documented; local mode must be genuinely offline. Voice audio never persisted server-side.
- **Free tier must work offline** (except cloud model calls) and never lose user data; local SQLite is the source of truth, sync is additive.
- **Apple Intelligence minimum specs**: iPhone 15 Pro / A17 Pro+, iOS 18+. The app itself supports iOS 16+ (local AI gated by capability check).
- **Dictionary licences**: JMdict/KANJIDIC2 (EDRDG licence, attribution required), KanjiVG (CC BY-SA). Attribution screen in Settings is mandatory before shipping dictionary mode.
- Performance: dictionary lookup < 50ms locally; photo -> translation view < 6s on cloud path.

## Key Technical Decisions

- **Expo + react-strict-dom over separate web app** (2026-07-18): one codebase, native-first as requested, web is an export target. RSD gives us real DOM semantics on web instead of div-soup from react-native-web, with RN fallback where RSD is thin. Precedent: pathtraveled's Expo setup.
- **Bun + Hono API** (2026-07-18): Bun is fast enough because the API orchestrates model calls rather than doing heavy compute; Hono keeps us runtime-portable (Vercel now, Fly later if needed).
- **Local-first SQLite, sync as premium** (2026-07-18): aligns the architecture with the privacy promise and makes the free tier robust; sync becomes a clean premium value instead of a tax.
- **Bundled dictionary SQLite** (2026-07-18): offline dictionary is table stakes for the "living here" use case (basements, subways, no signal at the ward office).
- **RevenueCat over hand-rolled StoreKit + Stripe** (2026-07-18): one entitlement model across iOS/web, webhook-driven, worth the fee at our scale.
- **Local SLM for free-tier translation; Claude for premium** (2026-07-18): bake-off on real "living in Japan" inputs (pension letter, casual business chat, shop sign) on an RTX 5090 via Ollama. PLaMo-2-translate (PFN, 10B translation specialist) was the only model to correctly translate 「納期ちょっと巻きで」 (deadline *earlier*, not extended) and 「持ち帰り」 (take back to consider, not take home); Gemma4 12B, Shisa V2.1 8B (MIT, fast, clean JSON), and Qwen3 14B (Apache) all inverted 「巻きで」. Plan: PLaMo (or PFN's plamo API) as the translation engine + a small instruct SLM for the practical-explanation JSON layer grounded on PLaMo's output; kuromoji does segmentation/furigana deterministically. **Caveat: PLaMo community license requires a commercial-use agreement with PFN** (application pending, see workspace memory); Shisa 8B is the license-clean fallback engine. This also strengthens the privacy story: free-tier text hits our self-hosted model, not a third-party API.

- **Self-trained SLM to replace the two-stage local pipeline** (2026-07-19): `packages/slm` trains a single LoRA-tuned Qwen3-4B-Instruct (Apache 2.0) that maps Japanese text directly to `{literal, practical}` JSON, replacing PLaMo (license pending with PFN) + Shisa two-stage inference. Fully local distillation: teacher = strongest local model via LM Studio (default gemma-4-31b-qat; qwen3.6-27b is the Apache-pure alternative but its always-on reasoning is ~10x slower for bulk generation), synthetic "living in Japan" corpus, scored eval (curated idiom cases incl. 巻きで/持ち帰り + chrF vs teacher + JSON validity). Hyperparameter search is agent-driven through kotrain training runs (local gemma-4-12b agent launches/polls detached experiments via `launch.py`, reports via report_experiment).

---

# Part 2 — Tasks (what's built and what's next)

> `- [ ]` todo / in progress · `- [x]` done & verified. Stable IDs, never renumber.

## Now / In Progress

- [ ] **T11 — Photo OCR (still)** (next up): camera + photo-library input, on-device Vision OCR module (iOS), region selection, feed into T10's pipeline. Cloud OCR fallback endpoint. · [spec](SPEC.md#translate-ocr-photo--live-in-progress) · `Added: 2026-07-18`

## Backlog / Planned

### Translate
- [ ] **T12 — Tap-to-save from translation**: tap any segment to add to a list (opens quick-add prefilled) or open in dictionary. Translation history stored locally. · [spec](SPEC.md#translate-ocr-photo--live-planned) · `Added: 2026-07-18`
- [ ] **T13 — Live camera overlay translate** (fast-follow). · [spec](SPEC.md#translate-ocr-photo--live-planned) · `Added: 2026-07-18`

### Lists
- [ ] **T20 — Lists CRUD + local store**: expo-sqlite schema (List, ListItem, ReviewState), category presets with accent colors/icons, list + item screens. · [spec](SPEC.md#practice-lists-planned) · `Added: 2026-07-18`
- [ ] **T21 — Quick-add with enrichment**: 5-second capture box; API `/enrich` fills reading, furigana, meaning, example (dictionary-first, Claude fallback). · [spec](SPEC.md#practice-lists-planned) · `Added: 2026-07-18`
- [ ] **T22 — SRS review mode**: FSRS scheduler in `packages/core`, review UI (front/back with furigana toggle), per-list and all-due review. · [spec](SPEC.md#practice-lists-planned) · `Added: 2026-07-18`
- [ ] **T23 — Stroke-order practice (trace mode)**: writing canvas + KanjiVG stroke engine in `packages/core` (shared with dictionary draw-input T32): faint template, stroke-order cues, per-stroke match on order/direction/shape tolerance. Runs as a card type inside T22 review for kanji items. · [spec](SPEC.md#practice-lists-planned) · `Added: 2026-07-18`
- [ ] **T24 — Stroke-order practice (blind recall)**: no template shown; stroke-by-stroke live judgment (accept / wrong-order / wrong-direction / malformed) with nudge + reveal-next-stroke hint; writing grade feeds FSRS separately from recognition grade so read-but-can't-write kanji stay in rotation. · [spec](SPEC.md#practice-lists-planned) · `Added: 2026-07-18`

### Dictionary
- [ ] **T30 — Dict pipeline + bundled SQLite**: `packages/dict-pipeline` builds dict.sqlite from JMdict + KANJIDIC2 + RADKFILE + KanjiVG; licences/attribution screen. · [spec](SPEC.md#dictionary-planned) · `Added: 2026-07-18`
- [ ] **T31 — Search (typed)**: kana/kanji/romaji/English lookup with ranked results; entry view (readings, meanings, compounds, examples, stroke-order animation from KanjiVG). · [spec](SPEC.md#dictionary-planned) · `Added: 2026-07-18`
- [ ] **T32 — Draw-the-kanji input**: canvas + KanjiVG-based stroke recognition, candidates ranked live as you draw. · [spec](SPEC.md#dictionary-planned) · `Added: 2026-07-18`
- [ ] **T33 — Radical picker**: RADKFILE-driven component picker, narrows candidates as radicals are selected. · [spec](SPEC.md#dictionary-planned) · `Added: 2026-07-18`
- [ ] **T34 — Confusables view**: similar-kanji dataset (stroke-edit-distance over KanjiVG + curated pairs), side-by-side render with differing components color-highlighted. · [spec](SPEC.md#dictionary-planned) · `Added: 2026-07-18`

### AI Practice
- [ ] **T40 — Privacy chooser + capability gate**: first-run explainer (cloud vs local), device capability check (A17 Pro+/iOS 18+), minimum-specs screen, "too embarrassed?" onboarding copy. · [spec](SPEC.md#ai-practice-planned) · `Added: 2026-07-18`
- [ ] **T41 — Cloud conversation (text)**: scenario input (free text + category presets), list-item injection, turn-based chat with Claude via API, on-brand illustrated AI character with states (listening/thinking/speaking). · [spec](SPEC.md#ai-practice-planned) · `Added: 2026-07-18`
- [ ] **T42 — Voice mode**: on-device STT + TTS wired into T41's loop; audio never leaves device. · [spec](SPEC.md#ai-practice-planned) · `Added: 2026-07-18`
- [ ] **T43 — Local model (Apple Intelligence)**: Expo native module over Foundation Models; same conversation UX fully offline. · [spec](SPEC.md#ai-practice-planned) · `Added: 2026-07-18`

### Self-trained SLM (packages/slm)
- [ ] **T71 — Quality training run**: regenerate a larger corpus (2k+ examples, more categories, real-document style variety), full hyperparameter sweep via kotrain, target eval score > baseline by a wide margin on an expanded eval set (more curated idiom cases, human-spotchecked). Consider qwen3.6-27b relabeling overnight for an Apache-pure dataset. · `Added: 2026-07-19`
- [ ] **T72 — Export + serve tuned model**: merge best LoRA, convert to GGUF (llama.cpp), load in LM Studio/Ollama, add `TRANSLATE_BACKEND=lmstudio` (OpenAI-compatible) to `apps/api/src/translate/backends.ts` using the shared prompt contract from `packages/slm/common.py`, verify `/translate` end to end. · `Added: 2026-07-19`

### Billing, sync, i18n, launch
- [ ] **T50 — RevenueCat plans + paywall**: free/premium entitlements, $20 monthly + $168 annual products, on-brand paywall, restore purchases. · [spec](SPEC.md#plans--billing-planned) · `Added: 2026-07-18`
- [ ] **T51 — Auth + premium cloud sync**: Supabase Apple sign-in, sync engine for lists/review state (local wins, last-write-merge), gated on premium entitlement. · [spec](SPEC.md#plans--billing-planned) · `Added: 2026-07-18`
- [ ] **T52 — i18n**: i18next setup, 10 launch locales, language setting in Settings, localized practical-translation output language. · [spec](SPEC.md#multi-language-ui-planned) · `Added: 2026-07-18`
- [ ] **T53 — EAS build + TestFlight**: iOS build pipeline, app icons/splash in sketchbook brand. · [spec](SPEC.md#platforms-planned) · `Added: 2026-07-18`
- [ ] **T54 — Android pass**: ML Kit OCR, billing, local-model story TBD. · [spec](SPEC.md#platforms-planned) · `Added: 2026-07-18`

## Done / Shipped

- [x] **T60 — Marketing site at mynichi.app**: new `apps/web` (Vite + React + TS + Tailwind v4; GSAP ScrollTrigger reveals + brush-underline draw-ins, Lenis smooth scroll, Vanta fog hero over three.js 0.134, Klee One / Zen Kaku Gothic New, light+dark via prefers-color-scheme). Interactive demos with real data: translate (3 canned real-pipeline outputs incl. the verified 巻きで case, typewriter input, tap-to-save words), dictionary (KanjiVG stroke animation for 毎/日, draw-日-yourself board judging each stroke's order/direction/shape by resampled mean-distance against KanjiVG geometry, 未/末 confusables with pulsing highlighted diff strokes), lists (capture → enrichment shimmer → SRS flip + grading), AI practice (scripted dentist call, cloud/on-device privacy toggle, injected list words highlighted). Live app embedded via iframe in a phone frame. Comparison: tabbed landing section + standalone /vs/{duolingo,anki,google-translate,jisho} pages (extra Vite entries, one shared ○/△/✕ table + honest prose). Pricing + download section (App Store badge → TestFlight-notify mailto until T53; `APP_STORE_URL` constant to flip). Deploy: expo baseUrl /app, `build:site` turbo pipeline + `scripts/build-site.mjs` merge, vercel.json root `dist/` + redirects. Footer carries KanjiVG (CC BY-SA) + EDRDG attribution. Verified locally end to end (all demos exercised incl. synthetic-pointer stroke judgment; dark tokens + fonts confirmed). · [spec](SPEC.md#marketing-site-mynichiapp-shipped) · `Done: 2026-07-19`
- [x] **T10 — Paste/type translate flow**: `POST /translate` on the API runs kuromoji segmentation (furigana fitting via `packages/core` `fitFurigana`, unit-tested; romaji via wanakana) in parallel with the SLM pipeline (`apps/api/src/translate/backends.ts`: PLaMo-2-translate produces the reference translation, Shisa V2.1 8B writes literal+practical JSON grounded on it, `think:false` + Ollama structured outputs; `TRANSLATE_BACKEND=anthropic` switches to Claude via the official SDK). Translate tab is a working RSD screen (`app/(tabs)/index.tsx` + `components/ruby-text.tsx`): textarea in, ruby-annotated original + romaji + literal + practical out, loading/error/empty states. Verified in-browser end to end (grounding confirmed: 「巻きで」 translated correctly through the full stack). Known limits: kuromoji misreads some prefixed compounds (ご入店 -> "go iri ten"; revisit with dictionary-backed readings in T30/T31), and prod web shows a friendly "engine not connected" until the API is hosted (GPU serving open thread). · [spec](SPEC.md#translate-ocr-photo--live-in-progress) · `Done: 2026-07-18`
- [x] **T3 — Web deploy**: Vercel project `mynichi` (nekkolabs team), production deploy from `expo export -p web` (vercel.json: bun install, cleanUrls, `apps/native/dist`), GitHub repo connected for auto-deploys on merge to main, `mynichi.app` + `www.mynichi.app` assigned and DNS verified live (200 on /, /practice). `*.vercel.app` URLs stay behind Vercel deployment protection by design; the custom domain is the public URL. · [spec](SPEC.md#platforms-planned) · `Done: 2026-07-18`
- [x] **T2 — Design tokens + app shell**: sketchbook tokens in `apps/native/src/theme/` (`tokens.css.ts` StyleX vars with dark mode via media-query defaults + `tokens.ts` for RN chrome), Klee One / Zen Kaku Gothic New via expo-google-fonts, 5-tab expo-router shell with RSD `FeatureScreen` placeholders (ruby reading, brush underline, chips). Verified on web export: fonts load, StyleX CSS extracted, tab navigation works, dark tokens apply. · [spec](SPEC.md#user-journeys--experiences) · `Done: 2026-07-18`
- [x] **T1 — Monorepo scaffold**: bun workspaces + turbo (pathtraveled shape); `apps/native` Expo SDK 57 + expo-router + react-strict-dom 0.0.55 (babel preset + postcss plugin + `@react-strict-dom` directive in global.css); `apps/api` Bun + Hono `/health`; `packages/core` stub. Repo `nekko-labs/mynichi` (private). Gotchas recorded in workspace memory (babel-preset-expo must be explicit; StyleX vars files are `*.css.ts`; relative token imports only). · [spec](SPEC.md#platforms-planned) · `Done: 2026-07-18`
- [x] **T0 — Spec-driven scaffold**: SPEC.md + TASKS.md written (this pair), workspace layer created at `obsurdian/projects/mynichi/`. · `Done: 2026-07-18`
