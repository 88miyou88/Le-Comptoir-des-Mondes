(() => {
  'use strict';

  const C = window.ComptoirCore;
  if (!C) return;

  const EXTRA_ITEMS = {
    ore: { name: 'Minerai', icon: '⛏️' },
    coal: { name: 'Charbon', icon: '⬛' },
    plank: { name: 'Planche', icon: '🪵' },
    rope: { name: 'Corde', icon: '🪢' },
    nails: { name: 'Clous', icon: '📌' },
    gear: { name: 'Engrenage', icon: '⚙️' },
    flour: { name: 'Farine', icon: '🌾' },
    dough: { name: 'Pâte', icon: '🥣' },
    compote: { name: 'Compote', icon: '🍎' },
    chopped_veg: { name: 'Légumes découpés', icon: '🥕' },
    glass_panel: { name: 'Plaque de verre', icon: '🪟' },
    plate_component: { name: 'Assiettes', icon: '🍽️' },
    bowl_component: { name: 'Bols', icon: '🥣' }
  };

  Object.assign(C.ITEMS, EXTRA_ITEMS);
  Object.assign(C.ASSET_PATHS, {
    coal: 'assets/resources/coal.png', plank: 'assets/resources/plank.png', rope: 'assets/resources/rope.png', nails: 'assets/resources/nails.png', gear_component: 'assets/resources/gear.png', flour: 'assets/resources/flour_bowl.png', dough: 'assets/food/bowl.png', compote: 'assets/resources/apple_crate.png', chopped_veg: 'assets/food/vegetables_bundle.png', glass_panel: 'assets/resources/glass.png', plate_component: 'assets/food/plate.png', bowl_component: 'assets/food/bowl.png',
    table_square: 'assets/furniture/table_square.png', rug_green: 'assets/furniture/rug_green.png', rug_red: 'assets/furniture/rug_red.png', barrel: 'assets/furniture/barrel.png', forge: 'assets/stations/forge.png', mill: 'assets/stations/mill.png', press: 'assets/stations/press.png', mix_station: 'assets/stations/mix_station.png', stove: 'assets/stations/stove.png', worker: 'assets/npcs/tavern_worker_female_01.png', zone_mountain: 'assets/regions/mine.png', zone_night: 'assets/regions/market.png', zone_greenhouse: 'assets/regions/forest.png'
  });
  Object.assign(C.ITEM_ASSETS, {
    ore: 'ore', coal: 'coal', plank: 'plank', rope: 'rope', nails: 'nails', gear: 'gear_component', flour: 'flour', dough: 'dough', compote: 'compote', chopped_veg: 'chopped_veg', glass_panel: 'glass_panel', plate_component: 'plate_component', bowl_component: 'bowl_component'
  });

  const EXTRA_RECIPES = [
    { id: 'veggie_bowl', name: 'Bol du potager', icon: '🥗', prep: 9, price: 78, rep: 4, ingredients: { chopped_veg: 2, bowl_component: 1 }, unlock: s => s.reputation >= 180, tag: 'Transformé' },
    { id: 'artisan_tart', name: 'Tarte artisanale', icon: '🥧', prep: 14, price: 145, rep: 7, ingredients: { dough: 1, compote: 1, plate_component: 1 }, unlock: s => s.reputation >= 320, tag: 'Artisanat' },
    { id: 'mountain_stew', name: 'Mijoté montagnard', icon: '🍲', prep: 16, price: 230, rep: 10, ingredients: { mushrooms: 2, chopped_veg: 1, bowl_component: 1 }, unlock: s => s.unlockedZones.includes('mountain'), tag: 'Montagne' },
    { id: 'night_coffee', name: 'Café de minuit', icon: '☕', prep: 8, price: 180, rep: 8, ingredients: { coffee: 2, sugar: 1 }, unlock: s => s.unlockedZones.includes('night'), tag: 'Nocturne' },
    { id: 'tropical_plate', name: 'Assiette tropicale', icon: '🍍', prep: 15, price: 285, rep: 12, ingredients: { fruits: 3, spices: 1, plate_component: 1 }, unlock: s => s.unlockedZones.includes('greenhouse'), tag: 'Exotique' }
  ];
  EXTRA_RECIPES.forEach(recipe => { if (!C.RECIPES.some(existing => existing.id === recipe.id)) C.RECIPES.push(recipe); });
  Object.assign(C.RECIPE_ASSETS, { veggie_bowl: 'vegetables', artisan_tart: 'tart', mountain_stew: 'soup', night_coffee: 'coffee', tropical_plate: 'fruits' });

  Object.assign(C.FARM_CROPS, {
    flour: { name: 'Blé', asset: 'flour', growMs: 50000, yield: [2, 4] },
    coffee: { name: 'Café', asset: 'coffee', growMs: 58000, yield: [1, 3] },
    mushrooms: { name: 'Champignons', asset: 'mushroom', growMs: 42000, yield: [1, 3] }
  });
  C.FARM_PLOT_POSITIONS.splice(0, C.FARM_PLOT_POSITIONS.length,
    { x: .20, y: .38 }, { x: .40, y: .38 }, { x: .60, y: .38 }, { x: .80, y: .38 },
    { x: .20, y: .67 }, { x: .40, y: .67 }, { x: .60, y: .67 }, { x: .80, y: .67 }
  );

  const existingMine = C.ZONES.find(zone => zone.id === 'mine');
  if (existingMine && !existingMine.nodes.some(node => node.item === 'ore')) {
    existingMine.nodes.push({ item: 'ore', label: 'Minerai brut', icon: '⛏️', min: 1, max: 3 });
    existingMine.nodes.push({ item: 'coal', label: 'Veine de charbon', icon: '⬛', min: 1, max: 2 });
  }

  const EXTRA_ZONES = [
    { id: 'mountain', name: 'Montagne Glacée', icon: '🏔️', className: 'mountain', repNeed: 1600, unlockCost: { coins: 42000, plank: 30, metal: 20 }, description: 'Minerais denses, cristaux froids et bois ancien.', nodes: [
      { item: 'ore', label: 'Faille gelée', icon: '⛏️', min: 2, max: 4 }, { item: 'coal', label: 'Grotte noire', icon: '⬛', min: 2, max: 3 }, { item: 'crystal', label: 'Cristal de givre', icon: '💎', min: 1, max: 2 }, { item: 'wood', label: 'Pin ancien', icon: '🌲', min: 2, max: 4 }
    ]},
    { id: 'night', name: 'Ville Nocturne', icon: '🌙', className: 'night', repNeed: 2400, unlockCost: { coins: 70000, glass_panel: 18, gear: 12 }, description: 'Marché tardif, composants fins et clientèle nocturne.', nodes: [
      { item: 'coffee', label: 'Café de nuit', icon: '☕', min: 2, max: 4 }, { item: 'fabric', label: 'Échoppe textile', icon: '🧵', min: 2, max: 4 }, { item: 'gear', label: 'Horloger', icon: '⚙️', min: 1, max: 2 }, { item: 'glass', label: 'Verrier', icon: '🪟', min: 2, max: 3 }
    ]},
    { id: 'greenhouse', name: 'Serre Tropicale', icon: '🌴', className: 'greenhouse', repNeed: 3500, unlockCost: { coins: 110000, glass_panel: 30, metal: 24 }, description: 'Cultures exotiques, fruits rares et épices délicates.', nodes: [
      { item: 'fruits', label: 'Verger tropical', icon: '🍍', min: 3, max: 5 }, { item: 'spices', label: 'Carré aromatique', icon: '🌿', min: 2, max: 4 }, { item: 'coffee', label: 'Caféier rare', icon: '☕', min: 2, max: 4 }, { item: 'vegetables', label: 'Potager chaud', icon: '🥕', min: 3, max: 5 }
    ]}
  ];
  EXTRA_ZONES.forEach(zone => { if (!C.ZONES.some(existing => existing.id === zone.id)) C.ZONES.push(zone); });
  Object.assign(C.ZONE_ART, { mountain: 'zone_mountain', night: 'zone_night', greenhouse: 'zone_greenhouse' });

  const CRAFT_RECIPES = [
    { id: 'planks', name: 'Scier des planches', category: 'material', room: 'industry', asset: 'plank', duration: 4, inputs: { wood: 2 }, output: { type: 'item', id: 'plank', qty: 2 }, rep: 0 },
    { id: 'rope', name: 'Tresser une corde', category: 'material', room: 'industry', asset: 'rope', duration: 5, inputs: { fabric: 2 }, output: { type: 'item', id: 'rope', qty: 1 }, rep: 10 },
    { id: 'ingots', name: 'Fondre des lingots', category: 'material', room: 'industry', asset: 'ingot', duration: 8, inputs: { ore: 2, coal: 1 }, output: { type: 'item', id: 'metal', qty: 2 }, rep: 80 },
    { id: 'glass_panels', name: 'Former des plaques de verre', category: 'material', room: 'industry', asset: 'glass_panel', duration: 7, inputs: { glass: 2, coal: 1 }, output: { type: 'item', id: 'glass_panel', qty: 2 }, rep: 150 },
    { id: 'dough', name: 'Pétrir de la pâte', category: 'material', room: 'industry', asset: 'dough', duration: 4, inputs: { flour: 2, sugar: 1 }, output: { type: 'item', id: 'dough', qty: 2 }, rep: 20 },
    { id: 'chopped_veg', name: 'Découper des légumes', category: 'material', room: 'industry', asset: 'chopped_veg', duration: 3, inputs: { vegetables: 2 }, output: { type: 'item', id: 'chopped_veg', qty: 2 }, rep: 0 },
    { id: 'compote', name: 'Cuire une compote', category: 'material', room: 'industry', asset: 'compote', duration: 6, inputs: { fruits: 2, sugar: 1 }, output: { type: 'item', id: 'compote', qty: 2 }, rep: 40 },
    { id: 'nails', name: 'Forger des clous', category: 'component', room: 'industry', asset: 'nails', duration: 5, inputs: { metal: 1 }, output: { type: 'item', id: 'nails', qty: 4 }, rep: 30 },
    { id: 'gears', name: 'Tailler un engrenage', category: 'component', room: 'industry', asset: 'gear_component', duration: 7, inputs: { metal: 2 }, output: { type: 'item', id: 'gear', qty: 1 }, rep: 120 },
    { id: 'plates', name: 'Façonner des assiettes', category: 'component', room: 'industry', asset: 'plate_component', duration: 5, inputs: { stone: 1 }, output: { type: 'item', id: 'plate_component', qty: 2 }, rep: 20 },
    { id: 'bowls', name: 'Creuser des bols', category: 'component', room: 'industry', asset: 'bowl_component', duration: 5, inputs: { wood: 1 }, output: { type: 'item', id: 'bowl_component', qty: 2 }, rep: 20 },

    { id: 'chair', name: 'Chaise', category: 'furniture', room: 'carpentry', asset: 'chair', duration: 9, inputs: { plank: 2, nails: 1 }, output: { type: 'furniture', id: 'chair', qty: 1 }, rep: 0 },
    { id: 'table_round', name: 'Table ronde', category: 'furniture', room: 'carpentry', asset: 'table_round', duration: 16, inputs: { plank: 5, nails: 2 }, output: { type: 'furniture', id: 'table_round', qty: 1 }, rep: 20 },
    { id: 'table_square', name: 'Table carrée', category: 'furniture', room: 'carpentry', asset: 'table_square', duration: 18, inputs: { plank: 6, nails: 2 }, output: { type: 'furniture', id: 'table_square', qty: 1 }, rep: 80 },
    { id: 'shelf', name: 'Étagère', category: 'furniture', room: 'carpentry', asset: 'shelf', duration: 14, inputs: { plank: 4, nails: 2 }, output: { type: 'furniture', id: 'shelf', qty: 1 }, rep: 50 },
    { id: 'chest', name: 'Coffre de rangement', category: 'furniture', room: 'carpentry', asset: 'storage_chest', duration: 15, inputs: { plank: 4, nails: 2, metal: 1 }, output: { type: 'furniture', id: 'chest', qty: 1 }, rep: 90 },
    { id: 'barrel', name: 'Tonneau', category: 'furniture', room: 'carpentry', asset: 'barrel', duration: 12, inputs: { plank: 3, metal: 1 }, output: { type: 'furniture', id: 'barrel', qty: 1 }, rep: 60 },
    { id: 'rug_green', name: 'Tapis vert', category: 'decor', room: 'carpentry', asset: 'rug_green', duration: 10, inputs: { fabric: 4, rope: 1 }, output: { type: 'furniture', id: 'rug_green', qty: 1 }, rep: 120 },
    { id: 'rug_red', name: 'Tapis rouge', category: 'decor', room: 'carpentry', asset: 'rug_red', duration: 10, inputs: { fabric: 4, rope: 1 }, output: { type: 'furniture', id: 'rug_red', qty: 1 }, rep: 120 },
    { id: 'plant', name: 'Plante en pot', category: 'decor', room: 'carpentry', asset: 'flowers', duration: 7, inputs: { wood: 1, stone: 1, spices: 2 }, output: { type: 'furniture', id: 'plant', qty: 1 }, rep: 30 },

    { id: 'workbench_station', name: 'Établi avancé', category: 'machine', room: 'industry', asset: 'workbench', duration: 22, inputs: { plank: 8, nails: 4, metal: 2 }, output: { type: 'furniture', id: 'workbench_station', qty: 1 }, rep: 150 },
    { id: 'oven_station', name: 'Four artisanal', category: 'machine', room: 'industry', asset: 'oven', duration: 28, inputs: { stone: 8, metal: 5, gear: 1 }, output: { type: 'furniture', id: 'oven_station', qty: 1 }, rep: 220 },
    { id: 'coffee_station', name: 'Machine à café', category: 'machine', room: 'industry', asset: 'coffee_machine', duration: 25, inputs: { metal: 5, gear: 2, glass_panel: 2 }, output: { type: 'furniture', id: 'coffee_station', qty: 1 }, rep: 300 },
    { id: 'display_station', name: 'Vitrine réfrigérée', category: 'machine', room: 'industry', asset: 'display_case', duration: 32, inputs: { plank: 5, metal: 6, glass_panel: 6, gear: 2 }, output: { type: 'furniture', id: 'display_station', qty: 1 }, rep: 450 },
    { id: 'forge_station', name: 'Forge', category: 'machine', room: 'industry', asset: 'forge', duration: 35, inputs: { stone: 10, metal: 8, gear: 3 }, output: { type: 'furniture', id: 'forge_station', qty: 1 }, rep: 600 },
    { id: 'craft_station', name: 'Machine de craft', category: 'machine', room: 'industry', asset: 'craft_machine', duration: 42, inputs: { plank: 8, metal: 10, gear: 5, glass_panel: 3 }, output: { type: 'furniture', id: 'craft_station', qty: 1 }, rep: 900 },

    { id: 'jam_jar', name: 'Pot de compote', category: 'shop', room: 'shop', asset: 'compote', duration: 6, inputs: { compote: 2, glass_panel: 1 }, output: { type: 'shop', id: 'jam_jar', qty: 1 }, rep: 40 },
    { id: 'herb_pouch', name: 'Sachet d’herbes', category: 'shop', room: 'shop', asset: 'spices', duration: 5, inputs: { spices: 3, fabric: 1 }, output: { type: 'shop', id: 'herb_pouch', qty: 1 }, rep: 30 },
    { id: 'picnic_box', name: 'Panier pique-nique', category: 'shop', room: 'shop', asset: 'basket', duration: 10, inputs: { bread: 2, cheese: 1, fruits: 1, plank: 1 }, output: { type: 'shop', id: 'picnic_box', qty: 1 }, rep: 100 },
    { id: 'sea_box', name: 'Coffret marin', category: 'shop', room: 'shop', asset: 'fish', duration: 12, inputs: { fish: 2, salt: 1, glass_panel: 1 }, output: { type: 'shop', id: 'sea_box', qty: 1 }, rep: 500 },
    { id: 'souvenir', name: 'Souvenir du Comptoir', category: 'shop', room: 'shop', asset: 'sign', duration: 15, inputs: { plank: 2, fabric: 2, crystal: 1 }, output: { type: 'shop', id: 'souvenir', qty: 1 }, rep: 800 }
  ];

  const SHOP_PRODUCTS = {
    jam_jar: { name: 'Pot de compote', asset: 'compote', price: 90, rep: 1 },
    herb_pouch: { name: 'Sachet d’herbes', asset: 'spices', price: 72, rep: 1 },
    picnic_box: { name: 'Panier pique-nique', asset: 'basket', price: 180, rep: 2 },
    sea_box: { name: 'Coffret marin', asset: 'fish', price: 310, rep: 3 },
    souvenir: { name: 'Souvenir du Comptoir', asset: 'sign', price: 520, rep: 5 }
  };

  const STAFF = [
    { id: 'server', name: 'Mina', role: 'Service', asset: 'worker', cost: 700, rep: 20, interval: 30000, desc: 'Sert automatiquement un plat prêt correspondant à une commande.' },
    { id: 'cook', name: 'Orso', role: 'Cuisine', asset: 'client_dwarf', cost: 1100, rep: 50, interval: 42000, desc: 'Lance une recette actuellement commandée quand un emplacement est libre.' },
    { id: 'gardener', name: 'Lila', role: 'Ferme', asset: 'client_elder', cost: 1400, rep: 80, interval: 36000, desc: 'Récolte une culture mûre puis replante une parcelle disponible.' },
    { id: 'artisan', name: 'Bram', role: 'Artisanat', asset: 'client_cat', cost: 1900, rep: 130, interval: 0, desc: 'Réduit le temps de toutes les fabrications.' },
    { id: 'courier', name: 'Nox', role: 'Livraison', asset: 'client_red', cost: 2600, rep: 200, interval: 55000, desc: 'Rapporte des ressources depuis les régions débloquées.' },
    { id: 'technician', name: 'Sélène', role: 'Machines', asset: 'worker', cost: 4800, rep: 420, interval: 50000, desc: 'Entretient les machines et produit parfois un composant.' }
  ];

  const TECHNOLOGIES = [
    { id: 'electricity', name: 'Réseau électrique', asset: 'gear_component', rep: 450, coins: 9000, materials: { metal: 10, gear: 4, glass_panel: 2 }, desc: 'Alimente les technologies avancées.' },
    { id: 'conveyor', name: 'Tapis roulants', asset: 'craft_machine', rep: 650, coins: 15000, materials: { metal: 12, gear: 8 }, requires: 'electricity', desc: '+1 fabrication simultanée.' },
    { id: 'smart_storage', name: 'Stockage intelligent', asset: 'storage_chest', rep: 850, coins: 22000, materials: { plank: 12, metal: 10, glass_panel: 5 }, requires: 'electricity', desc: '+2 plats prêts et +1 préparation.' },
    { id: 'auto_register', name: 'Caisse automatique', asset: 'cash_register', rep: 1100, coins: 33000, materials: { metal: 15, gear: 10, glass_panel: 6 }, requires: 'conveyor', desc: 'Sert périodiquement une commande disponible.' },
    { id: 'harvest_drone', name: 'Drone agricole', asset: 'craft_machine', rep: 1400, coins: 45000, materials: { metal: 16, gear: 12, crystal: 3 }, requires: 'electricity', desc: 'Récolte et replante automatiquement la ferme.' },
    { id: 'robot_server', name: 'Robot serveur', asset: 'craft_machine', rep: 1900, coins: 70000, materials: { metal: 24, gear: 18, crystal: 6 }, requires: 'auto_register', desc: 'Renforce le service automatique pendant les heures de pointe.' },
    { id: 'shop_assistant', name: 'Vitrine automatique', asset: 'display_case', rep: 2200, coins: 85000, materials: { glass_panel: 15, gear: 12, crystal: 4 }, requires: 'smart_storage', desc: 'Vend automatiquement un produit emballé pendant le jeu.' },
    { id: 'predictive_ai', name: 'IA de prévision', asset: 'gear_component', rep: 3200, coins: 140000, materials: { gear: 30, crystal: 15, glass_panel: 20 }, requires: 'robot_server', desc: 'Anticipe les commandes et rend les clients un peu plus patients.' }
  ];

  const ESTABLISHMENTS = [
    { id: 'neighborhood', name: 'Comptoir de quartier', asset: 'zone_market', rep: 0, coins: 0, materials: {}, income: 20, desc: 'L’établissement principal et le cœur du domaine.' },
    { id: 'forest_restaurant', name: 'Restaurant forestier', asset: 'zone_forest', rep: 900, coins: 30000, materials: { plank: 25, glass_panel: 6 }, income: 90, desc: 'Une petite salle au milieu des arbres.' },
    { id: 'coastal_house', name: 'Maison côtière', asset: 'zone_sea', rep: 1500, coins: 65000, materials: { plank: 35, glass_panel: 12, metal: 10 }, income: 170, desc: 'Un établissement spécialisé dans les produits de la mer.' },
    { id: 'festival_stand', name: 'Stand de festival', asset: 'sign', rep: 2200, coins: 95000, materials: { plank: 20, fabric: 25, gear: 8 }, income: 260, desc: 'Une activité événementielle permanente, sans remise à zéro.' },
    { id: 'mountain_lodge', name: 'Auberge de montagne', asset: 'zone_mountain', rep: 3200, coins: 170000, materials: { plank: 50, stone: 40, metal: 25 }, income: 420, desc: 'Une adresse prestigieuse pour les voyageurs.' }
  ];

  const MASTERY = {
    tavern: { name: 'Taverne', asset: 'service_counter', color: '#8c4f35' },
    kitchen: { name: 'Cuisine', asset: 'prep_station', color: '#c17a37' },
    farm: { name: 'Ferme', asset: 'vegetables', color: '#4f7c4a' },
    craft: { name: 'Artisanat', asset: 'workbench', color: '#76533b' },
    exploration: { name: 'Exploration', asset: 'sign', color: '#4f7184' },
    shop: { name: 'Boutique', asset: 'display_case', color: '#8b5778' }
  };

  const EXTRA_OBJECTIVES = [
    { id: 'craft_1', title: 'Première fabrication', description: 'Terminer 1 fabrication', type: 'short', metric: 'exp:crafted', target: 1, reward: { coins: 100, wood: 2 } },
    { id: 'craft_20', title: 'Main d’artisane', description: 'Terminer 20 fabrications', type: 'medium', metric: 'exp:crafted', target: 20, reward: { coins: 800, metal: 3 } },
    { id: 'furniture_5', title: 'Salle personnalisée', description: 'Fabriquer 5 meubles', type: 'medium', metric: 'exp:furnitureCrafted', target: 5, reward: { diamonds: 2 } },
    { id: 'harvest_20', title: 'Récoltes du domaine', description: 'Récolter 20 parcelles', type: 'medium', metric: 'exp:harvested', target: 20, reward: { coins: 600, fruits: 3 } },
    { id: 'hire_1', title: 'Première recrue', description: 'Recruter 1 employé', type: 'medium', metric: 'exp:staff', target: 1, reward: { coins: 500 } },
    { id: 'shop_10', title: 'Belle vitrine', description: 'Vendre 10 produits en boutique', type: 'medium', metric: 'exp:shopSales', target: 10, reward: { diamonds: 2, coins: 700 } },
    { id: 'tech_1', title: 'Première étincelle', description: 'Débloquer 1 technologie', type: 'long', metric: 'exp:tech', target: 1, reward: { diamonds: 3 } },
    { id: 'estate_2', title: 'Deuxième adresse', description: 'Ouvrir 2 établissements', type: 'long', metric: 'exp:establishments', target: 2, reward: { diamonds: 5, coins: 2000 } }
  ];
  EXTRA_OBJECTIVES.forEach(objective => { if (!C.OBJECTIVES.some(existing => existing.id === objective.id)) C.OBJECTIVES.push(objective); });

  let productionFilter = 'material';
  let preparedState = null;

  function expansionDefaults() {
    return {
      schema: 1,
      crafting: [],
      tech: [],
      staff: [],
      establishments: ['neighborhood'],
      shop: { level: 1, theme: 'forest', stock: {} },
      menu: [],
      event: { name: '', description: '', activeUntil: 0, nextAt: Date.now() + 75000 },
      farmExtraPlots: 0,
      mastery: Object.fromEntries(Object.keys(MASTERY).map(key => [key, { level: 1, xp: 0 }])),
      stats: { crafted: 0, furnitureCrafted: 0, harvested: 0, shopSales: 0, shopCoins: 0, passiveCoins: 0 },
      timers: { establishments: Date.now(), techServe: Date.now(), techFarm: Date.now(), techShop: Date.now(), prediction: Date.now() },
      observed: { served: 0, cooked: 0, gathers: 0, harvestedPlots: 0 }
    };
  }

  function ensureState() {
    const state = C.state;
    if (preparedState === state && state.expansion) return state.expansion;
    const base = expansionDefaults();
    const raw = state.expansion || {};
    state.expansion = {
      ...base, ...raw,
      shop: { ...base.shop, ...(raw.shop || {}), stock: { ...base.shop.stock, ...(raw.shop?.stock || {}) } },
      event: { ...base.event, ...(raw.event || {}) },
      mastery: Object.fromEntries(Object.keys(MASTERY).map(key => [key, { ...base.mastery[key], ...(raw.mastery?.[key] || {}) }])),
      stats: { ...base.stats, ...(raw.stats || {}) },
      timers: { ...base.timers, ...(raw.timers || {}) },
      observed: { ...base.observed, ...(raw.observed || {}) },
      crafting: Array.isArray(raw.crafting) ? raw.crafting : [],
      tech: Array.isArray(raw.tech) ? raw.tech : [],
      staff: Array.isArray(raw.staff) ? raw.staff : [],
      establishments: Array.isArray(raw.establishments) && raw.establishments.length ? raw.establishments : ['neighborhood']
    };
    Object.keys(EXTRA_ITEMS).forEach(key => { state.inventory[key] = Number(state.inventory[key] || 0); });
    Object.keys(C.FURNITURE).forEach(key => { state.decorInventory[key] = Number(state.decorInventory[key] || 0); });
    Object.keys(C.FARM_CROPS).forEach(key => { state.farm.seeds[key] = Number(state.farm.seeds[key] || 0); });
    ['mountain', 'night', 'greenhouse'].forEach(key => { state.zoneXP[key] = Number(state.zoneXP[key] || 0); });
    while (state.farm.plots.length < C.getFarmCapacity()) state.farm.plots.push(null);
    preparedState = state;
    return state.expansion;
  }

  function state() { return C.state; }
  function exp() { return ensureState(); }
  function staffMember(id) { return exp().staff.find(member => member.id === id); }
  function hasTech(id) { return exp().tech.includes(id); }
  function activeStaff(id) { const member = staffMember(id); return !!member?.active; }

  function craftSlots() {
    return 1 + (hasTech('conveyor') ? 1 : 0) + Math.floor((exp().mastery.craft.level - 1) / 4);
  }

  function craftDuration(recipe) {
    let multiplier = 1 - Math.min(.25, (exp().mastery.craft.level - 1) * .025);
    const artisan = staffMember('artisan');
    if (artisan?.active) multiplier *= Math.max(.65, .88 - (artisan.level - 1) * .06);
    return Math.max(1000, recipe.duration * 1000 * multiplier);
  }

  function recipeUnlocked(recipe) {
    if (state().reputation < (recipe.rep || 0)) return false;
    if (recipe.requiresTech && !hasTech(recipe.requiresTech)) return false;
    return true;
  }

  function startCraft(recipeId) {
    const recipe = CRAFT_RECIPES.find(item => item.id === recipeId);
    if (!recipe || !recipeUnlocked(recipe)) return;
    if (exp().crafting.length >= craftSlots()) return C.toast('Toutes les files de fabrication sont occupées.');
    if (!C.canPay(0, recipe.inputs)) return C.toast('Il manque des matériaux.');
    C.pay(0, recipe.inputs);
    const duration = craftDuration(recipe);
    exp().crafting.push({ uid: `${Date.now()}-${Math.random()}`, recipeId, startedAt: Date.now(), readyAt: Date.now() + duration });
    C.saveState();
    C.renderAll();
    C.toast(`${recipe.name} lancé.`);
  }

  function grantCraftOutput(recipe) {
    const output = recipe.output;
    if (output.type === 'item') state().inventory[output.id] = (state().inventory[output.id] || 0) + output.qty;
    if (output.type === 'furniture') {
      state().decorInventory[output.id] = (state().decorInventory[output.id] || 0) + output.qty;
      exp().stats.furnitureCrafted += output.qty;
    }
    if (output.type === 'shop') exp().shop.stock[output.id] = (exp().shop.stock[output.id] || 0) + output.qty;
    exp().stats.crafted += 1;
    awardMastery('craft', 16);
    C.toast(`${recipe.name} terminé et rangé.`);
  }

  function processCrafting() {
    const ready = exp().crafting.filter(job => job.readyAt <= Date.now());
    if (!ready.length) return false;
    ready.forEach(job => {
      const recipe = CRAFT_RECIPES.find(item => item.id === job.recipeId);
      if (recipe) grantCraftOutput(recipe);
    });
    exp().crafting = exp().crafting.filter(job => job.readyAt > Date.now());
    C.saveState();
    return true;
  }

  function outputLabel(recipe) {
    const output = recipe.output;
    if (output.type === 'item') return `${output.qty} × ${C.ITEMS[output.id]?.name || output.id}`;
    if (output.type === 'furniture') return `${output.qty} × ${C.FURNITURE[output.id]?.name || output.id}`;
    return `${output.qty} × ${SHOP_PRODUCTS[output.id]?.name || output.id}`;
  }

  function outputStock(recipe) {
    const output = recipe.output;
    if (output.type === 'item') return state().inventory[output.id] || 0;
    if (output.type === 'furniture') return state().decorInventory[output.id] || 0;
    return exp().shop.stock[output.id] || 0;
  }

  function queueHtml(room) {
    const jobs = exp().crafting.filter(job => CRAFT_RECIPES.find(recipe => recipe.id === job.recipeId)?.room === room);
    if (!jobs.length) return '<div class="empty-inline">Aucune fabrication en cours.</div>';
    return jobs.map(job => {
      const recipe = CRAFT_RECIPES.find(item => item.id === job.recipeId);
      const total = Math.max(1, job.readyAt - job.startedAt);
      const remaining = Math.max(0, job.readyAt - Date.now());
      const pct = Math.max(0, Math.min(100, (1 - remaining / total) * 100));
      return `<div class="production-job">${C.pixelImg(recipe.asset, recipe.name, 'pixel-card-icon')}<span><b>${recipe.name}</b><small>${Math.ceil(remaining / 1000)} s</small><i><em style="width:${pct}%"></em></i></span></div>`;
    }).join('');
  }

  function craftCard(recipe) {
    const unlocked = recipeUnlocked(recipe);
    const canStart = unlocked && exp().crafting.length < craftSlots() && C.canPay(0, recipe.inputs);
    let lock = '';
    if (!unlocked) lock = recipe.requiresTech ? 'Technologie requise' : `${recipe.rep} réputation requise`;
    return `<article class="craft-card ${unlocked ? '' : 'locked'}">
      <div class="craft-card-art">${C.pixelImg(recipe.asset, recipe.name, 'pixel-card-icon')}<span class="badge">${recipe.duration} s</span></div>
      <h3>${recipe.name}</h3><p>Produit : <b>${outputLabel(recipe)}</b></p><small>En stock : ${outputStock(recipe)}</small>
      <div class="cost-row">${C.materialChips(recipe.inputs)}</div>
      <button class="primary-button start-craft" data-craft="${recipe.id}" type="button" ${canStart ? '' : 'disabled'}>${lock || (exp().crafting.length >= craftSlots() ? 'Files occupées' : 'Fabriquer')}</button>
    </article>`;
  }

  function renderCrafting() {
    const carpentryQueue = C.el('carpentryQueue');
    const carpentryGrid = C.el('carpentryGrid');
    const industryQueue = C.el('industryQueue');
    const industryGrid = C.el('industryGrid');
    if (carpentryQueue) carpentryQueue.innerHTML = queueHtml('carpentry');
    if (carpentryGrid) carpentryGrid.innerHTML = CRAFT_RECIPES.filter(recipe => recipe.room === 'carpentry').map(craftCard).join('');
    if (industryQueue) industryQueue.innerHTML = queueHtml('industry');
    if (industryGrid) industryGrid.innerHTML = CRAFT_RECIPES.filter(recipe => recipe.room === 'industry' && recipe.category === productionFilter).map(craftCard).join('');
    const filters = C.el('industryFilters');
    if (filters) filters.innerHTML = [['material', 'Matériaux'], ['component', 'Composants'], ['machine', 'Machines']].map(([id, label]) => `<button class="filter-chip ${productionFilter === id ? 'active' : ''}" data-production-filter="${id}" type="button">${label}</button>`).join('');
    const capacity = C.el('industryCapacityBadge');
    if (capacity) capacity.textContent = `${exp().crafting.length}/${craftSlots()} file(s)`;
    const carpLevel = C.el('carpentryLevelBadge');
    if (carpLevel) carpLevel.textContent = `Maîtrise ${exp().mastery.craft.level}`;
    document.querySelectorAll('.start-craft').forEach(button => button.addEventListener('click', () => startCraft(button.dataset.craft)));
    filters?.querySelectorAll('[data-production-filter]').forEach(button => button.addEventListener('click', () => { productionFilter = button.dataset.productionFilter; renderCrafting(); }));
  }

  function toggleMenuRecipe(recipeId) {
    const menu = exp().menu;
    const index = menu.indexOf(recipeId);
    if (index >= 0) menu.splice(index, 1);
    else {
      if (menu.length >= 5) return C.toast('La carte peut proposer cinq recettes au maximum.');
      menu.push(recipeId);
    }
    C.saveState(); C.renderAll();
  }

  function renderMenuPlanner() {
    const panel = C.el('menuPlanner');
    if (!panel) return;
    const unlocked = C.RECIPES.filter(recipe => recipe.unlock(state()));
    panel.innerHTML = `<div><h3>Carte du prochain service</h3><p>${exp().menu.length ? 'Les clients commanderont parmi les recettes sélectionnées.' : 'Aucune sélection : toutes les recettes débloquées peuvent être commandées.'}</p></div><div class="menu-choice-row">${unlocked.map(recipe => `<button class="menu-choice ${exp().menu.includes(recipe.id) ? 'active' : ''}" data-menu-recipe="${recipe.id}" type="button">${C.recipeImg(recipe, 'pixel-small')}<span>${recipe.name}</span></button>`).join('')}</div>`;
    panel.querySelectorAll('[data-menu-recipe]').forEach(button => button.addEventListener('click', () => toggleMenuRecipe(button.dataset.menuRecipe)));
  }

  function buySeed(cropId) {
    const crop = C.FARM_CROPS[cropId];
    if (!crop) return;
    const price = { vegetables: 8, fruits: 12, spices: 14, flour: 10, coffee: 18, mushrooms: 15 }[cropId] || 10;
    if (state().coins < price) return C.toast('Pas assez de pièces pour cette graine.');
    state().coins -= price;
    state().farm.seeds[cropId] = (state().farm.seeds[cropId] || 0) + 1;
    C.saveState(); C.renderAll();
  }

  function buyFarmPlot() {
    if (exp().farmExtraPlots >= 2) return;
    const next = exp().farmExtraPlots + 1;
    const coins = next === 1 ? 4500 : 12000;
    const materials = next === 1 ? { plank: 8, stone: 4 } : { plank: 14, metal: 5 };
    const repNeed = next === 1 ? 180 : 500;
    if (state().reputation < repNeed) return C.toast(`${repNeed} réputation requise.`);
    if (!C.canPay(coins, materials)) return C.toast('Il manque des ressources pour agrandir la ferme.');
    C.pay(coins, materials);
    exp().farmExtraPlots += 1;
    while (state().farm.plots.length < C.getFarmCapacity()) state().farm.plots.push(null);
    C.saveState(); C.renderAll(); C.toast('Nouvelle parcelle achetée.');
  }

  function renderFarmExtras() {
    const shop = C.el('farmSeedShop');
    const panel = C.el('farmExpansionPanel');
    if (shop) {
      shop.innerHTML = `<b>Marchand de graines</b><div>${Object.entries(C.FARM_CROPS).map(([id, crop]) => {
        const price = { vegetables: 8, fruits: 12, spices: 14, flour: 10, coffee: 18, mushrooms: 15 }[id] || 10;
        return `<button class="seed-buy" data-seed="${id}" type="button">${C.pixelImg(crop.asset, crop.name)} <span>${crop.name}<small>${price} 🪙</small></span></button>`;
      }).join('')}</div>`;
      shop.querySelectorAll('.seed-buy').forEach(button => button.addEventListener('click', () => buySeed(button.dataset.seed)));
    }
    if (panel) {
      const capacity = C.getFarmCapacity();
      const next = exp().farmExtraPlots + 1;
      panel.innerHTML = `<div><h3>Développement agricole</h3><p>${capacity}/8 parcelles disponibles. La récolte gagne du rendement avec la maîtrise de ferme.</p></div>${exp().farmExtraPlots < 2 ? `<button id="buyFarmPlot" class="primary-button" type="button">Acheter la parcelle ${capacity + 1}<small>${next === 1 ? '4 500 🪙 · 8 planches · 4 pierres' : '12 000 🪙 · 14 planches · 5 métal'}</small></button>` : '<span class="badge">Terrain complet</span>'}`;
      panel.querySelector('#buyFarmPlot')?.addEventListener('click', buyFarmPlot);
    }
  }

  function hireStaff(id) {
    const definition = STAFF.find(item => item.id === id);
    if (!definition || staffMember(id)) return;
    if (state().reputation < definition.rep) return C.toast(`${definition.rep} réputation requise.`);
    if (state().coins < definition.cost) return C.toast('Pas assez de pièces.');
    state().coins -= definition.cost;
    exp().staff.push({ id, level: 1, active: true, lastRun: Date.now() });
    C.saveState(); C.renderAll(); C.toast(`${definition.name} rejoint le Comptoir.`);
  }

  function toggleStaff(id) {
    const member = staffMember(id);
    if (!member) return;
    member.active = !member.active;
    C.saveState(); C.renderAll();
  }

  function trainStaff(id) {
    const member = staffMember(id);
    if (!member || member.level >= 3) return;
    const price = 800 * member.level * member.level;
    if (state().coins < price) return C.toast('Pas assez de pièces pour la formation.');
    state().coins -= price;
    member.level += 1;
    C.saveState(); C.renderAll(); C.toast('Compétence améliorée.');
  }

  function renderStaff() {
    const grid = C.el('staffGrid');
    const summary = C.el('staffSummary');
    if (summary) summary.innerHTML = `<div><b>${exp().staff.length}/${STAFF.length}</b><small>employés recrutés</small></div><div><b>${exp().staff.filter(item => item.active).length}</b><small>automatisations actives</small></div><div><b>${exp().mastery.tavern.level}</b><small>niveau de taverne</small></div>`;
    if (!grid) return;
    grid.innerHTML = STAFF.map(definition => {
      const member = staffMember(definition.id);
      const available = state().reputation >= definition.rep;
      return `<article class="staff-card ${available || member ? '' : 'locked'}">
        ${C.pixelImg(definition.asset, definition.name, 'staff-portrait')}<div><span class="badge">${definition.role}</span><h3>${definition.name}</h3><p>${definition.desc}</p>
        ${member ? `<div class="staff-actions"><button class="secondary-button toggle-staff" data-staff="${definition.id}" type="button">${member.active ? 'Mettre en pause' : 'Réactiver'}</button><button class="primary-button train-staff" data-staff="${definition.id}" type="button" ${member.level >= 3 ? 'disabled' : ''}>Niveau ${member.level}${member.level < 3 ? ` → ${member.level + 1}` : ' max'}</button></div>` : `<button class="primary-button hire-staff" data-staff="${definition.id}" type="button" ${available && state().coins >= definition.cost ? '' : 'disabled'}>${available ? `Recruter · ${C.fmt(definition.cost)} 🪙` : `${definition.rep} réputation requise`}</button>`}</div>
      </article>`;
    }).join('');
    grid.querySelectorAll('.hire-staff').forEach(button => button.addEventListener('click', () => hireStaff(button.dataset.staff)));
    grid.querySelectorAll('.toggle-staff').forEach(button => button.addEventListener('click', () => toggleStaff(button.dataset.staff)));
    grid.querySelectorAll('.train-staff').forEach(button => button.addEventListener('click', () => trainStaff(button.dataset.staff)));
  }

  function sellProduct(id, automatic = false) {
    const product = SHOP_PRODUCTS[id];
    if (!product || (exp().shop.stock[id] || 0) < 1) return false;
    exp().shop.stock[id] -= 1;
    const multiplier = 1 + (exp().shop.level - 1) * .12 + (exp().mastery.shop.level - 1) * .02;
    const price = Math.floor(product.price * multiplier);
    state().coins += price;
    state().reputation += product.rep;
    state().stats.coinsEarned += price;
    exp().stats.shopSales += 1;
    exp().stats.shopCoins += price;
    awardMastery('shop', 14);
    if (!automatic) C.toast(`${product.name} vendu : +${price} pièces.`);
    C.saveState();
    return true;
  }

  function upgradeShop() {
    if (exp().shop.level >= 5) return;
    const level = exp().shop.level;
    const price = 2500 * level * level;
    const materials = { plank: 4 * level, glass_panel: 2 * level };
    if (!C.canPay(price, materials)) return C.toast('Il manque des ressources pour améliorer la boutique.');
    C.pay(price, materials);
    exp().shop.level += 1;
    C.saveState(); C.renderAll(); C.toast('La boutique gagne un niveau.');
  }

  function renderShop() {
    const summary = C.el('shopSummary');
    const queue = C.el('shopQueue');
    const grid = C.el('shopProducts');
    const shopPanel = C.el('tab-shop');
    if (shopPanel) {
      shopPanel.classList.remove('shop-theme-forest', 'shop-theme-coast', 'shop-theme-night');
      shopPanel.classList.add(`shop-theme-${exp().shop.theme}`);
    }
    if (queue) queue.innerHTML = queueHtml('shop');
    if (summary) summary.innerHTML = `<div><b>Niveau ${exp().shop.level}</b><small>vitrine</small></div><div><b>${exp().stats.shopSales}</b><small>ventes</small></div><div><b>${C.fmt(exp().stats.shopCoins)}</b><small>pièces gagnées</small></div><button id="upgradeShop" class="primary-button" type="button" ${exp().shop.level >= 5 ? 'disabled' : ''}>${exp().shop.level >= 5 ? 'Niveau maximum' : 'Améliorer la vitrine'}</button><div class="shop-theme-picker"><button data-shop-theme="forest" class="${exp().shop.theme === 'forest' ? 'active' : ''}" type="button">Forêt</button><button data-shop-theme="coast" class="${exp().shop.theme === 'coast' ? 'active' : ''}" type="button">Côte</button><button data-shop-theme="night" class="${exp().shop.theme === 'night' ? 'active' : ''}" type="button">Nuit</button></div>`;
    summary?.querySelector('#upgradeShop')?.addEventListener('click', upgradeShop);
    summary?.querySelectorAll('[data-shop-theme]').forEach(button => button.addEventListener('click', () => { exp().shop.theme = button.dataset.shopTheme; C.saveState(); renderShop(); }));
    if (!grid) return;
    grid.innerHTML = CRAFT_RECIPES.filter(recipe => recipe.room === 'shop').map(recipe => {
      const product = SHOP_PRODUCTS[recipe.output.id];
      const stock = exp().shop.stock[recipe.output.id] || 0;
      const unlocked = recipeUnlocked(recipe);
      return `<article class="shop-card ${unlocked ? '' : 'locked'}">${C.pixelImg(product.asset, product.name, 'pixel-card-icon')}<div><h3>${product.name}</h3><p>Stock : <b>${stock}</b> · Valeur : ${Math.floor(product.price * (1 + (exp().shop.level - 1) * .12))} 🪙</p><div class="cost-row">${C.materialChips(recipe.inputs)}</div><div class="shop-actions"><button class="secondary-button start-craft" data-craft="${recipe.id}" type="button" ${unlocked && C.canPay(0, recipe.inputs) && exp().crafting.length < craftSlots() ? '' : 'disabled'}>Préparer</button><button class="primary-button sell-product" data-product="${recipe.output.id}" type="button" ${stock ? '' : 'disabled'}>Vendre</button></div></div></article>`;
    }).join('');
    grid.querySelectorAll('.start-craft').forEach(button => button.addEventListener('click', () => startCraft(button.dataset.craft)));
    grid.querySelectorAll('.sell-product').forEach(button => button.addEventListener('click', () => { sellProduct(button.dataset.product); C.renderAll(); }));
  }

  function buyTechnology(id) {
    const tech = TECHNOLOGIES.find(item => item.id === id);
    if (!tech || hasTech(id)) return;
    if (state().reputation < tech.rep || (tech.requires && !hasTech(tech.requires))) return;
    if (!C.canPay(tech.coins, tech.materials)) return C.toast('Il manque des ressources pour cette technologie.');
    C.pay(tech.coins, tech.materials);
    exp().tech.push(id);
    C.saveState(); C.renderAll(); C.toast(`${tech.name} débloqué.`);
  }

  function renderTechnologies() {
    const grid = C.el('technologyGrid');
    if (!grid) return;
    grid.innerHTML = TECHNOLOGIES.map(tech => {
      const bought = hasTech(tech.id);
      const prerequisite = !tech.requires || hasTech(tech.requires);
      const available = state().reputation >= tech.rep && prerequisite;
      let label = bought ? 'Installée' : 'Construire';
      if (!available) label = !prerequisite ? `Nécessite ${TECHNOLOGIES.find(item => item.id === tech.requires)?.name}` : `${tech.rep} réputation requise`;
      return `<article class="tech-card ${available || bought ? '' : 'locked'}"><div class="tech-line"></div>${C.pixelImg(tech.asset, tech.name, 'pixel-card-icon')}<h3>${tech.name}</h3><p>${tech.desc}</p><div class="cost-row"><span class="resource-chip">🪙 ${C.fmt(tech.coins)}</span>${C.materialChips(tech.materials)}</div><button class="${bought ? 'secondary-button' : 'primary-button'} buy-tech" data-tech="${tech.id}" type="button" ${available && !bought && C.canPay(tech.coins, tech.materials) ? '' : 'disabled'}>${label}</button></article>`;
    }).join('');
    grid.querySelectorAll('.buy-tech').forEach(button => button.addEventListener('click', () => buyTechnology(button.dataset.tech)));
  }

  function unlockEstablishment(id) {
    const place = ESTABLISHMENTS.find(item => item.id === id);
    if (!place || exp().establishments.includes(id) || state().reputation < place.rep) return;
    if (!C.canPay(place.coins, place.materials)) return C.toast('Il manque des ressources pour ouvrir cet établissement.');
    C.pay(place.coins, place.materials);
    exp().establishments.push(id);
    C.saveState(); C.renderAll(); C.toast(`${place.name} rejoint le domaine.`);
  }

  function masteryRequired(level) { return 80 + level * 40; }

  function awardMastery(id, amount) {
    const mastery = exp().mastery[id];
    if (!mastery) return;
    mastery.xp += amount;
    while (mastery.xp >= masteryRequired(mastery.level)) {
      mastery.xp -= masteryRequired(mastery.level);
      mastery.level += 1;
      C.toast(`${MASTERY[id].name} atteint le niveau ${mastery.level}.`);
    }
  }

  function renderProgress() {
    const masteryGrid = C.el('masteryGrid');
    const establishmentGrid = C.el('establishmentGrid');
    const stats = C.el('expandedStats');
    if (masteryGrid) masteryGrid.innerHTML = Object.entries(MASTERY).map(([id, definition]) => {
      const mastery = exp().mastery[id];
      const target = masteryRequired(mastery.level);
      return `<article class="mastery-card">${C.pixelImg(definition.asset, definition.name, 'pixel-card-icon')}<div><h3>${definition.name} · Niv. ${mastery.level}</h3><div class="mastery-bar"><span style="width:${Math.min(100, mastery.xp / target * 100)}%;background:${definition.color}"></span></div><small>${mastery.xp}/${target} maîtrise</small></div></article>`;
    }).join('');
    if (establishmentGrid) establishmentGrid.innerHTML = ESTABLISHMENTS.map(place => {
      const opened = exp().establishments.includes(place.id);
      const available = state().reputation >= place.rep;
      return `<article class="establishment-card ${available || opened ? '' : 'locked'}"><img src="${C.assetPath(place.asset)}" alt="${place.name}"><div><h3>${place.name}</h3><p>${place.desc}</p><small>Revenu actif : ${place.income} 🪙 par passage</small><div class="cost-row"><span class="resource-chip">🪙 ${C.fmt(place.coins)}</span>${C.materialChips(place.materials)}</div><button class="primary-button unlock-establishment" data-establishment="${place.id}" type="button" ${available && !opened && C.canPay(place.coins, place.materials) ? '' : 'disabled'}>${opened ? 'Ouvert' : available ? 'Ouvrir' : `${place.rep} réputation requise`}</button></div></article>`;
    }).join('');
    establishmentGrid?.querySelectorAll('.unlock-establishment').forEach(button => button.addEventListener('click', () => unlockEstablishment(button.dataset.establishment)));
    if (stats) {
      const values = [
        ['Clients servis', state().stats.served], ['Plats préparés', state().stats.cooked], ['Récoltes régionales', state().stats.gathers], ['Fabrications', exp().stats.crafted], ['Meubles fabriqués', exp().stats.furnitureCrafted], ['Ventes boutique', exp().stats.shopSales], ['Employés', exp().staff.length], ['Technologies', exp().tech.length], ['Établissements', exp().establishments.length]
      ];
      stats.innerHTML = values.map(([label, value]) => `<div><b>${C.fmt(value)}</b><small>${label}</small></div>`).join('');
    }
  }

  function renderDomainSummary() {
    const target = C.el('domainSummary');
    if (!target) return;
    const important = ['wood', 'plank', 'stone', 'ore', 'metal', 'nails', 'gear', 'glass_panel', 'fabric', 'rope'];
    target.innerHTML = `<div class="domain-overview"><span><b>${exp().crafting.length}/${craftSlots()}</b><small>fabrications</small></span><span><b>${exp().staff.filter(item => item.active).length}</b><small>employés actifs</small></span><span><b>${exp().tech.length}</b><small>technologies</small></span><span><b>${exp().establishments.length}</b><small>établissements</small></span></div><div class="domain-resources">${important.map(key => `<span class="resource-chip">${C.itemImg(key)} ${C.ITEMS[key].name} : <b>${state().inventory[key] || 0}</b></span>`).join('')}</div>`;
  }

  function runEmployee(member, definition, now) {
    const interval = definition.interval ? definition.interval / (1 + (member.level - 1) * .25) : 0;
    if (!member.active || !interval || now - member.lastRun < interval) return false;
    member.lastRun = now;
    if (member.id === 'server') {
      C.pullReadyCookingToTray(false);
      const customer = state().customers.find(item => state().tray.includes(item.recipeId));
      if (customer) C.serveCustomer(customer.id, true);
    }
    if (member.id === 'cook') {
      const slots = C.getEffects().cookingSlots;
      const customer = state().customers.find(item => {
        const recipe = C.getRecipe(item.recipeId);
        return recipe && Object.entries(recipe.ingredients).every(([key, amount]) => (state().inventory[key] || 0) >= amount);
      });
      if (customer && state().cooking.length < slots) C.startCooking(customer.recipeId, true);
    }
    if (member.id === 'gardener') automateFarm(now, member.level);
    if (member.id === 'courier') {
      const pool = state().unlockedZones.flatMap(id => C.ZONES.find(zone => zone.id === id)?.nodes.map(node => node.item) || []);
      const item = C.choice(pool.length ? pool : ['wood', 'vegetables']);
      C.addResource(item, member.level + 1);
    }
    if (member.id === 'technician') C.addResource(C.choice(['metal', 'nails', 'gear']), member.level);
    return true;
  }

  function automateFarm(now, level = 1) {
    const capacity = C.getFarmCapacity();
    const readyIndex = state().farm.plots.slice(0, capacity).findIndex(plot => plot && plot.readyAt <= now);
    if (readyIndex >= 0) {
      const plot = state().farm.plots[readyIndex];
      const crop = C.FARM_CROPS[plot.cropId];
      const amount = C.randomInt(...crop.yield) + Math.max(0, level - 1);
      C.addResource(plot.cropId, amount);
      state().farm.plots[readyIndex] = null;
      exp().stats.harvested += 1;
      awardMastery('farm', 12);
    }
    const empty = state().farm.plots.slice(0, capacity).findIndex(plot => !plot);
    const cropId = Object.keys(C.FARM_CROPS).find(id => (state().farm.seeds[id] || 0) > 0);
    if (empty >= 0 && cropId) {
      state().farm.seeds[cropId] -= 1;
      state().farm.plots[empty] = { cropId, readyAt: now + C.FARM_CROPS[cropId].growMs };
    }
  }

  function processAutomation() {
    const now = Date.now();
    let changed = false;
    exp().staff.forEach(member => {
      const definition = STAFF.find(item => item.id === member.id);
      if (definition && runEmployee(member, definition, now)) changed = true;
    });
    if ((hasTech('auto_register') || hasTech('robot_server')) && now - exp().timers.techServe >= (hasTech('robot_server') ? 15000 : 26000)) {
      C.pullReadyCookingToTray(false);
      const customer = state().customers.find(item => state().tray.includes(item.recipeId));
      if (customer) C.serveCustomer(customer.id, true);
      exp().timers.techServe = now; changed = true;
    }
    if (hasTech('harvest_drone') && now - exp().timers.techFarm >= 25000) {
      automateFarm(now, 3); exp().timers.techFarm = now; changed = true;
    }
    if (hasTech('shop_assistant') && now - exp().timers.techShop >= 30000) {
      const product = Object.keys(SHOP_PRODUCTS).find(id => (exp().shop.stock[id] || 0) > 0);
      if (product) sellProduct(product, true);
      exp().timers.techShop = now; changed = true;
    }
    if (hasTech('predictive_ai') && now - exp().timers.prediction >= 5000) {
      state().customers.forEach(customer => { customer.patience = Math.min(customer.maxPatience, customer.patience + 1); });
      exp().timers.prediction = now; changed = true;
    }
    if (now - exp().timers.establishments >= 60000) {
      const income = ESTABLISHMENTS.filter(place => exp().establishments.includes(place.id)).reduce((sum, place) => sum + place.income, 0);
      state().coins += income;
      state().stats.coinsEarned += income;
      exp().stats.passiveCoins += income;
      exp().timers.establishments = now;
      if (income) C.toast(`Domaine : +${income} pièces d’activité.`);
      changed = true;
    }
    if (changed) C.saveState();
  }

  function processWorldEvents() {
    const now = Date.now();
    const event = exp().event;
    if (event.activeUntil && now >= event.activeUntil) {
      event.name = ''; event.description = ''; event.activeUntil = 0; event.nextAt = now + 110000;
      C.saveState();
    }
    if (!event.activeUntil && now >= event.nextAt && state().restaurantOpen) {
      const selected = C.choice([
        { name: 'Coup de feu', description: 'Les clients arrivent plus vite pendant 35 secondes.', apply: () => { state().nextCustomerAt = now + 500; state().boosts.serviceUntil = now + 35000; } },
        { name: 'Clients généreux', description: '+20 % de pièces pendant 40 secondes.', apply: () => { state().boosts.generousUntil = now + 40000; } },
        { name: 'Marché chanceux', description: 'Les trouvailles rares sont favorisées pendant une minute.', apply: () => { state().boosts.luckyUntil = now + 60000; } },
        { name: 'Panier du jardin', description: 'Le jardin offre quelques graines supplémentaires.', apply: () => { Object.keys(C.FARM_CROPS).slice(0, 3).forEach(id => state().farm.seeds[id] = (state().farm.seeds[id] || 0) + 1); } }
      ]);
      selected.apply();
      event.name = selected.name; event.description = selected.description; event.activeUntil = now + 40000;
      C.toast(`Événement : ${selected.name}`); C.saveState();
    }
  }

  function renderWorldEvent() {
    const banner = C.el('worldEventBanner');
    if (!banner) return;
    const event = exp().event;
    const active = event.activeUntil > Date.now();
    banner.hidden = !active;
    if (active) banner.innerHTML = `<span>✨</span><div><b>${event.name}</b><small>${event.description} · ${Math.ceil((event.activeUntil - Date.now()) / 1000)} s</small></div>`;
  }

  function observeProgress() {
    const observed = exp().observed;
    const served = state().stats.served || 0;
    const cooked = state().stats.cooked || 0;
    const gathers = state().stats.gathers || 0;
    const harvested = exp().stats.harvested || 0;
    if (served > observed.served) awardMastery('tavern', (served - observed.served) * 12);
    if (cooked > observed.cooked) awardMastery('kitchen', (cooked - observed.cooked) * 10);
    if (gathers > observed.gathers) awardMastery('exploration', (gathers - observed.gathers) * 8);
    if (harvested > observed.harvestedPlots) awardMastery('farm', (harvested - observed.harvestedPlots) * 12);
    observed.served = served;
    observed.cooked = cooked;
    observed.gathers = gathers;
    observed.harvestedPlots = harvested;
  }

  function renderAll() {
    ensureState();
    renderDomainSummary();
    renderCrafting();
    renderMenuPlanner();
    renderFarmExtras();
    renderStaff();
    renderShop();
    renderTechnologies();
    renderProgress();
    renderWorldEvent();
  }

  function tick() {
    ensureState();
    const crafted = processCrafting();
    processAutomation();
    processWorldEvents();
    observeProgress();
    if (crafted) C.renderAll();
    else renderAll();
  }

  function getMetric(metric) {
    if (!metric.startsWith('exp:')) return undefined;
    const key = metric.slice(4);
    if (key === 'staff') return exp().staff.length;
    if (key === 'tech') return exp().tech.length;
    if (key === 'establishments') return exp().establishments.length;
    return exp().stats[key] || 0;
  }

  window.ComptoirExpansion = { renderAll, tick, getMetric, startCraft };
  ensureState();
  C.saveState();
  C.renderAll();
})();
