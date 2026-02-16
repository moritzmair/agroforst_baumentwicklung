const CACHE_NAME = 'baumentwicklung-v5';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './js/app.js',
    './js/state.js',
    './js/storage.js',
    './js/helpers.js',
    './js/navigation.js',
    './js/gps.js',
    './js/csv.js',
    './js/map.js',
    './js/form.js',
    './js/help.js',
    './manifest.json',
    './images/trieb.jpg',
    './images/foerstner_kalibration.jpg',
    './images/foerstner_seite.jpg',
    './images/foerstner_ego.jpg',
    './images/neigung.png'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch from cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Update Service Worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});