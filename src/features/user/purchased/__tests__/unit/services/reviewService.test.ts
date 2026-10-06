import { api } from "@/src/services/api/api";
import { createProductReview } from "@/src/features/user/purchased/services/reviewService";
import {
  photo,
  review,
  reviewRaw,
  video,
  createAxiosError,
} from "@/src/features/user/purchased/__tests__/fixtures/review";

jest.mock("@/src/services/api/api", () => ({
  api: {
    post: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

class MockFormData {
  parts: { field: string; value: string | { uri: string; name: string; type: string } }[] = [];

  append(field: string, value: string | { uri: string; name: string; type: string }) {
    this.parts.push({ field, value });
  }
}

const originalFormData = global.FormData;

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).FormData = MockFormData;
});

afterEach(() => {
  (global as any).FormData = originalFormData;
});

describe("reviewService", () => {
  describe("createProductReview", () => {
    it("envia a avaliação em multipart para /products/{orderId}/ratings", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: reviewRaw });

      // Act
      const result = await createProductReview({
        productId: "#A3F92",
        rating: 5,
        comment: "Muito saborosa e crocante!",
        photos: [photo],
        videos: [video],
      });

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith(
        "/products/%23A3F92/ratings",
        expect.any(MockFormData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      expect(result).toEqual(review);
    });

    it("anexa rating, comment, order_id, cada foto e o vídeo no FormData", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: reviewRaw });

      // Act
      await createProductReview({
        productId: "#A3F92",
        rating: 3,
        comment: "  Bom produto.  ",
        photos: [photo, { ...photo, uri: "file:///tmp/foto2.png", name: "foto2.png" }],
        videos: [video],
      });

      // Assert
      const { parts } = (mockedApi.post.mock.calls[0][1] as unknown) as MockFormData;
      const normalized = parts.map((part) => ({
        field: part.field,
        value: typeof part.value === "string" ? part.value : { name: part.value.name, type: part.value.type },
      }));
      expect(normalized).toEqual([
        { field: "rating", value: "3" },
        { field: "comment", value: "Bom produto." },
        { field: "order_id", value: "#A3F92" },
        { field: "photos", value: { name: "foto.jpg", type: "image/jpeg" } },
        { field: "photos", value: { name: "foto2.png", type: "image/png" } },
        { field: "video", value: { name: "video.mp4", type: "video/mp4" } },
      ]);
    });

    it("não envia comment vazio", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: reviewRaw });

      // Act
      await createProductReview({
        productId: "#A3F92",
        rating: 4,
        comment: "   ",
        photos: [photo],
        videos: [],
      });

      // Assert
      const { parts } = (mockedApi.post.mock.calls[0][1] as unknown) as MockFormData;
      expect(parts.find((part) => part.field === "comment")).toBeUndefined();
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(400);
      mockedApi.post.mockRejectedValueOnce(error);

      // Act
      const promise = createProductReview({
        productId: "#A3F92",
        rating: 6,
        comment: "",
        photos: [],
        videos: [],
      });

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});