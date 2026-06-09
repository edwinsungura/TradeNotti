"use client";

import React, { useEffect, useRef, useState } from "react";
import { icons } from "lucide-react";

/* ============================================================
   Shared UI kit — ported from the approved TradeNotti prototype.
   Class names + markup match the prototype's design system (oa-*).
   ============================================================ */

function toPascal(name: string) {
  return name
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

export function Icon({
  name,
  size = 18,
  color = "currentColor",
  stroke = 1.75,
  className = "",
  style = {},
}: {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Cmp = (icons as Record<string, React.ComponentType<Record<string, unknown>>>)[toPascal(name)];
  return (
    <span className={`oa-icon ${className}`} style={{ display: "inline-flex", lineHeight: 0, ...style }}>
      {Cmp ? <Cmp size={size} color={color} strokeWidth={stroke} /> : null}
    </span>
  );
}

/* -- BrandLogo: iris ledger-tick mark + wordmark ----------------- */
export function BrandLogo({ size = 20, onClick }: { size?: number; onClick?: () => void }) {
  return (
    <span
      className="oa-logo"
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 9, cursor: onClick ? "pointer" : undefined }}
    >
      <svg width={size + 4} height={size + 4} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="var(--gold)" />
        <path
          d="M7 13.5l3 3 7-8"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="oa-logo-word pp-brand-word"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: size * 0.8,
          letterSpacing: "-0.01em",
          color: "var(--ink)",
        }}
      >
        TradeNotti
      </span>
    </span>
  );
}

