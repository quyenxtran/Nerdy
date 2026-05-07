# PaperGraph AI — Parallel Codex Workstreams for First Website

**Purpose:** Give Codex and multiple subagents a concrete execution plan to build the first working PaperGraph AI website from the broader product plan in `codex-plan.md`.

**Target outcome:** A usable web MVP where a user can create a research profile, paste/upload papers, see an AI-style paper feed, save/share papers, view a simple knowledge graph, and ask questions against saved paper notes.

**Build mode:** Contract-first, parallel workstreams. Each subagent owns a bounded folder or feature slice to avoid merge conflicts.

**Recommended first website positioning:**

> PaperGraph AI helps researchers discover papers, validate ideas, and build a living social knowledge graph from what they read, save, question, and share.

---

## 0. Ground Rules for Codex/Subagents

### 0.1 Workstream rules

1. **Do not let multiple agents edit the same files at the same time.**
2. **Start with shared contracts:** database schema, API route contracts, TypeScript types, and design tokens.
3. **Every workstream must produce a runnable/checkable artifact.**
4. **Prefer mocked data first, then connect real backend.**
5. **Each subagent should include tests or manual acceptance checks.**
6. **Keep the MVP web-first, not mobile-native.**
7. **Do not build full social network complexity in v0.** Build enough sharing to show the behavior.
8. **Use feature flags for unfinished AI/news/profile imports.**
9. **Never block the entire build on one external API.** Use mock data and graceful fallbacks.

### 0.2 Suggested repo structure

If starting from an empty repo:

```txt
papergraph-ai/
  README.md
  codex-plan.md
  codex-workstreams.md
  package.json
  pnpm-workspace.yaml
  apps/
    web/                    # Next.js frontend
    api/                    # FastAPI backend
  packages/
    shared/                 # Shared TS types, schemas, constants
  infra/
    docker-compose.yml
    postgres/
  docs/
    product/
    api/
    prompts/
  scripts/
    seed_demo_data.py
    reset_dev_db.sh
```

If using a single app repo for speed:

```txt
papergraph-ai/
  app/                      # Next.js app router
  components/
  lib/
  prisma/
  api/                      # FastAPI backend or Next API routes
  scripts/
  docs/
```

### 0.3 Recommended stack for the first website

**Fastest full-stack MVP:**

```txt
Frontend: Next.js + TypeScript + Tailwind + shadcn/ui
Backend: FastAPI Python service for paper ingestion, LLM calls, and search
Database: Postgres + pgvector
ORM: Prisma for app tables, SQLAlchemy optional for Python service
Auth: Clerk, Supabase Auth, or NextAuth
Queue: simple background task first; Celery/RQ later
Graph: start with relational graph tables + React Flow/Cytoscape visualization
LLM: OpenAI-compatible provider wrapper with mock fallback
Paper metadata: Semantic Scholar/OpenAlex/Crossref/arXiv wrappers, mocked first
```

**MVP simplification:** Do not use Neo4j in v0. Store graph nodes and edges in Postgres first. Neo4j can be added later if graph traversal becomes central.

---

## 1. MVP Website Definition

### 1.1 Required v0 pages

Build these first:

```txt
/                         Landing page
/app                      Main authenticated dashboard
/app/feed                 Daily curiosity paper feed
/app/papers/[id]          Paper detail page
/app/graph                Personal knowledge graph
/app/assistant            Chat with saved papers/wiki
/app/thesis-validator     Thesis novelty/overlap validator
/app/profile              Researcher profile and imports
/app/share/[postId]       Public share preview page
```

### 1.2 Required v0 user actions

```txt
Create profile
Paste DOI/arXiv/Semantic Scholar/OpenAlex URL
Upload or paste paper text/PDF later
Generate paper cards
Save paper
Heart paper
Repost paper with note/question
Ask AI about saved papers
View simple graph
Enter thesis idea and get overlap/novelty mock report
Generate weekly advisor memo from saved papers
```

### 1.3 v0 non-goals

Do **not** build these yet:

```txt
Full mobile app
Full Google Scholar scraper
Full public social network
Recommendation model training
Complex moderation system
Full PDF figure extraction
Neo4j production graph
Real-time collaborative editing
Payment system
```

---

## 2. Parallel Workstream Map

### 2.1 Dependency overview

```txt
Phase A: Foundation
  A1 Product/design system
  A2 Repo/database/contracts
  A3 Mock data and seed scripts

Phase B: Parallel feature build
  B1 Landing and marketing website
  B2 Dashboard/feed UI
  B3 Paper detail and card UI
  B4 Profile/import UI
  B5 Backend metadata ingestion
  B6 Knowledge graph storage/API
  B7 Assistant/wiki/RAG skeleton
  B8 Social sharing/repost
  B9 Thesis validator

Phase C: Integration
  C1 Connect frontend to backend
  C2 End-to-end demo path
  C3 QA, polish, deployment
```

### 2.2 Workstream ownership table

