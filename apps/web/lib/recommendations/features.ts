import { graphEdges, graphNodes, graphPaths } from "@/lib/mock-data";
import type { RecommendationFeature } from "@/lib/contracts";
import type { CandidateDraft, RecommendationContext } from "./types";

const POSITIVE_SIGNAL_TYPES = new Set(["paper_save", "paper_heart", "assistant_ask", "paper_repost"]);
const NEGATIVE_SIGNAL_TYPES = new Set(["paper_skip", "tag_mute", "claim_report"]);

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

  return [
    feature("thesis_overlap", "Thesis topic overlap", thesisOverlap(paper, context), 0.25, "boost"),
    feature("graph_distance", "Graph distance to thesis", graphProximity(paper.id), 0.2, "boost"),
    feature("evidence_count", "Evidence card count", Math.min(1, paper.cards.length / 4), 0.15, "boost"),
    feature("novelty_value", "Novelty or contradiction value", noveltyValue(paper), 0.12, "boost"),
    feature("positive_signal", "Positive user signal match", positiveSignal, 0.12, "boost"),
    feature("social_proof", "Research social proof", Math.min(1, candidate.socialProof.length / 3), 0.08, "boost"),
    feature("recency", "Paper recency", recencyValue(paper.year), 0.04, "boost"),
    feature("fatigue_penalty", "Repeated skip or mute fatigue", fatigue, -0.1, "penalty"),
    feature("weak_provenance_penalty", "Weak provenance penalty", paper.cards.length ? 0 : 1, -0.2, "penalty")
  ];
}

function moduleFeatures(candidate: CandidateDraft, context: RecommendationContext): RecommendationFeature[] {
  if (candidate.kind === "graph_path" && candidate.graphPath) {
    return [
      feature("graph_distance", "Graph distance to thesis", candidate.graphPath.nodeIds.includes("thesis") ? 1 : 0.45, 0.2, "boost"),
      feature("evidence_count", "Path evidence count", Math.min(1, candidate.graphPath.nodeIds.length / 5), 0.15, "boost")
    ];
  }

  if (candidate.kind === "researcher" && candidate.researcher) {
    return [
      feature("thesis_overlap", "Researcher topic overlap", thesisTextIncludes(candidate.researcher.focus, context) ? 0.8 : 0.35, 0.25, "boost"),
      feature("social_proof", "Research social proof", Math.min(1, candidate.socialProof.length / 2), 0.08, "boost")
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
