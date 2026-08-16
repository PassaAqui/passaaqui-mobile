import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocationObject } from "expo-location";
import { RouteMode } from "@/src/services/routeService";
import { getPoisNearby, PoiNearby } from "@/src/features/user/map/poi/services/poiService";
import { useDebouncedValue } from "@/src/features/user/map/hooks/useDebouncedValue";

function roundCoord(value: number) {
  return Math.round(value * 1000) / 1000; // ~111m de precisão
}

// Limite máximo de POIs acumulados em memória: evita crescimento indefinido durante
// sessões longas de exploração do mapa. Quando excedido, os POIs mais antigos (FIFO) são removidos.
const MAX_ACCUMULATED_POIS = 300;

interface MapCenter {
  latitude: number;
  longitude: number;
}

export function useNearbyPois(
  location: LocationObject | null,
  mapCenter: MapCenter | null,
  mode: RouteMode | null = null
) {
  /*
  const latitude = location?.coords.latitude;
  const longitude = location?.coords.longitude;
  */

  // Valores fixos apenas em dev
  const latitude = location?.coords.latitude ?? -8.0675;
  const longitude = location?.coords.longitude ?? -34.9167;

  // Evita disparar busca a cada frame do arrasto do mapa — só depois de parar por 600ms
  const debouncedCenter = useDebouncedValue(mapCenter, 600);

  // Ao explorar o mapa (arrastar a câmera), o modo padrão é "driving-car" (raio maior);
  // sem exploração (seguindo a localização), o padrão é "foot-walking".
  // Uma seleção explícita no LocomotionMode prevalece sobre esses padrões.
  const searchLat = debouncedCenter?.latitude ?? latitude;
  const searchLng = debouncedCenter?.longitude ?? longitude;
  const searchMode = debouncedCenter ? mode ?? "driving-car" : mode ?? "foot-walking";

  const roundedLat = roundCoord(searchLat);
  const roundedLng = roundCoord(searchLng);
  const hasLocation = !!location;
  const hasCenter = !!debouncedCenter;

  // A queryKey inclui o modo de busca de propósito: trocar o modo de locomoção deve
  // disparar uma nova busca (o raio amplia/altera a cobertura). O staleTime de 5 min
  // evita refetch repetido para a mesma combinação (coordenada arredondada, modo).
  const { data } = useQuery({
    queryKey: ["pois-nearby", roundedLat, roundedLng, searchMode],
    queryFn: () => getPoisNearby(searchLat, searchLng, searchMode),
    enabled: hasLocation || hasCenter,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Acumula por id — POIs já vistos não somem quando a região de busca muda
  const [accumulated, setAccumulated] = useState<Map<number, PoiNearby>>(new Map());

  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) => {
      const next = new Map(prev);
      data.forEach((poi) => next.set(poi.id, poi));
      // Como Map preserva a ordem de inserção, deletar as primeiras entradas remove
      // os POIs mais antigos (estratégia FIFO) até voltar ao limite.
      if (next.size > MAX_ACCUMULATED_POIS) {
        let excess = next.size - MAX_ACCUMULATED_POIS;
        for (const key of next.keys()) {
          if (excess <= 0) break;
          next.delete(key);
          excess -= 1;
        }
      }
      return next;
    });
  }, [data]);

  const allPois = useMemo(() => Array.from(accumulated.values()), [accumulated]);

  const touristPois = useMemo(
    () => allPois.filter((p) => p.type === "TOURIST_POINT"),
    [allPois]
  );

  const shopPois = useMemo(
    () => allPois.filter((p) => p.type === "STORE"),
    [allPois]
  );

  return { touristPois, shopPois };
}