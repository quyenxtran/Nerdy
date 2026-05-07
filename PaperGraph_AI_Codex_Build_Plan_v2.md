# PaperGraph AI — Codex Build Plan

**Purpose:** Build a personal research assistant and research social network that turns papers into a daily curiosity feed, a living markdown wiki, a queryable knowledge graph, a thesis-validation engine, and a lightweight social sharing layer for collaborators.

**Working product name:** `PaperGraph AI`

**Primary user:** Start with a PhD researcher who wants to read 1–2 papers/week without losing motivation, accumulate knowledge over time, ask an AI assistant questions about the accumulated literature, validate whether a thesis is novel, and share papers with friends/collaborators in a fun Twitter-like way. Long-term, expand to students, researchers, founders, labs, R&D teams, policy analysts, and science-curious readers.

**Design inspiration:** Karpathy-style LLM Wiki + Twitter/X quote repost + TikTok/Reels paper cards + Obsidian graph view.

**Build principle:** Start personal-first. Add collaboration after the paper ingestion, wiki, graph, and chat loops work.

**V2 update — May 7, 2026:** This plan now includes a broader product strategy: researcher social profiles, Google Scholar-style onboarding, OpenAlex/Semantic Scholar/ORCID/Zotero import, social paper metrics beyond citations, thesis validation, public paper reposts, lab reading rooms, viral sharing loops, and a roadmap from personal PhD assistant to mass-market research network.

---

## 0. Product Definition

### 0.1 One-sentence pitch

PaperGraph AI is a personal AI research feed that recommends new papers daily, converts papers into swipeable insight cards, stores what you read in a living markdown wiki and graph, and lets you ask questions or share papers with collaborators.

### 0.2 Core user loops

1. **Daily curiosity loop**
   - User opens app or receives daily digest.
   - App shows 3–7 recent or high-relevance papers.
   - Each paper has a short AI-generated explanation: “Why this matters to your research.”

2. **Swipe-to-learn loop**
   - User swipes through paper cards.
   - Useful cards are saved, skipped, shared, or turned into questions.
   - Saves update the user’s knowledge graph and wiki.

3. **Research memory loop**
   - User asks: “What have I read about descriptor generalization?”
   - Assistant answers using saved papers, wiki pages, graph relations, and exact citations.
   - New synthesis can be written back into the wiki.

4. **Social sharing loop**
   - User shares/reposts a paper with a note, highlight, or question.
   - Friends/collaborators comment or save it.
   - Shared paper interactions also become knowledge graph events.

5. **Weekly advisor loop**
   - App generates a weekly memo summarizing what the user read, what ideas matter, and what questions to bring to an advisor.

---

## 0A. Expanded Product Thesis — From Paper App to Research Network

### 0A.1 Big mission

PaperGraph AI should not merely help people "read more papers." The larger mission is:

> Spark curiosity for millions of people by making scientific knowledge searchable, social, and personally relevant.

The current academic discovery stack is fragmented:

- Search happens in Google Scholar, Semantic Scholar, OpenAlex, arXiv, publisher websites, and library databases.
- Organization happens in Zotero, Mendeley, Notion, Obsidian, or personal folders.
- Discussion happens in Twitter/X, Slack, Discord, email, journal clubs, and private lab meetings.
- Evaluation happens through slow metrics such as citations, h-index, and journal prestige.
- Idea validation still requires slow manual literature review.

PaperGraph AI should unify these workflows around one core object: the **research graph**.

```txt
Researcher
  -> reads / saves / shares / questions
Paper
  -> contains claims / methods / datasets / limitations
Claim
  -> supports / contradicts / extends
Thesis
  -> has overlap risk / novelty angle / missing evidence
Community
  -> validates / debates / recommends
```

### 0A.2 Strategic wedge

Start with PhD students and early-career researchers because they feel the pain most acutely:

1. They must read continuously.
2. They need to validate novelty.
3. They need to explain progress to advisors.
4. They need collaborators.
5. They are already comfortable with papers, PDFs, citations, and technical AI tools.
6. They have strong social proof incentives: "what I am reading," "what I am building," and "what I understand."

Long-term expansion path:

```txt
PhD students
  -> labs and advisors
  -> research groups and reading clubs
  -> university departments
  -> industry R&D teams
  -> startup founders validating technical ideas
  -> science-curious professionals
  -> millions of lifelong learners
```

### 0A.3 Differentiation

Do not compete head-on with Google Scholar as a search index. Instead, compete on **context**, **curiosity**, and **compound learning**.

Positioning:

```txt
Google Scholar = find papers by keyword/citation.
ResearchRabbit / Connected Papers = explore citation neighborhoods.
Elicit = AI-assisted literature review.
Zotero = manage references.
PaperGraph AI = build a living social knowledge graph around what people read, save, question, and use.
```

The winning product is not a better search box. It is a system that answers:

```txt
Why should I care about this paper?
Has someone already done my thesis?
Which papers overlap with my idea?
What do my collaborators think?
What should I read next?
What did I learn over the last month?
Which papers are being actively read, not merely cited?
```

---

## 0B. Researcher Social Profile and Import Strategy

### 0B.1 Principle

Importing a Google Scholar profile is valuable for onboarding because it gives a researcher an instant identity: publications, topics, coauthors, and citation credibility.

However, do **not** depend on Google Scholar scraping as the core data backend. Use Google Scholar as a user-provided profile signal and resolve the actual metadata through open or API-friendly sources.

Preferred identity stack:

```txt
User-provided Google Scholar URL
  -> optional public profile display link
  -> resolve candidate publications through:
      - Semantic Scholar author search
      - OpenAlex authors
      - ORCID
      - Crossref
      - arXiv
      - Zotero
      - BibTeX/RIS upload
```

### 0B.2 Profile import flow

Build the onboarding wizard:

```txt
Step 1: Paste Google Scholar profile URL, ORCID, Semantic Scholar author URL, OpenAlex author URL, or upload BibTeX.
Step 2: App searches matching author records.
Step 3: User confirms identity.
Step 4: App imports authored papers and coauthor network.
Step 5: User selects active research interests.
Step 6: App builds first curiosity feed and graph.
```

### 0B.3 Researcher profile fields

Add a public/private profile model:

