const CACHE_NAME = 'karaoke-helper-v2';
const ASSETS = [
  './', './index.html', './light.html', './assets/app.css',
  './src/common.mjs', './src/lighting.mjs', './src/light-clock.mjs',
  './manifest.webmanifest', './icons/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(ASSETS))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith('karaoke-helper-') && name !== CACHE_NAME)
      .map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // オンライン時には新しい版を優先し、オフライン時は保存済みの画面を使う。
  event.respondWith(fetch(request).then(response => {
    if (response.ok) {
      const cachedCopy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, cachedCopy)));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    return Response.error();
  }));
});
