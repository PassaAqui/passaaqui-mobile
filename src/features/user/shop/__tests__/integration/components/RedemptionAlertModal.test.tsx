import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal } from "react-native";
import { useRouter } from "expo-router";
import RedemptionAlertModal from "@/src/features/user/shop/components/RedemptionAlertModal";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedPush = jest.fn();

describe("RedemptionAlertModal", () => {
  const onClose = jest.fn();
  const props = {
    img: "https://cdn.example.com/cafe.jpg",
    title: "Café especial",
    discount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockedPush } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  it("não renderiza o conteúdo quando visible é false", () => {
    // Arrange
    render(<RedemptionAlertModal {...props} visible={false} onClose={onClose} />);

    // Act
    const title = screen.queryByText("Resgate Pendente");

    // Assert
    expect(title).toBeNull();
  });

  it("renderiza o aviso de resgate pendente quando visible é true", () => {
    // Arrange
    render(<RedemptionAlertModal {...props} visible onClose={onClose} />);

    // Assert
    expect(screen.getByText("Resgate Pendente")).toBeTruthy();
    expect(
      screen.getByText("Você já possui um código ativo. Utilize-o para realizar outra compra!")
    ).toBeTruthy();
  });

  it("navega para o código ao pressionar 'Ver me código'", () => {
    // Arrange
    render(<RedemptionAlertModal {...props} visible onClose={onClose} />);

    // Act
    fireEvent.press(screen.getByText("Ver me código"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/user/(private)/shop/code",
      params: { img: props.img, title: props.title, discount: props.discount },
    });
  });

  it("chama onClose ao pressionar 'Agora não'", () => {
    // Arrange
    render(<RedemptionAlertModal {...props} visible onClose={onClose} />);

    // Act
    fireEvent.press(screen.getByText("Agora não"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose no onRequestClose", () => {
    // Arrange
    render(<RedemptionAlertModal {...props} visible onClose={onClose} />);

    // Act
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
