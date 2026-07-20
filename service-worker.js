const CACHE_NAME = 'comptoir-des-mondes-v2.0.0-build5';
const ASSETS = [
  './', './index.html', './style.css?v=2.0.0-build5', './app.js?v=2.0.0-build5', './expansion.js?v=2.0.0-build5', './manifest.json', './assets/icon.svg',
  './assets/regions/tavern_interior.png', './assets/player/idle_01.png', './assets/player/walk_01.png', './assets/player/carry_01.png',
  './assets/furniture/service_counter.png', './assets/furniture/storage_chest.png', './assets/furniture/open_door.png', './assets/stations/prep_station.png',
  './assets/regions/forest.png', './assets/regions/market.png', './assets/stations/workbench.png', './assets/stations/craft_machine.png', './assets/stations/forge.png',
  './assets/food/vegetables_bundle.png', './assets/food/fruits_basket.png', './assets/food/herbs_bunch.png',
  './assets/resources/plank.png', './assets/resources/nails.png', './assets/resources/gear.png', './assets/resources/coal.png', './assets/resources/ore.png', './assets/resources/rope.png',
  './assets/furniture/table_square.png', './assets/furniture/rug_green.png', './assets/furniture/rug_red.png', './assets/furniture/barrel.png',
  './assets/stations/oven.png', './assets/stations/coffee_machine.png', './assets/stations/display_case.png', './assets/npcs/tavern_worker_female_01.png'
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
