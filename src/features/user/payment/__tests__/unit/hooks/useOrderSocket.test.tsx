import { act, renderHook } from "@testing-library/react-native";
import type { IMessage } from "@stomp/stompjs";
import { useOrderSocket } from "@/src/features/user/payment/hooks/useOrderSocket";
import { subscribeTopic } from "@/src/services/socket/stompClient";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";
import {
  order,
  orderStatusUpdate,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

jest.mock("@/src/services/socket/stompClient", () => ({
  subscribeTopic: jest.fn(),
}));

const mockedSubscribeTopic = subscribeTopic as jest.MockedFunction<typeof subscribeTopic>;

describe("useOrderSocket", () => {
  let onStatusChange: jest.Mock;
  let savedCallback: ((message: IMessage) => void) | null = null;
  let savedCleanup: jest.Mock;

  function fakeMessage(body: string) {
    return { body } as IMessage;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    useOrderStore.setState({ order: null });
    onStatusChange = jest.fn();
    savedCallback = null;
    savedCleanup = jest.fn();
    // captura o callback e o cleanup retornado (simula mensagens e valida unmount)
    mockedSubscribeTopic.mockImplementation((_topic: string, callback) => {
      savedCallback = callback;
      return savedCleanup;
    });
  });

  afterEach(() => {
    useOrderStore.setState({ order: null });
  });

  it("não assina o tópico sem orderId", () => {
    // Act
    renderHook(() => useOrderSocket(undefined, onStatusChange));

    // Assert
    expect(mockedSubscribeTopic).not.toHaveBeenCalled();
  });

  it("assina o tópico /topic/orders/ord-1 quando orderId é informado", () => {
    // Act
    renderHook(() => useOrderSocket("ord-1", onStatusChange));

    // Assert
    expect(mockedSubscribeTopic).toHaveBeenCalledWith(
      "/topic/orders/ord-1",
      expect.any(Function)
    );
  });

  it("atualiza o store e chama onStatusChange ao receber mensagem", () => {
    // Arrange
    useOrderStore.setState({ order });
    renderHook(() => useOrderSocket("ord-1", onStatusChange));

    // Act
    act(() => {
      savedCallback?.(fakeMessage(JSON.stringify(orderStatusUpdate)));
    });

    // Assert
    expect(useOrderStore.getState().order?.status).toBe("PAID");
    expect(useOrderStore.getState().order?.pickupCode).toBe("AB1020");
    expect(onStatusChange).toHaveBeenCalledWith(orderStatusUpdate);
  });

  it("atualiza o store sem onStatusChange sem lançar", () => {
    // Arrange
    useOrderStore.setState({ order });
    renderHook(() => useOrderSocket("ord-1"));

    // Act
    act(() => {
      savedCallback?.(fakeMessage(JSON.stringify(orderStatusUpdate)));
    });

    // Assert
    expect(useOrderStore.getState().order?.status).toBe("PAID");
  });

  it("chama o cleanup retornado pelo subscribeTopic no unmount", () => {
    // Act
    const { unmount } = renderHook(() => useOrderSocket("ord-1", onStatusChange));
    unmount();

    // Assert
    expect(savedCleanup).toHaveBeenCalledTimes(1);
  });

  it("faz cleanup anterior e assina novo tópico quando orderId muda", () => {
    // Act
    const { rerender } = renderHook(
      ({ orderId }: { orderId: string | undefined }) =>
        useOrderSocket(orderId, onStatusChange),
      { initialProps: { orderId: "ord-1" } }
    );
    rerender({ orderId: "ord-2" });

    // Assert
    expect(savedCleanup).toHaveBeenCalledTimes(1);
    expect(mockedSubscribeTopic).toHaveBeenCalledTimes(2);
    expect(mockedSubscribeTopic).toHaveBeenLastCalledWith(
      "/topic/orders/ord-2",
      expect.any(Function)
    );
  });
});