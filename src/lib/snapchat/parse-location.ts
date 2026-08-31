export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export function parseSnapLocation(location?: string): GpsCoordinates | null {
  if (!location) return null;

  const match = location.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;

  const latitude = Number.parseFloat(match[1]);
  const longitude = Number.parseFloat(match[2]);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return { latitude, longitude };
}
