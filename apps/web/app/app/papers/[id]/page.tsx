import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { feedPapers, graphEdges, graphNodes, graphPaths } from "@/lib/mock-data";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { RepostComposer } from "@/components/RepostComposer";

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = feedPapers.find((item) => item.id === id);

  if (!paper) {
    notFound();
  }

  return (
    <AppShell active="paper">
      <article className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {paper.venue} · {paper.year}
            </p>
            <h2>{paper.title}</h2>
            <p className="lead">{paper.takeaway}</p>
          </div>
          <div className="score">
            <strong>{paper.relevance}</strong>
            <span>match</span>
          </div>
        </header>

        <section className="grid">
          <div className="panel span-8">
            <h3>Insight cards</h3>
            <ul className="insight-list">
              {paper.cards.map((card) => (
                <li key={card.id}>
                  <span className="tag">{card.type}</span>
                  <h3 style={{ marginTop: 10 }}>{card.title}</h3>
                  <p className="body-copy">{card.body}</p>
                  <p className="meta">Source: {card.source}</p>
                </li>
              ))}
            </ul>
          </div>
          <aside className="panel span-4">
            <h3>Research actions</h3>
            <div className="row-actions">
              <button className="button primary" type="button">
                Save to graph
              </button>
              <button className="button" type="button">
                Ask AI
              </button>
              <button className="button" type="button">
                Repost
              </button>
            </div>
          </aside>
          <div className="span-12">
            <RepostComposer paper={paper} />
          </div>
          <div className="panel span-12">
            <h3>Related graph preview</h3>
            <KnowledgeGraph nodes={graphNodes} edges={graphEdges} paths={graphPaths} compact />
          </div>
        </section>
      </article>
    </AppShell>
  );
}
