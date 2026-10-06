import { Image } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ProductCard } from "@/src/features/shopkeeper/catalog/components/ProductCard";
import { useDeleteProduct } from "@/src/features/shopkeeper/products/hooks/useDeleteProduct";
import {
  activeProductCraft,
  activeProductFood,
  inactiveProduct,
} from "@/src/features/shopkeeper/catalog/__tests__/fixtures/catalog";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock(
  "@/src/features/shopkeeper/products/hooks/useDeleteProduct",
  () => ({
    useDeleteProduct: jest.fn(),
  })
);

let modalProps: {
  visible: boolean;
  productName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
} | null = null;

jest.mock(
  "@/src/features/shopkeeper/products/components/DeleteProductModal",
  () => {
    const { View } = require("react-native");
    return {
      __esModule: true,
      default: (props: {
        visible: boolean;
        productName: string;
        isDeleting: boolean;
        onConfirm: () => void;
        onClose: () => void;
      }) => {
        modalProps = props;
        return <View testID="delete-modal" />;
      },
    };
  }
);

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseDeleteProduct = useDeleteProduct as jest.MockedFunction<
  typeof useDeleteProduct
>;
const mockedPush = jest.fn();
const mockedMutate = jest.fn();

describe("ProductCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockedPush } as unknown as ReturnType<
      typeof useRouter
    >);
    mockedUseDeleteProduct.mockReturnValue({
      mutate: mockedMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteProduct>);
    modalProps = null;
  });

  it("renderiza nome, categoria e preço formatado", () => {
    // Arrange
    render(<ProductCard product={activeProductFood} />);

    // Act
    const name = screen.getByText("Café especial");
    const category = screen.getByText("Alimentação");
    const price = screen.getByText("R$ 19,90");

    // Assert
    expect(name).toBeTruthy();
    expect(category).toBeTruthy();
    expect(price).toBeTruthy();
  });

  it("usa a uri da imagem quando o produto tem image e o no-image quando é null", () => {
    // Arrange
    render(
      <>
        <ProductCard product={activeProductFood} />
        <ProductCard product={activeProductCraft} />
      </>
    );

    // Act
    const images = screen.UNSAFE_getAllByType(Image);

    // Assert
    expect(images[0].props.source).toEqual({
      uri: "https://cdn.example.com/cafe.jpg",
    });
    expect(images[1].props.source).toEqual(
      require("@/assets/user/map/tmp/no-image.png")
    );
  });

  it("mostra o ícone de destaque apenas quando highlight é true", () => {
    // Arrange
    render(
      <>
        <ProductCard product={activeProductFood} />
        <ProductCard product={activeProductCraft} />
      </>
    );

    // Act
    const starIcons = screen.getAllByText("ionicon-star");

    // Assert
    expect(starIcons).toHaveLength(1);
  });

  it("mostra o badge Inativo apenas quando o produto está inativo", () => {
    // Arrange
    render(
      <>
        <ProductCard product={activeProductFood} />
        <ProductCard product={inactiveProduct} />
      </>
    );

    // Act
    const inactiveBadge = screen.getByText("Inativo");

    // Assert
    expect(inactiveBadge).toBeTruthy();
    expect(screen.getAllByText("Inativo")).toHaveLength(1);
  });

  it("navega para a edição ao tocar em editar", () => {
    // Arrange
    render(<ProductCard product={activeProductFood} />);

    // Act
    fireEvent.press(screen.getByLabelText("Editar Café especial"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/shopkeeper/(private)/products/edit-product",
      params: { id: 1 },
    });
  });

  it("abre o modal de exclusão ao tocar em excluir", () => {
    // Arrange
    render(<ProductCard product={activeProductFood} />);

    // Act
    fireEvent.press(screen.getByLabelText("Excluir Café especial"));

    // Assert
    expect(modalProps?.visible).toBe(true);
    expect(modalProps?.productName).toBe("Café especial");
  });

  it("confirma a exclusão e fecha o modal no onSuccess", () => {
    // Arrange
    mockedMutate.mockImplementation((_id: number, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });
    render(<ProductCard product={activeProductFood} />);
    fireEvent.press(screen.getByLabelText("Excluir Café especial"));
    expect(modalProps?.visible).toBe(true);

    // Act
    act(() => {
      modalProps?.onConfirm();
    });

    // Assert
    expect(mockedMutate).toHaveBeenCalledWith(1, expect.anything());
    expect(modalProps?.visible).toBe(false);
  });

  it("cancela a exclusão e fecha o modal", () => {
    // Arrange
    render(<ProductCard product={activeProductFood} />);
    fireEvent.press(screen.getByLabelText("Excluir Café especial"));
    expect(modalProps?.visible).toBe(true);

    // Act
    act(() => {
      modalProps?.onClose();
    });

    // Assert
    expect(modalProps?.visible).toBe(false);
    expect(mockedMutate).not.toHaveBeenCalled();
  });
});