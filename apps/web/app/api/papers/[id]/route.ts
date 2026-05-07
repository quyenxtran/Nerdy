import { NextResponse } from "next/server";

import { ApiServiceError, getPaper } from "@/lib/services";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    return NextResponse.json(getPaper(id));
  } catch (error) {
    return errorResponse(error);
  }
}

function errorResponse(error: unknown) {
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
