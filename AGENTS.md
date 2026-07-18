# Agents Guide — mynichi

Canonical entrypoint for any AI agent working in this repo. Read it first.

## What this project is

**mynichi** (my日 / 毎日) is a Japanese learning app for people living in Japan: capture the Japanese your day hands you (photo OCR translate, quick-add practice lists), understand it (dictionary with kanji drawing, radicals, confusables), and practice it safely (privacy-first AI conversation, local or cloud). Native iOS first, Android and web (mynichi.app) from the same codebase. Currently in initial scaffold phase.

## Where to look

This project is **spec-driven** (see `../obsurdian/AGENTS.md` for the full methodology):

- **[SPEC.md](SPEC.md)**: the source of truth. What we're building and why: vision, users, journeys, every feature. **Update it every time you build or change a feature.**
- **[TASKS.md](TASKS.md)**: the technical plan (stack, architecture, data model, design system, conventions, constraints) + the task checklist (Now / Backlog / Shipped).
- **Workspace layer** (README, per-feature deep dives, project memory) lives in `../obsurdian/projects/mynichi/`. Check its `memory.md` before re-asking settled questions.

## Ground rules

- **The cardinal rule**: every change to features or behavior updates `SPEC.md`; technical-approach changes update the plan half of `TASKS.md`; work items get checked off with a `Done:` date in the task list.
- **Git**: every change ships as a PR with auto-merge enabled (merge commit). Never commit directly to main.
- **Writing style**: never use the em dash ("—") anywhere: docs, comments, commit messages, UI copy.
- **Design**: follow the "sketchbook" design system in `TASKS.md` (Design System & UI/UX). Minimal borders, paper background, feature-accent colors, Klee One + Zen Kaku Gothic New. No generic SaaS chrome.
- **Privacy is a product feature**: never add analytics/logging that ships user text or voice content; local mode must stay genuinely offline; voice audio is never persisted server-side.
- **Code**: TypeScript strict; RSD-first UI (react-strict-dom `html.*`), RN fallbacks wrapped in `components/`; Japanese-text utilities only in `packages/core`; zod at API boundaries.

## Layout

```
apps/native   Expo app (iOS first, Android + web export): expo-router routes in app/
apps/api      Bun + Hono API (model orchestration: translate, enrich, practice)
packages/core shared types, zod schemas, jp-text utils, SRS scheduler
packages/dict-pipeline  builds the bundled dictionary SQLite from JMdict/KANJIDIC2/KanjiVG
```

## Commands

```
bun install            # at repo root (bun workspaces)
bun run dev:web        # Expo web dev server
bun run dev:ios        # Expo iOS (needs macOS)
bun run dev:api        # Bun + Hono API with watch
bun run build:web      # static web export (what Vercel deploys)
bun test               # package/api tests
```
