export interface CategoryItem {
  category: string;
  minutes: number;
  color: string;
}

export function categoryTime(
  categories: Omit<CategoryItem, "color">[]
): CategoryItem[] {
  function getCategoryColor(index: number): string {
    const colorIndex = index % 7 || 7;
    const colorVarName = `--color-category-${colorIndex}-${getColorName(
      colorIndex
    )}`;

    if (typeof window !== "undefined") {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(colorVarName)
        .trim();
    }

    return defaultColor(colorIndex);
  }

  function getColorName(i: number): string {
    switch (i) {
      case 1:
        return "red";
      case 2:
        return "orange";
      case 3:
        return "yellow";
      case 4:
        return "green";
      case 5:
        return "skyblue";
      case 6:
        return "blue";
      case 7:
        return "purple";
      default:
        return "red";
    }
  }

  function defaultColor(i: number): string {
    const map = [
      "#f86e64",
      "#ffa569",
      "#fbda55",
      "#73e07a",
      "#69e3f6",
      "#6297f3",
      "#a27bf0",
    ];
    return map[(i - 1) % map.length];
  }

  // 색상 순환
  return categories.map((item, idx) => ({
    ...item,
    color: getCategoryColor(idx + 1),
  }));
}
