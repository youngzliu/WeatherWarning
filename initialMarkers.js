export const epiLat = 47.6092294;
export const epiLong = -122.3388663;

// Other locations (no current location),
// coord object for marker, lat first long second
export const initialMarkers = [
  { latitude: epiLat - 0.3, longitude: epiLong },
  { latitude: epiLat - 0.3, longitude: epiLong - 0.5 },
  { latitude: epiLat - 0.62, longitude: epiLong - 0.7 },
  { latitude: epiLat - 0.9, longitude: epiLong - 0.7 },
  { latitude: epiLat - 0.9, longitude: epiLong - 1.1 }
];

//Other locations + current location, for regression,
// Regresssion takes in an array, long first lat second
export const initialMarkersArray = [
  [initialMarkers[0].longitude, initialMarkers[0].latitude],
  [initialMarkers[1].longitude, initialMarkers[1].latitude],
  [initialMarkers[2].longitude, initialMarkers[2].latitude],
  [initialMarkers[3].longitude, initialMarkers[3].latitude],
  [initialMarkers[4].longitude, initialMarkers[4].latitude]
];
