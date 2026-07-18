# mynichi

**my日 — your daily life in Japan, becoming your Japanese.**

mynichi is a Japanese learning app for people *living* in Japan. No courses, no streaks, no curriculum someone else decided: you capture the Japanese your day hands you, understand it, and practice it safely.

- **Translate**: photo/OCR translate with kanji, furigana, pronunciation, literal and practical translations
- **Practice lists**: Anki-style lists organized by life category (work, health, real estate, ...) built for 5-second capture
- **Dictionary**: draw kanji, pick radicals, and see confusable kanji with their differences highlighted
- **AI practice**: "Too embarrassed to practice in front of another person?" Talk to an illustrated AI partner, with a privacy-first choice of our no-training cloud model or a fully offline on-device model
- **10 UI languages**, native iOS first, web at [mynichi.app](https://mynichi.app)

## Docs

- [SPEC.md](SPEC.md): what we're building and why (source of truth)
- [TASKS.md](TASKS.md): technical plan + task checklist
- [AGENTS.md](AGENTS.md): rules for AI agents working in this repo

## Stack

Bun + Turborepo monorepo. Expo (React Native + react-strict-dom) app targeting iOS/Android/web from one codebase, Bun + Hono API, bundled SQLite dictionary (JMdict/KANJIDIC2/KanjiVG), Supabase (auth/sync), RevenueCat (billing), Claude (translation + conversation).

## Develop

```sh
bun install
bun run dev:web    # web
bun run dev:api    # API
bun run dev:ios    # iOS (macOS)
```
