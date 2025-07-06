const CACHE_NAME = 'prayer-times-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/c.css',
  '/c.js',
  '/mosque.png',
  '/mosque-192.png',
  '/mosque-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});