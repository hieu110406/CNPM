export type GpsMapAnchor = { latitude: number; longitude: number; x: number; y: number };
export type MapCoordinates = { x: number; y: number };
export type GpsCoordinates = { latitude: number; longitude: number };

type Axis = { longitude: number; latitude: number; offset: number };
function fitCalibration(anchors: readonly GpsMapAnchor[]) {
  if (anchors.length < 4 || !anchors.every(a =>
    Number.isFinite(a.latitude) && Number.isFinite(a.longitude) &&
    Number.isFinite(a.x) && Number.isFinite(a.y))) return null;
  const meanLongitude = anchors.reduce((sum, a) => sum + a.longitude, 0) / anchors.length;
  const meanLatitude = anchors.reduce((sum, a) => sum + a.latitude, 0) / anchors.length;
  const meanX = anchors.reduce((sum, a) => sum + a.x, 0) / anchors.length;
  const meanY = anchors.reduce((sum, a) => sum + a.y, 0) / anchors.length;
  const centered = anchors.map(a => ({ longitude: a.longitude - meanLongitude,
    latitude: a.latitude - meanLatitude, x: a.x - meanX, y: a.y - meanY }));
  const longitudeVariance = centered.reduce((sum, a) => sum + a.longitude ** 2, 0);
  const latitudeVariance = centered.reduce((sum, a) => sum + a.latitude ** 2, 0);
  const covariance = centered.reduce((sum, a) => sum + a.longitude * a.latitude, 0);
  const determinant = longitudeVariance * latitudeVariance - covariance ** 2;
  if (longitudeVariance === 0 || latitudeVariance === 0 ||
    determinant / (longitudeVariance * latitudeVariance) < 0.01) return null;
  function axis(value: 'x' | 'y'): Axis {
    const longitudeCovariance = centered.reduce((sum, a) => sum + a.longitude * a[value], 0);
    const latitudeCovariance = centered.reduce((sum, a) => sum + a.latitude * a[value], 0);
    return {
      longitude: (longitudeCovariance * latitudeVariance - latitudeCovariance * covariance) / determinant,
      latitude: (latitudeCovariance * longitudeVariance - longitudeCovariance * covariance) / determinant,
      offset: value === 'x' ? meanX : meanY,
    };
  }
  return { x: axis('x'), y: axis('y'), meanLatitude, meanLongitude };
}

export function gpsToMapCoordinates(latitude: number, longitude: number, anchors: readonly GpsMapAnchor[]): MapCoordinates | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const fit = fitCalibration(anchors);
  if (!fit) return null;
  const project = (axis: Axis) => axis.offset + axis.longitude * (longitude - fit.meanLongitude) + axis.latitude * (latitude - fit.meanLatitude);
  const x = project(fit.x), y = project(fit.y);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) return null;
  return { x, y };
}

/** Generates synthetic GPS fixes from a map route; does not measure field accuracy. */
export function mapToGpsCoordinates(x: number, y: number, anchors: readonly GpsMapAnchor[]): GpsCoordinates | null {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) return null;
  const fit = fitCalibration(anchors);
  if (!fit) return null;
  const determinant = fit.x.longitude * fit.y.latitude - fit.x.latitude * fit.y.longitude;
  const scale = Math.hypot(fit.x.longitude, fit.x.latitude) * Math.hypot(fit.y.longitude, fit.y.latitude);
  if (!scale || Math.abs(determinant) / scale < 1e-8) return null;
  const dx = x - fit.x.offset, dy = y - fit.y.offset;
  const longitude = fit.meanLongitude + (dx * fit.y.latitude - dy * fit.x.latitude) / determinant;
  const latitude = fit.meanLatitude + (dy * fit.x.longitude - dx * fit.y.longitude) / determinant;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}
