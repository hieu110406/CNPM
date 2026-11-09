
import {
    ScrollViewStyleReset,
    useServerDocumentContext,
} from 'expo-router/html';

import type { PropsWithChildren } from 'react';

/**
 * HTML gốc dành riêng cho Expo Web.
 *
 * File này chạy khi Expo tạo HTML,
 * không chạy trực tiếp trên Android/iOS.
 */
export default function RootHtml({
    children,
}: PropsWithChildren) {
    const {
        headNodes,
        bodyNodes,
        htmlAttributes,
        bodyAttributes,
    } = useServerDocumentContext();

    return (
        <html lang="vi" {...htmlAttributes}>
            <head>
                <meta charSet="utf-8" />

                <meta
                    httpEquiv="X-UA-Compatible"
                    content="IE=edge"
                />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, shrink-to-fit=no"
                />

                <meta
                    name="theme-color"
                    content="#205E48"
                />

                <meta
                    name="description"
                    content="Khám phá Thảo Cầm Viên Sài Gòn qua bản đồ, thông tin động vật và nội dung hỗ trợ Offline."
                />

                <link
                    rel="manifest"
                    href="/manifest.webmanifest"
                />

                <meta
                    name="apple-mobile-web-app-capable"
                    content="yes"
                />

                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />

                <meta
                    name="apple-mobile-web-app-title"
                    content="Saigon Zoo"
                />

                <ScrollViewStyleReset />

                {headNodes}
            </head>

            <body {...bodyAttributes}>
                {children}

                {bodyNodes}
            </body>
        </html>
    );
}
