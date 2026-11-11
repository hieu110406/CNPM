
import { request } from './map';
import {
    getOfflinePois,
    getOfflineMediaUri,
    getOfflinePoiAudio,
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
            typeof poi.zone === 'string'
                ? poi.zone
                : '',
        emoji:
            typeof poi.emoji === 'string'
                ? poi.emoji
                : '🐾',
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

// Chuẩn hóa POI lấy trực tiếp từ Backend.
function normalizeOnlinePois(data: unknown): AnimalPoi[] {
    if (!Array.isArray(data)) {
        throw new Error('INVALID_POIS');
    }

    return data
        .filter((poi: RawPoi) => isValidPoi(poi))
        .map((poi: RawPoi) => {
            const images: RawPoiImage[] =
                Array.isArray(poi.images)
                    ? poi.images
                    : [];

            const imageUrls = images.flatMap(image =>
                typeof image?.url === 'string' &&
                    image.url.trim()
                    ? [image.url]
                    : []
            );

            return normalizePoi(poi, imageUrls);
        });
}

// Lấy ảnh đã đóng gói trong ZIP.
// Giữ nguyên thứ tự ảnh trong manifest.
async function resolveOfflineImages(
    language: string,
    poi: RawPoi
): Promise<string[]> {
    const images: RawPoiImage[] =
        Array.isArray(poi.images)
            ? poi.images
            : [];

    const paths = images.flatMap(image =>
        typeof image?.path === 'string' &&
            image.path.trim()
            ? [image.path]
            : []
    );

    const imageUrls: string[] = [];

    // Xử lý tuần tự để tránh mở quá nhiều ZIP
    // cùng một lúc trên Safari.
    for (const path of paths) {
        try {
            const uri = await getOfflineMediaUri(
                language,
                path
            );

            if (uri) {
                imageUrls.push(uri);
            }
        } catch (error) {
            if (__DEV__) {
                console.warn(
                    '[Offline] Không đọc được ảnh:',
                    poi.id,
                    path,
                    error
                );
            }
        }
    }

    return imageUrls;
}

// ==================== GET POIS ====================

export async function getAnimalPois(
    language: string
): Promise<AnimalPoi[]> {
    let onlinePois: AnimalPoi[] | null = null;
    let onlineError: unknown = null;

    // 1. Thử tải dữ liệu từ Backend.
    try {
        const data: unknown = await request(
            `/pois/public?lang=${encodeURIComponent(language)}`
        );

        onlinePois = normalizeOnlinePois(data);
    } catch (error) {
        onlineError = error;
    }

    // 2. Đọc POI trong ZIP đã tải.
    let offlinePois: RawPoi[] | null = null;

    try {
        offlinePois = await getOfflinePois(language);
    } catch (error) {
        if (__DEV__) {
            console.warn(
                '[Offline] Không đọc được POI:',
                error
            );
        }
    }

    // Không có ZIP: dùng dữ liệu online như cũ.
    if (!offlinePois) {
        if (onlinePois !== null) {
            return onlinePois;
        }

        throw (
            onlineError ??
            new Error(
                'Chưa có dữ liệu POI Offline. Hãy tải gói trước.'
            )
        );
    }

    const validOfflinePois = offlinePois.filter(isValidPoi);

    // 3. Lấy ảnh từ ZIP.
    // Mỗi POI được xử lý lần lượt để giảm áp lực
    // bộ nhớ khi Safari mở gói ZIP lớn.
    const offlineImageMap = new Map<string, string[]>();

    for (const poi of validOfflinePois) {
        const images = await resolveOfflineImages(
            language,
            poi
        );

        offlineImageMap.set(
            poi.id as string,
            images
        );
    }

    // 4. Nếu Backend hoạt động:
    // giữ dữ liệu online, ưu tiên ảnh Offline đã có.
    if (onlinePois !== null) {
        return onlinePois.map(poi => {
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

    // 5. Nếu mất mạng:
    // trả về thông tin và ảnh lấy từ ZIP.
    return validOfflinePois.map(poi => {
        const imageUrls =
            offlineImageMap.get(poi.id as string) ?? [];

        return normalizePoi(poi, imageUrls);
    });
}

// ==================== GET AUDIO ====================

export async function getPoiAudio(
    id: string,
    language: string
): Promise<PoiAudio | null> {
    // Ưu tiên file audio đã tải trong ZIP.
    // Nhờ vậy khi Offline không cần gọi Supabase.
    try {
        const offlineUri = await getOfflinePoiAudio(
            language,
            id
        );

        if (offlineUri) {
            return {
                fileUrl: offlineUri,
                language,
            };
        }
    } catch (error) {
        if (__DEV__) {
            console.warn(
                '[Offline] Không đọc được audio:',
                id,
                error
            );
        }
    }

    // Chưa có audio Offline:
    // dùng API online như trước.
    const data: unknown = await request(
        `/audio/public?poiCode=${encodeURIComponent(id)}` +
        `&lang=${encodeURIComponent(language)}`
    );

    if (!data) {
        return null;
    }

    if (
        typeof data !== 'object' ||
        !('fileUrl' in data) ||
        typeof data.fileUrl !== 'string' ||
        !data.fileUrl.trim() ||
        !('language' in data) ||
        typeof data.language !== 'string'
    ) {
        throw new Error('INVALID_AUDIO');
    }

    return {
        fileUrl: data.fileUrl,
        language: data.language,
    };
}
