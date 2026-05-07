import { NextResponse } from "next/server";

import type { FeedMode } from "@/lib/contracts";
import { getFeed } from "@/lib/services";

export function GET(request: Request) {
  const url = new URL(request.url);

  return NextResponse.json(
    getFeed({
      debug: url.searchParams.get("debug") === "true",
      limit: parseLimit(url.searchParams.get("limit")),
      mode: parseFeedMode(url.searchParams.get("mode"))
    })
  );
}

function parseFeedMode(value: string | null): FeedMode | undefined {
  if (
    value === "for-you" ||
    value === "following" ||
    value === "graph-nearby" ||
    value === "new-evidence" ||
    value === "contradictions"
  ) {
    return value;
  }

  return undefined;
}

function parseLimit(value: string | null) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.min(30, Math.floor(parsed)) : undefined;
}