```prisma
model ResearcherProfile {
  id                  String   @id @default(cuid())
  userId              String   @unique
  displayName         String
  handle              String   @unique
  headline            String?
  affiliation         String?
  labName             String?
  homepageUrl         String?
  googleScholarUrl    String?
  semanticScholarId   String?
  openAlexAuthorId    String?
  orcid               String?
  zoteroUserId        String?
  avatarUrl           String?
  topicsJson          Json?
  thesisJson          Json?
  publicProfile       Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### 0B.4 Authored paper import table

```prisma
model AuthoredPaper {
  id                  String   @id @default(cuid())
  userId              String
  paperId             String
  source              String   // semantic_scholar, openalex, orcid, bibtex, manual
  authorPosition      Int?
  isConfirmed         Boolean  @default(false)
  createdAt           DateTime @default(now())

  @@index([userId])
  @@index([paperId])
}
```

### 0B.5 Follow graph

People should be able to follow not only people, but also topics, papers, questions, and thesis areas.

```prisma
model Follow {
  id                  String   @id @default(cuid())
  followerUserId      String
  targetType          String   // user, topic, paper, thesis, lab, collection
  targetId            String
  createdAt           DateTime @default(now())

  @@index([followerUserId])
  @@index([targetType, targetId])
}
```

---

## 0C. New Scientific Social Metrics

### 0C.1 Why citations are insufficient

Citation count is useful but slow and incomplete. It does not directly measure whether a paper is being read, saved, discussed, questioned, taught, reused, replicated, or converted into new ideas.

PaperGraph AI should expose a richer impact model.

### 0C.2 Paper-level metrics

Add these first-party metrics:

```txt
Views             = paper page opens
Reads             = meaningful dwell time or card completion
DeepReads         = user opened PDF or completed all cards
Saves             = saved to library or collection
Hearts            = lightweight appreciation / excitement
Reposts           = shared with note or quote
Questions         = user asked a question about the paper
Comments          = discussion activity
AdvisorMemos      = included in weekly memo
ThesisLinks       = linked to a thesis/idea
ClaimLinks        = claims extracted and connected
ReplicationLinks  = methods/results reused or reproduced
Contradictions    = claims challenged by other papers
```

### 0C.3 Researcher-level metrics

Add alternative researcher metrics:

```txt
Citation Impact       = traditional citation count / h-index-like signal
Reader Impact         = number and quality of people reading authored papers
Curiosity Impact      = hearts, saves, questions, comments, reposts
Teaching Impact       = papers added to reading lists, courses, lab collections
Idea Influence        = papers linked to theses, experiments, prototypes, grants
Collaboration Impact  = co-reading, comments, shared collections, lab discussion
Claim Reliability     = ratio of supported vs contradicted claims over time
```

### 0C.4 Product-facing metric names

Keep the UI emotionally simple:

```txt
❤️ Hearts      = people found this exciting
🔖 Saves       = people want to revisit this
👀 Reads       = people actually engaged
💬 Questions   = people are thinking about it
🔁 Reposts     = people think others should see it
🧠 Idea Links  = people used it in a thesis/project
```

### 0C.5 Anti-gaming and trust

Do not let early metrics become a popularity contest or spam farm.

Implement:

```txt
- Rate limits on hearts/reposts/comments.
- Bot/spam detection on public profiles.
- Weight engagement from verified researchers, lab members, and real reading behavior.
- Separate public vanity metrics from private recommendation features.
- Never rank papers only by hearts.
- Add field-normalized metrics to avoid bias toward large fields.
- Decay stale engagement unless papers remain actively read/saved.
- Preserve citation count as one signal, not the only signal.
```

### 0C.6 Metrics schema

```prisma
model PaperMetricSnapshot {
  id                  String   @id @default(cuid())
  paperId             String
  views               Int      @default(0)
  reads               Int      @default(0)
  deepReads           Int      @default(0)
  saves               Int      @default(0)
  hearts              Int      @default(0)
  reposts             Int      @default(0)
  comments            Int      @default(0)
  questions           Int      @default(0)
  advisorMemoAdds     Int      @default(0)
  thesisLinks         Int      @default(0)
  claimLinks          Int      @default(0)
  citationCount       Int?
  fieldNormalizedRank Float?
  capturedAt          DateTime @default(now())

  @@index([paperId])
}
```

```prisma
model PaperInteractionEvent {
  id                  String   @id @default(cuid())
  userId              String?
  paperId             String
  eventType           String   // view, read, deep_read, save, heart, repost, question, comment, thesis_link
  sourceSurface       String   // feed, paper_page, chat, graph, memo, public_profile
  metadataJson        Json?
  createdAt           DateTime @default(now())

  @@index([userId])
  @@index([paperId])
  @@index([eventType])
}
```

---

## 0D. Make Paper Search Easy and Fun

### 0D.1 Search should not be keyword-only

Support these search modes:

```txt
1. Keyword search
2. Natural-language question search
3. Thesis search
4. Problem search
5. Method search
6. Dataset search
7. Author/lab search
8. "Find me surprising papers" search
9. "What should I read next?" search
10. "Has anyone done this before?" search
```

### 0D.2 Search by thesis

This is the strongest product wedge.

User enters:

```txt
My thesis:
Molecule–adsorbent cross descriptors can improve LOAO generalization for adsorption of branched and unsaturated organic acids on activated carbon.
```

The app returns:

```txt
Overlap risk: Medium
Novelty estimate: High if framed around aqueous AC + LOAO
Closest prior papers: 12
Adjacent papers: 24
Contradicting papers: 3
Missing evidence: multicomponent adsorption, high concentration effects
Suggested novelty angle: cross descriptors + LOAO by chemical family
Reading path: 7 papers
Potential collaborators/labs: 5
```

### 0D.3 Thesis validation object

```prisma
model Thesis {
  id                  String   @id @default(cuid())
  userId              String
  title               String
  thesisText          String
  field               String?
  status              String   // draft, validating, active, archived
  noveltyScore        Float?
  overlapRisk         Float?
  confidence          Float?
  summaryJson         Json?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
}
```

```prisma
model ThesisPaperLink {
  id                  String   @id @default(cuid())
  thesisId            String
  paperId             String
  relationType        String   // supports, overlaps, contradicts, adjacent, method_source, dataset_source
  relevanceScore      Float
  evidenceJson        Json?
  createdAt           DateTime @default(now())

  @@index([thesisId])
  @@index([paperId])
}
```

### 0D.4 Search result card design

Every paper result must answer six things:

```txt
1. What is the paper about?
2. Why does it matter to me?
3. What is the key claim?
4. What method/data can I reuse?
5. Does it support/contradict my thesis?
6. Who in my network saved/shared/questioned it?
```

### 0D.5 Fun search surfaces

Build these UI affordances:

```txt
- Tinder-like swipe deck for papers.
- "Surprise me" button.
- "Explain why this paper is trending in my niche."
- "Show me the paper family tree."
- "Generate a 5-paper reading path."
- "Find the missing paper I probably should have read."
- "Battle mode": compare two papers and explain which is more useful for my thesis.
- "Claim detective": trace one claim through supporting and contradicting papers.
- "Idea overlap radar": show how crowded an idea is.
```

---

## 0E. Viral and Social Sharing Loops

### 0E.1 The paper repost is the core social primitive

A repost is not simply a paper share. It should contain context.

```txt
Paper
  + user's note
  + AI one-sentence takeaway
  + key claim/highlight
  + tags
  + question for collaborators
  + optional thesis link
```

### 0E.2 Repost schema update

```prisma
model Repost {
  id                  String   @id @default(cuid())
  userId              String
  paperId             String
  repostType          String   // simple, quote, highlight, question, thesis_link
  note                String?
  aiTakeaway          String?
  highlightedClaimId  String?
  linkedThesisId      String?
  visibility          String   // private, followers, lab, public
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@index([paperId])
}
```

### 0E.3 Shareable link previews

Every repost should create a beautiful public preview:

```txt
[Researcher] reposted a paper

Why it matters:
"This paper may help explain weak LOAO generalization for branched acids."

Paper:
Title, authors, venue, year

Actions:
Save to PaperGraph | Ask AI | Follow topic | Join discussion
```

This becomes the viral acquisition surface.

### 0E.4 Lab reading rooms

Build private group spaces:

```txt
Lab
  -> weekly reading list
  -> advisor recommended papers
  -> student reposts
  -> comments/questions
  -> shared graph
  -> weekly digest
```

MVP group model:

```prisma
model LabGroup {
  id                  String   @id @default(cuid())
  name                String
  slug                String   @unique
  description         String?
  ownerUserId         String
  visibility          String   // private, invite_only, public
  createdAt           DateTime @default(now())
}
```

```prisma
model LabGroupMember {
  id                  String   @id @default(cuid())
  groupId             String
  userId              String
  role                String   // owner, admin, member
  createdAt           DateTime @default(now())

  @@index([groupId])
  @@index([userId])
}
```

### 0E.5 Growth loops

Build these loops intentionally:

```txt
Loop 1: Public repost loop
User shares paper card externally -> viewer opens public preview -> signs up to save/ask AI.

Loop 2: Advisor memo loop
Student sends weekly memo -> advisor comments -> advisor invites lab.

Loop 3: Lab reading room loop
One lab creates shared paper list -> other students join -> group graph gets better.

Loop 4: Profile claim loop
Researcher sees their authored paper receiving hearts/saves/questions -> claims profile.

Loop 5: Thesis validation loop
User validates idea -> shares overlap map -> collaborators add missing papers.

Loop 6: Topic leaderboard loop
People follow topics -> top saved/questioned papers appear weekly -> authors notice.

Loop 7: Citation-to-reading loop
Paper page shows not only citations but also who is reading/saving/questioning it.
```

---

## 0F. Public Product Surfaces for Millions of Users

### 0F.1 Public paper pages

Each paper should have a public page:

```txt
/paper/:slug
```

Content:

```txt
- Title, authors, venue, year
- Abstract
- AI one-sentence summary
- Key claims
- Public discussion
- Hearts/saves/reads/reposts/questions
- Related papers
- Claim graph
- "Ask AI about this paper"
- "Save to my graph"
```

### 0F.2 Public researcher pages

```txt
/u/:handle
```

Content:

```txt
- Profile identity
- Affiliation
- Authored papers
- Papers currently reading
- Public collections
- Reposts
- Topics
- Research thesis / active questions
- Impact metrics beyond citations
```

### 0F.3 Public topic pages

```txt
/topic/:slug
```

Content:

```txt
- Trending papers
- Most saved papers
- Most questioned papers
- Recent preprints
- Key researchers
- Open questions
- Common methods/datasets
- Weekly topic digest
```

### 0F.4 Public thesis pages

```txt
/thesis/:slug
```

Content:

```txt
- Thesis statement
- Overlap map
- Supporting papers
- Contradicting papers
- Missing evidence
- Reading path
- Collaborator discussion
```

Public thesis pages are risky but powerful. Default them to private. Let users explicitly publish them when ready.

---

## 0G. Recommendation System Design

### 0G.1 Ranking signals

Daily feed ranking should use:

```txt
personal_relevance =
  0.25 * semantic_similarity_to_user_topics
+ 0.20 * similarity_to_saved_papers
+ 0.15 * thesis_relevance
+ 0.10 * network_activity
+ 0.10 * freshness
+ 0.10 * quality/citation/context signal
+ 0.05 * novelty/surprise
+ 0.05 * diversity penalty/boost
```

### 0G.2 Avoid filter bubbles

Add diversity:

```txt
- 60% highly relevant papers
- 20% adjacent-field papers
- 10% classic/high-impact papers
- 10% surprising/contradictory papers
```

### 0G.3 Feedback actions

Use actions as implicit labels:

```txt
Positive:
- save
- deep read
- repost
- ask question
- add to thesis
- add to memo

Weak positive:
- heart
- open paper detail
- dwell time

