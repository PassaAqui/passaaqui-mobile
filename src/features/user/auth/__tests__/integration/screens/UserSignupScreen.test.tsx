import { ActivityIndicator } from "react-native";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserSignupScreen from "@/src/features/user/auth/screens/UserSignupScreen";
import { singUp } from "@/src/features/user/auth/services/authService";

jest.mock("@/src/features/user/auth/services/authService", () => ({
  singUp: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAwareScrollView: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockedSingUp = singUp as jest.MockedFunction<typeof singUp>;
const mockedReplace = jest.fn();
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<typeof useSafeAreaInsets>;

const VALID_CPF_RAW = "12345678900";
const VALID_CPF_FORMATTED = "123.456.789-00";

describe("UserSignupScreen", () => {
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

  function fillValidForm() {
    fireEvent.changeText(screen.getByPlaceholderText("Digite seu nome"), "Turista E2E");
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite seu email aqui"),
      "turista@email.com"
    );
    fireEvent.changeText(screen.getByPlaceholderText("___.___.___-__"), VALID_CPF_RAW);
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), "Senha@123");
    fireEvent.changeText(screen.getByPlaceholderText("Confirme sua senha"), "Senha@123");
    fireEvent.press(screen.getByTestId("terms-checkbox"));
  }

  it("cadastra com sucesso e navega para o mapa", async () => {
    // Arrange
    mockedSingUp.mockResolvedValueOnce(undefined);
    render(<UserSignupScreen />);
    fillValidForm();

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    await waitFor(() =>
      expect(mockedSingUp).toHaveBeenCalledWith({
        name: "Turista E2E",
        email: "turista@email.com",
        cpf: VALID_CPF_FORMATTED,
        password: "Senha@123",
        confirm_password: "Senha@123",
      })
    );
    expect(mockedReplace).toHaveBeenCalledWith("/user/(private)/map/(tabs)");
  });

  it("mostra erro de nome vazio e não chama singUp", () => {
    // Arrange
    render(<UserSignupScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite seu email aqui"),
      "turista@email.com"
    );
    fireEvent.changeText(screen.getByPlaceholderText("___.___.___-__"), VALID_CPF_RAW);
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), "Senha@123");
    fireEvent.changeText(screen.getByPlaceholderText("Confirme sua senha"), "Senha@123");
    fireEvent.press(screen.getByTestId("terms-checkbox"));

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(screen.getByText("Preencha o campo com seu nome")).toBeTruthy();
    expect(mockedSingUp).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro de email inválido e não chama singUp", () => {
    // Arrange
    render(<UserSignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Digite seu nome"), "Turista E2E");
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite seu email aqui"),
      "email-invalido"
    );
    fireEvent.changeText(screen.getByPlaceholderText("___.___.___-__"), VALID_CPF_RAW);
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), "Senha@123");
    fireEvent.changeText(screen.getByPlaceholderText("Confirme sua senha"), "Senha@123");
    fireEvent.press(screen.getByTestId("terms-checkbox"));

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(screen.getByText("Email inválido")).toBeTruthy();
    expect(mockedSingUp).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro de CPF inválido e não chama singUp", () => {
    // Arrange
    render(<UserSignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Digite seu nome"), "Turista E2E");
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite seu email aqui"),
      "turista@email.com"
    );
    fireEvent.changeText(screen.getByPlaceholderText("___.___.___-__"), "123");
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), "Senha@123");
    fireEvent.changeText(screen.getByPlaceholderText("Confirme sua senha"), "Senha@123");
    fireEvent.press(screen.getByTestId("terms-checkbox"));

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(screen.getByText("CPF inválido")).toBeTruthy();
    expect(mockedSingUp).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro de senha fraca e não chama singUp", () => {
    // Arrange
    render(<UserSignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Digite seu nome"), "Turista E2E");
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite seu email aqui"),
      "turista@email.com"
    );
    fireEvent.changeText(screen.getByPlaceholderText("___.___.___-__"), VALID_CPF_RAW);
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), "senhafraca");
    fireEvent.changeText(screen.getByPlaceholderText("Confirme sua senha"), "senhafraca");
    fireEvent.press(screen.getByTestId("terms-checkbox"));

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(
      screen.getByText("A senha deve conter pelo menos um número")
    ).toBeTruthy();
    expect(mockedSingUp).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro quando senha e confirmação não coincidem e não chama singUp", () => {
    // Arrange
    render(<UserSignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Digite seu nome"), "Turista E2E");
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite seu email aqui"),
      "turista@email.com"
    );
    fireEvent.changeText(screen.getByPlaceholderText("___.___.___-__"), VALID_CPF_RAW);
    // Ambas válidas individualmente (passam nas regras base), mas diferentes entre si
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), "Senha@123");
    fireEvent.changeText(screen.getByPlaceholderText("Confirme sua senha"), "Outra@456");
    fireEvent.press(screen.getByTestId("terms-checkbox"));

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(screen.getByText("As senhas precisam ser iguais")).toBeTruthy();
    expect(mockedSingUp).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("não chama singUp quando termos não são aceitos", () => {
    // Arrange
    render(<UserSignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Digite seu nome"), "Turista E2E");
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite seu email aqui"),
      "turista@email.com"
    );
    fireEvent.changeText(screen.getByPlaceholderText("___.___.___-__"), VALID_CPF_RAW);
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), "Senha@123");
    fireEvent.changeText(screen.getByPlaceholderText("Confirme sua senha"), "Senha@123");
    // não marca o checkbox de termos

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(mockedSingUp).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro geral quando o cadastro falha e não navega", async () => {
    // Arrange
    mockedSingUp.mockRejectedValueOnce(new Error("email já cadastrado"));
    render(<UserSignupScreen />);
    fillValidForm();

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(
      await screen.findByText("Erro ao criar conta. Tente novamente")
    ).toBeTruthy();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra o indicador de loading enquanto o cadastro está pendente", async () => {
    // Arrange
    let resolveSignUp!: () => void;
    mockedSingUp.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveSignUp = resolve;
      })
    );
    render(<UserSignupScreen />);
    fillValidForm();

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(screen.queryByText("Cadastrar")).toBeNull();
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    resolveSignUp();
    await waitFor(() => expect(mockedReplace).toHaveBeenCalled());
  });
});