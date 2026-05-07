import { NextResponse } from "next/server";

import { getGraph } from "@/lib/services";

export function GET() {
  return NextResponse.json(getGraph());
}
