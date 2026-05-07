# UI Direction

## Experience Goal

PaperGraph should feel like a focused research cockpit, not a generic SaaS dashboard or marketing page. The first screen should put the user directly into the work: papers, relevance, graph, thesis, and evidence.

## Visual Principles

- Use a restrained dark research workspace with teal, blue, gold, green, and rose accents.
- Prefer dense, readable panels over oversized decorative sections.
- Keep border radius at `8px` for cards and controls.
- Use compact metrics and tags so researchers can scan quickly.
- Show graph relationships early; the graph is the product's durable memory.
- Treat AI output as evidence-linked analysis, not magic copy.

## Core Surfaces

- `Landing`: product promise plus live-looking demo of feed, thesis scan, and graph.
- `Cockpit`: the working home screen for current thesis, feed, memo, and graph.
- `Feed`: daily paper cards with explicit personal relevance.
- `Paper detail`: paper transformed into contribution, method, limitation, idea, and question cards.
- `Graph`: paper, claim, method, descriptor, question, and thesis relationships.
- `Assistant`: cited answers with source IDs.
- `Thesis validator`: overlap risk, novelty hypothesis, missing evidence, and reading path.
- `Share preview`: a paper repost with context and calls to save or ask AI.

## Interaction Rules

- Save, heart, skip, repost, and ask should be one-click actions in the feed.
- Repost must include user context, not just a title and link.
- Thesis validation must never present novelty as certain.
- Public sharing must not expose private notes by default.
- Empty states should suggest one useful next action.

## Future UI Components

- `RepostComposer`
- `WeeklyMemoPreview`
- `ImportWizard`
- `PaperSearch`
- `SourceCitationList`
- `GraphNodePanel`
- `GraphFilters`
- `AdvisorMemoRenderer`
