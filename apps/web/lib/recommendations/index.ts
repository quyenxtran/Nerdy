import { mutedResearchTags, mockUserSignals } from "@/lib/mock-data";
import { explainCandidate } from "./explain";
import { hydrateFeatures } from "./features";
import { applyVisibility, filterVisibleCandidates } from "./filters";
import { mixFeed } from "./mixer";
import { rankCandidate, sortRankedCandidates } from "./ranker";
import { collectCandidateDrafts } from "./sources";
import { createContext, type BuildResearchFeedInput } from "./types";

export function buildResearchFeed(input: BuildResearchFeedInput) {
  const context = createContext({
    ...input,
    signals: input.signals ?? mockUserSignals,
    mutedTags: input.mutedTags ?? mutedResearchTags
  });
  const drafts = collectCandidateDrafts(context);
  const ranked = drafts
    .map((candidate) => hydrateFeatures(candidate, context))
    .map((candidate) => applyVisibility(candidate, context))
    .map(rankCandidate)
    .map(explainCandidate);
  const visible = filterVisibleCandidates(ranked);
  const sorted = sortRankedCandidates(visible.candidates);

  return mixFeed(sorted, context, drafts.length, visible.filteredCount);
}

export type { BuildResearchFeedInput };
