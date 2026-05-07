import type { FeedCandidate, RecommendationFeature, RecommendationReason } from "@/lib/contracts";

const FEATURE_DETAILS: Record<string, string> = {
  thesis_overlap: "Matches terms from the active thesis and profile topics.",
  graph_distance: "Sits near the thesis or a thesis path in the knowledge graph.",
  evidence_count: "Has source-backed cards or graph path evidence available.",
  novelty_value: "Surfaces validation pressure, contradiction, or missing-evidence value.",
  positive_signal: "Matches papers, tags, or questions you have recently engaged with.",
  social_proof: "Has research-context proof from similar profiles, paths, or reposts.",
  recency: "Recent enough to stay useful in the daily reading loop.",
  fatigue_penalty: "Downranked because of skip, mute, or report feedback.",
  weak_provenance_penalty: "Downranked because it lacks enough source-backed evidence."
};

export function explainCandidate(candidate: FeedCandidate): FeedCandidate {
  const featureReasons = topFeatureReasons(candidate.score.features);
  const visibilityReason = visibilityToReason(candidate);

  return {
    ...candidate,
    reasons: [...featureReasons, ...candidate.reasons, ...(visibilityReason ? [visibilityReason] : [])].slice(0, 4)
  };
}

function topFeatureReasons(features: RecommendationFeature[]): RecommendationReason[] {
  const boosts = features
    .filter((feature) => feature.direction === "boost" && feature.value >= 0.35)
    .sort((a, b) => b.value * b.weight - a.value * a.weight)
    .slice(0, 2)
    .map((feature) => ({
      label: feature.label,
      detail: FEATURE_DETAILS[feature.key] ?? "Contributed to the recommendation score.",
      tone: "positive" as const
    }));
  const warnings = features
    .filter((feature) => feature.direction === "penalty" && feature.value >= 0.5)
    .slice(0, 1)
    .map((feature) => ({
      label: feature.label,
      detail: FEATURE_DETAILS[feature.key] ?? "Reduced the recommendation score.",
      tone: "warning" as const
    }));

  return [...boosts, ...warnings];
}

function visibilityToReason(candidate: FeedCandidate): RecommendationReason | undefined {
  if (candidate.visibility.action === "allow") {
    return undefined;
  }

  return {
    label: candidate.visibility.label ?? "Visibility label",
    detail: candidate.visibility.reason ?? "A visibility rule changed how this item appears.",
    tone: candidate.visibility.action === "label" ? "warning" : "neutral"
  };
}
