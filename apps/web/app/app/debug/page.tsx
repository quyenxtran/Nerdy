import { AppShell } from "@/components/AppShell";
import { getPersistenceAdapter } from "@/lib/mock-store";
import { getFeed, getSignals } from "@/lib/services";

export default function DebugPage() {
  const signalTrace = getSignals();
  const feed = getFeed({ debug: true, limit: 8 });
  const adapter = getPersistenceAdapter();
  const recentSignals = signalTrace.signals.slice(-12).reverse();
  const recentImpressions = signalTrace.impressions.slice(-16).reverse();

  return (
    <AppShell active="debug">
      <section className="debug-page">
        <header className="feed-hero">
          <div className="feed-hero-copy">
            <p className="eyebrow">Observability</p>
            <h1>Recommendation trace console.</h1>
            <p className="lead">
              Inspect the local signal stream, feed impressions, ranking reasons, and persistence adapter state while
              the recommendation loop is still mock-first.
            </p>
          </div>
          <aside className="feed-hero-panel">
            <span className="feed-kicker">Mock adapter</span>
            <strong>{adapter.name}</strong>
            <p>Signals and impressions persist locally without requiring a database migration yet.</p>
          </aside>
        </header>

        <section className="debug-grid">
          <article className="panel trace-panel">
            <p className="eyebrow">Feed summary</p>
            <div className="debug-stat-grid">
              <span>
                <strong>{feed.debug?.candidateCount ?? 0}</strong>
                candidates
              </span>
              <span>
                <strong>{feed.debug?.filteredCount ?? 0}</strong>
                filtered
              </span>
              <span>
                <strong>{feed.papers.length}</strong>
                papers
              </span>
            </div>
            <ul className="trace-list">
              {(feed.debug?.topReasons ?? []).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </article>

          <article className="panel trace-panel">
            <p className="eyebrow">Signals</p>
            <ul className="trace-list mono-list">
              {recentSignals.map((signal) => (
                <li key={signal.id}>
                  <strong>{signal.type}</strong>
                  <span>{signal.entityType}:{signal.entityId}</span>
                  <em>{signal.weight.toFixed(2)}</em>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel trace-panel span-debug-wide">
            <p className="eyebrow">Feed impressions</p>
            <ul className="debug-table">
              {recentImpressions.map((impression) => (
                <li key={impression.id}>
                  <span>{impression.mode}</span>
                  <strong>{impression.entityId}</strong>
                  <em>{impression.entityType}</em>
                  <code>{impression.score}</code>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </section>
    </AppShell>
  );
}
