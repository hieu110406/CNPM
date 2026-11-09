
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppTabs from '@/components/layout/AppTabs';
import { I18nProvider } from '@/context/I18nContext';
import PresenceTracker from '@/components/analytics/PresenceTracker';

// Đăng ký Service Worker trên bản Web đã deploy.
function WebServiceWorker() {
    useEffect(() => {
        // Chỉ sử dụng trên Safari / Chrome.
        if (Platform.OS !== 'web') {
            return;
        }

        // Không bật cache PWA trong lúc lập trình,
        // tránh Safari / Chrome giữ code cũ.
        if (__DEV__) {
            return;
        }

        if (
            typeof window === 'undefined' ||
            typeof navigator === 'undefined' ||
            !('serviceWorker' in navigator)
        ) {
            return;
        }

        // Service Worker yêu cầu HTTPS hoặc localhost.
        if (!window.isSecureContext) {
            console.warn(
                '[Offline] Website cần HTTPS để sử dụng Service Worker.'
            );
            return;
        }

        const registerServiceWorker = async () => {
            try {
                const registration =
                    await navigator.serviceWorker.register('/sw.js', {
                        scope: '/',
                    });

                console.info(
                    '[Offline] Service Worker registered:',
                    registration.scope
                );

                // Kiểm tra có bản Service Worker mới không.
                await registration.update();
            } catch (error) {
                console.warn(
                    '[Offline] Không thể đăng ký Service Worker:',
                    error
                );
            }
        };

        // Đăng ký sau khi trang tải xong.
        if (document.readyState === 'complete') {
            void registerServiceWorker();
        } else {
            window.addEventListener(
                'load',
                registerServiceWorker,
                { once: true }
            );

            return () => {
                window.removeEventListener(
                    'load',
                    registerServiceWorker
                );
            };
        }
    }, []);

    return null;
}

export default function Layout() {
    return (
        <I18nProvider>
            <SafeAreaProvider>
                <StatusBar style="dark" />

                <WebServiceWorker />

                <PresenceTracker />

                <AppTabs />
            </SafeAreaProvider>
        </I18nProvider>
    );
}
