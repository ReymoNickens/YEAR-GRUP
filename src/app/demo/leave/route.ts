import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo";

/** Back to the start of the demo, to choose someone else. */
export async function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/demo", request.url));
  res.cookies.delete(DEMO_COOKIE);
  return res;
}
