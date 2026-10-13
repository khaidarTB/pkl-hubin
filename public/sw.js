/* PKLConnect Service Worker — PWA installability & offline shell */
const VERSION = 'pklconnect-v1';
const APP_SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

const PRECACHE = [
    '/offline.html',
    '/manifest.webmanifest',
    '/favicon.ico',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(APP_SHELL)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => !key.startsWith(VERSION))
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET requests.
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Ignore cross-origin and non-http(s) requests.
    if (url.origin !== self.location.origin) return;

    // Never intercept Inertia XHR/fragment requests — they must stay fresh.
    if (
        request.headers.get('X-Inertia') ||
        request.headers.get('X-Requested-With') === 'XMLHttpRequest'
    ) {
        return;
    }

    // HTML navigations: network-first, offline fallback to cached shell.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(RUNTIME).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    return cached || caches.match('/offline.html');
                })
        );
        return;
    }

    // Hashed build assets: cache-first (immutable).
    if (url.pathname.startsWith('/build/')) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        const copy = response.clone();
                        caches.open(RUNTIME).then((cache) => cache.put(request, copy));
                        return response;
                    })
            )
        );
        return;
    }

    // Other same-origin static files: stale-while-revalidate.
    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(RUNTIME).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
});
