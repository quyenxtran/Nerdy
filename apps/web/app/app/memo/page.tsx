import { AppShell } from "@/components/AppShell";
import { WeeklyMemoPreview } from "@/components/WeeklyMemoPreview";
import { weeklyMemo } from "@/lib/mock-data";

export default function MemoPage() {
  return (
    <AppShell active="memo">
      <header className="topbar">
        <div>
          <p className="eyebrow">{weeklyMemo.period}</p>
          <h2>{weeklyMemo.title}</h2>
        </div>
      </header>
      <WeeklyMemoPreview />
      <div style={{ height: 16 }} />
      <section className="grid">
        <div className="panel span-7">
          <h3>Main themes</h3>
          <ul className="insight-list">
            {weeklyMemo.themes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel span-5">
          <h3>Questions for advisor</h3>
          <ul className="insight-list">
            {weeklyMemo.advisorQuestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel span-4">
          <h3>Useful ideas</h3>
          <ul className="insight-list">
            {weeklyMemo.usefulIdeas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel span-4">
          <h3>Contradictions</h3>
          <ul className="insight-list">
            {weeklyMemo.contradictions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel span-4">
          <h3>Next reads</h3>
          <ul className="insight-list">
            {weeklyMemo.nextReads.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
