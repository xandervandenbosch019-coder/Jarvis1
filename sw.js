// JARVIS Service Worker
const CACHE = 'jarvis-v1';
const BESTANDEN = [
  '/jarvis-ai.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(BESTANDEN))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // API calls altijd live ophalen
  if (e.request.url.includes('groq.com') ||
      e.request.url.includes('elevenlabs.io') ||
      e.request.url.includes('spotify.com') ||
      e.request.url.includes('open-meteo.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Lokale bestanden: cache first, dan netwerk
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('/jarvis-ai.html'))
  );
});
