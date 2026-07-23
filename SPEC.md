---
status: active
last-updated: 2026-07-19
owner: Philip
---

# Spec — mynichi

> **This is the source of truth for the project.** It describes *what* we're building and *why*: vision, users, journeys, the feature set, and what success looks like. It is **not** about stack or technical design (that's `TASKS.md`). It is a **living artifact**: every prompt that adds or changes a feature updates this file so it always describes the system as it actually is and intends to be.

## Vision

**mynichi** (my日, a play on 毎日 "mainichi", every day) is a Japanese learning companion for people *living* in Japan, not people taking a course about it. Most Japanese apps are built around constant progression: lesson 1, lesson 2, streaks, a curriculum someone else decided. mynichi flips that. Your daily life IS the curriculum. The letter from city hall, the word your coworker used at lunch, the sign at the clinic: mynichi helps you capture it, understand it, and actually keep it.

The core feelings the product sells: **relief** ("I can deal with this document"), **safety** ("I can practice without being embarrassed or having my data harvested"), and **quiet daily progress** ("the Japanese around me is slowly becoming mine").

## Why It Exists

- People living in Japan drown in real-world Japanese (mail, forms, menus, conversations) that course apps never cover in the order life throws it at them. Duolingo/WaniKani/Anki are progression- or deck-centric; they don't start from *your* day.
- The existing toolchain is fragmented: Google Translate for photos, Midori/Jisho for lookup, Anki for review, a tutor (expensive, scheduling, embarrassment) for speaking. mynichi is those four tools as one coherent, beautiful app whose pieces feed each other: a word you photograph can become a list item, which can become an AI conversation.
- Speaking practice has two blockers mynichi attacks head-on: **embarrassment** (practicing in front of a real person is scary; "too embarrassed to practice in front of another person?" is our hook) and **privacy fear** (voice cloning, data used for training). We answer with a clearly explained choice: our privacy-respecting cloud model, or a fully offline on-device model.

## Who It's For

- **Primary**: foreign residents of Japan (working professionals, spouses, students) at N5-N2 level who need Japanese for *living*: ward office, hospital, real estate, work chat, konbini. They already have fragments; they need capture + understanding + practice.
- **Secondary**: frequent visitors and remote learners who want life-Japanese rather than curriculum-Japanese, and advanced learners who want a fast dictionary with kanji drawing and confusable-kanji disambiguation.
- Switching from: Google Translate (photo), Jisho/Midori/Shirabe Jisho (dictionary), Anki (review), iTalki/tutors (speaking), or nothing at all (paralysis).

## User Journeys & Experiences

**1. The scary letter (Translate).** A pension notice arrives. You open mynichi, snap a photo (or pick one from your library, or paste text). The app OCRs it and shows the original text with furigana, romaji pronunciation, a literal English translation, and a practical "what this actually means / what you should do" translation. You tap the two or three words worth keeping and add them to your "City hall / paperwork" list in one gesture.

**2. The word you overheard (Lists).** A coworker says 「納期」 and you nod along, clueless. On the train home you open mynichi and add it to your "Work" list in five seconds: the app fills in the reading, meaning, and an example sentence for you. Lists are organized by life category (life admin, work, real estate, health, tech, food, ...), not by JLPT level. Later, you review the list Anki-style with spaced repetition. For kanji, review demands your hand as well as your memory: trace the character with stroke-order guidance, or go blind and draw it from nothing, with the app responding to every stroke as it lands (right stroke, wrong order, wrong shape) so you feel the correction mid-character instead of after. The point is never "here are 2,000 random words"; it's "here are the words *your* life handed you."

**3. What IS that kanji (Dictionary).** A sign has a kanji you can't type. You draw it with your finger and the app recognizes it. Or you type the English meaning or romaji pronunciation. Or you build it from radicals with a friendly radical picker. The entry shows readings, meanings, stroke order, and compounds, and a "confusables" panel: kanji that look similar (e.g. 未/末, 待/持) shown side by side with the differing radicals/strokes color-highlighted so you finally see the difference.

**4. The safe conversation (AI Practice).** Tomorrow you have to call the dentist. You open AI Practice, type or speak the scenario ("reschedule a dentist appointment"), or pick one from a category. A visual AI character speaks with you, turn by turn, voice or text. You can feed it words from your study lists (a few, or a whole list) so the conversation drills exactly what you're learning. Before your first session, the app plainly explains the privacy choice: our cloud model (never trains on your data, voice never stored) or a fully offline on-device model (with clear minimum device specs). "Too embarrassed to practice in front of another person?" This is the judgment-free room.

**5. Going premium (Billing).** Free covers daily capture: translate, lists, dictionary, and on-device AI practice. Premium (¥/$20 per month, or $14 per month billed yearly) unlocks the higher-quality cloud model (same privacy promise) and cloud sync across devices. Upgrade happens in-app with native billing on iOS and card billing on web.

**6. In your language (Multi-language).** The app UI and translations work from English, German, Chinese, Spanish, Portuguese, French, Italian, Tagalog, Thai, and Korean, switchable in Settings. Japan's foreign residents are not all English speakers.

