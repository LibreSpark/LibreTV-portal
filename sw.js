// LibreTV Portal Service Worker - network-first for HTML, stale-while-revalidate for assets
const CACHE_NAME = 'libretv-portal-v3';
const PRECACHE = [
    './',
    './index.html',
    './styles/main.css',
    './scripts/main.js',
    './assets/logo.png',
    './assets/logo-black.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
            .catch(() => { /* offline install best-effort */ })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    // Never cache cross-origin API / analytics
    if (!url.origin.startsWith(self.location.origin) &&
        !url.origin.includes('libretv.is-an.org')) {
        return;
    }

    // Navigation requests: network-first, fall back to cached shell
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
        );
        return;
    }

    // Static assets: stale-while-revalidate
    event.respondWith(
        caches.match(req).then((cached) => {
            const network = fetch(req)
                .then((res) => {
                    if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
                        const copy = res.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
});
