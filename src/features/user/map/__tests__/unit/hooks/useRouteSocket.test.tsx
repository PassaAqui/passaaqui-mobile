import { act, renderHook } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { useRouteSocket } from "@/src/features/user/map/hooks/useRouteSocket";
import { connectStomp, disconnectStomp } from "@/src/services/socket/stompClient";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";

jest.mock("@/src/services/socket/stompClient", () => ({
  connectStomp: jest.fn(),
  disconnectStomp: jest.fn(),
}));

jest.mock("@/src/features/user/auth/hooks/useTouristMe", () => ({
  useTouristMe: jest.fn(),
}));

const mockedConnectStomp = connectStomp as jest.MockedFunction<typeof connectStomp>;
const mockedDisconnectStomp = disconnectStomp as jest.MockedFunction<typeof disconnectStomp>;
const mockedUseTouristMe = useTouristMe as jest.MockedFunction<typeof useTouristMe>;

interface FakeMessage {
  body: string;
}

describe("useRouteSocket", () => {
  let client: QueryClient;
  let onCheckin: jest.Mock;
  let onRouteEnded: jest.Mock;
  // Callbacks capturados do mock do stompClient (invocados após o connectStomp
  // retornar — se onConnected fosse chamado dentro do mock, o `const client`
  // do hook ainda estaria em temporal dead zone).
  let connectedCallback: (() => void) | null;
  let poiCallback: ((message: FakeMessage) => void) | null;
  let routeCallback: ((message: FakeMessage) => void) | null;
  let subscribeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    connectedCallback = null;
    poiCallback = null;
    routeCallback = null;
    subscribeMock = jest.fn((topic: string, cb: (message: FakeMessage) => void) => {
      if (topic.endsWith("/queue/poi")) poiCallback = cb;
      if (topic.endsWith("/queue/route")) routeCallback = cb;
    });
    mockedConnectStomp.mockImplementation((onConnected) => {
      connectedCallback = onConnected ?? null;
      return { subscribe: subscribeMock } as any;
    });
    onCheckin = jest.fn();
    onRouteEnded = jest.fn();
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    client.clear();
  });

  function renderWithQuery() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    return renderHook(() => useRouteSocket({ onCheckin, onRouteEnded }), { wrapper });
  }

  it("sem user.id, não conecta ao stomp", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: {} } as any);

    // Act
    renderWithQuery();

    // Assert
    expect(mockedConnectStomp).not.toHaveBeenCalled();
  });

  it("com user.id, conecta e assina os tópicos de poi e route", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { id: 5 } } as any);

    // Act
    renderWithQuery();
    act(() => connectedCallback?.());

    // Assert
    expect(mockedConnectStomp).toHaveBeenCalledTimes(1);
    expect(subscribeMock).toHaveBeenCalledWith("/user/5/queue/poi", expect.any(Function));
    expect(subscribeMock).toHaveBeenCalledWith("/user/5/queue/route", expect.any(Function));
  });

  it("recebe checkin-result com XP > 0, soma ao cache e chama onCheckin", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { id: 5 } } as any);
    client.setQueryData(["tourist-me"], { currentXP: 100 });

    // Act
    renderWithQuery();
    act(() => connectedCallback?.());
    act(() => {
      poiCallback?.({
        body: JSON.stringify({
          action: "checkin-result",
          data: { xp_concedido: 50, motivo_bloqueio: null },
        }),
      });
    });

    // Assert
    expect(client.getQueryData(["tourist-me"])).toEqual({ currentXP: 150 });
    expect(onCheckin).toHaveBeenCalledWith({ xp_concedido: 50, motivo_bloqueio: null });
  });

  it("recebe checkin-result com XP = 0, não chama onCheckin nem altera o cache", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { id: 5 } } as any);
    client.setQueryData(["tourist-me"], { currentXP: 100 });

    // Act
    renderWithQuery();
    act(() => connectedCallback?.());
    act(() => {
      poiCallback?.({
        body: JSON.stringify({
          action: "checkin-result",
          data: { xp_concedido: 0, motivo_bloqueio: "cidade repetida" },
        }),
      });
    });

    // Assert
    expect(onCheckin).not.toHaveBeenCalled();
    expect(client.getQueryData(["tourist-me"])).toEqual({ currentXP: 100 });
  });

  it("recebe route-ended e chama onRouteEnded", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { id: 5 } } as any);

    // Act
    renderWithQuery();
    act(() => connectedCallback?.());
    act(() => {
      routeCallback?.({ body: JSON.stringify({ action: "route-ended", data: "" }) });
    });

    // Assert
    expect(onRouteEnded).toHaveBeenCalled();
  });

  it("ignora mensagens com outra action", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { id: 5 } } as any);

    // Act
    renderWithQuery();
    act(() => connectedCallback?.());
    act(() => {
      poiCallback?.({
        body: JSON.stringify({ action: "checkin-rejected", data: { xp_concedido: 50 } }),
      });
    });
    act(() => {
      routeCallback?.({ body: JSON.stringify({ action: "route-updated", data: "x" }) });
    });

    // Assert
    expect(onCheckin).not.toHaveBeenCalled();
    expect(onRouteEnded).not.toHaveBeenCalled();
  });

  it("desconecta no unmount", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { id: 1 } } as any);

    // Act
    const { unmount } = renderWithQuery();
    expect(mockedConnectStomp).toHaveBeenCalledTimes(1);
    unmount();

    // Assert
    expect(mockedDisconnectStomp).toHaveBeenCalledTimes(1);
  });

  it("reconecta quando o user.id muda (subscribedRef reseta)", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { id: 1 } } as any);

    // Act
    const { rerender } = renderWithQuery();
    expect(mockedConnectStomp).toHaveBeenCalledTimes(1);

    mockedUseTouristMe.mockReturnValue({ data: { id: 2 } } as any);
    rerender(undefined);

    // Assert
    expect(mockedDisconnectStomp).toHaveBeenCalledTimes(1); // cleanup do efeito anterior
    expect(mockedConnectStomp).toHaveBeenCalledTimes(2);
  });
});
