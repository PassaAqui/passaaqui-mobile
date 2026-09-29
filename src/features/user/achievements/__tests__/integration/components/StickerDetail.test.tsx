import { render, screen } from "@testing-library/react-native";
import StickerDetail from "@/src/features/user/achievements/components/StickerDetail";
import {
  lockedAchievement,
  unlockedAchievement,
} from "@/src/features/user/achievements/__tests__/fixtures/achievement";

describe("StickerDetail", () => {
  it("mostra nome, descrição, origem, data e poi da conquista", () => {
    // Arrange
    render(<StickerDetail achievement={unlockedAchievement} visible onClose={jest.fn()} />);

    // Act / Assert
    expect(screen.getByText("Rio Timbó")).toBeTruthy();
    expect(
      screen.getByText(
        "Uma iguaria digna da realeza, feita com a goma mais pura de Pernambuco e recheio de tradição."
      )
    ).toBeTruthy();
    expect(screen.getAllByText("Mercado São José").length).toBeGreaterThan(0);
  });

  it("formata a data de desbloqueio no padrão brasileiro", () => {
    // Arrange
    render(<StickerDetail achievement={unlockedAchievement} visible onClose={jest.fn()} />);

    // Act / Assert
    expect(screen.getByText("01/01/2026")).toBeTruthy();
  });

  it("exibe um traço quando a conquista não tem origem, data nem poi", () => {
    // Arrange
    render(<StickerDetail achievement={lockedAchievement} visible onClose={jest.fn()} />);

    // Act / Assert
    expect(screen.getAllByText("—").length).toBe(3);
  });
});
