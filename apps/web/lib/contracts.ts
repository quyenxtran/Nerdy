import type { FeedPaper, GraphEdge, GraphNode } from "./mock-data";

export type FeedMode = "for-you" | "following" | "graph-nearby" | "new-evidence" | "contradictions";

export type SignalType =
  | "paper_open"
  | "paper_save"
  | "paper_heart"
  | "paper_skip"
  | "assistant_ask"
  | "paper_repost"
  | "graph_node_open"
  | "thesis_validate"
  | "memo_generate"
  | "tag_mute"
  | "claim_report";

export type SignalEntityType =
  | "paper"
  | "paper_card"
  | "graph_node"
  | "graph_path"
  | "graph_edge"
  | "tag"
  | "researcher"
  | "thesis"
  | "memo";

export type UserSignal = {
  id: string;
  type: SignalType;
  entityType: SignalEntityType;
  entityId: string;
  weight: number;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | string[]>;
};

export type CreateSignalRequest = {
  type: SignalType;
  entityType: SignalEntityType;
  entityId: string;
  weight?: number;
  metadata?: UserSignal["metadata"];
};

export type SignalResponse = {
  signal: UserSignal;
};

export type SignalsResponse = {
  signals: UserSignal[];
  impressions: FeedImpression[];
};

export type FeedImpression = {
  id: string;
  mode: FeedMode;
  candidateId: string;
  entityType: FeedCandidateKind;
  entityId: string;
  score: number;
  createdAt: string;
};

export type RecommendationFeature = {
  key: string;
  label: string;
  value: number;
  weight: number;
  direction: "boost" | "penalty" | "neutral";
};

export type RecommendationScore = {
  value: number;
  features: RecommendationFeature[];
};

export type RecommendationReason = {
  label: string;
  detail: string;
  tone: "positive" | "warning" | "neutral";
};

export type VisibilityDecision = {
  action: "allow" | "downrank" | "label" | "interstitial" | "drop";
  label?: string;
  reason?: string;
};

export type FeedCandidateKind = "paper" | "graph_path" | "question" | "researcher" | "memo_prompt";

export type FeedCandidate = {
  id: string;
  kind: FeedCandidateKind;
  source: string;
  paper?: FeedPaper;
  graphPath?: {
    id: string;
    label: string;
    nodeIds: string[];
  };
  question?: string;
  researcher?: {
    id: string;
    name: string;
    handle: string;
    focus: string;
  };
  memoPrompt?: string;
  score: RecommendationScore;
  reasons: RecommendationReason[];
  socialProof: string[];
  visibility: VisibilityDecision;
};

export type FeedModule = {
  id: string;
  title: string;
  kind: FeedCandidateKind | "mixed";
  items: FeedCandidate[];
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type FeedResponse = {
  profile: {
    name: string;
    handle: string;
    thesis: string;
    topics: string[];
  };
  papers: FeedPaper[];
  mode?: FeedMode;
  modules?: FeedModule[];
  generatedAt?: string;
  debug?: {
    candidateCount: number;
    filteredCount: number;
    topReasons: string[];
  };
};

export type PaperResponse = {
  paper: FeedPaper;
};

export type ResolvePaperRequest = {
  id?: string;
  doi?: string;
  title?: string;
  url?: string;
  query?: string;
};

export type ResolvePaperResponse = {
  paper: FeedPaper;
  match: {
    strategy: "id" | "doi" | "title" | "url" | "query" | "fallback";
    confidence: number;
  };
};

export type ImportPaperRequest = ResolvePaperRequest & {
  source?: "doi" | "url" | "manual" | "library";
  tags?: string[];
};

export type ImportPaperResponse = {
  paper: FeedPaper;
  status: "imported" | "already_exists";
  importedAt: string;
  collection: "mock-library";
};

export type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  paths: {
    id: string;
    label: string;
    nodeIds: string[];
  }[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    paperCount: number;
    claimCount: number;
  };
};

export type CreateRepostRequest = {
  paperId: string;
  note?: string;
  visibility?: "Public preview" | "Private draft" | "Lab only";
};

export type SocialRepost = {
  id: string;
  author: string;
  note: string;
  paper: FeedPaper;
  visibility: "Public preview" | "Private draft" | "Lab only";
  createdAt: string;
};

export type RepostResponse = {
  repost: SocialRepost;
};

export type PublicRepostResponse = RepostResponse & {
  visibility: VisibilityDecision;
};

export type AssistantAskRequest = {
  question: string;
  paperId?: string;
  context?: string;
};

export type AssistantAskResponse = {
  answer: string;
  citations: Array<{
    paperId: string;
    title: string;
    source: string;
    confidence: number;
    needsVerification: boolean;
    visibility: VisibilityDecision;
  }>;
  followUps: string[];
};

export type ThesisValidateRequest = {
  thesis: string;
  focus?: string;
};

export type ThesisValidateResponse = {
  submittedThesis: string;
  overlapRisk: string;
  noveltyScore: number;
  confidence: number;
  noveltyAngle: string;
  missingEvidence: string[];
  readingPath: string[];
  checks: Array<{
    label: string;
    status: "pass" | "warn";
    detail: string;
  }>;
};

export type WeeklyMemoRequest = {
  weekOf?: string;
  thesis?: string;
  paperIds?: string[];
};

export type WeeklyMemoResponse = {
  weekOf: string;
  thesis: string;
  summary: string;
  papers: FeedPaper[];
  themes: string[];
  actionItems: string[];
  generatedAt: string;
};
