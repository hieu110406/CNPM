
import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import {
    getWebOfflinePackage,
    offlinePackagePath,
} from './offline';

export type OfflinePoi = {
    id: string;
    name: string;
    zone?: string;
    emoji?: string | null;
    type?: string;
    shortDesc?: string;
    detailDesc?: string;
    images?: {
        alt?: string;
        path: string;
    }[];
};

export type OfflineAudio = {
    poiId: string;
    language: string;
    path: string;
};

export type OfflineManifest = {
    schemaVersion: number;
    language: string;
    map: string;
    pois: OfflinePoi[];
    audio: OfflineAudio[];
    graph?: unknown[];
};

const MAX_PACKAGE_BYTES = 150 * 1024 * 1024;
const MAX_MEDIA_BYTES = 15 * 1024 * 1024;

function validateLanguage(language: string): void {
    if (!['vi', 'en', 'zh'].includes(language)) {
        throw new Error('Ngôn ngữ offline không hợp lệ.');
    }
}

function validateMediaPath(path: string): void {
    if (
        !/^(images|audio|map)\/[a-zA-Z0-9._%-]+$/.test(path) ||
        path.includes('..')
    ) {
        throw new Error('Đường dẫn media không hợp lệ.');
    }
}

function getMediaMimeType(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        case 'gif':
            return 'image/gif';
        case 'svg':
            return 'image/svg+xml';
        case 'mp3':
            return 'audio/mpeg';
        case 'wav':
            return 'audio/wav';
        case 'm4a':
            return 'audio/mp4';
        case 'ogg':
            return 'audio/ogg';
        case 'aac':
            return 'audio/aac';
        case 'mp4':
            return 'video/mp4';
        default:
            return 'application/octet-stream';
    }
}

// Mở ZIP đã lưu.
// Android/iOS: đọc từ FileSystem.
// Safari/Chrome: đọc Blob từ IndexedDB.
async function openOfflineZip(
    language: string
): Promise<JSZip | null> {
    validateLanguage(language);

    if (Platform.OS === 'web') {
        const blob = await getWebOfflinePackage(language);

        if (!blob || blob.size === 0) {
            return null;
        }

        if (blob.size > MAX_PACKAGE_BYTES) {
            throw new Error(
                'Gói Offline vượt quá giới hạn 150 MB.'
            );
        }

        return JSZip.loadAsync(blob, {
            checkCRC32: true,
        });
    }

    const path = offlinePackagePath(language);
    const info = await FileSystem.getInfoAsync(path);

    if (!info.exists || (info.size ?? 0) === 0) {
        return null;
    }

    if ((info.size ?? 0) > MAX_PACKAGE_BYTES) {
        throw new Error(
            'Gói Offline vượt quá giới hạn 150 MB.'
        );
    }

    const base64 = await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem.EncodingType.Base64,
    });

    return JSZip.loadAsync(base64, {
        base64: true,
        checkCRC32: true,
    });
}

// Đọc và kiểm tra manifest.json từ ZIP.
export async function readOfflinePackage(
    language: string
): Promise<OfflineManifest | null> {
    const zip = await openOfflineZip(language);

    if (!zip) {
        return null;
    }

    const manifestFile = zip.file('manifest.json');

    if (!manifestFile) {
        throw new Error('Gói Offline thiếu manifest.json.');
    }

    let manifest: unknown;

    try {
        const text = await manifestFile.async('string');
        manifest = JSON.parse(text);
    } catch {
        throw new Error(
            'Không đọc được manifest.json trong gói Offline.'
        );
    }

    if (
        !manifest ||
        typeof manifest !== 'object' ||
        !('schemaVersion' in manifest) ||
        manifest.schemaVersion !== 1 ||
        !('language' in manifest) ||
        manifest.language !== language ||
        !('pois' in manifest) ||
        !Array.isArray(manifest.pois) ||
        !('audio' in manifest) ||
        !Array.isArray(manifest.audio) ||
        !('map' in manifest) ||
        typeof manifest.map !== 'string'
    ) {
        throw new Error('Manifest Offline không hợp lệ.');
    }

    return manifest as OfflineManifest;
}

