import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import { ProductRatingsPreview } from "@/src/features/user/shop/components/ProductRatingsPreview";
import { useProductRatings } from "@/src/features/user/shop/hooks/products/useProductRatings";
import {
  productRating,
  productRatingMinimal,
} from "@/src/features/user/shop/__tests__/fixtures/productRatings";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/src/features/user/shop/hooks/products/useProductRatings", () => ({
  getAverageRating: (ratings: { rating: number }[]) =>
    ratings.length === 0
      ? 0
      : ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length,
  useProductRatings: jest.fn(),
}));

const mockedUseProductRatings = useProductRatings as jest.MockedFunction<
  typeof useProductRatings
>;

describe("ProductRatingsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna null enquanto está carregando", () => {
    // Arrange
    mockedUseProductRatings.mockReturnValue({ data: undefined } as any);

    // Act
    render(<ProductRatingsPreview productId={10} />);

    // Assert
    expect(screen.queryByText("Opiniões")).toBeNull();
  });

  it("mostra a mensagem de vazio quando não há avaliações", () => {
    // Arrange
    mockedUseProductRatings.mockReturnValue({ data: [] } as any);

    // Act
    render(<ProductRatingsPreview productId={10} />);

    // Assert
    expect(screen.getByText("Avaliações")).toBeTruthy();
    expect(screen.getByText("Este produto ainda não possui avaliações.")).toBeTruthy();
  });

  it("exibe resumo, média e até duas avaliações sem o botão ver mais", () => {
    // Arrange
    mockedUseProductRatings.mockReturnValue({
      data: [productRating, productRatingMinimal],
    } as any);

    // Act
    render(<ProductRatingsPreview productId={10} />);

    // Assert
    expect(screen.getByText("4.0")).toBeTruthy();
    expect(screen.getByText("2 avaliações")).toBeTruthy();
    expect(screen.getByText("Muito saborosa e crocante!")).toBeTruthy();
    expect(screen.getByText("Pedido #B7C21")).toBeTruthy();
    expect(screen.queryByText("Ver mais comentários")).toBeNull();
  });

  it("mostra o botão ver mais e navega para a listagem completa ao tocar", () => {
    // Arrange
    const extraRating = { ...productRatingMinimal, id: 3, rating: 4 };
    mockedUseProductRatings.mockReturnValue({
      data: [productRating, productRatingMinimal, extraRating],
    } as any);

    // Act
    render(<ProductRatingsPreview productId={10} />);
    fireEvent.press(screen.getByText("Ver mais comentários"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/user/(private)/product-ratings",
      params: { id: 10 },
    });
  });

  it("exibe a faixa Opiniões com fotos com o overlay de fotos restantes", () => {
    // Arrange
    const withPhotos = [
      { ...productRating, id: 1, photos: ["photo-1", "photo-2"] },
      { ...productRatingMinimal, id: 2, photos: ["photo-3", "photo-4"] },
    ];
    mockedUseProductRatings.mockReturnValue({ data: withPhotos } as any);

    // Act
    render(<ProductRatingsPreview productId={10} />);

    // Assert
    expect(screen.getByText("Avaliações com fotos")).toBeTruthy();
    expect(screen.getByText("+1")).toBeTruthy();
    expect(screen.UNSAFE_getAllByType(Image).length).toBeGreaterThanOrEqual(4);
  });
});