"use client";

import { Icon } from "@/components/ui";

export function PrintButton({ label = "Export PDF" }: { label?: string }) {
  return (
    <button className="oa-btn oa-btn-secondary oa-btn-md" onClick={() => window.print()}>
      <Icon name="download" size={15} /> {label}
    </button>
  );
}
