export type PaperMetric = {
  label: string;
  value: number;
};

export type PaperCard = {
  id: string;
  type: "takeaway" | "method" | "limitation" | "idea" | "question";
  title: string;
  body: string;
  source: string;
};

export type FeedPaper = {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  relevance: number;
  takeaway: string;
  reason: string;
  tags: string[];
  metrics: PaperMetric[];
  cards: PaperCard[];
};

export type GraphNode = {
  id: string;
  label: string;
  type: "paper" | "claim" | "method" | "descriptor" | "thesis" | "question";
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
};

export type WeeklyMemo = {
  id: string;
  title: string;
  period: string;
  themes: string[];
  usefulIdeas: string[];
  contradictions: string[];
  advisorQuestions: string[];
  nextReads: string[];
};

export const demoProfile = {
  name: "Quang Tran",
  handle: "qtran-research",
  thesis:
    "Molecule-adsorbent cross descriptors can improve leave-one-adsorbate-out generalization for organic acid adsorption on activated carbon.",
  topics: ["Adsorption ML", "Descriptor generalization", "Activated carbon", "Scientific discovery agents"]
};

export const feedPapers: FeedPaper[] = [
  {
    id: "shape-descriptors-loao",
    title: "Shape-sensitive molecular descriptors improve extrapolation in adsorption prediction",
    authors: "N. Iyer, C. Morales, S. Okafor",
    venue: "Journal of Chemical Informatics",
    year: 2025,
    relevance: 94,
    takeaway:
      "Shape descriptors reduce failures when models see branched molecules outside the training family.",
    reason:
      "Directly maps to the LOAO failure mode in your thesis and suggests descriptor families worth testing against activated carbon datasets.",
    tags: ["LOAO", "molecular descriptors", "activated carbon"],
    metrics: [
      { label: "saves", value: 128 },
      { label: "questions", value: 34 },
      { label: "reposts", value: 19 }
    ],
    cards: [
      {
        id: "card-shape-takeaway",
        type: "takeaway",
        title: "Main contribution",
        body:
          "The model performs better under leave-family-out validation when geometric descriptors are combined with chemistry descriptors.",
        source: "Abstract"
      },
      {
        id: "card-shape-method",
        type: "method",
        title: "Reusable method",
        body:
          "Use family-based validation splits before trusting high random-split scores on adsorption datasets.",
        source: "Methods, p. 4"
      },
      {
        id: "card-shape-question",
        type: "question",
        title: "Advisor question",
        body:
          "Would cross descriptors help more than molecule-only shape descriptors when the adsorbent surface varies?",
        source: "PaperGraph synthesis"
      }
    ]
  },
  {
    id: "carbon-surface-heterogeneity",
    title: "Surface heterogeneity controls organic acid uptake in porous carbons",
    authors: "R. Malik, A. Chen, P. Sousa",
    venue: "Carbon",
    year: 2024,
    relevance: 88,
    takeaway:
      "Adsorbent surface chemistry can dominate molecule-only features for acids with similar functional groups.",
    reason:
      "This is the strongest warning that molecule descriptors alone may underfit activated carbon behavior.",
    tags: ["activated carbon", "surface chemistry", "organic acids"],
    metrics: [
      { label: "saves", value: 91 },
      { label: "questions", value: 27 },
      { label: "reposts", value: 11 }
    ],
    cards: [
      {
        id: "card-carbon-limitation",
        type: "limitation",
        title: "Modeling limitation",
        body:
          "Bulk adsorbent labels hide surface chemistry differences that can reverse expected uptake trends.",
        source: "Discussion, p. 9"
      },
      {
        id: "card-carbon-idea",
        type: "idea",
        title: "Transfer idea",
        body:
          "Add adsorbent-side descriptors for acidity, oxygen content, pore size distribution, and graphitic fraction.",
        source: "PaperGraph synthesis"
      }
    ]
  },
  {
    id: "kg-literature-review",
    title: "Literature knowledge graphs for machine-assisted scientific synthesis",
    authors: "M. Shah, T. Nguyen, E. Park",
    venue: "AI for Science Review",
    year: 2026,
    relevance: 82,
    takeaway:
      "Claim-level graphs make literature review more useful than paper-level search alone.",
    reason:
      "Supports PaperGraph's core product bet: save claims, questions, and evidence, not just PDFs.",
    tags: ["knowledge graph", "RAG", "claims"],
    metrics: [
      { label: "saves", value: 203 },
      { label: "questions", value: 61 },
      { label: "reposts", value: 42 }
    ],
    cards: [
      {
        id: "card-kg-method",
        type: "method",
        title: "Extraction pattern",
        body:
          "Represent each paper as claims, methods, datasets, limitations, and evidence-backed edges.",
        source: "Framework, p. 3"
      },
      {
        id: "card-kg-limitation",
        type: "limitation",
        title: "Trust boundary",
        body:
          "Edges without source excerpts become hard to audit and should not be shown as evidence.",
        source: "Limitations, p. 11"
      }
    ]
  }
];

