import { render, screen } from "@testing-library/react-native";
import { WeekChart } from "@/src/features/shopkeeper/dashboard/components/WeekChart";
import { weeklySales } from "@/src/features/shopkeeper/dashboard/__tests__/fixtures/dashboard";

describe("WeekChart", () => {
  it("renderiza o título do gráfico", () => {
    // Arrange
    render(<WeekChart data={weeklySales} />);

    // Act
    const title = screen.getByText("Vendas da semana");

    // Assert
    expect(title).toBeTruthy();
  });

  it("renderiza os passos do eixo Y", () => {
    // Arrange
    render(<WeekChart data={weeklySales} />);

    // Act
    const yAxisSteps = ["120", "90", "60", "30", "0"];

    // Assert
    yAxisSteps.forEach((step) => expect(screen.getAllByText(step).length).toBeGreaterThan(0));
  });

  it("renderiza o valor acima da barra apenas no dia de maior total", () => {
    // Arrange
    render(<WeekChart data={weeklySales} />);

    // Act
    const maxCount = screen.getAllByText("120").length;
    const lowerCount = screen.queryAllByText("80").length;

    // Assert
    expect(maxCount).toBe(2);
    expect(lowerCount).toBe(0);
  });

  it("abrevia os dias da semana e mantém dias fora do mapa", () => {
    // Arrange
    render(
      <WeekChart
        data={[
          { day: "Segunda", total: 120 },
          { day: "Feriado", total: 10 },
        ]}
      />
    );

    // Act
    const abbreviated = screen.getByText("Seg");
    const unmapped = screen.getByText("Feriado");

    // Assert
    expect(abbreviated).toBeTruthy();
    expect(unmapped).toBeTruthy();
  });

  it("não lança com dados vazios", () => {
    // Arrange
    render(<WeekChart data={[]} />);

    // Act
    const title = screen.getByText("Vendas da semana");
    const zero = screen.getAllByText("0");

    // Assert
    expect(title).toBeTruthy();
    expect(zero.length).toBeGreaterThan(0);
  });

  it("não lança quando todos os totais são zero", () => {
    // Arrange
    render(<WeekChart data={[{ day: "Segunda", total: 0 }]} />);

    // Act
    const dayLabel = screen.getByText("Seg");
    const zero = screen.getAllByText("0").length;

    // Assert
    expect(dayLabel).toBeTruthy();
    expect(zero).toBeGreaterThan(0);
  });
});