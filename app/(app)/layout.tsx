import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell, type AccountVM } from "@/components/app-shell";
import { ThemeApplier } from "@/components/theme-applier";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) redirect("/login");

  const accounts: AccountVM[] = user.accounts.map((a) => ({
    id: a.id,
    name: a.name,
    broker: a.broker,
    currency: a.currency,
    kind: a.kind,
    balance: a.balance,
  }));

  return (
    <>
      <ThemeApplier theme={user.theme} accent={user.accentPalette} />
      <AppShell
        accounts={accounts}
        currentId={accounts[0]?.id}
        user={{ name: user.name || "Trader", email: user.email, plan: "Free trial" }}
      >
        {children}
      </AppShell>
    </>
  );
}
