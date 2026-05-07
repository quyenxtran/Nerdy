import type { FeedPaper, GraphEdge, GraphNode } from "./mock-data";

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
