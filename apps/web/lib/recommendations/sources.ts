import { followedResearchers, graphPaths, paperSocialProof } from "@/lib/mock-data";
import type { CandidateDraft, RecommendationContext } from "./types";

export function collectCandidateDrafts(context: RecommendationContext): CandidateDraft[] {
  return [
    ...fromLibrary(context),
    ...fromGraphPaths(context),
    ...fromAssistantQuestions(context),
    ...fromSimilarResearchers(context),
    fromWeeklyMemo(context)
  ];
}

function fromLibrary(context: RecommendationContext): CandidateDraft[] {
  return context.papers.map((paper) => ({
    id: `paper:${paper.id}`,
    kind: "paper",
    source: "library",
    paper,
    reasons: [
      {
        label: "Library candidate",
        detail: "This paper is available in your current research library or imported paper set.",
        tone: "neutral"
      }
    ],
    socialProof: paperSocialProof[paper.id] ?? []
  }));
}

function fromGraphPaths(context: RecommendationContext): CandidateDraft[] {
  if (context.mode === "following") {
    return [];
  }

  return graphPaths.map((path) => ({
    id: `graph-path:${path.id}`,
    kind: "graph_path",
    source: "graph-neighbor",
    graphPath: path,
    reasons: [
      {
        label: "Graph path",
        detail: "This path connects papers, claims, methods, or questions back to the active thesis.",
        tone: "positive"
      }
    ],
    socialProof: []
  }));
}

function fromAssistantQuestions(context: RecommendationContext): CandidateDraft[] {
  if (context.mode === "following") {
    return [];
  }

  return context.profile.topics.slice(0, 2).map((topic) => ({
    id: `question:${slug(topic)}`,
    kind: "question",
    source: "assistant-prompt",
    question: `What new evidence would change the ${topic.toLowerCase()} thesis?`,
    reasons: [
      {
        label: "Question candidate",
        detail: `Generated from the active topic "${topic}" to keep the reading loop actionable.`,
        tone: "neutral"
      }
    ],
    socialProof: []
  }));
}

function fromSimilarResearchers(context: RecommendationContext): CandidateDraft[] {
  if (context.mode !== "following" && context.mode !== "for-you") {
    return [];
  }

  return followedResearchers.map((researcher) => ({
    id: `researcher:${researcher.id}`,
    kind: "researcher",
    source: "similar-researcher",
    researcher,
    reasons: [
      {
        label: "Similar researcher",
        detail: `Focus overlap: ${researcher.overlapTags.join(", ")}.`,
        tone: "positive"
      }
    ],
    socialProof: [`Shares ${sharedTopicCount(context, researcher.overlapTags)} active topic signals.`]
  }));
}

function fromWeeklyMemo(context: RecommendationContext): CandidateDraft {
  return {
    id: "memo:weekly-evidence",
    kind: "memo_prompt",
    source: "weekly-memo",
    memoPrompt: "Convert this week's strongest recommendation signals into an advisor-ready memo.",
    reasons: [
      {
        label: "Memo nudge",
        detail: `There are ${context.papers.length} papers available for this week's synthesis loop.`,
        tone: "neutral"
      }
    ],
    socialProof: []
  };
}

function sharedTopicCount(context: RecommendationContext, tags: string[]) {
  const thesisText = `${context.profile.thesis} ${context.profile.topics.join(" ")}`.toLowerCase();

  return tags.filter((tag) => thesisText.includes(tag.toLowerCase().split(" ")[0])).length;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
