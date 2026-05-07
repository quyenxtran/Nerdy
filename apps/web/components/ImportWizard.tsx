"use client";

import { CheckCircle2, FileUp, Link2, Loader2, Network, WandSparkles } from "lucide-react";
import { useState } from "react";
import { feedPapers } from "@/lib/mock-data";
import type { FeedPaper } from "@/lib/mock-data";

type ImportMode = "doi" | "pdf" | "bibtex";

type ImportResult = {
  paper: FeedPaper;
  extractedCards: number;
  graphEdges: number;
};

const fallbackResult: ImportResult = {
  extractedCards: feedPapers[2].cards.length,
  graphEdges: 6,
  paper: feedPapers[2]
};

async function importPaper(mode: ImportMode, value: string) {
  const response = await fetch("/api/papers/import", {
    body: JSON.stringify({
      query: value,
      source: mode === "doi" ? "doi" : mode === "pdf" ? "url" : "manual",
      tags: [mode, "imported"]
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Import endpoint unavailable");
  }

  const result = (await response.json()) as { paper: FeedPaper };

  return {
    extractedCards: result.paper.cards.length,
    graphEdges: 6,
    paper: result.paper
  };
}

export function ImportWizard() {
  const [mode, setMode] = useState<ImportMode>("doi");
  const [value, setValue] = useState("10.0000/papergraph-demo-kg-review");
  const [status, setStatus] = useState<"idle" | "importing" | "ready">("idle");
  const [result, setResult] = useState<ImportResult | null>(null);

  async function runImport() {
    setStatus("importing");
    try {
      setResult(await importPaper(mode, value));
    } catch {
      setResult(fallbackResult);
    } finally {
      setStatus("ready");
    }
  }

  const steps = [
    { icon: FileUp, label: "Capture source", state: value.trim() ? "Ready" : "Waiting" },
    { icon: WandSparkles, label: "Extract cards", state: status === "ready" ? "Done" : "Mock parser" },
    { icon: Network, label: "Attach graph edges", state: result ? `${result.graphEdges} edges` : "Pending" }
  ];

  return (
    <section className="panel" style={{ display: "grid", gap: 16 }}>
      <div className="card-head">
        <div>
          <p className="eyebrow">Import cockpit</p>
          <h3 style={{ margin: "10px 0 0" }}>Turn a paper into graph memory</h3>
        </div>
        <span className="metric-pill">
          <Link2 size={14} />
          DOI, PDF, BibTeX
        </span>
      </div>

      <div className="tag-row" role="tablist">
        {(["doi", "pdf", "bibtex"] as ImportMode[]).map((item) => (
          <button className={mode === item ? "button primary" : "button"} key={item} onClick={() => setMode(item)} type="button">
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <label className="meta" htmlFor="import-source">
          Source
        </label>
        <textarea
          className="button"
          id="import-source"
          onChange={(event) => setValue(event.target.value)}
          placeholder={mode === "doi" ? "Paste DOI..." : mode === "pdf" ? "Paste PDF URL..." : "Paste BibTeX entry..."}
          rows={4}
          style={{ alignItems: "flex-start", height: "auto", justifyContent: "flex-start", resize: "vertical", width: "100%" }}
          value={value}
        />
      </div>

      <div className="grid">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div className="panel span-4" key={step.label} style={{ boxShadow: "none" }}>
              <Icon color="var(--teal)" size={20} />
              <h3 style={{ marginTop: 10 }}>{step.label}</h3>
              <span className="metric-pill">{step.state}</span>
            </div>
          );
        })}
      </div>

      {result ? (
        <article className="paper-card featured" style={{ boxShadow: "none" }}>
          <div className="card-head">
            <div>
              <p className="meta">
                {result.paper.authors} - {result.paper.venue} - {result.paper.year}
              </p>
              <h3 className="paper-title">{result.paper.title}</h3>
            </div>
            <span className="score">
              <strong>{result.extractedCards}</strong>
              <span>cards</span>
            </span>
          </div>
          <p className="body-copy">{result.paper.reason}</p>
          <div className="tag-row">
            {result.paper.cards.map((card) => (
              <span className="tag" key={card.id}>
                {card.type}: {card.title}
              </span>
            ))}
          </div>
        </article>
      ) : null}

      <button className="button primary" disabled={status === "importing" || value.trim().length === 0} onClick={runImport} type="button">
        {status === "importing" ? <Loader2 size={16} /> : status === "ready" ? <CheckCircle2 size={16} /> : <FileUp size={16} />}
        {status === "importing" ? "Importing..." : status === "ready" ? "Imported to graph" : "Import paper"}
      </button>
    </section>
  );
}
