import {
  demoProfile,
  feedPapers,
  graphEdges,
  graphNodes,
  graphPaths,
  mockUserSignals,
  sharePosts,
  thesisReport
} from "./mock-data";
import { buildResearchFeed } from "./recommendations";
import type {
  AssistantAskRequest,
  AssistantAskResponse,
  CreateSignalRequest,
  CreateRepostRequest,
  FeedResponse,
  GraphResponse,
  ImportPaperRequest,
  ImportPaperResponse,
  PaperResponse,
  RepostResponse,
  ResolvePaperRequest,
  ResolvePaperResponse,
  SignalResponse,
  SignalsResponse,
  SocialRepost,
  ThesisValidateRequest,
  ThesisValidateResponse,
  UserSignal,
  WeeklyMemoRequest,
  WeeklyMemoResponse
} from "./contracts";
import type { FeedPaper } from "./mock-data";

const MOCK_NOW = "2026-05-07T12:00:00.000Z";
const DEFAULT_REPOST_NOTE =
  "Sharing this because it connects directly to the current PaperGraph research trail.";

export class ApiServiceError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiServiceError";
  }
}

const importedPapers = new Map<string, FeedPaper>();
const sessionSignals = new Map<string, UserSignal>();
const reposts = new Map<string, SocialRepost>(
  sharePosts.map((post) => [
    post.id,
    {
      id: post.id,
      author: post.author,
      note: post.note,
      paper: post.paper,
      visibility: "Public preview",
      createdAt: MOCK_NOW
    }
  ])
);

export function getFeed(): FeedResponse {
  const rankedFeed = buildResearchFeed({
    profile: demoProfile,
    papers: getAllPapers(),
    signals: getAllSignals()
  });

  return {
    profile: demoProfile,
    papers: rankedFeed.papers,
    mode: "for-you",
    modules: rankedFeed.modules,
    generatedAt: MOCK_NOW,
    debug: {
      candidateCount: rankedFeed.candidateCount,
      filteredCount: rankedFeed.filteredCount,
      topReasons: rankedFeed.topReasons
    }
  };
}

export function createSignal(input: CreateSignalRequest): SignalResponse {
  const type = requireSignalType(input.type);
  const entityType = requireSignalEntityType(input.entityType);
  const entityId = requireString(input.entityId, "entityId");
  const weight = clampSignalWeight(input.weight ?? 1);
  const signal: UserSignal = {
    id: `signal-${Date.now()}-${sessionSignals.size + 1}`,
    type,
    entityType,
    entityId,
    weight,
    createdAt: new Date().toISOString(),
    metadata: sanitizeMetadata(input.metadata)
  };

  sessionSignals.set(signal.id, signal);

  return { signal };
}

export function getSignals(): SignalsResponse {
  return { signals: getAllSignals() };
}

export function getPaper(id: string): PaperResponse {
  const paper = findPaperById(id);

  if (!paper) {
    throw new ApiServiceError(404, "paper_not_found", `No paper found for id '${id}'.`);
  }

  return { paper };
}

export function resolvePaper(input: ResolvePaperRequest): ResolvePaperResponse {
  const normalized = normalizeResolveInput(input);
  const allPapers = getAllPapers();

  if (normalized.id) {
    const paper = findPaperById(normalized.id);

    if (paper) {
      return { paper, match: { strategy: "id", confidence: 1 } };
    }
  }

  const titleLike = normalized.title ?? normalized.query ?? normalized.doi ?? normalized.url;
  const matched = titleLike ? findBestPaperMatch(titleLike, allPapers) : undefined;

  if (matched) {
    return {
      paper: matched.paper,
      match: {
        strategy: normalized.title
          ? "title"
          : normalized.query
            ? "query"
            : normalized.doi
              ? "doi"
              : "url",
        confidence: matched.score
      }
    };
  }

  return {
    paper: allPapers[0],
    match: {
      strategy: "fallback",
      confidence: 0.42
    }
  };
}

