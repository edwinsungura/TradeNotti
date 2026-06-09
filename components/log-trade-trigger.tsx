"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { LogTradeModal } from "@/components/log-trade-modal";

type Mode = "trade" | "missed" | "backtest";

export function LogTradeTrigger({
  mode = "trade",
  variant = "accent",
  icon,
  children,
  fullWidth = false,
}: {
  mode?: Mode;
  variant?: "secondary" | "accent" | "ghost" | "primary";
  icon?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        icon={icon}
        onClick={() => setOpen(true)}
        style={fullWidth ? { width: "100%", justifyContent: "center" } : undefined}
      >
        {children}
      </Button>
      {open ? <LogTradeModal initialMode={mode} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
