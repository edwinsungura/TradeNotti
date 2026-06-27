import { prisma } from "@/lib/prisma";
import { subscribeToEmailList } from "@/lib/email-list";

/**
 * Waitlist domain logic — referral codes, live counts, and "position in line".
 *
 * Position is *derived*, never stored: the queue is ordered by referral count
 * (more referrals = climb the line), then by signup time (earlier = ahead).
 * This keeps every position correct after any referral without a backfill job.
 */

// Real-by-default: the public count is the actual number of signups. Set
// NEXT_PUBLIC_WAITLIST_BASE_COUNT to add a visible head-start if ever wanted.
export const WAITLIST_BASE_COUNT = Number(
  process.env.NEXT_PUBLIC_WAITLIST_BASE_COUNT ?? 0,
);

// When the next cohort opens. Override with NEXT_PUBLIC_LAUNCH_DATE (ISO 8601);
// falls back to the confirmed launch date so production is correct even if the
// env var is missing.
const DEFAULT_LAUNCH = "2026-08-01T13:00:00Z";
export function launchDateISO(): string {
  const fromEnv = process.env.NEXT_PUBLIC_LAUNCH_DATE;
  if (fromEnv && !Number.isNaN(Date.parse(fromEnv))) return fromEnv;
  return DEFAULT_LAUNCH;
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

export function generateRefCode(len = 7): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return out;
}

/** A code unique against the DB (retries on the rare collision). */
async function uniqueRefCode(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = generateRefCode();
    const clash = await prisma.waitlistEntry.findUnique({ where: { refCode: code } });
    if (!clash) return code;
  }
  // Extremely unlikely; widen the space rather than fail the signup.
  return generateRefCode(10);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/** Total people in line, including the configured head-start. */
export async function totalInLine(): Promise<number> {
  const real = await prisma.waitlistEntry.count();
  return WAITLIST_BASE_COUNT + real;
}

/**
 * 1-based position for an entry. We count how many entries rank strictly ahead
 * of it (more referrals, or equal referrals but signed up earlier) and add the
 * head-start so positions read consistently with the public total.
 */
export async function positionFor(entry: {
  referrals: number;
  createdAt: Date;
}): Promise<number> {
  const ahead = await prisma.waitlistEntry.count({
    where: {
      OR: [
        { referrals: { gt: entry.referrals } },
        { referrals: entry.referrals, createdAt: { lt: entry.createdAt } },
      ],
    },
  });
  return WAITLIST_BASE_COUNT + ahead + 1;
}

export type JoinResult = {
  email: string;
  refCode: string;
  position: number;
  referrals: number;
  total: number;
  alreadyJoined: boolean;
};

/** Build the public join result for an entry, computing its live position. */
async function toResult(
  entry: { email: string; refCode: string; referrals: number; createdAt: Date },
  alreadyJoined: boolean,
): Promise<JoinResult> {
  return {
    email: entry.email,
    refCode: entry.refCode,
    position: await positionFor(entry),
    referrals: entry.referrals,
    total: await totalInLine(),
    alreadyJoined,
  };
}

/** True for a Prisma unique-constraint violation (P2002). */
function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
}

/**
 * Idempotent join. Re-submitting the same email returns the existing record
 * (with its current position) rather than erroring or double-counting a
 * referral. A referral is only credited the first time an email joins.
 */
export async function joinWaitlist(input: {
  email: string;
  ref?: string | null;
  source?: string | null;
}): Promise<JoinResult> {
  const email = normalizeEmail(input.email);

  const existing = await prisma.waitlistEntry.findUnique({ where: { email } });
  if (existing) return toResult(existing, true);

  // Resolve the inviter (if any) — can't refer yourself, code must exist.
  let referredBy: string | null = null;
  const ref = input.ref?.trim().toUpperCase();
  if (ref) {
    const inviter = await prisma.waitlistEntry.findUnique({ where: { refCode: ref } });
    if (inviter && inviter.email !== email) referredBy = inviter.refCode;
  }

  const refCode = await uniqueRefCode();
  let created;
  try {
    created = await prisma.waitlistEntry.create({
      data: { email, refCode, referredBy, source: input.source ?? null },
    });
  } catch (err) {
    // Concurrent double-submit of the same email: another request inserted the
    // row between our findUnique and create. Return the existing spot instead
    // of surfacing an error (and without crediting the inviter twice).
    if (isUniqueViolation(err)) {
      const raced = await prisma.waitlistEntry.findUnique({ where: { email } });
      if (raced) return toResult(raced, true);
    }
    throw err;
  }

  // Credit the inviter — moves them up the line.
  if (referredBy) {
    await prisma.waitlistEntry.update({
      where: { refCode: referredBy },
      data: { referrals: { increment: 1 } },
    });
  }

  // Sync to the configured email provider (no-op if none configured). Never
  // let a provider hiccup fail the signup — the row is already saved.
  await subscribeToEmailList({
    email: created.email,
    refCode: created.refCode,
    referredBy: created.referredBy,
    source: created.source,
  });

  return toResult(created, false);
}
