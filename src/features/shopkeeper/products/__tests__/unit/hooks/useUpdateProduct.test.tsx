import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useUpdateProduct } from "@/src/features/shopkeeper/products/hooks/useUpdateProduct";
import {
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from "@/src/features/shopkeeper/products/services/productService";
import {
  updateProductPayload,
  productModel,
  createAxiosError,
} from "@/src/features/shopkeeper/products/__tests__/fixtures/products";

jest.mock("@/src/features/shopkeeper/products/services/productService", () => ({
  updateProduct: jest.fn(),
  uploadProductImage: jest.fn(),
  deleteProductImage: jest.fn(),
  createProduct: jest.fn(),
  deleteProduct: jest.fn(),
  getProductById: jest.fn(),
}));

const mockedUpdateProduct = updateProduct as jest.MockedFunction<typeof updateProduct>;
const mockedUploadProductImage = uploadProductImage as jest.MockedFunction<typeof uploadProductImage>;
const mockedDeleteProductImage = deleteProductImage as jest.MockedFunction<typeof deleteProductImage>;

const img = { uri: "file:///nova.jpg", name: "nova.jpg" };

describe("useUpdateProduct", () => {
  let client: QueryClient;
  let unmount: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    unmount?.();
    client.clear();
  });

  function renderUseUpdateProduct() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { unmount: unmountFn, ...rest } = renderHook(() => useUpdateProduct(), {
      wrapper,
    });
    unmount = unmountFn;
    return rest;
  }

  it("remove as imagens na ordem decrescente e atualiza o produto", async () => {
    // Arrange
    mockedDeleteProductImage.mockResolvedValue(productModel);
    mockedUpdateProduct.mockResolvedValueOnce(productModel);

    // Act
    const { result } = renderUseUpdateProduct();
    const response = await result.current.mutateAsync({
      id: 5,
      payload: updateProductPayload,
      newImages: [],
      removedImageIndexes: [0, 2],
    });

    // Assert
    expect(mockedDeleteProductImage).toHaveBeenCalledTimes(2);
    expect(mockedDeleteProductImage).toHaveBeenNthCalledWith(1, 5, 2);
    expect(mockedDeleteProductImage).toHaveBeenNthCalledWith(2, 5, 0);
    expect(mockedUpdateProduct).toHaveBeenCalledWith(5, updateProductPayload);
    expect(response).toEqual(productModel);
  });

  it("resolve sem chamar upload quando não há novas imagens", async () => {
    // Arrange
    mockedUpdateProduct.mockResolvedValueOnce(productModel);

    // Act
    const { result } = renderUseUpdateProduct();
    const response = await result.current.mutateAsync({
      id: 5,
      payload: updateProductPayload,
      newImages: [],
      removedImageIndexes: [],
    });

    // Assert
    expect(response).toEqual(productModel);
    expect(mockedUploadProductImage).not.toHaveBeenCalled();
  });

  it("faz upload das novas imagens e resolve com o produto da última chamada bem-sucedida", async () => {
    // Arrange
    mockedUpdateProduct.mockResolvedValueOnce(productModel);
    mockedUploadProductImage.mockResolvedValue(productModel);

    // Act
    const { result } = renderUseUpdateProduct();
    const response = await result.current.mutateAsync({
      id: 5,
      payload: updateProductPayload,
      newImages: [img],
      removedImageIndexes: [],
    });

    // Assert
    expect(response).toEqual(productModel);
    expect(mockedUploadProductImage).toHaveBeenCalledWith(5, img.uri, img.name);
  });

  it("invalida as queries de produtos e do produto após o sucesso", async () => {
    // Arrange
    client.setQueryData(["shopkeeper-products"], []);
    client.setQueryData(["shopkeeper-product-metrics"], {});
    client.setQueryData(["product", 5], productModel);
    mockedUpdateProduct.mockResolvedValueOnce(productModel);

    // Act
    const { result } = renderUseUpdateProduct();
    await result.current.mutateAsync({
      id: 5,
      payload: updateProductPayload,
      newImages: [],
      removedImageIndexes: [],
    });

    // Assert
    expect(client.getQueryState(["shopkeeper-products"])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["shopkeeper-product-metrics"])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["product", 5])?.isInvalidated).toBe(true);
  });

  it("rejeita e expõe o erro quando o update falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedUpdateProduct.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseUpdateProduct();
    const promise = result.current.mutateAsync({
      id: 5,
      payload: updateProductPayload,
      newImages: [],
      removedImageIndexes: [],
    });

    // Assert
    await expect(promise).rejects.toBe(error);
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
