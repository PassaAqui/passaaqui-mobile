import { ActivityIndicator } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import EditProductScreen from "@/src/features/shopkeeper/catalog/screens/EditProductScreen";
import { useEditProductForm } from "@/src/features/shopkeeper/products/hooks/useEditProductForm";

jest.mock(
  "@/src/features/shopkeeper/products/hooks/useEditProductForm",
  () => ({
    useEditProductForm: jest.fn(),
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
  useLocalSearchParams: jest.fn(),
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

type EditFormMock = {
  isLoadingProduct: boolean;
  isProductError: boolean;
  name: string;
  category: { id: number; name: string } | null;
  categoryModalVisible: boolean;
  description: string;
  price: string;
  quantity: number;
  active: boolean;
  highlight: boolean;
  existingImages: string[];
  newImages: SelectedImage[];
  errors: Record<string, string | undefined>;
  descriptionMaxLength: number;
  maxImages: number;
  totalImagesCount: number;
  isSubmitting: boolean;
  submitError: boolean;
  handleNameChange: jest.Mock;
  handleSelectCategory: jest.Mock;
  handleDescriptionChange: jest.Mock;
  handlePriceChange: jest.Mock;
  incrementQuantity: jest.Mock;
  decrementQuantity: jest.Mock;
  setActive: jest.Mock;
  setHighlight: jest.Mock;
  pickImages: jest.Mock;
  removeExistingImage: jest.Mock;
  removeNewImage: jest.Mock;
  handleSave: jest.Mock;
  openCategoryModal: jest.Mock;
  closeCategoryModal: jest.Mock;
};

const mockedUseEditProductForm = useEditProductForm as jest.MockedFunction<
  typeof useEditProductForm
>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockedBack = jest.fn();

function mockEditFormState(overrides: Partial<EditFormMock> = {}): EditFormMock {
  const form: EditFormMock = {
    isLoadingProduct: false,
    isProductError: false,
    name: "Café especial",
    category: { id: 3, name: "Café" },
    categoryModalVisible: false,
    description: "Delicioso café",
    price: "19,90",
    quantity: 10,
    active: true,
    highlight: false,
    existingImages: [],
    newImages: [],
    errors: {},
    descriptionMaxLength: 700,
    maxImages: 4,
    totalImagesCount: 0,
    isSubmitting: false,
    submitError: false,
    handleNameChange: jest.fn(),
    handleSelectCategory: jest.fn(),
    handleDescriptionChange: jest.fn(),
    handlePriceChange: jest.fn(),
    incrementQuantity: jest.fn(),
    decrementQuantity: jest.fn(),
    setActive: jest.fn(),
    setHighlight: jest.fn(),
    pickImages: jest.fn(),
    removeExistingImage: jest.fn(),
    removeNewImage: jest.fn(),
    handleSave: jest.fn(),
    openCategoryModal: jest.fn(),
    closeCategoryModal: jest.fn(),
    ...overrides,
  };

  mockedUseEditProductForm.mockReturnValue(
    form as unknown as ReturnType<typeof useEditProductForm>
  );
  return form;
}

describe("EditProductScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEditFormState();
    mockedUseRouter.mockReturnValue({ back: mockedBack } as unknown as ReturnType<
      typeof useRouter
    >);
    mockedUseLocalSearchParams.mockReturnValue({ id: "5" } as ReturnType<
      typeof useLocalSearchParams
    >);
    categoryModalProps = null;
  });

  it("mostra o indicador de loading enquanto carrega o produto", () => {
    // Arrange
    mockEditFormState({ isLoadingProduct: true });

    // Act
    render(<EditProductScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByText("Editar Produto")).toBeNull();
  });

  it("mostra o erro de carregamento e volta ao tocar em Voltar", () => {
    // Arrange
    mockEditFormState({ isProductError: true });

    // Act
    render(<EditProductScreen />);
    fireEvent.press(screen.getByText("Voltar"));

    // Assert
    expect(
      screen.getByText("Não foi possível carregar o produto")
    ).toBeTruthy();
    expect(mockedBack).toHaveBeenCalled();
  });

  it("renderiza o formulário preenchido", () => {
    // Arrange

    // Act
    render(<EditProductScreen />);

    // Assert
    expect(screen.getByText("Editar Produto")).toBeTruthy();
    expect(screen.getByDisplayValue("Café especial")).toBeTruthy();
    expect(screen.getByText("Café")).toBeTruthy();
    expect(screen.getByDisplayValue("19,90")).toBeTruthy();
    expect(screen.getByText("PREÇO")).toBeTruthy();
    expect(screen.getByText("QUANTIDADE *")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("VISIBILIDADE")).toBeTruthy();
    expect(screen.getByText("Produto ativo")).toBeTruthy();
    expect(screen.getByText("Destacar produto")).toBeTruthy();
    expect(screen.getByText("Salvar alterações")).toBeTruthy();
  });

  it("mostra o contador de imagens e o botão de adicionar foto quando há espaço", () => {
    // Arrange
    mockEditFormState({
      existingImages: ["uri-existente"],
      newImages: [{ uri: "uri-nova", name: "nova.jpg" }],
      totalImagesCount: 2,
    });

    // Act
    render(<EditProductScreen />);

    // Assert
    expect(screen.getByText("2/4")).toBeTruthy();
    expect(screen.getByText("NOVA")).toBeTruthy();
    expect(screen.getByText("Adicionar foto")).toBeTruthy();
  });

  it("esconde o botão de adicionar foto quando o limite de imagens é atingido", () => {
    // Arrange
    mockEditFormState({
      existingImages: ["a", "b", "c", "d"],
      totalImagesCount: 4,
    });

    // Act
    render(<EditProductScreen />);

    // Assert
    expect(screen.getByText("4/4")).toBeTruthy();
    expect(screen.queryByText("Adicionar foto")).toBeNull();
  });

  it("incrementa e decrementa a quantidade", () => {
    // Arrange
    const form = mockEditFormState({
      existingImages: ["a", "b", "c", "d"],
      totalImagesCount: 4,
    });
    render(<EditProductScreen />);

    // Act
    fireEvent.press(screen.getByText("ionicon-add"));
    fireEvent.press(screen.getByText("ionicon-remove"));

    // Assert
    expect(form.incrementQuantity).toHaveBeenCalled();
    expect(form.decrementQuantity).toHaveBeenCalled();
  });

  it("alterna os toggles de visibilidade", () => {
    // Arrange
    const form = mockEditFormState();
    render(<EditProductScreen />);

    // Act
    fireEvent.press(screen.getByText("Produto ativo"));
    fireEvent.press(screen.getByText("Destacar produto"));

    // Assert
    expect(form.setActive).toHaveBeenCalledWith(false);
    expect(form.setHighlight).toHaveBeenCalledWith(true);
  });

  it("salva as alterações e volta ao sucesso", () => {
    // Arrange
    const form = mockEditFormState();
    form.handleSave.mockImplementation(
      (onSuccess: (() => void) | undefined) => onSuccess?.()
    );
    render(<EditProductScreen />);

    // Act
    fireEvent.press(screen.getByText("Salvar alterações"));

    // Assert
    expect(form.handleSave).toHaveBeenCalledWith(expect.any(Function));
    expect(mockedBack).toHaveBeenCalled();
  });

  it("mostra os erros do formulário e o banner de correção", () => {
    // Arrange
    mockEditFormState({ errors: { name: "Nome é obrigatório" } });

    // Act
    render(<EditProductScreen />);

    // Assert
    expect(screen.getByText("Nome é obrigatório")).toBeTruthy();
    expect(
      screen.getByText(
        "Corrija os campos destacados antes de salvar as alterações."
      )
    ).toBeTruthy();
  });

  it("mostra a mensagem de submitError", () => {
    // Arrange
    mockEditFormState({ submitError: true });

    // Act
    render(<EditProductScreen />);

    // Assert
    expect(
      screen.getByText("Não foi possível salvar as alterações. Tente novamente.")
    ).toBeTruthy();
  });

  it("abre o modal de categoria ao tocar na linha de seleção", () => {
    // Arrange
    const form = mockEditFormState({
      category: null,
      categoryModalVisible: true,
    });
    render(<EditProductScreen />);

    // Act
    fireEvent.press(screen.getByText("Selecione uma categoria"));

    // Assert
    expect(form.openCategoryModal).toHaveBeenCalled();
    expect(categoryModalProps?.visible).toBe(true);
    expect(categoryModalProps?.selectedCategory).toBeNull();
  });

  it("remove imagens existente e nova ao tocar no ícone de fechar", () => {
    // Arrange
    const form = mockEditFormState({
      existingImages: ["uri-existente"],
      newImages: [{ uri: "uri-nova", name: "nova.jpg" }],
      totalImagesCount: 2,
    });
    render(<EditProductScreen />);
    const closeIcons = screen.getAllByText("ionicon-close-circle");

    // Act
    act(() => {
      fireEvent.press(closeIcons[0]);
    });
    act(() => {
      fireEvent.press(closeIcons[1]);
    });

    // Assert
    expect(form.removeExistingImage).toHaveBeenCalledWith(0);
    expect(form.removeNewImage).toHaveBeenCalledWith("uri-nova");
  });
});