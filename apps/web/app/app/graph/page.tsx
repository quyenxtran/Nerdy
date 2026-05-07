import { AppShell } from "@/components/AppShell";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { graphEdges, graphNodes } from "@/lib/mock-data";

export default function GraphPage() {
  return (
    <AppShell active="graph">
      <header className="topbar">
        <div>
          <p className="eyebrow">Research memory loop</p>
          <h2>Knowledge graph</h2>
        </div>
        <div className="tag-row">
          <span className="tag">papers</span>
          <span className="tag">claims</span>
          <span className="tag">methods</span>
          <span className="tag">thesis</span>
        </div>
      </header>
      <section className="grid">
        <div className="panel span-12 graph-panel">
          <KnowledgeGraph nodes={graphNodes} edges={graphEdges} />
        </div>
        <aside className="panel span-12">
          <h3>Selected path</h3>
          <ul className="insight-list path-list">
            <li>Shape descriptor paper -&gt; USES -&gt; family-based validation</li>
            <li>cross descriptors -&gt; IMPROVES -&gt; LOAO thesis</li>
            <li>molecule-only features fail -&gt; RELEVANT_TO -&gt; LOAO thesis</li>
          </ul>
        </aside>
      </section>
    </AppShell>
  );
}