/* -- Button ------------------------------------------------------- */
export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  children,
  onClick,
  style,
  type = "button",
  disabled,
}: {
  variant?: "secondary" | "accent" | "ghost" | "primary" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconRight?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      className={`oa-btn oa-btn-${variant} oa-btn-${size}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      {icon ? <Icon name={icon} size={size === "sm" ? 14 : 16} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={size === "sm" ? 14 : 16} /> : null}
    </button>
  );
}

/* -- Field / Input / Select / Textarea / Segmented --------------- */
export function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="oa-field">
      {label ? <span className="oa-field-label">{label}</span> : null}
      {children}
      {hint ? <span className="oa-field-hint">{hint}</span> : null}
    </label>
  );
}

export function Input({
  mono = false,
  ...props
}: { mono?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`oa-input ${mono ? "oa-mono" : ""}`} {...props} />;
}

export function Select({
  value,
  onChange,
  options,
  ...rest
}: {
  value?: string;
  onChange?: (v: string) => void;
  options: { value: string; label: string }[];
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value">) {
  return (
    <select className="oa-input" value={value} onChange={(e) => onChange?.(e.target.value)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="oa-textarea" {...props} />;
}

export function Segmented({
  value,
  onChange,
  options,
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  size?: "sm" | "md";
}) {
  return (
    <div className={`oa-seg oa-seg-${size}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={value === o.value ? "on" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -- Chips / Dots / Score ---------------------------------------- */
export function TagChip({
  tone = "neutral",
  children,
  icon,
  onClick,
}: {
  tone?: string;
  children: React.ReactNode;
  icon?: string;
  onClick?: () => void;
}) {
  return (
    <span
      className={`oa-chip oa-chip-${tone}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {icon ? <Icon name={icon} size={11} /> : null}
      {children}
    </span>
  );
}

export function StatusDot({ kind }: { kind: string }) {
  const map: Record<string, string> = {
    profit: "var(--profit)",
    loss: "var(--loss)",
    open: "var(--info)",
    warn: "var(--warn)",
  };
  return <span className="oa-dot" style={{ background: map[kind] || "var(--stone-300)" }} />;
}

export function Score({ value = 0, max = 5 }: { value?: number; max?: number }) {
  return (
    <span className="oa-score">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={"oa-score-pip " + (i < value ? "on" : "")} />
      ))}
    </span>
  );
}

/* -- Card surfaces ----------------------------------------------- */
export function Card({
  children,
  tone = "default",
  style,
  padding = 20,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  tone?: string;
  style?: React.CSSProperties;
  padding?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`oa-card oa-card-${tone} ${className}`} style={{ padding, ...style }} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({
  overline,
  title,
  action,
}: {
  overline?: string;
  title?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="oa-card-header">
      <div>
        {overline ? (
          <div className="overline" style={{ marginBottom: 6 }}>
            {overline}
          </div>
        ) : null}
        {title ? <h3 className="oa-card-title">{title}</h3> : null}
      </div>
      {action ? <div className="oa-card-action">{action}</div> : null}
    </div>
  );
}

/* -- KpiCard ------------------------------------------------------ */
export function KpiCard({
  overline,
  value,
  delta,
  deltaKind = "neutral",
  footnote,
  valueClass = "",
}: {
  overline: string;
  value: React.ReactNode;
  delta?: string;
  deltaKind?: "neutral" | "profit" | "loss";
  footnote?: string;
  valueClass?: string;
}) {
  return (
    <Card>
      <div className="overline" style={{ marginBottom: 10 }}>
        {overline}
      </div>
      <div className={`oa-kpi-value ${valueClass}`}>{value}</div>
      {delta ? (
        <div className={`oa-kpi-delta oa-kpi-delta-${deltaKind}`}>
          {deltaKind === "profit" ? "▲ " : deltaKind === "loss" ? "▼ " : ""}
          {delta}
        </div>
      ) : null}
      {footnote ? <div className="oa-kpi-foot">{footnote}</div> : null}
    </Card>
  );
}

/* -- EquityCurve (sparkline) ------------------------------------- */
export function EquityCurve({
  points,
  height = 160,
  accent = "var(--ink)",
  fill = "var(--gold-soft)",
}: {
  points: number[];
  height?: number;
  accent?: string;
  fill?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((es) => setW(Math.max(200, es[0].contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  if (!points.length) return <div ref={ref} style={{ width: "100%", height }} />;
  const min = Math.min(...points),
    max = Math.max(...points);
  const range = max - min || 1;
  const pad = 8;
  const innerH = height - pad * 2;
  const stepX = (w - pad * 2) / Math.max(1, points.length - 1);
  const coords = points.map((p, i) => [pad + i * stepX, pad + innerH - ((p - min) / range) * innerH]);
  const path = coords.map((c, i) => (i ? "L" : "M") + c[0].toFixed(1) + " " + c[1].toFixed(1)).join(" ");
  const area =
    path +
    ` L${(pad + (points.length - 1) * stepX).toFixed(1)} ${height - pad} L${pad} ${height - pad} Z`;
  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={w} height={height} style={{ display: "block" }}>
        <defs>
          <linearGradient id="oa-eq-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.7" />
            <stop offset="100%" stopColor={fill} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#oa-eq-fill)" />
        <path d={path} stroke={accent} strokeWidth="1.75" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="3.5" fill={accent} />
        <circle
          cx={coords[coords.length - 1][0]}
          cy={coords[coords.length - 1][1]}
          r="6.5"
          fill="none"
          stroke={accent}
          strokeOpacity="0.2"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/* -- WinRateRing (donut) ----------------------------------------- */
export function WinRateRing({ value = 0.62, size = 88, stroke = 10 }: { value?: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = value * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--stone-100)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--profit)"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 + 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-display)"
        fontWeight="700"
        fontSize="22"
        fill="var(--ink)"
      >
        {Math.round(value * 100)}%
      </text>
    </svg>
  );
}

/* -- Formatters --------------------------------------------------- */
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

/* -- TradeRow ----------------------------------------------------- */
export type TradeRowData = {
  id: string;
  pair: string;
  direction: "long" | "short";
  status?: string;
  entry?: string | number | null;
  sl?: string | number | null;
  tp?: string | number | null;
  pnl?: number | null;
  rr?: number | null;
  grade?: string | null;
  tags?: string[];
  date?: string;
};

export function TradeRow({
  trade,
  onOpen,
  selected,
}: {
  trade: TradeRowData;
  onOpen?: (t: TradeRowData) => void;
  selected?: boolean;
}) {
  const pnlClass = (trade.pnl ?? 0) > 0 ? "profit" : (trade.pnl ?? 0) < 0 ? "loss" : "";
  const dirArrow = trade.direction === "long" ? "▲" : "▼";
  return (
    <div className={`oa-trow ${selected ? "selected" : ""}`} onClick={() => onOpen?.(trade)}>
      <div className="oa-trow-pair">
        <StatusDot kind={trade.status === "open" ? "open" : (trade.pnl ?? 0) >= 0 ? "profit" : "loss"} />
        <span className="oa-pair">{trade.pair}</span>
      </div>
      <div className="oa-trow-dir">
        <span className={trade.direction === "long" ? "profit" : "loss"}>{dirArrow}</span>
        <span style={{ color: "var(--fg-2)", marginLeft: 6, fontSize: 12, textTransform: "capitalize" }}>
          {trade.direction}
        </span>
      </div>
      <div className="oa-mono oa-trow-num">{trade.entry ?? "—"}</div>
      <div className="oa-mono oa-trow-num">{trade.sl ?? "—"}</div>
      <div className="oa-mono oa-trow-num">{trade.tp ?? "—"}</div>
      <div className={`oa-mono oa-trow-num ${pnlClass}`} style={{ fontWeight: 600 }}>
        {trade.pnl != null ? formatMoney(trade.pnl) : "—"}
      </div>
      <div className={`oa-mono oa-trow-num ${pnlClass}`}>
        {trade.rr != null ? (trade.rr > 0 ? "+" : "−") + Math.abs(trade.rr).toFixed(2) + "R" : "—"}
      </div>
      <div className="oa-trow-grade">
        <span className={`oa-grade oa-grade-${trade.grade?.toLowerCase().replace(/\s+/g, "-")}`}>
          {trade.grade || "—"}
        </span>
      </div>
      <div className="oa-trow-tags">
        {(trade.tags || []).slice(0, 2).map((t) => (
          <TagChip key={t} tone="neutral">
            {t}
          </TagChip>
        ))}
        {(trade.tags || []).length > 2 ? (
          <span className="t-caption" style={{ color: "var(--fg-3)" }}>
            +{(trade.tags || []).length - 2}
          </span>
        ) : null}
      </div>
      <div className="oa-trow-date">{trade.date}</div>
    </div>
  );
}

/* -- EmptyState --------------------------------------------------- */
export function EmptyState({
  icon = "inbox",
  title,
  body,
  action,
}: {
  icon?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="oa-empty">
      <div className="oa-empty-icon">
        <Icon name={icon} size={22} color="var(--fg-3)" />
      </div>
      <div className="oa-empty-title">{title}</div>
      {body ? <div className="oa-empty-body">{body}</div> : null}
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </div>
  );
}

/* -- CalendarMonth ----------------------------------------------- */
export type CalDay = { day: number; pnl?: number; trades?: number; today?: boolean; future?: boolean };

export function CalendarMonth({
  days,
  onDayClick,
  compact = false,
  colored = false,
  startDow = 1,
}: {
  days: CalDay[];
  onDayClick?: (d: CalDay) => void;
  compact?: boolean;
  colored?: boolean;
  startDow?: number;
}) {
  const cells: (CalDay | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  cells.push(...days);
  while (cells.length % 7) cells.push(null);

  const max = Math.max(1, ...days.map((d) => Math.abs(d?.pnl || 0)));

  return (
    <div className={`oa-cal ${compact ? "oa-cal-compact" : ""}`}>
      <div className="oa-cal-dow">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="oa-cal-grid">
        {cells.map((c, i) => {
          if (!c) return <div key={i} className="oa-cal-cell oa-cal-empty" />;
          let bg = "var(--paper-raised)";
          let isProfit = false,
            isLoss = false;
          if (colored) {
            const intensity = Math.min(1, Math.abs(c.pnl || 0) / max);
            isProfit = (c.pnl || 0) > 0;
            isLoss = (c.pnl || 0) < 0;
            const isNeutral = c.pnl === 0 && (c.trades || 0) > 0;
            bg = isProfit
              ? `rgba(31, 157, 107, ${0.1 + intensity * 0.6})`
              : isLoss
                ? `rgba(214, 69, 69, ${0.1 + intensity * 0.6})`
                : isNeutral
                  ? `var(--stone-100)`
                  : "transparent";
          }
          const border = c.today ? "1.5px solid var(--gold)" : "1px solid var(--line-2)";
          return (
            <div
              key={i}
              className={`oa-cal-cell ${c.future ? "future" : ""} ${c.today ? "today" : ""}`}
              style={{ background: bg, border }}
              onClick={() => onDayClick?.(c)}
            >
              <div className="oa-cal-day">{c.day}</div>
              {colored && (c.trades || 0) > 0 ? (
                <>
                  <div className={`oa-cal-pnl ${isProfit ? "profit" : isLoss ? "loss" : ""}`}>
                    {formatMoney(c.pnl, { decimals: 0 })}
                  </div>
                  <div className="oa-cal-trades">
                    {c.trades} {c.trades === 1 ? "trade" : "trades"}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
