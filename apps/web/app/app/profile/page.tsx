import { AppShell } from "@/components/AppShell";
import { ImportWizard } from "@/components/ImportWizard";
import { demoProfile, feedPapers } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <AppShell active="profile">
      <header className="topbar">
        <div>
          <p className="eyebrow">@{demoProfile.handle}</p>
          <h2>{demoProfile.name}</h2>
        </div>
      </header>
      <section className="grid">
        <div className="span-5">
          <ImportWizard />
        </div>
        <div className="panel span-7">
          <h3>Active topics</h3>
          <div className="tag-row">
            {demoProfile.topics.map((topic) => (
              <span className="tag" key={topic}>
                {topic}
              </span>
            ))}
          </div>
          <h3>Authored / saved demo papers</h3>
          <ul className="insight-list">
            {feedPapers.map((paper) => (
              <li key={paper.id}>{paper.title}</li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
