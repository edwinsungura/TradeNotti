"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { generateMyInsight } from "@/lib/actions/insight";

export function InsightGenerate({ label = "Generate today's insight" }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      icon="sparkles"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await generateMyInsight();
          router.refresh();
        })
      }
    >
      {pending ? "Generating…" : label}
    </Button>
  );
}
