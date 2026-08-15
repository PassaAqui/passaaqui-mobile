import { ActivityIndicator } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import CreateProductScreen from "@/src/features/shopkeeper/products/screens/CreateProductScreen";
import { useCreateProductForm } from "@/src/features/shopkeeper/products/hooks/useCreateProductForm";

jest.mock(
  "@/src/features/shopkeeper/products/hooks/useCreateProductForm",
  () => ({
    useCreateProductForm: jest.fn(),
  })
);

let categoryModalProps: {
  visible: boolean;
  onClose: () => void;
  selectedCategory: { id: number; name: string } | null;
  onSelect: (category: { id: number; name: string }) => void;
} | null = null;

jest.mock("@/src/features/shopkeeper/components/CategoryModal", () => {
  const { View } = require("react-native");
  return {
    CategoryModal: (props: {
      visible: boolean;
      onClose: () => void;
      selectedCategory: { id: number; name: string } | null;
      onSelect: (category: { id: number; name: string }) => void;
    }) => {
      categoryModalProps = props;
      return <View testID="category-modal" />;
    },
  };
});

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAwareScrollView: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

type SelectedImage = { uri: string; name: string };

type CreateFormMock = {
  name: string;
  category: { id: number; name: string } | null;
  categoryModalVisible: boolean;
  description: string;
  price: string;
  quantity: number;
  images: SelectedImage[];
  errors: Record<string, string | undefined>;
  descriptionMaxLength: number;
  maxImages: number;
  isSubmitting: boolean;
  submitError: boolean;
  submitResult: { failedImages: number; totalImages: number } | undefined;
  handleNameChange: jest.Mock;
  handleSelectCategory: jest.Mock;
  handleDescriptionChange: jest.Mock;
  handlePriceChange: jest.Mock;
  incrementQuantity: jest.Mock;
  decrementQuantity: jest.Mock;
  pickImages: jest.Mock;
  removeImage: jest.Mock;
  handlePublish: jest.Mock;
  openCategoryModal: jest.Mock;
  closeCategoryModal: jest.Mock;
};

const mockedUseCreateProductForm = useCreateProductForm as jest.MockedFunction<
  typeof useCreateProductForm
>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedBack = jest.fn();

function mockCreateFormState(overrides: Partial<CreateFormMock> = {}): CreateFormMock {
  const form: CreateFormMock = {
    name: "",
    category: null,
    categoryModalVisible: false,
    description: "",
    price: "",
    quantity: 0,
    images: [],
    errors: {},
    descriptionMaxLength: 700,
    maxImages: 4,
    isSubmitting: false,
    submitError: false,
    submitResult: undefined,
    handleNameChange: jest.fn(),
    handleSelectCategory: jest.fn(),
    handleDescriptionChange: jest.fn(),
    handlePriceChange: jest.fn(),
    incrementQuantity: jest.fn(),
    decrementQuantity: jest.fn(),
    pickImages: jest.fn(),
    removeImage: jest.fn(),
    handlePublish: jest.fn(),
    openCategoryModal: jest.fn(),
    closeCategoryModal: jest.fn(),
    ...overrides,
  };

  mockedUseCreateProductForm.mockReturnValue(
    form as unknown as ReturnType<typeof useCreateProductForm>
  );
  return form;
}

