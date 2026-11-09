
import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system/legacy';
import { offlinePackagePath } from './offline';

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

const MAX_PACKAGE_BYTES = 100 * 1024 * 1024;
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

// Đọc file ZIP đã tải trên điện thoại.
async function openOfflineZip(
    language: string
): Promise<JSZip | null> {
    validateLanguage(language);

    const path = offlinePackagePath(language);
    const info = await FileSystem.getInfoAsync(path);

    if (!info.exists || (info.size ?? 0) === 0) {
        return null;
    }

    if ((info.size ?? 0) > MAX_PACKAGE_BYTES) {
        throw new Error('Package vượt quá kích thước cho phép.');
    }

    const base64 = await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem.EncodingType.Base64,
    });

    return JSZip.loadAsync(base64, {
        base64: true,
        checkCRC32: true,
    });
}

// Đọc manifest.json từ ZIP.
export async function readOfflinePackage(
    language: string
): Promise<OfflineManifest | null> {
    const zip = await openOfflineZip(language);

    if (!zip) {
        return null;
    }

    const manifestFile = zip.file('manifest.json');

    if (!manifestFile) {
        throw new Error('Package thiếu manifest.json');
    }

    const text = await manifestFile.async('string');
    const manifest: unknown = JSON.parse(text);

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
        throw new Error('Manifest offline không hợp lệ');
    }

    return manifest as OfflineManifest;
}

// Lấy danh sách POI offline.
export async function getOfflinePois(
    language: string
): Promise<OfflinePoi[] | null> {
    const manifest = await readOfflinePackage(language);

    return manifest ? manifest.pois : null;
}

// Lấy file ảnh/audio/bản đồ từ ZIP,
// lưu tạm thành file để React Native sử dụng.
export async function getOfflineMediaUri(
    language: string,
    mediaPath: string
): Promise<string | null> {
    validateLanguage(language);
    validateMediaPath(mediaPath);

    const packageInfo = await FileSystem.getInfoAsync(
        offlinePackagePath(language)
    );

    if (!packageInfo.exists || (packageInfo.size ?? 0) === 0) {
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

    // Kiểm tra kích thước file sau khi giải mã.
    const padding = base64.endsWith('==')
        ? 2
        : base64.endsWith('=')
            ? 1
            : 0;

    const estimatedBytes = base64.length * 3 / 4 - padding;

    if (estimatedBytes > MAX_MEDIA_BYTES) {
        throw new Error('File media quá lớn.');
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
        (item) => item.id === poiId
    );

    const imagePath = poi?.images?.[0]?.path;

    if (!imagePath) {
        return null;
    }

    return getOfflineMediaUri(language, imagePath);
}

// Lấy audio theo POI.
export async function getOfflinePoiAudio(
    language: string,
    poiId: string
): Promise<string | null> {
    const manifest = await readOfflinePackage(language);

    if (!manifest) {
        return null;
    }

    const audio = manifest.audio.find(
        (item) => item.poiId === poiId
    );

    if (!audio) {
        return null;
    }

    return getOfflineMediaUri(language, audio.path);
}

// Lấy ảnh bản đồ offline.
export async function getOfflineMapImage(
    language: string
): Promise<string | null> {
    const manifest = await readOfflinePackage(language);

    if (!manifest) {
        return null;
    }

    return getOfflineMediaUri(language, manifest.map);
}
