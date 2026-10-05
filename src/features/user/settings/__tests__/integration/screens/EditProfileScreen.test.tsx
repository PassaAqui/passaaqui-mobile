import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import EditProfileScreen from "@/src/features/user/settings/screens/EditProfileScreen";
import { useEditProfileForm } from "@/src/features/user/settings/hooks/useEditProfileForm";
import {
  AVATAR_URL,
  localAvatarUri,
} from "@/src/features/user/settings/__tests__/fixtures/profile";

jest.mock("expo-navigation-bar", () => ({
  setButtonStyleAsync: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

jest.mock("@/src/features/user/settings/hooks/useEditProfileForm", () => ({
  useEditProfileForm: jest.fn(),
}));

const mockedUseEditProfileForm = useEditProfileForm as jest.MockedFunction<
  typeof useEditProfileForm
>;

function mockFormState(
  overrides: Partial<ReturnType<typeof useEditProfileForm>> = {}
) {
  mockedUseEditProfileForm.mockReturnValue({
    name: "João Turista",
    nameError: "",
    image: null,
    selectedImage: null,
    isLoadingTourist: false,
    isSaving: false,
    handleNameChange: jest.fn(),
    pickImage: jest.fn(),
    setImage: jest.fn(),
    handleSave: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useEditProfileForm>);
}

describe("EditProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormState();
  });

  it("renderiza com o nome atual do turista", () => {
    // Act
    render(<EditProfileScreen />);

    // Assert
    expect(screen.getByDisplayValue("João Turista")).toBeTruthy();
    expect(screen.getByText("Nome de usuário")).toBeTruthy();
  });

  it("mostra a imagem do backend quando não há foto nova escolhida", () => {
    // Arrange
    mockFormState({ image: AVATAR_URL });

    // Act
    render(<EditProfileScreen />);

    // Assert
    expect(screen.getByTestId("edit-profile-avatar").props.source).toEqual({
      uri: AVATAR_URL,
    });
  });

  it("mostra a foto nova escolhida antes da foto do backend", () => {
    // Arrange
    mockFormState({ image: localAvatarUri, selectedImage: localAvatarUri });

    // Act
    render(<EditProfileScreen />);

    // Assert
    expect(screen.getByTestId("edit-profile-avatar").props.source).toEqual({
      uri: localAvatarUri,
    });
  });

  it("usa a logo como fallback quando o turista não tem foto", () => {
    // Act
    render(<EditProfileScreen />);

    // Assert
    expect(screen.getByTestId("edit-profile-avatar").props.source).toEqual(
      require("@/assets/logo/logoOFC.png")
    );
  });

  it("chama pickImage ao tocar na foto", () => {
    // Arrange
    const pickImage = jest.fn();
    mockFormState({ pickImage });

    // Act
    render(<EditProfileScreen />);
    fireEvent.press(screen.getByTestId("edit-profile-avatar-button"));

    // Assert
    expect(pickImage).toHaveBeenCalledTimes(1);
  });

  it("propaga a digitação do nome", () => {
    // Arrange
    const handleNameChange = jest.fn();
    mockFormState({ handleNameChange });

    // Act
    render(<EditProfileScreen />);
    fireEvent.changeText(screen.getByDisplayValue("João Turista"), "Maria");

    // Assert
    expect(handleNameChange).toHaveBeenCalledWith("Maria");
  });

  it("mostra o erro de nome curto", () => {
    // Arrange
    mockFormState({ nameError: "O nome deve ter pelo menos 3 caracteres." });

    // Act
    render(<EditProfileScreen />);

    // Assert
    expect(
      screen.getByText("O nome deve ter pelo menos 3 caracteres.")
    ).toBeTruthy();
  });

  it("não mostra erro de validação quando não há erro", () => {
    // Act
    render(<EditProfileScreen />);

    // Assert
    expect(
      screen.queryByText("O nome deve ter pelo menos 3 caracteres.")
    ).toBeNull();
  });

  it("chama handleSave ao tocar em Salvar alterações", () => {
    // Arrange
    const handleSave = jest.fn();
    mockFormState({ handleSave });

    // Act
    render(<EditProfileScreen />);
    fireEvent.press(screen.getByTestId("edit-profile-save-button"));

    // Assert
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it("mostra o loading e desabilita o botão durante o envio", () => {
    // Arrange
    mockFormState({ isSaving: true });

    // Act
    render(<EditProfileScreen />);

    // Assert
    expect(screen.getByTestId("edit-profile-saving")).toBeTruthy();
    expect(screen.getByTestId("edit-profile-save-button").props.accessibilityState)
      .toMatchObject({ disabled: true });
  });

  it("mantém o botão habilitado quando não está salvando", async () => {
    // Act
    render(<EditProfileScreen />);

    // Assert
    expect(screen.queryByTestId("edit-profile-saving")).toBeNull();
    await waitFor(() =>
      expect(
        screen.getByTestId("edit-profile-save-button").props.accessibilityState
      ).toMatchObject({ disabled: false })
    );
  });
});
