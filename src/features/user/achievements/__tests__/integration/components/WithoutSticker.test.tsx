import { render, screen } from "@testing-library/react-native";
import WithoutSticker, {
  MAX_DESCRIPTION_LENGTH,
  truncateDescription,
} from "@/src/features/user/achievements/components/WithoutSticker";

describe("WithoutSticker", () => {
  it("renderiza o título e a descrição recebidos por prop", () => {
    // Arrange
    render(<WithoutSticker title="Tapioca real" description="Colete para colar" />);

    // Act / Assert
    expect(screen.getByText("Tapioca real")).toBeTruthy();
    expect(screen.getByText("Colete para colar")).toBeTruthy();
  });

  it("trunca descrições longas com reticências", () => {
    // Arrange
    const description =
      "Uma iguaria digna da realeza, feita com a goma mais pura de Pernambuco e recheio de tradição.";

    // Act
    render(<WithoutSticker title="Tapioca real" description={description} />);

    // Assert
    const truncated = screen.getByText(/\.\.\.$/);
    expect(truncated.props.children).toBe(truncateDescription(description));
    expect(truncated.props.children.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });
});

describe("truncateDescription", () => {
  it("mantém descrições dentro do limite sem alterações", () => {
    expect(truncateDescription("Colete para colar")).toBe("Colete para colar");
  });

  it("normaliza espaços e quebras de linha", () => {
    expect(truncateDescription("  Colete   para\n colar  ")).toBe("Colete para colar");
  });

  it("trunca no limite e adiciona reticências", () => {
    const result = truncateDescription("a".repeat(MAX_DESCRIPTION_LENGTH + 10));

    expect(result.endsWith("...")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });

  it("não corta palavras ao meio", () => {
    const result = truncateDescription(
      "Uma iguaria digna da realeza, feita com a goma mais pura de Pernambuco",
    );

    expect(result).toBe("Uma iguaria digna da realeza, feita com a goma mais pura...");
  });
});
