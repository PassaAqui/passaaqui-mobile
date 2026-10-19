import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectStomp, disconnectStomp } from "@/src/services/socket/stompClient";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import {
  normalizeCheckinResult,
  type CheckinApiResponse,
  type CheckinResult,
} from "@/src/services/routeService";

interface CheckinPush {
  action: "checkin-result";
  data?: CheckinApiResponse;
}

interface RoutePush {
  action: "route-ended";
  data: string;
}

interface UseRouteSocketParams {
  onCheckin: (result: CheckinResult) => void;
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
        if (payload.action !== "checkin-result" || !payload.data) return;

        const result = normalizeCheckinResult(payload.data);
        if (result.xp_concedido <= 0) return;

        queryClient.setQueryData(["tourist-me"], (old: any) =>
          old ? { ...old, currentXP: (old.currentXP ?? 0) + result.xp_concedido } : old
        );
        onCheckin(result);
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
