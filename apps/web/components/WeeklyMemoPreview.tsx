"use client";

import { CalendarDays, CheckCircle2, FileText, SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { demoProfile, feedPapers, thesisReport } from "@/lib/mock-data";

type MemoSection = {
  title: string;
  items: string[];
};

type WeeklyMemo = {
  title: string;
  subtitle: string;
  sections: MemoSection[];
};

const fallbackMemo: WeeklyMemo = {
  title: "Weekly memo: descriptor generalization",
  subtitle: `${demoProfile.name} - ${demoProfile.topics[0]} cockpit`,
  sections: [
    {
      title: "What changed this week",
      items: [
        "Shape-sensitive descriptors look worth testing under family-based validation.",
        "Adsorbent surface chemistry remains the highest-risk missing feature family.",
        "Claim-level graph cards are now more useful than paper bookmarks alone."
      ]
    },
    {
      title: "Advisor-ready questions",
      items: [
        "Which validation split best proves novelty for activated carbon adsorption?",
        "Can cross descriptors outperform molecule-only descriptors on leave-one-adsorbate-out tests?",
        "What minimum adsorbent metadata is needed before the model is defensible?"
      ]
    },
    {
      title: "Reading path",
      items: thesisReport.readingPath
    }
  ]
};

async function loadMemo() {
  const response = await fetch("/api/memos/weekly");

  if (!response.ok) {
    throw new Error("Weekly memo endpoint unavailable");
  }

  const result = (await response.json()) as {
    actionItems: string[];
    generatedAt: string;
    papers: typeof feedPapers;
    summary: string;
    themes: string[];
    weekOf: string;
  };

  return {
    sections: [
      {
        items: result.themes,
        title: "What changed this week"
      },
      {
        items: result.actionItems,
        title: "Advisor-ready actions"
      },
      {
        items: result.papers.map((paper) => paper.title),
        title: "Reading path"
      }
    ],
    subtitle: `Generated ${result.generatedAt.slice(0, 10)} - ${demoProfile.topics[0]} cockpit`,
    title: `Weekly memo: ${result.weekOf}`
  };
}

export function WeeklyMemoPreview() {
  const [memo, setMemo] = useState<WeeklyMemo>(fallbackMemo);
  const [status, setStatus] = useState<"mock" | "loading" | "live" | "sent">("mock");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    let mounted = true;

    setStatus("loading");
    loadMemo()
      .then((result) => {
        if (mounted) {
          setMemo(result);
          setStatus("live");
        }
      })
      .catch(() => {
        if (mounted) {
          setMemo(fallbackMemo);
          setStatus("mock");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const focusPaper = feedPapers[selected % feedPapers.length];

  return (
    <section className="panel" style={{ display: "grid", gap: 16 }}>
      <div className="card-head">
        <div>
          <p className="eyebrow">Friday synthesis</p>
          <h3 style={{ margin: "10px 0 0" }}>{memo.title}</h3>
          <p className="meta" style={{ marginBottom: 0 }}>
            {memo.subtitle}
          </p>
        </div>
        <span className="metric-pill">
          <CalendarDays size={14} />
          {status === "loading" ? "Loading" : status === "live" ? "API memo" : status === "sent" ? "Sent" : "Mock memo"}
        </span>
      </div>

      <div className="grid">
        <div className="span-7">
          <div className="panel thesis-box" style={{ boxShadow: "none" }}>
            <div className="card-head">
              <strong>{memo.sections[selected]?.title}</strong>
              <span className="score" style={{ minWidth: 64 }}>
                <strong>{focusPaper.relevance}</strong>
                <span>match</span>
              </span>
            </div>
            <ul className="insight-list" style={{ marginTop: 12 }}>
              {(memo.sections[selected]?.items ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="span-5">
          <div className="paper-card" style={{ boxShadow: "none" }}>
            <FileText color="var(--teal)" size={20} />
            <h3 className="paper-title">{focusPaper.title}</h3>
            <p className="body-copy">{focusPaper.takeaway}</p>
            <div className="metric-row">
              {focusPaper.metrics.map((metric) => (
                <span className="metric-pill" key={metric.label}>
                  {metric.value} {metric.label}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="tag-row">
        {memo.sections.map((section, index) => (
          <button className={selected === index ? "button primary" : "button"} key={section.title} onClick={() => setSelected(index)} type="button">
            {section.title}
          </button>
        ))}
      </div>

      <div className="row-actions">
        <button className="button primary" onClick={() => setStatus("sent")} type="button">
          {status === "sent" ? <CheckCircle2 size={16} /> : <SendHorizontal size={16} />}
          {status === "sent" ? "Queued for advisor" : "Queue advisor memo"}
        </button>
        <span className="metric-pill">{thesisReport.missingEvidence.length} evidence gaps</span>
      </div>
    </section>
  );
}
