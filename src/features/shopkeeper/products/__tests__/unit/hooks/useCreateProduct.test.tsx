import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useCreateProduct } from "@/src/features/shopkeeper/products/hooks/useCreateProduct";
import {
  createProduct,
  uploadProductImage,
} from "@/src/features/shopkeeper/products/services/productService";
import {
  createProductPayload,
  productModel,
  createAxiosError,
} from "@/src/features/shopkeeper/products/__tests__/fixtures/products";

jest.mock("@/src/features/shopkeeper/products/services/productService", () => ({
  createProduct: jest.fn(),
  uploadProductImage: jest.fn(),
  deleteProduct: jest.fn(),
}));

const mockedCreateProduct = createProduct as jest.MockedFunction<typeof createProduct>;
const mockedUploadProductImage = uploadProductImage as jest.MockedFunction<typeof uploadProductImage>;

const img1 = { uri: "file:///a.jpg", name: "a.jpg" };
const img2 = { uri: "file:///b.jpg", name: "b.jpg" };

describe("useCreateProduct", () => {
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

  function renderUseCreateProduct() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { unmount: unmountFn, ...rest } = renderHook(() => useCreateProduct(), {
      wrapper,
    });
    unmount = unmountFn;
    return rest;
  }

  it("resolve com totalImages 0 e não chama upload quando não há imagens", async () => {
    // Arrange
    mockedCreateProduct.mockResolvedValueOnce(productModel);

    // Act
    const { result } = renderUseCreateProduct();
    const response = await result.current.mutateAsync({
      payload: createProductPayload,
      images: [],
    });

    // Assert
    expect(response).toEqual({
      product: productModel,
      totalImages: 0,
      uploadedImages: 0,
      failedImages: 0,
    });
    expect(mockedCreateProduct).toHaveBeenCalledWith(createProductPayload);
    expect(mockedUploadProductImage).not.toHaveBeenCalled();
  });

  it("resolve com todas as imagens enviadas quando o upload tem sucesso", async () => {
    // Arrange
    mockedCreateProduct.mockResolvedValueOnce(productModel);
    mockedUploadProductImage.mockResolvedValue(productModel);

    // Act
    const { result } = renderUseCreateProduct();
    const response = await result.current.mutateAsync({
      payload: createProductPayload,
      images: [img1, img2],
    });

    // Assert
    expect(response).toEqual({
      product: productModel,
      totalImages: 2,
      uploadedImages: 2,
      failedImages: 0,
    });
    expect(mockedUploadProductImage).toHaveBeenCalledTimes(2);
    expect(mockedUploadProductImage).toHaveBeenCalledWith(5, img1.uri, img1.name);
    expect(mockedUploadProductImage).toHaveBeenCalledWith(5, img2.uri, img2.name);
  });

  it("resolve com upload parcial falho usando o produto da última chamada bem-sucedida", async () => {
    // Arrange
    mockedCreateProduct.mockResolvedValueOnce(productModel);
    mockedUploadProductImage
      .mockResolvedValueOnce(productModel)
      .mockRejectedValueOnce(createAxiosError(500));

    // Act
    const { result } = renderUseCreateProduct();
    const response = await result.current.mutateAsync({
      payload: createProductPayload,
      images: [img1, img2],
    });

    // Assert
    expect(response).toEqual({
      product: productModel,
      totalImages: 2,
      uploadedImages: 1,
      failedImages: 1,
    });
  });

  it("invalida as queries de produtos após o sucesso", async () => {
    // Arrange
    client.setQueryData(["shopkeeper-products"], [productModel]);
    client.setQueryData(["shopkeeper-product-metrics"], {});
    mockedCreateProduct.mockResolvedValueOnce(productModel);

    // Act
    const { result } = renderUseCreateProduct();
    await result.current.mutateAsync({ payload: createProductPayload, images: [] });

    // Assert
    expect(client.getQueryState(["shopkeeper-products"])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["shopkeeper-product-metrics"])?.isInvalidated).toBe(true);
  });

  it("rejeita e expõe o erro quando o create falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedCreateProduct.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseCreateProduct();
    const promise = result.current.mutateAsync({ payload: createProductPayload, images: [] });

    // Assert
    await expect(promise).rejects.toBe(error);
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
