import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal } from "react-native";
import SimulationAlertModal from "@/src/features/user/map/components/SimulationAlertModal";

type JsonNode = {
  type: string;
  props: Record<string, unknown> & { className?: string };
  children: JsonNode[] | null;
};

function findByClassName(className: string): JsonNode | null {
  const walk = (node: JsonNode | JsonNode[] | null): JsonNode | null => {
    if (Array.isArray(node)) {
      for (const child of node) {
        const found = walk(child);
        if (found) return found;
      }
      return null;
    }
    if (!node) return null;
    if (node.props?.className?.includes(className)) return node;
    return walk(node.children);
  };

  return walk(screen.toJSON() as JsonNode | JsonNode[] | null);
}

describe("SimulationAlertModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não renderiza o conteúdo quando visible é false", () => {
    // Arrange
    render(<SimulationAlertModal visible={false} onClose={onClose} />);

    // Act
    const title = screen.queryByText("ATENÇÃO!");

    // Assert
    expect(title).toBeNull();
  });

  it("renderiza o alerta explicando o fluxo de simulação quando visible é true", () => {
    // Arrange
    render(<SimulationAlertModal visible onClose={onClose} />);

    // Act
    const title = screen.getByText("ATENÇÃO!");
    // Ancoras curtas de propósito: a copy é texto de marketing e muda com
    // frequência, então o teste valida o conteúdo sem depender da frase inteira.
    const message = screen.getByText(/Simular rota/);
    const disclaimer = screen.getByText(/GPS real/);

    // Assert
    expect(title).toBeTruthy();
    expect(message).toBeTruthy();
    expect(disclaimer).toBeTruthy();
  });

  it("chama onClose ao pressionar Entendido", () => {
    // Arrange
    render(<SimulationAlertModal visible onClose={onClose} />);

    // Act
    fireEvent.press(screen.getByText("Entendido"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("não fecha ao pressionar fora do card", () => {
    // Arrange
    render(<SimulationAlertModal visible onClose={onClose} />);

    // Act
    fireEvent.press(screen.getByText("ATENÇÃO!"));

    // Assert
    expect(onClose).not.toHaveBeenCalled();
  });

  it("não fecha no onRequestClose (botão voltar do Android)", () => {
    // Arrange
    render(<SimulationAlertModal visible onClose={onClose} />);

    // Act
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");

    // Assert
    expect(onClose).not.toHaveBeenCalled();
  });

  it("não expõe nenhum handler de toque no backdrop escuro", () => {
    // Arrange
    render(<SimulationAlertModal visible onClose={onClose} />);

    // Act
    const backdrop = findByClassName("bg-black/50");

    // Assert
    // O backdrop é uma View pura (não Pressable): clicar fora do card não faz nada.
    expect(backdrop).toBeTruthy();
    expect(backdrop?.type).toBe("View");
    expect(backdrop?.props.onPress).toBeUndefined();
    expect(backdrop?.props.onClick).toBeUndefined();
    expect(backdrop?.props.onResponderRelease).toBeUndefined();
  });
});
