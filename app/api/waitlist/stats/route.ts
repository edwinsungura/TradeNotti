import { NextResponse } from "next/server";
import { launchDateISO, totalInLine } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

/** Public, cheap: live count + launch date for the hero counter & countdown. */
export async function GET() {
  try {
    const total = await totalInLine();
    return NextResponse.json({ total, launchDate: launchDateISO() });
  } catch (err) {
    console.error("waitlist stats failed:", err);
    // Never break the page over a stats read — fall back to the head-start.
    return NextResponse.json({ total: null, launchDate: launchDateISO() });
  }
}