Negative:
- skip
- hide topic
- mark irrelevant
- downrank author/topic
```

### 0G.4 Ranking implementation for MVP

Do not train a recommendation model initially.

Use a deterministic scorer:

```python
score = (
    0.30 * embedding_similarity(paper, user_profile)
  + 0.20 * embedding_similarity(paper, saved_papers_centroid)
  + 0.20 * thesis_relevance
  + 0.10 * freshness_score
  + 0.10 * network_activity_score
  + 0.05 * citation_quality_score
  + 0.05 * novelty_score
)
```

Store feature contributions so the UI can explain why a paper was recommended.

---

## 0H. Trust, Research Integrity, and Privacy

### 0H.1 Core integrity rules

1. Always distinguish source text from AI synthesis.
2. Preserve DOI, URL, PDF page, section, and quote evidence for every extracted claim.
3. Do not fabricate citations.
4. Mark uncertain claims as uncertain.
5. Show "AI summary may be wrong — verify with paper."
6. Prefer open-access PDFs and user-uploaded PDFs.
7. Do not scrape restricted publisher content.
8. Do not expose private reading behavior unless user opts in.
9. Default thesis validation and lab discussions to private.
10. Allow users to delete private papers, notes, and interaction history.

### 0H.2 Public metric privacy

Default privacy settings:

```txt
Private by default:
- exactly what papers user reads
- user thesis
- private notes
- advisor memo
- lab comments
- uploaded PDFs

Public by opt-in:
- profile
- public collections
- public reposts
- hearts/saves counts in aggregate
- public thesis pages
```

### 0H.3 Metric ethics

Avoid turning science into shallow popularity:

```txt
- Do not show only a single "score."
- Show separate dimensions: citations, reads, saves, questions, claim links.
- Field-normalize public rankings.
- Highlight early-career and niche-field work.
- Make "questions sparked" and "useful for thesis" legitimate impact signals.
```

---

## 0I. Monetization and Sustainability

Do not monetize during MVP. Design for later.

Potential tiers:

```txt
Free:
- public profile
- save limited papers
- basic feed
- public reposts
- small personal graph

Pro:
- unlimited graph/wiki
- unlimited PDF ingestion
- advanced thesis validation
- private AI chat over library
- weekly memos
- Zotero/Obsidian export

Lab:
- shared reading rooms
- advisor dashboard
- private lab graph
- group digest
- role permissions

University/Enterprise:
- institution-wide private deployment
- SSO
- compliance controls
- library integrations
- R&D knowledge graph
```

---

## 0J. Product Principles for a Winning Mass-Market Research Product

### Principle 1 — Make every paper answer "why should I care?"

Every recommendation must include:

```txt
Reason recommended
Relevance to user
Key claim
What to steal
Risk/limitation
Next question
```

### Principle 2 — Make reading visible but controllable

People should be able to signal curiosity without exposing all private reading behavior.

```txt
Private reading history + public curated reposts = healthy default.
```

### Principle 3 — Turn research into quests

Add goal-based reading:

```txt
Quest: Understand LOAO generalization
Quest: Validate my thesis
Quest: Prepare advisor meeting
Quest: Find 5 papers for intro section
Quest: Find contradicting evidence
```

### Principle 4 — Build for conversations, not just PDFs

The social object should be a question, claim, or insight, not only a paper.

### Principle 5 — Preserve provenance

Every generated statement must be traceable to a source.

### Principle 6 — Reward useful interpretation

The best users are not only famous authors. They are people who write useful notes, ask good questions, and connect ideas.

### Principle 7 — Be field-aware

Recommendation, metrics, and novelty validation must be field-normalized.

### Principle 8 — Start with one niche, then generalize

For the first live demo, optimize for adsorption ML / materials informatics / chemical engineering. Use that as a proof that the graph can become domain-aware.

---

## 1. MVP Scope

### 1.1 MVP must-have features

Build these first:

1. Authentication with simple user profiles.
2. Researcher profile onboarding from:
   - Google Scholar profile URL as user-provided identity link.
   - Semantic Scholar/OpenAlex/ORCID author lookup.
   - Zotero/BibTeX import as fallback.
3. Paper ingestion from:
   - Uploaded PDF.
   - DOI/arXiv URL/manual URL.
   - Semantic Scholar paper ID or title search.
4. Paper metadata enrichment:
   - Title, authors, year, venue, DOI, arXiv ID, abstract, citation count if available.
5. PDF text extraction.
6. AI paper-card generation.
7. Save/skip/heart/repost/quote/comment/question actions.
8. Markdown wiki generation.
9. Graph node/edge extraction and visualization.
10. Chat assistant over personal paper memory.
11. Daily paper feed from user topics, saved papers, authored papers, and active thesis.
12. Thesis validation: user enters an idea and the app maps overlap, supporting papers, contradicting papers, and novelty angle.
13. First-party paper metrics: reads, saves, hearts, reposts, questions, thesis links.
14. Weekly advisor memo generation.

### 1.2 MVP non-goals

Do **not** build these in v1:

- Full mobile native app.
- Large public social network.
- Complex recommendation model training.
- Publisher PDF scraping that violates access terms.
- Payment system.
- Public profiles beyond basic collaborator sharing.
- Real-time multiplayer editing.

### 1.3 v1 success criteria

The MVP is successful if a user can:

1. Add 5 papers.
2. See each paper converted into 5–10 cards.
3. Save useful cards.
4. View a graph connecting papers, concepts, methods, datasets, and research questions.
5. Ask the assistant a question and receive cited answers.
6. Repost a paper with a note to a collaborator feed.
7. Receive a daily feed of new/relevant papers.
8. Generate a weekly memo.

---

## 2. Recommended Tech Stack

### 2.1 Main stack

Use a monorepo:

```txt
papergraph-ai/
  apps/
    web/                 # Next.js frontend + API routes for UI-level operations
    worker/              # FastAPI or Python worker for ingestion/LLM extraction
  packages/
    db/                  # Prisma schema, migrations, generated client
    shared/              # Shared TypeScript types and schemas
    prompts/             # LLM prompt templates and JSON schemas
  wiki/                  # Generated markdown knowledge base, local-first artifact
  docker-compose.yml
  README.md
```

### 2.2 Frontend

- **Next.js App Router** with TypeScript.
- **Tailwind CSS** for styling.
- **shadcn/ui** or Headless UI for components.
- **React Flow** or `@xyflow/react` for graph visualization.
- **Framer Motion** for swipe-card animation.
- **Vercel AI SDK** or direct API calls for streaming chat.

### 2.3 Backend

Use both:

- **Next.js API routes/server actions** for normal app operations.
- **Python FastAPI worker** for heavier research tasks:
  - PDF parsing.
  - Metadata enrichment.
  - LLM extraction.
  - Graph relation extraction.
  - Daily feed job.
  - Weekly memo job.

### 2.4 Database

Use **Postgres + pgvector**.

Reason: one database can store users, papers, social posts, graph nodes/edges, embeddings, and chat memory.

Do **not** use Neo4j in MVP. Store the graph as relational tables first:

```txt
graph_nodes
  id
  user_id
  type
  name
  normalized_name
  description
  metadata_json

graph_edges
  id
  user_id
  source_node_id
  target_node_id
  relation_type
  evidence_id
  confidence
  metadata_json
```

Later, add Neo4j only if graph traversal becomes too slow or complex.

### 2.5 Storage

- Local disk for development.
- Supabase Storage, S3, or Vercel Blob for production PDF files.
- Generated wiki should be stored in:
  - Database rows for app rendering.
  - Actual markdown files in `/wiki` for local export and Codex/Obsidian compatibility.

### 2.6 Search and retrieval

Use hybrid retrieval:

1. Keyword search over titles, abstracts, notes, and wiki pages.
2. Vector search over paper chunks, cards, notes, and wiki pages using pgvector.
3. Graph search over structured relations.
4. Reranking with an LLM when needed.

---

## 3. External APIs and Data Sources

### 3.1 Semantic Scholar

Use for:

- Paper search.
- Paper metadata.
- Citation/reference information.
- Similar/recommended papers.

Implement:

```txt
GET /api/search/papers?q=...
GET /api/papers/:paperId/enrich
POST /api/feed/refresh
```

### 3.2 arXiv

Use for:

- Daily preprint search.
- arXiv paper metadata.
- PDF link discovery when papers are open access.

Example topics:

```txt
adsorption machine learning
molecular descriptors adsorption
activated carbon organic acid adsorption
MOF adsorption machine learning
scientific discovery agents
```

### 3.3 Crossref

Use for:

- DOI metadata.
- Bibliographic lookup.
- Author/title/year normalization.

### 3.4 Zotero optional integration

Implement later, not in first MVP unless user specifically needs it.

Use for:

- Pull saved library items.
- Export papers to a Zotero collection.
- Sync tags.

### 3.5 OpenAlex

Use for:

- Open scholarly graph of works, authors, institutions, sources, and topics.
- Author profile resolution when user provides a Google Scholar profile but no direct API data is available.
- Backup metadata enrichment when Semantic Scholar is missing a paper.
- Public topic and institution pages.

Implement:

```txt
GET /api/import/openalex/author?q=...
GET /api/import/openalex/work/:id
GET /api/search/openalex?q=...
```

### 3.6 ORCID

Use for:

- Researcher identity verification.
- Authored-work import when user provides an ORCID.
- Reducing ambiguity for common names.

Implement:

```txt
GET /api/import/orcid/:orcid
POST /api/profile/link-orcid
```

### 3.7 Google Scholar profile URL

Use for:

- Public identity link.
- Manual claim signal.
- User-facing credibility and familiarity.

Do not scrape Google Scholar aggressively. Treat it as an optional URL the user pastes and links on their profile. Use OpenAlex/Semantic Scholar/ORCID/BibTeX to resolve actual paper metadata.

### 3.8 PDF ingestion rules

Respect copyright and access restrictions:

- Allow user-uploaded PDFs.
- Allow open-access arXiv PDFs.
- Do not scrape paywalled PDFs.
- Store source provenance for every extracted claim.

---

## 4. User Experience Specification

### 4.1 Main pages

Build these routes:

```txt
/                         # Landing/dashboard
/feed                     # Daily paper feed, swipe cards
/library                  # Saved papers and uploaded PDFs
/paper/[id]               # Paper detail page
/graph                    # Knowledge graph visualization
/chat                     # AI assistant chat
/wiki                     # Markdown wiki browser
/share                    # Collaborator feed
/memos                    # Weekly advisor memos
/settings                 # Topics, API keys, export options
```

### 4.2 Feed page

Each feed item should show:

```txt
Paper title
Authors/year/venue
AI-generated one-sentence takeaway
Why this matters to my research
Relevance score
Tags
Buttons:
  Save
  Skip
  Ask AI
  Repost
  Quote
  Add to memo
