"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { deleteTrade } from "@/lib/actions/trades";

export function DeleteTradeButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      icon="trash-2"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteTrade(id);
          router.push("/journal");
          router.refresh();
        })
      }
    >
      Delete
    </Button>
  );
}
