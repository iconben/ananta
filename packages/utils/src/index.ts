import type { Practice } from '@ananta/types';

// Number formatter: 亿/万 formatting
export const fmtN = (n: number): string =>
  n >= 100000000 ? (n / 100000000).toFixed(2) + "亿" :
  n >= 10000 ? (n / 10000).toFixed(n >= 100000 ? 0 : 1) + "万" :
  n.toLocaleString();

// Color options (from prototype line 9)
export const COLOR_OPTIONS = [
  "#f0c040","#a78bfa","#34d399","#fb923c","#fbbf24",
  "#60a5fa","#f472b6","#a3e635","#e879f9","#22d3ee"
];

// Icon options (from prototype line 8)
export const ICON_OPTIONS = [
  "🪷","🕯️","📜","🙇","🕯","☸️","📿","🔔","🌸",
  "⭐","🌙","🏮","💎","🌿","🙏","🪬","🫧","🌊"
];

// Default practices (from prototype lines 11-18)
export const INIT_PRACTICES: Practice[] = [
  { id: "guanyin",  name: "觀音心咒",     icon: "🪷", unit: "遍", color: "#f0c040", updatedAt: new Date(0).toISOString() },
  { id: "dizang",   name: "地藏菩萨名号", icon: "🕯️", unit: "遍", color: "#a78bfa", updatedAt: new Date(0).toISOString() },
  { id: "yaoshi",   name: "药师经",       icon: "📜", unit: "部", color: "#34d399", updatedAt: new Date(0).toISOString() },
  { id: "ketou",    name: "大礼拜",       icon: "🙇", unit: "拜", color: "#fb923c", updatedAt: new Date(0).toISOString() },
  { id: "gongling", name: "供灯",         icon: "🕯",  unit: "盏", color: "#fbbf24", updatedAt: new Date(0).toISOString() },
  { id: "chijie",   name: "持戒日",       icon: "☸️",  unit: "天", color: "#60a5fa", updatedAt: new Date(0).toISOString() },
];

// Theme colors
export const COLORS = {
  bg: "#080c18",
  gold: "#f0c040",
  text: "#e5dcc8",
  textMuted: "rgba(255,255,255,0.4)",
  cardBg: "rgba(255,255,255,.03)",
  cardBorder: "rgba(255,255,255,.08)",
};

// Helper: generate UUID
export const uid = (): string => Math.random().toString(36).slice(2);

// Helper: hex to rgb comma-separated
export const hex2rgb = (hex: string): string =>
  [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(",");
