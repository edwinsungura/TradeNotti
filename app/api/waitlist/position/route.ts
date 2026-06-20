import { NextResponse } from "next/server";
import { statusByRefCode } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

// Look up a member's current spot by their referral code. Powers the
// "remember me on this device" restore and the live-updating status page.
export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "Missing ref." }, { status: 400 });
  }
  const status = await statusByRefCode(ref);
  if (!status) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, ...status });
}
