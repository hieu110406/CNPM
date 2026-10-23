import { request } from './map';

export function pingOnlineSession(sessionId: string, language: string, device: 'mobile' | 'web') {
  return request('/analytics/sessions/ping', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, language, device, currentPoi: null }),
  });
}

export function removeOnlineSession(sessionId: string) {
  return request(`/analytics/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE', keepalive: true });
}

export type PopularPoi = {
  id: string;
  name: string;
  zone: string;
  emoji: string;
  imageUrl: string | null;
  plays: number;
};

export async function getMostListenedPois(language: string): Promise<PopularPoi[]> {
  const data: unknown = await request(`/analytics/top-popular?lang=${encodeURIComponent(language)}`);
  if (!Array.isArray(data)) throw new Error('INVALID_POPULAR_POIS');
  // Older running backends return rankings without imageUrl. Their public POI
  // endpoint already exposes the images uploaded by the admin.
  const imagesById = new Map<string, string>();
  if (data.some(poi => poi && poi.imageUrl === undefined)) {
    try {
      const pois: unknown = await request(`/pois/public?lang=${encodeURIComponent(language)}`);
      if (Array.isArray(pois)) {
        for (const poi of pois) {
          const url = poi?.images?.find((image: { url?: unknown }) => typeof image?.url === 'string' && image.url.trim())?.url;
          if (typeof poi?.id === 'string' && typeof url === 'string') imagesById.set(poi.id, url);
        }
      }
    } catch {
      // Rankings remain available if the optional image lookup fails.
    }
  }
  return data.map((poi: Record<string, unknown>) => {
    if (!poi || typeof poi.id !== 'string' || typeof poi.name !== 'string' ||
        !Number.isFinite(Number(poi.plays)) || Number(poi.plays) < 0) {
      throw new Error('INVALID_POPULAR_POI');
    }
    return {
      id: poi.id, name: poi.name, plays: Number(poi.plays),
      zone: typeof poi.zone === 'string' ? poi.zone : '',
      emoji: typeof poi.emoji === 'string' ? poi.emoji : '📍',
      imageUrl: typeof poi.imageUrl === 'string' && poi.imageUrl.trim()
        ? poi.imageUrl : imagesById.get(poi.id) ?? null,
    };
  });
}
