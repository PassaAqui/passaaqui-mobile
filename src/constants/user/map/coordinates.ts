/**
 * Coordenadas geográficas centralizadas e helpers de conversão
 * entre o formato { latitude, longitude } (app) e [longitude, latitude] (MapLibre).
 */

// ---------------------------------------------------------------------------
// Coordenadas fixas usadas como fallback / centro de mapa
// ---------------------------------------------------------------------------

export const MARCO_ZERO_RECIFE = {
  latitude: -8.0675,
  longitude: -34.9167,
};

/*
 * Referências de cidades próximas — mantidas apenas como referência,
 * NÃO são usadas no código de produção.
 */
// const PAULISTA = { latitude: -7.94009, longitude: -34.8723 };
// const CARUARU = { latitude: -8.2832, longitude: -35.9736 };

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type LatLng = { latitude: number; longitude: number };
export type LngLatTuple = [number, number];

// ---------------------------------------------------------------------------
// Helpers de conversão de coordenadas
// ---------------------------------------------------------------------------

/** Converte { latitude, longitude } → [longitude, latitude] (MapLibre LngLat). */
export function toLngLat(coord: LatLng): LngLatTuple {
  return [coord.longitude, coord.latitude];
}

/** Converte [longitude, latitude] (MapLibre LngLat) → { latitude, longitude }. */
export function fromLngLat(tuple: LngLatTuple): LatLng {
  return { latitude: tuple[1], longitude: tuple[0] };
}

// ---------------------------------------------------------------------------
// Helper de bounds (usado no equiv. de fitToCoordinates do react-native-maps)
// ---------------------------------------------------------------------------

/**
 * Calcula bounds no formato MapLibre: [west, south, east, north] (LngLatBounds).
 * Usado com cameraRef.fitBounds() para enquadrar um conjunto de coordenadas.
 */
export function calculateBounds(coords: LatLng[]): [number, number, number, number] {
  const lats = coords.map((c) => c.latitude);
  const lngs = coords.map((c) => c.longitude);
  return [
    Math.min(...lngs), // west
    Math.min(...lats), // south
    Math.max(...lngs), // east
    Math.max(...lats), // north
  ];
}
