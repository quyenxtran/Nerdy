import { graphEdges, graphNodes, graphPaths } from "@/lib/mock-data";
import type { RecommendationFeature } from "@/lib/contracts";
import type { CandidateDraft, RecommendationContext } from "./types";

const POSITIVE_SIGNAL_TYPES = new Set(["paper_open", "paper_save", "paper_heart", "assistant_ask", "paper_repost"]);
const NEGATIVE_SIGNAL_TYPES = new Set(["paper_skip", "tag_mute", "claim_report"]);

const MODE_WEIGHTS = {
  "for-you": {
    thesis_overlap: 0.24,
    graph_distance: 0.18,
    evidence_count: 0.14,
    novelty_value: 0.12,
    positive_signal: 0.18,
    social_proof: 0.08,
    recency: 0.04,
    fatigue_penalty: -0.26,
    weak_provenance_penalty: -0.22
  },
  following: {
    thesis_overlap: 0.16,
    graph_distance: 0.08,
    evidence_count: 0.1,
    novelty_value: 0.08,
    positive_signal: 0.2,
    social_proof: 0.24,
    recency: 0.06,
    fatigue_penalty: -0.28,
    weak_provenance_penalty: -0.2
  },
  "graph-nearby": {
    thesis_overlap: 0.16,
    graph_distance: 0.36,
    evidence_count: 0.16,
    novelty_value: 0.1,
    positive_signal: 0.1,
    social_proof: 0.04,
    recency: 0.02,
    fatigue_penalty: -0.24,
    weak_provenance_penalty: -0.2
  },
  "new-evidence": {
    thesis_overlap: 0.14,
    graph_distance: 0.12,
    evidence_count: 0.24,
    novelty_value: 0.12,
    positive_signal: 0.1,
    social_proof: 0.06,
    recency: 0.2,
    fatigue_penalty: -0.22,
    weak_provenance_penalty: -0.28
  },
  contradictions: {
    thesis_overlap: 0.16,
    graph_distance: 0.14,
    evidence_count: 0.14,
    novelty_value: 0.32,
    positive_signal: 0.08,
    social_proof: 0.04,
    recency: 0.04,
    fatigue_penalty: -0.22,
    weak_provenance_penalty: -0.24
  }
} satisfies Record<string, Record<string, number>>;

export function hydrateFeatures(candidate: CandidateDraft, context: RecommendationContext): CandidateDraft {
  const features =
    candidate.kind === "paper" && candidate.paper
      ? paperFeatures(candidate, context)
      : moduleFeatures(candidate, context);

  return {
    ...candidate,
    score: {
      value: candidate.score?.value ?? 0,
      features
    }
  };
}

function paperFeatures(candidate: CandidateDraft, context: RecommendationContext): RecommendationFeature[] {
  const paper = candidate.paper;

  if (!paper) {
    return [];
  }

  const positiveSignal = positiveSignalValue(paper.id, paper.tags, context);
  const fatigue = fatigueValue(paper.id, paper.tags, context);
  const weights = MODE_WEIGHTS[context.mode];

  return [
    feature("thesis_overlap", "Thesis topic overlap", thesisOverlap(paper, context), weights.thesis_overlap, "boost"),
    feature("graph_distance", "Graph distance to thesis", graphProximity(paper.id), weights.graph_distance, "boost"),
    feature("evidence_count", "Evidence card count", Math.min(1, paper.cards.length / 4), weights.evidence_count, "boost"),
    feature("novelty_value", "Novelty or contradiction value", noveltyValue(paper), weights.novelty_value, "boost"),
    feature("positive_signal", "Positive user signal match", positiveSignal, weights.positive_signal, "boost"),
    feature("social_proof", "Research social proof", Math.min(1, candidate.socialProof.length / 3), weights.social_proof, "boost"),
    feature("recency", "Paper recency", recencyValue(paper.year), weights.recency, "boost"),
    feature("fatigue_penalty", "Repeated skip or mute fatigue", fatigue, weights.fatigue_penalty, "penalty"),
    feature("weak_provenance_penalty", "Weak provenance penalty", paper.cards.length ? 0 : 1, weights.weak_provenance_penalty, "penalty")
  ];
}

