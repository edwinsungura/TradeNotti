import { ImageResponse } from "next/og";

// Browser tab / favicon. Rendered to a PNG (rather than served as raw SVG)
// because Safari does not reliably render SVG favicons and falls back to a
// "T". This guarantees the equity-curve line mark shows in every browser.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#ffffff"/>
  <line x1="9" y1="46" x2="55" y2="46" stroke="#E6E8EE" stroke-width="2"/>
  <polyline points="9,41 18,37 26,43 34,31 42,36 50,25 55,19" fill="none" stroke="#5347F0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="42" cy="36" r="3" fill="#ffffff" stroke="#5347F0" stroke-width="2.5"/>
  <circle cx="55" cy="19" r="7" fill="#5347F0" opacity="0.18"/>
  <circle cx="55" cy="19" r="4.2" fill="#5347F0"/>
</svg>`;

export default function Icon() {
  const src = `data:image/svg+xml;base64,${btoa(MARK)}`;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width={64} height={64} src={src} alt="" />
      </div>
    ),
    size,
  );
}