```

### 4.3 Paper detail page

Sections:

1. Metadata.
2. Abstract.
3. AI summary.
4. Swipe cards.
5. Key claims with evidence.
6. Methods/datasets/features extracted.
7. Limitations.
8. Related graph nodes.
9. User notes.
10. Repost/comment thread.

### 4.4 Graph page

Show nodes:

```txt
Paper
Author
Concept
Method
Dataset
Metric
Molecule class
Material/adsorbent
Descriptor
Research gap
Question
Hypothesis
Experiment idea
```

Show edge types:

```txt
Paper USES Method
Paper STUDIES Concept
Paper REPORTS Metric
Paper SUPPORTS Claim
Paper CONTRADICTS Claim
Paper SUGGESTS ResearchGap
Paper RELEVANT_TO UserProject
Descriptor HELPS_WITH FailureMode
User SHARED Paper
User ASKED Question
Question ABOUT Concept
```

Clicking a node should open a side panel with:

- Description.
- Connected papers.
- Evidence snippets.
- User notes.
- “Ask AI about this node.”

### 4.5 Chat page

The assistant must answer with citations from:

- Paper chunks.
- AI-extracted evidence objects.
- Wiki pages.
- User notes.
- Shared posts/comments if relevant.

Example questions:

```txt
What papers have I read about LOAO generalization?
Which descriptors seem useful for branched molecules?
What did I share with my collaborator about adsorption ML?
What are my open research questions from the last 2 weeks?
Generate a weekly advisor memo.
What papers contradict my hypothesis?
```

### 4.6 Share page

Implement a private/collaborator feed, not a public network.

Post types:

```txt
REPOST              # simple paper repost
QUOTE_REPOST        # paper + user note
HIGHLIGHT_SHARE     # one card/claim shared
QUESTION_SHARE      # paper + question for collaborators
MEMO_SHARE          # weekly memo shared
```

A shared post should include:

```txt
Post type
User note
Paper metadata
AI one-sentence summary
Optional highlighted claim/card
Tags
Comment thread
Save to my library button
Ask AI about this paper button
```

---

## 5. Database Schema

Use Prisma with Postgres.

### 5.1 Core models

Create these models:

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  avatarUrl     String?
  researchBio   String?
  topics        Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  papers        UserPaper[]
  notes         Note[]
  posts         Post[]
  comments      Comment[]
  chats         ChatSession[]
}

model Paper {
  id              String   @id @default(cuid())
  semanticScholarId String?
  doi             String?
  arxivId         String?
  title           String
  abstract        String?
  year            Int?
  venue           String?
  authors         Json?
  url             String?
  pdfUrl          String?
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  userPapers      UserPaper[]
  chunks          PaperChunk[]
  cards           PaperCard[]
  claims          Claim[]
}

model UserPaper {
  id          String   @id @default(cuid())
  userId      String
  paperId     String
  status      PaperStatus @default(SAVED)
  relevanceScore Float?
  personalWhy String?
  readProgress Int @default(0)
  addedAt     DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User @relation(fields: [userId], references: [id])
  paper       Paper @relation(fields: [paperId], references: [id])

  @@unique([userId, paperId])
}

enum PaperStatus {
  FEED
  SAVED
  SKIPPED
  READING
  READ
  ARCHIVED
}
```

### 5.2 Paper chunks and cards

```prisma
model PaperChunk {
  id          String   @id @default(cuid())
  paperId     String
  userId      String?
  chunkIndex  Int
  section     String?
  pageStart   Int?
  pageEnd     Int?
  text        String
  tokenCount  Int?
  embedding   Unsupported("vector")?
  createdAt   DateTime @default(now())

  paper       Paper @relation(fields: [paperId], references: [id])
}

model PaperCard {
  id          String   @id @default(cuid())
  paperId     String
  userId      String
  cardType    PaperCardType
  title       String
  body        String
  evidenceIds Json?
  tags        String[]
  orderIndex  Int
  createdAt   DateTime @default(now())

  paper       Paper @relation(fields: [paperId], references: [id])
}

enum PaperCardType {
  TAKEAWAY
  METHOD
  DATASET
  DESCRIPTOR
  RESULT
  LIMITATION
  RESEARCH_IDEA
  QUESTION
  WHY_IT_MATTERS
}
```

### 5.3 Claims and evidence

```prisma
model Claim {
  id          String   @id @default(cuid())
  paperId     String
  userId      String?
  claimText   String
  claimType   ClaimType
  confidence  Float?
  sourceChunkIds String[]
  pageRefs    Json?
  createdAt   DateTime @default(now())

  paper       Paper @relation(fields: [paperId], references: [id])
}

enum ClaimType {
  CONTRIBUTION
  METHOD
  RESULT
  LIMITATION
  DATASET
  HYPOTHESIS
  CONTRADICTION
  FUTURE_WORK
}
```

### 5.4 Graph schema

```prisma
model GraphNode {
  id             String   @id @default(cuid())
  userId         String
  type           GraphNodeType
  name           String
  normalizedName String
  description    String?
  metadata       Json?
  embedding      Unsupported("vector")?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  outgoing       GraphEdge[] @relation("EdgeSource")
  incoming       GraphEdge[] @relation("EdgeTarget")

  @@unique([userId, type, normalizedName])
}

model GraphEdge {
  id          String   @id @default(cuid())
  userId      String
  sourceId    String
  targetId    String
  relation    String
  evidenceId  String?
  confidence  Float?
  metadata    Json?
  createdAt   DateTime @default(now())

  source      GraphNode @relation("EdgeSource", fields: [sourceId], references: [id])
  target      GraphNode @relation("EdgeTarget", fields: [targetId], references: [id])

  @@unique([userId, sourceId, targetId, relation])
}

enum GraphNodeType {
  PAPER
  AUTHOR
  CONCEPT
  METHOD
  DATASET
  METRIC
  DESCRIPTOR
  MOLECULE_CLASS
  MATERIAL
  RESEARCH_GAP
  QUESTION
  HYPOTHESIS
  EXPERIMENT_IDEA
  USER_PROJECT
}
```

### 5.5 Wiki schema

```prisma
model WikiPage {
  id          String   @id @default(cuid())
  userId      String
  slug        String
  title       String
  pageType    WikiPageType
  markdown    String
  sourceIds   String[]
  version     Int      @default(1)
  embedding   Unsupported("vector")?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, slug])
}

enum WikiPageType {
  PAPER
  CONCEPT
  METHOD
  DATASET
  DESCRIPTOR
  QUESTION
  PROJECT
  MEMO
}
```

### 5.6 Social schema

```prisma
model Post {
  id          String   @id @default(cuid())
  userId      String
  paperId     String?
  postType    PostType
  content     String?
  cardId      String?
  claimId     String?
  visibility  Visibility @default(PRIVATE)
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User @relation(fields: [userId], references: [id])
  comments    Comment[]
}

model Comment {
  id          String   @id @default(cuid())
  postId      String
  userId      String
  content     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  post        Post @relation(fields: [postId], references: [id])
  user        User @relation(fields: [userId], references: [id])
}

enum PostType {
  REPOST
  QUOTE_REPOST
  HIGHLIGHT_SHARE
  QUESTION_SHARE
  MEMO_SHARE
}

enum Visibility {
  PRIVATE
  COLLABORATORS
  GROUP
  PUBLIC_UNLISTED
}
```

### 5.7 Chat schema

