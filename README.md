# PaperGraph AI

PaperGraph AI is a web MVP for turning research papers into a daily curiosity feed, paper insight cards, a living graph, cited assistant answers, social reposts, and weekly advisor memos.

The product plan lives in:

- `codex-plan.md`
- `codex-workstreams.md`
- `PaperGraph_AI_Codex_Build_Plan_v2.md`

## Current Setup

This repository is scaffolded as an npm workspace:

```txt
apps/web       Next.js web MVP
docs           Product, UI, and demo implementation notes
packages       Future shared contracts and utilities
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the web app:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Build Checks

```bash
npm run typecheck
npm run build
```

## Known Setup Note

`npm audit` currently reports a moderate `postcss` advisory through `next@15.5.16`. The safe `postcss@8.5.10` package is pinned directly, but Next still declares an internal `postcss@8.4.31` dependency. Do not run `npm audit fix --force`; npm currently proposes downgrading Next to `9.3.3`, which is not a valid fix for this app. Re-check this after the next patched Next release.

## MVP Implementation Order

1. Keep the mock-first UI demo complete and coherent.
2. Add durable shared API contracts for papers, graph, assistant, thesis validation, and reposts.
3. Add a backend service for metadata resolution with mocked fallback.
4. Add persistence for profile, papers, graph nodes, reposts, and memos.
5. Replace mock UI services incrementally with real endpoints.
6. Add Playwright smoke tests around the demo path.
