import { ActivityIndicator } from "react-native";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import ShopkeeperSignupScreen from "@/src/features/shopkeeper/auth/screens/ShopkeeperSignupScreen";
import {
  loginShopkeeper,
  signUpShopkeeper,
} from "@/src/features/shopkeeper/auth/services/shopkeeperAuthService";
import { shopkeeperLoginInput } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

jest.mock(
  "@/src/features/shopkeeper/auth/services/shopkeeperAuthService",
  () => ({
    signUpShopkeeper: jest.fn(),
    loginShopkeeper: jest.fn(),
  })
);

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

jest.mock("expo-checkbox", () => {
  const { Pressable } = require("react-native");
  return {
    __esModule: true,
    default: ({
      value,
      onValueChange,
    }: {
      value?: boolean;
      onValueChange?: (checked: boolean) => void;
    }) => (
      <Pressable testID="terms-checkbox" onPress={() => onValueChange?.(!value)} />
    ),
  };
});

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: () => <Text>icon</Text>,
  };
});

jest.mock("@/src/features/shopkeeper/components/CategoryModal", () => {
  const { View } = require("react-native");
  return {
    CategoryModal: ({
      visible,
      onSelect,
      onClose,
      selectedCategory,
    }: {
      visible: boolean;
      onSelect: (category: { id: number; name: string }) => void;
      onClose: () => void;
      selectedCategory: { id: number; name: string } | null;
    }) => (
      <View
        testID="category-modal"
        visible={visible}
        onSelect={onSelect}
        onClose={onClose}
      >
        {selectedCategory?.name}
      </View>
    ),
  };
});

jest.mock(
  "@/src/features/shopkeeper/auth/components/StoreLocationPickerModal",
  () => {
    const { View } = require("react-native");
    return {
      __esModule: true,
      default: ({
        visible,
        onConfirm,
        onClose,
      }: {
        visible: boolean;
        onConfirm: (location: { latitude: number; longitude: number }) => void;
        onClose: () => void;
      }) => (
        <View testID="location-modal" visible={visible} onConfirm={onConfirm} onClose={onClose} />
      ),
    };
  }
);

const mockedSignUpShopkeeper =
  signUpShopkeeper as jest.MockedFunction<typeof signUpShopkeeper>;
const mockedLoginShopkeeper =
  loginShopkeeper as jest.MockedFunction<typeof loginShopkeeper>;
const mockedReplace = jest.fn();
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;
const mockedImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

const VALID_CPF_RAW = "12345678900";

describe("ShopkeeperSignupScreen", () => {
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
    mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
    } as never);
    mockedImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///img.jpg" }],
    } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function fillTextFields() {
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite o nome do estabelecimento"),
      "Café do Recife"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite o nome do proprietário"),
      "Maria Silva"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite o email do estabelecimento"),
      shopkeeperLoginInput.email
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("__.___.___/____-__ ou ___.___.___-__"),
      VALID_CPF_RAW
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Fale um pouco sobre a sua loja"),
      "Cafeteria no Recife Antigo"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite o bairro"),
      "Recife Antigo"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite a rua"),
      "Rua do Bom Jesus"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Digite sua senha"),
      shopkeeperLoginInput.password
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Confirme sua senha"),
      shopkeeperLoginInput.password
    );
  }

  function completeInteractions() {
    fireEvent(
      screen.getByTestId("category-modal"),
      "select",
      { id: 1, name: "Cafeteria" }
    );
    fireEvent.press(screen.getByText("Adicionar foto do estabelecimento"));
    fireEvent(
      screen.getByTestId("location-modal"),
      "confirm",
      { latitude: -8.0675, longitude: -34.9167 }
    );
    fireEvent.press(screen.getByTestId("terms-checkbox"));
  }

  async function completeInteractionsAsync() {
    completeInteractions();
    await waitFor(() =>
      expect(mockedImagePicker.launchImageLibraryAsync).toHaveBeenCalled()
    );
    await waitFor(
      () =>
        expect(
          screen.queryByText("Adicionar foto do estabelecimento")
        ).toBeNull()
    );
  }

  async function fillValidForm() {
    fillTextFields();
    await completeInteractionsAsync();
  }

  it("mostra erros por campo e não chama signUpShopkeeper ao submeter vazio", () => {
    // Arrange
    render(<ShopkeeperSignupScreen />);

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(
      screen.getByText("Preencha o nome do estabelecimento")
    ).toBeTruthy();
    expect(screen.getByText("Preencha o campo com seu email")).toBeTruthy();
    expect(
      screen.getByText("Preencha o campo com seu CPF ou CNPJ")
    ).toBeTruthy();
    expect(
      screen.getByText("Adicione uma foto do estabelecimento")
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade."
      )
    ).toBeTruthy();
    expect(mockedSignUpShopkeeper).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("cadastra com sucesso e navega para o dashboard", async () => {
    // Arrange
    mockedSignUpShopkeeper.mockResolvedValueOnce(undefined);
    mockedLoginShopkeeper.mockResolvedValueOnce(undefined);
    render(<ShopkeeperSignupScreen />);
    await fillValidForm();

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    await waitFor(() =>
      expect(mockedSignUpShopkeeper).toHaveBeenCalledWith(expect.any(FormData))
    );
    await waitFor(() =>
      expect(mockedLoginShopkeeper).toHaveBeenCalledWith(shopkeeperLoginInput)
    );
    await waitFor(() =>
      expect(mockedReplace).toHaveBeenCalledWith("/shopkeeper/(private)/(tabs)")
    );
  });

  it("mostra erro de image e não chama signUpShopkeeper quando a imagem não é escolhida", () => {
    // Arrange
    render(<ShopkeeperSignupScreen />);
    fillTextFields();
    fireEvent(
      screen.getByTestId("category-modal"),
      "select",
      { id: 1, name: "Cafeteria" }
    );
    fireEvent(
      screen.getByTestId("location-modal"),
      "confirm",
      { latitude: -8.0675, longitude: -34.9167 }
    );
    fireEvent.press(screen.getByTestId("terms-checkbox"));

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(
      screen.getByText("Adicione uma foto do estabelecimento")
    ).toBeTruthy();
    expect(mockedSignUpShopkeeper).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro geral quando o cadastro falha e não navega", async () => {
    // Arrange
    mockedSignUpShopkeeper.mockRejectedValueOnce(new Error("falha no backend"));
    render(<ShopkeeperSignupScreen />);
    await fillValidForm();

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(
      await screen.findByText("Erro ao criar conta. Verifique os dados.")
    ).toBeTruthy();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra o indicador de loading enquanto o cadastro está pendente", async () => {
    // Arrange
    let resolveSignUp!: () => void;
    mockedSignUpShopkeeper.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveSignUp = resolve;
      })
    );
    render(<ShopkeeperSignupScreen />);
    await fillValidForm();

    // Act
    fireEvent.press(screen.getByText("Cadastrar"));

    // Assert
    expect(screen.queryByText("Cadastrar")).toBeNull();
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    resolveSignUp();
    await waitFor(() => expect(mockedReplace).toHaveBeenCalled());
  });
});