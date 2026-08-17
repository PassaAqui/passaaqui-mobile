import { useWindowDimensions } from "react-native";

interface UseResponsiveGridOptions {
  padding?: number;
  gap?: number;
  minItemWidth?: number;
}

export function useResponsiveGrid<T extends readonly unknown[]>(
  items: T | undefined,
  options?: UseResponsiveGridOptions
) {
  const { padding = 16, gap = 24, minItemWidth = 150 } = options ?? {};
  const { width } = useWindowDimensions();

  const containerWidth = width - padding * 2;
  const columns = containerWidth >= minItemWidth * 2 + gap ? 2 : 1;
  const cardWidth = (containerWidth - gap * (columns - 1)) / columns;

  type Item = T[number];
  const rows: Item[][] = [];
  if (items) {
    for (let i = 0; i < items.length; i += columns) {
      rows.push(items.slice(i, i + columns) as Item[]);
    }
  }

  const getItemWidth = (row: Item[]) => {
    if (row.length === columns) return cardWidth;
    return (containerWidth - gap * (row.length - 1)) / row.length;
  };

  return { rows, getItemWidth, columns };
}