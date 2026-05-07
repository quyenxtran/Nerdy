import { AppShell } from "@/components/AppShell";
import { ImportWizard } from "@/components/ImportWizard";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { MetricCard } from "@/components/MetricCard";
import { PaperFeedCard } from "@/components/PaperFeedCard";
import { WeeklyMemoPreview } from "@/components/WeeklyMemoPreview";
import { demoProfile, feedPapers, graphEdges, graphNodes, thesisReport } from "@/lib/mock-data";

export default function AppHomePage() {
  return (
    <AppShell active="cockpit">
      <div className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">Demo workspace</p>
            <h2>Research cockpit</h2>
          </div>
          <div className="tag-row">
            {demoProfile.topics.map((topic) => (
              <span className="tag" key={topic}>
                {topic}
              </span>
            ))}
          </div>
        </header>

        <section className="panel thesis-box">
          <h3>{demoProfile.name}'s active thesis</h3>
          <p className="body-copy">{demoProfile.thesis}</p>
        </section>

        <section className="grid">
          <MetricCard label="Saved papers" value="18" note="Enough to show the compounding memory loop." />
          <MetricCard label="Questions" value="42" note="Questions become first-class research objects." />
          <MetricCard label="Thesis score" value={`${thesisReport.noveltyScore}`} note="Mock report, confidence-labeled." />
          <div className="span-7">
            <PaperFeedCard paper={feedPapers[0]} featured />
          </div>
          <div className="span-5">
            <WeeklyMemoPreview />
          </div>
          <div className="span-12">
            <ImportWizard />
          </div>
          <div className="panel span-12">
            <h3>Current graph</h3>
            <KnowledgeGraph nodes={graphNodes} edges={graphEdges} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