describe("CreateProductScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateFormState();
    mockedUseRouter.mockReturnValue({ back: mockedBack } as unknown as ReturnType<
      typeof useRouter
    >);
    categoryModalProps = null;
  });

  it("renderiza o formulário de novo produto", () => {
    // Arrange

    // Act
    render(<CreateProductScreen />);

    // Assert
    expect(screen.getByText("Novo Produto")).toBeTruthy();
    expect(screen.getByText("FOTO DO PRODUTO")).toBeTruthy();
    expect(screen.getByText("INFORMAÇÕES BÁSICAS")).toBeTruthy();
    expect(screen.getByText("NOME DO PRODUTO *")).toBeTruthy();
    expect(screen.getByText("CATEGORIA *")).toBeTruthy();
    expect(screen.getByText("PREÇO")).toBeTruthy();
    expect(screen.getByText("ESTOQUE")).toBeTruthy();
    expect(screen.getByText("Publicar produto")).toBeTruthy();
  });

  it("mostra o contador de imagens e o botão de adicionar foto quando não há imagens", () => {
    // Arrange

    // Act
    render(<CreateProductScreen />);

    // Assert
    expect(screen.getByText("0/4")).toBeTruthy();
    expect(screen.getByText("Adicionar foto")).toBeTruthy();
  });

  it("esconde o botão de adicionar foto quando o limite de imagens é atingido", () => {
    // Arrange
    mockCreateFormState({
      images: [{ uri: "a", name: "a.jpg" }, { uri: "b", name: "b.jpg" }, { uri: "c", name: "c.jpg" }, { uri: "d", name: "d.jpg" }],
    });

    // Act
    render(<CreateProductScreen />);

    // Assert
    expect(screen.getByText("4/4")).toBeTruthy();
    expect(screen.queryByText("Adicionar foto")).toBeNull();
  });

  it("abre a galeria ao tocar em Adicionar foto", () => {
    // Arrange
    const form = mockCreateFormState();

    // Act
    render(<CreateProductScreen />);
    fireEvent.press(screen.getByText("Adicionar foto"));

    // Assert
    expect(form.pickImages).toHaveBeenCalled();
  });

  it("remove uma imagem ao tocar no ícone de fechar", () => {
    // Arrange
    const form = mockCreateFormState({
      images: [{ uri: "uri-foto", name: "foto.jpg" }],
    });
    render(<CreateProductScreen />);

    // Act
    fireEvent.press(screen.getByText("ionicon-close-circle"));

    // Assert
    expect(form.removeImage).toHaveBeenCalledWith("uri-foto");
  });

  it("incrementa e decrementa a quantidade", () => {
    // Arrange
    const form = mockCreateFormState();
    render(<CreateProductScreen />);

    // Act
    fireEvent.press(screen.getByText("ionicon-remove"));
    fireEvent.press(screen.getAllByText("ionicon-add")[1]);

    // Assert
    expect(form.decrementQuantity).toHaveBeenCalled();
    expect(form.incrementQuantity).toHaveBeenCalled();
  });

  it("publica o produto e volta ao sucesso", () => {
    // Arrange
    const form = mockCreateFormState();
    form.handlePublish.mockImplementation(
      (onSuccess: (() => void) | undefined) => onSuccess?.()
    );
    render(<CreateProductScreen />);

    // Act
    fireEvent.press(screen.getByText("Publicar produto"));

    // Assert
    expect(form.handlePublish).toHaveBeenCalledWith(expect.any(Function));
    expect(mockedBack).toHaveBeenCalled();
  });

  it("mostra os erros do formulário e o banner de correção", () => {
    // Arrange
    mockCreateFormState({ errors: { name: "Nome é obrigatório" } });

    // Act
    render(<CreateProductScreen />);

    // Assert
    expect(screen.getByText("Nome é obrigatório")).toBeTruthy();
    expect(
      screen.getByText("Corrija os campos destacados antes de publicar o produto.")
    ).toBeTruthy();
  });

  it("mostra o indicador de progresso ao publicar", () => {
    // Arrange
    mockCreateFormState({ isSubmitting: true });

    // Act
    render(<CreateProductScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByText("Publicar produto")).toBeNull();
  });

  it("mostra a mensagem de submitError", () => {
    // Arrange
    mockCreateFormState({ submitError: true });

    // Act
    render(<CreateProductScreen />);

    // Assert
    expect(
      screen.getByText("Não foi possível publicar o produto. Tente novamente.")
    ).toBeTruthy();
  });

  it("mostra o aviso de imagens não enviadas", () => {
    // Arrange
    mockCreateFormState({ submitResult: { failedImages: 2, totalImages: 3 } });

    // Act
    render(<CreateProductScreen />);

    // Assert
    expect(
      screen.getByText(
        /Produto publicado, mas 2 de 3 foto\(s\) não puderam ser enviadas/
      )
    ).toBeTruthy();
  });

  it("abre o modal de categoria ao tocar na linha de seleção", () => {
    // Arrange
    const form = mockCreateFormState({
      category: null,
      categoryModalVisible: true,
    });
    render(<CreateProductScreen />);

    // Act
    fireEvent.press(screen.getByText("Selecione uma categoria"));

    // Assert
    expect(form.openCategoryModal).toHaveBeenCalled();
    expect(categoryModalProps?.visible).toBe(true);
    expect(categoryModalProps?.selectedCategory).toBeNull();
  });

  it("volta ao tocar no botão de voltar", () => {
    // Arrange
    render(<CreateProductScreen />);

    // Act
    fireEvent.press(screen.getByText("ionicon-chevron-back"));

    // Assert
    expect(mockedBack).toHaveBeenCalled();
  });

  it("chama os handlers do formulário ao editar os campos", () => {
    // Arrange
    const form = mockCreateFormState();
    render(<CreateProductScreen />);

    // Act
    fireEvent.changeText(
      screen.getByPlaceholderText("Ex: Tapioca Clássica"),
      "Tapioca"
    );
    fireEvent.changeText(screen.getByPlaceholderText("R$ 0,00"), "12,50");
    fireEvent.changeText(
      screen.getByPlaceholderText("Descreva o produto..."),
      "uma descrição"
    );

    // Assert
    expect(form.handleNameChange).toHaveBeenCalledWith("Tapioca");
    expect(form.handlePriceChange).toHaveBeenCalledWith("12,50");
    expect(form.handleDescriptionChange).toHaveBeenCalledWith("uma descrição");
  });
});