**The feel.** Minimal and clean: generous whitespace, few borders, no chrome. But colorful and artistic: a hand-drawn, illustrated warmth (think ink-and-wash meets modern flat illustration) so it feels like a sketchbook of your life in Japan, not a SaaS dashboard.

## What Success Looks Like

- **Capture habit**: a user adds 3+ items to lists per week from real life (photo, overheard, lookup). Retention beats streak-guilt apps because the input is intrinsically motivated.
- **The letter test**: a new user can go from "scary document photo" to "I understand this and saved the key words" in under two minutes, first try.
- **Practice conversion**: users who are "too embarrassed to speak" complete AI conversations they would never have had; qualitatively, reviews mention feeling safe.
- **Business**: healthy free-to-premium conversion driven by cloud model quality + sync (target 3-5%), App Store rating 4.7+, sustainable MRR without dark patterns.

## Feature Set

### Translate (OCR photo / live) [in progress]
- Paste or type Japanese text and translate it. [shipped]
- Results view shows: original text (kanji), furigana over the kanji runs, romaji pronunciation, literal English translation, and a practical translation ("what it really means / what to do"). [shipped]
- Take a photo or pick an existing photo; OCR extracts the Japanese and feeds the same results view. [planned]
- Privacy-respecting model policy: free-tier translation runs on a model we trained and host ourselves (a compact, license-clean SLM; no third-party API sees your text); premium uses a frontier model with the same no-training promise. The free-tier model is tuned so idiom-heavy resident Japanese lands correctly (e.g. 「納期ちょっと巻きで」 = bring the deadline *earlier*, never *extend* it). [free-tier engine built; wired into the API]
- Copy any layer; tap any word/phrase to add it to a practice list or open it in the dictionary. [planned]
- Live camera translate mode (Google Translate style overlay). [planned, after still-photo flow]

### Practice Lists [in progress]
- Create lists organized by life category (life admin, work, real estate, health, tech, food, travel, ...); custom categories supported. [shipped]
- Quick-add in seconds: type the Japanese and the reading, furigana, meaning, and an example sentence fill themselves in. Instant and offline from the bundled dictionary for common words; for words it misses (e.g. 納期) the app auto-enriches from the API (`/enrich`: reading + furigana via kuromoji, meaning + example via Claude). Romaji typed into the reading field converts to kana live, and every field stays editable. Manual entry is the offline fallback when neither the dictionary nor the API can help. [shipped]
- Search-as-you-type capture: typing part of a word in English, romaji, kana, or kanji into the capture box surfaces matching dictionary words and phrases (word + reading + meaning) that add to the list in one tap; the as-written capture path stays one button away for anything the dictionary misses. [shipped]
- Items can be kanji, words, phrases, or grammar points (kind auto-guessed on capture). [shipped]
- Items and review state live on-device (local-first); nothing leaves the phone. [shipped]
- Spaced-repetition review (Anki-style) per list: card flip with furigana, Again/Hard/Good/Easy grading, due counts on every list. [shipped; cross-list review planned]
- **Stroke-order practice** as a first-class part of spaced repetition for kanji items. [planned]
  - Guided trace mode: the kanji is shown faintly with stroke-order cues; you trace it correctly. [planned]
  - Blind recall mode: nothing is shown; you draw the kanji from memory and the app responds **stroke by stroke** (correct, wrong order, wrong direction, malformed shape) with gentle nudges or a reveal-next-stroke hint. [planned]
  - Writing performance feeds the SRS schedule alongside recognition (a kanji you can read but not write stays in rotation). [planned]
- Items link back to their source (photo translation, dictionary lookup) when they came from one. [planned]

### Dictionary [in progress]
- Lookup by Japanese (kana/kanji/romaji) or English meaning, fully offline over a bundled starter dictionary of ~22,600 common JMdict words; one-tap add to a practice list. [shipped]
- Save anywhere: an entry can be added to any existing list, or to a brand-new list created inline (name + life category) without leaving the dictionary. [shipped]
- Full offline dictionary (complete JMdict + kanji data as bundled SQLite) replacing the starter set. [planned]
- **Draw the kanji** with your finger to find it (handwriting recognition). [planned]
- Radical picker to build up a kanji from parts. [planned]
- Entry view: readings, meanings, stroke order animation, common compounds, example sentences, JLPT/frequency info. [planned]
- **Confusables**: similar-looking kanji shown side by side with the differing components color-highlighted. [planned]

### AI Practice [in progress]
- Privacy-first framing, shown before first use: choose **our cloud model** (no training on your data, voice never stored) or a **local offline model** on capable devices (Apple Intelligence; minimum specs listed in-app: iPhone 15 Pro / A17 Pro or later, iOS 18+; arrives with the iOS app). [shipped]
- Practice a scenario by typing it freely, or pick from scenario presets (dentist call, ward office, izakaya order, apartment viewing, konbini, work small talk). [shipped; speaking the scenario planned]
- Select a practice list to weave its words into the conversation. [shipped]
- Turn-based text chat: the partner replies in short natural Japanese with an English gloss, gentle corrections, and a "try saying this" hint chip. Cloud turns run Claude behind our API. [shipped; live in prod once the API is hosted]
- A visual AI character (illustrated, on-brand) with listening/thinking/speaking states; voice mode. [planned]
- Marketing/onboarding hook: "Too embarrassed to practice in front of another person?" [shipped]

