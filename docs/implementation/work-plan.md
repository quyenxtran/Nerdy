# Implementation Work Plan

## Phase 1: Mock-First Web Demo

- Keep all current mock data in `apps/web/lib/mock-data.ts`.
- Make the current UI path smooth across desktop and mobile.
- Add local component tests for feed actions, thesis report rendering, and share preview rendering.
- Add Playwright smoke test for landing -> cockpit -> feed -> paper -> graph -> assistant -> thesis.

## Phase 2: Contracts And Persistence

- Add shared TypeScript contracts for Paper, PaperCard, FeedItem, GraphNode, GraphEdge, Repost, ThesisValidation, Profile, and AssistantAnswer.
- Add Prisma schema for the MVP models described in `codex-workstreams.md`.
- Add Docker Compose with `pgvector/pgvector:pg16`.
- Add seed data matching the current mock UI.

## Phase 3: Backend Services

- Add metadata resolver endpoints for DOI, arXiv, OpenAlex, Semantic Scholar, and mock fallback.
- Add graph node and edge endpoints.
- Add repost and reaction endpoints.
- Add thesis validation mock endpoint that returns confidence-labeled reports.
- Add assistant endpoint with mock provider when no AI key is configured.

## Phase 4: Replace Mocks Incrementally

- Replace feed data with API calls.
- Replace paper detail data with persisted cards.
- Replace graph data with persisted graph nodes and edges.
- Replace assistant response with context builder plus mock/real model provider.
- Replace thesis report with seeded retrieval plus provider wrapper.

## Phase 5: Reliability And Demo Readiness

- Add loading, empty, and error states.
- Add request timeout and fallback handling for external scholarly APIs.
- Add privacy checks for share previews and thesis pages.
- Add README setup path from fresh clone to demo.

## Quality Bar

- `npm run typecheck` passes.
- `npm run build` passes.
- The main demo path works without external API keys.
- No AI-generated claim is shown without source context or uncertainty.
