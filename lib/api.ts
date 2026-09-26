import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function staffOnly() {
  return requireUser(["administrator", "front_desk"]);
}
