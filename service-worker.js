const CACHE_NAME = 'comptoir-des-mondes-v1.5.0';
const ASSETS = [
  './', './index.html', './style.css?v=1.5.0', './app.js?v=1.5.0', './manifest.json', './assets/icon.svg',
  './assets/regions/tavern_interior.png', './assets/player/idle_01.png', './assets/player/walk_01.png', './assets/player/carry_01.png',
  './assets/furniture/service_counter.png', './assets/furniture/storage_chest.png', './assets/furniture/open_door.png', './assets/stations/prep_station.png',
  './assets/regions/forest.png', './assets/regions/market.png', './assets/stations/workbench.png', './assets/stations/craft_machine.png', './assets/stations/forge.png',
  './assets/food/vegetables_bundle.png', './assets/food/fruits_basket.png', './assets/food/herbs_bunch.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request)));
});
