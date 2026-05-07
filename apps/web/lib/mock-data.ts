import type { UserSignal } from "./contracts";

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
  group: string;
  weight: number;
  summary: string;
  sourcePaperId?: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
  weight: number;
  evidence: string;
  directed?: boolean;
};

export type GraphPath = {
  id: string;
  label: string;
  nodeIds: string[];
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

export const mockUserSignals: UserSignal[] = [
  {
    id: "signal-save-shape",
    type: "paper_save",
    entityType: "paper",
    entityId: "shape-descriptors-loao",
    weight: 0.92,
    createdAt: "2026-05-06T16:12:00.000Z",
    metadata: { tags: ["LOAO", "molecular descriptors"] }
  },
  {
    id: "signal-ask-carbon",
    type: "assistant_ask",
    entityType: "paper",
    entityId: "carbon-surface-heterogeneity",
    weight: 0.78,
    createdAt: "2026-05-06T18:45:00.000Z",
    metadata: { questionIntent: "missing evidence" }
  },
  {
    id: "signal-graph-thesis",
    type: "graph_node_open",
    entityType: "graph_node",
    entityId: "thesis",
    weight: 0.74,
    createdAt: "2026-05-07T09:20:00.000Z",
    metadata: { source: "cockpit" }
  }
];

export const mutedResearchTags = ["billing", "generic productivity"];

export const paperSocialProof: Record<string, string[]> = {
  "shape-descriptors-loao": [
    "Saved by 12 researchers following descriptor generalization.",
    "Appears in the active descriptor validation graph path."
  ],
  "carbon-surface-heterogeneity": [
    "Asked about by researchers studying activated carbon.",
    "Connected to a thesis risk about adsorbent-side variables."
  ],
  "kg-literature-review": [
    "Reposted by claim-graph builders.",
    "Useful for evidence audit and source provenance workflows."
  ]
};

export const followedResearchers = [
  {
    id: "researcher-maya-shah",
    name: "Maya Shah",
    handle: "maya-claims",
    focus: "Claim-level literature graphs",
    overlapTags: ["knowledge graph", "RAG", "claims"]
  },
  {
    id: "researcher-rene-malik",
    name: "Rene Malik",
    handle: "rene-carbon",
    focus: "Porous carbon adsorption",
    overlapTags: ["activated carbon", "surface chemistry"]
  }
];

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
  {
    id: "paper-a",
    label: "Shape descriptor paper",
    type: "paper",
    group: "descriptor validation",
    weight: 0.92,
    summary: "Tests shape-sensitive descriptors under harder extrapolation splits.",
    sourcePaperId: "shape-descriptors-loao",
    x: 18,
    y: 24
  },
  {
    id: "paper-b",
    label: "Carbon heterogeneity paper",
    type: "paper",
    group: "adsorbent evidence",
    weight: 0.84,
    summary: "Shows surface chemistry can dominate molecule-only features.",
    sourcePaperId: "carbon-surface-heterogeneity",
    x: 65,
    y: 20
  },
  {
    id: "paper-c",
    label: "Claim graph review",
    type: "paper",
    group: "knowledge graph",
    weight: 0.74,
    summary: "Argues for claim-level graph edges with source-backed evidence.",
    sourcePaperId: "kg-literature-review",
    x: 73,
    y: 58
  },
  {
    id: "method",
    label: "family-based validation",
    type: "method",
    group: "descriptor validation",
    weight: 0.78,
    summary: "Validation split that exposes family-level extrapolation failure.",
    sourcePaperId: "shape-descriptors-loao",
    x: 38,
    y: 35
  },
  {
    id: "descriptor",
    label: "cross descriptors",
    type: "descriptor",
    group: "descriptor validation",
    weight: 0.88,
    summary: "Joint molecule-adsorbent features for LOAO generalization.",
    x: 56,
    y: 48
  },
  {
    id: "adsorbent",
    label: "surface chemistry",
    type: "descriptor",
    group: "adsorbent evidence",
    weight: 0.71,
    summary: "Oxygen content, pore structure, acidity, and graphitic fraction.",
    sourcePaperId: "carbon-surface-heterogeneity",
    x: 43,
    y: 66
  },
  {
    id: "claim",
    label: "molecule-only features fail",
    type: "claim",
    group: "adsorbent evidence",
    weight: 0.72,
    summary: "Bulk molecule descriptors can miss surface-driven uptake reversals.",
    sourcePaperId: "carbon-surface-heterogeneity",
    x: 20,
    y: 60
  },
  {
    id: "audit",
    label: "evidence-backed edges",
    type: "claim",
    group: "knowledge graph",
    weight: 0.67,
    summary: "Graph edges need source excerpts before they can support citations.",
    sourcePaperId: "kg-literature-review",
    x: 56,
    y: 76
  },
  {
    id: "thesis",
    label: "LOAO thesis",
    type: "thesis",
    group: "thesis spine",
    weight: 1,
    summary: "Cross descriptors should improve leave-one-adsorbate-out prediction.",
    x: 75,
    y: 74
  },
  {
    id: "question",
    label: "what transfers to AC?",
    type: "question",
    group: "thesis spine",
    weight: 0.64,
    summary: "Open question about whether shape descriptors transfer to activated carbon.",
    x: 32,
    y: 82
  }
];

