
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { Platform } from 'react-native';

const DB_NAME = 'saigon-zoo-offline';
const DB_VERSION = 1;
const STORE_NAME = 'packages';

const MAX_PACKAGE_BYTES = 150 * 1024 * 1024;

type StoredPackage = {
    language: string;
    blob: Blob;
    savedAt: number;
};

export type OfflinePackageMetadata = {
    contentVersion: string;
    version?: string;
    pois?: number;
    images?: number;
    audios?: number;
    languages?: string[];
};

function validateLanguage(language: string): void {
    if (!['vi', 'en', 'zh'].includes(language)) {
        throw new Error('Ngôn ngữ offline không hợp lệ.');
    }
}

// Xác định địa chỉ Backend.
function getApiBaseUrl(): string {
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

    throw new Error(
        'Chưa cấu hình EXPO_PUBLIC_API_URL'
    );
}

// Lấy phiên bản nội dung Offline trên server.
// Hàm này chỉ kiểm tra metadata, không tải ZIP.
export async function getOfflinePackageMetadata(
    language: string
): Promise<OfflinePackageMetadata> {
    validateLanguage(language);

    const url =
        `${getApiBaseUrl()}/offline` +
        `?lang=${encodeURIComponent(language)}`;

    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(
            `Không thể kiểm tra bản cập nhật Offline ` +
            `(HTTP ${response.status}).`
        );
    }

    const data: unknown = await response.json();

    if (
        !data ||
        typeof data !== 'object' ||
        !('contentVersion' in data) ||
        typeof data.contentVersion !== 'string' ||
        !data.contentVersion.trim()
    ) {
        throw new Error(
            'Server chưa hỗ trợ kiểm tra phiên bản Offline.'
        );
    }

    return data as OfflinePackageMetadata;
}

// IndexedDB dành cho Safari/Chrome.
function openOfflineDatabase(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
        return Promise.reject(
            new Error(
                'Trình duyệt không hỗ trợ lưu dữ liệu Offline.'
            )
        );
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: 'language',
                });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(
                request.error ??
                new Error('Không mở được bộ nhớ Offline.')
            );
        };
    });
}

// Đọc ZIP đã lưu trên Web.
export async function getWebOfflinePackage(
    language: string
): Promise<Blob | null> {
    validateLanguage(language);

    if (Platform.OS !== 'web') {
        return null;
    }

    const db = await openOfflineDatabase();

    try {
        return await new Promise<Blob | null>(
            (resolve, reject) => {
                const transaction = db.transaction(
                    STORE_NAME,
                    'readonly'
                );

                const request = transaction
                    .objectStore(STORE_NAME)
                    .get(language);

                request.onsuccess = () => {
                    const record = request.result as
                        | StoredPackage
                        | undefined;

                    resolve(record?.blob ?? null);
                };

                request.onerror = () => {
                    reject(
                        request.error ??
                        new Error(
                            'Không đọc được gói Offline.'
                        )
                    );
                };
            }
        );
    } finally {
        db.close();
    }
}

// Lưu ZIP vào IndexedDB.
// put() thay thế bản cũ có cùng language.
async function saveWebOfflinePackage(
    language: string,
    blob: Blob
): Promise<void> {
    const db = await openOfflineDatabase();

    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(
                STORE_NAME,
                'readwrite'
            );

            transaction.objectStore(STORE_NAME).put({
                language,
                blob,
                savedAt: Date.now(),
            } satisfies StoredPackage);

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = () => {
                reject(
                    transaction.error ??
                    new Error(
                        'Không thể lưu dữ liệu Offline.'
                    )
                );
            };

            transaction.onabort = () => {
                reject(
                    transaction.error ??
                    new Error(
                        'Bộ nhớ Offline đã hủy thao tác lưu.'
                    )
                );
            };
        });
    } finally {
        db.close();
    }
}

// Đường dẫn ZIP trên Android/iOS.
export function offlinePackagePath(
    language: string
): string {
    validateLanguage(language);

    return (
        `${FileSystem.documentDirectory}` +
        `zoo-offline-${language}.zip`
    );
}

// Kiểm tra gói Offline đã được tải hay chưa.
export async function hasOfflinePackage(
    language: string
): Promise<boolean> {
    validateLanguage(language);

    if (Platform.OS === 'web') {
        const blob = await getWebOfflinePackage(language);

        return !!blob && blob.size > 0;
    }

    const info = await FileSystem.getInfoAsync(
        offlinePackagePath(language)
    );

    return info.exists && (info.size ?? 0) > 0;
}

