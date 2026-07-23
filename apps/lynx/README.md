# mynichi on Lynx (proof of concept)

ReactLynx port of the Dictionary screen: the T70 proof-of-concept for the
staged LynxJS migration (see the Key Technical Decision dated 2026-07-24 and
tasks T70-T75 in [TASKS.md](../../TASKS.md)).

## What it proves

- ReactLynx + rspeedy builds inside the bun/turbo monorepo.
- One source tree outputs both `dist/main.lynx.bundle` (native, for
  LynxExplorer / an embedded LynxView) and `dist/main.web.bundle`
  (Lynx for Web).
- The sketchbook design tokens express as plain CSS.
- Input, list rendering, and tap state work end to end (verified in-browser
  through `@lynx-js/web-core`).

## Commands

```bash
bun install          # from the repo root
bun run build        # builds both bundles into dist/
bun run dev          # dev server + QR code for the LynxExplorer app
```

## Browser preview

`bun run build`, then copy the prebuilt web runtime and the harness page and
serve `dist/`:

```bash
cp -r node_modules/@lynx-js/web-core/dist/client_prod/static dist/static
cp web/index.html dist/index.html
bunx serve -l 4340 dist
```

The web-core client loads its async chunks and wasm from `/static/...`, so it
must be served at that exact path.

## Migration gotchas learned here

- Lynx `<input>` is uncontrolled: no `value` prop; read from `bindinput`
  (`e.detail.value`), write with the `setValue` UI method.
- The create-rspeedy tsconfig needs `"lib": ["ES2020"]` for modern string
  methods.
- `bun build` cannot bundle `@lynx-js/web-core/client` (it uses `?inline` CSS
  imports); use the shipped `client_prod` static bundle instead.
- On web, Lynx renders shadow-DOM web components (`x-view`, `x-text`,
  `raw-text`); browser-side tests must pierce shadow roots.