### Plans & Billing [planned]
- **Free**: translate, lists, dictionary, local AI practice. [planned]
- **Premium**: higher-quality cloud model (same privacy promise) + cloud sync across devices. $20/month, or $14/month billed annually ($168/year). [planned]
- Native IAP on iOS, card billing on web; one subscription works everywhere. [planned]

### Marketing site (mynichi.app) [shipped]
- Interactive marketing landing at the root of mynichi.app; the web app itself lives at mynichi.app/app/ (old tab URLs redirect). [shipped]
- Sells by showing: every distinct feature has a live in-page demo rather than screenshots. [shipped]
  - Translate demo with three real-life samples (work chat 巻きで, pension letter, door sign) rendering the four layers (furigana ruby, romaji, literal, practical) from real pipeline outputs, plus tap-a-word-to-save. [shipped]
  - Dictionary demo on real KanjiVG data: stroke-order animation, a draw-it-yourself board with per-stroke judgment (order, direction, shape), and the 未/末 confusables view with differing strokes highlighted. [shipped]
  - Lists demo: five-second capture with auto-enrichment, then an SRS card flip with grading. [shipped]
  - AI Practice demo: the scripted dentist call with the cloud/on-device privacy chooser and list-word injection, fronted by the "too embarrassed?" hook. [shipped]
- The real app embedded live in a phone frame ("this is not a mockup"). [shipped]
- Honest comparison pages at /vs/duolingo, /vs/anki, /vs/google-translate, /vs/jisho (plus a tabbed section on the landing): what each tool is good at, where life in Japan needs more, feature-by-feature ○/△/✕ table. [shipped]
- Pricing section (free vs premium with monthly/yearly toggle) and a download section: App Store badge routes to a TestFlight-notify flow until the store listing exists, web app CTA works today. [shipped]
- Sketchbook design language shared with the app (paper/ink/dark tokens, Klee One + Zen Kaku Gothic New, marker-stroke underlines), plus ink-fog hero, smooth scrolling, scroll reveals. KanjiVG/EDRDG attribution in the footer. [shipped]
- Hero: text sits center-left with an auto-playing app demo reel in a phone frame on the right (capture → understand → keep, looping gif-style; stacks under the text on mobile), and the brand wordmark itself teaches the pun by rotating My Nichi → My 毎日 → MaiNichi → 毎日. [shipped]

### App shell & navigation [shipped]
- Full-height app shell with a custom bottom tab bar: one kanji per feature (訳帳辞話設), colored with the feature accent when active, English label beneath; correct in light and dark mode. [shipped]
- Desktop web is a real desktop experience, not a phone column: at 900px and up the tab bar becomes a left side rail (brand mark on top), content widens to a 1000px column, lists and dictionary results flow into a two-column grid, and translate results show the Japanese and the explanations side by side. Below 900px (and on native) the phone layout applies. [shipped]
- Every screen shares the sketchbook scaffold: kana reading over a big Klee One heading with an accent brush stroke, scrollable body, safe-area aware, back navigation on pushed screens. [shipped]
- Settings is a real screen: language preview, appearance note, privacy promises, dictionary licence attribution (EDRDG/JMdict, KanjiVG), version, feedback link. [shipped]

### Multi-language UI [planned]
- UI + translation target languages at launch: English, German, Chinese, Spanish, Portuguese, French, Italian, Tagalog, Thai, Korean. Set in Settings; defaults to device locale. [planned]

### Platforms [planned]
- **Native iOS app first** (App Store), then Android. [planned]
- Web app (mobile + desktop responsive) at mynichi.app/app/, sharing the same codebase; the mynichi.app root is the marketing site. [shipped]

## Scope Boundaries

- **Not a course.** No lesson plans, no level gates, no "unit 4". Structure comes from the user's life categories.
- **No social features** (leaderboards, friends, public profiles) at launch. The embarrassment-free promise extends to no social pressure.
- **No human tutor marketplace.** AI practice is the speaking product.
- **Not a JLPT prep app**, though JLPT metadata may appear on dictionary entries.
- **No guilt mechanics**: no streak-shaming, no loss-aversion notifications.
- **Japanese only** as the target language (the *from* language is multi-language; we are not building a general language platform).

## Open Questions

- Android timing for AI Practice's local model (no Apple Intelligence; Gemini Nano / on-device alternatives?).
- Voice for the AI character on the cloud path: which TTS respects the "voice never stored, never cloned" promise best?
- Live camera overlay translate: ship at launch or fast-follow? (Currently fast-follow.)
- Exact free-tier limits (e.g. photo translations/day) to make premium compelling without crippling capture.
- JPY pricing display for Japan-resident users ($20/$14 USD equivalent, or native JPY price points).
