import type { FeedCandidate } from "@/lib/contracts";
import type { CandidateDraft } from "./types";

export function rankCandidate(candidate: CandidateDraft): FeedCandidate {
  const score = candidate.score ?? { value: 0, features: [] };
  const weightedScore = score.features.reduce((total, feature) => total + feature.value * feature.weight, 0);

  return {
    ...candidate,
    score: {
      features: score.features,
      value: Math.round(clamp(weightedScore * 100, 0, 100))
    },
    visibility: candidate.visibility ?? { action: "allow" }
  };
}

export function sortRankedCandidates(candidates: FeedCandidate[]) {
  return [...candidates].sort((a, b) => {
    if (b.score.value !== a.score.value) {
      return b.score.value - a.score.value;
    }

    const paperDelta = (b.paper?.relevance ?? 0) - (a.paper?.relevance ?? 0);

    if (paperDelta !== 0) {
      return paperDelta;
    }

    return a.id.localeCompare(b.id);
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
