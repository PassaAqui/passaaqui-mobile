import { fireEvent, render, screen } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import type { LocationObject } from "expo-location";
import MapScreen from "@/src/features/user/map/screens/MapScreen";
import { useMapScreen } from "@/src/features/user/map/hooks/useMapScreen";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { Map, Marker } from "@maplibre/maplibre-react-native";
import { poiNearby, storePoi } from "@/src/features/user/map/__tests__/fixtures/map";

jest.mock("@maplibre/maplibre-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Map = React.forwardRef(
    ({ children, ...props }: any, _ref: unknown) => (
      <View {...props}>{children}</View>
    )
  );
  Map.displayName = "Map";
  return {
    __esModule: true,
    Map,
    Camera: React.forwardRef(
      ({ children, ...props }: any, _ref: unknown) => (
        <View {...props}>{children}</View>
      )
    ),
    Marker: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    GeoJSONSource: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Layer: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

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

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
    useSafeAreaInsets: jest.fn(() => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    })),
  };
});

jest.mock("expo-router", () => {
  const { View } = require("react-native");
  return {
    Link: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock("@/src/features/user/map/hooks/useMapScreen", () => ({
  useMapScreen: jest.fn(),
}));

jest.mock("@/src/features/user/auth/hooks/useTouristMe", () => ({
  useTouristMe: jest.fn(),
}));

const mockUseMapScreen = useMapScreen as jest.MockedFunction<typeof useMapScreen>;
const mockUseTouristMe = useTouristMe as jest.MockedFunction<typeof useTouristMe>;

const baseLocation: LocationObject = {
  coords: { latitude: -8.0675, longitude: -34.9167 },
  timestamp: 0,
} as LocationObject;

const baseMock = {
  location: baseLocation,
  loadingRoute: false,
  cameraRef: {
    current: {
      easeTo: jest.fn(),
    },
  },
  mapRef: {
    current: {},
  },
  mapReady: false,
  setMapReady: jest.fn(),
  gpsActive: true,
  isFollowing: true,
  setIsFollowing: jest.fn(),
  enableAutoFollow: jest.fn(),
  disableAutoFollow: jest.fn(),
  mapCenter: null,
  setMapCenter: jest.fn(),
  locomotionMode: null,
  setLocomotionMode: jest.fn(),
  setOpenTouristPOIMarker: jest.fn(),
  openTouristPOIMarker: null,
  setOpenShopPOIMarker: jest.fn(),
  openShopPOIMarker: null,
  setOpenPOIMarker: jest.fn(),
  touristPois: [],
  shopPois: [],
  routeCoords: [],
  setRouteCoords: jest.fn(),
  stop: false,
  setStop: jest.fn(),
  showAlertModal: false,
  setShowAlertModal: jest.fn(),
  handleNavigation: jest.fn(),
  setShowStopConfirmation: jest.fn(),
  showStopConfirmation: false,
  handleStopNavigation: jest.fn(),
  showSwitchDestinationModal: false,
  confirmSwitchDestination: jest.fn(),
  cancelSwitchDestination: jest.fn(),
  cityToShow: null,
  dismissCity: jest.fn(),
  loadingCity: false,
  checkinReward: null,
  setCheckinReward: jest.fn(),
  simulating: false,
  startSimulation: jest.fn(),
  stopSimulation: jest.fn(),
  currentSimPosition: null,
};

describe("MapScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTouristMe.mockReturnValue({ data: { id: 1, name: "Ana", currentXP: 120 } } as any);
    mockUseMapScreen.mockReturnValue(baseMock as any);
  });

  function mockMapScreen(overrides: Partial<Record<string, unknown>> = {}) {
    mockUseMapScreen.mockReturnValue({
      ...baseMock,
      ...overrides,
    } as any);
  }

  it("renderiza o nome do usuário e o XP no header", () => {
    // Arrange
    render(<MapScreen />);

    // Act
    const name = screen.getByText("Ana");
    const xp = screen.getByText("120 XP");

    // Assert
    expect(name).toBeTruthy();
    expect(xp).toBeTruthy();
  });

  it("renderiza os markers dos POIs turísticos e lojas", () => {
    // Arrange
    mockMapScreen({ touristPois: [poiNearby], shopPois: [storePoi] });

    // Act
    render(<MapScreen />);
    const markers = screen.UNSAFE_getAllByType(Marker);

    // Assert
    // 1 user marker + 1 tourist POI + 1 shop POI = 3
    expect(markers).toHaveLength(3);
  });

  it("mostra o ActivityIndicator quando loadingRoute é true", () => {
    // Arrange
    mockMapScreen({ loadingRoute: true });

    // Act
    render(<MapScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("chama enableAutoFollow ao pressionar SEGUIR", () => {
    // Arrange
    mockMapScreen({ isFollowing: false, stop: false });
    render(<MapScreen />);

    // Act
    fireEvent.press(screen.getByText("SEGUIR"));

    // Assert
    expect(mockUseMapScreen().enableAutoFollow).toHaveBeenCalledTimes(1);
  });

  it("mostra o botão PARAR com stop true e abre a confirmação ao pressionar", () => {
    // Arrange
    mockMapScreen({ stop: true });
    render(<MapScreen />);

    // Act
    fireEvent.press(screen.getByText("PARAR"));

    // Assert
    expect(screen.getByText("PARAR")).toBeTruthy();
    expect(mockUseMapScreen().setShowStopConfirmation).toHaveBeenCalledWith(true);
  });

  it("renderiza o OutsideRegionModal quando showAlertModal é true", () => {
    // Arrange
    mockMapScreen({ showAlertModal: true });
    render(<MapScreen />);

    // Assert
    expect(screen.getByText(/Parece que você está longe de Recife/)).toBeTruthy();
  });

  it("renderiza o postal da cidade e fecha ao pressionar ✕", () => {
    // Arrange
    mockMapScreen({
      cityToShow: {
        cityId: 9,
        cityName: "Recife",
        chronicle: "A Veneza brasileira",
        cityImage: "https://cdn.example.com/recife.jpg",
      },
    });

    // Act
    render(<MapScreen />);
    fireEvent.press(screen.getByText("✕"));

    // Assert
    expect(screen.getAllByText("Recife")).toHaveLength(2);
    expect(mockUseMapScreen().dismissCity).toHaveBeenCalledTimes(1);
  });

  it("renderiza o CheckinRewardModal com o XP ganho", () => {
    // Arrange
    mockMapScreen({ checkinReward: { xp: 50 } });
    render(<MapScreen />);

    // Assert
    expect(screen.getByText("+50 XP")).toBeTruthy();
  });

  it("renderiza o GpsDisabledModal quando gpsActive é false", () => {
    // Arrange
    mockMapScreen({ gpsActive: false });
    render(<MapScreen />);

    // Assert
    expect(screen.getByText("Ir até as configurações")).toBeTruthy();
  });

  it("ao arrastar o mapa, chama setMapCenter e disableAutoFollow", () => {
    // Arrange
    render(<MapScreen />);

    // Act
    // MapLibre onRegionDidChange recebe NativeSyntheticEvent com nativeEvent.userInteraction e center [lng, lat]
    fireEvent(
      screen.UNSAFE_getByType(Map),
      "regionDidChange",
      {
        nativeEvent: {
          userInteraction: true,
          center: [-34.87, -8.06],
        },
      }
    );

    // Assert
    expect(mockUseMapScreen().disableAutoFollow).toHaveBeenCalledTimes(1);
    expect(mockUseMapScreen().setMapCenter).toHaveBeenCalledWith({
      latitude: -8.06,
      longitude: -34.87,
    });
    // Arrastar o mapa nunca deve alterar o modo de locomoção
    expect(mockUseMapScreen().setLocomotionMode).not.toHaveBeenCalled();
  });

  it("não captura o centro do mapa quando o movimento não é um gesto", () => {
    // Arrange
    render(<MapScreen />);

    // Act
    fireEvent(
      screen.UNSAFE_getByType(Map),
      "regionDidChange",
      {
        nativeEvent: {
          userInteraction: false,
          center: [-34.87, -8.06],
        },
      }
    );

    // Assert
    expect(mockUseMapScreen().setMapCenter).not.toHaveBeenCalled();
  });

  it("abre o TouristSpotPOI e navega ao escolher o modo", () => {
    // Arrange
    mockMapScreen({ openTouristPOIMarker: poiNearby });
    render(<MapScreen />);

    // Act
    fireEvent.press(screen.getByText("Ir agora"));
    fireEvent.press(screen.getByText("A pé"));

    // Assert
    expect(screen.getByText("Marco Zero")).toBeTruthy();
    expect(screen.getByText("Praça histórica do Recife")).toBeTruthy();
    expect(mockUseMapScreen().handleNavigation).toHaveBeenCalledWith(
      { latitude: -8.0632, longitude: -34.8711 },
      "foot-walking",
      1
    );
    // Selecionar o modo no LocomotionMode atualiza o modo de busca de POIs
    expect(mockUseMapScreen().setLocomotionMode).toHaveBeenCalledWith("foot-walking");
  });
});
