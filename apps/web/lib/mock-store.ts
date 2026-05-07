import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { FeedImpression, FeedMode, UserSignal } from "@/lib/contracts";
import type { MixedFeed } from "@/lib/recommendations/types";

type StoreShape = {
  signals: UserSignal[];
  impressions: FeedImpression[];
};

const STORE_DIR = path.join(process.cwd(), "storage", "papergraph-mock");
const STORE_FILE = path.join(STORE_DIR, "session.json");
const EMPTY_STORE: StoreShape = {
  signals: [],
  impressions: []
};

export function readStoredSignals(): UserSignal[] {
  return readStore().signals;
}

export function readStoredImpressions(): FeedImpression[] {
  return readStore().impressions;
}

export function appendStoredSignal(signal: UserSignal) {
  const store = readStore();

  writeStore({
    ...store,
    signals: dedupeById([...store.signals, signal]).slice(-500)
  });
}

export function appendFeedImpressions(feed: MixedFeed, mode: FeedMode, createdAt: string) {
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
