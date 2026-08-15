import { api } from "@/src/services/api/api";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getProductById,
  uploadProductImage,
} from "@/src/features/shopkeeper/products/services/productService";
import {
  createProductPayload,
  productModel,
  updateProductPayload,
  createAxiosError,
} from "@/src/features/shopkeeper/products/__tests__/fixtures/products";

jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("productService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createProduct chama POST /products com o payload completo", async () => {
    // Arrange
    mockedApi.post.mockResolvedValueOnce({ data: productModel });

    // Act
    const result = await createProduct(createProductPayload);

    // Assert
    expect(mockedApi.post).toHaveBeenCalledWith("/products", createProductPayload);
    expect(result).toEqual(productModel);
  });

  it("createProduct relança o erro HTTP", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedApi.post.mockRejectedValueOnce(error);

    // Act
    const promise = createProduct(createProductPayload);

    // Assert
    await expect(promise).rejects.toBe(error);
  });

  it("getProductById retorna o produto sem normalização", async () => {
    // Arrange
    mockedApi.get.mockResolvedValueOnce({ data: productModel });

    // Act
    const result = await getProductById(5);

    // Assert
    expect(mockedApi.get).toHaveBeenCalledWith("/products/5");
    expect(result).toEqual(productModel);
  });

  it("getProductById relança o erro HTTP", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedApi.get.mockRejectedValueOnce(error);

    // Act
    const promise = getProductById(5);

    // Assert
    await expect(promise).rejects.toBe(error);
  });

  it("updateProduct chama PUT /products/:id com o payload", async () => {
    // Arrange
    mockedApi.put.mockResolvedValueOnce({ data: productModel });

    // Act
    const result = await updateProduct(5, updateProductPayload);

    // Assert
    expect(mockedApi.put).toHaveBeenCalledWith("/products/5", updateProductPayload);
    expect(result).toEqual(productModel);
  });

  it("deleteProduct chama DELETE /products/:id", async () => {
    // Arrange
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    // Act
    const result = await deleteProduct(5);

    // Assert
    expect(mockedApi.delete).toHaveBeenCalledWith("/products/5");
    expect(result).toBeUndefined();
  });

  it("deleteProduct relança o erro HTTP", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedApi.delete.mockRejectedValueOnce(error);

    // Act
    const promise = deleteProduct(5);

    // Assert
    await expect(promise).rejects.toBe(error);
  });

  it("uploadProductImage monta multipart/form-data na URL correta", async () => {
    // Arrange
    mockedApi.post.mockResolvedValueOnce({ data: productModel });

    // Act
    const result = await uploadProductImage(5, "file:///foto.jpg", "foto.jpg");

    // Assert
    expect(mockedApi.post).toHaveBeenCalledWith(
      "/products/5/images",
      expect.any(FormData),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    expect(result).toEqual(productModel);
  });

  it("uploadProductImage aceita nomes com extensões conhecidas e desconhecidas sem lançar", async () => {
    // Arrange
    mockedApi.post.mockResolvedValue({ data: productModel });

    // Act
    const extensions = ["foto.png", "foto.jpg", "foto.jpeg", "foto.webp", "arquivo"];
    for (const name of extensions) {
      await uploadProductImage(5, `file:///${name}`, name);
    }

    // Assert
    expect(mockedApi.post).toHaveBeenCalledTimes(extensions.length);
  });

  it("deleteProductImage chama DELETE /products/:id/images/:index", async () => {
    // Arrange
    mockedApi.delete.mockResolvedValueOnce({ data: productModel });

    // Act
    const result = await deleteProductImage(5, 2);

    // Assert
    expect(mockedApi.delete).toHaveBeenCalledWith("/products/5/images/2");
    expect(result).toEqual(productModel);
  });
});
