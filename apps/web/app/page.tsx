import { ArrowRight, Brain, GitBranch, MessageSquare, Network, Repeat2, Sparkles } from "lucide-react";
import Link from "next/link";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { PaperFeedCard } from "@/components/PaperFeedCard";
import { feedPapers, graphEdges, graphNodes, graphPaths, thesisReport } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <main className="main">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Personal research OS · social knowledge graph</span>
          <h1>Build a living graph from every paper you read.</h1>
          <p className="lead">
            PaperGraph AI helps researchers discover papers, validate ideas, and turn reading into cited memory,
            visual relationships, advisor-ready synthesis, and research-native sharing.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/app">
              Open app demo
              <ArrowRight size={18} />
            </Link>
            <Link className="button" href="/app/thesis-validator">
              Test a thesis
              <Brain size={18} />
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-visual-caption">
            <span className="eyebrow">Evidence paths · claim graph · thesis radar</span>
            <p className="body-copy">{thesisReport.noveltyAngle}</p>
            <div className="metric-row">
              <span className="metric-pill">Risk: {thesisReport.overlapRisk}</span>
              <span className="metric-pill">Novelty: {thesisReport.noveltyScore}/100</span>
              <span className="metric-pill">Confidence: {Math.round(thesisReport.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="panel span-5">
          <Sparkles color="var(--teal)" />
          <h3>Daily curiosity feed</h3>
          <p className="body-copy">Each paper explains why it matters to the researcher before asking for attention.</p>
        </div>
        <div className="panel span-7">
          <Network color="var(--blue)" />
          <h3>Evidence graph</h3>
          <p className="body-copy">Saved papers become claims, methods, questions, and thesis relationships.</p>
        </div>
        <div className="panel span-12">
          <Repeat2 color="var(--gold)" />
          <h3>Research-native sharing</h3>
          <p className="body-copy">Reposts carry notes, questions, evidence, and useful context for collaborators.</p>
        </div>
        <div className="span-12">
          <PaperFeedCard paper={feedPapers[0]} featured />
        </div>
        <div className="panel span-7">
          <h3>Graph-first product wedge</h3>
          <KnowledgeGraph nodes={graphNodes} edges={graphEdges} paths={graphPaths} compact />
        </div>
        <div className="panel span-5">
          <MessageSquare color="var(--green)" />
          <h3>Cited assistant loop</h3>
          <ul className="insight-list">
            <li>Ask what saved papers imply for a thesis.</li>
            <li>Trace answers to paper cards and evidence snippets.</li>
            <li>Write useful synthesis back into the wiki.</li>
          </ul>
          <Link className="button" href="/app/assistant" style={{ marginTop: 14 }}>
            Ask demo assistant
          </Link>
        </div>
      </section>
    </main>
  );
}
