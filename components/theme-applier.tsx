"use client";

import { useEffect } from "react";

// [primary, deep/hover, soft, wash] — mirrors the prototype's BRAND_PALETTES.
const PALETTES: Record<string, [string, string, string, string]> = {
  iris: ["#5347F0", "#3D31CE", "#DEDBFB", "#F0EEFE"],
  blue: ["#4A90E2", "#2A6FDB", "#DBEAFE", "#EFF6FF"],
  emerald: ["#10B981", "#059669", "#D1FAE5", "#ECFDF5"],
  gold: ["#E5C28E", "#C9A063", "#F4E4C7", "#FBF5E9"],
};

export function ThemeApplier({ theme, accent }: { theme: string; accent: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    const p = PALETTES[accent] || PALETTES.iris;
    root.style.setProperty("--gold", p[0]);
    root.style.setProperty("--gold-deep", p[1]);
    root.style.setProperty("--gold-soft", p[2]);
    root.style.setProperty("--gold-wash", p[3]);
    root.style.setProperty("--accent", p[1]);
    root.style.setProperty("--accent-hover", p[0]);
  }, [theme, accent]);
  return null;
}
