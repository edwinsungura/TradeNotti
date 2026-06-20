import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidEmail, joinWaitlist } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().min(3).max(320),
  ref: z.string().max(16).optional().nullable(),
  source: z.string().max(120).optional().nullable(),
  // Honeypot: real users never fill this hidden field.
  company: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, ref, source, company } = parsed.data;

  // Bot trap — pretend success so scrapers don't learn the field is checked.
  if (company && company.trim() !== "") {
    return NextResponse.json({ ok: true, bot: true });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  try {
    const result = await joinWaitlist({ email, ref, source });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("waitlist join failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