export function importPaper(input: ImportPaperRequest): ImportPaperResponse {
  const normalized = normalizeResolveInput(input);
  const existing = tryResolveExistingPaper(normalized);

  if (existing) {
    importedPapers.set(existing.id, existing);

    return {
      paper: existing,
      status: "already_exists",
      importedAt: MOCK_NOW,
      collection: "mock-library"
    };
  }

  const title = normalized.title ?? normalized.query;

  if (!title) {
    throw new ApiServiceError(
      400,
      "missing_import_title",
      "Provide a title or query when importing a paper that is not already in the mock feed."
    );
  }

  const paper = createImportedPaper(title, input);
  importedPapers.set(paper.id, paper);

  return {
    paper,
    status: "imported",
    importedAt: MOCK_NOW,
    collection: "mock-library"
  };
}

export function getGraph(): GraphResponse {
  const nodes = [...graphNodes];
  const edges = [...graphEdges];

    return {
      nodes,
      edges,
      paths: graphPaths,
      stats: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      paperCount: nodes.filter((node) => node.type === "paper").length,
      claimCount: nodes.filter((node) => node.type === "claim").length
    }
  };
}

export function createRepost(input: CreateRepostRequest): RepostResponse {
  const paperId = requireString(input.paperId, "paperId");
  const paper = findPaperById(paperId);
  const note = trimOptional(input.note);
  const visibility = input.visibility ?? "Public preview";

  if (!paper) {
    throw new ApiServiceError(404, "paper_not_found", `No paper found for id '${paperId}'.`);
  }

  if (note && note.length > 500) {
    throw new ApiServiceError(400, "note_too_long", "Repost notes must be 500 characters or fewer.");
  }

  if (!isValidVisibility(visibility)) {
    throw new ApiServiceError(
      400,
      "invalid_visibility",
      "Visibility must be one of Public preview, Private draft, or Lab only."
    );
  }

  const repost: SocialRepost = {
    id: `post-${reposts.size + 1}`,
    author: demoProfile.name,
    note: note || DEFAULT_REPOST_NOTE,
    paper,
    visibility,
    createdAt: MOCK_NOW
  };

  reposts.set(repost.id, repost);

  return { repost };
}

export function getRepost(postId: string): RepostResponse {
  const repost = reposts.get(postId);

  if (!repost) {
    throw new ApiServiceError(404, "repost_not_found", `No repost found for id '${postId}'.`);
  }

  return { repost };
}

export function askAssistant(input: AssistantAskRequest): AssistantAskResponse {
  const question = requireString(input.question, "question");
  const scopedPaper = input.paperId ? findPaperById(input.paperId) : undefined;

  if (input.paperId && !scopedPaper) {
    throw new ApiServiceError(404, "paper_not_found", `No paper found for id '${input.paperId}'.`);
  }

  const papers = scopedPaper ? [scopedPaper] : getAllPapers().slice(0, 2);
  const primary = papers[0];
  const evidence = papers.flatMap((paper) =>
    paper.cards.slice(0, 2).map((card) => ({
      paperId: paper.id,
      title: paper.title,
      source: card.source
    }))
  );

  return {
    answer:
      `Mock assistant answer for: "${question}". ` +
      `The strongest current signal is '${primary.takeaway}' from ${primary.title}. ` +
      "Treat this as a grounded draft and verify against the cited paper cards before using it in writing.",
    citations: evidence,
    followUps: [
      "Which claim needs source-level evidence before you cite it?",
      "Should PaperGraph add this as a thesis risk, method, or open question?",
      input.context ? "Do you want a memo version using the provided context?" : "Do you want this scoped to one paper?"
    ]
  };
}

