import { ActivityIndicator } from "react-native";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserLoginScreen from "@/src/features/user/auth/screens/UserLoginScreen";
import { login } from "@/src/features/user/auth/services/authService";

jest.mock("@/src/features/user/auth/services/authService", () => ({
  login: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(),
}));

jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAwareScrollView: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockedLogin = login as jest.MockedFunction<typeof login>;
const mockedReplace = jest.fn();
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;

describe("UserLoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockedUseRouter.mockReturnValue({
      replace: mockedReplace,
    } as unknown as ReturnType<typeof useRouter>);
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

  function fillCredentials(email: string, password: string) {
    fireEvent.changeText(screen.getByPlaceholderText("Digite seu email"), email);
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite sua senha"),
      password
    );
  }

  it("faz login com sucesso e navega para o mapa", async () => {
    // Arrange
    mockedLogin.mockResolvedValueOnce(undefined);
    render(<UserLoginScreen />);
    fillCredentials("turista@email.com", "Senha@123");

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    await waitFor(() =>
      expect(mockedLogin).toHaveBeenCalledWith({
        email: "turista@email.com",
        password: "Senha@123",
      })
    );
    expect(mockedReplace).toHaveBeenCalledWith("/user/(private)/map/(tabs)");
  });

  it("mostra erro de email vazio e não chama login", () => {
    // Arrange
    render(<UserLoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite sua senha"),
      "Senha@123"
    );

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    expect(screen.getByText("Preencha o campo com seu email")).toBeTruthy();
    expect(mockedLogin).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro de senha vazia e não chama login", () => {
    // Arrange
    render(<UserLoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite seu email"),
      "turista@email.com"
    );

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    expect(screen.getByText("Preencha o campo com sua senha")).toBeTruthy();
    expect(mockedLogin).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro geral quando o login falha e não navega", async () => {
    // Arrange
    mockedLogin.mockRejectedValueOnce(new Error("credenciais inválidas"));
    render(<UserLoginScreen />);
    fillCredentials("turista@email.com", "Senha@123");

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    expect(await screen.findByText("Email ou senha incorretos")).toBeTruthy();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra o indicador de loading enquanto o login está pendente", async () => {
    // Arrange
    let resolveLogin!: () => void;
    mockedLogin.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      })
    );
    render(<UserLoginScreen />);
    fillCredentials("turista@email.com", "Senha@123");

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    expect(screen.queryByText("Entrar")).toBeNull();
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    resolveLogin();
    await waitFor(() => expect(mockedReplace).toHaveBeenCalled());
  });
});
