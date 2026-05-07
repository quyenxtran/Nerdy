import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { FeedImpression, FeedMode, UserSignal } from "@/lib/contracts";
import type { MixedFeed } from "@/lib/recommendations/types";

type StoreShape = {
  signals: UserSignal[];
  impressions: FeedImpression[];
};

type PersistenceAdapter = {
  name: string;
  readSignals: () => UserSignal[];
  readImpressions: () => FeedImpression[];
  appendSignal: (signal: UserSignal) => void;
  appendFeedImpressions: (feed: MixedFeed, mode: FeedMode, createdAt: string) => void;
};

const STORE_DIR = path.join(process.cwd(), "storage", "papergraph-mock");
const STORE_FILE = path.join(STORE_DIR, "session.json");
const EMPTY_STORE: StoreShape = {
  signals: [],
  impressions: []
};

export const localJsonPersistenceAdapter: PersistenceAdapter = {
  name: "local-json",
  readSignals: () => readStore().signals,
  readImpressions: () => readStore().impressions,
  appendSignal(signal) {
    const store = readStore();

    writeStore({
      ...store,
      signals: dedupeById([...store.signals, signal]).slice(-500)
    });
  },
  appendFeedImpressions(feed, mode, createdAt) {
    const store = readStore();
    const impressions = feed.modules.flatMap((module) =>
      module.items.map((candidate) => ({
        id: `impression-${createdAt}-${candidate.id}`,
        mode,
        candidateId: candidate.id,
        entityType: candidate.kind,
        entityId:
          candidate.paper?.id ??
          candidate.graphPath?.id ??
          candidate.researcher?.id ??
          candidate.question ??
          candidate.memoPrompt ??
          candidate.id,
        score: candidate.score.value,
        createdAt
      }))
    );

    writeStore({
      ...store,
      impressions: dedupeById([...store.impressions, ...impressions]).slice(-1000)
    });
  }
};

export function getPersistenceAdapter(): PersistenceAdapter {
  return localJsonPersistenceAdapter;
}

export function readStoredSignals(): UserSignal[] {
  return getPersistenceAdapter().readSignals();
}

export function readStoredImpressions(): FeedImpression[] {
  return getPersistenceAdapter().readImpressions();
}

export function appendStoredSignal(signal: UserSignal) {
  getPersistenceAdapter().appendSignal(signal);
}

export function appendFeedImpressions(feed: MixedFeed, mode: FeedMode, createdAt: string) {
  getPersistenceAdapter().appendFeedImpressions(feed, mode, createdAt);
}

function readStore(): StoreShape {
  try {
    if (!existsSync(STORE_FILE)) {
      return EMPTY_STORE;
    }

    const parsed = JSON.parse(readFileSync(STORE_FILE, "utf8")) as Partial<StoreShape>;

    return {
      signals: Array.isArray(parsed.signals) ? parsed.signals : [],
      impressions: Array.isArray(parsed.impressions) ? parsed.impressions : []
    };
  } catch {
    return EMPTY_STORE;
  }
}

function writeStore(store: StoreShape) {
  mkdirSync(STORE_DIR, { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function dedupeById<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}