| Workstream | Owner/Subagent | Can run in parallel? | Depends on | Main folders |
|---|---:|---:|---|---|
| A1 Design system + UX copy | Frontend/design agent | Yes | None | `apps/web/components`, `apps/web/app`, `docs/product` |
| A2 Repo + DB schema + contracts | Platform agent | Yes | None | `prisma`, `packages/shared`, `apps/api` |
| A3 Demo seed data | Data agent | Yes | A2 draft schema | `scripts`, `apps/api/seeds`, `packages/shared` |
| B1 Landing page | Frontend agent 1 | Yes | A1 | `apps/web/app/page.tsx`, landing components |
| B2 Feed UI | Frontend agent 2 | Yes | A1, shared types | `apps/web/app/app/feed`, feed components |
| B3 Paper detail/cards | Frontend agent 3 | Yes | A1, shared types | `apps/web/app/app/papers`, card components |
| B4 Profile/import UI | Frontend agent 4 | Yes | A1, shared types | `apps/web/app/app/profile` |
| B5 Metadata ingestion API | Backend agent 1 | Yes | A2 | `apps/api/services/metadata`, `apps/api/routes/papers.py` |
| B6 Graph API + visualization | Backend + frontend graph agents | Partial | A2, A3 | `apps/api/routes/graph.py`, `apps/web/app/app/graph` |
| B7 Assistant/wiki skeleton | AI agent | Yes | A2, A3 | `apps/api/services/assistant`, `docs/prompts`, `wiki` |
| B8 Social sharing | Full-stack social agent | Yes | A2, paper UI | `apps/api/routes/social.py`, `apps/web/app/share` |
| B9 Thesis validator | AI/product agent | Yes | A2, metadata API | `apps/api/routes/thesis.py`, `apps/web/app/app/thesis-validator` |
| C1 Integration | Lead Codex | No | B streams | all touched lightly |
| C2 QA/demo | QA agent | No | C1 | `tests`, `docs/demo-script.md` |
| C3 Deploy | DevOps agent | Partial | C1 | `infra`, deployment config |

---

## 3. Phase A — Foundation Workstreams

## A1. Design System, UX Copy, and Page Wireframes

### Goal

Create the first website visual language and page skeletons so all feature agents build consistent UI.

### Inputs

- `codex-plan.md`
- This file
- Product positioning: curiosity feed + social knowledge graph + thesis validation

### Deliverables

```txt
apps/web/components/ui/*             # shadcn components if not already installed
apps/web/components/layout/*         # AppShell, Sidebar, TopNav
apps/web/components/brand/*          # Logo, gradient headings, metric badges
apps/web/lib/design-tokens.ts        # color names, copy snippets, nav links
apps/web/app/layout.tsx
apps/web/app/app/layout.tsx
apps/web/app/app/page.tsx
```

### UX style

Use a clean research-tech aesthetic:

```txt
Dark or light-neutral background
Readable cards
Soft gradients for curiosity/relevance scores
Graph motifs: nodes, edges, trails
Academic credibility without looking like old Google Scholar
```

### Required navigation

```txt
Feed
Library
Graph
Assistant
Thesis Validator
Profile
```

### Subagent prompt

```txt
You are the PaperGraph AI design-system agent. Build the first reusable UI shell for a Next.js + Tailwind + shadcn web app. Create AppShell, Sidebar, TopNav, empty page shells, reusable MetricBadge, PaperCardSkeleton, RepostCard, and GraphBadge components. Do not implement backend calls. Use mock props. Keep the design modern, readable, and optimized for PhD researchers who want curiosity, trust, and speed.
```

### Acceptance checks

```txt
pnpm dev works
All required nav links render
No backend dependency
Mobile responsive enough for desktop/tablet
Components accept typed props
```

---

## A2. Repo Setup, Database Schema, and Shared Contracts

### Goal

Establish the data model and API contracts that all other agents use.

### Deliverables

```txt
package.json
pnpm-workspace.yaml
apps/web/package.json
apps/api/pyproject.toml or requirements.txt
prisma/schema.prisma
packages/shared/src/types.ts
packages/shared/src/api-contracts.ts
infra/docker-compose.yml
.env.example
```

### Core database models

