
/*
 * Saigon Zoo - Service Worker
 *
 * Cache giao diện Expo Web để mở lại
 * Trang chủ, Khám phá và Bản đồ khi Offline.
 *
 * ZIP chứa POI, ảnh, audio được lưu riêng
 * bằng IndexedDB trong ứng dụng.
 */

const VERSION = 'v2';

const SHELL_CACHE = `zoo-shell-${VERSION}`;
const ASSET_CACHE = `zoo-assets-${VERSION}`;

const PAGES = ['/', '/explore', '/map'];

const MAX_RUNTIME_FILES = 200;

function sameOrigin(url) {
    return url.origin === self.location.origin;
}

function isStaticAsset(url) {
    return (
        sameOrigin(url) &&
        (
            url.pathname.startsWith('/_expo/') ||
            /\.(js|css|png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf)$/i
                .test(url.pathname)
        )
    );
}

function isValidResponse(response) {
    return (
        response &&
        response.ok &&
        response.type === 'basic'
    );
}

function getReferencedAssets(html, pageUrl) {
    const assets = new Set();

    // Tìm src/href của các file tĩnh
    // được Expo xuất trong HTML từng trang.
    const regex = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;

    let match;

    while ((match = regex.exec(html)) !== null) {
        try {
            const url = new URL(match[1], pageUrl);

            if (
                sameOrigin(url) &&
                (
                    url.pathname.startsWith('/_expo/') ||
                    /\.(js|css)$/i.test(url.pathname)
                )
            ) {
                assets.add(url.href);
            }
        } catch {
            // Bỏ qua URL không hợp lệ.
        }
    }

    return [...assets];
}

async function cachePageAndAssets(
    shellCache,
    assetCache,
    route
) {
    const pageUrl = new URL(
        route,
        self.location.origin
    ).href;

    const response = await fetch(pageUrl, {
        cache: 'reload',
    });

    if (!isValidResponse(response)) {
        throw new Error(
            `Không tải được trang ${route}`
        );
    }

    const contentType =
        response.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
        throw new Error(
            `${route} không trả về HTML`
        );
    }

    const html = await response.clone().text();

    const assets = getReferencedAssets(
        html,
        pageUrl
    );

    // Trang xuất từ Expo cần có tài nguyên JS.
    // Nếu không tìm được, chưa coi là
    // đã chuẩn bị đủ giao diện Offline.
    const javascriptFiles = assets.filter(
        url => /\.js(?:$|\?)/i.test(url)
    );

    if (javascriptFiles.length === 0) {
        throw new Error(
            `Không tìm thấy JavaScript cho ${route}`
        );
    }

    // Cache tài nguyên trước.
    for (const assetUrl of assets) {
        const existing = await assetCache.match(
            assetUrl
        );

        if (existing) {
            continue;
        }

        const assetResponse = await fetch(
            assetUrl,
            { cache: 'reload' }
        );

        if (!isValidResponse(assetResponse)) {
            throw new Error(
                `Không tải được tài nguyên: ${assetUrl}`
            );
        }

        await assetCache.put(
            assetUrl,
            assetResponse
        );
    }

    // Chỉ cache HTML sau khi đã lấy
    // đủ tài nguyên tham chiếu trực tiếp.
    await shellCache.put(
        pageUrl,
        response
    );
}

// ==================== INSTALL ====================

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const shellCache = await caches.open(
            SHELL_CACHE
        );

        const assetCache = await caches.open(
            ASSET_CACHE
        );

        try {
            for (const route of PAGES) {
                await cachePageAndAssets(
                    shellCache,
                    assetCache,
                    route
                );
            }

            // Chỉ kích hoạt bản mới nếu đã
            // cache thành công cả ba trang.
            await self.skipWaiting();
        } catch (error) {
            // Không kích hoạt SW mới khi
            // thiếu tài nguyên thiết yếu.
            await Promise.all([
                caches.delete(SHELL_CACHE),
                caches.delete(ASSET_CACHE),
            ]);

            throw error;
        }
    })());
});

// ==================== ACTIVATE ====================

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();

        await Promise.all(
            cacheNames
                .filter(name =>
                    name.startsWith('zoo-') &&
                    name !== SHELL_CACHE &&
                    name !== ASSET_CACHE
                )
                .map(name => caches.delete(name))
        );

        await self.clients.claim();
    })());
});

// ==================== CACHE MANAGEMENT ====================

async function trimRuntimeCache() {
    const cache = await caches.open(
        ASSET_CACHE
    );

    const keys = await cache.keys();

    if (keys.length <= MAX_RUNTIME_FILES) {
        return;
    }

    const extra =
        keys.length - MAX_RUNTIME_FILES;

    // Không xóa file JS/CSS đã được cache
    // lúc cài đặt: đó là phần thiết yếu
    // để giao diện Offline có thể chạy.
    const removable = keys.filter(request => {
        const url = new URL(request.url);

        return !/\.(js|css)$/i.test(
            url.pathname
        );
    });

    for (const request of removable.slice(0, extra)) {
        await cache.delete(request);
    }
}

// ==================== FETCH ====================

self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    // Backend, Supabase và các nguồn ngoài
    // không được lưu bằng Service Worker này.
    if (!sameOrigin(url)) {
        return;
    }

    if (
        url.pathname.startsWith('/api/') ||
        url.pathname.includes('/offline/download') ||
        url.pathname === '/sw.js'
    ) {
        return;
    }

    // Điều hướng: ưu tiên Web mới nhất
    // khi có mạng, dùng cache khi mất mạng.
    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            const shellCache = await caches.open(
                SHELL_CACHE
            );

            try {
                const response = await fetch(request);

                if (isValidResponse(response)) {
                    const type =
                        response.headers.get('content-type') || '';

                    if (type.includes('text/html')) {
                        await shellCache.put(
                            request,
                            response.clone()
                        );
                    }
                }

                return response;
            } catch {
                const cached =
                    await shellCache.match(request);

                if (cached) {
                    return cached;
                }

                // Expo Router có thể điều hướng
                // dựa trên đường dẫn của trình duyệt.
                const homeUrl = new URL(
                    '/',
                    self.location.origin
                ).href;

                return (
                    await shellCache.match(homeUrl) ||
                    Response.error()
                );
            }
        })());

        return;
    }

    // File tĩnh: ưu tiên bản đã cache.
    if (isStaticAsset(url)) {
        event.respondWith((async () => {
            const assetCache = await caches.open(
                ASSET_CACHE
            );

            const cached =
                await assetCache.match(request);

            if (cached) {
                return cached;
            }

            try {
                const response = await fetch(request);

                if (isValidResponse(response)) {
                    try {
                        await assetCache.put(
                            request,
                            response.clone()
                        );

                        event.waitUntil(
                            trimRuntimeCache()
                        );
                    } catch {
                        // Nếu cache đầy, vẫn dùng mạng.
                    }
                }

                return response;
            } catch {
                return Response.error();
            }
        })());
    }
});
