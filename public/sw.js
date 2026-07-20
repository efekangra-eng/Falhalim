const CACHE_NAME = 'kahve-fali-cache-v9';
const urlsToCache = [
  '/',
  '/?utm_source=pwa',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/screenshot-desktop.svg',
  '/screenshot-mobile.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (e) {
          console.warn('SW cache add failed for:', url, e);
        }
      }
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache the latest version if successful
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        // Offline fallback
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If it's a navigation request and not in cache, return index.html or root
        if (event.request.mode === 'navigate') {
          return (await cache.match('/?utm_source=pwa')) || 
                 (await cache.match('/')) || 
                 (await cache.match('/index.html'));
        }
      })
  );
});
