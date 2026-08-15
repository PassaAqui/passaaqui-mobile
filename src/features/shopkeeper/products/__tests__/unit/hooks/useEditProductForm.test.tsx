import { renderHook, act } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { useEditProductForm } from "@/src/features/shopkeeper/products/hooks/useEditProductForm";
import { useProductById } from "@/src/features/shopkeeper/products/hooks/useProductById";
import { useUpdateProduct } from "@/src/features/shopkeeper/products/hooks/useUpdateProduct";
import { productModel } from "@/src/features/shopkeeper/products/__tests__/fixtures/products";

jest.mock("@/src/features/shopkeeper/products/hooks/useProductById", () => ({
  useProductById: jest.fn(),
}));

jest.mock("@/src/features/shopkeeper/products/hooks/useUpdateProduct", () => ({
  useUpdateProduct: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockedUseProductById = useProductById as jest.MockedFunction<typeof useProductById>;
const mockedUseUpdateProduct = useUpdateProduct as jest.MockedFunction<typeof useUpdateProduct>;
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
};

function mockProduct() {
  mockedUseProductById.mockReturnValue({
    data: productModel,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useProductById>);
}

function mockUpdateMutation(overrides: Partial<typeof mutation> = {}) {
  mutation = { mutate: jest.fn(), isPending: false, isError: false, ...overrides };
  mockedUseUpdateProduct.mockReturnValue(
    mutation as unknown as ReturnType<typeof useUpdateProduct>
  );
  return mutation;
}

function renderForm(id = 5) {
  return renderHook(() => useEditProductForm(id));
}

async function pickOneNewImage(result: { current: ReturnType<typeof useEditProductForm> }) {
  mockedRequestPermission.mockResolvedValueOnce({ status: "granted" } as never);
  mockedLaunchImageLibrary.mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri: "file:///nova.jpg", fileName: "nova.jpg" }],
  } as never);
  await act(async () => {
    await result.current.pickImages();
  });
}

describe("useEditProductForm", () => {
  let alertSpy: typeof jest.fn;
  const originalAlert = (global as { alert?: unknown }).alert;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProduct();
    mockUpdateMutation();
    alertSpy = jest.fn();
    (global as { alert?: unknown }).alert = alertSpy;
  });

  afterEach(() => {
    if (originalAlert === undefined) {
      delete (global as { alert?: unknown }).alert;
    } else {
      (global as { alert?: unknown }).alert = originalAlert;
    }
  });

  it("pré-preenche o formulário a partir do produto", () => {
    // Arrange

    // Act
    const { result } = renderForm();

    // Assert
    expect(result.current.name).toBe("Tapioca Clássica");
    expect(result.current.category).toEqual({ id: 3, name: "Café" });
    expect(result.current.description).toBe("Tapioca recheada com queijo coalho");
    expect(result.current.price).toBe("12,50");
    expect(result.current.quantity).toBe(10);
    expect(result.current.active).toBe(true);
    expect(result.current.highlight).toBe(false);
    expect(result.current.existingImages).toEqual(["https://cdn.example.com/tapioca.jpg"]);
  });

  it("preenche o nome e limpa o erro ao digitar texto", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.handleNameChange("Café atualizado"));

    // Assert
    expect(result.current.name).toBe("Café atualizado");
    expect(result.current.errors.name).toBeUndefined();
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
    act(() => result.current.handleSelectCategory({ id: 5, name: "Artesanato" }));

    // Assert
    expect(result.current.category).toEqual({ id: 5, name: "Artesanato" });
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
    act(() => result.current.decrementQuantity());
    act(() => result.current.decrementQuantity());
    act(() => result.current.decrementQuantity());
    act(() => result.current.decrementQuantity());
    act(() => result.current.decrementQuantity());
    act(() => result.current.decrementQuantity());
    act(() => result.current.decrementQuantity());
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

  it("adiciona uma nova imagem selecionada", async () => {
    // Arrange
    const { result } = renderForm();

    // Act
    await pickOneNewImage(result);

    // Assert
    expect(result.current.newImages).toEqual([{ uri: "file:///nova.jpg", name: "nova.jpg" }]);
    expect(result.current.totalImagesCount).toBe(2);
  });

  it("remove uma imagem existente adicionando o índice aos removidos", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.removeExistingImage(0));

    // Assert
    expect(result.current.existingImages).toEqual([]);
  });

  it("remove uma nova imagem pela uri", async () => {
    // Arrange
    const { result } = renderForm();
    await pickOneNewImage(result);

    // Act
    act(() => result.current.removeNewImage("file:///nova.jpg"));

    // Assert
    expect(result.current.newImages).toEqual([]);
    expect(result.current.totalImagesCount).toBe(1);
  });

  it("preenche os erros ao salvar com campos vazios", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.handleNameChange(""));
    act(() => result.current.handleSelectCategory(null as never));
    act(() => result.current.handlePriceChange(""));
    act(() => result.current.handleSave());

    // Assert
    expect(result.current.errors.name).toBe("Informe o nome do produto");
    expect(result.current.errors.category).toBe("Selecione uma categoria");
    expect(result.current.errors.price).toBe("Informe um preço válido");
    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("mantém os erros vazios ao salvar com campos válidos", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.handleSave());

    // Assert
    expect(result.current.errors).toEqual({});
  });

  it("não chama mutate quando a categoria é null", () => {
    // Arrange
    const { result } = renderForm();

    // Act
    act(() => result.current.handleSelectCategory(null as never));
    act(() => result.current.handleSave());

    // Assert
    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("chama mutate com o payload correto ao salvar e invoca onSuccess", () => {
    // Arrange
    mutation.mutate.mockImplementation((_input, callbacks) => callbacks?.onSuccess?.());
    const { result } = renderForm();
    const onSuccess = jest.fn();

    // Act
    act(() => result.current.handleSave(onSuccess));

    // Assert
    expect(mutation.mutate).toHaveBeenCalledWith(
      {
        id: 5,
        payload: {
          name: "Tapioca Clássica",
          description: "Tapioca recheada com queijo coalho",
          price: 12.5,
          stock: 10,
          active: true,
          highlight: false,
          categoryId: 3,
        },
        newImages: [],
        removedImageIndexes: [],
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onSuccess).toHaveBeenCalled();
  });
});