export const graphEdges: GraphEdge[] = [
  {
    id: "e1",
    from: "paper-a",
    to: "method",
    relation: "USES",
    weight: 0.86,
    evidence: "The paper evaluates leave-family-out validation alongside random splits.",
    directed: true
  },
  {
    id: "e2",
    from: "paper-a",
    to: "descriptor",
    relation: "SUGGESTS",
    weight: 0.76,
    evidence: "Geometric descriptors reduce extrapolation errors for branched molecules.",
    directed: true
  },
  {
    id: "e3",
    from: "paper-b",
    to: "claim",
    relation: "SUPPORTS",
    weight: 0.82,
    evidence: "Surface chemistry differences reverse expected uptake trends.",
    directed: true
  },
  {
    id: "e4",
    from: "claim",
    to: "thesis",
    relation: "RELEVANT_TO",
    weight: 0.72,
    evidence: "Molecule-only descriptors are insufficient when adsorbent properties shift.",
    directed: true
  },
  {
    id: "e5",
    from: "descriptor",
    to: "thesis",
    relation: "IMPROVES",
    weight: 0.9,
    evidence: "Cross descriptors connect molecule features with adsorbent-side properties.",
    directed: true
  },
  {
    id: "e6",
    from: "question",
    to: "thesis",
    relation: "ASKS_ABOUT",
    weight: 0.52,
    evidence: "Advisor-facing question about descriptor transfer under activated carbon variation.",
    directed: true
  },
  {
    id: "e7",
    from: "paper-c",
    to: "audit",
    relation: "REQUIRES",
    weight: 0.7,
    evidence: "Claim graph review warns that unaudited edges become hard to trust.",
    directed: true
  },
  {
    id: "e8",
    from: "audit",
    to: "thesis",
    relation: "CONSTRAINS",
    weight: 0.58,
    evidence: "Only source-backed claims should flow into thesis memo recommendations.",
    directed: true
  },
  {
    id: "e9",
    from: "adsorbent",
    to: "descriptor",
    relation: "COMBINES_WITH",
    weight: 0.68,
    evidence: "Adsorbent descriptors complete the cross-feature hypothesis.",
    directed: false
  },
  {
    id: "e10",
    from: "method",
    to: "thesis",
    relation: "VALIDATES",
    weight: 0.8,
    evidence: "Family-based validation is the proof setting for the LOAO thesis.",
    directed: true
  }
];

export const graphPaths: GraphPath[] = [
  {
    id: "path-validation",
    label: "Descriptor validation path",
    nodeIds: ["paper-a", "method", "descriptor", "thesis"]
  },
  {
    id: "path-risk",
    label: "Adsorbent risk path",
    nodeIds: ["paper-b", "claim", "adsorbent", "descriptor", "thesis"]
  },
  {
    id: "path-audit",
    label: "Evidence audit path",
    nodeIds: ["paper-c", "audit", "thesis"]
  }
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
