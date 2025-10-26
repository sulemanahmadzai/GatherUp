import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await deleteSession();
  return NextResponse.redirect(new URL("/sign-in", request.url));
}

export async function GET(request: NextRequest) {
  await deleteSession();
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
