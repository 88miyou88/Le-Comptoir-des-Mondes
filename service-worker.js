const CACHE_NAME = 'comptoir-des-mondes-v1.1.1';
const ASSETS = [
  "./",
  "./index.html",
  "./style.css?v=1.1.0",
  "./app.js?v=1.1.0",
  "./manifest.json",
  "./assets/icon.svg",
  "./assets/pixel/apple_crate.png",
  "./assets/pixel/banner.png",
  "./assets/pixel/barrel.png",
  "./assets/pixel/basket.png",
  "./assets/pixel/bowl.png",
  "./assets/pixel/bread.png",
  "./assets/pixel/carrot.png",
  "./assets/pixel/cash_register.png",
  "./assets/pixel/chalkboard.png",
  "./assets/pixel/cheese.png",
  "./assets/pixel/client_cat.png",
  "./assets/pixel/client_dwarf.png",
  "./assets/pixel/client_elder.png",
  "./assets/pixel/client_red.png",
  "./assets/pixel/coal.png",
  "./assets/pixel/coffee.png",
  "./assets/pixel/coffee_machine.png",
  "./assets/pixel/craft_machine.png",
  "./assets/pixel/crate.png",
  "./assets/pixel/cutting_board.png",
  "./assets/pixel/cutting_table.png",
  "./assets/pixel/display_case.png",
  "./assets/pixel/door_closed.png",
  "./assets/pixel/door_open.png",
  "./assets/pixel/fabric.png",
  "./assets/pixel/fish.png",
  "./assets/pixel/floor_dark.png",
  "./assets/pixel/floor_light.png",
  "./assets/pixel/flour.png",
  "./assets/pixel/flowers.png",
  "./assets/pixel/forge.png",
  "./assets/pixel/fruits.png",
  "./assets/pixel/garlic.png",
  "./assets/pixel/gear.png",
  "./assets/pixel/glass.png",
  "./assets/pixel/grilled_fish.png",
  "./assets/pixel/herbs.png",
  "./assets/pixel/ingot.png",
  "./assets/pixel/knife.png",
  "./assets/pixel/ladle.png",
  "./assets/pixel/lamp.png",
  "./assets/pixel/logo.png",
  "./assets/pixel/mill.png",
  "./assets/pixel/mix_station.png",
  "./assets/pixel/mug.png",
  "./assets/pixel/mushroom.png",
  "./assets/pixel/nails.png",
  "./assets/pixel/ore.png",
  "./assets/pixel/oven.png",
  "./assets/pixel/pan.png",
  "./assets/pixel/plank.png",
  "./assets/pixel/plant.png",
  "./assets/pixel/plate.png",
  "./assets/pixel/player_carry.png",
  "./assets/pixel/player_idle.png",
  "./assets/pixel/player_walk.png",
  "./assets/pixel/pot.png",
  "./assets/pixel/prep_station.png",
  "./assets/pixel/press.png",
  "./assets/pixel/room.png",
  "./assets/pixel/rope.png",
  "./assets/pixel/rug_green.png",
  "./assets/pixel/rug_red.png",
  "./assets/pixel/sack.png",
  "./assets/pixel/service_cart.png",
  "./assets/pixel/service_counter.png",
  "./assets/pixel/shelf.png",
  "./assets/pixel/sign.png",
  "./assets/pixel/skewer.png",
  "./assets/pixel/soup.png",
  "./assets/pixel/spatula.png",
  "./assets/pixel/spices.png",
  "./assets/pixel/stone.png",
  "./assets/pixel/storage_chest.png",
  "./assets/pixel/stove.png",
  "./assets/pixel/sugar.png",
  "./assets/pixel/tart.png",
  "./assets/pixel/tile_cream.png",
  "./assets/pixel/tile_stone.png",
  "./assets/pixel/tray.png",
  "./assets/pixel/vegetables.png",
  "./assets/pixel/wall_corner.png",
  "./assets/pixel/wall_herbs.png",
  "./assets/pixel/wall_straight.png",
  "./assets/pixel/window.png",
  "./assets/pixel/wood.png",
  "./assets/pixel/workbench.png",
  "./assets/pixel/zone_forest.png",
  "./assets/pixel/zone_market.png",
  "./assets/pixel/zone_mine.png",
  "./assets/pixel/zone_sea.png"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
