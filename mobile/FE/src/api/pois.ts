import { request } from './map';

export type AnimalPoi = {
  id: string;
  name: string;
  zone: string;
  emoji: string;
  shortDesc: string;
  detailDesc: string;
  imageUrl: string | null;
  imageUrls?: string[];
};

export async function getAnimalPois(language: string): Promise<AnimalPoi[]> {
  const data: unknown = await request(`/pois/public?lang=${encodeURIComponent(language)}`);
  if (!Array.isArray(data)) throw new Error('INVALID_POIS');
  return data.filter(poi => poi?.type === 'animal' && typeof poi.id === 'string' && typeof poi.name === 'string')
    .map(poi => ({
      id: poi.id, name: poi.name, zone: typeof poi.zone === 'string' ? poi.zone : '',
      emoji: typeof poi.emoji === 'string' ? poi.emoji : '🐾',
      shortDesc: typeof poi.shortDesc === 'string' ? poi.shortDesc : '',
      detailDesc: typeof poi.detailDesc === 'string' ? poi.detailDesc : '',
      imageUrl: Array.isArray(poi.images)
        ? poi.images.find((image: { url?: unknown }) => typeof image?.url === 'string' && image.url.trim())?.url ?? null : null,
      imageUrls: Array.isArray(poi.images) ? poi.images.flatMap((image: { url?: unknown }) => typeof image?.url === 'string' && image.url.trim() ? [image.url] : []) : [],
    }));
}

export type PoiAudio = { fileUrl: string; language: string };
export async function getPoiAudio(id: string, language: string): Promise<PoiAudio | null> {
  const data = await request(`/audio/public?poiCode=${encodeURIComponent(id)}&lang=${encodeURIComponent(language)}`);
  if (!data) return null;
  if (typeof data.fileUrl !== 'string' || !data.fileUrl.trim() || typeof data.language !== 'string') throw new Error('INVALID_AUDIO');
  return { fileUrl: data.fileUrl, language: data.language };
}