export function validateThesis(input: ThesisValidateRequest): ThesisValidateResponse {
  const thesis = requireString(input.thesis, "thesis");
  const lowerThesis = thesis.toLowerCase();
  const topicHits = demoProfile.topics.filter((topic) => lowerThesis.includes(topic.toLowerCase().split(" ")[0]));
  const hasValidation = /validation|generalization|extrapolat|loao|leave-one/i.test(thesis);
  const hasSystem = /carbon|adsorb|molecule|descriptor/i.test(thesis);

  return {
    submittedThesis: thesis,
    overlapRisk: thesisReport.overlapRisk,
    noveltyScore: Math.min(98, thesisReport.noveltyScore + topicHits.length * 3),
    confidence: thesisReport.confidence,
    noveltyAngle: input.focus
      ? `${thesisReport.noveltyAngle} Focus area: ${input.focus}.`
      : thesisReport.noveltyAngle,
    missingEvidence: thesisReport.missingEvidence,
    readingPath: thesisReport.readingPath,
    checks: [
      {
        label: "Validation framing",
        status: hasValidation ? "pass" : "warn",
        detail: hasValidation
          ? "The thesis names a generalization or validation pressure test."
          : "Name the validation split or extrapolation setting to sharpen the novelty claim."
      },
      {
        label: "System specificity",
        status: hasSystem ? "pass" : "warn",
        detail: hasSystem
          ? "The thesis identifies the scientific system or descriptor family."
          : "Add the target system, descriptors, or material class."
      }
    ]
  };
}

export function createWeeklyMemo(input: WeeklyMemoRequest): WeeklyMemoResponse {
  if (input.paperIds !== undefined && !Array.isArray(input.paperIds)) {
    throw new ApiServiceError(400, "invalid_paper_ids", "Field 'paperIds' must be an array of paper ids.");
  }

  const paperIds = input.paperIds?.map((paperId) => requireString(paperId, "paperIds[]"));
  const selectedPapers =
    paperIds && paperIds.length > 0
      ? paperIds.map((paperId) => getPaper(paperId).paper)
      : getAllPapers().slice(0, 3);
  const themes = [...new Set(selectedPapers.flatMap((paper) => paper.tags))].slice(0, 5);

  return {
    weekOf: trimOptional(input.weekOf) ?? "2026-05-04",
    thesis: trimOptional(input.thesis) ?? demoProfile.thesis,
    summary:
      `This mock weekly memo connects ${selectedPapers.length} papers to the current thesis. ` +
      "The main pattern is that descriptor design, validation splits, and auditable claim graphs should be evaluated together.",
    papers: selectedPapers,
    themes,
    actionItems: [
      "Add one evidence card for the strongest claim in each selected paper.",
      "Mark papers that require source-level verification before sharing.",
      "Convert unresolved limitations into assistant questions for the next reading block."
    ],
    generatedAt: MOCK_NOW
  };
}

export function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new ApiServiceError(400, "invalid_json", "Request body must be a JSON object.");
  }

  return value;
}

function getAllPapers(): FeedPaper[] {
  return [...feedPapers, ...importedPapers.values()];
}

function getAllSignals(): UserSignal[] {
  return [...mockUserSignals, ...sessionSignals.values()];
}

function findPaperById(id: string): FeedPaper | undefined {
  return getAllPapers().find((paper) => paper.id === id);
}

function tryResolveExistingPaper(input: ResolvePaperRequest): FeedPaper | undefined {
  if (input.id) {
    return findPaperById(input.id);
  }

  const lookup = input.title ?? input.query ?? input.doi ?? input.url;

  return lookup ? findBestPaperMatch(lookup, getAllPapers())?.paper : undefined;
}

function normalizeResolveInput(input: ResolvePaperRequest): ResolvePaperRequest {
  const normalized = {
    id: trimOptional(input.id),
    doi: trimOptional(input.doi),
    title: trimOptional(input.title),
    url: trimOptional(input.url),
    query: trimOptional(input.query)
  };

  if (!normalized.id && !normalized.doi && !normalized.title && !normalized.url && !normalized.query) {
    throw new ApiServiceError(
      400,
      "missing_identifier",
      "Provide at least one of id, doi, title, url, or query."
    );
  }

  return normalized;
}

