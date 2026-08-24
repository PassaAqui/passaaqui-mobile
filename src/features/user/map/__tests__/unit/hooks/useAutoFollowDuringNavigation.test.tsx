import { act, renderHook } from "@testing-library/react-native";
import type { RefObject } from "react";
import MapView from "react-native-maps";
import { useAutoFollowDuringNavigation, UseAutoFollowDuringNavigationProps } from "@/src/features/user/map/hooks/useAutoFollowDuringNavigation";

jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MapView = React.forwardRef(
    ({ children, ...props }: any, _ref: unknown) => (
      <View {...props}>{children}</View>
    )
  );
  MapView.displayName = "MapView";
  return {
    __esModule: true,
    default: MapView,
  };
});

const animateCamera = jest.fn();
const mapRef = {
  current: { animateCamera },
} as unknown as RefObject<MapView | null>;

describe("useAutoFollowDuringNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("anima câmera quando navegação ativa, posição e mapRef existem", () => {
    const userPosition = { latitude: -8.06, longitude: -34.87 };
    renderHook(() =>
      useAutoFollowDuringNavigation({
        userPosition,
        mapRef,
        isNavigationActive: true,
      })
    );

    expect(animateCamera).toHaveBeenCalledTimes(1);
    expect(animateCamera).toHaveBeenCalledWith({
      center: { latitude: -8.06, longitude: -34.87 },
    });
  });

  it("não anima quando navegação inativa", () => {
    const userPosition = { latitude: -8.06, longitude: -34.87 };
    renderHook(() =>
      useAutoFollowDuringNavigation({
        userPosition,
        mapRef,
        isNavigationActive: false,
      })
    );

    expect(animateCamera).not.toHaveBeenCalled();
  });

  it("não anima quando userPosition é null", () => {
    renderHook(() =>
      useAutoFollowDuringNavigation({
        userPosition: null,
        mapRef,
        isNavigationActive: true,
      })
    );

    expect(animateCamera).not.toHaveBeenCalled();
  });

  it("não anima quando mapRef.current é null", () => {
    const userPosition = { latitude: -8.06, longitude: -34.87 };
    const nullMapRef = { current: null } as unknown as RefObject<MapView | null>;

    renderHook(() =>
      useAutoFollowDuringNavigation({
        userPosition,
        mapRef: nullMapRef,
        isNavigationActive: true,
      })
    );

    expect(animateCamera).not.toHaveBeenCalled();
  });

  it("atualiza animação quando userPosition muda", () => {
    const { rerender } = renderHook(
      ({ userPosition }: { userPosition: UseAutoFollowDuringNavigationProps['userPosition'] }) =>
        useAutoFollowDuringNavigation({
          userPosition,
          mapRef,
          isNavigationActive: true,
        }),
      { initialProps: { userPosition: { latitude: -8.06, longitude: -34.87 } } }
    );

    expect(animateCamera).toHaveBeenCalledTimes(1);

    rerender({ userPosition: { latitude: -8.07, longitude: -34.88 } });

    expect(animateCamera).toHaveBeenCalledTimes(2);
    expect(animateCamera).toHaveBeenLastCalledWith({
      center: { latitude: -8.07, longitude: -34.88 },
    });
  });

  it("não anima quando isNavigationActive muda para false", () => {
    const { rerender } = renderHook(
      ({ isNavigationActive }: { isNavigationActive: boolean }) =>
        useAutoFollowDuringNavigation({
          userPosition: { latitude: -8.06, longitude: -34.87 },
          mapRef,
          isNavigationActive,
        }),
      { initialProps: { isNavigationActive: true } }
    );

    expect(animateCamera).toHaveBeenCalledTimes(1);

    rerender({ isNavigationActive: false });

    expect(animateCamera).toHaveBeenCalledTimes(1);
  });
});