export const graphNodes: GraphNode[] = [
  { id: "paper-a", label: "Shape descriptor paper", type: "paper", x: 9, y: 16 },
  { id: "paper-b", label: "Carbon heterogeneity paper", type: "paper", x: 60, y: 12 },
  { id: "method", label: "family-based validation", type: "method", x: 33, y: 33 },
  { id: "descriptor", label: "cross descriptors", type: "descriptor", x: 55, y: 48 },
  { id: "claim", label: "molecule-only features fail", type: "claim", x: 12, y: 57 },
  { id: "thesis", label: "LOAO thesis", type: "thesis", x: 70, y: 71 },
  { id: "question", label: "what transfers to AC?", type: "question", x: 34, y: 78 }
];

export const graphEdges: GraphEdge[] = [
  { id: "e1", from: "paper-a", to: "method", relation: "USES" },
  { id: "e2", from: "paper-a", to: "descriptor", relation: "SUGGESTS" },
  { id: "e3", from: "paper-b", to: "claim", relation: "SUPPORTS" },
  { id: "e4", from: "claim", to: "thesis", relation: "RELEVANT_TO" },
  { id: "e5", from: "descriptor", to: "thesis", relation: "IMPROVES" },
  { id: "e6", from: "question", to: "thesis", relation: "ASKS_ABOUT" }
];

export const sharePosts = [
  {
    id: "post-1",
    author: "Quang Tran",
    note:
      "This may be useful for improving LOAO generalization because it tests shape-sensitive descriptors under harder validation splits.",
    paper: feedPapers[0],
    visibility: "Public preview"
  }
];

export const thesisReport = {
  overlapRisk: "Medium",
  noveltyScore: 76,
  confidence: 0.68,
  noveltyAngle:
    "Frame the thesis around molecule-adsorbent cross descriptors for aqueous activated carbon systems under leave-one-adsorbate-out validation.",
  missingEvidence: [
    "Multicomponent adsorption at realistic concentrations",
    "Adsorbent descriptor availability across carbon batches",
    "Generalization by molecular family rather than random train/test splits"
  ],
  readingPath: feedPapers.map((paper) => paper.title)
};

export const weeklyMemo: WeeklyMemo = {
  id: "memo-2026-05-07",
  title: "Weekly Research Memo",
  period: "May 1-7, 2026",
  themes: [
    "LOAO failures may be caused by validation design and missing adsorbent descriptors.",
    "Shape-sensitive molecular features look promising, but molecule-only descriptors are probably insufficient.",
    "Claim-level literature graphs are useful only when every edge preserves evidence."
  ],
  usefulIdeas: [
    "Run family-based validation next to random split baselines.",
    "Add adsorbent surface chemistry and pore distribution features before testing cross descriptors.",
    "Treat every extracted limitation as a graph node linked to exact paper evidence."
  ],
  contradictions: [
    "High random-split adsorption model scores may not transfer to leave-family-out settings.",
    "Surface heterogeneity may dominate molecular descriptors for some organic acid families."
  ],
  advisorQuestions: [
    "Which validation split would be most convincing for novelty?",
    "What minimum adsorbent descriptor set is defensible with available datasets?",
    "Should novelty be framed around cross descriptors or around evidence-preserving thesis validation?"
  ],
  nextReads: thesisReport.readingPath
};