```prisma
model ChatSession {
  id          String   @id @default(cuid())
  userId      String
  title       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User @relation(fields: [userId], references: [id])
  messages    ChatMessage[]
}

model ChatMessage {
  id          String   @id @default(cuid())
  sessionId   String
  role        ChatRole
  content     String
  citations   Json?
  createdAt   DateTime @default(now())

  session     ChatSession @relation(fields: [sessionId], references: [id])
}

enum ChatRole {
  USER
  ASSISTANT
  SYSTEM
  TOOL
}
```

---

## 6. AI Data Contracts

All LLM outputs must be structured JSON first, then rendered into UI/markdown.

### 6.1 Paper extraction JSON

Create `packages/prompts/schemas/paper_extraction.schema.json`:

```json
{
  "type": "object",
  "required": ["summary", "cards", "claims", "graph_nodes", "graph_edges", "wiki_updates"],
  "properties": {
    "summary": {
      "type": "object",
      "required": ["one_sentence", "technical_summary", "why_it_matters", "limitations"],
      "properties": {
        "one_sentence": { "type": "string" },
        "technical_summary": { "type": "string" },
        "why_it_matters": { "type": "string" },
        "limitations": { "type": "array", "items": { "type": "string" } }
      }
    },
    "cards": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["card_type", "title", "body", "tags", "evidence"],
        "properties": {
          "card_type": { "type": "string" },
          "title": { "type": "string" },
          "body": { "type": "string" },
          "tags": { "type": "array", "items": { "type": "string" } },
          "evidence": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["chunk_id", "quote_or_paraphrase", "page"],
              "properties": {
                "chunk_id": { "type": "string" },
                "quote_or_paraphrase": { "type": "string" },
                "page": { "type": ["integer", "null"] }
              }
            }
          }
        }
      }
    },
    "claims": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["claim_text", "claim_type", "source_chunk_ids", "confidence"],
        "properties": {
          "claim_text": { "type": "string" },
          "claim_type": { "type": "string" },
          "source_chunk_ids": { "type": "array", "items": { "type": "string" } },
          "confidence": { "type": "number" }
        }
      }
    },
    "graph_nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "name", "description"],
        "properties": {
          "type": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" }
        }
      }
    },
    "graph_edges": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["source_name", "source_type", "relation", "target_name", "target_type", "evidence", "confidence"],
        "properties": {
          "source_name": { "type": "string" },
          "source_type": { "type": "string" },
          "relation": { "type": "string" },
          "target_name": { "type": "string" },
          "target_type": { "type": "string" },
          "evidence": { "type": "string" },
          "confidence": { "type": "number" }
        }
      }
    },
    "wiki_updates": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["page_type", "title", "slug", "markdown_patch"],
        "properties": {
          "page_type": { "type": "string" },
          "title": { "type": "string" },
          "slug": { "type": "string" },
          "markdown_patch": { "type": "string" }
        }
      }
    }
  }
}
```

### 6.2 Extraction prompt

Create `packages/prompts/paper_extraction.md`:

```md
You are an AI research librarian building a personal research wiki and graph.

User research profile:
{{USER_RESEARCH_PROFILE}}

Paper metadata:
{{PAPER_METADATA}}

Paper chunks:
{{PAPER_CHUNKS}}

Task:
1. Summarize the paper accurately.
2. Create 5–10 swipeable research cards.
3. Extract claims with evidence.
4. Extract graph nodes and graph edges.
5. Propose wiki updates using markdown.

Rules:
- Do not invent claims not supported by the chunks.
- Every technical claim must reference at least one source chunk.
- Prefer concise, high-information cards.
- Include a “why this matters to my research” card.
- Flag uncertainty explicitly.
- Use the JSON schema exactly.
```

### 6.3 Daily feed relevance prompt

Create `packages/prompts/feed_rerank.md`:

```md
You are ranking papers for a PhD researcher.

User research profile:
{{USER_RESEARCH_PROFILE}}

Known interests:
{{TOPICS}}

Saved papers/concepts:
{{MEMORY_SUMMARY}}

Candidate papers:
{{CANDIDATE_PAPERS}}

Return JSON array with:
- paper_id
- relevance_score from 0 to 1
- novelty_score from 0 to 1
- curiosity_reason
- why_it_matters
- recommended_action: save | skim | skip | ask_collaborator

Ranking priority:
1. Directly useful to the user’s current research.
2. Introduces a method/descriptor/dataset that could transfer.
3. Challenges or contradicts the user’s assumptions.
4. Recent or high-impact.
```

### 6.4 Chat assistant prompt

Create `packages/prompts/chat_system.md`:

```md
You are PaperGraph AI, a personal research assistant.

You answer using the user’s accumulated research memory:
- saved papers
- extracted claims
- wiki pages
- graph nodes and edges
- user notes
- shared posts/comments

Rules:
- Cite sources by paper title and page/chunk when available.
- Separate evidence from speculation.
- If the answer creates a reusable synthesis, suggest saving it as a wiki page.
- If evidence is weak or conflicting, say so.
- Prefer concrete next research actions.
- Never pretend to have read a paper that is not in memory or search results.
```

---

## 7. Core Services

### 7.1 Metadata service

Location:

```txt
apps/worker/app/services/metadata_service.py
```

Responsibilities:

- Normalize DOI/arXiv/Semantic Scholar IDs.
- Query Semantic Scholar, arXiv, and Crossref.
- Merge metadata into one canonical `Paper` object.
- Avoid duplicate papers by DOI, arXiv ID, S2 ID, or normalized title.

Functions:

```python
async def enrich_paper(input: PaperLookupInput) -> CanonicalPaperMetadata
async def search_papers(query: str, limit: int = 20) -> list[CanonicalPaperMetadata]
async def get_recommendations(seed_paper_ids: list[str], negative_paper_ids: list[str] = []) -> list[CanonicalPaperMetadata]
```

### 7.2 PDF service

Location:

```txt
apps/worker/app/services/pdf_service.py
```

Responsibilities:

- Store uploaded PDFs.
- Extract text with page numbers.
- Chunk text by section/page.
- Persist `PaperChunk` rows.

Use:

- `pypdf` or `PyMuPDF` for extraction.
- Fall back to OCR only if absolutely necessary.

### 7.3 Embedding service

Location:

```txt
apps/worker/app/services/embedding_service.py
```

Responsibilities:

- Embed chunks, cards, claims, wiki pages, and graph node descriptions.
- Store embeddings in pgvector columns.
- Batch requests where possible.

Functions:

```python
async def embed_texts(texts: list[str]) -> list[list[float]]
async def embed_paper_chunks(paper_id: str) -> None
async def embed_wiki_page(wiki_page_id: str) -> None
```

### 7.4 Extraction service

Location:

```txt
apps/worker/app/services/extraction_service.py
```

Responsibilities:

- Send chunks + metadata + user profile to LLM.
- Validate JSON output against schema.
- Persist cards, claims, graph nodes/edges, and wiki updates.
- Log extraction failures.

Functions:

```python
async def extract_paper_intelligence(user_id: str, paper_id: str) -> ExtractionResult
async def persist_extraction(user_id: str, paper_id: str, extraction: ExtractionResult) -> None
```

### 7.5 Wiki service

Location:

```txt
apps/worker/app/services/wiki_service.py
```

Responsibilities:

- Maintain markdown pages.
- Version pages.
- Export pages to `/wiki/{user_id}/...`.
- Preserve source links.

Wiki folder structure:

```txt
wiki/
  users/
    {user_id}/
      index.md
      papers/
        {paper-slug}.md
      concepts/
        {concept-slug}.md
      methods/
        {method-slug}.md
      descriptors/
        {descriptor-slug}.md
      questions/
        {question-slug}.md
      memos/
        weekly-{yyyy-mm-dd}.md
```

### 7.6 Graph service

Location:

```txt
apps/worker/app/services/graph_service.py
```

Responsibilities:

- Upsert normalized nodes.
- Upsert evidence-backed edges.
- Return graph subgraphs for UI.
- Support queries like:
  - related papers for a concept.
  - path between paper and research question.
  - central concepts this month.

API:

```txt
GET /api/graph?nodeId=&depth=2
GET /api/graph/search?q=
GET /api/graph/node/:id
```

### 7.7 Feed service

Location:

```txt
apps/worker/app/services/feed_service.py
```

Responsibilities:

- Pull candidate papers daily.
- Rank candidates by user interests and memory.
- Create `UserPaper` rows with status `FEED`.
- Generate curiosity cards.

Candidate generation:

1. User topic keyword searches.
2. arXiv recent searches.
3. Semantic Scholar recommendations from saved papers.
4. Citation/reference expansion from high-value saved papers.

Ranking formula:

```txt
final_score =
  0.35 * semantic_similarity_to_user_profile
+ 0.25 * graph_relevance_to_saved_concepts
+ 0.20 * recency_or_newness
+ 0.10 * impact_signal
+ 0.10 * curiosity_or_contradiction_signal
```

### 7.8 Chat service

Location:

```txt
apps/web/app/api/chat/route.ts
```

or worker endpoint:

```txt
apps/worker/app/routes/chat.py
```

Responsibilities:

- Retrieve relevant chunks, wiki pages, claims, and graph context.
- Stream answer to UI.
- Return citations.
- Offer save-to-wiki action.

