import { AppShell } from "@/components/AppShell";
import { PaperFeedCard } from "@/components/PaperFeedCard";
import type { FeedCandidate, FeedMode } from "@/lib/contracts";
import { getFeed } from "@/lib/services";
import Link from "next/link";

const feedModes: Array<{ mode: FeedMode; label: string }> = [
  { mode: "for-you", label: "For You" },
  { mode: "following", label: "Following" },
  { mode: "graph-nearby", label: "Graph Nearby" },
  { mode: "new-evidence", label: "New Evidence" },
  { mode: "contradictions", label: "Contradictions" }
];

export default async function FeedPage({ searchParams }: { searchParams?: Promise<{ mode?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const mode = parseFeedMode(resolvedSearchParams?.mode);
  const feed = getFeed({ mode });
  const paperRecommendations = new Map(
    feed.modules
      ?.flatMap((module) => module.items)
      .filter((candidate) => candidate.kind === "paper" && candidate.paper)
      .map((candidate) => [candidate.paper?.id, candidate]) ?? []
  );

  return (
    <AppShell active="feed">
      <header className="topbar">
        <div>
          <p className="eyebrow">Daily curiosity loop</p>
          <h2>Paper feed</h2>
        </div>
        <span className="metric-pill">{feed.papers.length} ranked papers</span>
      </header>
      <nav className="feed-tabs" aria-label="Feed modes">
        {feedModes.map((item) => (
          <Link
            className={(feed.mode ?? "for-you") === item.mode ? "feed-tab active" : "feed-tab"}
            href={`/app/feed?mode=${item.mode}`}
            key={item.mode}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="dashboard">
        {feed.papers.map((paper, index) => (
          <PaperFeedCard
            featured={index === 0}
            key={paper.id}
            paper={paper}
            recommendation={paperRecommendations.get(paper.id)}
          />
        ))}
        {feed.modules
          ?.filter((module) => module.id !== "primary-papers")
          .map((module) => (
            <section className="panel feed-module" key={module.id}>
              <div className="card-head">
                <div>
                  <p className="eyebrow">Mixed module</p>
                  <h3>{module.title}</h3>
                </div>
                <span className="metric-pill">{module.items.length} items</span>
              </div>
              <div className="feed-module-list">{module.items.map(renderModuleItem)}</div>
            </section>
          ))}
      </div>
    </AppShell>
  );
}

function renderModuleItem(item: FeedCandidate) {
  const title =
    item.graphPath?.label ??
    item.researcher?.name ??
    item.question ??
    item.memoPrompt ??
    item.paper?.title ??
    "Recommendation";
  const detail =
    item.graphPath?.nodeIds.join(" -> ") ??
    item.researcher?.focus ??
    item.reasons[0]?.detail ??
    item.memoPrompt ??
    "Recommendation candidate";

  return (
    <article className="module-card" key={item.id}>
      <div>
        <strong>{title}</strong>
        <p className="body-copy">{detail}</p>
      </div>
      <span className="score mini-score">{item.score.value}</span>
    </article>
  );
}

function parseFeedMode(value: string | undefined): FeedMode | undefined {
  if (
    value === "for-you" ||
    value === "following" ||
    value === "graph-nearby" ||
    value === "new-evidence" ||
    value === "contradictions"
  ) {
    return value;
  }

  return undefined;
}
