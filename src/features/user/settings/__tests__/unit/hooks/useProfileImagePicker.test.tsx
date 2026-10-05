import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useProfileImagePicker } from "@/src/features/user/settings/hooks/useProfileImagePicker";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

const mockedImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockedAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

describe("useProfileImagePicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("permissão negada", async () => {
    mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ status: "denied" } as any);

    const { result } = renderHook(() => useProfileImagePicker());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(mockedAlert).toHaveBeenCalledWith("Permissão necessária", "Permita o acesso à galeria para trocar a foto.");
    expect(result.current.image).toBeNull();
  });

  it("seleção cancelada", async () => {
    mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ status: "granted" } as any);
    mockedImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true } as any);

    const { result } = renderHook(() => useProfileImagePicker());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.image).toBeNull();
  });

  it("seleção válida", async () => {
    mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ status: "granted" } as any);
    mockedImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///path/to/image.jpg" }],
    } as any);

    const { result } = renderHook(() => useProfileImagePicker());

    await act(async () => {
      await result.current.pickImage();
    });

    await waitFor(() => {
      expect(result.current.image).toBe("file:///path/to/image.jpg");
    });
  });
});
