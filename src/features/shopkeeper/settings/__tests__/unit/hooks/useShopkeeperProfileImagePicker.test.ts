import { act, renderHook } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useShopkeeperProfileImagePicker } from "@/src/features/shopkeeper/settings/hooks/useShopkeeperProfileImagePicker";
import { localStoreImageUri } from "@/src/features/shopkeeper/settings/__tests__/fixtures/shopkeeperProfile";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const requestPermissionMock =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const launchLibraryMock = ImagePicker.launchImageLibraryAsync as jest.Mock;

describe("useShopkeeperProfileImagePicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("começa sem imagem selecionada", () => {
    // Act
    const { result } = renderHook(() => useShopkeeperProfileImagePicker());

    // Assert
    expect(result.current.image).toBeNull();
  });

  it("define a imagem com a uri devolvida pela galeria", async () => {
    // Arrange
    requestPermissionMock.mockResolvedValueOnce({ status: "granted" });
    launchLibraryMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: localStoreImageUri }],
    });

    // Act
    const { result } = renderHook(() => useShopkeeperProfileImagePicker());
    await act(async () => {
      await result.current.pickImage();
    });

    // Assert
    expect(result.current.image).toBe(localStoreImageUri);
  });

  it("pede acesso à galeria e recorta para um recorte quadrado", async () => {
    // Arrange
    requestPermissionMock.mockResolvedValueOnce({ status: "granted" });
    launchLibraryMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: localStoreImageUri }],
    });

    // Act
    const { result } = renderHook(() => useShopkeeperProfileImagePicker());
    await act(async () => {
      await result.current.pickImage();
    });

    // Assert
    expect(launchLibraryMock).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: true, aspect: [1, 1] })
    );
  });

  it("avisa e não abre a galeria quando a permissão for negada", async () => {
    // Arrange
    requestPermissionMock.mockResolvedValueOnce({ status: "denied" });

    // Act
    const { result } = renderHook(() => useShopkeeperProfileImagePicker());
    await act(async () => {
      await result.current.pickImage();
    });

    // Assert
    expect(launchLibraryMock).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
    expect(result.current.image).toBeNull();
  });

  it("mantém a imagem anterior quando o usuário cancelar a seleção", async () => {
    // Arrange
    requestPermissionMock.mockResolvedValue({ status: "granted" });
    launchLibraryMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: localStoreImageUri }],
    });

    const { result } = renderHook(() => useShopkeeperProfileImagePicker());
    await act(async () => {
      await result.current.pickImage();
    });
    launchLibraryMock.mockResolvedValueOnce({ canceled: true, assets: null });

    // Act
    await act(async () => {
      await result.current.pickImage();
    });

    // Assert
    expect(result.current.image).toBe(localStoreImageUri);
  });

  it("permite limpar a imagem selecionada", () => {
    // Act
    const { result } = renderHook(() => useShopkeeperProfileImagePicker());
    act(() => {
      result.current.setImage(null);
    });

    // Assert
    expect(result.current.image).toBeNull();
  });
});