// Xóa gói Offline.
export async function removeOfflinePackage(
    language: string
): Promise<void> {
    validateLanguage(language);

    if (Platform.OS === 'web') {
        const db = await openOfflineDatabase();

        try {
            await new Promise<void>(
                (resolve, reject) => {
                    const transaction = db.transaction(
                        STORE_NAME,
                        'readwrite'
                    );

                    transaction
                        .objectStore(STORE_NAME)
                        .delete(language);

                    transaction.oncomplete = () => {
                        resolve();
                    };

                    transaction.onerror = () => {
                        reject(
                            transaction.error ??
                            new Error(
                                'Không thể xóa gói Offline.'
                            )
                        );
                    };

                    transaction.onabort = () => {
                        reject(
                            transaction.error ??
                            new Error(
                                'Không thể xóa gói Offline.'
                            )
                        );
                    };
                }
            );
        } finally {
            db.close();
        }

        return;
    }

    await FileSystem.deleteAsync(
        offlinePackagePath(language),
        { idempotent: true }
    );

    // Xóa cả media cache liên quan.
    if (FileSystem.cacheDirectory) {
        await FileSystem.deleteAsync(
            `${FileSystem.cacheDirectory}` +
            `zoo-offline/${language}`,
            { idempotent: true }
        );
    }
}

// Kiểm tra manifest chung cho gói mới.
function validateManifest(
    manifest: unknown,
    language: string
): void {
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
        typeof manifest.map !== 'string' ||
        !('contentVersion' in manifest) ||
        typeof manifest.contentVersion !== 'string' ||
        !manifest.contentVersion.trim()
    ) {
        throw new Error(
            'Nội dung hoặc phiên bản gói Offline không hợp lệ.'
        );
    }
}

// Tải ZIP trên Safari/Chrome.
async function downloadWebPackage(
    language: string,
    onProgress: (progress: number) => void
): Promise<string> {
    const url =
        `${getApiBaseUrl()}/offline/download` +
        `?lang=${encodeURIComponent(language)}` +
        '&platform=web';

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Không thể tải gói Offline ` +
            `(HTTP ${response.status}).`
        );
    }

    const contentLength = Number(
        response.headers.get('content-length') || 0
    );

    if (contentLength > MAX_PACKAGE_BYTES) {
        throw new Error(
            'Gói Offline vượt quá giới hạn 150 MB.'
        );
    }

    if (!response.body) {
        throw new Error(
            'Trình duyệt không đọc được dữ liệu tải về.'
        );
    }

    const reader = response.body.getReader();

    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let downloadedBytes = 0;

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;
            if (!value) continue;

            downloadedBytes += value.byteLength;

            if (downloadedBytes > MAX_PACKAGE_BYTES) {
                await reader.cancel();

                throw new Error(
                    'Gói Offline vượt quá giới hạn 150 MB.'
                );
            }

            const buffer = new ArrayBuffer(
                value.byteLength
            );

            new Uint8Array(buffer).set(value);

            chunks.push(new Uint8Array(buffer));

            if (contentLength > 0) {
                onProgress(
                    Math.min(
                        95,
                        Math.floor(
                            (
                                downloadedBytes /
                                contentLength
                            ) * 95
                        )
                    )
                );
            }
        }
    } finally {
        reader.releaseLock();
    }

    if (downloadedBytes === 0) {
        throw new Error(
            'Gói Offline tải về bị rỗng.'
        );
    }

    const blob = new Blob(chunks, {
        type: 'application/zip',
    });

    onProgress(96);

    let zip: JSZip;

    try {
        zip = await JSZip.loadAsync(blob, {
            checkCRC32: true,
        });
    } catch {
        throw new Error(
            'File Offline bị lỗi hoặc không phải ZIP hợp lệ.'
        );
    }

    const manifestFile = zip.file('manifest.json');

    if (!manifestFile) {
        throw new Error(
            'Gói Offline thiếu manifest.json.'
        );
    }

    let manifest: unknown;

    try {
        const manifestText =
            await manifestFile.async('string');

        manifest = JSON.parse(manifestText);
    } catch {
        throw new Error(
            'Không đọc được manifest Offline.'
        );
    }

    validateManifest(manifest, language);

    onProgress(98);

    // ZIP cũ chỉ được thay thế sau khi ZIP mới
    // đã tải xong và kiểm tra thành công.
    await saveWebOfflinePackage(
        language,
        blob
    );

    const savedBlob =
        await getWebOfflinePackage(language);

    if (
        !savedBlob ||
        savedBlob.size !== blob.size
    ) {
        throw new Error(
            'Không xác nhận được gói Offline đã lưu.'
        );
    }

    onProgress(100);

    return `indexeddb://zoo-offline-${language}`;
}

