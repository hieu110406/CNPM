
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// Xác định địa chỉ Backend
function getApiBaseUrl(): string {
    const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

    if (configured) {
        return configured.replace(/\/+$/, '');
    }

    // Khi chạy Expo Web
    if (
        __DEV__ &&
        Platform.OS === 'web' &&
        typeof window !== 'undefined'
    ) {
        return `${window.location.protocol}//${window.location.hostname}:5000/api`;
    }

    // Khi chạy Android/iOS bằng Expo trong mạng LAN
    const host = Constants.expoConfig?.hostUri;

    if (__DEV__ && host) {
        const hostname = new URL(`http://${host}`).hostname;
        return `http://${hostname}:5000/api`;
    }

    throw new Error('Chưa cấu hình EXPO_PUBLIC_API_URL');
}

// Đường dẫn lưu package trong thiết bị
export function offlinePackagePath(language: string): string {
    return `${FileSystem.documentDirectory}zoo-offline-${language}.zip`;
}

// Kiểm tra package đã tồn tại chưa
export async function hasOfflinePackage(
    language: string
): Promise<boolean> {
    const path = offlinePackagePath(language);
    const info = await FileSystem.getInfoAsync(path);

    return info.exists && (info.size ?? 0) > 0;
}

// Xóa package đã tải
export async function removeOfflinePackage(
    language: string
): Promise<void> {
    await FileSystem.deleteAsync(
        offlinePackagePath(language),
        { idempotent: true }
    );
}

// Tải package offline từ Backend
export async function downloadOfflinePackage(
    language: string,
    onProgress: (progress: number) => void
): Promise<string> {
    if (Platform.OS === 'web') {
        throw new Error(
            'Chức năng này dành cho Android/iOS.'
        );
    }

    const platform = Platform.OS === 'ios'
        ? 'ios'
        : 'android';

    const url =
        `${getApiBaseUrl()}/offline/download` +
        `?lang=${encodeURIComponent(language)}` +
        `&platform=${platform}`;

    const tempPath =
        `${FileSystem.cacheDirectory}zoo-offline-${language}.part`;

    // Xóa file tải dở cũ
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
                const percent = Math.min(
                    99,
                    Math.floor(
                        (totalBytesWritten /
                            totalBytesExpectedToWrite) * 100
                    )
                );

                onProgress(percent);
            }
        }
    );

    try {
        const result = await download.downloadAsync();

        if (!result || result.status !== 200) {
            throw new Error(
                `Download thất bại: ${result?.status ?? 'UNKNOWN'}`
            );
        }

        if (!result.uri) {
            throw new Error('Không tìm thấy file đã tải.');
        }

        const fileInfo = await FileSystem.getInfoAsync(result.uri);

        if (!fileInfo.exists || (fileInfo.size ?? 0) === 0) {
            throw new Error('Package tải về bị rỗng.');
        }

        const destination = offlinePackagePath(language);

        // Chỉ thay file cũ khi đã tải xong file mới
        await FileSystem.deleteAsync(destination, {
            idempotent: true,
        });

        await FileSystem.moveAsync({
            from: result.uri,
            to: destination,
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
