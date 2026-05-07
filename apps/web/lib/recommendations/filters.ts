import type { FeedCandidate } from "@/lib/contracts";
import type { CandidateDraft, RecommendationContext } from "./types";

export function applyVisibility(candidate: CandidateDraft, context: RecommendationContext): CandidateDraft {
  if (candidate.kind === "paper" && candidate.paper) {
    const mutedTag = candidate.paper.tags.find((tag) => context.mutedTags.includes(tag.toLowerCase()));

    if (mutedTag) {
      return {
        ...candidate,
        visibility: {
          action: "drop",
          label: "Muted topic",
          reason: `The tag "${mutedTag}" is muted for this profile.`
        }
      };
    }

    if (!candidate.paper.cards.length) {
      return {
        ...candidate,
        visibility: {
          action: "label",
          label: "Needs source evidence",
          reason: "This recommendation has no source-backed evidence cards yet."
        }
      };
    }
  }

  return {
    ...candidate,
    visibility: candidate.visibility ?? { action: "allow" }
  };
}

export function filterVisibleCandidates(candidates: FeedCandidate[]) {
  const visible = candidates.filter((candidate) => candidate.visibility.action !== "drop");

  return {
    candidates: visible,
    filteredCount: candidates.length - visible.length
  };
}
