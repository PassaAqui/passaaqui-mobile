import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import Header from "@/src/features/user/shop/components/Header";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedBack = jest.fn();

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ back: mockedBack } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  it("renderiza o logo da plataforma", () => {
    // Arrange
    render(<Header />);

    // Act
    const images = screen.UNSAFE_getAllByType(Image);

    // Assert
    expect(images).toHaveLength(2);
  });

  it("chama router.back ao pressionar o botão de voltar", () => {
    // Arrange
    render(<Header />);

    // Act
    fireEvent.press(screen.UNSAFE_getAllByType(Image)[0]);

    // Assert
    expect(mockedBack).toHaveBeenCalledTimes(1);
  });
});
