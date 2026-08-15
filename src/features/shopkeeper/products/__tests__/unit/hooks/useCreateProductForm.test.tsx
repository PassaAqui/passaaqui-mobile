import { renderHook, act } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { useCreateProductForm } from "@/src/features/shopkeeper/products/hooks/useCreateProductForm";
import { useCreateProduct } from "@/src/features/shopkeeper/products/hooks/useCreateProduct";
import { useShopkeeperMe } from "@/src/features/shopkeeper/auth/hooks/useShopkeeperMe";
import { shopkeeperMe } from "@/src/features/shopkeeper/products/__tests__/fixtures/products";

jest.mock("@/src/features/shopkeeper/products/hooks/useCreateProduct", () => ({
  useCreateProduct: jest.fn(),
}));

jest.mock("@/src/features/shopkeeper/auth/hooks/useShopkeeperMe", () => ({
  useShopkeeperMe: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockedUseCreateProduct = useCreateProduct as jest.MockedFunction<typeof useCreateProduct>;
const mockedUseShopkeeperMe = useShopkeeperMe as jest.MockedFunction<typeof useShopkeeperMe>;
const mockedRequestPermission =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.MockedFunction<
    typeof ImagePicker.requestMediaLibraryPermissionsAsync
  >;
const mockedLaunchImageLibrary =
  ImagePicker.launchImageLibraryAsync as jest.MockedFunction<
    typeof ImagePicker.launchImageLibraryAsync
  >;

let mutation: {
  mutate: jest.Mock;
  isPending: boolean;
  isError: boolean;
  data: unknown;
};

function mockCreateMutation(overrides: Partial<typeof mutation> = {}) {
  mutation = {
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    data: undefined,
    ...overrides,
  };
  mockedUseCreateProduct.mockReturnValue(
    mutation as unknown as ReturnType<typeof useCreateProduct>
  );
  return mutation;
}

async function pickTwoImages(result: { current: ReturnType<typeof useCreateProductForm> }) {
  mockedRequestPermission.mockResolvedValueOnce({ status: "granted" } as never);
  mockedLaunchImageLibrary.mockResolvedValueOnce({
    canceled: false,
    assets: [
      { uri: "file:///a.jpg", fileName: "a.jpg" },
      { uri: "file:///b.jpg" },
    ],
  } as never);
  await act(async () => {
    await result.current.pickImages();
  });
}

function renderForm() {
  return renderHook(() => useCreateProductForm());
}

describe("useCreateProductForm", () => {
  const alertSpy = jest.fn();
  const originalAlert = (global as { alert?: unknown }).alert;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateMutation();
    mockedUseShopkeeperMe.mockReturnValue({
      data: shopkeeperMe,
    } as unknown as ReturnType<typeof useShopkeeperMe>);
    (global as { alert?: unknown }).alert = alertSpy;
  });

  afterEach(() => {
    if (originalAlert === undefined) {
      delete (global as { alert?: unknown }).alert;
    } else {
      (global as { alert?: unknown }).alert = originalAlert;
    }
  });

  it("retorna o estado inicial", () => {
    // Arrange

    // Act
    const { result } = renderForm();

    // Assert
    expect(result.current.name).toBe("");
    expect(result.current.category).toBeNull();
    expect(result.current.price).toBe("");
    expect(result.current.quantity).toBe(0);
    expect(result.current.images).toEqual([]);
    expect(result.current.errors).toEqual({});
  });

  it("preenche o nome e limpa o erro ao digitar texto", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.handleNameChange("Café"));

    // Assert
    expect(result.current.name).toBe("Café");
    expect(result.current.errors.name).toBeUndefined();
  });

  it("limita a descrição a 700 caracteres", () => {
    // Arrange
    const { result } = renderForm();
    const long = "a".repeat(800);

    // Act
    act(() => result.current.handleDescriptionChange(long));

    // Assert
    expect(result.current.description.length).toBe(700);
  });

  it("preenche o preço e limpa o erro quando é maior que zero", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.handlePriceChange("19,90"));

    // Assert
    expect(result.current.price).toBe("19,90");
    expect(result.current.errors.price).toBeUndefined();
  });

  it("seleciona a categoria e limpa o erro", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.handleSelectCategory({ id: 3, name: "Café" }));

    // Assert
    expect(result.current.category).toEqual({ id: 3, name: "Café" });
    expect(result.current.errors.category).toBeUndefined();
  });

  it("incrementa e decrementa a quantidade sem ir abaixo de zero", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.incrementQuantity());
    act(() => result.current.incrementQuantity());
    act(() => result.current.decrementQuantity());
    act(() => result.current.decrementQuantity());
    act(() => result.current.decrementQuantity());

    // Assert
    expect(result.current.quantity).toBe(0);
  });

  it("não abre a galeria e alerta quando a permissão é negada", async () => {
    // Arrange
    mockedRequestPermission.mockResolvedValueOnce({ status: "denied" } as never);
    const { result } = renderForm();

    // Act
    await act(async () => {
      await result.current.pickImages();
    });

    // Assert
    expect(mockedLaunchImageLibrary).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      "Precisamos de acesso à sua galeria para selecionar fotos."
    );
  });

  it("mantém as imagens vazias quando a seleção é cancelada", async () => {
    // Arrange
    mockedRequestPermission.mockResolvedValueOnce({ status: "granted" } as never);
    mockedLaunchImageLibrary.mockResolvedValueOnce({ canceled: true, assets: [] } as never);
    const { result } = renderForm();

    // Act
    await act(async () => {
      await result.current.pickImages();
    });

    // Assert
    expect(result.current.images).toEqual([]);
  });

  it("adiciona as imagens selecionadas derivando o nome da uri", async () => {
    // Arrange
    const { result } = renderForm();

    // Act
    await pickTwoImages(result);

    // Assert
    expect(result.current.images).toEqual([
      { uri: "file:///a.jpg", name: "a.jpg" },
      { uri: "file:///b.jpg", name: "b.jpg" },
    ]);
  });

  it("remove uma imagem pela uri", async () => {
    // Arrange
    const { result } = renderForm();
    await pickTwoImages(result);

    // Act
    act(() => result.current.removeImage("file:///a.jpg"));

    // Assert
    expect(result.current.images).toEqual([{ uri: "file:///b.jpg", name: "b.jpg" }]);
  });

  it("valida como inválido e preenche os erros ao publicar com campos vazios", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.handlePublish());

    // Assert
    expect(result.current.errors.name).toBe("Nome é obrigatório");
    expect(result.current.errors.category).toBe("Categoria é obrigatória");
    expect(result.current.errors.price).toBe("Preço deve ser maior que zero");
    expect(result.current.errors.quantity).toBe("Quantidade deve ser maior que zero");
    expect(result.current.errors.images).toBe("Adicione ao menos uma foto");
    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("valida como válido e mantém os erros vazios ao publicar com campos preenchidos", async () => {
    // Arrange
    const { result } = renderForm();
    act(() => result.current.handleNameChange("Café"));
    act(() => result.current.handleSelectCategory({ id: 3, name: "Café" }));
    act(() => result.current.handlePriceChange("19,90"));
    act(() => result.current.incrementQuantity());
    act(() => result.current.handleDescriptionChange("descrição"));
    await pickTwoImages(result);

    // Act
    act(() => result.current.handlePublish());

    // Assert
    expect(result.current.errors).toEqual({});
  });

  it("não chama mutate quando a validação falha", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.handlePublish());

    // Assert
    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("não chama mutate quando falta categoria ou dados do lojista", () => {
    // Arrange
    mockedUseShopkeeperMe.mockReturnValue({ data: undefined } as never);
    const { result } = renderForm();
    act(() => result.current.handleNameChange("Café"));
    act(() => result.current.handlePriceChange("19,90"));
    act(() => result.current.incrementQuantity());

    // Act
    act(() => result.current.handlePublish());

    // Assert
    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("chama mutate com o payload correto quando tudo é válido e invoca onSuccess", async () => {
    // Arrange
    mutation.mutate.mockImplementation((_input, callbacks) => callbacks?.onSuccess?.());
    const { result } = renderForm();
    act(() => result.current.handleNameChange("Café"));
    act(() => result.current.handleSelectCategory({ id: 3, name: "Café" }));
    act(() => result.current.handlePriceChange("19,90"));
    act(() => result.current.incrementQuantity());
    await pickTwoImages(result);
    const onSuccess = jest.fn();

    // Act
    act(() => result.current.handlePublish(onSuccess));

    // Assert
    expect(mutation.mutate).toHaveBeenCalledWith(
      {
        payload: {
          name: "Café",
          description: undefined,
          price: 19.9,
          stock: 1,
          active: true,
          highlight: false,
          shopkeeperId: 1,
          categoryId: 3,
          poiId: 1,
        },
        images: [
          { uri: "file:///a.jpg", name: "a.jpg" },
          { uri: "file:///b.jpg", name: "b.jpg" },
        ],
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onSuccess).toHaveBeenCalled();
  });
});
