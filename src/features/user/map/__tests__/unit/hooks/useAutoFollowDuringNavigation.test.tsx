import { act, renderHook } from "@testing-library/react-native";
import type { RefObject } from "react";
import type { CameraRef } from "@maplibre/maplibre-react-native";
import { useAutoFollowDuringNavigation, UseAutoFollowDuringNavigationProps } from "@/src/features/user/map/hooks/useAutoFollowDuringNavigation";

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

const easeTo = jest.fn();
const cameraRef = {
  current: { easeTo },
} as unknown as RefObject<CameraRef | null>;

describe("useAutoFollowDuringNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("anima câmera quando navegação ativa, posição e cameraRef existem", () => {
    const userPosition = { latitude: -8.06, longitude: -34.87 };
    renderHook(() =>
      useAutoFollowDuringNavigation({
        userPosition,
        cameraRef,
        isNavigationActive: true,
      })
    );

    expect(easeTo).toHaveBeenCalledTimes(1);
    expect(easeTo).toHaveBeenCalledWith({
      center: [-34.87, -8.06],
    });
  });

  it("não anima quando navegação inativa", () => {
    const userPosition = { latitude: -8.06, longitude: -34.87 };
    renderHook(() =>
      useAutoFollowDuringNavigation({
        userPosition,
        cameraRef,
        isNavigationActive: false,
      })
    );

    expect(easeTo).not.toHaveBeenCalled();
  });

  it("não anima quando userPosition é null", () => {
    renderHook(() =>
      useAutoFollowDuringNavigation({
        userPosition: null,
        cameraRef,
        isNavigationActive: true,
      })
    );

    expect(easeTo).not.toHaveBeenCalled();
  });

  it("não anima quando cameraRef.current é null", () => {
    const userPosition = { latitude: -8.06, longitude: -34.87 };
    const nullCameraRef = { current: null } as unknown as RefObject<CameraRef | null>;

    renderHook(() =>
      useAutoFollowDuringNavigation({
        userPosition,
        cameraRef: nullCameraRef,
        isNavigationActive: true,
      })
    );

    expect(easeTo).not.toHaveBeenCalled();
  });

  it("atualiza animação quando userPosition muda", () => {
    const { rerender } = renderHook(
      ({ userPosition }: { userPosition: UseAutoFollowDuringNavigationProps['userPosition'] }) =>
        useAutoFollowDuringNavigation({
          userPosition,
          cameraRef,
          isNavigationActive: true,
        }),
      { initialProps: { userPosition: { latitude: -8.06, longitude: -34.87 } } }
    );

    expect(easeTo).toHaveBeenCalledTimes(1);

    rerender({ userPosition: { latitude: -8.07, longitude: -34.88 } });

    expect(easeTo).toHaveBeenCalledTimes(2);
    expect(easeTo).toHaveBeenLastCalledWith({
      center: [-34.88, -8.07],
    });
  });

  it("não anima quando isNavigationActive muda para false", () => {
    const { rerender } = renderHook(
      ({ isNavigationActive }: { isNavigationActive: boolean }) =>
        useAutoFollowDuringNavigation({
          userPosition: { latitude: -8.06, longitude: -34.87 },
          cameraRef,
          isNavigationActive,
        }),
      { initialProps: { isNavigationActive: true } }
    );

    expect(easeTo).toHaveBeenCalledTimes(1);

    rerender({ isNavigationActive: false });

    expect(easeTo).toHaveBeenCalledTimes(1);
  });
});
