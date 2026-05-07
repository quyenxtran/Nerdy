import { NextResponse } from "next/server";

import { getFeed } from "@/lib/services";

export function GET() {
  return NextResponse.json(getFeed());
}