Retrieval steps:

1. Convert user query to embedding.
2. Retrieve top paper chunks/cards/wiki pages by vector similarity.
3. Retrieve graph neighborhood around matching nodes.
4. Retrieve recent notes/posts if relevant.
5. Ask LLM to answer using only retrieved context.
6. Save chat message with citations.

### 7.9 Social service

Location:

```txt
apps/web/app/api/posts/route.ts
apps/web/app/api/comments/route.ts
```

Responsibilities:

- Create reposts, quote reposts, highlight shares, question shares.
- Show collaborator feed.
- Allow comments.
- Allow saving a shared paper into your own library.

---

## 8. API Endpoint Plan

### 8.1 Papers

```txt
POST   /api/papers/upload
POST   /api/papers/import
GET    /api/papers/search?q=
GET    /api/papers/:id
POST   /api/papers/:id/extract
POST   /api/papers/:id/save
POST   /api/papers/:id/skip
GET    /api/papers/:id/cards
GET    /api/papers/:id/claims
```

### 8.2 Feed

```txt
GET    /api/feed
POST   /api/feed/refresh
POST   /api/feed/:userPaperId/action
```

Actions:

```json
{
  "action": "SAVE | SKIP | ASK | ADD_TO_MEMO | REPOST | QUOTE"
}
```

### 8.3 Graph

```txt
GET    /api/graph
GET    /api/graph/search?q=
GET    /api/graph/node/:id
GET    /api/graph/path?sourceId=&targetId=
```

### 8.4 Wiki

```txt
GET    /api/wiki
GET    /api/wiki/:slug
POST   /api/wiki/:slug/update
POST   /api/wiki/export
```

### 8.5 Chat

```txt
POST   /api/chat
GET    /api/chat/sessions
GET    /api/chat/sessions/:id
POST   /api/chat/messages/:id/save-to-wiki
```

### 8.6 Social

```txt
GET    /api/posts
POST   /api/posts
GET    /api/posts/:id
POST   /api/posts/:id/comments
POST   /api/posts/:id/save-paper
```

### 8.7 Memos

```txt
GET    /api/memos
POST   /api/memos/generate-weekly
GET    /api/memos/:id
POST   /api/memos/:id/share
```

---

## 9. Build Steps for Codex

Follow these steps in order. Do not jump to social features before the ingestion/chat loop works.

### Step 1 — Initialize repo

1. Create monorepo structure.
2. Create Next.js TypeScript app in `apps/web`.
3. Create Python FastAPI app in `apps/worker`.
4. Add `packages/db`, `packages/shared`, `packages/prompts`.
5. Add Docker Compose for Postgres with pgvector.
6. Add root README with local startup commands.

Acceptance:

```txt
pnpm dev starts Next.js app.
uvicorn app.main:app --reload starts worker.
docker compose up starts Postgres.
```

### Step 2 — Add database and Prisma

1. Add Prisma schema from section 5.
2. Enable pgvector extension in migration.
3. Generate Prisma client.
4. Add seed script with one demo user and sample topics.

Acceptance:

```txt
pnpm db:migrate works.
pnpm db:seed creates demo user.
Database contains vector extension.
```

### Step 3 — Add authentication placeholder

For MVP, use either:

- Clerk/Auth.js if quick.
- Simple email magic-link later.
- Temporary demo user for local development.

Implement a `getCurrentUser()` helper that returns demo user in dev.

Acceptance:

```txt
All routes can access a user_id.
```

### Step 4 — Build paper import/search

1. Implement paper search UI at `/library`.
2. Implement metadata service in worker.
3. Implement search using Semantic Scholar first.
4. Add Crossref fallback for DOI.
5. Add arXiv import by URL/ID.
6. Deduplicate by DOI/arXiv ID/title.

Acceptance:

```txt
User can search a paper title and add it to library.
User can paste DOI/arXiv URL and import metadata.
```

### Step 5 — Build PDF upload and chunking

1. Add `/api/papers/upload` route.
2. Store PDF file locally in dev.
3. Extract text with page numbers.
4. Chunk into `PaperChunk` rows.
5. Show extracted chunk preview on paper page.

Acceptance:

```txt
User uploads PDF.
Paper page shows extracted text chunks.
Chunks include page refs when available.
```

### Step 6 — Add embeddings

1. Create embedding service.
2. Add environment variable for embedding model provider.
3. Generate embeddings for chunks.
4. Store in pgvector.
5. Add basic semantic search endpoint.

Acceptance:

```txt
User can search library semantically.
A query returns relevant chunks/papers.
```

### Step 7 — Add AI extraction into cards/claims/graph/wiki

1. Add prompt files and schema validation.
2. Implement extraction service.
3. Extract one paper at a time.
4. Persist PaperCard rows.
5. Persist Claim rows.
6. Upsert graph nodes/edges.
7. Create/update paper wiki page.
8. Create/update concept/method/descriptor wiki pages.

Acceptance:

```txt
Click "Extract insights" on a paper.
Paper detail page shows 5–10 cards.
Graph page shows nodes/edges from paper.
Wiki page exists for the paper.
```

### Step 8 — Build feed UI

1. Create `/feed` route.
2. Render PaperCard-style feed cards.
3. Implement Save, Skip, Ask AI, Repost, Quote, Add to memo.
4. Add swipe animation.
5. Persist actions.

Acceptance:

```txt
Feed shows candidate papers.
Save/skip actions update database.
Repost opens composer.
```

### Step 9 — Build daily feed job

1. Create feed refresh worker endpoint.
2. Pull candidates from Semantic Scholar/arXiv.
3. Use user topics and saved-paper seeds.
4. Rank with formula and LLM rerank prompt.
5. Persist top results as `UserPaper(status=FEED)`.
6. Add manual `Refresh feed` button.
7. Add cron later.

Acceptance:

```txt
Click Refresh feed.
3–7 relevant papers appear.
Each has a curiosity reason and relevance score.
```

### Step 10 — Build graph visualization

1. Create `/graph` route.
2. Fetch nodes/edges.
3. Render with React Flow or force graph.
4. Add filters by node type.
5. Add depth slider.
6. Add node side panel.
7. Add “Ask AI about this node.”

Acceptance:

```txt
Graph displays papers/concepts/methods/questions.
Click node opens evidence and connected papers.
```

### Step 11 — Build chat assistant

1. Create `/chat` route.
2. Add streaming chat UI.
3. Implement hybrid retrieval.
4. Include citations in responses.
5. Add “save synthesis to wiki” button.
6. Save chat history.

Acceptance:

```txt
User asks about a concept.
Assistant answers using saved papers/wiki/graph.
Answer includes citations.
User can save answer to wiki.
```

### Step 12 — Build wiki browser

1. Create `/wiki` route.
2. List wiki pages by type.
3. Render markdown.
4. Show backlinks.
5. Add source list.
6. Add export button.

Acceptance:

```txt
User can browse generated paper and concept pages.
Wiki markdown includes source references.
```

### Step 13 — Build social repost layer

1. Create `/share` route.
2. Create post composer.
3. Implement post types:
   - Repost.
   - Quote repost.
   - Highlight share.
   - Question share.
4. Create comment threads.
5. Add “save shared paper” action.
6. Add collaborator visibility placeholder.

Acceptance:

```txt
User can quote-repost a paper.
Post appears in share feed.
Another demo user can comment.
Shared paper can be saved to library.
```

### Step 14 — Build weekly advisor memo

1. Create memo generation service.
2. Pull papers saved/read/shared in last 7 days.
3. Pull notes/questions/comments.
4. Generate markdown memo.
5. Store as WikiPage type `MEMO`.
6. Render in `/memos`.
7. Allow sharing memo as post.

Acceptance:

```txt
Click Generate weekly memo.
Memo includes read papers, useful ideas, advisor questions, and next experiments.
```

### Step 15 — Polish and test

1. Add loading states.
2. Add empty states.
3. Add error handling for failed APIs.
4. Add basic unit tests for services.
5. Add Playwright smoke test for main flows.
6. Add README demo script.

Acceptance:

```txt
A new user can complete the full demo in under 10 minutes.
```

---

## 10. UI Component List

Create components:

```txt
components/
  layout/
    AppShell.tsx
    Sidebar.tsx
    Topbar.tsx
  feed/
    PaperFeedCard.tsx
    SwipeDeck.tsx
    RelevanceBadge.tsx
    FeedActionBar.tsx
  papers/
    PaperSearch.tsx
    PaperImportForm.tsx
    PdfUpload.tsx
    PaperMetadataHeader.tsx
    PaperCardList.tsx
    ClaimList.tsx
  graph/
    KnowledgeGraph.tsx
    GraphNodePanel.tsx
    GraphFilters.tsx
  chat/
    ChatWindow.tsx
    ChatMessage.tsx
    CitationList.tsx
  wiki/
    WikiPageList.tsx
    WikiMarkdownRenderer.tsx
    BacklinkPanel.tsx
  social/
    PostComposer.tsx
    ShareFeed.tsx
    PostCard.tsx
    CommentThread.tsx
  memos/
    MemoList.tsx
    MemoRenderer.tsx
```

---

## 11. Design System

