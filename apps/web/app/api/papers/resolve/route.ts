import { NextResponse } from "next/server";

import { ApiServiceError, parseJsonObject, resolvePaper } from "@/lib/services";
import type { ResolvePaperRequest } from "@/lib/contracts";

export async function POST(request: Request) {
  try {
    const body = parseJsonObject(await request.json());

    return NextResponse.json(resolvePaper(body as ResolvePaperRequest));
  } catch (error) {
    return errorResponse(error);
  }
}

function errorResponse(error: unknown) {
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: { code: "invalid_json", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  if (error instanceof ApiServiceError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status }
    );
  }

  return NextResponse.json(
    { error: { code: "internal_error", message: "Unexpected mock API error." } },
    { status: 500 }
  );
}
