import { AppShell } from "@/components/AppShell";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { graphEdges, graphNodes, graphPaths } from "@/lib/mock-data";

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
      <section className="graph-panel">
        <KnowledgeGraph nodes={graphNodes} edges={graphEdges} paths={graphPaths} />
      </section>
    </AppShell>
  );
}
