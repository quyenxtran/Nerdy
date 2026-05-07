# Twitter-Inspired Upgrade Plan for PaperGraph AI

## Goal

Use the open-source Twitter/X recommendation architecture as inspiration for PaperGraph AI's research feed, graph, social reposts, assistant, and memo loops. Do not copy Twitter source code into this repository. The Twitter repo is AGPL-3.0, and the app should only adopt architectural ideas that are reimplemented locally for PaperGraph.

Primary outcome: turn the current mock paper feed into a research-native recommendation system with user signals, candidate sources, ranking, filtering, explanations, and mixed modules.

## Implementation Progress

Last updated: 2026-05-07.

| Status | Commit | Slice |
| --- | --- | --- |
| Done | `5a48f5b` | Added recommendation contracts, mock social/signal data, local recommendation pipeline, ranked feed service integration, and "Why this paper?" explanations. |
| Done | `fcecb47` | Added `GET/POST /api/signals`, in-memory session signal storage, and feed card signal writes for save, heart, and skip. |
| Done | `08238a9` | Wired assistant asks, paper reposts, graph node opens, and paper detail opens into normalized signal capture. |
| Done | `af99e05` | Added feed mode query support, API feed parameters, feed tabs, and visible mixed modules from the recommendation mixer. |
| Done | `878abaf` | Added provenance and visibility rules for feed items, assistant citations, and public share pages. |
| Done | `8f634e9` | Tuned ranking weights by feed mode and increased feedback signal impact. |
| Done | `fe455a6` | Persisted mock signals and feed impressions under ignored local storage. |
| Done | `5149484` | Added feed feedback controls and actionable graph/research/memo module cards. |

Next recommended slice:

1. Add a small debug panel for `/api/signals` and recent feed impressions.
2. Add Playwright smoke coverage for feed actions, signal persistence, and share redaction.
3. Move persisted mock storage behind a real database adapter when the pipeline behavior is accepted.

## Sources Studied

