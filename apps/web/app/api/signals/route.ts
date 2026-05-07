import { NextResponse } from "next/server";

import type { CreateSignalRequest } from "@/lib/contracts";
import { ApiServiceError, createSignal, getSignals, parseJsonObject } from "@/lib/services";

export function GET() {
  return NextResponse.json(getSignals());
}

export async function POST(request: Request) {
  try {
    const body = parseJsonObject(await request.json());

    return NextResponse.json(createSignal(body as CreateSignalRequest), { status: 201 });
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
    { error: { code: "internal_error", message: "Unexpected signal API error." } },
    { status: 500 }
  );
}