### 11.1 Visual style

Use a clean “research cockpit” style:

```txt
Background: deep navy / near-black
Cards: dark slate
Accent: electric blue or teal
Secondary accent: purple
Status green: saved/read
Status amber: skim
Status red: contradiction/limitation
Typography: modern sans-serif + mono for metadata
```

### 11.2 Feed card design

Card hierarchy:

```txt
[Relevance 91%] [New] [Adsorption ML]
Title
One-sentence takeaway
Why this matters to my research
Tags
Actions: Save | Skip | Ask | Repost | Quote
```

### 11.3 Quote repost composer

Fields:

```txt
Paper preview
AI suggested note
Editable user note
Share type dropdown
Visibility dropdown
Tags
Post button
```

AI suggestions:

```txt
Useful method
Good dataset
Contradicts my hypothesis
Ask collaborator opinion
Potential advisor discussion
```

---

## 12. Local Development Environment

### 12.1 Environment variables

Create `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/papergraph"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
WORKER_URL="http://localhost:8000"

# AI provider
OPENAI_API_KEY=""
EMBEDDING_MODEL="REPLACE_WITH_CURRENT_EMBEDDING_MODEL"
CHAT_MODEL="REPLACE_WITH_CURRENT_CHAT_MODEL"
EXTRACTION_MODEL="REPLACE_WITH_CURRENT_EXTRACTION_MODEL"

# Scholarly APIs
SEMANTIC_SCHOLAR_API_KEY=""
CROSSREF_MAILTO="your-email@example.com"

# Storage
PDF_STORAGE_DIR="./storage/pdfs"
WIKI_EXPORT_DIR="./wiki/users"
```

### 12.2 Commands

Root package scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm --filter web dev\" \"pnpm worker:dev\"",
    "worker:dev": "cd apps/worker && uvicorn app.main:app --reload --port 8000",
    "db:migrate": "pnpm --filter db prisma migrate dev",
    "db:seed": "pnpm --filter db tsx seed.ts",
    "test": "pnpm -r test"
  }
}
```

### 12.3 Docker Compose

Create `docker-compose.yml`:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: papergraph
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 13. Implementation Details for Key Flows

### 13.1 Import paper flow

```txt
User submits DOI/title/arXiv URL
→ web route sends request to worker
→ metadata service queries sources
→ canonical metadata returned
→ app creates Paper row
→ app creates UserPaper row
→ paper appears in library
```

### 13.2 Upload PDF flow

```txt
User uploads PDF
→ file stored
→ PDF service extracts text by page
→ chunks persisted
→ chunks embedded
→ user can click Extract insights
```

### 13.3 Extract insights flow

```txt
User clicks Extract insights
→ extraction service loads metadata + chunks + user profile
→ LLM returns structured JSON
→ validator checks schema
→ cards persisted
→ claims persisted
→ graph nodes/edges upserted
→ wiki pages generated/updated
→ paper page refreshes
```

### 13.4 Chat flow

```txt
User asks question
→ embed query
→ retrieve chunks/cards/wiki pages
→ identify graph nodes by keyword/vector match
→ retrieve local graph neighborhood
→ construct answer context
→ stream LLM answer
→ persist message and citations
```

### 13.5 Repost flow

```txt
User clicks Repost/Quote on paper/card/claim
→ composer opens
→ optional AI draft note generated
→ user edits note
→ post saved
→ graph edge User SHARED Paper created
→ post appears in share feed
```

### 13.6 Weekly memo flow

```txt
User clicks Generate weekly memo
→ get last 7 days saved/read/shared/asked items
→ get top graph concepts and open questions
→ LLM writes markdown memo
→ memo stored as WikiPage
→ memo rendered in /memos
```

---

## 14. Graph Extraction Rules

Normalize node names:

```txt
lowercase
trim punctuation
singularize obvious plurals
map synonyms where possible
```

Examples:

```txt
"Random Forests" → "random forest"
"MOFs" → "metal-organic frameworks"
"LOAO" → "leave-one-adsorbate-out"
```

Allowed edge relations:

```txt
USES
STUDIES
REPORTS
EVALUATES
SUPPORTS
CONTRADICTS
SUGGESTS
LIMITED_BY
RELEVANT_TO
IMPROVES
FAILS_ON
COMPARES_WITH
ASKS_ABOUT
SHARED_WITH
```

Do not create edges without evidence.

Each edge must have:

```txt
source node
target node
relation
evidence text or claim ID
confidence
```

---

## 15. Wiki Page Templates

### 15.1 Paper page template

```md
# {{Paper Title}}

## Metadata
- Authors:
- Year:
- Venue:
- DOI/arXiv:
- Added:

## One-sentence takeaway

## Why this matters to my research

## Technical summary

## Methods

## Dataset / experimental setup

## Key claims

## Limitations

## Useful ideas to transfer

## Related concepts

## Open questions

## Source references
```

### 15.2 Concept page template

```md
# {{Concept}}

## Definition

## Why it matters

## Papers mentioning this concept

## Supporting evidence

## Contradictory evidence

## Related concepts

## Open questions
```

### 15.3 Weekly memo template

```md
# Weekly Research Memo — {{date}}

## Papers read/saved this week

## Main themes

## Useful ideas for my project

## Contradictions or warnings

## Questions for advisor

## Next actions
```

---

## 16. Testing Plan

### 16.1 Unit tests

Test:

- Metadata normalization.
- DOI/arXiv URL parsing.
- PDF chunking.
- JSON schema validation.
- Graph node normalization.
- Edge upsert deduplication.
- Feed ranking formula.

### 16.2 Integration tests

Test:

- Import paper by DOI.
- Upload PDF → chunks created.
- Extract insights → cards/claims/wiki/graph created.
- Chat query → returns cited answer.
- Repost → post appears in feed.

### 16.3 Smoke test script

Create `scripts/demo_smoke_test.md`:

```txt
1. Start app.
2. Login as demo user.
3. Import one paper by title.
4. Upload a PDF.
5. Extract insights.
6. Open feed.
7. Save one paper.
8. Open graph.
9. Ask chat: "Why is this paper relevant to my research?"
10. Quote-repost the paper.
11. Generate weekly memo.
```

---

## 17. Deployment Plan

### 17.1 MVP deployment

- Frontend: Vercel.
- Worker: Render/Fly.io/Railway.
- Database: Supabase Postgres or Neon Postgres with pgvector.
- Storage: Supabase Storage/S3/Vercel Blob.

### 17.2 Production considerations

Add:

- Rate limiting.
- API error retries.
- User data export.
- Privacy controls.
- Background job queue.
- LLM cost tracking.
- Audit logs for wiki modifications.

---

## 18. Privacy and Research Integrity

### 18.1 Privacy

- Default all posts to private.
- Sharing to collaborators requires explicit visibility setting.
- Do not train on user papers.
- Allow user to delete/export all data.

### 18.2 Research integrity

- Every claim must trace back to source chunks.
- The assistant must distinguish:
  - directly supported evidence.
  - synthesis/inference.
  - speculation.
- Contradictions should be preserved, not smoothed away.
- The app should not fabricate citations.

---

## 19. Suggested First Demo Scenario

Use a demo user with research profile:

```txt
I research machine learning for adsorption of organic molecules on porous materials, with interest in molecular descriptors, adsorbents, generalization, leave-one-adsorbate-out validation, activated carbon, MOFs, zeolites, and autonomous scientific discovery.
```

Demo flow:

1. Open daily feed.
2. Show paper with high relevance score.
3. Swipe through cards.
4. Save “descriptor” card.
5. Ask AI: “How could this help my LOAO issue?”
6. Open graph and show path:

```txt
Paper → USES → shape descriptors → RELEVANT_TO → branched molecules → FAILS_ON → LOAO generalization
```

7. Quote repost to collaborator:

```txt
“This may be useful for improving LOAO generalization because it uses shape-sensitive descriptors instead of molecule-only scalar features. Do you think this transfers to activated carbon?”
```

8. Generate weekly advisor memo.

---

## 20. Implementation Priority Summary

Build in this exact order:

```txt
1. Repo + DB + auth placeholder
2. Paper import/search
3. PDF upload/chunking
4. Embeddings + semantic search
5. AI extraction into cards/claims
6. Wiki generation
7. Graph extraction + visualization
8. Chat assistant with citations
9. Daily feed
10. Repost/comment social layer
11. Weekly memo
12. Polish/testing/deployment
```

---


## 21. V2 Implementation Additions — Make It a Winning Product

### 21.1 New build steps after MVP core

After Step 15, Codex should implement the V2 social/research-network upgrades in this order:

```txt
Step 16 — Add researcher profiles and profile import wizard.
Step 17 — Add OpenAlex/Semantic Scholar/ORCID author resolution.
Step 18 — Add thesis validator page and backend service.
Step 19 — Add first-party metrics event tracking.
Step 20 — Add public paper pages and public repost previews.
Step 21 — Add lab reading rooms.
Step 22 — Add topic pages and weekly topic digests.
Step 23 — Add anti-spam/rate-limit guardrails.
Step 24 — Add profile-claim flow for paper authors.
```

### 21.2 Profile import acceptance criteria

A user can:

1. Paste Google Scholar, Semantic Scholar, OpenAlex, ORCID, or Zotero/BibTeX information.
2. See candidate author matches.
3. Confirm their profile.
4. Import authored papers.
5. Select active research topics.
6. Generate their initial daily feed.
7. Publish or keep private their researcher profile.

### 21.3 Thesis validator acceptance criteria

A user can:

1. Enter a thesis statement.
2. Receive a list of closest-overlap papers.
3. Receive supporting, contradicting, adjacent, and method-source papers.
4. See an overlap/novelty score with confidence.
5. Open a graph view showing paper-claim-thesis relationships.
6. Save the thesis to their private graph.
7. Export the thesis validation report to markdown.

### 21.4 Social metrics acceptance criteria

For every paper page, show:

```txt
Citations if available
Reads
Deep reads
Saves
Hearts
Reposts
Questions
Thesis links
```

For every public profile, show:

```txt
Authored papers
Public reposts
Public collections
Topics
Reader impact
Curiosity impact
Idea influence
```

### 21.5 Public sharing acceptance criteria

Every repost creates:

```txt
- Public preview URL
- OpenGraph metadata
- Beautiful title/description/image preview
- Save-to-PaperGraph CTA
- Ask-AI-about-this-paper CTA
```

### 21.6 Lab reading room acceptance criteria

A lab group can:

```txt
- Invite members
- Share a weekly reading list
- Comment on papers
- Save questions for group discussion
- Generate weekly lab digest
```

---

## 22. V2 API Endpoint Additions

### 22.1 Profiles

```txt
POST /api/profile/onboarding/start
POST /api/profile/import/semantic-scholar
POST /api/profile/import/openalex
POST /api/profile/import/orcid
POST /api/profile/import/bibtex
GET  /api/profile/:handle
PATCH /api/profile/me
POST /api/profile/publish
```

### 22.2 Thesis validation

```txt
POST /api/thesis
GET  /api/thesis/:id
POST /api/thesis/:id/validate
GET  /api/thesis/:id/graph
POST /api/thesis/:id/link-paper
POST /api/thesis/:id/export
```

### 22.3 Metrics

```txt
POST /api/events
GET  /api/papers/:paperId/metrics
GET  /api/profile/:handle/metrics
GET  /api/topic/:slug/metrics
```

### 22.4 Public pages

```txt
GET /api/public/paper/:slug
GET /api/public/repost/:id
GET /api/public/topic/:slug
GET /api/public/profile/:handle
```

### 22.5 Lab reading rooms

```txt
POST /api/labs
GET  /api/labs/:slug
POST /api/labs/:slug/invite
POST /api/labs/:slug/reading-list
POST /api/labs/:slug/comment
GET  /api/labs/:slug/digest
```

---

## 23. LLM Prompt — Thesis Validator

```txt
You are a rigorous research novelty and overlap analyst.