function moduleFeatures(candidate: CandidateDraft, context: RecommendationContext): RecommendationFeature[] {
  if (candidate.kind === "graph_path" && candidate.graphPath) {
    const graphWeight = context.mode === "graph-nearby" ? 0.44 : 0.2;

    return [
      feature("graph_distance", "Graph distance to thesis", candidate.graphPath.nodeIds.includes("thesis") ? 1 : 0.45, graphWeight, "boost"),
      feature("evidence_count", "Path evidence count", Math.min(1, candidate.graphPath.nodeIds.length / 5), 0.15, "boost")
    ];
  }

  if (candidate.kind === "researcher" && candidate.researcher) {
    const socialWeight = context.mode === "following" ? 0.34 : 0.08;

    return [
      feature("thesis_overlap", "Researcher topic overlap", thesisTextIncludes(candidate.researcher.focus, context) ? 0.8 : 0.35, 0.25, "boost"),
      feature("social_proof", "Research social proof", Math.min(1, candidate.socialProof.length / 2), socialWeight, "boost")
    ];
  }

  return [feature("thesis_overlap", "Thesis topic overlap", 0.45, 0.25, "boost")];
}

function feature(
  key: string,
  label: string,
  value: number,
  weight: number,
  direction: RecommendationFeature["direction"]
): RecommendationFeature {
  return {
    key,
    label,
    value: clamp(value, 0, 1),
    weight,
    direction
  };
}

function thesisOverlap(paper: NonNullable<CandidateDraft["paper"]>, context: RecommendationContext) {
  const thesisTokens = new Set(tokenize(`${context.profile.thesis} ${context.profile.topics.join(" ")}`));
  const paperTokens = new Set(
    tokenize([paper.title, paper.takeaway, paper.reason, paper.authors, paper.venue, ...paper.tags].join(" "))
  );
  const hits = [...thesisTokens].filter((token) => paperTokens.has(token)).length;

  return thesisTokens.size ? hits / Math.min(thesisTokens.size, 18) : 0;
}

function graphProximity(paperId: string) {
  const graphNode = graphNodes.find((node) => node.sourcePaperId === paperId);

  if (!graphNode) {
    return 0.2;
  }

  const directThesisEdge = graphEdges.some(
    (edge) => edge.to === "thesis" && (edge.from === graphNode.id || edge.from === graphNode.sourcePaperId)
  );
  const pathHit = graphPaths.some((path) => path.nodeIds.includes(graphNode.id) && path.nodeIds.includes("thesis"));

  if (directThesisEdge) {
    return 1;
  }

  return pathHit ? 0.82 : 0.46;
}

function noveltyValue(paper: NonNullable<CandidateDraft["paper"]>) {
  const text = `${paper.takeaway} ${paper.reason} ${paper.tags.join(" ")} ${paper.cards.map((card) => card.type).join(" ")}`;

  if (/contradict|risk|limitation|fail|heterogeneity|validation|extrapolat/i.test(text)) {
    return 0.9;
  }

  if (/method|question|claim/i.test(text)) {
    return 0.64;
  }

  return 0.35;
}

function positiveSignalValue(paperId: string, tags: string[], context: RecommendationContext) {
  const tagSet = new Set(tags.map((tag) => tag.toLowerCase()));
  const matches = context.signals.filter((signal) => {
    if (!POSITIVE_SIGNAL_TYPES.has(signal.type)) {
      return false;
    }

    if (signal.entityId === paperId) {
      return true;
    }

    const signalTags = Array.isArray(signal.metadata?.tags) ? signal.metadata.tags : [];

    return signalTags.some((tag) => tagSet.has(String(tag).toLowerCase()));
  });

  return Math.min(1, matches.reduce((total, signal) => total + signal.weight, 0) / 2);
}

function fatigueValue(paperId: string, tags: string[], context: RecommendationContext) {
  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  const mutedHit = normalizedTags.some((tag) => context.mutedTags.includes(tag));
  const negativeHit = context.signals.some(
    (signal) =>
      NEGATIVE_SIGNAL_TYPES.has(signal.type) &&
      (signal.entityId === paperId || normalizedTags.includes(signal.entityId.toLowerCase()))
  );

  return mutedHit || negativeHit ? 1 : 0;
}

function recencyValue(year: number) {
  return clamp((year - 2020) / 6, 0, 1);
}

function thesisTextIncludes(value: string, context: RecommendationContext) {
  const target = tokenize(value);
  const source = new Set(tokenize(`${context.profile.thesis} ${context.profile.topics.join(" ")}`));

  return target.some((token) => source.has(token));
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 2);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
