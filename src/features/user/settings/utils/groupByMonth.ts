import type { TravelHistoryItem } from "@/src/features/user/settings/types/travelHistory";
import { formatMonthLabel } from "@/src/features/user/settings/utils/formatVisitDate";

export type MonthGroup = { label: string; items: TravelHistoryItem[] };

// Assume a lista já ordenada do mais recente para o mais antigo (como a API devolve)
export function groupByMonth(items: TravelHistoryItem[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const item of items) {
    const label = formatMonthLabel(item.visitedAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}