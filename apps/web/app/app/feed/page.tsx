import { AppShell } from "@/components/AppShell";
import { PaperFeedCard } from "@/components/PaperFeedCard";
import { feedPapers } from "@/lib/mock-data";

export default function FeedPage() {
  return (
    <AppShell active="feed">
      <header className="topbar">
        <div>
          <p className="eyebrow">Daily curiosity loop</p>
          <h2>Paper feed</h2>
        </div>
        <span className="metric-pill">3 high-relevance papers</span>
      </header>
      <div className="dashboard">
        {feedPapers.map((paper, index) => (
          <PaperFeedCard featured={index === 0} key={paper.id} paper={paper} />
        ))}
      </div>
    </AppShell>
  );
}
