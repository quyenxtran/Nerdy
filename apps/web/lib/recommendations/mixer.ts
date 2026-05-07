import type { FeedCandidate, FeedModule } from "@/lib/contracts";
import type { MixedFeed, RecommendationContext } from "./types";

export function mixFeed(candidates: FeedCandidate[], context: RecommendationContext, candidateCount: number, filteredCount: number): MixedFeed {
  const paperItems = candidates.filter((candidate) => candidate.kind === "paper").slice(0, context.limit);
  const graphItems = candidates.filter((candidate) => candidate.kind === "graph_path").slice(0, 3);
  const socialItems = candidates.filter((candidate) => candidate.kind === "researcher").slice(0, 3);
  const promptItems = candidates.filter((candidate) => candidate.kind === "question" || candidate.kind === "memo_prompt").slice(0, 3);
  const modules: FeedModule[] = [
    {
      id: "primary-papers",
      title: context.mode === "following" ? "Following" : "Research For You",
      kind: "paper",
      items: paperItems
    }
  ];

  if (graphItems.length) {
    modules.push({
      id: "graph-nearby",
      title: "Graph Nearby",
      kind: "graph_path",
      items: graphItems
    });
  }

  if (socialItems.length) {
    modules.push({
      id: "similar-researchers",
      title: "Similar Researchers",
      kind: "researcher",
      items: socialItems
    });
  }

  if (promptItems.length) {
    modules.push({
      id: "research-prompts",
      title: "Next Research Prompts",
      kind: "mixed",
      items: promptItems
    });
  }

  return {
    papers: paperItems.flatMap((candidate) => (candidate.paper ? [candidate.paper] : [])),
    modules,
    candidateCount,
    filteredCount,
    topReasons: paperItems.flatMap((candidate) => candidate.reasons.slice(0, 1).map((reason) => reason.label)).slice(0, 4)
  };
}