Implement at minimum:

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ResearcherProfile {
  id                  String   @id @default(cuid())
  userId              String   @unique
  displayName         String
  handle              String   @unique
  headline            String?
  affiliation         String?
  labName             String?
  googleScholarUrl    String?
  semanticScholarId   String?
  openAlexAuthorId    String?
  orcid               String?
  zoteroUserId        String?
  topicsJson          Json?
  thesisJson          Json?
  publicProfile       Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model Paper {
  id                  String   @id @default(cuid())
  title               String
  abstract            String?
  year                Int?
  doi                 String?
  arxivId             String?
  semanticScholarId   String?
  openAlexId          String?
  venue               String?
  authorsJson         Json?
  url                 String?
  pdfUrl              String?
  citationCount       Int?
  source              String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([doi])
  @@index([semanticScholarId])
  @@index([openAlexId])
}

model UserPaper {
  id                  String   @id @default(cuid())
  userId              String
  paperId             String
  status              String   @default("saved") // seen, saved, reading, read, skipped
  relevanceScore      Float?
  personalReason      String?
  notes               String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@unique([userId, paperId])
  @@index([userId])
  @@index([paperId])
}

model PaperCard {
  id                  String   @id @default(cuid())
  paperId             String
  cardType            String   // takeaway, method, dataset, limitation, idea, question
  title               String
  body                String
  sourcePage          Int?
  sourceQuote         String?
  confidence          Float?
  createdAt           DateTime @default(now())

  @@index([paperId])
}

model SharePost {
  id                  String   @id @default(cuid())
  userId              String
  paperId             String
  postType            String   // repost, quote, question, highlight
  note                String?
  question            String?
  visibility          String   @default("public")
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@index([paperId])
}

model PaperReaction {
  id                  String   @id @default(cuid())
  userId              String
  paperId             String
  reactionType        String   // heart, save, deep_read, skip
  createdAt           DateTime @default(now())

  @@index([paperId])
  @@index([userId])
}

model GraphNode {
  id                  String   @id @default(cuid())
  userId              String?
  type                String   // paper, claim, method, descriptor, molecule, adsorbent, thesis, question
  label               String
  description         String?
  sourcePaperId       String?
  metadata            Json?
  createdAt           DateTime @default(now())

  @@index([userId])
  @@index([type])
}

model GraphEdge {
  id                  String   @id @default(cuid())
  userId              String?
  sourceNodeId        String
  targetNodeId        String
  relation            String   // supports, contradicts, uses, studies, asks, relevant_to
  confidence          Float?
  sourcePaperId       String?
  metadata            Json?
  createdAt           DateTime @default(now())

  @@index([userId])
  @@index([sourceNodeId])
  @@index([targetNodeId])
}

model ThesisValidation {
  id                  String   @id @default(cuid())
  userId              String
  thesisText          String
  overlapRisk         String?
  noveltyScore        Float?
  summary             String?
  closestPapersJson   Json?
  gapsJson            Json?
  suggestedAnglesJson Json?
  createdAt           DateTime @default(now())

  @@index([userId])
}
```

### Shared TypeScript contracts

Create types for:

```ts
PaperSummary
PaperCard
FeedItem
GraphNodeDto
GraphEdgeDto
SharePostDto
ResearcherProfileDto
ThesisValidationResult
AssistantMessage
```

### Subagent prompt

```txt
You are the PaperGraph platform-contract agent. Set up the monorepo, Prisma schema, Docker Compose Postgres with pgvector-ready image if practical, shared TypeScript types, and API route contract stubs. Do not build UI. Do not implement complex business logic. Ensure other agents can import shared types and seed demo data.
```

### Acceptance checks

```txt
docker compose up starts Postgres
prisma generate succeeds
prisma migrate dev succeeds
Shared package builds
.env.example documents all required variables
```

---

## A3. Demo Seed Data and Fake API Fixtures

### Goal

Give frontend agents stable mock data so they can build without waiting for real ingestion.

### Deliverables

```txt
scripts/seed_demo_data.py
apps/web/lib/mock-data.ts
apps/api/seeds/demo_papers.json
apps/api/seeds/demo_graph.json
apps/api/seeds/demo_feed.json
```

### Demo content should include

Use 8–12 fake or real-looking paper records related to:

```txt
Adsorption ML
Molecular descriptors
Activated carbon
MOFs/zeolites
LOAO generalization
Knowledge graphs
AI literature review
Scientific discovery assistants
```

### Required mock relationships

```txt
Paper -> uses -> Descriptor
Paper -> studies -> MoleculeClass
Descriptor -> relevant_to -> Thesis
Paper -> supports -> Claim
Paper -> contradicts -> Claim
User -> saved -> Paper
User -> reposted -> Paper
```

### Subagent prompt

```txt
You are the PaperGraph demo-data agent. Create realistic demo seed data for the first website. Include papers, generated cards, graph nodes/edges, feed items, reactions, and share posts. The data should demonstrate the product narrative: discover a paper, understand why it matters, save it, see it in the graph, repost with a question, and validate a thesis.
```

### Acceptance checks

```txt
Seed script can reset and reload demo DB
Mock frontend data matches shared TypeScript types
Graph demo has at least 20 nodes and 30 edges
Feed demo has at least 8 items
```

---

## 4. Phase B — Feature Workstreams

## B1. Landing Page and Public Marketing Site

### Goal

Build a polished first public website that communicates the mission and drives signups.

### Pages/files

```txt
apps/web/app/page.tsx
apps/web/app/about/page.tsx optional
apps/web/components/landing/Hero.tsx
apps/web/components/landing/ProductDemo.tsx
apps/web/components/landing/FeatureGrid.tsx
apps/web/components/landing/MissionSection.tsx
apps/web/components/landing/WaitlistForm.tsx
```

### Landing page sections

```txt
Hero:
  "Build a living graph from every paper you read."

Subhero:
  "PaperGraph AI helps researchers discover papers, validate ideas, and share scientific curiosity with collaborators."

Problem:
  "Research discovery is fragmented. Search, reading, notes, discussion, and novelty validation happen in separate tools."

Solution:
  Daily paper feed + AI paper cards + knowledge graph + thesis validator + social reposts.

Product demo:
  A visual flow: Search thesis -> recommended papers -> insight cards -> graph -> repost -> advisor memo.

Metrics beyond citations:
  Reads, saves, hearts, reposts, questions, thesis links.

Mission:
  "Spark curiosity for millions of people."

CTA:
  Join waitlist / Open app demo.
```

### Subagent prompt

```txt
You are the landing-page agent. Build the public PaperGraph AI landing page in Next.js with Tailwind. The page must explain the mission, product, and value quickly. Include a visual mock of paper cards, graph nodes, and a thesis validation result. Use static components only. Do not require backend. Optimize for credibility and excitement, not hype.
```

### Acceptance checks

```txt
Landing page loads at /
CTA goes to /app or waitlist section
Looks good on desktop and mobile
No backend dependency
```

---

## B2. Daily Curiosity Feed UI

### Goal

Create the main product surface: a fun, swipe-like feed of relevant papers.

### Pages/files

```txt
apps/web/app/app/feed/page.tsx
apps/web/components/feed/PaperFeed.tsx
apps/web/components/feed/PaperFeedCard.tsx
apps/web/components/feed/RelevanceReason.tsx
apps/web/components/feed/FeedActions.tsx
apps/web/components/feed/DailyDigestHeader.tsx
```

### Feed card fields

```txt
Title
Authors/year/venue
One-sentence takeaway
Why this matters to your research
Relevance score
Tags
Social signals: hearts, saves, reposts, questions
Actions: Save, Heart, Repost, Ask AI, Skip
```

### Interaction behavior v0

```txt
Save -> optimistic UI state
Heart -> optimistic count
Repost -> opens composer modal
Ask AI -> deep-link to /app/assistant with paper context
Skip -> removes card from current feed
```

### Subagent prompt

```txt
You are the PaperGraph feed agent. Build the daily curiosity feed UI using mock data and shared types. Make paper discovery feel fast and fun while staying credible. Include feed actions, relevance reasons, and a repost modal trigger. Do not implement backend; use a mock service interface that can later be replaced with real API calls.
```

### Acceptance checks

```txt
/app/feed renders demo papers
Save/heart/skip work locally
Repost modal opens with selected paper
Ask AI button includes paper context in URL or state
```

---

## B3. Paper Detail Page and Swipeable Paper Cards

### Goal

Show a paper as a set of short, useful cards: contribution, method, dataset, limitations, transfer idea, and questions.

### Pages/files

```txt
apps/web/app/app/papers/[id]/page.tsx
apps/web/components/paper/PaperHeader.tsx
apps/web/components/paper/PaperInsightCards.tsx
apps/web/components/paper/PaperClaims.tsx
apps/web/components/paper/PaperActions.tsx
apps/web/components/paper/CitationPanel.tsx
apps/web/components/paper/RelatedGraphPreview.tsx
```

### Required cards

```txt
1. One-sentence contribution
2. Method
3. Dataset/materials/system
4. Key descriptor/model/equation
5. Limitation
6. Transferable idea
7. Question to ask collaborator/advisor
```

### Subagent prompt

```txt
You are the PaperGraph paper-detail agent. Build a paper detail page that turns a paper into readable insight cards. Include sections for claims, limitations, related graph nodes, and social actions. Use mock paper/card data. Make the page feel like reading a scientific paper without the boring friction.
```

### Acceptance checks

```txt
/app/papers/[id] renders from mock route params
Cards are scannable
Actions are visible
Related graph preview renders at least 5 nodes
```

---

## B4. Researcher Profile and Import Wizard

### Goal

Create profile onboarding that feels like importing a Google Scholar profile, but supports safer sources.

### Pages/files

```txt
apps/web/app/app/profile/page.tsx
apps/web/components/profile/ProfileHeader.tsx
apps/web/components/profile/ImportWizard.tsx
apps/web/components/profile/SourceConnectorCard.tsx
apps/web/components/profile/ResearchInterestsEditor.tsx
apps/web/components/profile/PublicProfilePreview.tsx
```

### Import options

```txt
Google Scholar profile URL       # display/link signal only for v0
Semantic Scholar author URL/ID
OpenAlex author URL/ID
ORCID
Zotero user/library
BibTeX/RIS upload
Manual paper link
```

### v0 behavior

```txt
User pastes profile/source URL
App shows mock candidate identity
User confirms
App saves profile fields
App shows imported paper list from mock data
```

### Subagent prompt

```txt
You are the PaperGraph profile-import agent. Build a researcher profile page and import wizard. The UX should allow a user to paste a Google Scholar URL, Semantic Scholar URL, OpenAlex URL, ORCID, Zotero info, or BibTeX. For v0, use mocked resolution results but design the interface so backend source connectors can be added later.
```

### Acceptance checks

```txt
Profile page renders
Import wizard accepts multiple source types
Mock candidate confirmation works
Public profile preview shows reads/saves/reposts metrics
```

---

## B5. Paper Metadata Ingestion API

### Goal

Implement backend endpoints to ingest paper metadata from DOI, arXiv ID, Semantic Scholar ID/URL, OpenAlex URL, or manual fields.

### Backend files

```txt
apps/api/main.py
apps/api/routes/papers.py
apps/api/services/metadata/base.py
apps/api/services/metadata/semantic_scholar.py
apps/api/services/metadata/openalex.py
apps/api/services/metadata/crossref.py
apps/api/services/metadata/arxiv.py
apps/api/services/metadata/resolver.py
apps/api/models/schemas.py
```

### API endpoints

```http
POST /papers/resolve
POST /papers/import
GET  /papers/{paper_id}
GET  /papers
GET  /papers/{paper_id}/cards
```

### Request example

```json
{
  "query": "https://doi.org/10.xxxx/example",
  "source_hint": "doi"
}
```

### Response example

```json
{
  "title": "Example paper title",
  "authors": ["A. Researcher", "B. Scientist"],
  "year": 2025,
  "doi": "10.xxxx/example",
  "abstract": "...",
  "url": "...",
  "source": "crossref",
  "confidence": 0.93
}
```

### v0 connector strategy

Build wrappers with this order:

```txt
1. Mock connector
2. DOI/Crossref connector
3. arXiv connector
4. Semantic Scholar connector
5. OpenAlex connector
```

If external call fails, return mock fallback with a clear warning.

### Subagent prompt

```txt
You are the PaperGraph metadata-ingestion backend agent. Implement FastAPI routes to resolve and import paper metadata. Use clean service wrappers for Crossref, arXiv, Semantic Scholar, and OpenAlex, but include mock fallback so the app never breaks. Store normalized papers in the database. Do not implement PDF parsing yet.
```

### Acceptance checks

```txt
FastAPI starts locally
/papers/resolve works with mock input
/papers/import writes to DB
Failures return useful errors, not crashes
Unit tests cover resolver normalization
```

---

## B6. Knowledge Graph Storage, API, and Visualization

### Goal

Create the first graph layer showing how papers connect to claims, methods, descriptors, questions, and thesis ideas.

### Backend files

```txt
apps/api/routes/graph.py
apps/api/services/graph/extract.py
apps/api/services/graph/store.py
apps/api/services/graph/query.py
```

### Frontend files

```txt
apps/web/app/app/graph/page.tsx
apps/web/components/graph/KnowledgeGraphView.tsx
apps/web/components/graph/GraphNodePanel.tsx
apps/web/components/graph/GraphFilters.tsx
apps/web/components/graph/GraphLegend.tsx
```

### API endpoints

```http
GET  /graph
GET  /graph/neighborhood?node_id=...
POST /graph/nodes
POST /graph/edges
POST /graph/extract-from-paper/{paper_id}
```

### v0 graph extraction

Use simple deterministic extraction first:

```txt
Paper -> contains -> Claim
Paper -> uses -> Method
Paper -> studies -> Topic
Paper -> has_limitation -> Limitation
Paper -> suggests -> ResearchIdea
User -> saved -> Paper
User -> reposted -> Paper
Thesis -> related_to -> Paper
```

Later, use LLM extraction to improve relations.

### Subagent prompt

```txt
You are the PaperGraph graph agent. Build the graph storage API and a frontend graph visualization. Use Postgres graph tables, not Neo4j. Use demo data first. The visualization should let users filter by papers, claims, methods, descriptors, questions, and thesis nodes. Clicking a node opens a side panel.
```

### Acceptance checks

```txt
/app/graph renders graph from demo data
Node click opens details
Filters work locally
/graph endpoint returns nodes/edges
Graph has no layout crash with 50 nodes
```

---

## B7. Assistant + Markdown Wiki + RAG Skeleton

### Goal

Build the first AI assistant that answers questions using saved papers, paper cards, and wiki notes.

### Backend files

```txt
apps/api/routes/assistant.py
apps/api/services/assistant/chat.py
apps/api/services/assistant/context_builder.py
apps/api/services/wiki/wiki_writer.py
apps/api/services/wiki/wiki_reader.py
apps/api/services/embeddings/vector_store.py
apps/api/prompts/assistant_system.md
apps/api/prompts/paper_card_extraction.md
apps/api/prompts/wiki_update.md
```

### Frontend files

```txt
apps/web/app/app/assistant/page.tsx
apps/web/components/assistant/ChatPanel.tsx
apps/web/components/assistant/SourceCitationList.tsx
apps/web/components/assistant/SuggestedQuestions.tsx
```

### v0 capabilities

```txt
Ask question over saved papers
Return answer with cited paper cards
Suggest follow-up questions
Optionally write synthesis to local markdown wiki
```

### Wiki folder convention

```txt
wiki/
  papers/
    paper-slug.md
  concepts/
    descriptor-generalization.md
    adsorption-ml.md
  questions/
    loao-generalization.md
  weekly-memos/
    2026-05-08.md
```

### Assistant system prompt draft

```txt
You are PaperGraph AI, a research assistant that helps the user understand, connect, and validate scientific ideas. Use only the provided context from saved papers, paper cards, graph nodes, and wiki notes unless clearly labeled as general reasoning. Cite paper/card IDs when making claims. Prefer actionable synthesis: what matters, what overlaps, what is missing, and what to read next.
```

### Subagent prompt

```txt
You are the PaperGraph assistant/RAG agent. Build a minimal chat endpoint and frontend chat page. Use saved paper cards and wiki markdown as context. Include a mock LLM provider if API keys are missing. The assistant must answer with citations to paper/card IDs and offer to save useful synthesis to the wiki.
```

### Acceptance checks

```txt
/app/assistant loads
User can ask a question
Mock or real answer returns with sources
Context builder can retrieve saved papers/cards
Wiki write function creates markdown file
```

---

## B8. Social Sharing, Reposts, and Public Share Pages

### Goal

Make sharing papers fun: repost with note, question, highlight, or reason.

### Backend files

```txt
apps/api/routes/social.py
apps/api/services/social/repost.py
apps/api/services/social/metrics.py
```

### Frontend files

```txt
apps/web/components/social/RepostComposer.tsx
apps/web/components/social/RepostCard.tsx
apps/web/components/social/PaperMetricBar.tsx
apps/web/app/share/[postId]/page.tsx
```

### Repost types

```txt
Simple repost
Quote repost
Question repost
Highlight repost
Lab-room repost later
```

### Required metrics

```txt
hearts
saves
reposts
questions
deep reads
thesis links
```

### Repost composer UX

When a user clicks repost, open modal:

```txt
Why are you sharing this?
[ ] Useful method
[ ] Good dataset
[ ] Supports my thesis
[ ] Contradicts my thesis
[ ] Need collaborator opinion
[ ] Just curious

Optional note/question:
[text area]

AI suggest note button:
"Generate a concise research repost"
```

### Subagent prompt

```txt
You are the PaperGraph social-sharing agent. Build repost creation, paper reactions, public share pages, and metric displays. The core behavior should feel like a research-native quote tweet: paper + user note + why it matters + actions to save/heart/comment. Use mock auth if auth is not ready.
```

### Acceptance checks

```txt
Repost composer creates a post
/share/[postId] renders public preview
Metric bar updates locally or through API
Repost appears in demo feed or paper page
```

---

## B9. Thesis Validator

### Goal

Build the feature that helps users validate whether their original thesis overlaps with existing work.

### Pages/files

```txt
apps/web/app/app/thesis-validator/page.tsx
apps/web/components/thesis/ThesisInput.tsx
apps/web/components/thesis/ValidationReport.tsx
apps/web/components/thesis/OverlapMap.tsx
apps/web/components/thesis/ClosestPapersList.tsx
apps/api/routes/thesis.py
apps/api/services/thesis/validator.py
apps/api/prompts/thesis_validation.md
```

### User input

```txt
Research idea/thesis
Field/topic
Optional: target material/method/dataset/application
Optional: what user thinks is novel
```

### Output report

```txt
Overlap risk: Low/Medium/High
Novelty score: 0–100
Closest papers
Adjacent papers
Supporting papers
Contradicting papers
Missing evidence
Potential novelty angle
Recommended reading path
Questions to ask advisor/collaborator
```

### v0 implementation

Use mock search results from seed data first. Later connect to metadata/search APIs.

### Subagent prompt

```txt
You are the PaperGraph thesis-validation agent. Build the UI and backend skeleton for validating a research thesis. For v0, use seeded/demo papers and a mock LLM report. The output should help the user avoid overlapping ideas and sharpen the novelty angle quickly.
```

### Acceptance checks

```txt
/app/thesis-validator accepts thesis text
Report renders overlap/novelty/closest papers/gaps
Result can be saved to graph as Thesis node
Result can be shared as private/public preview later
```

---

## B10. Weekly Advisor Memo and Daily Digest

### Goal

Create the habit loop: daily curiosity + weekly output.

### Backend files

```txt
apps/api/routes/digests.py
apps/api/services/digests/daily_feed.py
apps/api/services/digests/weekly_memo.py
apps/api/prompts/weekly_memo.md
```

### Frontend files

```txt
apps/web/components/digest/WeeklyMemoPreview.tsx
apps/web/app/app/memo/page.tsx optional
```

### Daily digest fields

```txt
Top 3 recent/relevant papers
Why each matters
1 curiosity question
1 collaborator question
```

### Weekly memo fields

```txt
Papers saved/read
Main themes
Useful methods
New claims
Contradictions
Ideas to test
Advisor questions
Next week reading list
```

### Subagent prompt

```txt
You are the PaperGraph digest agent. Build backend and UI skeletons for daily curiosity digest and weekly advisor memo. Use saved demo papers and paper cards. Output should be markdown-ready and copyable.
```

### Acceptance checks

```txt
Weekly memo preview generated from saved papers
Markdown export works
Daily digest endpoint returns 3–7 feed items
```

---

## 5. Phase C — Integration and Demo Workstreams

## C1. End-to-End Demo Integration

### Goal

Ensure one complete user story works without manual hacks.

### Demo story

```txt
1. User visits landing page.
2. User opens app demo.
3. User creates/edits research profile.
4. User imports/pastes one paper.
5. App generates/loads paper cards.
6. User saves and hearts paper.
7. User reposts paper with a question.
8. Paper appears in graph.
9. User asks assistant: "What should I read next for my thesis?"
10. User opens thesis validator and saves result.
11. User generates weekly advisor memo.
```

### Integration tasks

```txt
Replace direct mock imports with service abstraction
Connect frontend fetchers to backend endpoints
Add loading/error/empty states
Ensure seed data is loaded in dev
Check auth assumptions
Check route names
Check environment variables
```

### Lead Codex prompt

```txt
You are the PaperGraph integration lead. Connect the parallel workstreams into one runnable demo. Preserve working UI. Replace mocks only when backend endpoints are stable. Add clear loading/error states. Make sure the complete demo story works from landing page to feed to paper detail to graph to assistant to thesis validator.
```

### Acceptance checks

```txt
Fresh clone setup works from README
Dev server starts
Demo seed loads
Complete demo story works
No TypeScript errors
No backend import errors
```

---

## C2. QA, Testing, and Reliability

### Goal

Make the first website reliable enough to demo.

### Tests to add

```txt
Frontend:
  Landing page render
  Feed card actions
  Repost modal
  Thesis validator form
  Assistant chat render

Backend:
  Paper resolver
  Paper import
  Graph endpoint
  Repost creation
  Thesis validation mock endpoint

E2E:
  Landing -> app -> feed -> save -> repost -> graph -> assistant
```

### Tools

```txt
Frontend unit: Vitest + React Testing Library
E2E: Playwright
Backend: pytest
Lint/typecheck: eslint, tsc, ruff/black optional
```

### QA subagent prompt

```txt
You are the PaperGraph QA agent. Add tests and manual QA scripts for the demo path. Prioritize preventing demo-breaking errors over exhaustive coverage. Create docs/demo-script.md with a 3-minute walkthrough.
```

### Acceptance checks

```txt
pnpm test passes or documented
pytest passes or documented
Playwright smoke test works
Demo script exists
Known limitations documented
```

---

## C3. Deployment and Environment Setup

### Goal

Deploy first website with minimal ops complexity.

### Recommended deployment

```txt
Frontend: Vercel
Backend: Render/Fly.io/Railway or Vercel serverless only if simplified
Database: Supabase Postgres or Neon Postgres
Storage: local dev first; S3/R2 later for PDFs
```

### Files

```txt
infra/deploy.md
.env.example
apps/web/vercel.json optional
apps/api/Dockerfile
README.md setup section
```

### DevOps subagent prompt

```txt
You are the PaperGraph deployment agent. Prepare local Docker Compose and simple cloud deployment docs. Do not over-engineer. Document environment variables, database migration steps, and how to seed demo data. Add a health check endpoint for backend.
```

### Acceptance checks

```txt
README has local setup
Backend has /health
Dockerfile builds or deploy docs explain fallback
Environment variables documented
```

---

## 6. Recommended Parallel Execution Schedule

## Day 0 — Contracts and skeleton

Run these agents in parallel:

```txt
A1 Design system
A2 Repo/schema/contracts
A3 Demo seed data
```

End of day target:

```txt
App shell exists
Database schema exists
Mock data exists
Landing/page skeletons exist
```

## Day 1 — Core website surfaces

Run these agents in parallel:

```txt
B1 Landing page
B2 Feed UI
B3 Paper detail/cards
B4 Profile/import UI
B5 Metadata ingestion API
B6 Graph API/visualization
```

End of day target:

```txt
Landing looks good
Feed works with mock data
Paper detail works
Profile import mock works
Backend can resolve/import mock paper
Graph page renders demo graph
```

## Day 2 — AI/social/product differentiators

Run these agents in parallel:

```txt
B7 Assistant/wiki skeleton
B8 Social sharing/reposts
B9 Thesis validator
B10 Weekly memo/digest
```

End of day target:

```txt
Assistant chat works with saved paper context
Repost/share page works
Thesis validator outputs report
Weekly memo generates markdown
```

## Day 3 — Integration and demo polish

Run sequentially:

```txt
C1 Integration
C2 QA/demo script
C3 Deploy
```

End of day target:

```txt
One complete demo flow works
Deployable first website
README and demo script ready
```

---

## 7. Subagent Branching Strategy

Each subagent should work in its own branch/worktree:

```txt
feature/design-system
feature/platform-contracts
feature/demo-seed-data
feature/landing-page
feature/feed-ui
feature/paper-detail
feature/profile-import
feature/metadata-api
feature/graph-view
feature/assistant-wiki
feature/social-sharing
feature/thesis-validator
feature/digests
feature/integration-demo
```

Merge order:

```txt
1. platform-contracts
2. design-system
3. demo-seed-data
4. landing-page, feed-ui, paper-detail, profile-import
5. metadata-api, graph-view
6. assistant-wiki, social-sharing, thesis-validator, digests
7. integration-demo
8. qa-deploy
```

---

## 8. Shared Service Interfaces

To avoid frontend/backend blocking, define client interfaces early.

### Paper service

```ts
export interface PaperService {
  listFeed(): Promise<FeedItem[]>;
  getPaper(id: string): Promise<PaperSummary>;
  getPaperCards(id: string): Promise<PaperCard[]>;
  resolvePaper(query: string): Promise<PaperSummary>;
  importPaper(input: ImportPaperInput): Promise<PaperSummary>;
}
```

### Social service

```ts
export interface SocialService {
  reactToPaper(paperId: string, reactionType: string): Promise<void>;
  createRepost(input: CreateRepostInput): Promise<SharePostDto>;
  getSharePost(postId: string): Promise<SharePostDto>;
}
```

### Graph service

```ts
export interface GraphService {
  getGraph(filters?: GraphFilters): Promise<{ nodes: GraphNodeDto[]; edges: GraphEdgeDto[] }>;
  getNeighborhood(nodeId: string): Promise<{ nodes: GraphNodeDto[]; edges: GraphEdgeDto[] }>;
  addThesisNode(input: AddThesisNodeInput): Promise<GraphNodeDto>;
}
```

### Assistant service

```ts
export interface AssistantService {
  ask(input: AssistantAskInput): Promise<AssistantAnswer>;
  saveSynthesisToWiki(input: SaveWikiInput): Promise<void>;
}
```

### Thesis service

```ts
export interface ThesisService {
  validate(input: ThesisValidationInput): Promise<ThesisValidationResult>;
}
```

---

## 9. LLM Prompt Files to Create

Store prompts in `apps/api/prompts/` or `docs/prompts/`.

### `paper_card_extraction.md`

```txt
Given a paper title, abstract, and optional full text excerpt, extract concise research cards.
Return JSON with card_type, title, body, source_quote, confidence.
Card types: takeaway, method, dataset, descriptor, limitation, transferable_idea, question.
Focus on what a researcher can reuse.
Do not invent unsupported claims.
```

### `repost_suggestion.md`

```txt
Write a concise research repost for this paper.
The repost should explain why the paper matters, who should read it, and one question it raises.
Tone: curious, precise, research-native.
Limit: 80 words.
```

### `thesis_validation.md`

```txt
Given a user's thesis and a set of candidate related papers, assess overlap, novelty, missing evidence, and suggested refinement.
Return JSON with overlap_risk, novelty_score, closest_papers, supporting_papers, contradicting_papers, missing_evidence, suggested_angles, advisor_questions.
Do not claim exhaustive literature coverage.
```

### `weekly_memo.md`

```txt
Summarize the user's saved/read papers this week into an advisor-ready memo.
Include: main theme, papers read, methods worth reusing, contradictions, new ideas, open questions, and next week reading plan.
Keep it concise and actionable.
```

### `graph_extraction.md`

```txt
Extract graph nodes and edges from a paper card set.
Node types: Paper, Claim, Method, Dataset, Descriptor, MoleculeClass, Adsorbent, Limitation, ResearchIdea, Question, Thesis.
Edge relations: uses, studies, supports, contradicts, has_limitation, suggests, relevant_to, asks.
Return normalized JSON.
```

---

## 10. Demo Script for First Website

Create `docs/demo-script.md` with this story:

```txt
1. Open landing page.
   Explain: PaperGraph turns reading into a living social knowledge graph.

2. Open app feed.
   Show daily curiosity cards with relevance reasons.

3. Save a paper.
   Show that it updates the user's library/metrics.

4. Open paper detail.
   Show extracted insight cards: method, limitation, transferable idea.

5. Repost with a question.
   Show public share preview.

6. Open graph.
   Show the saved paper connected to descriptors, claims, and thesis.

7. Ask assistant.
   Ask: "What papers should I read next to validate my thesis?"

8. Open thesis validator.
   Paste thesis and show overlap/novelty report.

9. Generate weekly advisor memo.
   Show copyable markdown.

Closing line:
   "Google Scholar shows what has been cited. PaperGraph shows what people are reading, questioning, and building from."
```

---

## 11. Highest-Leverage Product Details for Winning Millions of Users

Add these after the basic demo works.

### 11.1 Make every paper personally relevant

Every paper card should answer:

```txt
Why should I care?
How does this connect to my thesis?
What can I reuse?
What question does it raise?
```

### 11.2 Make papers socially discussable

Every shared paper should have:

```txt
User note
AI-generated takeaway
Question prompt
Tags
Save/heart/repost actions
Public preview
```

### 11.3 Add metrics beyond citations

Track:

```txt
Reads
Deep reads
Saves
Hearts
Reposts
Questions
Thesis links
Claim links
Lab discussion count
```

### 11.4 Build thesis validation as the killer feature

For many users, this is more valuable than reading:

```txt
Is my idea novel?
Who already did something similar?
What is the closest prior work?
What is the gap?
How should I refine my thesis?
```

### 11.5 Public researcher profiles

A profile should show:

```txt
Authored papers
Reading interests
Saved public papers
Reposts/questions
Thesis areas
Curiosity impact metrics
Collaboration interests
```

### 11.6 Lab reading rooms

After v0, create small group spaces:

```txt
Lab feed
Shared reading list
Advisor questions
Weekly reading digest
Paper discussion threads
```

This is likely the strongest viral loop inside academia.

---

## 12. Final Build Priorities

If time is limited, prioritize in this order:

```txt
1. Landing page that clearly sells the mission
2. Feed with beautiful paper cards
3. Paper detail with AI insight cards
4. Repost/share with note or question
5. Graph view showing paper -> concept -> thesis
6. Thesis validator mock report
7. Assistant chat over saved papers
8. Profile import wizard
9. Weekly advisor memo
10. Real external paper metadata APIs
```

The first website does not need perfect AI. It needs to make users believe:

```txt
Reading papers can become social, visual, cumulative, and curiosity-driven.
```

That belief is the product wedge.