// Lấy danh sách POI từ gói Offline.
export async function getOfflinePois(
    language: string
): Promise<OfflinePoi[] | null> {
    const manifest = await readOfflinePackage(language);

    return manifest ? manifest.pois : null;
}

// Lấy ảnh/audio/bản đồ từ ZIP trên Safari/Chrome.
async function getWebOfflineMediaUri(
    language: string,
    mediaPath: string
): Promise<string | null> {
    const zip = await openOfflineZip(language);

    if (!zip) {
        return null;
    }

    const entry = zip.file(mediaPath);

    if (!entry) {
        return null;
    }

    const bytes = await entry.async('uint8array');

    if (bytes.byteLength === 0) {
        return null;
    }

    if (bytes.byteLength > MAX_MEDIA_BYTES) {
        throw new Error('File media Offline quá lớn.');
    }

    // Sao chép sang ArrayBuffer tương thích Blob.
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);

    const blob = new Blob([buffer], {
        type: getMediaMimeType(mediaPath),
    });

    // URL blob có thể dùng trong <img>, Image và audio Web.
    return URL.createObjectURL(blob);
}

// Hàm chung lấy ảnh/audio/bản đồ Offline.
// Web trả blob URL, Native trả file URI.
export async function getOfflineMediaUri(
    language: string,
    mediaPath: string
): Promise<string | null> {
    validateLanguage(language);
    validateMediaPath(mediaPath);

    if (Platform.OS === 'web') {
        return getWebOfflineMediaUri(
            language,
            mediaPath
        );
    }

    const packageInfo = await FileSystem.getInfoAsync(
        offlinePackagePath(language)
    );

    if (
        !packageInfo.exists ||
        (packageInfo.size ?? 0) === 0
    ) {
        return null;
    }

    const cacheRoot = FileSystem.cacheDirectory;

    if (!cacheRoot) {
        throw new Error('Không tìm thấy thư mục cache.');
    }

    const destination =
        `${cacheRoot}zoo-offline/${language}/${mediaPath}`;

    const cached = await FileSystem.getInfoAsync(destination);

    if (cached.exists && (cached.size ?? 0) > 0) {
        return destination;
    }

    const zip = await openOfflineZip(language);

    if (!zip) {
        return null;
    }

    const entry = zip.file(mediaPath);

    if (!entry) {
        return null;
    }

    const base64 = await entry.async('base64');

    const padding = base64.endsWith('==')
        ? 2
        : base64.endsWith('=')
            ? 1
            : 0;

    const estimatedBytes =
        base64.length * 3 / 4 - padding;

    if (estimatedBytes > MAX_MEDIA_BYTES) {
        throw new Error('File media Offline quá lớn.');
    }

    const lastSlash = destination.lastIndexOf('/');
    const directory = destination.slice(0, lastSlash);

    await FileSystem.makeDirectoryAsync(directory, {
        intermediates: true,
    });

    await FileSystem.writeAsStringAsync(
        destination,
        base64,
        {
            encoding: FileSystem.EncodingType.Base64,
        }
    );

    return destination;
}

// Lấy ảnh đầu tiên của một POI.
export async function getOfflinePoiImage(
    language: string,
    poiId: string
): Promise<string | null> {
    const manifest = await readOfflinePackage(language);

    if (!manifest) {
        return null;
    }

    const poi = manifest.pois.find(
        item => item.id === poiId
    );

    const imagePath = poi?.images?.[0]?.path;

    if (!imagePath) {
        return null;
    }

    return getOfflineMediaUri(
        language,
        imagePath
    );
}

// Lấy audio Offline theo POI.
export async function getOfflinePoiAudio(
    language: string,
    poiId: string
): Promise<string | null> {
    const manifest = await readOfflinePackage(language);

    if (!manifest) {
        return null;
    }

    const audio = manifest.audio.find(
        item => item.poiId === poiId
    );

    if (!audio?.path) {
        return null;
    }

    return getOfflineMediaUri(
        language,
        audio.path
    );
}

// Lấy ảnh bản đồ Offline.
export async function getOfflineMapImage(
    language: string
): Promise<string | null> {
    const manifest = await readOfflinePackage(language);

    if (!manifest) {
        return null;
    }

    if (!manifest.map) {
        return null;
    }

    return getOfflineMediaUri(
        language,
        manifest.map
    );
}
