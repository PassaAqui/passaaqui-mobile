import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { useAuthStore } from "@/src/stores/user/auth/authStore";

const WS_URL = process.env.EXPO_PUBLIC_WS_URL;

let client: Client | null = null;

export function connectStomp(onConnected?: () => void) {
  const token = useAuthStore.getState().accessToken;
  if (!token) return null;

  client = new Client({
    brokerURL: WS_URL,
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    onConnect: () => {
      console.log("[stomp] conectado");
      onConnected?.();
    },
    onStompError: (frame) => {
      console.log("[stomp] erro", frame.headers["message"], frame.body);
    },
  });

  client.activate();
  return client;
}

export function disconnectStomp() {
  client?.deactivate();
  client = null;
}

export function getStompClient() {
  return client;
}

export function subscribeTopic(
  topic: string,
  callback: (message: IMessage) => void
): () => void {
  let subscription: StompSubscription | null = null;
  let ownsConnection = false;

  const doSubscribe = () => {
    subscription = client?.subscribe(topic, callback) ?? null;
  };

  if (client?.connected) {
    doSubscribe();
  } else {
    ownsConnection = !client;
    connectStomp(doSubscribe);
  }

  return () => {
    subscription?.unsubscribe();
    if (ownsConnection) disconnectStomp();
  };
}