function findBestPaperMatch(lookup: string, papers: FeedPaper[]): { paper: FeedPaper; score: number } | undefined {
  const lookupTokens = tokenize(lookup);

  if (lookupTokens.length === 0) {
    return undefined;
  }

  const scored = papers
    .map((paper) => {
      const text = [paper.id, paper.title, paper.authors, paper.venue, paper.takeaway, paper.reason, ...paper.tags].join(
        " "
      );
      const paperTokens = new Set(tokenize(text));
      const hits = lookupTokens.filter((token) => paperTokens.has(token)).length;

      return {
        paper,
        score: hits / lookupTokens.length
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0];
}

function createImportedPaper(title: string, input: ImportPaperRequest): FeedPaper {
  const tags =
    Array.isArray(input.tags) && input.tags.length > 0
      ? input.tags.map((tag) => requireString(tag, "tags[]")).slice(0, 5)
      : ["imported", trimOptional(input.source) ?? "manual"];

  return {
    id: slugify(title),
    title,
    authors: "Mock Importer",
    venue: input.source === "doi" ? "DOI resolver mock" : "PaperGraph import mock",
    year: 2026,
    relevance: 71,
    takeaway: "Imported mock paper awaiting source verification and claim extraction.",
    reason: "Created by the mock import endpoint so the MVP can exercise library flows without external APIs.",
    tags,
    metrics: [
      { label: "saves", value: 0 },
      { label: "questions", value: 0 },
      { label: "reposts", value: 0 }
    ],
    cards: [
      {
        id: `card-${slugify(title)}-takeaway`,
        type: "takeaway",
        title: "Import placeholder",
        body: "Replace this card with extracted claims after a real resolver is connected.",
        source: input.doi ?? input.url ?? "Manual import"
      }
    ]
  };
}

function requireString(value: unknown, field: string): string {
  const trimmed = trimOptional(value);

  if (!trimmed) {
    throw new ApiServiceError(400, "missing_field", `Field '${field}' is required.`);
  }

  return trimmed;
}

function trimOptional(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiServiceError(400, "invalid_field", "Expected string values for text fields.");
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 2);
}

function slugify(value: string): string {
  const slug = tokenize(value).join("-");

  return slug ? `import-${slug.slice(0, 48)}` : "import-untitled-paper";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidVisibility(value: string): value is SocialRepost["visibility"] {
  return value === "Public preview" || value === "Private draft" || value === "Lab only";
}

function requireSignalType(value: unknown): UserSignal["type"] {
  if (
    value === "paper_open" ||
    value === "paper_save" ||
    value === "paper_heart" ||
    value === "paper_skip" ||
    value === "assistant_ask" ||
    value === "paper_repost" ||
    value === "graph_node_open" ||
    value === "thesis_validate" ||
    value === "memo_generate" ||
    value === "tag_mute" ||
    value === "claim_report"
  ) {
    return value;
  }

  throw new ApiServiceError(400, "invalid_signal_type", "Signal type is not supported.");
}

function requireSignalEntityType(value: unknown): UserSignal["entityType"] {
  if (
    value === "paper" ||
    value === "paper_card" ||
    value === "graph_node" ||
    value === "graph_edge" ||
    value === "tag" ||
    value === "thesis" ||
    value === "memo"
  ) {
    return value;
  }

  throw new ApiServiceError(400, "invalid_signal_entity_type", "Signal entity type is not supported.");
}

function clampSignalWeight(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiServiceError(400, "invalid_signal_weight", "Signal weight must be a finite number.");
  }

  return Math.min(1, Math.max(0, value));
}

function sanitizeMetadata(metadata: unknown): UserSignal["metadata"] {
  if (metadata === undefined) {
    return undefined;
  }

  if (!isRecord(metadata)) {
    throw new ApiServiceError(400, "invalid_signal_metadata", "Signal metadata must be an object.");
  }

  return Object.fromEntries(
    Object.entries(metadata).filter((entry): entry is [string, string | number | boolean | string[]] => {
      const value = entry[1];

      return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        (Array.isArray(value) && value.every((item) => typeof item === "string"))
      );
    })
  );
}
