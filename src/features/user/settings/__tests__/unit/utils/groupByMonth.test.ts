import { groupByMonth } from "@/src/features/user/settings/utils/groupByMonth";
import type { TravelHistoryItem } from "@/src/features/user/settings/types/travelHistory";

function makeItem(visitId: number, visitedAt: string): TravelHistoryItem {
  return {
    visitId,
    poiId: visitId,
    poiName: `POI ${visitId}`,
    poiDescription: "",
    imageUrl: null,
    poiType: "TOURIST_POINT",
    cityName: "Recife",
    xpEarned: 10,
    distanceKm: 1,
    visitedAt,
  };
}

describe("groupByMonth", () => {
  it("devolve lista vazia para lista vazia", () => {
    expect(groupByMonth([])).toEqual([]);
  });

  it("mantém no mesmo grupo itens do mesmo mês", () => {
    const items = [
      makeItem(2, "2026-09-05T10:45:00"),
      makeItem(1, "2026-09-18T16:10:00"),
    ];

    const groups = groupByMonth(items);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Setembro de 2026");
    expect(groups[0].items.map((item) => item.visitId)).toEqual([2, 1]);
  });

  it("separa meses diferentes mantendo a ordem de entrada", () => {
    const items = [
      makeItem(3, "2026-09-05T10:45:00"),
      makeItem(2, "2026-08-03T09:20:00"),
      makeItem(1, "2026-05-24T14:30:00"),
    ];

    const groups = groupByMonth(items);

    expect(groups.map((group) => group.label)).toEqual([
      "Setembro de 2026",
      "Agosto de 2026",
      "Maio de 2026",
    ]);
    expect(groups.map((group) => group.items.map((item) => item.visitId))).toEqual([
      [3],
      [2],
      [1],
    ]);
  });

  it("trata o mesmo mês em anos diferentes como grupos distintos", () => {
    const items = [
      makeItem(2, "2026-05-24T14:30:00"),
      makeItem(1, "2025-05-10T08:00:00"),
    ];

    const groups = groupByMonth(items);

    expect(groups.map((group) => group.label)).toEqual([
      "Maio de 2026",
      "Maio de 2025",
    ]);
    expect(groups.map((group) => group.items.map((item) => item.visitId))).toEqual([
      [2],
      [1],
    ]);
  });
});