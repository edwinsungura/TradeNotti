import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Returns the Neon `User` row for the signed-in Clerk user, creating or linking
 * it on first access. Redirects to /login when there is no Clerk session.
 * Use in server components / actions that require auth.
 */
export async function requireUser() {
  const cu = await currentUser();
  if (!cu) redirect("/login");

  const email =
    cu.primaryEmailAddress?.emailAddress ?? cu.emailAddresses[0]?.emailAddress ?? null;
  const displayName =
    cu.username ??
    (typeof cu.unsafeMetadata?.username === "string" ? cu.unsafeMetadata.username : null) ??
    cu.firstName ??
    null;

  // 1) Already linked by Clerk id.
  let user = await prisma.user.findUnique({ where: { clerkId: cu.id } });

  // 2) Existing email-based account (e.g. migrated from the old auth) — link it.
  if (!user && email) {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId: cu.id, image: byEmail.image ?? cu.imageUrl ?? null },
      });
    }
  }

  // 3) Brand new trader — create the row.
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: cu.id,
        email: email ?? `${cu.id}@clerk.local`,
        name: displayName,
        image: cu.imageUrl ?? null,
        onboardedAt: new Date(),
      },
    });
  }

  return user;
}
