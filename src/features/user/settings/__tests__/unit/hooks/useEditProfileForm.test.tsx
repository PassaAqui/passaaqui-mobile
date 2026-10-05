import { renderHook, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { Alert } from "react-native";
import { useEditProfileForm } from "@/src/features/user/settings/hooks/useEditProfileForm";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useUpdateProfile } from "@/src/features/user/settings/hooks/useUpdateProfile";
import { useProfileImagePicker } from "@/src/features/user/settings/hooks/useProfileImagePicker";

jest.mock("@/src/features/user/auth/hooks/useTouristMe", () => ({
  useTouristMe: jest.fn(),
}));

jest.mock("@/src/features/user/settings/hooks/useUpdateProfile", () => ({
  useUpdateProfile: jest.fn(),
}));

jest.mock("@/src/features/user/settings/hooks/useProfileImagePicker", () => ({
  useProfileImagePicker: jest.fn(),
}));

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

const mockedUseTouristMe = useTouristMe as jest.MockedFunction<typeof useTouristMe>;
const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;
const mockedUseProfileImagePicker = useProfileImagePicker as jest.MockedFunction<
  typeof useProfileImagePicker
>;

function mockImagePicker(image: string | null = null) {
  mockedUseProfileImagePicker.mockReturnValue({
    image,
    pickImage: jest.fn(),
    setImage: jest.fn(),
  });
}

describe("useEditProfileForm", () => {
  let client: QueryClient;
  let unmount: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { gcTime: 0 } },
    });
    mockImagePicker();
    mockedUseUpdateProfile.mockReturnValue({ mutate: jest.fn(), isPending: false } as never);
  });

  afterEach(() => {
    unmount?.();
    client.clear();
  });

  function renderUseEditProfileForm() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useEditProfileForm(), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("preenche o nome inicial com o nome do backend", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);

    // Act
    const { result } = renderUseEditProfileForm();

    // Assert
    expect(result.current.name).toBe("João Turista");
  });

  it("exibe a imagem do backend usando imageUrl", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({
      data: { name: "João", imageUrl: "http://localhost:9000/avatar.jpg" },
    } as never);

    // Act
    const { result } = renderUseEditProfileForm();

    // Assert
    expect(result.current.image).toBe("http://localhost:9000/avatar.jpg");
  });

  it("usa image quando imageUrl não existe", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({
      data: { name: "João", image: "http://localhost:9000/avatar.jpg" },
    } as never);

    // Act
    const { result } = renderUseEditProfileForm();

    // Assert
    expect(result.current.image).toBe("http://localhost:9000/avatar.jpg");
  });

  it("prioriza a foto escolhida sobre a foto do backend", () => {
    // Arrange
    mockImagePicker("file:///nova-foto.jpg");
    mockedUseTouristMe.mockReturnValue({
      data: { name: "João", imageUrl: "http://localhost:9000/avatar.jpg" },
    } as never);

    // Act
    const { result } = renderUseEditProfileForm();

    // Assert
    expect(result.current.image).toBe("file:///nova-foto.jpg");
  });

  it("não sobrescreve o nome já digitado pelo usuário", () => {
    // Arrange
    const { result, rerender } = renderUseEditProfileForm();

    // Act
    act(() => {
      result.current.handleNameChange("Meu Nome");
    });
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    rerender(undefined);

    // Assert
    expect(result.current.name).toBe("Meu Nome");
  });

  it("mostra erro de validação para nome com menos de 3 caracteres", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    const mutate = jest.fn();
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false } as never);

    // Act
    const { result } = renderUseEditProfileForm();
    act(() => {
      result.current.handleNameChange("Ab");
    });
    act(() => {
      result.current.handleSave();
    });

    // Assert
    expect(result.current.nameError).toBe("O nome deve ter pelo menos 3 caracteres.");
    expect(mutate).not.toHaveBeenCalled();
  });

  it("não chama a API quando nada mudou", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    const mutate = jest.fn();
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false } as never);

    // Act
    const { result } = renderUseEditProfileForm();
    act(() => {
      result.current.handleSave();
    });

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("salva apenas o nome alterado", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    const mutate = jest.fn();
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false } as never);

    // Act
    const { result } = renderUseEditProfileForm();
    act(() => {
      result.current.handleNameChange("João Atualizado");
    });
    act(() => {
      result.current.handleSave();
    });

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { payload: { name: "João Atualizado" }, imageUri: undefined },
      expect.anything()
    );
  });

  it("envia o nome sem espaços nas pontas", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    const mutate = jest.fn();
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false } as never);

    // Act
    const { result } = renderUseEditProfileForm();
    act(() => {
      result.current.handleNameChange("  Maria Silva  ");
    });
    act(() => {
      result.current.handleSave();
    });

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { payload: { name: "Maria Silva" }, imageUri: undefined },
      expect.anything()
    );
  });

  it("salva nome e imagem juntos", () => {
    // Arrange
    mockImagePicker("file:///nova-foto.jpg");
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    const mutate = jest.fn();
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false } as never);

    // Act
    const { result } = renderUseEditProfileForm();
    act(() => {
      result.current.handleNameChange("João Atualizado");
    });
    act(() => {
      result.current.handleSave();
    });

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { payload: { name: "João Atualizado" }, imageUri: "file:///nova-foto.jpg" },
      expect.anything()
    );
  });

  it("salva apenas a imagem quando o nome não mudou", () => {
    // Arrange
    mockImagePicker("file:///nova-foto.jpg");
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    const mutate = jest.fn();
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false } as never);

    // Act
    const { result } = renderUseEditProfileForm();
    act(() => {
      result.current.handleSave();
    });

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { payload: {}, imageUri: "file:///nova-foto.jpg" },
      expect.anything()
    );
  });

  it("volta para a tela anterior quando o PUT responde com sucesso", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    const mutate = jest.fn((_variables, options) => {
      options?.onSuccess?.({ id: 1, name: "João Atualizado" });
    });
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false } as never);

    // Act
    const { result } = renderUseEditProfileForm();
    act(() => {
      result.current.handleNameChange("João Atualizado");
    });
    act(() => {
      result.current.handleSave();
    });

    // Assert
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("trata o erro da API exibindo alerta e sem voltar", () => {
    // Arrange
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    const mutate = jest.fn((_variables, options) => {
      options?.onError?.(new Error("Request failed"));
    });
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false } as never);

    // Act
    const { result } = renderUseEditProfileForm();
    act(() => {
      result.current.handleNameChange("João Atualizado");
    });
    act(() => {
      result.current.handleSave();
    });

    // Assert
    expect(alertSpy).toHaveBeenCalledWith(
      "Erro ao salvar",
      "Não foi possível salvar as alterações. Tente novamente."
    );
    expect(mockBack).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it("limpa o erro de validação ao editar o nome novamente", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { name: "João Turista" } } as never);
    mockedUseUpdateProfile.mockReturnValue({ mutate: jest.fn(), isPending: false } as never);

    // Act
    const { result } = renderUseEditProfileForm();
    act(() => {
      result.current.handleNameChange("Ab");
    });
    act(() => {
      result.current.handleSave();
    });
    act(() => {
      result.current.handleNameChange("Ana");
    });

    // Assert
    expect(result.current.nameError).toBe("");
  });
});
