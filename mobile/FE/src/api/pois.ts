
import { request } from './map';
import {
    getOfflinePois,
    getOfflineMediaUri,
} from './offlineReader';

// ==================== TYPES ====================

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

export type PoiAudio = {
    fileUrl: string;
    language: string;
};

type RawPoiImage = {
    url?: unknown;
    path?: unknown;
};

type RawPoi = {
    id?: unknown;
    name?: unknown;
    zone?: unknown;
    emoji?: unknown;
    type?: unknown;
    shortDesc?: unknown;
    detailDesc?: unknown;
    images?: unknown;
};

// ==================== HELPERS ====================

function isValidPoi(poi: RawPoi): boolean {
    return (
        poi?.type === 'animal' &&
        typeof poi.id === 'string' &&
        typeof poi.name === 'string'
    );
}

function normalizePoi(
    poi: RawPoi,
    imageUrls: string[]
): AnimalPoi {
    return {
        id: poi.id as string,
        name: poi.name as string,
        zone:
            typeof poi.zone === 'string' ? poi.zone : '',
        emoji:
            typeof poi.emoji === 'string' ? poi.emoji : '🐾',
        shortDesc:
            typeof poi.shortDesc === 'string'
                ? poi.shortDesc
                : '',
        detailDesc:
            typeof poi.detailDesc === 'string'
                ? poi.detailDesc
                : '',
        imageUrl: imageUrls[0] ?? null,
        imageUrls,
    };
}

// Chuẩn hóa dữ liệu online.
function normalizeOnlinePois(data: unknown): AnimalPoi[] {
    if (!Array.isArray(data)) {
        throw new Error('INVALID_POIS');
    }

    return data
        .filter((poi: RawPoi) => isValidPoi(poi))
        .map((poi: RawPoi) => {
            const images: RawPoiImage[] =
                Array.isArray(poi.images) ? poi.images : [];

            const imageUrls = images.flatMap((image) =>
                typeof image?.url === 'string' &&
                    image.url.trim()
                    ? [image.url]
                    : []
            );

            return normalizePoi(poi, imageUrls);
        });
}

// Giải nén các ảnh của một POI.
async function resolveOfflineImages(
    language: string,
    poi: RawPoi
): Promise<string[]> {
    const images: RawPoiImage[] =
        Array.isArray(poi.images) ? poi.images : [];

    const paths = images.flatMap((image) =>
        typeof image?.path === 'string' &&
            image.path.trim()
            ? [image.path]
            : []
    );

    const results = await Promise.allSettled(
        paths.map((path) =>
            getOfflineMediaUri(language, path)
        )
    );

    results.forEach((result, index) => {
        if (result.status === 'rejected' && __DEV__) {
            console.warn('OFFLINE IMAGE EXTRACT ERROR:', {
                poiId: poi.id,
                path: paths[index],
                error: String(result.reason),
            });
        }
    });

    return results.flatMap((result) =>
        result.status === 'fulfilled' && result.value
            ? [result.value]
            : []
    );
}

// ==================== GET POIS ====================

export async function getAnimalPois(
    language: string
): Promise<AnimalPoi[]> {
    let onlinePois: AnimalPoi[] | null = null;
    let onlineError: unknown = null;

    // Bước 1: Lấy POI online nếu Backend hoạt động.
    try {
        const data: unknown = await request(
            `/pois/public?lang=${encodeURIComponent(language)}`
        );

        onlinePois = normalizeOnlinePois(data);
    } catch (error) {
        onlineError = error;
    }

    // Bước 2: Kiểm tra dữ liệu trong ZIP.
    let offlinePois: RawPoi[] | null = null;

    try {
        offlinePois = await getOfflinePois(language);
    } catch (error) {
        if (__DEV__) {
            console.warn(
                'OFFLINE PACKAGE ERROR:',
                String(error)
            );
        }
    }

    // Không có package: dùng dữ liệu online.
    if (!offlinePois) {
        if (onlinePois) return onlinePois;

        throw onlineError ??
        new Error('Không có dữ liệu POI.');
    }

    // Bước 3: Giải nén ảnh từ ZIP.
    const offlineImageMap = new Map<string, string[]>();

    const validOfflinePois = offlinePois.filter(isValidPoi);

    await Promise.all(
        validOfflinePois.map(async (poi) => {
            const imageUrls = await resolveOfflineImages(
                language,
                poi
            );

            offlineImageMap.set(
                poi.id as string,
                imageUrls
            );
        })
    );

    // Bước 4: Có mạng thì giữ thông tin POI online,
    // nhưng ưu tiên hình ảnh đã tải trong ZIP.
    if (onlinePois) {
        return onlinePois.map((poi) => {
            const localImages =
                offlineImageMap.get(poi.id) ?? [];

            const imageUrls =
                localImages.length > 0
                    ? localImages
                    : poi.imageUrls ?? [];

            return {
                ...poi,
                imageUrl: imageUrls[0] ?? null,
                imageUrls,
            };
        });
    }

    // Bước 5: Không có mạng thì đọc POI và ảnh từ ZIP.
    return validOfflinePois.map((poi) => {
        const imageUrls =
            offlineImageMap.get(poi.id as string) ?? [];

        return normalizePoi(poi, imageUrls);
    });
}

// ==================== GET AUDIO ====================

// Giữ nguyên audio online.
// Sẽ bổ sung fallback audio offline sau.
export async function getPoiAudio(
    id: string,
    language: string
): Promise<PoiAudio | null> {
    const data = await request(
        `/audio/public?poiCode=${encodeURIComponent(id)}&lang=${encodeURIComponent(language)}`
    );

    if (!data) return null;

    if (
        typeof data.fileUrl !== 'string' ||
        !data.fileUrl.trim() ||
        typeof data.language !== 'string'
    ) {
        throw new Error('INVALID_AUDIO');
    }

    return {
        fileUrl: data.fileUrl,
        language: data.language,
    };
}
