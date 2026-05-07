import { AppShell } from "@/components/AppShell";
import { PaperFeedCard } from "@/components/PaperFeedCard";
import { getFeed } from "@/lib/services";

export default function FeedPage() {
  const feed = getFeed();
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
      <div className="dashboard">
        {feed.papers.map((paper, index) => (
          <PaperFeedCard
            featured={index === 0}
            key={paper.id}
            paper={paper}
            recommendation={paperRecommendations.get(paper.id)}
          />
        ))}
      </div>
    </AppShell>
  );
}
