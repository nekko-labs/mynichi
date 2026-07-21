# mynichi API (apps/api) — Bun + Hono. Deployed to Fly.io.
#
# Build context is the repo root (a Bun workspace). We copy ONLY the two
# workspace members the API needs — apps/api and packages/core — so the
# workspace globs resolve to just those and the heavy app deps (expo,
# react-native, vite) never enter the image.
FROM oven/bun:1.3-slim AS base
WORKDIR /app

# Manifests first so the install layer caches across source-only changes.
# Only api + core dirs are present, so `apps/*` / `packages/*` glob to those.
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY packages/core/package.json packages/core/package.json
# Not --frozen-lockfile: the lockfile describes the full 5-member workspace,
# but this image intentionally builds only the API subset.
RUN bun install

# Source (@mynichi/core is consumed from source via its "main": src/index.ts).
COPY packages/core packages/core
COPY apps/api apps/api

ENV NODE_ENV=production
ENV PORT=8080
# The free-tier SLM (Ollama) can't run in this container; the hosted API uses
# Claude. Point it at a self-hosted SLM later by overriding these with
# `fly secrets set TRANSLATE_BACKEND=ollama OLLAMA_URL=...`.
ENV TRANSLATE_BACKEND=anthropic

EXPOSE 8080
CMD ["bun", "apps/api/src/index.ts"]
