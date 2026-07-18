# mynichi-app

The mynichi client: one Expo codebase targeting iOS (first), Android, and web (static export). See the repo root [README.md](../../README.md), [SPEC.md](../../SPEC.md), and [TASKS.md](../../TASKS.md).

- `src/app/` expo-router routes (5 tabs: Translate, Lists, Dictionary, Practice, Settings)
- `src/components/` RSD-first shared components (react-strict-dom `html.*`)
- `src/theme/` design tokens: `tokens.css.ts` (StyleX vars for RSD, dark mode via media query) + `tokens.ts` (plain tokens for RN chrome). Keep them in sync.

```sh
bun run dev:web     # web dev server on :4310
bun run dev:ios     # iOS (macOS only)
bun run build:web   # static export to dist/ (what Vercel serves)
```
