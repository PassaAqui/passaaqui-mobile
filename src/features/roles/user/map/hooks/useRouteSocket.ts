import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectStomp, disconnectStomp } from "@/src/services/socket/stompClient";
import { useTouristMe } from "@/src/features/roles/user/auth/hooks/useTouristMe";

interface CheckinPush {
  action: "checkin-result";
  data: {
    xp_concedido: number;
    motivo_bloqueio: string | null;
  };
}

interface RoutePush {
  action: "route-ended";
  data: string;
}

interface UseRouteSocketParams {
  onCheckin: (result: CheckinPush["data"]) => void;
  onRouteEnded: () => void;
}

export function useRouteSocket({ onCheckin, onRouteEnded }: UseRouteSocketParams) {
  const queryClient = useQueryClient();
  const { data: user } = useTouristMe();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || subscribedRef.current) return;

    const client = connectStomp(() => {
      client?.subscribe(`/user/${user.id}/queue/poi`, (message) => {
        const payload: CheckinPush = JSON.parse(message.body);
        if (payload.action === "checkin-result" && payload.data.xp_concedido > 0) {
          queryClient.setQueryData(["tourist-me"], (old: any) =>
            old ? { ...old, currentXP: old.currentXP + payload.data.xp_concedido } : old
          );
          onCheckin(payload.data);
        }
      });

      client?.subscribe(`/user/${user.id}/queue/route`, (message) => {
        const payload: RoutePush = JSON.parse(message.body);
        if (payload.action === "route-ended") onRouteEnded();
      });
    });

    subscribedRef.current = true;
    return () => {
      disconnectStomp();
      subscribedRef.current = false;
    };
  }, [user?.id]);
}