| Source | Relevant Ideas |
| --- | --- |
| [twitter/the-algorithm README](https://github.com/twitter/the-algorithm) | Shared recommendation services, user signals, graph features, embeddings, trust/safety models, Product Mixer, Home Mixer, notifications. |
| [Twitter recommendation blog](https://blog.x.com/engineering/en_us/topics/open-source/2023/twitter-recommendation-algorithm) | Candidate sourcing, ranking, heuristics, visibility filters, social proof, content balance, mixing, serving. |
| [Home Mixer README](https://github.com/twitter/the-algorithm/tree/main/home-mixer) | Feed pipeline stages: candidate generation, feature hydration, scoring, filters, mixing, serving, cursoring, observability. |
| [Product Mixer README](https://github.com/twitter/the-algorithm/tree/main/product-mixer) | Small reusable components composed into readable pipelines. |
| [Retrieval Signals](https://github.com/twitter/the-algorithm/blob/main/RETREIVAL_SIGNALS.md) | Explicit and implicit behavior signals used for retrieval and ranking. |
| [User Signal Service](https://github.com/twitter/the-algorithm/tree/main/user-signal-service) | Centralized normalized action stream for likes, replies, clicks, profile visits, and other behaviors. |
| [Follow Recommendations Service](https://github.com/twitter/the-algorithm/tree/main/follow-recommendations-service) | Candidate generation, filtering, ranking, transforms, social proof, truncation for account recommendations. |
| [Visibility Filtering](https://github.com/twitter/the-algorithm/tree/main/visibilitylib) | Rule engine for hard filtering, labels, interstitials, and downranking based on viewer context and safety metadata. |

## Current PaperGraph Fit

| Twitter Pattern | PaperGraph Equivalent | Current State | Upgrade Target |
| --- | --- | --- | --- |
| For You timeline | Personalized paper and claim feed | `apps/web/app/app/feed/page.tsx` renders static `feedPapers` | Feed API ranks candidates from multiple research sources. |
| User Signal Service | Research signal service | Feed actions are mostly local React state | Save, heart, skip, ask, import, repost, validate, and graph clicks become normalized signals. |
| Candidate sources | Paper sources | Static mock papers | In-library papers, imported papers, graph-neighbor papers, thesis-topic papers, trending/shared papers, and assistant-generated questions. |
| Feature hydration | Candidate enrichment | Paper cards contain fixed relevance and reason | Add features such as thesis overlap, graph distance, novelty risk, recency, citation availability, user fatigue, and social proof. |
| Ranking | Research relevance scoring | `paper.relevance` is static mock data | Deterministic mock ranker first, later embeddings and persisted features. |
| Filters and heuristics | Research quality and privacy filters | Skip only hides locally | Remove seen/skipped papers, private drafts, low-provenance claims, muted tags, weak evidence, and repeated source fatigue. |
| Mixing | Feed modules | Feed only shows paper cards | Mix paper cards, graph paths, who-to-follow researchers, assistant prompts, thesis checks, and memo reminders. |
| Social proof | Research social context | Repost mock exists | Show why a paper appears: saved by similar researchers, linked to a thesis path, reposted with evidence, or cited by a followed profile. |
| Visibility filtering | Claim safety/provenance | Public/private repost visibility exists | Enforce visibility, source confidence, AI uncertainty, hidden tags, and public-share redaction. |
| Recommended notifications | Weekly memo and nudge system | Weekly memo preview exists | Generate nudges when high-signal papers, graph contradictions, or thesis risks appear. |

## Feature Upgrade Set

1. Research For You feed: a ranked feed of papers, claims, questions, graph paths, and memo prompts tailored to the active thesis.
2. Following feed: reverse-chronological updates from followed researchers, labs, topics, saved libraries, or sources.
3. Signal capture: normalized explicit and implicit research actions stored through one service.
4. Explanation layer: every recommendation explains why it appeared and which signals influenced it.
5. Graph-based discovery: recommend papers and questions through claim, method, descriptor, and thesis graph distance.
6. Social proof: show second-degree context such as "similar thesis", "followed researcher saved this", or "appears in a high-confidence path".
7. Feedback fatigue: downrank repeated authors, topics, venues, and papers the user repeatedly skips.
8. Visibility and provenance filters: prevent weak, private, or unsafe AI claims from appearing in public/share surfaces.
9. Mixed modules: blend papers with researcher suggestions, graph paths, assistant questions, thesis checks, and weekly memo prompts.
10. Creator/researcher analytics: show reach, saves, questions, reposts, citation clicks, and graph reuse for shared paper posts.

## Implementation Plan

### Step 1: Add Recommendation Domain Contracts

Create new types before changing behavior.

| File | Change |
| --- | --- |
| `apps/web/lib/contracts.ts` | Add `SignalType`, `UserSignal`, `FeedCandidate`, `RecommendationFeature`, `RecommendationScore`, `RecommendationReason`, `FeedModule`, `FeedMode`, and `VisibilityDecision`. |
| `apps/web/lib/mock-data.ts` | Add mock user signals, followed researchers, muted tags, paper source metadata, social proof snippets, and seen/skipped paper IDs. |
| `apps/web/lib/services.ts` | Keep existing public functions stable while internal recommendation logic is introduced. |

Acceptance checks:

- Existing pages still compile without UI changes.
- `FeedResponse` remains backwards-compatible until the feed UI is ready.
- New recommendation types are exportable and usable by API routes.

### Step 2: Build a PaperGraph Product Mixer Skeleton

Add a small local pipeline modeled after Product Mixer concepts.

| New File | Responsibility |
| --- | --- |
| `apps/web/lib/recommendations/types.ts` | Internal pipeline interfaces and shared utility types. |
| `apps/web/lib/recommendations/sources.ts` | Candidate sources: library, imports, graph neighbors, thesis topics, social proof, memo prompts. |
| `apps/web/lib/recommendations/features.ts` | Feature hydration: thesis overlap, graph distance, novelty, recency, evidence count, social proof, fatigue. |
| `apps/web/lib/recommendations/ranker.ts` | Deterministic scoring formula with named weights. |
| `apps/web/lib/recommendations/filters.ts` | Seen, skipped, muted, private, low-evidence, duplicate, and fatigue filters. |
| `apps/web/lib/recommendations/mixer.ts` | Mix papers, graph paths, questions, researchers, and memo prompts into one feed. |
| `apps/web/lib/recommendations/explain.ts` | Convert features and filter decisions into user-facing explanations. |
| `apps/web/lib/recommendations/index.ts` | Main `buildResearchFeed(profile, options)` entrypoint. |

Acceptance checks:

- `buildResearchFeed` works entirely from mock data.
- The top paper remains plausible for the demo thesis.
- Each item has source, score, reasons, and visibility decision.

### Step 3: Add a User Signal Service

Implement Twitter-style normalized signals for research actions.

| Signal | Trigger |
| --- | --- |
| `paper_open` | User opens paper detail page. |
| `paper_save` | User clicks save/bookmark. |
| `paper_heart` | User hearts a paper card. |
| `paper_skip` | User skips a feed item. |
| `assistant_ask` | User asks a cited assistant question. |
| `paper_repost` | User creates a repost. |
| `graph_node_open` | User selects a graph node. |
| `thesis_validate` | User runs thesis validation. |
| `memo_generate` | User generates or previews a weekly memo. |
| `tag_mute` | User hides a tag/topic/source. |
| `claim_report` | User flags a weak or incorrect claim. |

Implementation steps:

1. Add `POST /api/signals` to accept one normalized signal.
2. Add `GET /api/signals` for debug/demo inspection.
3. Store signals in an in-memory map first, matching the existing mock-first style.
4. Update `PaperFeedCard`, `AssistantChat`, `RepostComposer`, `KnowledgeGraph`, and thesis/memo flows to post signals.
5. Use signals in the ranker to boost saved topics and downrank repeated skips.

Acceptance checks:

- UI still works if signal POST fails.
- Signal payloads include `type`, `entityType`, `entityId`, `weight`, `createdAt`, and optional `metadata`.
- No private note is sent as public social proof.

### Step 4: Replace Static Feed with Ranked Feed API

Move feed ranking into the API so UI stays simple.

Implementation steps:

1. Change `getFeed()` in `apps/web/lib/services.ts` to call `buildResearchFeed`.
2. Extend `FeedResponse` to include `mode`, `modules`, `debug`, or `explanations`.
3. Keep `papers` populated for existing components.
4. Add query params to `apps/web/app/api/feed/route.ts`: `mode=for-you|following`, `limit`, `cursor`, `debug`.
5. Update `apps/web/app/app/feed/page.tsx` to consume ranked reasons instead of importing `feedPapers` directly.

Acceptance checks:

- `/api/feed` returns deterministic ranked data.
- `/app/feed` renders from the API or from a server-side service call, not direct mock imports.
- Every paper card shows at least one transparent "why this appeared" reason.

### Step 5: Upgrade Feed UI to Twitter-Style Research Modes

Add user-facing feed controls without making the app feel like a generic social clone.

Implementation steps:

1. Add tabs: `For You`, `Following`, `Graph Nearby`, `New Evidence`, `Contradictions`.
2. Add feedback menu per item: `Save`, `Ask`, `Repost`, `Show less like this`, `Mute tag`, `Not relevant`, `Weak evidence`.
3. Show social proof and provenance chips below the title.
4. Add `Why this paper?` expandable panel with score factors.
5. Add cursor-friendly pagination or `Load more`.

Acceptance checks:

- Feed remains readable on mobile.
- Feedback actions update local state immediately and post a signal.
- Negative feedback changes subsequent ranked results in the same session.

### Step 6: Add Graph Feature Service Equivalent

Use the existing knowledge graph as a first-class recommendation source.

Implementation steps:

1. Add graph feature utilities to compute distance from active thesis, shared groups, edge evidence strength, path membership, and contradiction status.
2. Add candidate source `fromGraphNeighbors` that recommends papers, claims, methods, and questions connected to active thesis paths.
3. Add `GraphPathModule` feed cards for "read this path next".
4. Add `GraphNodePanel` actions: save node, ask about node, report edge, add to memo.
5. Feed graph interactions back into signals.

Acceptance checks:

- Graph path recommendations are visible in the feed.
- Graph node selection posts `graph_node_open`.
- Recommendations cite evidence strings already present in graph edges.

### Step 7: Add Visibility and Provenance Filtering

Implement a lightweight rule engine inspired by Visibility Filtering.

Implementation steps:

1. Add `apps/web/lib/recommendations/visibility.ts`.
2. Define rules for private reposts, lab-only content, low-confidence AI claims, missing source IDs, muted tags, reported claims, and weak evidence.
3. Return decisions as `allow`, `downrank`, `label`, `interstitial`, or `drop`.
4. Apply rules in feed, assistant citations, share previews, and memo output.
5. Show labels instead of silently hiding uncertain research claims when appropriate.

Acceptance checks:

- Public share pages do not expose private draft notes.
- AI-generated claims without source context get a visible uncertainty label or are dropped.
- Reported claims are downranked in the feed and graph modules.

### Step 8: Add Social Proof and Follow Recommendations

Adapt Twitter's follow recommendation pattern to research collaboration.

Implementation steps:

1. Add mock profiles for researchers, labs, topics, and reading circles.
2. Add candidate source `fromSimilarResearchers`.
3. Add `WhoToFollowResearcherCard` or `ReadingCircleCard`.
4. Add social proof transforms: followed by, saved by, reposted by, cited by, shares thesis topic.
5. Add settings so social proof respects visibility and privacy.

Acceptance checks:

- Feed can mix papers and researcher/topic suggestions.
- Social proof is generated from mock relationships, not hardcoded text in components.
- Private or lab-only signals never become public proof.

### Step 9: Add Recommended Notifications and Memo Nudges

Use the same pipeline to produce lightweight notifications.

Implementation steps:

1. Add `GET /api/notifications/recommended`.
2. Add candidate sources for high-relevance new paper, thesis contradiction, source verification gap, weekly memo due, and unanswered advisor question.
3. Add small notification tray or cockpit module.
4. Add a rule that avoids duplicate notifications after the user dismisses or acts.
5. Feed notification opens back into signals.

Acceptance checks:

- Notifications are explainable and source-backed.
- Dismissed notifications do not immediately reappear.
- Weekly memo suggestions reference actual selected papers.

### Step 10: Add Analytics and Transparency

Implement creator/researcher analytics in a research-safe way.

Implementation steps:

1. Extend repost metrics beyond `saves`, `questions`, and `reposts`.
2. Add metrics for citation clicks, assistant asks, graph path reuse, memo inclusions, and saves by topic.
3. Add `app/profile` analytics panels.
4. Add `Why am I seeing this?` debug details in development mode.
5. Keep user-facing analytics aggregated and non-invasive.

Acceptance checks:

- Repost previews show useful engagement without exposing private reader activity.
- Debug details are only shown when `debug=true` or in local development.
- Analytics connect back to signal types.

### Step 11: Add Persistence After Mock Pipeline Works

Do not start with a database migration. First prove the pipeline behavior with mock and in-memory services.

Implementation steps:

1. Add database schema for users, profiles, papers, cards, graph nodes, graph edges, reposts, signals, follows, mutes, reports, and feed impressions.
2. Persist signal writes from `/api/signals`.
3. Persist feed impressions so fatigue and seen filtering survive reloads.
4. Persist social proof using privacy-aware relationships.
5. Add seed data matching the current mock demo.

Acceptance checks:

- Fresh seed produces the same demo story.
- Signals persist across browser reloads.
- Existing mock fallback still works without database setup.

## Recommended First Implementation Slice

Implement this first when returning to the upgrade:

1. Add recommendation contracts in `contracts.ts`.
2. Add `apps/web/lib/recommendations/*` with mock candidate sources, ranker, filters, mixer, and explanations.
3. Refactor `getFeed()` to call the mixer while preserving current `FeedResponse.papers`.
4. Add `POST /api/signals` with in-memory storage.
5. Update `PaperFeedCard` save, heart, and skip actions to post signals.
6. Add `Why this paper?` to paper cards using recommendation reasons.
7. Run `npm run typecheck` and `npm run build`.

This slice gives the app a real Twitter-style recommendation spine without blocking on auth, database, external APIs, or ML.

## Suggested Scoring Formula for Mock Ranker

Use transparent deterministic weights first:

| Feature | Weight | Notes |
| --- | ---: | --- |
| Thesis topic overlap | 0.25 | Match tags, title, takeaway, and reason against active thesis terms. |
| Graph distance to thesis | 0.20 | Closer graph paths rank higher. |
| Evidence count | 0.15 | More source-backed cards and graph edges rank higher. |
| Novelty or contradiction value | 0.12 | Boost papers that expose missing evidence or thesis risk. |
| User positive signal match | 0.12 | Boost tags and methods the user saved, asked about, or reposted. |
| Social proof | 0.08 | Boost followed/similar researcher engagement. |
| Recency | 0.04 | Small boost for recent papers or new imports. |
| Fatigue penalty | -0.10 | Downrank repeated author, source, tag, or skipped item patterns. |
| Weak provenance penalty | -0.20 | Strong downrank for missing source evidence. |

The UI should show the top two or three positive factors plus any major warning.

## Files Most Likely to Change Later

| Area | Files |
| --- | --- |
| Contracts and mock data | `apps/web/lib/contracts.ts`, `apps/web/lib/mock-data.ts` |
| Recommendation pipeline | `apps/web/lib/recommendations/*` |
| API services | `apps/web/lib/services.ts`, `apps/web/app/api/feed/route.ts`, `apps/web/app/api/signals/route.ts` |
| Feed UI | `apps/web/app/app/feed/page.tsx`, `apps/web/components/PaperFeedCard.tsx` |
| Graph UI | `apps/web/components/KnowledgeGraph.tsx`, possible new `GraphPathModule.tsx` |
| Social and sharing | `apps/web/components/RepostComposer.tsx`, `apps/web/app/share/[postId]/page.tsx` |
| Assistant and memo | `apps/web/components/AssistantChat.tsx`, `apps/web/components/WeeklyMemoPreview.tsx` |
| Profile analytics | `apps/web/app/app/profile/page.tsx` |

## Quality Bar

- `npm run typecheck` passes.
- `npm run build` passes.
- The main demo path still works without external API keys.
- Recommendations are deterministic in mock mode.
- Every recommended paper, claim, graph path, and memo nudge has a visible reason.
- Public share surfaces never leak private draft or lab-only notes.
- AI-generated claims are never shown as facts without source context and uncertainty.
- Negative feedback changes ranking behavior in-session.

## Non-Goals

- Do not recreate Twitter as a general social network.
- Do not copy Scala, Java, Thrift, model code, or config from the Twitter repo.
- Do not train a neural ranker before a deterministic explainable ranker exists.
- Do not add a database before the mock pipeline is behaviorally correct.
- Do not expose private research notes as social proof.
