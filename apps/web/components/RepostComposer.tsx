"use client";

import { CheckCircle2, Copy, ExternalLink, Repeat2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { demoProfile, feedPapers, sharePosts } from "@/lib/mock-data";
import type { FeedPaper } from "@/lib/mock-data";

type RepostDraft = {
  id: string;
  note: string;
  visibility: string;
  paper: FeedPaper;
};

const defaultPaper = sharePosts[0]?.paper ?? feedPapers[0];
const defaultNote =
  sharePosts[0]?.note ??
  "This paper is useful because it connects directly to my thesis and exposes a testable next step.";

async function postRepost(draft: RepostDraft) {
  const response = await fetch("/api/social/reposts", {
    body: JSON.stringify({
      note: draft.note,
      paperId: draft.paper.id,
      visibility: draft.visibility
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Repost endpoint unavailable");
  }

  const result = (await response.json()) as { repost?: Partial<RepostDraft> & { id?: string } };

  return {
    id: result.repost?.id,
    url: result.repost?.id ? `/share/${result.repost.id}` : undefined
  };
}

async function postRepostSignal(draft: RepostDraft) {
  try {
    await fetch("/api/signals", {
      body: JSON.stringify({
        entityId: draft.paper.id,
        entityType: "paper",
        metadata: { tags: draft.paper.tags, visibility: draft.visibility },
        type: "paper_repost",
        weight: 0.88
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
  } catch {
    // Repost publishing should not depend on the recommendation signal write.
  }
}

export function RepostComposer({ paper = defaultPaper }: { paper?: FeedPaper }) {
  const [note, setNote] = useState(defaultNote);
  const [visibility, setVisibility] = useState(sharePosts[0]?.visibility ?? "Public preview");
  const [status, setStatus] = useState<"idle" | "posting" | "posted">("idle");
  const [shareUrl, setShareUrl] = useState(`/share/${sharePosts[0]?.id ?? "post-1"}`);

  const suggestedHook = `${paper.takeaway} I would test this against ${demoProfile.topics[1].toLowerCase()} before treating the random-split result as reliable.`;
  const charactersLeft = 320 - note.length;

  async function publishDraft() {
    const localDraft: RepostDraft = {
      id: sharePosts[0]?.id ?? "post-1",
      note,
      paper,
      visibility
    };

    setStatus("posting");
    try {
      const result = await postRepost(localDraft);
      setShareUrl(result.url ?? `/share/${result.id ?? localDraft.id}`);
    } catch {
      setShareUrl(`/share/${localDraft.id}`);
    } finally {
      void postRepostSignal(localDraft);
      setStatus("posted");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${shareUrl}`);
    } catch {
      await navigator.clipboard.writeText(shareUrl);
    }
  }

  return (
    <section className="panel" style={{ display: "grid", gap: 16 }}>
      <div className="card-head">
        <div>
          <p className="eyebrow">Research-native repost</p>
          <h3 style={{ margin: "10px 0 0" }}>Share with evidence attached</h3>
        </div>
        <span className="metric-pill">
          <Repeat2 size={14} />
          Mock-first
        </span>
      </div>

      <article className="paper-card featured" style={{ boxShadow: "none" }}>
        <div className="card-head">
          <div>
            <p className="meta">
              {paper.authors} - {paper.venue} - {paper.year}
            </p>
            <h3 className="paper-title">{paper.title}</h3>
          </div>
          <div className="score">
            <strong>{paper.relevance}</strong>
            <span>match</span>
          </div>
        </div>
        <p className="body-copy">{paper.reason}</p>
        <div className="tag-row">
          {paper.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </article>

      <div style={{ display: "grid", gap: 10 }}>
        <div className="card-head">
          <label className="meta" htmlFor="repost-note">
            Repost note
          </label>
          <button className="button" onClick={() => setNote(suggestedHook.slice(0, 320))} type="button">
            <Sparkles size={14} />
            Use AI hook
          </button>
        </div>
        <textarea
          className="button"
          id="repost-note"
          maxLength={320}
          onChange={(event) => setNote(event.target.value)}
          rows={5}
          style={{ alignItems: "flex-start", height: "auto", justifyContent: "flex-start", resize: "vertical", width: "100%" }}
          value={note}
        />
        <div className="card-head">
          <span className={charactersLeft < 24 ? "metric-pill" : "tag"}>{charactersLeft} chars left</span>
          <select
            className="button"
            onChange={(event) => setVisibility(event.target.value)}
            style={{ minHeight: 36 }}
            value={visibility}
          >
            <option>Public preview</option>
            <option>Lab only</option>
            <option>Private draft</option>
          </select>
        </div>
      </div>

      <div className="panel thesis-box" style={{ boxShadow: "none" }}>
        <strong>Preview</strong>
        <p className="body-copy" style={{ marginTop: 8 }}>
          {note || "Add a short reason this paper matters."}
        </p>
        <div className="metric-row" style={{ marginTop: 12 }}>
          <span className="metric-pill">{visibility}</span>
          <span className="metric-pill">{paper.cards.length} evidence cards</span>
          <span className="metric-pill">{paper.tags[0]}</span>
        </div>
      </div>

      <div className="row-actions">
        <button className="button primary" disabled={status === "posting" || note.trim().length === 0} onClick={publishDraft} type="button">
          {status === "posted" ? <CheckCircle2 size={16} /> : <Repeat2 size={16} />}
          {status === "posting" ? "Publishing..." : status === "posted" ? "Published locally" : "Publish repost"}
        </button>
        <button className="button" disabled={status !== "posted"} onClick={copyLink} type="button">
          <Copy size={16} />
          Copy link
        </button>
        <Link className="button" href={shareUrl}>
          <ExternalLink size={16} />
          Open preview
        </Link>
      </div>
    </section>
  );
}
