import { ActivityIndicator, Modal } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import DeleteProductModal from "@/src/features/shopkeeper/products/components/DeleteProductModal";

describe("DeleteProductModal", () => {
  it("exibe o nome do produto e o aviso quando visível", () => {
    // Arrange

    // Act
    render(
      <DeleteProductModal
        visible
        productName="Tapioca Clássica"
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    // Assert
    expect(screen.getByText("ATENÇÃO!")).toBeTruthy();
    expect(screen.getByText(/Tapioca Clássica/)).toBeTruthy();
    expect(screen.getByText("Confirmar exclusão")).toBeTruthy();
    expect(screen.getByText("Cancelar")).toBeTruthy();
  });

  it("não exibe o conteúdo quando não está visível", () => {
    // Arrange

    // Act
    render(
      <DeleteProductModal
        visible={false}
        productName="Tapioca Clássica"
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    // Assert
    expect(screen.queryByText("ATENÇÃO!")).toBeNull();
  });

  it("chama onConfirm ao tocar em Confirmar exclusão", () => {
    // Arrange
    const onConfirm = jest.fn();

    // Act
    render(
      <DeleteProductModal
        visible
        productName="Café"
        onConfirm={onConfirm}
        onClose={jest.fn()}
      />
    );
    fireEvent.press(screen.getByText("Confirmar exclusão"));

    // Assert
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("chama onClose ao tocar em Cancelar", () => {
    // Arrange
    const onClose = jest.fn();

    // Act
    render(
      <DeleteProductModal
        visible
        productName="Café"
        onConfirm={jest.fn()}
        onClose={onClose}
      />
    );
    fireEvent.press(screen.getByText("Cancelar"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose quando o modal recebe requestClose", () => {
    // Arrange
    const onClose = jest.fn();

    // Act
    render(
      <DeleteProductModal
        visible
        productName="Café"
        onConfirm={jest.fn()}
        onClose={onClose}
      />
    );
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mostra o indicador de progresso quando está excluindo", () => {
    // Arrange

    // Act
    render(
      <DeleteProductModal
        visible
        productName="Café"
        isDeleting
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByText("Confirmar exclusão")).toBeNull();
  });

  it("desabilita o botão de confirmar quando está excluindo", () => {
    // Arrange

    // Act
    render(
      <DeleteProductModal
        visible
        productName="Café"
        isDeleting
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    );
    const confirmButton = screen.root.findAllByProps({ disabled: true })[0];

    // Assert
    expect(confirmButton).toBeTruthy();
  });
});
