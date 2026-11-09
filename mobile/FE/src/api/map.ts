
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
    getOfflinePois,
    getOfflineMediaUri,
} from './offlineReader';

export type MapNode = {
    id: string;
    name: string;
    x: number;
    y: number;
    latitude?: number | null;
    longitude?: number | null;
    category: string;
    emoji?: string;
    zone?: string;
    shortDesc?: string;
    detailDesc?: string;
    imageUrl?: string | null;
    imageUrls?: string[];
};

type RawMapPoi = {
    id?: unknown;
    node_id?: unknown;
    name?: unknown;
    x?: unknown;
    y?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    type?: unknown;
    category?: unknown;
    emoji?: unknown;
    zone?: unknown;
    shortDesc?: unknown;
    detailDesc?: unknown;
    images?: unknown;
};

type RawImage = {
    url?: unknown;
    path?: unknown;
};

export class MapApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
    }
}

// ==================== API ====================

function getApiBase(): string {
    const configured =
        process.env.EXPO_PUBLIC_API_URL?.trim();

    if (configured) {
        return configured.replace(/\/+$/, '');
    }

    if (
        __DEV__ &&
        Platform.OS === 'web' &&
        typeof window !== 'undefined'
    ) {
        return (
            `${window.location.protocol}//` +
            `${window.location.hostname}:5000/api`
        );
    }

    const host = Constants.expoConfig?.hostUri;

    if (__DEV__ && host) {
        const hostname = new URL(
            `http://${host}`
        ).hostname;

        return `http://${hostname}:5000/api`;
    }

    throw new Error('API_NOT_CONFIGURED');
}

export async function request(
    path: string,
    options: RequestInit = {}
) {
    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        20000
    );

    try {
        const response = await fetch(
            `${getApiBase()}${path}`,
            {
                ...options,
                signal: controller.signal,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new MapApiError(
                response.status,
                data.message ||
                data.error ||
                'API_ERROR'
            );
        }

        return data;
    } finally {
        clearTimeout(timeout);
    }
}

// ==================== HELPERS ====================

function optionalText(value: unknown): string | undefined {
    return typeof value === 'string'
        ? value
        : undefined;
}

function optionalNumber(
    value: unknown
): number | null {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

function normalizeNode(node: RawMapPoi): MapNode {
    const id = node.node_id ?? node.id;

    const x = optionalNumber(node.x);
    const y = optionalNumber(node.y);

    if (
        typeof id !== 'string' ||
        !id.trim() ||
        typeof node.name !== 'string' ||
        !node.name.trim() ||
        x === null ||
        y === null
    ) {
        throw new Error('INVALID_MAP_NODE');
    }

    return {
        id,
        name: node.name,
        x,
        y,
        latitude: optionalNumber(node.latitude),
        longitude: optionalNumber(node.longitude),
        category:
            optionalText(node.type) ??
            optionalText(node.category) ??
            'poi',
        emoji: optionalText(node.emoji),
        zone: optionalText(node.zone),
        shortDesc: optionalText(node.shortDesc),
        detailDesc: optionalText(node.detailDesc),
    };
}

function getOnlineImageUrls(
    images: unknown
): string[] {
    if (!Array.isArray(images)) {
        return [];
    }

    return (images as RawImage[]).flatMap(image =>
        typeof image?.url === 'string' &&
            image.url.trim()
            ? [image.url]
            : []
    );
}

// ==================== ONLINE MAP ====================

async function getOnlineMapPois(
    language: string
): Promise<MapNode[]> {
    const data: unknown = await request(
        `/pois/public?lang=${encodeURIComponent(language)}`
    );

    if (!Array.isArray(data)) {
        throw new Error('INVALID_MAP_POIS');
    }

    return (data as RawMapPoi[])
        .filter(poi =>
            optionalNumber(poi.x) !== null &&
            optionalNumber(poi.y) !== null
        )
        .map(poi => {
            const imageUrls = getOnlineImageUrls(
                poi.images
            );

            return {
                ...normalizeNode(poi),
                imageUrl: imageUrls[0] ?? null,
                imageUrls,
            };
        });
}

// ==================== OFFLINE MAP ====================

// Đọc các điểm POI từ ZIP đã tải.
// Backend đã đóng gói x/y, tên, loại POI,
// mô tả và đường dẫn ảnh trong manifest.
async function getOfflineMapPois(
    language: string
): Promise<MapNode[] | null> {
    const pois = await getOfflinePois(language);

    if (!pois) {
        return null;
    }

    const results: MapNode[] = [];

    for (const poi of pois as RawMapPoi[]) {
        const x = optionalNumber(poi.x);
        const y = optionalNumber(poi.y);

        // POI không có tọa độ bản đồ
        // thì không thể đặt marker.
        if (x === null || y === null) {
            continue;
        }

        try {
            const node = normalizeNode(poi);

            const images: RawImage[] =
                Array.isArray(poi.images)
                    ? poi.images
                    : [];

            const imageUrls: string[] = [];

            for (const image of images) {
                if (
                    typeof image?.path !== 'string' ||
                    !image.path.trim()
                ) {
                    continue;
                }

                try {
                    const uri = await getOfflineMediaUri(
                        language,
                        image.path
                    );

                    if (uri) {
                        imageUrls.push(uri);
                    }
                } catch (error) {
                    if (__DEV__) {
                        console.warn(
                            '[Offline Map] Không đọc được ảnh:',
                            node.id,
                            error
                        );
                    }
                }
            }

            results.push({
                ...node,
                imageUrl: imageUrls[0] ?? null,
                imageUrls,
            });
        } catch (error) {
            if (__DEV__) {
                console.warn(
                    '[Offline Map] Bỏ qua POI không hợp lệ:',
                    error
                );
            }
        }
    }

    return results;
}

// ==================== PUBLIC FUNCTION ====================

// Ưu tiên Backend khi có mạng.
// Nếu Backend lỗi thì dùng dữ liệu ZIP Offline.
export async function getMapPois(
    language = 'vi'
): Promise<MapNode[]> {
    try {
        return await getOnlineMapPois(language);
    } catch (onlineError) {
        try {
            const offlinePois =
                await getOfflineMapPois(language);

            if (offlinePois !== null) {
                return offlinePois;
            }
        } catch (offlineError) {
            if (__DEV__) {
                console.warn(
                    '[Offline Map] Không đọc được gói dữ liệu:',
                    offlineError
                );
            }
        }

        throw onlineError;
    }
}
