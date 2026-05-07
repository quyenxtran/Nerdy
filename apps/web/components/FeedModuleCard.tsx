"use client";

import { AlertTriangle, Bookmark, MessageCircle, NotebookText } from "lucide-react";
import Link from "next/link";
import type { FeedCandidate, SignalEntityType, SignalType } from "@/lib/contracts";

export function FeedModuleCard({ item }: { item: FeedCandidate }) {
  const title =
    item.graphPath?.label ??
    item.researcher?.name ??
    item.question ??
    item.memoPrompt ??
    item.paper?.title ??
    "Recommendation";
  const detail =
    item.graphPath?.nodeIds.join(" -> ") ??
    item.researcher?.focus ??
    item.reasons[0]?.detail ??
    item.memoPrompt ??
    "Recommendation candidate";

  async function postSignal(type: SignalType, entityType: SignalEntityType, entityId: string, weight: number) {
    try {
      await fetch("/api/signals", {
        body: JSON.stringify({
          entityId,
          entityType,
          metadata: { candidateId: item.id, source: item.source },
          type,
          weight
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
    } catch {
      // Module actions should stay usable even if feedback capture fails.
    }
  }

  return (
    <article className="module-card">
      <div>
        <strong>{title}</strong>
        <p className="body-copy">{detail}</p>
        <div className="module-actions">
          <Link className="feedback-button" href={`/app/assistant?context=${encodeURIComponent(title)}`}>
            <MessageCircle size={13} />
            Ask
          </Link>
          {item.graphPath ? (
            <>
              <button
                className="feedback-button"
                onClick={() => void postSignal("graph_node_open", "graph_path", item.graphPath?.id ?? item.id, 0.74)}
                type="button"
              >
                <Bookmark size={13} />
                Save path
              </button>
              <button
                className="feedback-button"
                onClick={() => void postSignal("claim_report", "graph_path", item.graphPath?.id ?? item.id, 0.82)}
                type="button"
              >
                <AlertTriangle size={13} />
                Report edge
              </button>
            </>
          ) : null}
          {item.researcher ? (
            <button
              className="feedback-button"
              onClick={() => void postSignal("paper_save", "researcher", item.researcher?.id ?? item.id, 0.52)}
              type="button"
            >
              <Bookmark size={13} />
              Save researcher
            </button>
          ) : null}
          <button
            className="feedback-button"
            onClick={() => void postSignal("memo_generate", "memo", "weekly-evidence", 0.68)}
            type="button"
          >
            <NotebookText size={13} />
            Add to memo
          </button>
        </div>
      </div>
      <span className="score mini-score">{item.score.value}</span>
    </article>
  );
}
