export type GpsMapAnchor = {
  latitude: number;
  longitude: number;
  x: number;
  y: number;
};

export type MapCoordinates = { x: number; y: number };

export function gpsToMapCoordinates(
  latitude: number,
  longitude: number,
  anchors: readonly GpsMapAnchor[],
): MapCoordinates | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (anchors.length < 4) return null;
  if (!anchors.every(anchor =>
    Number.isFinite(anchor.latitude) && Number.isFinite(anchor.longitude) &&
    Number.isFinite(anchor.x) && Number.isFinite(anchor.y))) return null;

  const meanLongitude = anchors.reduce((sum, anchor) => sum + anchor.longitude, 0) / anchors.length;
  const meanLatitude = anchors.reduce((sum, anchor) => sum + anchor.latitude, 0) / anchors.length;
  const meanX = anchors.reduce((sum, anchor) => sum + anchor.x, 0) / anchors.length;
  const meanY = anchors.reduce((sum, anchor) => sum + anchor.y, 0) / anchors.length;
  const centered = anchors.map(anchor => ({
    longitude: anchor.longitude - meanLongitude,
    latitude: anchor.latitude - meanLatitude,
    x: anchor.x - meanX,
    y: anchor.y - meanY,
  }));
  const longitudeVariance = centered.reduce((sum, anchor) => sum + anchor.longitude ** 2, 0);
  const latitudeVariance = centered.reduce((sum, anchor) => sum + anchor.latitude ** 2, 0);
  const covariance = centered.reduce((sum, anchor) => sum + anchor.longitude * anchor.latitude, 0);
  const determinant = longitudeVariance * latitudeVariance - covariance ** 2;
  if (longitudeVariance === 0 || latitudeVariance === 0 ||
      determinant / (longitudeVariance * latitudeVariance) < 0.01) return null;

  function project(value: 'x' | 'y') {
    const longitudeCovariance = centered.reduce((sum, anchor) => sum + anchor.longitude * anchor[value], 0);
    const latitudeCovariance = centered.reduce((sum, anchor) => sum + anchor.latitude * anchor[value], 0);
    const longitudeScale = (longitudeCovariance * latitudeVariance - latitudeCovariance * covariance) / determinant;
    const latitudeScale = (latitudeCovariance * longitudeVariance - longitudeCovariance * covariance) / determinant;
    const mean = value === 'x' ? meanX : meanY;
    return mean + longitudeScale * (longitude - meanLongitude) + latitudeScale * (latitude - meanLatitude);
  }

  const x = project('x');
  const y = project('y');
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) return null;
  return { x, y };
}
