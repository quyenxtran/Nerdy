import type { FeedCandidate, FeedMode, FeedModule, RecommendationScore, UserSignal } from "@/lib/contracts";
import type { FeedPaper } from "@/lib/mock-data";

export type ResearchProfile = {
  name: string;
  handle: string;
  thesis: string;
  topics: string[];
};

export type BuildResearchFeedInput = {
  profile: ResearchProfile;
  papers: FeedPaper[];
  mode?: FeedMode;
  limit?: number;
  debug?: boolean;
  signals?: UserSignal[];
  mutedTags?: string[];
  now?: string;
};

export type RecommendationContext = {
  profile: ResearchProfile;
  papers: FeedPaper[];
  mode: FeedMode;
  limit: number;
  debug: boolean;
  signals: UserSignal[];
  mutedTags: string[];
  now: string;
};

export type CandidateDraft = Omit<FeedCandidate, "score" | "visibility"> & {
  score?: RecommendationScore;
  visibility?: FeedCandidate["visibility"];
};

export type MixedFeed = {
  papers: FeedPaper[];
  modules: FeedModule[];
  candidateCount: number;
  filteredCount: number;
  topReasons: string[];
};

export const EMPTY_SCORE: RecommendationScore = {
  value: 0,
  features: []
};

export function createContext(input: BuildResearchFeedInput): RecommendationContext {
  return {
    profile: input.profile,
    papers: input.papers,
    mode: input.mode ?? "for-you",
    limit: input.limit ?? 12,
    debug: input.debug ?? false,
    signals: input.signals ?? [],
    mutedTags: input.mutedTags ?? [],
    now: input.now ?? new Date().toISOString()
  };
}
