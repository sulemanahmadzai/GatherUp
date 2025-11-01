import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await deleteSession();
  const url = new URL("/sign-in", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: NextRequest) {
  await deleteSession();
  const url = new URL("/sign-in", request.url);
  return NextResponse.redirect(url, { status: 303 });
}