// Tải ZIP trên Android/iOS.
async function downloadNativePackage(
    language: string,
    onProgress: (progress: number) => void
): Promise<string> {
    const platform =
        Platform.OS === 'ios' ? 'ios' : 'android';

    const url =
        `${getApiBaseUrl()}/offline/download` +
        `?lang=${encodeURIComponent(language)}` +
        `&platform=${platform}`;

    const cacheDirectory = FileSystem.cacheDirectory;

    if (!cacheDirectory) {
        throw new Error(
            'Không tìm thấy thư mục cache của thiết bị.'
        );
    }

    const tempPath =
        `${cacheDirectory}zoo-offline-${language}.part`;

    const destination =
        offlinePackagePath(language);

    const backup =
        `${destination}.backup`;

    const mediaCache =
        `${cacheDirectory}zoo-offline/${language}`;

    await FileSystem.deleteAsync(tempPath, {
        idempotent: true,
    });

    const download = FileSystem.createDownloadResumable(
        url,
        tempPath,
        {},
        ({
            totalBytesWritten,
            totalBytesExpectedToWrite,
        }) => {
            if (totalBytesExpectedToWrite > 0) {
                onProgress(
                    Math.min(
                        95,
                        Math.floor(
                            (
                                totalBytesWritten /
                                totalBytesExpectedToWrite
                            ) * 95
                        )
                    )
                );
            }
        }
    );

    try {
        const result = await download.downloadAsync();

        if (!result || result.status !== 200) {
            throw new Error(
                `Download thất bại: ` +
                `${result?.status ?? 'UNKNOWN'}`
            );
        }

        if (!result.uri) {
            throw new Error(
                'Không tìm thấy file đã tải.'
            );
        }

        const fileInfo =
            await FileSystem.getInfoAsync(result.uri);

        if (
            !fileInfo.exists ||
            (fileInfo.size ?? 0) === 0
        ) {
            throw new Error(
                'Package tải về bị rỗng.'
            );
        }

        if (
            (fileInfo.size ?? 0) >
            MAX_PACKAGE_BYTES
        ) {
            throw new Error(
                'Gói Offline vượt quá giới hạn 150 MB.'
            );
        }

        // Kiểm tra ZIP trên thiết bị trước khi
        // thay thế gói cũ.
        onProgress(96);

        try {
            const base64 =
                await FileSystem.readAsStringAsync(
                    result.uri,
                    {
                        encoding:
                            FileSystem.EncodingType.Base64,
                    }
                );

            const zip = await JSZip.loadAsync(
                base64,
                {
                    base64: true,
                    checkCRC32: true,
                }
            );

            const manifestFile =
                zip.file('manifest.json');

            if (!manifestFile) {
                throw new Error(
                    'Gói Offline thiếu manifest.json.'
                );
            }

            const manifestText =
                await manifestFile.async('string');

            validateManifest(
                JSON.parse(manifestText),
                language
            );
        } catch {
            throw new Error(
                'Gói Offline mới bị lỗi hoặc không hợp lệ.'
            );
        }

        onProgress(98);

        // Sao lưu bản cũ trước khi ghi bản mới.
        await FileSystem.deleteAsync(backup, {
            idempotent: true,
        });

        const oldPackage =
            await FileSystem.getInfoAsync(destination);

        if (oldPackage.exists) {
            await FileSystem.moveAsync({
                from: destination,
                to: backup,
            });
        }

        try {
            await FileSystem.moveAsync({
                from: result.uri,
                to: destination,
            });
        } catch (error) {
            // Khôi phục gói cũ nếu thay thế lỗi.
            const backupInfo =
                await FileSystem.getInfoAsync(backup);

            if (backupInfo.exists) {
                await FileSystem.deleteAsync(
                    destination,
                    { idempotent: true }
                );

                await FileSystem.moveAsync({
                    from: backup,
                    to: destination,
                });
            }

            throw error;
        }

        // Gói mới đã được lưu.
        // Xóa cache media cũ để lần đọc tiếp theo
        // lấy nội dung từ ZIP mới.
        try {
            await FileSystem.deleteAsync(
                mediaCache,
                { idempotent: true }
            );
        } catch (error) {
            if (__DEV__) {
                console.warn(
                    'Không thể xóa media cache:',
                    error
                );
            }
        }

        await FileSystem.deleteAsync(backup, {
            idempotent: true,
        });

        onProgress(100);

        return destination;
    } catch (error) {
        await FileSystem.deleteAsync(tempPath, {
            idempotent: true,
        });

        throw error;
    }
}

// Hàm chung cho Web, Android và iOS.
// Khi language đã có gói ZIP, bản tải mới sẽ
// thay thế gói cũ sau khi tải thành công.
export async function downloadOfflinePackage(
    language: string,
    onProgress: (progress: number) => void
): Promise<string> {
    validateLanguage(language);

    if (Platform.OS === 'web') {
        return downloadWebPackage(
            language,
            onProgress
        );
    }

    return downloadNativePackage(
        language,
        onProgress
    );
}
