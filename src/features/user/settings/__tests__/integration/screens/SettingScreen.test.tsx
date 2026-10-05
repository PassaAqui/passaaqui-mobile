import { fireEvent, render, screen } from "@testing-library/react-native";
import SettingScreen from "@/src/features/user/settings/screens/SettingScreen";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import {
  AVATAR_URL,
  UPDATED_AVATAR_URL,
} from "@/src/features/user/settings/__tests__/fixtures/profile";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("expo-navigation-bar", () => ({
  setButtonStyleAsync: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
    useSafeAreaInsets: jest.fn(() => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    })),
  };
});

jest.mock("@/src/features/user/settings/components/SettingsHeader", () => {
  const { Text } = require("react-native");
  return function MockSettingsHeader({ title }: { title: string }) {
    return <Text>{title}</Text>;
  };
});

jest.mock("@/src/features/user/auth/hooks/useTouristMe", () => ({
  useTouristMe: jest.fn(),
}));

jest.mock("@/src/features/user/auth/services/authService", () => ({
  logout: jest.fn(),
}));

const mockedUseTouristMe = useTouristMe as jest.MockedFunction<
  typeof useTouristMe
>;

function mockTourist(overrides: Record<string, unknown> = {}) {
  mockedUseTouristMe.mockReturnValue({
    data: {
      id: 1,
      name: "João Turista",
      email: "turista@email.com",
      currentXP: 0,
      image: AVATAR_URL,
      imageUrl: AVATAR_URL,
      ...overrides,
    },
  } as unknown as ReturnType<typeof useTouristMe>);
}

describe("SettingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTourist();
  });

  it("exibe o nome e o email do turista", () => {
    // Act
    render(<SettingScreen />);

    // Assert
    expect(screen.getByText("João Turista")).toBeTruthy();
    expect(screen.getByText("turista@email.com")).toBeTruthy();
  });

  it("exibe a foto do turista usando imageUrl", () => {
    // Arrange
    mockTourist({ image: "http://antiga.jpg", imageUrl: UPDATED_AVATAR_URL });

    // Act
    render(<SettingScreen />);

    // Assert
    expect(screen.getByTestId("settings-avatar").props.source).toEqual({
      uri: UPDATED_AVATAR_URL,
    });
  });

  it("exibe a logo como fallback quando o turista não tem foto", () => {
    // Arrange
    mockTourist({ image: null, imageUrl: null });

    // Act
    render(<SettingScreen />);

    // Assert
    expect(screen.getByTestId("settings-avatar").props.source).toEqual(
      require("@/assets/logo/logoOFC.png")
    );
  });

  it("navega para a tela de editar perfil", () => {
    // Act
    render(<SettingScreen />);
    fireEvent.press(screen.getByText("Editar perfil"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith(
      "/user/(private)/settings/edit-profile"
    );
  });

  it("navega para o histórico de viagens", () => {
    // Act
    render(<SettingScreen />);
    fireEvent.press(screen.getByText("Ver histórico de viagens"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith(
      "/user/(private)/settings/travel-history"
    );
  });
});
