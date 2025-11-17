export interface CategoryItem {
  category: string;
  seconds: number;
  color: string;
}

type CategoryInput = {
  category: string;
  seconds: number;
  color?: string | null;
};

const NAMED_TO_TOKEN = {
  RED: "category-1-red",
  ORANGE: "category-2-orange",
  YELLOW: "category-3-yellow",
  GREEN: "category-4-green",
  SKYBLUE: "category-5-skyblue",
  BLUE: "category-6-blue",
  INDIGO: "category-6-blue",
  PURPLE: "category-7-purple",
} as const;

const FALLBACK_PALETTE = [
  "#f86e64",
  "#ffa569",
  "#fbda55",
  "#73e07a",
  "#69e3f6",
  "#6297f3",
  "#a27bf0",
];

export function toCssColor(name: string | null | undefined, idx: number = 0) {
  const fallback = FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
  const trimmed = name?.trim();
  if (!trimmed) return fallback;

  const token =
    NAMED_TO_TOKEN[trimmed.toUpperCase() as keyof typeof NAMED_TO_TOKEN];
  if (token) {
    return `var(--color-${token}, ${fallback})`;
  }

  const lower = trimmed.toLowerCase();
  if (
    trimmed.startsWith("#") ||
    lower.startsWith("rgb") ||
    lower.startsWith("hsl") ||
    lower.startsWith("var(")
  ) {
    return trimmed;
  }

  return trimmed;
}

export function categoryTime(categories: CategoryInput[]): CategoryItem[] {
  return categories.map((item, idx) => ({
    category: item.category,
    seconds: item.seconds,
    color: toCssColor(item.color, idx),
  }));
}

export function resolveCanvasColor(color: string, fallback = "#f86e64") {
  if (!color) return fallback;
  const trimmed = color.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith("var(")) {
    const match = /var\((--[^,\s)]+)(?:,\s*([^)]+))?\)/.exec(trimmed);
    if (match) {
      const cssVarName = match[1];
      const varFallback = match[2]?.trim().replace(/^['"]|['"]$/g, "");
      if (typeof window !== "undefined") {
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(cssVarName)
          .trim();
        if (value) return value;
      }
      if (varFallback) return varFallback;
    }
    return fallback;
  }

  return trimmed;
}
