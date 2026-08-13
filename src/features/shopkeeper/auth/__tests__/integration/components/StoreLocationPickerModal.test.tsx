import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal } from "react-native";
import StoreLocationPickerModal from "@/src/features/shopkeeper/auth/components/StoreLocationPickerModal";
import { existingShopPoi } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

interface TestTreeNode {
  props: { accessibilityState?: { disabled?: boolean } };
  parent: TestTreeNode | null;
}

jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MapView = React.forwardRef(
    ({ children, ...props }: any, _ref: unknown) => (
      <View testID="mapview" {...props}>
        {children}
      </View>
    )
  );
  MapView.displayName = "MapView";
  return {
    __esModule: true,
    default: MapView,
    Marker: ({ children, ...props }: any) => (
      <View testID="marker" {...props}>
        {children}
      </View>
    ),
  };
});

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    useSafeAreaInsets: jest.fn(),
  };
});

const mockedUseSafeAreaInsets = (
  require("react-native-safe-area-context") as {
    useSafeAreaInsets: jest.Mock;
  }
).useSafeAreaInsets;

const POI_LOCATION = { latitude: -8.0675, longitude: -34.9167 };
const FAR_LOCATION = { latitude: -8.0676, longitude: -34.9166 };
const NEAR_LOCATION = { latitude: -8.06753, longitude: -34.9167 };

const BLOCKED_MESSAGE =
  "Esse ponto está muito próximo de outra loja já cadastrada. Escolha um local diferente.";

describe("StoreLocationPickerModal", () => {
  const onConfirm = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockedUseSafeAreaInsets.mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderModal(props: Partial<Parameters<typeof StoreLocationPickerModal>[0]> = {}) {
    render(
      <StoreLocationPickerModal
        visible
        existingPois={[]}
        onConfirm={onConfirm}
        onClose={onClose}
        {...props}
      />
    );
  }

  function getConfirmButtonDisabled() {
    let node: TestTreeNode | null = screen.getByText(
      "Confirmar localização"
    ).parent as TestTreeNode;
    while (node) {
      const props = node.props;
      if (props?.accessibilityState?.disabled !== undefined) {
        return props.accessibilityState.disabled;
      }
      node = node.parent;
    }
    return undefined;
  }

  it("não renderiza o conteúdo quando visible é false", () => {
    // Arrange
    renderModal({ visible: false });

    // Act
    const title = screen.queryByText("Marque a localização da sua loja");

    // Assert
    expect(title).toBeNull();
  });

  it("renderiza título e botão habilitado com initialLocation", () => {
    // Arrange
    renderModal({ initialLocation: POI_LOCATION });

    // Act
    const title = screen.getByText("Marque a localização da sua loja");
    const button = screen.getByText("Confirmar localização");

    // Assert
    expect(title).toBeTruthy();
    expect(getConfirmButtonDisabled()).toBe(false);
  });

  it("press longe do POI existente mostra pin sem bloquear", () => {
    // Arrange
    renderModal({ existingPois: [existingShopPoi] });

    // Act
    fireEvent(screen.getByTestId("mapview"), "press", {
      nativeEvent: { coordinate: FAR_LOCATION },
    });

    // Assert
    expect(screen.queryByText(BLOCKED_MESSAGE)).toBeNull();
    expect(getConfirmButtonDisabled()).toBe(false);
  });

  it("press perto do POI existente (< 15 m) mostra mensagem e desabilita", () => {
    // Arrange
    renderModal({ existingPois: [existingShopPoi] });

    // Act
    fireEvent(screen.getByTestId("mapview"), "press", {
      nativeEvent: { coordinate: NEAR_LOCATION },
    });

    // Assert
    expect(screen.getByText(BLOCKED_MESSAGE)).toBeTruthy();
    expect(getConfirmButtonDisabled()).toBe(true);
  });

  it("confirmar com pin válido chama onConfirm com o pin e onClose", () => {
    // Arrange
    renderModal({ initialLocation: POI_LOCATION });

    // Act
    fireEvent.press(screen.getByText("Confirmar localização"));

    // Assert
    expect(onConfirm).toHaveBeenCalledWith(POI_LOCATION);
    expect(onClose).toHaveBeenCalled();
  });

  it("confirmar bloqueado não chama onConfirm nem onClose", () => {
    // Arrange
    renderModal({ existingPois: [existingShopPoi] });
    fireEvent(screen.getByTestId("mapview"), "press", {
      nativeEvent: { coordinate: NEAR_LOCATION },
    });

    // Act
    fireEvent.press(screen.getByText("Confirmar localização"));

    // Assert
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("sem pin o botão fica desabilitado e confirmar não chama onConfirm", () => {
    // Arrange
    renderModal();

    // Assert
    expect(getConfirmButtonDisabled()).toBe(true);

    // Act
    fireEvent.press(screen.getByText("Confirmar localização"));

    // Assert
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Fechar chama onClose e onRequestClose do Modal também", () => {
    // Arrange
    renderModal();

    // Act
    fireEvent.press(screen.getByText("Fechar"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);

    // Act
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");

    // Assert
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});