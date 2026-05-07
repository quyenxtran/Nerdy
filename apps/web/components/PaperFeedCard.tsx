"use client";

import { Bookmark, Heart, MessageCircle, Repeat2, SkipForward } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { FeedPaper } from "@/lib/mock-data";

export function PaperFeedCard({ paper, featured = false }: { paper: FeedPaper; featured?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [hearted, setHearted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const metricValue = (label: string) => paper.metrics.find((metric) => metric.label === label)?.value ?? 0;
  const saveCount = metricValue("saves") + (saved ? 1 : 0);
  const questionCount = metricValue("questions");
  const repostCount = metricValue("reposts");

  if (hidden) {
    return (
      <div className="paper-card">
        <p className="body-copy">Skipped for this session.</p>
        <button className="button" onClick={() => setHidden(false)} type="button">
          Restore paper
        </button>
      </div>
    );
  }

  return (
    <article className={featured ? "paper-card featured" : "paper-card"}>
      <div className="card-head">
        <div>
          <p className="meta">
            {paper.authors} · {paper.venue} · {paper.year}
          </p>
          <h3 className="paper-title">
            <Link href={`/app/papers/${paper.id}`}>{paper.title}</Link>
          </h3>
        </div>
        <div className="score">
          <strong>{paper.relevance}</strong>
          <span>match</span>
        </div>
      </div>
      <p className="body-copy">{paper.takeaway}</p>
      <div className="panel thesis-box">
        <strong>Why it matters</strong>
        <p className="body-copy" style={{ marginTop: 8 }}>
          {paper.reason}
        </p>
      </div>
      <div className="tag-row">
        {paper.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="row-actions">
        <button
          aria-label={`${hearted ? "Remove heart from" : "Heart"} ${paper.title}`}
          className={hearted ? "button action-count primary" : "button action-count"}
          onClick={() => setHearted((value) => !value)}
          title={`${saveCount} saves`}
          type="button"
        >
          <span>{saveCount}</span>
          <Heart size={16} />
        </button>
        <Link
          aria-label={`Ask about ${paper.title}`}
          className="button action-count"
          href={`/app/assistant?paper=${paper.id}`}
          title={`${questionCount} questions`}
        >
          <span>{questionCount}</span>
          <MessageCircle size={16} />
        </Link>
        <Link className="button action-count" href={`/share/post-1`} title={`${repostCount} reposts`}>
          <span>{repostCount}</span>
          <Repeat2 size={16} />
        </Link>
        <button className="button icon" onClick={() => setHidden(true)} title="Skip paper" type="button">
          <SkipForward size={16} />
        </button>
        <button
          className={saved ? "button primary save-action" : "button save-action"}
          onClick={() => setSaved((value) => !value)}
          type="button"
        >
          <Bookmark size={16} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}
