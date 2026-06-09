/** Server-safe formatters (importable from both server and client components). */

export function formatMoney(n: number | null | undefined, opts: { showSign?: boolean; decimals?: number } = {}) {
  const { showSign = true, decimals = 2 } = opts;
  if (n == null) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const abs = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${showSign ? sign : ""}$${abs}`;
}
