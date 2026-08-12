import { ActivityIndicator } from "react-native";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ShopkeeperLoginScreen from "@/src/features/shopkeeper/auth/screens/ShopkeeperLoginScreen";
import { loginShopkeeper } from "@/src/features/shopkeeper/auth/services/shopkeeperAuthService";
import { shopkeeperLoginInput } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

jest.mock(
  "@/src/features/shopkeeper/auth/services/shopkeeperAuthService",
  () => ({
    loginShopkeeper: jest.fn(),
  })
);

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

const mockedLoginShopkeeper =
  loginShopkeeper as jest.MockedFunction<typeof loginShopkeeper>;
const mockedReplace = jest.fn();
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;

describe("ShopkeeperLoginScreen", () => {
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

  it("faz login com sucesso e navega para o dashboard", async () => {
    // Arrange
    mockedLoginShopkeeper.mockResolvedValueOnce(undefined);
    render(<ShopkeeperLoginScreen />);
    fillCredentials(shopkeeperLoginInput.email, shopkeeperLoginInput.password);

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    await waitFor(() =>
      expect(mockedLoginShopkeeper).toHaveBeenCalledWith({
        email: shopkeeperLoginInput.email,
        password: shopkeeperLoginInput.password,
      })
    );
    expect(mockedReplace).toHaveBeenCalledWith("/shopkeeper/(private)/(tabs)");
  });

  it("mostra erro de email vazio e não chama login", () => {
    // Arrange
    render(<ShopkeeperLoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite sua senha"),
      shopkeeperLoginInput.password
    );

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    expect(screen.getByText("Preencha o campo com seu email")).toBeTruthy();
    expect(mockedLoginShopkeeper).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro de senha vazia e não chama login", () => {
    // Arrange
    render(<ShopkeeperLoginScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite seu email"),
      shopkeeperLoginInput.email
    );

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    expect(screen.getByText("Preencha o campo com sua senha")).toBeTruthy();
    expect(mockedLoginShopkeeper).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  // Divergência do roadmap (registrada): o código define `generalError`
  // ("Email ou senha incorretos.") no `catch`, mas **não o renderiza no JSX**
  // (ShopkeeperLoginScreen.tsx não exibe `generalError` na árvore). O teste
  // reflete o comportamento real: login chamado, sem navegação, sem erro visível.
  it("chama login e não navega quando o login falha (generalError não é renderizado)", async () => {
    // Arrange
    mockedLoginShopkeeper.mockRejectedValueOnce(new Error("credenciais inválidas"));
    render(<ShopkeeperLoginScreen />);
    fillCredentials(shopkeeperLoginInput.email, shopkeeperLoginInput.password);

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    await waitFor(() =>
      expect(mockedLoginShopkeeper).toHaveBeenCalledWith({
        email: shopkeeperLoginInput.email,
        password: shopkeeperLoginInput.password,
      })
    );
    expect(mockedReplace).not.toHaveBeenCalled();
    expect(screen.queryByText("Email ou senha incorretos.")).toBeNull();
  });

  it("mostra o indicador de loading enquanto o login está pendente", async () => {
    // Arrange
    let resolveLogin!: () => void;
    mockedLoginShopkeeper.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      })
    );
    render(<ShopkeeperLoginScreen />);
    fillCredentials(shopkeeperLoginInput.email, shopkeeperLoginInput.password);

    // Act
    fireEvent.press(screen.getByText("Entrar"));

    // Assert
    expect(screen.queryByText("Entrar")).toBeNull();
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    resolveLogin();
    await waitFor(() => expect(mockedReplace).toHaveBeenCalled());
  });
});