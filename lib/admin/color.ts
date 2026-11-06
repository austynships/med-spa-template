import type { SiteConfig } from "@/lib/site-types";

/** Saturation and lightness of a #rrggbb color, 0–1. */
export function hsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  return { s, l };
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0")).join("");
export const mix = (a: string, b: string, t: number) => toHex(rgb(a).map((x, i) => x + (rgb(b)[i] - x) * t));

/** A full palette from one or two brand colors, keeping text readable. */
export function paletteFrom(primary: string, accent?: string): SiteConfig["colors"] {
  let p = primary;
  const { l } = hsl(p);
  if (l > 0.62) p = mix(p, "#000000", (l - 0.55) / l); // too light for white button text
  const a = accent && accent !== primary ? accent : mix(p, "#ffffff", 0.35);
  return {
    primary: p,
    primaryDark: mix(p, "#000000", 0.2),
    accent: a,
    background: mix(p, "#ffffff", 0.96),
    surface: "#FFFFFF",
    soft: mix(p, "#ffffff", 0.9),
    text: mix(p, "#1a1a1a", 0.88),
    muted: mix(p, "#6b6b6b", 0.8),
    dark: mix(p, "#1a1a1a", 0.82),
  };
}

