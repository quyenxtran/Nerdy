"use client";

import { CheckCircle2, FlaskConical, Radar, ShieldAlert, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { demoProfile, thesisReport } from "@/lib/mock-data";

type ValidationReport = typeof thesisReport;

const starterThesis =
  "Molecule-adsorbent cross descriptors can improve LOAO generalization for adsorption of branched and unsaturated organic acids on activated carbon.";

async function validateThesis(thesis: string) {
  const response = await fetch("/api/thesis/validate", {
    body: JSON.stringify({ thesis }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Thesis validation endpoint unavailable");
  }

  return (await response.json()) as ValidationReport;
}

export function ThesisValidationForm() {
  const [thesis, setThesis] = useState(starterThesis);
  const [report, setReport] = useState<ValidationReport>(thesisReport);
  const [status, setStatus] = useState<"idle" | "running" | "ready">("idle");

  async function runValidation(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!thesis.trim()) {
      return;
    }

    setStatus("running");
    try {
      setReport(await validateThesis(thesis));
    } catch {
      setReport({
        ...thesisReport,
        noveltyAngle: thesis.toLowerCase().includes("cross descriptor")
          ? thesisReport.noveltyAngle
          : "Clarify the descriptor family, validation split, and target adsorption system before judging novelty."
      });
    } finally {
      setStatus("ready");
    }
  }

  return (
    <section className="grid">
      <form className="panel span-5" onSubmit={runValidation} style={{ display: "grid", gap: 14 }}>
        <div className="card-head">
          <div>
            <p className="eyebrow">Novelty and overlap</p>
            <h3 style={{ margin: "10px 0 0" }}>Stress-test a thesis</h3>
          </div>
          <Radar color="var(--gold)" />
        </div>

        <label className="meta" htmlFor="thesis-input">
          Research idea
        </label>
        <textarea
          className="button"
          id="thesis-input"
          onChange={(event) => setThesis(event.target.value)}
          rows={9}
          style={{ alignItems: "flex-start", height: "auto", justifyContent: "flex-start", resize: "vertical", width: "100%" }}
          value={thesis}
        />

        <div className="panel thesis-box" style={{ boxShadow: "none" }}>
          <strong>{demoProfile.name}'s active frame</strong>
          <p className="body-copy" style={{ marginTop: 8 }}>
            {demoProfile.thesis}
          </p>
        </div>

        <button className="button primary" disabled={status === "running" || thesis.trim().length === 0} type="submit">
          {status === "running" ? <FlaskConical size={16} /> : status === "ready" ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
          {status === "running" ? "Scanning..." : status === "ready" ? "Validation refreshed" : "Run validation"}
        </button>
      </form>

      <div className="panel span-7" style={{ display: "grid", gap: 16 }}>
        <div className="card-head">
          <div>
            <p className="eyebrow">Mock validation report</p>
            <h3 style={{ margin: "10px 0 0" }}>Defensibility snapshot</h3>
          </div>
          <span className="metric-pill">
            <ShieldAlert size={14} />
            Risk: {report.overlapRisk}
          </span>
        </div>

        <div className="grid">
          <div className="metric-card span-4" style={{ boxShadow: "none" }}>
            <strong>{report.noveltyScore}</strong>
            <span className="meta">novelty score</span>
          </div>
          <div className="metric-card span-4" style={{ boxShadow: "none" }}>
            <strong>{Math.round(report.confidence * 100)}%</strong>
            <span className="meta">confidence</span>
          </div>
          <div className="metric-card span-4" style={{ boxShadow: "none" }}>
            <strong>{report.missingEvidence.length}</strong>
            <span className="meta">evidence gaps</span>
          </div>
        </div>

        <div className="panel thesis-box" style={{ boxShadow: "none" }}>
          <strong>Novelty angle</strong>
          <p className="body-copy" style={{ marginTop: 8 }}>
            {report.noveltyAngle}
          </p>
        </div>

        <div>
          <h3>Missing evidence</h3>
          <ul className="insight-list">
            {report.missingEvidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Suggested reading path</h3>
          <div className="tag-row">
            {report.readingPath.map((title) => (
              <span className="tag" key={title}>
                {title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
