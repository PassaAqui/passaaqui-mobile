jest.mock("@stomp/stompjs", () => ({
  Client: jest.fn(),
}));

jest.mock("@/src/stores/user/auth/authStore", () => ({
  useAuthStore: { getState: jest.fn() },
}));

type StompConfig = {
  brokerURL?: string;
  connectHeaders?: { Authorization?: string };
  reconnectDelay?: number;
  onConnect?: () => void;
  onStompError?: (frame: { headers: Record<string, string>; body: string }) => void;
};

type MockClientInstance = {
  config: StompConfig;
  activate: jest.Mock;
  deactivate: jest.Mock;
  subscribe: jest.Mock;
  connected: boolean;
};

// O WS_URL é lido no carregamento do módulo (const em stompClient.ts). Para
// controlar o EXPO_PUBLIC_WS_URL, o módulo é recarregado em cada teste via
// jest.resetModules() + require, após setar a variável de ambiente.
let stompClient: typeof import("@/src/services/socket/stompClient");
let MockClient: jest.Mock;
let mockedGetState: jest.Mock;
let clientInstances: MockClientInstance[];

const ORIGINAL_WS_URL = process.env.EXPO_PUBLIC_WS_URL;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_WS_URL = "wss://ws.test.com";
  jest.resetModules();

  // require() é intencional aqui: o módulo precisa ser recarregado após
  // jest.resetModules() para que o EXPO_PUBLIC_WS_URL (lido no load) seja
  // controlado por teste. Import estático não permitiria isso.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  stompClient = require("@/src/services/socket/stompClient");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  MockClient = require("@stomp/stompjs").Client as jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  mockedGetState = require("@/src/stores/user/auth/authStore").useAuthStore
    .getState as jest.Mock;

  clientInstances = [];
  MockClient.mockImplementation(function (
    this: MockClientInstance,
    config: StompConfig
  ) {
    this.config = config;
    this.activate = jest.fn();
    this.deactivate = jest.fn();
    this.subscribe = jest.fn();
    this.connected = false;
    clientInstances.push(this);
  });

  mockedGetState.mockReturnValue({ accessToken: null });

  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  stompClient.disconnectStomp();
  if (ORIGINAL_WS_URL === undefined) {
    delete process.env.EXPO_PUBLIC_WS_URL;
  } else {
    process.env.EXPO_PUBLIC_WS_URL = ORIGINAL_WS_URL;
  }
});

describe("stompClient", () => {
  describe("connectStomp", () => {
    it("sem accessToken, retorna null e não instancia o Client", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: null });

      // Act
      const result = stompClient.connectStomp();

      // Assert
      expect(result).toBeNull();
      expect(MockClient).not.toHaveBeenCalled();
    });

    it("com accessToken, cria o Client com brokerURL, Authorization e reconnectDelay", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });

      // Act
      const result = stompClient.connectStomp();

      // Assert
      expect(MockClient).toHaveBeenCalledTimes(1);
      const instance = clientInstances[0];
      expect(instance.config.brokerURL).toBe("wss://ws.test.com");
      expect(instance.config.connectHeaders).toEqual({
        Authorization: "Bearer token-123",
      });
      expect(instance.config.reconnectDelay).toBe(3000);
      expect(instance.activate).toHaveBeenCalledTimes(1);
      expect(result).toBe(instance);
    });

    it("invoca o onConnected recebido quando o broker conecta (onConnect)", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });
      const onConnected = jest.fn();

      // Act
      stompClient.connectStomp(onConnected);
      clientInstances[0].config.onConnect?.();

      // Assert
      expect(onConnected).toHaveBeenCalledTimes(1);
    });
  });

  describe("disconnectStomp", () => {
    it("desativa o client ativo e zera o singleton", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });
      stompClient.connectStomp();
      const instance = clientInstances[0];

      // Act
      stompClient.disconnectStomp();

      // Assert
      expect(instance.deactivate).toHaveBeenCalledTimes(1);
      expect(stompClient.getStompClient()).toBeNull();
    });

    it("após desconectar, o próximo connectStomp cria uma instância nova", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });
      stompClient.connectStomp();
      const first = clientInstances[0];
      stompClient.disconnectStomp();

      // Act
      stompClient.connectStomp();

      // Assert
      expect(MockClient).toHaveBeenCalledTimes(2);
      expect(clientInstances[1]).not.toBe(first);
    });
  });

  describe("getStompClient", () => {
    it("retorna null antes de conectar", () => {
      // Act
      const result = stompClient.getStompClient();

      // Assert
      expect(result).toBeNull();
    });

    it("retorna a instância atual após connectStomp", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });

      // Act
      stompClient.connectStomp();

      // Assert
      expect(stompClient.getStompClient()).toBe(clientInstances[0]);
    });
  });

  describe("subscribeTopic", () => {
    it("com client conectado, assina o tópico com o callback", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });
      stompClient.connectStomp();
      clientInstances[0].connected = true;
      const callback = jest.fn();

      // Act
      stompClient.subscribeTopic("/user/5/queue/poi", callback);

      // Assert
      expect(clientInstances[0].subscribe).toHaveBeenCalledTimes(1);
      expect(clientInstances[0].subscribe).toHaveBeenCalledWith(
        "/user/5/queue/poi",
        callback
      );
    });

    it("o cleanup dá unsubscribe sem desconectar (conexão compartilhada)", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });
      stompClient.connectStomp();
      const instance = clientInstances[0];
      instance.connected = true;
      const subscription = { unsubscribe: jest.fn() };
      instance.subscribe.mockReturnValue(subscription);

      // Act
      const cleanup = stompClient.subscribeTopic("/user/5/queue/poi", jest.fn());
      cleanup();

      // Assert
      expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
      expect(instance.deactivate).not.toHaveBeenCalled();
      expect(stompClient.getStompClient()).toBe(instance);
    });

    it("sem client, chama connectStomp internamente e aguarda a conexão para assinar", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });

      // Act
      stompClient.subscribeTopic("/user/5/queue/route", jest.fn());

      // Assert
      expect(MockClient).toHaveBeenCalledTimes(1);
      expect(clientInstances[0].activate).toHaveBeenCalledTimes(1);
      expect(clientInstances[0].subscribe).not.toHaveBeenCalled();
    });

    it("quando o broker conecta após subscribeTopic, assina o tópico com o callback", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });
      const callback = jest.fn();

      // Act
      stompClient.subscribeTopic("/user/5/queue/route", callback);
      clientInstances[0].config.onConnect?.();

      // Assert
      expect(clientInstances[0].subscribe).toHaveBeenCalledWith(
        "/user/5/queue/route",
        callback
      );
    });

    it("quando o subscribeTopic cria a conexão, o cleanup desconecta", () => {
      // Arrange
      mockedGetState.mockReturnValue({ accessToken: "token-123" });

      // Act
      const cleanup = stompClient.subscribeTopic("/user/5/queue/route", jest.fn());
      cleanup();

      // Assert
      expect(clientInstances[0].deactivate).toHaveBeenCalledTimes(1);
      expect(stompClient.getStompClient()).toBeNull();
      expect(clientInstances[0].subscribe).not.toHaveBeenCalled();
    });
  });
});
