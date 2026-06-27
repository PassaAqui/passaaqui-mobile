export const RECIFE_BOUNDS ={
  latitudeMin: -8.1500,
  latitudeMax: -7.9500,
  longitudeMin: -34.9500,
  longitudeMax: -34.8000
}

export const mapStyle = [
  {
    "featureType": "poi",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "poi.park",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "featureType": "water",
    "stylers": [{ "color": "#a0d2ff" }]
  },

  // Remove nome dos bairros, pontos de transporte e ícones de marcadores que já vem por padrão
  {
    "featureType": "transit",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "administrative",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  }
];