import { fireEvent, render, screen } from "@testing-library/react-native";
import AnimatedPostcardModal from "@/src/features/user/map/postcard/components/AnimatedPostcardModal";

jest.mock("react-native-reanimated", () => {
  const { View, Text, Image, ScrollView, FlatList } = require("react-native");
  const id = <T,>(value: T) => value;
  const noop = () => undefined;
  const makeSharedValue = (init: unknown) => ({ value: init });
  return {
    __esModule: true,
    default: {
      View,
      Text,
      Image,
      ScrollView,
      FlatList,
      createAnimatedComponent: id,
    },
    useSharedValue: makeSharedValue,
    useAnimatedStyle: (processor: () => unknown) => processor(),
    useAnimatedReaction: noop,
    withTiming: (
      toValue: unknown,
      _config?: unknown,
      callback?: (finished: boolean) => void
    ) => {
      callback?.(true);
      return toValue;
    },
    withSpring: (
      toValue: unknown,
      _config?: unknown,
      callback?: (finished: boolean) => void
    ) => {
      callback?.(true);
      return toValue;
    },
    runOnJS: id,
    runOnUI: id,
    interpolate: noop,
    interpolateColor: noop,
    Extrapolation: { CLAMP: "clamp", EXTEND: "extend" },
    Easing: {
      linear: id,
      ease: id,
      quad: id,
      cubic: id,
      poly: id,
      sin: id,
      circle: id,
      exp: id,
      elastic: id,
      back: id,
      bounce: id,
      steps: id,
      bezier: () => ({ factory: id }),
      bezierFn: id,
      in: id,
      out: id,
      inOut: id,
    },
  };
});

const defaultProps = {
  cityImage: "https://cdn.example.com/recife.jpg",
  cityName: "Recife",
  chronicle: "A Veneza brasileira",
};

describe("AnimatedPostcardModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza null quando visible é false", () => {
    // Arrange
    render(<AnimatedPostcardModal visible={false} onClose={onClose} {...defaultProps} />);

    // Act
    const postalLabel = screen.queryByText("POSTAL DA CIDADE");
    const close = screen.queryByText("✕");

    // Assert
    expect(postalLabel).toBeNull();
    expect(close).toBeNull();
  });

  it("renderiza frente e verso do postal quando visible é true", () => {
    // Arrange
    render(<AnimatedPostcardModal visible onClose={onClose} {...defaultProps} />);

    // Act
    const cityNames = screen.getAllByText("Recife");
    const chronicle = screen.getByText("A Veneza brasileira");

    // Assert
    expect(cityNames).toHaveLength(2);
    expect(chronicle).toBeTruthy();
  });

  it("chama onClose ao pressionar o botão de fechar", () => {
    // Arrange
    render(<AnimatedPostcardModal visible onClose={onClose} {...defaultProps} />);

    // Act
    fireEvent.press(screen.getByText("✕"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("vira o cartão ao pressionar quando pode virar, sem lançar erro", () => {
    // Arrange
    render(<AnimatedPostcardModal visible onClose={onClose} {...defaultProps} />);

    // Act
    fireEvent.press(screen.getByText("POSTAL DA CIDADE"));

    // Assert
    expect(onClose).not.toHaveBeenCalled();
  });

  it("esconde o postal quando visible muda para false", () => {
    // Arrange
    const { rerender } = render(
      <AnimatedPostcardModal visible onClose={onClose} {...defaultProps} />
    );
    expect(screen.getByText("POSTAL DA CIDADE")).toBeTruthy();

    // Act
    rerender(<AnimatedPostcardModal visible={false} onClose={onClose} {...defaultProps} />);

    // Assert
    expect(screen.queryByText("POSTAL DA CIDADE")).toBeNull();
  });
});
