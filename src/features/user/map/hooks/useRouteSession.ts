import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  startRouteSession,
  getCurrentRouteSession,
  endRouteSession,
  getDirection,
  updateRouteLocation,
  RouteSession,
} from "@/src/services/routeService";

const ROUTE_SESSION_KEY = ["route-session"];

export function useCurrentRouteSession() {
  return useQuery({
    queryKey: ROUTE_SESSION_KEY,
    queryFn: getCurrentRouteSession,
    retry: false,
    enabled: false
  });
}

export function useStartRouteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startRouteSession,
    onSuccess: (data) => {
      queryClient.setQueryData<RouteSession>(ROUTE_SESSION_KEY, data);
    },
  });
}

export function useDirection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: getDirection,
    onSuccess: (_result, variables) => {
      queryClient.setQueryData<RouteSession>(ROUTE_SESSION_KEY, (old) => ({
        status: "ACTIVE",
        destination: {
          startLatitude: variables.startLatitude,
          startLongitude: variables.startLongitude,
          stopLatitude: variables.endLatitude,
          stopLongitude: variables.endLongitude,
          mode: variables.mode,
          poiId: variables.poiId,
        },
        lastLocation: old?.lastLocation ?? null,
      }));
    },
  });
}

export function useUpdateRouteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRouteLocation,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<RouteSession>(ROUTE_SESSION_KEY, (old) =>
        old ? { ...old, lastLocation: variables } : old
      );
    },
  });
}

export function useEndRouteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endRouteSession,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ROUTE_SESSION_KEY });
    },
  });
}