Input:
- User thesis statement
- User field and keywords
- Candidate papers with title, abstract, authors, year, citation context, extracted claims
- User's saved papers and notes if available

Task:
1. Identify papers that directly overlap with the thesis.
2. Identify papers that partially overlap or are adjacent.
3. Identify papers that support the thesis.
4. Identify papers that contradict or weaken the thesis.
5. Identify missing evidence needed to make the thesis credible.
6. Estimate novelty only as a hypothesis, not as a definitive claim.
7. Suggest a sharper novelty angle.
8. Produce a reading path of 5-10 papers.
9. Cite exact papers and evidence snippets.

Output JSON:
{
  "overlap_risk": 0.0-1.0,
  "novelty_score": 0.0-1.0,
  "confidence": 0.0-1.0,
  "closest_prior_work": [
    {
      "paper_id": "...",
      "relationship": "direct_overlap | partial_overlap | adjacent",
      "reason": "...",
      "evidence": "..."
    }
  ],
  "supporting_papers": [],
  "contradicting_papers": [],
  "missing_evidence": [],
  "suggested_novelty_angle": "...",
  "recommended_reading_path": []
}
```

---

## 24. LLM Prompt — Repost Composer

```txt
You help researchers share papers with context.

Input:
- Paper metadata
- Extracted key claims
- User note or intent
- User thesis/topics
- Target audience: public / lab / collaborator / advisor

Task:
Write a concise repost that explains why the paper matters.
Do not exaggerate the paper.
Do not claim the user endorses the paper unless stated.
Make the note useful to someone deciding whether to read the paper.

Output:
{
  "headline": "...",
  "why_it_matters": "...",
  "key_claim": "...",
  "useful_for": ["..."],
  "question_to_ask": "...",
  "hashtags": ["..."]
}
```

---

## 25. LLM Prompt — Fun Search Result Explainer

```txt
You explain paper search results in a way that promotes curiosity.

For each paper, produce:
1. One-sentence plain-language takeaway.
2. Why the user should care.
3. What can be reused.
4. What claim is most important.
5. How it connects to the user's thesis.
6. One question the user should ask after reading.

Keep it rigorous, not hype-driven.
```

---

## 26. V2 Data Quality and Safety Tests

Add tests:

```txt
- Test that thesis validation never returns novelty as certain.
- Test that AI-generated claims include source paper IDs.
- Test that private thesis pages are not publicly accessible.
- Test that uploaded PDFs are visible only to owner/group.
- Test that metric events are rate-limited.
- Test that public repost pages do not expose private notes.
- Test that profile import requires user confirmation before claiming.
- Test that Google Scholar URL is treated as a user-provided link, not scraped as core data.
```

---

## 27. V2 Roadmap

### Phase 1 — Personal research OS

```txt
PDF import
Paper cards
Wiki
Graph
Chat
Daily feed
Weekly memo
```

### Phase 2 — Social paper sharing

```txt
Reposts
Quote notes
Comments
Public share pages
Followers
Public profiles
```

### Phase 3 — Thesis validation

```txt
Idea input
Overlap search
Novelty estimate
Supporting/contradicting papers
Reading path
Exportable report
```

### Phase 4 — Lab network

```txt
Lab groups
Advisor reading list
Group graph
Lab digest
Private discussion
```

### Phase 5 — Public science network

```txt
Public paper pages
Public topic pages
Alternative metrics
Author claim flow
Topic leaderboards
Embeddable paper cards
```

### Phase 6 — Institutional/enterprise

```txt
SSO
Private deployment
Institutional knowledge graph
Compliance
R&D team workflows
```

---

## 28. What Would Make This Win for Millions of People

The product becomes a mass-market winner if it does these unusually well:

1. **It makes every paper personally relevant.**
   - Most people do not read papers because they cannot quickly see why the paper matters to them.

2. **It makes scientific curiosity social without becoming shallow.**
   - Hearts and reposts help engagement, but the deeper metric should be questions, saves, thesis links, and useful interpretations.

3. **It gives researchers a new identity layer.**
   - Not just "I have 2,000 citations," but "people are reading, saving, discussing, and building from my work."

4. **It shortens the path from idea to novelty validation.**
   - This is the killer feature for PhD students, founders, R&D teams, and grant writers.

5. **It compounds knowledge over time.**
   - Every paper, note, question, and repost strengthens the user's graph and assistant.

6. **It makes sharing intellectually valuable.**
   - A repost should create context, not just traffic.

7. **It rewards good questions.**
   - The scientific network should not only reward authors; it should reward readers who connect ideas and ask insightful questions.

8. **It starts narrow and becomes universal.**
   - Win first in one technical niche, then generalize the framework across fields.

---

## 29. References for Codex/Developer

- Semantic Scholar API: https://www.semanticscholar.org/product/api
- Semantic Scholar Recommendations API: https://api.semanticscholar.org/api-docs/recommendations
- OpenAlex API: https://developers.openalex.org/
- OpenAlex API overview: https://developers.openalex.org/api-reference/introduction
- ORCID documentation: https://info.orcid.org/documentation/
- Altmetric Attention Score: https://www.altmetric.com/about-us/our-data/donut-and-altmetric-attention-score/
- ResearchRabbit product reference: https://www.researchrabbit.ai/


- Karpathy LLM Wiki gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Semantic Scholar API docs: https://api.semanticscholar.org/api-docs/
- Semantic Scholar Recommendations API: https://api.semanticscholar.org/api-docs/recommendations
- arXiv API user manual: https://info.arxiv.org/help/api/user-manual.html
- Crossref REST API docs: https://www.crossref.org/documentation/retrieve-metadata/rest-api/
- Zotero Web API v3 docs: https://www.zotero.org/support/dev/web_api/v3/basics
- Next.js App Router docs: https://nextjs.org/docs/app
- FastAPI docs: https://fastapi.tiangolo.com/
- pgvector GitHub/docs: https://github.com/pgvector/pgvector
- Neo4j Python driver docs, optional later: https://neo4j.com/docs/python-manual/current/

---

## 30. Final Instruction to Codex

Build the MVP as a working local application first. Prefer reliability over polish. Every feature should preserve provenance: paper title, page/chunk reference, and source ID. The app should feel fun like a social feed, but the durable value is the compounding research memory: markdown wiki + graph + cited chat assistant.
