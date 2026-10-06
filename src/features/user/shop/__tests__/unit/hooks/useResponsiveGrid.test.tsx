import { renderHook } from "@testing-library/react-native";
import { Dimensions } from "react-native";
import { useResponsiveGrid } from "@/src/features/user/shop/hooks/useResponsiveGrid";

function mockWindowWidth(width: number) {
  Dimensions.set({
    window: { width, height: 800, scale: 1, fontScale: 1 },
    screen: { width, height: 800, scale: 1, fontScale: 1 },
  });
}

beforeEach(() => {
  mockWindowWidth(400);
});

afterEach(() => {
  mockWindowWidth(750);
});

describe("useResponsiveGrid", () => {
  it("calcula 2 colunas quando a largura comporta dois cards", () => {
    // Act
    const { result } = renderHook(() =>
      useResponsiveGrid(["a", "b", "c", "d", "e"])
    );

    // Assert
    expect(result.current.columns).toBe(2);
    expect(result.current.rows).toEqual([["a", "b"], ["c", "d"], ["e"]]);
  });

  it("usa largura padrão para linhas completas e largura total para a última linha incompleta", () => {
    // containerWidth = 400 - 16*2 = 368; cardWidth = (368 - 24)/2 = 172
    const { result } = renderHook(() =>
      useResponsiveGrid(["a", "b", "c", "d", "e"])
    );

    // Act
    const fullRowWidth = result.current.getItemWidth(["a", "b"]);
    const lastRowWidth = result.current.getItemWidth(["e"]);

    // Assert
    expect(fullRowWidth).toBe(172);
    expect(lastRowWidth).toBe(368);
  });

  it("calcula 1 coluna quando a largura não comporta dois cards", () => {
    // Arrange
    mockWindowWidth(300);

    // containerWidth = 300 - 32 = 268 < 150*2 + 24 = 324 => 1 coluna
    const { result } = renderHook(() =>
      useResponsiveGrid(["a", "b", "c"])
    );

    // Act
    const itemWidth = result.current.getItemWidth(["a"]);

    // Assert
    expect(result.current.columns).toBe(1);
    expect(result.current.rows).toEqual([["a"], ["b"], ["c"]]);
    expect(itemWidth).toBe(268);
  });

  it("retorna lista vazia de linhas quando não há itens", () => {
    // Act
    const { result } = renderHook(() => useResponsiveGrid([]));

    // Assert
    expect(result.current.rows).toEqual([]);
  });

  it("retorna lista vazia de linhas quando os itens são undefined", () => {
    // Act
    const { result } = renderHook(() => useResponsiveGrid(undefined));

    // Assert
    expect(result.current.rows).toEqual([]);
  });

  it("respeita opções customizadas de padding, gap e minItemWidth", () => {
    // containerWidth = 400 - 0 = 400; 400 >= 100*2 + 40 = 240 => 2 colunas
    // cardWidth = (400 - 40)/2 = 180
    const { result } = renderHook(() =>
      useResponsiveGrid(["a", "b", "c"], { padding: 0, gap: 40, minItemWidth: 100 })
    );

    // Act
    const fullRowWidth = result.current.getItemWidth(["a", "b"]);
    const lastRowWidth = result.current.getItemWidth(["c"]);

    // Assert
    expect(result.current.columns).toBe(2);
    expect(fullRowWidth).toBe(180);
    expect(lastRowWidth).toBe(400);
  });
});