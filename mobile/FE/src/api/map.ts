import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type MapNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  category: string;
  emoji?: string;
  zone?: string;
  shortDesc?: string;
  detailDesc?: string;
  imageUrl?: string | null;
  imageUrls?: string[];
};

export class MapApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function getApiBase() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  // Expo web can omit hostUri; use the page host rather than requiring a native manifest.
  if (__DEV__ && Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  // During LAN development, use the computer serving Expo, not the phone's localhost.
  const host = Constants.expoConfig?.hostUri;
  if (__DEV__ && host) return `http://${new URL(`http://${host}`).hostname}:5000/api`;
  throw new Error('API_NOT_CONFIGURED');
}

export async function request(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${getApiBase()}${path}`, {
      ...options,
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new MapApiError(response.status, data.message || data.error || 'API_ERROR');
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeNode(node: { node_id?: string; id?: string; name: string; x: number | string; y: number | string; category?: string }): MapNode {
  const id = node.node_id || node.id;
  if (!id || !node.name || node.x == null || node.y == null ||
      !Number.isFinite(Number(node.x)) || !Number.isFinite(Number(node.y))) {
    throw new Error('INVALID_MAP_NODE');
  }
  return { id, name: node.name, x: Number(node.x), y: Number(node.y), category: node.category || 'poi' };
}

export async function getMapPois(language = 'vi'): Promise<MapNode[]> {
  // Visible places come from poi, not legacy POIs stored alongside the waypoint graph.
  const data = await request(`/pois/public?lang=${encodeURIComponent(language)}`);
  if (!Array.isArray(data)) throw new Error('INVALID_MAP_POIS');
  return data.filter(poi => poi.x != null && poi.y != null).map(poi => ({
    ...normalizeNode({ ...poi, category: poi.type }),
    emoji: poi.emoji || undefined,
    zone: poi.zone || undefined,
    shortDesc: poi.shortDesc || undefined,
    detailDesc: poi.detailDesc || undefined,
    imageUrl: Array.isArray(poi.images) ? poi.images.find((image: { url?: unknown }) => typeof image?.url === 'string' && image.url.trim())?.url ?? null : null,
    imageUrls: Array.isArray(poi.images) ? poi.images.flatMap((image: { url?: unknown }) => typeof image?.url === 'string' && image.url.trim() ? [image.url] : []) : [],
  }));
}

