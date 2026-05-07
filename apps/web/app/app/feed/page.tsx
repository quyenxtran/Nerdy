import { AppShell } from "@/components/AppShell";
import { FeedModuleCard } from "@/components/FeedModuleCard";
import { PaperFeedCard } from "@/components/PaperFeedCard";
import type { FeedMode } from "@/lib/contracts";
import { getFeed, getSignals } from "@/lib/services";
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
  const signalTrace = getSignals();
  const recentSignals = signalTrace.signals.slice(-4).reverse();
  const recentImpressions = signalTrace.impressions.slice(-5).reverse();
  const paperRecommendations = new Map(
    feed.modules
      ?.flatMap((module) => module.items)
      .filter((candidate) => candidate.kind === "paper" && candidate.paper)
      .map((candidate) => [candidate.paper?.id, candidate]) ?? []
  );

  return (
    <AppShell active="feed">
      <section className="feed-shell">
        <header className="feed-hero">
          <div className="feed-hero-copy">
            <p className="eyebrow">Daily curiosity loop</p>
            <h1>Ranked research, with the receipt attached.</h1>
            <p className="lead">
              PaperGraph now treats every save, skip, question, and graph visit as a signal. The feed stays bright,
              auditable, and tuned to the active thesis.
            </p>
          </div>
          <aside className="feed-hero-panel">
            <span className="feed-kicker">Mode</span>
            <strong>{feedModes.find((item) => item.mode === feed.mode)?.label ?? "For You"}</strong>
            <p>{feed.debug?.candidateCount ?? 0} candidates scored before visibility filters.</p>
            <div className="metric-row">
              <span className="metric-pill">{feed.papers.length} ranked papers</span>
              <span className="metric-pill">{feed.debug?.filteredCount ?? 0} filtered</span>
            </div>
          </aside>
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

        <div className="feed-layout">
          <main className="feed-stream" aria-label="Ranked paper feed">
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
                  <div className="feed-module-list">
                    {module.items.map((item) => (
                      <FeedModuleCard item={item} key={item.id} />
                    ))}
                  </div>
                </section>
              ))}
          </main>

          <aside className="feed-rail" aria-label="Feed observability">
            <section className="panel trace-panel">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Rank trace</p>
                  <h3>Why things moved</h3>
                </div>
                <Link className="feedback-button" href="/app/debug">
                  Open debug
                </Link>
              </div>
              <ul className="trace-list">
                {(feed.debug?.topReasons ?? []).map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </section>

            <section className="panel trace-panel">
              <p className="eyebrow">Recent signals</p>
              <ul className="trace-list mono-list">
                {recentSignals.map((signal) => (
                  <li key={signal.id}>
                    <strong>{signal.type}</strong>
                    <span>{signal.entityId}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel trace-panel">
              <p className="eyebrow">Impressions</p>
              <ul className="trace-list mono-list">
                {recentImpressions.map((impression) => (
                  <li key={impression.id}>
                    <strong>{impression.score}</strong>
                    <span>{impression.entityId}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </section>
    </AppShell>
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
