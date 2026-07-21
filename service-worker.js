const CACHE_NAME = 'comptoir-des-mondes-v4.0.0-build1';
const ASSETS = [
  './', './index.html', './style.css?v=4.0.0-build1', './app.js?v=4.0.0-build1', './expansion.js?v=4.0.0-build1', './manifest.json', './assets/icon.svg',
  './assets/regions/tavern_interior.png', './assets/player/idle_01.png', './assets/player/walk_01.png', './assets/player/carry_01.png',
  './assets/clients/client_red_haired_01.png', './assets/clients/client_red_haired_02.png', './assets/clients/client_red_haired_03.png',
  './assets/clients/client_cat_01.png', './assets/clients/client_cat_02.png', './assets/clients/client_cat_03.png',
  './assets/clients/client_dwarf_01.png', './assets/clients/client_dwarf_02.png', './assets/clients/client_dwarf_03.png',
  './assets/clients/client_elder_01.png', './assets/clients/client_elder_02.png', './assets/clients/client_elder_03.png',
  './assets/clients/seated/red_back_left.png', './assets/clients/seated/red_back_right.png', './assets/clients/seated/red_front_left.png', './assets/clients/seated/red_front_right.png',
  './assets/clients/seated/cat_back_left.png', './assets/clients/seated/cat_back_right.png', './assets/clients/seated/cat_front_left.png', './assets/clients/seated/cat_front_right.png',
  './assets/clients/seated/dwarf_back_left.png', './assets/clients/seated/dwarf_back_right.png', './assets/clients/seated/dwarf_front_left.png', './assets/clients/seated/dwarf_front_right.png',
  './assets/clients/seated/elder_back_left.png', './assets/clients/seated/elder_back_right.png', './assets/clients/seated/elder_front_left.png', './assets/clients/seated/elder_front_right.png',
  './assets/furniture/chairs/chair_back_left.png', './assets/furniture/chairs/chair_back_right.png', './assets/furniture/chairs/chair_front_left.png', './assets/furniture/chairs/chair_front_right.png',
  './assets/furniture/service_counter.png', './assets/furniture/storage_chest.png', './assets/furniture/open_door.png', './assets/stations/prep_station.png',
  './assets/regions/forest.png', './assets/regions/market.png', './assets/stations/workbench.png', './assets/stations/craft_machine.png', './assets/stations/forge.png', './assets/stations/mill.png', './assets/stations/mix_station.png', './assets/stations/press.png',
  './assets/food/vegetables_bundle.png', './assets/food/fruits_basket.png', './assets/food/herbs_bunch.png',
  './assets/resources/plank.png', './assets/resources/nails.png', './assets/resources/gear.png', './assets/resources/coal.png', './assets/resources/ore.png', './assets/resources/rope.png',
  './assets/furniture/table_round.png', './assets/furniture/table_square.png', './assets/furniture/chair.png', './assets/furniture/rug_green.png', './assets/furniture/rug_red.png', './assets/furniture/barrel.png',
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
