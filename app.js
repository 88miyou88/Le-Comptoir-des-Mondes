(() => {
  'use strict';

  const GAME_VERSION = '1.2.0';
  const SAVE_VERSION = 1;
  const SAVE_KEY = 'comptoir_des_mondes_save';
  const CHEST_DELAY = 12 * 60 * 60 * 1000;

  const ITEMS = {
    bread: { name: 'Pain', icon: '🥖' },
    cheese: { name: 'Fromage', icon: '🧀' },
    vegetables: { name: 'Légumes', icon: '🥕' },
    fruits: { name: 'Fruits', icon: '🍓' },
    coffee: { name: 'Café', icon: '☕' },
    sugar: { name: 'Sucre', icon: '🍬' },
    spices: { name: 'Épices', icon: '🌶️' },
    fish: { name: 'Poisson', icon: '🐟' },
    mushrooms: { name: 'Champignons', icon: '🍄' },
    salt: { name: 'Sel', icon: '🧂' },
    wood: { name: 'Bois', icon: '🪵' },
    stone: { name: 'Pierre', icon: '🪨' },
    metal: { name: 'Métal', icon: '🔩' },
    fabric: { name: 'Tissu', icon: '🧵' },
    glass: { name: 'Verre', icon: '🪟' },
    crystal: { name: 'Cristal', icon: '🔮' }
  };

  const RECIPES = [
    { id: 'toast', name: 'Tartine simple', icon: '🍞', prep: 5, price: 18, rep: 1, ingredients: { bread: 1 }, unlock: () => true, tag: 'Rapide' },
    { id: 'cheese_sandwich', name: 'Sandwich fromage', icon: '🥪', prep: 7, price: 32, rep: 2, ingredients: { bread: 1, cheese: 1 }, unlock: () => true, tag: 'Classique' },
    { id: 'sweet_coffee', name: 'Café sucré', icon: '☕', prep: 4, price: 24, rep: 1, ingredients: { coffee: 1, sugar: 1 }, unlock: () => true, tag: 'Pressés' },
    { id: 'salad', name: 'Salade croquante', icon: '🥗', prep: 8, price: 42, rep: 3, ingredients: { vegetables: 2 }, unlock: s => s.reputation >= 30, tag: 'Réputation' },
    { id: 'fruit_tart', name: 'Tarte aux fruits', icon: '🥧', prep: 13, price: 76, rep: 4, ingredients: { fruits: 2, sugar: 1 }, unlock: s => hasUpgrade(s, 'oven'), tag: 'Rentable' },
    { id: 'forest_soup', name: 'Soupe forestière', icon: '🍲', prep: 12, price: 85, rep: 5, ingredients: { mushrooms: 2, vegetables: 1 }, unlock: s => s.unlockedZones.includes('forest'), tag: 'Forêt' },
    { id: 'spicy_skewer', name: 'Brochette épicée', icon: '🍢', prep: 11, price: 92, rep: 4, ingredients: { vegetables: 1, spices: 1 }, unlock: s => s.reputation >= 150, tag: 'Touristes' },
    { id: 'grilled_fish', name: 'Poisson grillé', icon: '🐟', prep: 16, price: 140, rep: 7, ingredients: { fish: 2, spices: 1, salt: 1 }, unlock: s => s.unlockedZones.includes('sea'), tag: 'Premium' },
    { id: 'display_dessert', name: 'Dessert vitrine', icon: '🍰', prep: 15, price: 165, rep: 8, ingredients: { fruits: 2, sugar: 2 }, unlock: s => hasUpgrade(s, 'display_case'), tag: 'Vitrine' },
    { id: 'counter_menu', name: 'Menu du comptoir', icon: '🍱', prep: 18, price: 190, rep: 9, ingredients: { bread: 1, cheese: 1, coffee: 1 }, unlock: s => s.reputation >= 420, tag: 'Commande spéciale' }
  ];

  const CLIENT_TYPES = [
    { id: 'classic', name: 'Client classique', emoji: '🙂', patience: 70, multiplier: 1, repNeed: 0, recipes: null },
    { id: 'student', name: 'Étudiant fauché', emoji: '🧢', patience: 82, multiplier: 0.82, repNeed: 0, recipes: ['toast', 'cheese_sandwich', 'sweet_coffee'] },
    { id: 'rushed', name: 'Client pressé', emoji: '😤', patience: 38, multiplier: 1.25, repNeed: 18, recipes: ['toast', 'sweet_coffee', 'salad'] },
    { id: 'foodie', name: 'Gourmand', emoji: '🤤', patience: 78, multiplier: 1.5, repNeed: 70, recipes: ['fruit_tart', 'forest_soup', 'spicy_skewer', 'display_dessert'] },
    { id: 'tourist', name: 'Touriste', emoji: '📸', patience: 65, multiplier: 1.65, repNeed: 260, recipes: ['spicy_skewer', 'grilled_fish', 'display_dessert'] },
    { id: 'mystery', name: 'Client mystère', emoji: '🕵️', patience: 60, multiplier: 2.2, repNeed: 120, rare: 0.08 },
    { id: 'inspector', name: 'Inspectrice', emoji: '🧐', patience: 52, multiplier: 1.2, repNeed: 210, rare: 0.045, repBonus: 12 }
  ];

  const ZONES = [
    {
      id: 'quarter', name: 'Le Quartier', icon: '🏘️', className: '', repNeed: 0, unlockCost: {}, description: 'Marché local, fournisseurs de base et premiers habitués.',
      nodes: [
        { item: 'bread', label: 'Boulangerie', icon: '🥖', min: 1, max: 3 },
        { item: 'vegetables', label: 'Marché', icon: '🥕', min: 1, max: 3 },
        { item: 'coffee', label: 'Torréfacteur', icon: '☕', min: 1, max: 2 },
        { item: 'cheese', label: 'Fromager', icon: '🧀', min: 1, max: 2 },
        { item: 'sugar', label: 'Épicerie', icon: '🍬', min: 1, max: 2 },
        { item: 'fabric', label: 'Mercerie', icon: '🧵', min: 1, max: 2 }
      ]
    },
    {
      id: 'forest', name: 'Forêt Gourmande', icon: '🌳', className: 'forest', repNeed: 120, unlockCost: { coins: 1800, fabric: 5 }, description: 'Fruits sauvages, bois, plantes et champignons colorés.',
      nodes: [
        { item: 'wood', label: 'Bosquet', icon: '🪵', min: 1, max: 3 },
        { item: 'fruits', label: 'Clairière', icon: '🍓', min: 1, max: 3 },
        { item: 'mushrooms', label: 'Sous-bois', icon: '🍄', min: 1, max: 2 },
        { item: 'spices', label: 'Herbes', icon: '🌿', min: 1, max: 2 },
        { item: 'wood', label: 'Vieil arbre', icon: '🌲', min: 2, max: 4 },
        { item: 'fruits', label: 'Roncier', icon: '🫐', min: 1, max: 3 }
      ]
    },
    {
      id: 'mine', name: 'Petite Mine', icon: '⛏️', className: 'mine', repNeed: 480, unlockCost: { coins: 10000, wood: 35, fabric: 15 }, description: 'Pierre, métal, verre brut et cristaux utiles aux machines.',
      nodes: [
        { item: 'stone', label: 'Paroi', icon: '🪨', min: 1, max: 3 },
        { item: 'metal', label: 'Filon', icon: '🔩', min: 1, max: 2 },
        { item: 'glass', label: 'Silice', icon: '🪟', min: 1, max: 2 },
        { item: 'crystal', label: 'Géode', icon: '🔮', min: 1, max: 1 },
        { item: 'stone', label: 'Éboulis', icon: '⛰️', min: 2, max: 4 },
        { item: 'metal', label: 'Wagonnet', icon: '🛒', min: 1, max: 3 }
      ]
    },
    {
      id: 'sea', name: 'Bord de Mer', icon: '🏖️', className: 'sea', repNeed: 1100, unlockCost: { coins: 32000, wood: 60, metal: 30, glass: 20 }, description: 'Poissons, sel, coquillages et touristes généreux.',
      nodes: [
        { item: 'fish', label: 'Petit port', icon: '🐟', min: 1, max: 3 },
        { item: 'salt', label: 'Marais salant', icon: '🧂', min: 1, max: 2 },
        { item: 'glass', label: 'Verre poli', icon: '💠', min: 1, max: 2 },
        { item: 'fish', label: 'Barque', icon: '⛵', min: 2, max: 4 },
        { item: 'fabric', label: 'Marché marin', icon: '🧵', min: 1, max: 2 },
        { item: 'spices', label: 'Étal exotique', icon: '🌶️', min: 1, max: 2 }
      ]
    }
  ];

  const UPGRADES = [
    { id: 'counter_2', name: 'Comptoir élargi I', icon: '🪑', category: 'service', desc: '+1 client peut attendre.', coins: 260, materials: { wood: 4 }, repNeed: 8 },
    { id: 'counter_3', name: 'Comptoir élargi II', icon: '🪑', category: 'service', desc: '+1 client supplémentaire.', coins: 1600, materials: { wood: 12, stone: 4 }, repNeed: 90, requires: 'counter_2' },
    { id: 'counter_4', name: 'Grande salle', icon: '🏠', category: 'service', desc: '+2 clients et +5 % de réputation.', coins: 9800, materials: { wood: 32, stone: 16, glass: 5 }, repNeed: 380, requires: 'counter_3' },
    { id: 'cutting_board', name: 'Planche de préparation', icon: '🔪', category: 'kitchen', desc: '-10 % de temps sur toutes les recettes.', coins: 180, materials: { wood: 3 }, repNeed: 0 },
    { id: 'coffee_machine', name: 'Machine à café', icon: '☕', category: 'kitchen', desc: 'Les cafés sont préparés 35 % plus vite.', coins: 650, materials: { metal: 2 }, repNeed: 45 },
    { id: 'oven', name: 'Petit four', icon: '🔥', category: 'kitchen', desc: 'Débloque les tartes et recettes chaudes.', coins: 2300, materials: { stone: 10, metal: 5 }, repNeed: 145 },
    { id: 'shelf', name: 'Étagère renforcée', icon: '🗄️', category: 'kitchen', desc: '+1 emplacement de préparation.', coins: 820, materials: { wood: 9, metal: 2 }, repNeed: 60 },
    { id: 'display_case', name: 'Vitrine réfrigérée', icon: '🧁', category: 'kitchen', desc: 'Débloque le dessert vitrine et +10 % sur les desserts.', coins: 7200, materials: { glass: 10, metal: 8 }, repNeed: 330, requires: 'oven' },
    { id: 'wood_tray', name: 'Plateau en bois', icon: '🍽️', category: 'service', desc: 'Le plateau peut contenir 2 plats.', coins: 420, materials: { wood: 6 }, repNeed: 20 },
    { id: 'strong_tray', name: 'Plateau renforcé', icon: '🥘', category: 'service', desc: 'Le plateau peut contenir 3 plats.', coins: 3400, materials: { wood: 10, metal: 5 }, repNeed: 185, requires: 'wood_tray' },
    { id: 'register', name: 'Caisse améliorée', icon: '🧾', category: 'service', desc: '+8 % de pièces par commande.', coins: 1250, materials: { metal: 3 }, repNeed: 80 },
    { id: 'helper_counter', name: 'Aide-comptoir', icon: '🙋', category: 'automation', desc: 'Sert parfois automatiquement une commande simple prête.', coins: 5200, materials: { fabric: 8, metal: 7 }, repNeed: 260 },
    { id: 'helper_kitchen', name: 'Aide-cuisine', icon: '🧑‍🍳', category: 'automation', desc: 'Prépare périodiquement une tartine si les ingrédients sont disponibles.', coins: 8400, materials: { fabric: 10, metal: 10 }, repNeed: 410, requires: 'shelf' },
    { id: 'ingredient_delivery', name: 'Livraison locale', icon: '🚲', category: 'automation', desc: 'Reçoit pain et légumes pendant que tu joues.', coins: 3100, materials: { wood: 8, fabric: 5 }, repNeed: 175 },
    { id: 'wood_collector', name: 'Collecteur forestier', icon: '🪓', category: 'automation', desc: 'Reçoit du bois pendant que tu joues.', coins: 6500, materials: { metal: 8, wood: 15 }, repNeed: 300, zone: 'forest' },
    { id: 'better_tools', name: 'Outils équilibrés', icon: '🧰', category: 'service', desc: '+1 ressource sur certaines récoltes.', coins: 2800, materials: { metal: 6, wood: 8 }, repNeed: 155, zone: 'forest' },
    { id: 'market_contacts', name: 'Contacts du marché', icon: '🤝', category: 'service', desc: '+7 % de chance de trouver un collectible.', coins: 4400, materials: { fabric: 5, glass: 3 }, repNeed: 230 },
    { id: 'cold_storage', name: 'Réserve froide', icon: '🧊', category: 'kitchen', desc: '+20 unités à la limite confortable de stock.', coins: 10500, materials: { metal: 12, glass: 12 }, repNeed: 460, zone: 'mine' },
    { id: 'lucky_charm', name: 'Porte-bonheur du comptoir', icon: '🍀', category: 'service', desc: 'Les clients mystère apparaissent un peu plus souvent.', coins: 12800, materials: { crystal: 5, fabric: 6 }, repNeed: 520, zone: 'mine' },
    { id: 'zone_cart', name: 'Chariot d’exploration', icon: '🛒', category: 'automation', desc: 'Réduit le délai entre deux récoltes actives.', coins: 18000, materials: { metal: 18, wood: 20 }, repNeed: 610, zone: 'sea' }
  ];

  const COLLECTIONS = [
    { id: 'utensils', name: 'Ustensiles oubliés', icon: '🍴', zone: 'quarter', bonus: '+5 % vitesse de préparation', items: [
      ['old_spatula', 'Vieille spatule', '🥄'], ['shiny_whisk', 'Fouet brillant', '🧹'], ['round_knife', 'Couteau rond', '🔪'], ['gold_ladle', 'Louche dorée', '🥣'], ['mini_pan', 'Mini poêle', '🍳']
    ]},
    { id: 'rare_fruits', name: 'Fruits rares', icon: '🍎', zone: 'forest', bonus: '+10 % sur les desserts', items: [
      ['pink_berry', 'Baie rose', '🫐'], ['gold_apple', 'Pomme dorée', '🍏'], ['giant_strawberry', 'Fraise géante', '🍓'], ['soft_pear', 'Poire douce', '🍐'], ['star_fruit', 'Fruit étoilé', '⭐']
    ]},
    { id: 'souvenirs', name: 'Souvenirs de clients', icon: '🎟️', zone: 'quarter', bonus: '+5 % réputation', items: [
      ['old_ticket', 'Ticket froissé', '🎫'], ['tourist_badge', 'Badge touriste', '📛'], ['foodie_book', 'Carnet gourmand', '📔'], ['old_coin', 'Pièce ancienne', '🪙'], ['postcard', 'Carte postale', '💌']
    ]},
    { id: 'shells', name: 'Coquillages du rivage', icon: '🐚', zone: 'sea', bonus: 'Touristes plus fréquents', items: [
      ['spiral_shell', 'Spirale nacrée', '🐚'], ['blue_shell', 'Coquille bleue', '🌀'], ['tiny_conch', 'Mini conque', '📯'], ['pearl_shell', 'Coquille perlée', '🦪'], ['sun_shell', 'Coquille soleil', '☀️']
    ]},
    { id: 'crystals', name: 'Cristaux de la mine', icon: '💎', zone: 'mine', bonus: '-5 % coût des améliorations', items: [
      ['rose_crystal', 'Cristal rose', '🔮'], ['sky_crystal', 'Cristal ciel', '💠'], ['amber_crystal', 'Cristal ambre', '🟠'], ['night_crystal', 'Cristal nocturne', '🌌'], ['prism_crystal', 'Cristal prisme', '🌈']
    ]}
  ];

  const OBJECTIVES = [
    ['serve_1', 'Premier sourire', 'Servir 1 client', 'short', 'served', 1, { coins: 45 }],
    ['cook_3', 'La cuisine démarre', 'Préparer 3 plats', 'short', 'cooked', 3, { coins: 55, bread: 2 }],
    ['coins_150', 'Première recette', 'Gagner 150 pièces au total', 'short', 'coinsEarned', 150, { coins: 70 }],
    ['gather_5', 'Petit tour au marché', 'Récolter 5 fois', 'short', 'gathers', 5, { vegetables: 3 }],
    ['serve_10', 'Service continu', 'Servir 10 clients', 'short', 'served', 10, { coins: 150, reputation: 8 }],
    ['combo_3', 'Coup de feu', 'Atteindre un combo de 3', 'short', 'bestCombo', 3, { diamonds: 1 }],
    ['mini_1', 'Pause pétillante', 'Gagner 1 niveau bonus', 'short', 'miniWins', 1, { coins: 100 }],
    ['rep_30', 'Le quartier parle de toi', 'Atteindre 30 réputation', 'medium', 'reputation', 30, { coins: 180 }],
    ['upgrade_2', 'Premiers investissements', 'Acheter 2 améliorations', 'medium', 'upgradesBought', 2, { wood: 4, coins: 120 }],
    ['recipes_4', 'Carte élargie', 'Débloquer 4 recettes', 'medium', 'recipesUnlocked', 4, { sugar: 3, fruits: 2 }],
    ['forest', 'Au-delà du quartier', 'Débloquer la Forêt Gourmande', 'long', 'zonesUnlocked', 2, { diamonds: 2, coins: 300 }],
    ['collect_1', 'Trouvaille', 'Découvrir 1 collectible', 'short', 'collectibles', 1, { coins: 120 }],
    ['serve_35', 'Habitués', 'Servir 35 clients', 'medium', 'served', 35, { coins: 450, reputation: 20 }],
    ['mini_5', 'Cinq réserves vidées', 'Gagner 5 niveaux bonus', 'medium', 'miniWins', 5, { diamonds: 2, coins: 350 }],
    ['wood_25', 'Stock de menuiserie', 'Posséder 25 bois', 'medium', 'item:wood', 25, { coins: 260 }],
    ['coins_3000', 'Caisse sérieuse', 'Gagner 3 000 pièces au total', 'medium', 'coinsEarned', 3000, { diamonds: 2 }],
    ['upgrade_6', 'Comptoir organisé', 'Acheter 6 améliorations', 'long', 'upgradesBought', 6, { coins: 850, metal: 3 }],
    ['collect_5', 'Début de collection', 'Découvrir 5 collectibles', 'medium', 'collectibles', 5, { diamonds: 1, coins: 500 }],
    ['rep_150', 'Bonne réputation', 'Atteindre 150 réputation', 'long', 'reputation', 150, { coins: 950 }],
    ['mine', 'Sous la surface', 'Débloquer la Petite Mine', 'long', 'zonesUnlocked', 3, { diamonds: 3, metal: 4 }],
    ['serve_75', 'Salle pleine', 'Servir 75 clients', 'long', 'served', 75, { coins: 1400, reputation: 30 }],
    ['cook_100', 'Cent plats', 'Préparer 100 plats', 'long', 'cooked', 100, { diamonds: 3 }],
    ['mini_10', 'Stratège des bulles', 'Gagner 10 niveaux bonus', 'medium', 'miniWins', 10, { coins: 1200, diamonds: 2 }],
    ['collect_10', 'Vitrine de curiosités', 'Découvrir 10 collectibles', 'long', 'collectibles', 10, { coins: 1300 }],
    ['recipes_7', 'Carte variée', 'Débloquer 7 recettes', 'medium', 'recipesUnlocked', 7, { diamonds: 2, spices: 4 }],
    ['lost_10', 'Ça arrive', 'Voir 10 clients repartir', 'short', 'lost', 10, { coins: 180 }],
    ['gather_100', 'Exploratrice active', 'Récolter 100 fois', 'long', 'gathers', 100, { diamonds: 3, coins: 900 }],
    ['rep_350', 'Adresse connue', 'Atteindre 350 réputation', 'long', 'reputation', 350, { coins: 2200 }],
    ['upgrade_12', 'Établissement moderne', 'Acheter 12 améliorations', 'long', 'upgradesBought', 12, { diamonds: 4 }],
    ['sea', 'Vue sur la mer', 'Débloquer le Bord de Mer', 'long', 'zonesUnlocked', 4, { diamonds: 5, fish: 4 }],
    ['mini_20', 'Maîtrise pétillante', 'Gagner 20 niveaux bonus', 'long', 'miniWins', 20, { diamonds: 5, coins: 2500 }],
    ['serve_200', 'Deux cents clients', 'Servir 200 clients', 'long', 'served', 200, { diamonds: 5, coins: 3000 }],
    ['collect_15', 'Cabinet de curiosités', 'Découvrir 15 collectibles', 'long', 'collectibles', 15, { diamonds: 4 }],
    ['coins_25000', 'Belle trésorerie', 'Gagner 25 000 pièces au total', 'long', 'coinsEarned', 25000, { diamonds: 5 }],
    ['recipes_10', 'Carte complète V1', 'Débloquer les 10 recettes', 'long', 'recipesUnlocked', 10, { diamonds: 6 }],
    ['mini_30', 'Toutes les réserves', 'Terminer les 30 niveaux bonus', 'long', 'miniWins', 30, { diamonds: 8, coins: 5000 }],
    ['collect_20', 'Presque tout trouvé', 'Découvrir 20 collectibles', 'long', 'collectibles', 20, { diamonds: 5 }],
    ['rep_800', 'Institution locale', 'Atteindre 800 réputation', 'long', 'reputation', 800, { coins: 5000, diamonds: 4 }],
    ['upgrade_20', 'Tout améliorer', 'Acheter les 20 améliorations V1', 'long', 'upgradesBought', 20, { diamonds: 10 }],
    ['collect_25', 'Musée du comptoir', 'Découvrir les 25 collectibles', 'long', 'collectibles', 25, { diamonds: 12, coins: 10000 }]
  ].map(([id, title, description, type, metric, target, reward]) => ({ id, title, description, type, metric, target, reward }));

  const MINI_TILES = [
    { id: 'berry', icon: '🍓', asset: 'fruits' },
    { id: 'coffee', icon: '☕', asset: 'coffee' },
    { id: 'cheese', icon: '🧀', asset: 'cheese' },
    { id: 'carrot', icon: '🥕', asset: 'carrot' },
    { id: 'fish', icon: '🐟', asset: 'fish' },
    { id: 'mushroom', icon: '🍄', asset: 'mushroom' }
  ];


  const ASSET_BASE = 'assets/pixel/';
  const ITEM_ASSETS = {
    bread: 'bread', cheese: 'cheese', vegetables: 'vegetables', fruits: 'fruits', coffee: 'coffee', sugar: 'sugar', spices: 'spices',
    fish: 'fish', mushrooms: 'mushroom', salt: 'sugar', wood: 'wood', stone: 'stone', metal: 'ingot', fabric: 'fabric', glass: 'glass', crystal: 'ore'
  };
  const RECIPE_ASSETS = {
    toast: 'bread', cheese_sandwich: 'cheese', sweet_coffee: 'coffee', salad: 'vegetables', fruit_tart: 'tart', forest_soup: 'soup',
    spicy_skewer: 'skewer', grilled_fish: 'grilled_fish', display_dessert: 'tart', counter_menu: 'tray'
  };
  const CLIENT_SPRITES = {
    classic: 'client_red', student: 'client_cat', rushed: 'client_dwarf', foodie: 'client_elder', tourist: 'client_red', mystery: 'client_cat', inspector: 'client_elder'
  };
  const ZONE_ART = { quarter: 'zone_market', forest: 'zone_forest', mine: 'zone_mine', sea: 'zone_sea' };
  const UPGRADE_ASSETS = {
    counter_2: 'service_counter', counter_3: 'service_counter', counter_4: 'floor_dark', cutting_board: 'cutting_board', coffee_machine: 'coffee_machine',
    oven: 'oven', shelf: 'shelf', display_case: 'display_case', wood_tray: 'tray', strong_tray: 'service_cart', register: 'cash_register',
    helper_counter: 'client_red', helper_kitchen: 'player_carry', ingredient_delivery: 'basket', wood_collector: 'workbench', better_tools: 'workbench',
    market_contacts: 'sign', cold_storage: 'storage_chest', zone_cart: 'service_cart', lucky_charm: 'flowers', smart_schedule: 'craft_machine'
  };
  const FURNITURE = {
    table_round: { id: 'table_round', name: 'Table ronde', asset: 'table_round' },
    chair: { id: 'chair', name: 'Chaise', asset: 'chair' },
    plant: { id: 'plant', name: 'Plante', asset: 'plant' },
    crate: { id: 'crate', name: 'Caisse', asset: 'crate' }
  };
  const LAYOUT_SLOTS = [
    { x: .18, y: .74 }, { x: .31, y: .72 }, { x: .45, y: .69 }, { x: .59, y: .66 }, { x: .73, y: .63 },
    { x: .23, y: .61 }, { x: .37, y: .58 }, { x: .52, y: .55 }, { x: .66, y: .52 },
    { x: .29, y: .48 }, { x: .43, y: .45 }, { x: .58, y: .43 }
  ];

  function assetPath(name) { return `${ASSET_BASE}${name}.png`; }
  function pixelImg(name, alt = '', className = 'pixel-inline') {
    if (!name) return '';
    return `<img src="${assetPath(name)}" alt="${alt.replace(/"/g, '&quot;')}" class="${className}">`;
  }
  function itemImg(key, className = 'pixel-inline') { return pixelImg(ITEM_ASSETS[key], ITEMS[key]?.name || key, className); }
  function recipeImg(recipeOrId, className = 'pixel-inline') {
    const id = typeof recipeOrId === 'string' ? recipeOrId : recipeOrId?.id;
    const recipe = typeof recipeOrId === 'string' ? getRecipe(recipeOrId) : recipeOrId;
    return pixelImg(RECIPE_ASSETS[id] || 'plate', recipe?.name || id, className);
  }

  function defaultState() {
    return {
      saveVersion: SAVE_VERSION,
      gameVersion: GAME_VERSION,
      coins: 160,
      reputation: 0,
      diamonds: 3,
      inventory: {
        bread: 10, cheese: 5, vegetables: 7, fruits: 0, coffee: 6, sugar: 6, spices: 0, fish: 0,
        mushrooms: 0, salt: 0, wood: 4, stone: 0, metal: 0, fabric: 2, glass: 0, crystal: 0
      },
      unlockedZones: ['quarter'],
      upgrades: [],
      foundCollectibles: [],
      claimedObjectives: [],
      cooking: [],
      tray: [],
      customers: [],
      nextCustomerAt: Date.now() + 2500,
      lastChestAt: 0,
      player: { x: 0.5, y: 0.62 },
      settings: { movementMode: 'destination', showMoveMarker: true, sound: false, reducedMotion: false, vibration: true },
      boosts: { serviceUntil: 0, kitchenUntil: 0, generousUntil: 0, luckyUntil: 0 },
      stats: {
        served: 0, cooked: 0, coinsEarned: 0, gathers: 0, bestCombo: 0, miniWins: 0,
        upgradesBought: 0, lost: 0, collectibles: 0, zonesUnlocked: 1, currentCombo: 0,
        lastServeAt: 0
      },
      zoneXP: { quarter: 0, forest: 0, mine: 0, sea: 0 },
      cooldowns: {},
      minigame: { level: 1, bestLevel: 1 },
      lastSavedAt: 0,
      tutorialSeen: false,
      restaurantOpen: true,
      decorInventory: { table_round: 1, chair: 2, plant: 1, crate: 1 },
      placedFurniture: []
    };
  }

  let state = loadState();
  let currentTab = 'counter';
  let upgradeFilter = 'all';
  let movementTarget = { x: state.player.x, y: state.player.y };
  let followPointerActive = false;
  let pendingWorldAction = null;
  let lastFrame = performance.now();
  let lastSecondTick = 0;
  let automationTimers = { delivery: Date.now(), wood: Date.now(), helper: Date.now(), kitchen: Date.now() };
  let mini = null;
  let layoutEditing = false;
  let selectedFurnitureId = null;

  const el = id => document.getElementById(id);
  const fmt = n => Math.floor(Number(n || 0)).toLocaleString('fr-FR');
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choice = arr => arr[Math.floor(Math.random() * arr.length)];

  function hasUpgrade(s, id) { return s.upgrades.includes(id); }
  function getRecipe(id) { return RECIPES.find(r => r.id === id); }
  function getZone(id) { return ZONES.find(z => z.id === id); }
  function getUpgrade(id) { return UPGRADES.find(u => u.id === id); }
  function getUnlockedRecipes() { return RECIPES.filter(r => r.unlock(state)); }
  function hasCollection(id) {
    const col = COLLECTIONS.find(c => c.id === id);
    return !!col && col.items.every(([itemId]) => state.foundCollectibles.includes(itemId));
  }

  function migrateSave(raw) {
    const base = defaultState();
    const merged = {
      ...base,
      ...raw,
      inventory: { ...base.inventory, ...(raw.inventory || {}) },
      player: { ...base.player, ...(raw.player || {}) },
      settings: { ...base.settings, ...(raw.settings || {}) },
      boosts: { ...base.boosts, ...(raw.boosts || {}) },
      stats: { ...base.stats, ...(raw.stats || {}) },
      zoneXP: { ...base.zoneXP, ...(raw.zoneXP || {}) },
      cooldowns: { ...(raw.cooldowns || {}) },
      minigame: { ...base.minigame, ...(raw.minigame || {}) },
      decorInventory: { ...base.decorInventory, ...(raw.decorInventory || {}) },
      placedFurniture: Array.isArray(raw.placedFurniture) ? raw.placedFurniture : base.placedFurniture
    };
    merged.saveVersion = SAVE_VERSION;
    merged.gameVersion = GAME_VERSION;
    return merged;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultState();
      return migrateSave(JSON.parse(raw));
    } catch (error) {
      console.warn('Sauvegarde illisible, nouvelle partie.', error);
      return defaultState();
    }
  }

  function saveState(showToast = false) {
    state.lastSavedAt = Date.now();
    state.gameVersion = GAME_VERSION;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    renderSaveLabel();
    if (showToast) toast('Partie sauvegardée.');
  }

  let activeToast = null;
  let activeToastTimer = null;

  function toast(message) {
    const layer = el('toastLayer');
    if (!activeToast) {
      activeToast = document.createElement('div');
      activeToast.className = 'toast';
      layer.replaceChildren(activeToast);
    }
    activeToast.textContent = message;
    activeToast.style.animation = 'none';
    activeToast.offsetHeight;
    activeToast.style.animation = '';
    clearTimeout(activeToastTimer);
    activeToastTimer = setTimeout(() => {
      activeToast?.remove();
      activeToast = null;
    }, 1850);
    vibrate(18);
  }

  function vibrate(ms = 20) {
    if (state.settings.vibration && navigator.vibrate) navigator.vibrate(ms);
  }

  function showModal(title, html, buttons = []) {
    const layer = el('modalLayer');
    layer.hidden = false;
    layer.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'modal-card';
    card.innerHTML = `<h2>${title}</h2><div>${html}</div><div class="button-row"></div>`;
    const row = card.querySelector('.button-row');
    buttons.forEach(button => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = button.className || 'secondary-button';
      b.textContent = button.label;
      b.addEventListener('click', () => {
        if (button.action) button.action();
        if (button.close !== false) closeModal();
      });
      row.appendChild(b);
    });
    layer.appendChild(card);
  }

  function closeModal() {
    el('modalLayer').hidden = true;
    el('modalLayer').innerHTML = '';
  }


  function showTutorial(force = false) {
    if (!force && state.tutorialSeen) return;
    const html = `
      <p>Le jeu est maintenant organisé autour de la préparation et du craft.</p>
      <div class="tutorial-steps">
        <div class="tutorial-step"><div class="tutorial-num">1</div><div><b>Ferme la taverne pour préparer</b><small>Le bouton au-dessus de la salle permet d'ouvrir ou fermer la taverne. Fermée, aucun client n'arrive et rien ne presse.</small></div></div>
        <div class="tutorial-step"><div class="tutorial-num">2</div><div><b>Fabrique ton stock</b><small>Va dans Atelier pour transformer tes ingrédients en plats. Les futures versions ajouteront le vrai craft de meubles, outils et machines.</small></div></div>
        <div class="tutorial-step"><div class="tutorial-num">3</div><div><b>Ouvre quand tu es prête</b><small>Quand plusieurs plats sont prêts, ouvre la taverne. Les clients arrivent et demandent une recette précise.</small></div></div>
        <div class="tutorial-step"><div class="tutorial-num">4</div><div><b>Déplace-toi et sers</b><small>Touche le sol pour déplacer ton personnage, puis touche un client pour lui apporter le plat correspondant.</small></div></div>
        <div class="tutorial-step"><div class="tutorial-num">5</div><div><b>Utilise les régions et le bonus</b><small>Les régions fournissent provisoirement les ressources par boutons. Le mini-jeu Bonus reste accessible à tout moment.</small></div></div>
      </div>`;
    showModal('Bienvenue au Comptoir', html, [
      { label: 'J’ai compris', className: 'primary-button', action: () => { state.tutorialSeen = true; saveState(); } }
    ]);
  }

  function addResource(key, amount) {
    if (key === 'coins') state.coins += amount;
    else if (key === 'reputation') state.reputation += amount;
    else if (key === 'diamonds') state.diamonds += amount;
    else state.inventory[key] = (state.inventory[key] || 0) + amount;
  }

  function grantReward(reward) {
    Object.entries(reward || {}).forEach(([key, amount]) => addResource(key, amount));
  }

  function rewardHtml(reward) {
    return Object.entries(reward || {}).map(([key, amount]) => {
      const visual = key === 'coins' ? '🪙' : key === 'reputation' ? '⭐' : key === 'diamonds' ? '💎' : itemImg(key);
      return `<span class="resource-chip">${visual} ${fmt(amount)}</span>`;
    }).join('');
  }

  function canPay(coins, materials = {}) {
    const discount = hasCollection('crystals') ? 0.95 : 1;
    if (state.coins < Math.ceil(coins * discount)) return false;
    return Object.entries(materials).every(([key, amount]) => (state.inventory[key] || 0) >= amount);
  }

  function pay(coins, materials = {}) {
    const discount = hasCollection('crystals') ? 0.95 : 1;
    state.coins -= Math.ceil(coins * discount);
    Object.entries(materials).forEach(([key, amount]) => state.inventory[key] -= amount);
  }

  function materialChips(materials = {}) {
    return Object.entries(materials).map(([key, amount]) => `<span class="resource-chip">${itemImg(key)} ${amount}</span>`).join('');
  }

  function getEffects() {
    return {
      maxCustomers: 2 + (hasUpgrade(state, 'counter_2') ? 1 : 0) + (hasUpgrade(state, 'counter_3') ? 1 : 0) + (hasUpgrade(state, 'counter_4') ? 2 : 0),
      trayCapacity: 1 + (hasUpgrade(state, 'wood_tray') ? 1 : 0) + (hasUpgrade(state, 'strong_tray') ? 1 : 0),
      cookingSlots: 1 + (hasUpgrade(state, 'shelf') ? 1 : 0),
      prepMultiplier: (hasUpgrade(state, 'cutting_board') ? 0.9 : 1) * (hasCollection('utensils') ? 0.95 : 1) * (Date.now() < state.boosts.kitchenUntil ? 0.65 : 1),
      coinMultiplier: (hasUpgrade(state, 'register') ? 1.08 : 1) * (Date.now() < state.boosts.generousUntil ? 1.2 : 1),
      repMultiplier: (hasUpgrade(state, 'counter_4') ? 1.05 : 1) * (hasCollection('souvenirs') ? 1.05 : 1),
      dessertMultiplier: (hasUpgrade(state, 'display_case') ? 1.1 : 1) * (hasCollection('rare_fruits') ? 1.1 : 1),
      gatherBonusChance: hasUpgrade(state, 'better_tools') ? 0.35 : 0,
      collectibleChance: 0.035 + (hasUpgrade(state, 'market_contacts') ? 0.07 : 0) + (Date.now() < state.boosts.luckyUntil ? 0.08 : 0),
      gatherCooldown: hasUpgrade(state, 'zone_cart') ? 750 : 1500,
      serviceSpeed: Date.now() < state.boosts.serviceUntil ? 1.45 : 1
    };
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('[data-tab-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.tabPanel === tab));
    document.querySelectorAll('[data-tab]').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
    window.scrollTo({ top: 0, behavior: state.settings.reducedMotion ? 'auto' : 'smooth' });
    if (tab === 'minigame' && !mini) initMiniLevel();
    renderAll();
  }

  function renderHUD() {
    el('coinsValue').textContent = fmt(state.coins);
    el('repValue').textContent = fmt(state.reputation);
    el('diamondsValue').textContent = fmt(state.diamonds);
    el('versionLabel').textContent = `V${GAME_VERSION}`;
  }

  function getMetricValue(metric) {
    if (metric === 'reputation') return state.reputation;
    if (metric === 'zonesUnlocked') return state.unlockedZones.length;
    if (metric === 'upgradesBought') return state.upgrades.length;
    if (metric === 'collectibles') return state.foundCollectibles.length;
    if (metric === 'recipesUnlocked') return getUnlockedRecipes().length;
    if (metric.startsWith('item:')) return state.inventory[metric.split(':')[1]] || 0;
    return state.stats[metric] || 0;
  }

  function renderActiveGoal() {
    const objective = OBJECTIVES.find(o => !state.claimedObjectives.includes(o.id));
    if (!objective) {
      el('activeGoalText').textContent = 'Tous les objectifs V1 sont terminés';
      el('activeGoalProgress').style.width = '100%';
      return;
    }
    const value = getMetricValue(objective.metric);
    el('activeGoalText').textContent = objective.description;
    el('activeGoalProgress').style.width = `${clamp(value / objective.target * 100, 0, 100)}%`;
  }

  function renderRestaurantState() {
    const card = document.querySelector('.world-card');
    const button = el('toggleRestaurant');
    const curtain = el('closedCurtain');
    const label = el('restaurantStateLabel');
    const layoutButton = el('toggleLayoutEditor');
    if (!card || !button || !curtain || !label) return;
    card.classList.toggle('closed', !state.restaurantOpen);
    curtain.hidden = state.restaurantOpen;
    label.textContent = state.restaurantOpen ? 'Taverne ouverte' : 'Taverne fermée';
    button.textContent = state.restaurantOpen ? 'Fermer la taverne' : 'Ouvrir la taverne';
    el('worldStatus').textContent = layoutEditing
      ? 'Mode agencement : choisis un meuble puis touche un emplacement pour le poser.'
      : (state.restaurantOpen
        ? 'La taverne est ouverte : prépare et sers les commandes.'
        : 'Taverne fermée : cuisine, collecte et améliore sans pression.');
    if (layoutButton) layoutButton.textContent = layoutEditing ? "Finir l'agencement" : "Agencer";
  }

  function toggleRestaurant() {
    state.restaurantOpen = !state.restaurantOpen;
    if (!state.restaurantOpen) {
      state.customers = [];
      state.stats.currentCombo = 0;
      toast('Taverne fermée. Les clients reviendront à la prochaine ouverture.');
    } else {
      state.nextCustomerAt = Date.now() + 1200;
      toast('Taverne ouverte : les premiers clients arrivent.');
    }
    saveState();
    renderAll();
  }


  function toggleLayoutEditor() {
    layoutEditing = !layoutEditing;
    selectedFurnitureId = null;
    el('layoutEditorPanel').hidden = !layoutEditing;
    el('layoutGrid').hidden = !layoutEditing;
    if (layoutEditing) toast('Mode agencement activé.');
    else toast('Agencement enregistré.');
    renderAll();
  }

  function getPlacedFurnitureAt(slotIndex) {
    return state.placedFurniture.find(item => item.slotIndex === slotIndex);
  }

  function removeFurniture(itemUniqueId) {
    const index = state.placedFurniture.findIndex(item => item.uid === itemUniqueId);
    if (index < 0) return;
    const [item] = state.placedFurniture.splice(index, 1);
    state.decorInventory[item.furnitureId] = (state.decorInventory[item.furnitureId] || 0) + 1;
    saveState();
    renderAll();
    toast(`${FURNITURE[item.furnitureId].name} rangé.`);
  }

  function placeFurnitureOnSlot(slotIndex) {
    if (!layoutEditing || !selectedFurnitureId) return;
    if (getPlacedFurnitureAt(slotIndex)) {
      toast('Cet emplacement est déjà occupé.');
      return;
    }
    if ((state.decorInventory[selectedFurnitureId] || 0) <= 0) {
      toast("Tu n'as plus cet objet à poser.");
      return;
    }
    state.decorInventory[selectedFurnitureId] -= 1;
    state.placedFurniture.push({
      uid: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      furnitureId: selectedFurnitureId,
      slotIndex
    });
    saveState();
    renderAll();
    toast(`${FURNITURE[selectedFurnitureId].name} placé.`);
  }

  function renderFurnitureLayer() {
    const layer = el('furnitureLayer');
    const grid = el('layoutGrid');
    if (!layer || !grid) return;
    layer.innerHTML = '';
    state.placedFurniture.forEach(item => {
      const slot = LAYOUT_SLOTS[item.slotIndex];
      const furn = FURNITURE[item.furnitureId];
      if (!slot || !furn) return;
      const node = document.createElement(layoutEditing ? 'button' : 'div');
      if (layoutEditing) node.type = 'button';
      node.className = `furniture-item ${item.furnitureId}`;
      node.style.left = `${slot.x * 100}%`;
      node.style.top = `${slot.y * 100}%`;
      node.style.zIndex = String(5 + Math.round(slot.y * 100));
      node.innerHTML = `<img src="${assetPath(furn.asset)}" alt="${furn.name}">`;
      if (layoutEditing) {
        node.title = `${furn.name} — toucher pour retirer`;
        node.classList.add('selected-item');
        node.addEventListener('pointerdown', event => {
          event.stopPropagation();
          removeFurniture(item.uid);
        });
      }
      layer.appendChild(node);
    });
    grid.hidden = !layoutEditing;
    grid.innerHTML = '';
    if (layoutEditing) {
      LAYOUT_SLOTS.forEach((slot, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'layout-slot';
        if (getPlacedFurnitureAt(index)) button.classList.add('occupied');
        if (selectedFurnitureId) button.classList.add('selected');
        button.style.left = `${slot.x * 100}%`;
        button.style.top = `${slot.y * 100}%`;
        button.style.zIndex = String(4 + Math.round(slot.y * 100));
        button.addEventListener('pointerdown', event => {
          event.stopPropagation();
          placeFurnitureOnSlot(index);
        });
        grid.appendChild(button);
      });
    }
  }

  function renderLayoutEditor() {
    const panel = el('layoutEditorPanel');
    if (!panel) return;
    panel.hidden = !layoutEditing;
    if (!layoutEditing) { panel.innerHTML = ''; return; }
    const selected = selectedFurnitureId ? FURNITURE[selectedFurnitureId]?.name : 'aucun';
    panel.innerHTML = `
      <h3>Agencement libre</h3>
      <p>Choisis un meuble ci-dessous, puis touche un emplacement vert dans la taverne pour le poser. Touche un meuble posé pour le retirer.</p>
      <div class="layout-chip">Sélection : <b>${selected}</b></div>
      <div class="layout-palette">
        ${Object.values(FURNITURE).map(item => `
          <button type="button" class="layout-card ${selectedFurnitureId === item.id ? 'active' : ''}" data-layout-item="${item.id}">
            <img src="${assetPath(item.asset)}" alt="${item.name}">
            <b>${item.name}</b>
            <small>Disponibles : ${state.decorInventory[item.id] || 0}</small>
          </button>`).join('')}
      </div>
      <div class="layout-controls">
        <button type="button" id="clearLayoutSelection" class="secondary-button">Effacer la sélection</button>
      </div>
    `;
    panel.querySelectorAll('[data-layout-item]').forEach(button => button.addEventListener('click', () => {
      selectedFurnitureId = button.dataset.layoutItem;
      renderLayoutEditor();
      renderFurnitureLayer();
    }));
    panel.querySelector('#clearLayoutSelection')?.addEventListener('click', () => {
      selectedFurnitureId = null;
      renderLayoutEditor();
      renderFurnitureLayer();
    });
  }

  function discardTrayRecipe(recipeId) {
    pullReadyCookingToTray(false);
    const index = state.tray.indexOf(recipeId);
    if (index < 0) return;
    const recipe = getRecipe(recipeId);
    state.tray.splice(index, 1);
    saveState();
    renderAll();
    toast(`${recipe.name} jeté à la poubelle.`);
  }

  function getReadyRecipeCount(recipeId) {
    return state.tray.filter(id => id === recipeId).length;
  }

  function getQueuedRecipeCount(recipeId) {
    return state.cooking.filter(c => c.recipeId === recipeId).length;
  }

  function pullReadyCookingToTray(showToast = true) {
    const effects = getEffects();
    let changed = false;
    const remaining = [];
    state.cooking.forEach(c => {
      if (c.readyAt <= Date.now() && state.tray.length < effects.trayCapacity) {
        state.tray.push(c.recipeId);
        if (showToast) {
          const recipe = getRecipe(c.recipeId);
          toast(`${recipe.icon} ${recipe.name} est prêt.`);
        }
        changed = true;
      } else {
        remaining.push(c);
      }
    });
    state.cooking = remaining;
    if (changed) saveState();
    return changed;
  }

  function renderPlayer() {
    el('player').style.left = `${state.player.x * 100}%`;
    el('player').style.top = `${state.player.y * 100}%`;
    const sprite = el('playerSprite');
    if (sprite) {
      const walking = el('player').classList.contains('walking');
      sprite.src = assetPath(state.tray.length ? 'player_carry' : walking ? 'player_walk' : 'player_idle');
    }
  }

  function customerSlot(index) {
    const slots = [
      { x: .25, y: .70 },
      { x: .43, y: .38 },
      { x: .58, y: .33 },
      { x: .68, y: .57 },
      { x: .16, y: .54 },
      { x: .54, y: .73 }
    ];
    return slots[index % slots.length];
  }

  function renderCustomers() {
    const layer = el('customerLayer');
    layer.innerHTML = '';
    state.customers.forEach((customer, index) => {
      const slot = customerSlot(index);
      customer.x = slot.x;
      customer.y = slot.y;
      const recipe = getRecipe(customer.recipeId);
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'customer-avatar';
      node.style.left = `${slot.x * 100}%`;
      node.style.top = `${slot.y * 100}%`;
      node.dataset.customerId = customer.id;
      node.style.zIndex = String(10 + Math.round(slot.y * 100));
      const pct = clamp(customer.patience / customer.maxPatience * 100, 0, 100);
      const color = pct < 28 ? 'var(--danger)' : pct < 55 ? 'var(--yellow)' : 'var(--green)';
      node.innerHTML = `<img class="customer-sprite" src="${assetPath(customer.sprite || CLIENT_SPRITES[customer.typeId] || 'client_red')}" alt="${customer.name}"><span class="customer-order">${recipeImg(recipe, 'pixel-small')}<span>${recipe.name}</span></span><span class="patience-bar"><span style="width:${pct}%;background:${color}"></span></span>`;
      node.addEventListener('pointerdown', event => {
        event.stopPropagation();
        moveTo(slot.x, slot.y, { type: 'serve', customerId: customer.id });
      });
      layer.appendChild(node);
    });

    el('customerCountBadge').textContent = `${state.customers.length} en attente`;
    const queue = el('customerQueue');
    if (!state.customers.length) {
      queue.className = 'customer-queue empty-state';
      queue.textContent = 'Aucun client pour le moment. Profites-en pour cuisiner, fabriquer ou collecter.';
    } else {
      queue.className = 'customer-queue';
      queue.innerHTML = state.customers.map(c => {
        const recipe = getRecipe(c.recipeId);
        return `<div class="queue-chip"><img class="pixel-small" src="${assetPath(c.sprite || CLIENT_SPRITES[c.typeId] || 'client_red')}" alt=""><span><b>${recipeImg(recipe, 'pixel-small')} ${recipe.name}</b><small>${Math.ceil(c.patience)} s</small></span></div>`;
      }).join('');
    }
  }

  function renderTray() {
    pullReadyCookingToTray(false);
    const effects = getEffects();
    el('trayCapacityLabel').textContent = `${state.tray.length}/${effects.trayCapacity}`;
    const summary = el('traySummary');
    if (summary) summary.textContent = `Capacité de plats prêts : ${state.tray.length}/${effects.trayCapacity}`;
    const tray = el('readyTray');
    if (!state.tray.length) {
      tray.className = 'ready-tray empty-state';
      tray.textContent = 'Aucun plat prêt.';
      return;
    }
    const counts = {};
    state.tray.forEach(recipeId => { counts[recipeId] = (counts[recipeId] || 0) + 1; });
    tray.className = 'ready-tray';
    tray.innerHTML = Object.entries(counts).map(([recipeId, count]) => {
      const recipe = getRecipe(recipeId);
      return `<div class="tray-chip" title="${count} × ${recipe.name}">${recipeImg(recipe, 'pixel-small')}<b>${recipe.name}</b>${count > 1 ? `<span class="tray-chip-count">x${count}</span>` : ''}<span class="tray-actions"><button class="mini-icon-button discard-chip" data-recipe-id="${recipe.id}" type="button" title="Jeter ce plat">🗑️</button></span></div>`;
    }).join('');
    tray.querySelectorAll('.discard-chip').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      discardTrayRecipe(button.dataset.recipeId);
    }));
  }

  function renderKitchen() {
    pullReadyCookingToTray(false);
    const effects = getEffects();
    el('kitchenSpeedLabel').textContent = effects.prepMultiplier < 0.8 ? 'Cuisine rapide' : effects.prepMultiplier < 1 ? 'Cuisine améliorée' : 'Vitesse normale';
    const kitchenSummary = el('kitchenCapacitySummary');
    if (kitchenSummary) {
      kitchenSummary.innerHTML = `
        <div class="kitchen-stat"><small>Préparations en cours</small><b>${state.cooking.length}/${effects.cookingSlots}</b></div>
        <div class="kitchen-stat"><small>Stock prêt</small><b>${state.tray.length}/${effects.trayCapacity}</b></div>
      `;
    }
    const queue = el('cookingQueue');
    if (!state.cooking.length) {
      queue.innerHTML = '<div class="panel-card empty-state">Aucune préparation en cours.</div>';
    } else {
      queue.innerHTML = state.cooking.map(c => {
        const recipe = getRecipe(c.recipeId);
        const duration = c.duration || recipe.prep * 1000;
        const left = Math.max(0, c.readyAt - Date.now());
        const pct = clamp((1 - left / duration) * 100, 0, 100);
        const ready = left <= 0;
        const waitingStock = ready && state.tray.length >= effects.trayCapacity;
        return `<div class="cooking-item ${waitingStock ? 'waiting-stock' : ''}"><span class="card-icon">${recipeImg(recipe, 'pixel-card-icon')}</span><div><b>${recipe.name}</b><div class="cooking-progress"><span style="width:${pct}%"></span></div></div><small>${ready ? (waitingStock ? 'Prêt · stock plein' : 'Prêt') : `${Math.ceil(left / 1000)} s`}</small></div>`;
      }).join('');
    }

    const grid = el('recipeGrid');
    grid.innerHTML = RECIPES.map(recipe => {
      const unlocked = recipe.unlock(state);
      const canCookNow = unlocked && canCookRecipe(recipe) && state.cooking.length < effects.cookingSlots;
      const effectivePrep = getPrepTime(recipe);
      const ingredients = Object.entries(recipe.ingredients).map(([key, amount]) => {
        const owned = state.inventory[key] || 0;
        return `<span class="resource-chip" title="${ITEMS[key].name}">${itemImg(key)} ${owned}/${amount}</span>`;
      }).join('');
      const readyCount = getReadyRecipeCount(recipe.id);
      const queuedCount = getQueuedRecipeCount(recipe.id);
      return `<article class="game-card ${unlocked ? '' : 'locked'}">
        <div class="card-top"><div><div class="card-icon">${unlocked ? recipeImg(recipe, 'pixel-card-icon') : '🔒'}</div><h3>${recipe.name}</h3></div><span class="badge">${recipe.tag}</span></div>
        <p>${unlocked ? `${Math.ceil(effectivePrep / 1000)} s · ${recipe.price} pièces de base` : unlockRecipeText(recipe)}</p>
        <div class="ingredient-row">${ingredients}</div>
        <div class="recipe-meta">
          <span class="mini-badge">Prêts : ${readyCount}</span>
          <span class="mini-badge">En cours : ${queuedCount}</span>
        </div>
        <div class="card-actions"><button class="primary-button cook-button" data-recipe-id="${recipe.id}" type="button" ${canCookNow ? '' : 'disabled'}>${unlocked ? 'Préparer' : 'Verrouillé'}</button></div>
      </article>`;
    }).join('');
    grid.querySelectorAll('.cook-button').forEach(button => button.addEventListener('click', () => startCooking(button.dataset.recipeId)));
  }

  function unlockRecipeText(recipe) {
    if (recipe.id === 'salad') return 'Atteins 30 réputation.';
    if (recipe.id === 'fruit_tart') return 'Construis le petit four.';
    if (recipe.id === 'forest_soup') return 'Débloque la Forêt Gourmande.';
    if (recipe.id === 'spicy_skewer') return 'Atteins 150 réputation.';
    if (recipe.id === 'grilled_fish') return 'Débloque le Bord de Mer.';
    if (recipe.id === 'display_dessert') return 'Construis la vitrine réfrigérée.';
    if (recipe.id === 'counter_menu') return 'Atteins 420 réputation.';
    return 'Continue ta progression.';
  }

  function canCookRecipe(recipe) {
    return Object.entries(recipe.ingredients).every(([key, amount]) => (state.inventory[key] || 0) >= amount);
  }

  function getPrepTime(recipe) {
    let multiplier = getEffects().prepMultiplier;
    if (recipe.id === 'sweet_coffee' && hasUpgrade(state, 'coffee_machine')) multiplier *= 0.65;
    return Math.max(1200, recipe.prep * 1000 * multiplier);
  }

  function startCooking(recipeId, silent = false) {
    const recipe = getRecipe(recipeId);
    const effects = getEffects();
    if (!recipe || !recipe.unlock(state)) return;
    if (state.cooking.length >= effects.cookingSlots) {
      if (!silent) toast('Tous les emplacements de préparation sont occupés.');
      return;
    }
    if (!canCookRecipe(recipe)) {
      if (!silent) toast('Il manque des ingrédients.');
      return;
    }
    Object.entries(recipe.ingredients).forEach(([key, amount]) => state.inventory[key] -= amount);
    const duration = getPrepTime(recipe);
    state.cooking.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, recipeId, readyAt: Date.now() + duration, duration });
    state.stats.cooked += 1;
    if (!silent) toast(`${recipe.name} lancé.`);
    renderAll();
    saveState();
  }

  function processCooking() {
    pullReadyCookingToTray(true);
  }

  function chooseClientType() {
    const available = CLIENT_TYPES.filter(t => state.reputation >= t.repNeed);
    const luckyMystery = hasUpgrade(state, 'lucky_charm') ? 1.7 : 1;
    const touristBoost = hasCollection('shells') ? 1.5 : 1;
    const rareRoll = Math.random();
    const inspector = available.find(t => t.id === 'inspector');
    const mystery = available.find(t => t.id === 'mystery');
    if (inspector && rareRoll < inspector.rare) return inspector;
    if (mystery && rareRoll < 0.045 + mystery.rare * luckyMystery) return mystery;
    const common = available.filter(t => !t.rare);
    const pool = [];
    common.forEach(t => {
      const weight = t.id === 'tourist' ? Math.round(2 * touristBoost) : t.id === 'classic' ? 4 : 3;
      for (let i = 0; i < weight; i++) pool.push(t);
    });
    return choice(pool.length ? pool : [CLIENT_TYPES[0]]);
  }

  function chooseRecipeForClient(type) {
    const unlocked = getUnlockedRecipes();
    const filtered = type.recipes ? unlocked.filter(r => type.recipes.includes(r.id)) : unlocked;
    return choice(filtered.length ? filtered : unlocked);
  }

  function spawnCustomer() {
    if (!state.restaurantOpen) return;
    const effects = getEffects();
    if (state.customers.length >= effects.maxCustomers) {
      state.nextCustomerAt = Date.now() + 4500;
      return;
    }
    const type = chooseClientType();
    const recipe = chooseRecipeForClient(type);
    const patienceMultiplier = type.id === 'inspector' ? 1 : 1 + Math.min(state.reputation / 2500, 0.18);
    const maxPatience = type.patience * patienceMultiplier;
    state.customers.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      typeId: type.id,
      name: type.name,
      emoji: type.emoji,
      sprite: CLIENT_SPRITES[type.id] || 'client_red',
      recipeId: recipe.id,
      patience: maxPatience,
      maxPatience,
      multiplier: type.multiplier,
      repBonus: type.repBonus || 0,
      x: .5,
      y: .5
    });
    const baseDelay = Math.max(6500, 13500 - Math.min(state.reputation * 4, 4800));
    state.nextCustomerAt = Date.now() + baseDelay + randomInt(0, 3500);
  }

  function serveCustomer(customerId, automatic = false) {
    const index = state.customers.findIndex(c => c.id === customerId);
    if (index < 0) return false;
    const customer = state.customers[index];
    pullReadyCookingToTray(false);
    const trayIndex = state.tray.indexOf(customer.recipeId);
    if (trayIndex < 0) {
      if (!automatic) toast(`Il faut préparer ${getRecipe(customer.recipeId).name}.`);
      return false;
    }
    state.tray.splice(trayIndex, 1);
    state.customers.splice(index, 1);
    const type = CLIENT_TYPES.find(t => t.id === customer.typeId);
    const recipe = getRecipe(customer.recipeId);
    const effects = getEffects();
    let reward = recipe.price * customer.multiplier * effects.coinMultiplier;
    if (['fruit_tart', 'display_dessert'].includes(recipe.id)) reward *= effects.dessertMultiplier;
    const patienceRatio = customer.patience / customer.maxPatience;
    if (patienceRatio > 0.75) reward *= 1.08;
    const now = Date.now();
    if (now - state.stats.lastServeAt <= 12000) state.stats.currentCombo += 1;
    else state.stats.currentCombo = 1;
    state.stats.lastServeAt = now;
    state.stats.bestCombo = Math.max(state.stats.bestCombo, state.stats.currentCombo);
    const comboBonus = Math.min(state.stats.currentCombo - 1, 10) * 0.02;
    reward *= 1 + comboBonus;
    reward = Math.ceil(reward);
    const rep = Math.ceil((recipe.rep + customer.repBonus) * effects.repMultiplier);
    state.coins += reward;
    state.reputation += rep;
    state.stats.coinsEarned += reward;
    state.stats.served += 1;
    if (!automatic) toast(`Commande servie : +${reward} 🪙 · +${rep} ⭐${state.stats.currentCombo >= 3 ? ` · combo x${state.stats.currentCombo}` : ''}`);
    else toast(`L’aide-comptoir a servi ${recipe.name}.`);
    maybeFindCollectible(customer.typeId === 'tourist' ? 'sea' : 'quarter', 0.02);
    saveState();
    renderAll();
    return true;
  }

  function loseCustomer(customer) {
    state.customers = state.customers.filter(c => c.id !== customer.id);
    state.stats.lost += 1;
    state.stats.currentCombo = 0;
    if (customer.typeId === 'inspector') {
      state.reputation = Math.max(0, state.reputation - 5);
      toast('L’inspectrice est repartie : -5 réputation.');
    } else {
      toast(`${customer.name} est reparti sans être servi.`);
    }
  }

  function renderZones() {
    el('zoneProgressBadge').textContent = `${state.unlockedZones.length}/${ZONES.length}`;
    const grid = el('zoneGrid');
    grid.innerHTML = ZONES.map(zone => {
      const unlocked = state.unlockedZones.includes(zone.id);
      const costOk = canPay(zone.unlockCost.coins || 0, Object.fromEntries(Object.entries(zone.unlockCost).filter(([k]) => k !== 'coins')));
      const repOk = state.reputation >= zone.repNeed;
      const xp = state.zoneXP[zone.id] || 0;
      const level = Math.floor(xp / 25) + 1;
      const pct = (xp % 25) / 25 * 100;
      const nodes = unlocked ? `<div class="gather-area">${zone.nodes.map((node, index) => {
        const key = `${zone.id}:${index}`;
        const cooling = (state.cooldowns[key] || 0) > Date.now();
        return `<button class="gather-button ${cooling ? 'cooling' : ''}" data-zone="${zone.id}" data-node="${index}" type="button" ${cooling ? 'disabled' : ''}>${itemImg(node.item, 'pixel-card-icon')}<small>${node.label}</small></button>`;
      }).join('')}</div>` : '';
      const materialCosts = Object.fromEntries(Object.entries(zone.unlockCost).filter(([k]) => k !== 'coins'));
      return `<article class="zone-card ${unlocked ? '' : 'locked'}">
        <div class="zone-art ${zone.className}"><img class="zone-scene" src="${assetPath(ZONE_ART[zone.id])}" alt="${zone.name}"><span class="badge">${unlocked ? `Niv. ${level}` : `${zone.repNeed} ⭐`}</span></div>
        <div class="zone-body">
          <h2>${zone.name}</h2><p>${zone.description}</p>
          ${unlocked ? `<div class="zone-meter"><span style="width:${pct}%"></span></div><small>${xp % 25}/25 passages avant le niveau fournisseur suivant</small>${nodes}` : `<div class="cost-row"><span class="resource-chip">🪙 ${fmt(zone.unlockCost.coins || 0)}</span>${materialChips(materialCosts)}</div><button class="primary-button wide unlock-zone" data-zone="${zone.id}" type="button" ${repOk && costOk ? '' : 'disabled'}>${repOk ? 'Débloquer la zone' : `Il faut ${zone.repNeed} réputation`}</button>`}
        </div>
      </article>`;
    }).join('');
    grid.querySelectorAll('.gather-button').forEach(button => button.addEventListener('click', () => gather(button.dataset.zone, Number(button.dataset.node))));
    grid.querySelectorAll('.unlock-zone').forEach(button => button.addEventListener('click', () => unlockZone(button.dataset.zone)));
  }

  function gather(zoneId, nodeIndex) {
    const zone = getZone(zoneId);
    if (!zone || !state.unlockedZones.includes(zoneId)) return;
    const key = `${zoneId}:${nodeIndex}`;
    if ((state.cooldowns[key] || 0) > Date.now()) return;
    const node = zone.nodes[nodeIndex];
    let amount = randomInt(node.min, node.max);
    if (Math.random() < getEffects().gatherBonusChance) amount += 1;
    state.inventory[node.item] = (state.inventory[node.item] || 0) + amount;
    state.stats.gathers += 1;
    state.zoneXP[zoneId] = (state.zoneXP[zoneId] || 0) + 1;
    state.cooldowns[key] = Date.now() + getEffects().gatherCooldown;
    toast(`${node.icon} +${amount} ${ITEMS[node.item].name}`);
    maybeFindCollectible(zoneId);
    saveState();
    renderAll();
    setTimeout(renderZones, getEffects().gatherCooldown + 20);
  }

  function unlockZone(zoneId) {
    const zone = getZone(zoneId);
    if (!zone || state.unlockedZones.includes(zoneId) || state.reputation < zone.repNeed) return;
    const coins = zone.unlockCost.coins || 0;
    const materials = Object.fromEntries(Object.entries(zone.unlockCost).filter(([k]) => k !== 'coins'));
    if (!canPay(coins, materials)) return toast('Il manque des ressources pour ouvrir cette zone.');
    pay(coins, materials);
    state.unlockedZones.push(zoneId);
    state.stats.zonesUnlocked = state.unlockedZones.length;
    toast(`Nouvelle zone : ${zone.name} !`);
    saveState();
    renderAll();
  }

  function renderUpgrades() {
    const grid = el('upgradeGrid');
    grid.innerHTML = UPGRADES.filter(u => upgradeFilter === 'all' || u.category === upgradeFilter).map(upgrade => {
      const bought = hasUpgrade(state, upgrade.id);
      const available = state.reputation >= upgrade.repNeed && (!upgrade.requires || hasUpgrade(state, upgrade.requires)) && (!upgrade.zone || state.unlockedZones.includes(upgrade.zone));
      const materialCosts = upgrade.materials || {};
      const discount = hasCollection('crystals') ? 0.95 : 1;
      const finalCoins = Math.ceil(upgrade.coins * discount);
      const canBuy = available && !bought && canPay(upgrade.coins, materialCosts);
      let lockText = '';
      if (!available) {
        if (state.reputation < upgrade.repNeed) lockText = `${upgrade.repNeed} réputation requise`;
        else if (upgrade.requires) lockText = `Nécessite ${getUpgrade(upgrade.requires)?.name}`;
        else if (upgrade.zone) lockText = `Nécessite ${getZone(upgrade.zone)?.name}`;
      }
      return `<article class="game-card ${available || bought ? '' : 'locked'}">
        <div class="card-top"><div><div class="card-icon">${bought ? '✅' : pixelImg(UPGRADE_ASSETS[upgrade.id] || 'craft_machine', upgrade.name, 'pixel-card-icon')}</div><h3>${upgrade.name}</h3></div><span class="badge">${upgrade.category}</span></div>
        <p>${upgrade.desc}</p>
        <div class="cost-row"><span class="resource-chip">🪙 ${fmt(finalCoins)}</span>${materialChips(materialCosts)}</div>
        <div class="card-actions"><button class="${bought ? 'secondary-button' : 'primary-button'} buy-upgrade" data-upgrade="${upgrade.id}" type="button" ${canBuy ? '' : 'disabled'}>${bought ? 'Achetée' : lockText || 'Acheter'}</button></div>
      </article>`;
    }).join('');
    grid.querySelectorAll('.buy-upgrade').forEach(button => button.addEventListener('click', () => buyUpgrade(button.dataset.upgrade)));
  }

  function buyUpgrade(upgradeId) {
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade || hasUpgrade(state, upgradeId)) return;
    if (state.reputation < upgrade.repNeed || (upgrade.requires && !hasUpgrade(state, upgrade.requires)) || (upgrade.zone && !state.unlockedZones.includes(upgrade.zone))) return;
    if (!canPay(upgrade.coins, upgrade.materials)) return toast('Il manque des ressources.');
    pay(upgrade.coins, upgrade.materials);
    state.upgrades.push(upgradeId);
    state.stats.upgradesBought = state.upgrades.length;
    toast(`${upgrade.icon} ${upgrade.name} installé.`);
    saveState();
    renderAll();
  }

  function maybeFindCollectible(zoneId, extraChance = 0) {
    const collections = COLLECTIONS.filter(c => c.zone === zoneId);
    if (!collections.length) return;
    if (Math.random() > getEffects().collectibleChance + extraChance) return;
    const candidates = collections.flatMap(c => c.items.map(item => ({ collection: c, item }))).filter(({ item }) => !state.foundCollectibles.includes(item[0]));
    if (!candidates.length) return;
    const found = choice(candidates);
    state.foundCollectibles.push(found.item[0]);
    state.stats.collectibles = state.foundCollectibles.length;
    toast(`Trouvaille : ${found.item[2]} ${found.item[1]} !`);
    if (found.collection.items.every(([id]) => state.foundCollectibles.includes(id))) {
      setTimeout(() => toast(`Collection complète : ${found.collection.bonus}`), 500);
    }
  }

  function renderCollections() {
    el('collectionProgressBadge').textContent = `${state.foundCollectibles.length}/25`;
    el('collectionList').innerHTML = COLLECTIONS.map(collection => {
      const complete = collection.items.every(([id]) => state.foundCollectibles.includes(id));
      const foundCount = collection.items.filter(([id]) => state.foundCollectibles.includes(id)).length;
      return `<article class="collection-card">
        <div class="collection-header"><div><h2>${collection.icon} ${collection.name}</h2><p>${getZone(collection.zone)?.name || ''}</p></div><span class="badge">${complete ? 'Bonus actif' : `${foundCount}/5`}</span></div>
        <div class="viz-callout"><b>Bonus :</b> ${collection.bonus}</div>
        <div class="collectible-grid">${collection.items.map(([id, name, icon]) => {
          const found = state.foundCollectibles.includes(id);
          return `<div class="collectible ${found ? 'found' : ''}"><span class="icon">${found ? icon : '❔'}</span><small>${found ? name : 'Inconnu'}</small></div>`;
        }).join('')}</div>
      </article>`;
    }).join('');
  }

  function renderObjectives() {
    const completed = state.claimedObjectives.length;
    el('objectiveProgressBadge').textContent = `${completed}/${OBJECTIVES.length}`;
    el('objectiveList').innerHTML = OBJECTIVES.map(objective => {
      const value = getMetricValue(objective.metric);
      const ready = value >= objective.target;
      const claimed = state.claimedObjectives.includes(objective.id);
      const icon = objective.type === 'short' ? '⚡' : objective.type === 'medium' ? '🎯' : '🏆';
      return `<article class="objective-card ${claimed ? 'completed' : ''}">
        <div class="objective-type">${claimed ? '✅' : icon}</div>
        <div class="objective-info"><h3>${objective.title}</h3><p>${objective.description}</p><div class="reward-row">${rewardHtml(objective.reward)}</div></div>
        <div class="objective-progress"><strong>${Math.min(value, objective.target)}/${objective.target}</strong><button class="${ready && !claimed ? 'primary-button' : 'secondary-button'} claim-objective" data-objective="${objective.id}" type="button" ${ready && !claimed ? '' : 'disabled'}>${claimed ? 'Réclamé' : ready ? 'Récupérer' : `${Math.floor(value / objective.target * 100)} %`}</button></div>
      </article>`;
    }).join('');
    el('objectiveList').querySelectorAll('.claim-objective').forEach(button => button.addEventListener('click', () => claimObjective(button.dataset.objective)));
  }

  function claimObjective(id) {
    const objective = OBJECTIVES.find(o => o.id === id);
    if (!objective || state.claimedObjectives.includes(id) || getMetricValue(objective.metric) < objective.target) return;
    state.claimedObjectives.push(id);
    grantReward(objective.reward);
    toast(`Objectif terminé : ${objective.title}`);
    saveState();
    renderAll();
  }

  function renderSettings() {
    el('movementMode').value = state.settings.movementMode;
    el('showMoveMarker').checked = state.settings.showMoveMarker;
    el('soundToggle').checked = state.settings.sound;
    el('reducedMotionToggle').checked = state.settings.reducedMotion;
    el('vibrationToggle').checked = state.settings.vibration;
    document.documentElement.classList.toggle('reduced-motion', state.settings.reducedMotion);
    renderChest();
    renderSaveLabel();
  }

  function renderChest() {
    const elapsed = Date.now() - state.lastChestAt;
    const ready = elapsed >= CHEST_DELAY;
    const button = el('claimFreeChest');
    button.disabled = !ready;
    if (ready) {
      el('freeChestStatus').textContent = 'Le coffre gratuit est disponible.';
      button.textContent = 'Ouvrir le coffre';
    } else {
      const left = CHEST_DELAY - elapsed;
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      el('freeChestStatus').textContent = `Prochain coffre dans ${h} h ${m} min ${s} s.`;
      button.textContent = 'Coffre en préparation';
    }
  }

  function claimChest() {
    if (Date.now() - state.lastChestAt < CHEST_DELAY) return;
    state.lastChestAt = Date.now();
    const roll = Math.random();
    const reward = { coins: randomInt(180, 420) + state.minigame.level * 12 };
    if (roll < .8) reward.diamonds = randomInt(1, 3);
    const itemPool = state.unlockedZones.includes('sea') ? ['fish', 'salt', 'glass', 'metal'] : state.unlockedZones.includes('mine') ? ['metal', 'glass', 'stone', 'crystal'] : state.unlockedZones.includes('forest') ? ['wood', 'fruits', 'mushrooms', 'spices'] : ['bread', 'vegetables', 'coffee', 'cheese'];
    reward[choice(itemPool)] = randomInt(2, 5);
    grantReward(reward);
    if (Math.random() < .14) maybeFindCollectible(choice(state.unlockedZones), .25);
    showModal('Coffre gratuit', `<p>Tu as trouvé :</p><div class="reward-row">${rewardHtml(reward)}</div>`, [{ label: 'Récupérer', className: 'primary-button' }]);
    saveState();
    renderAll();
  }

  function renderSaveLabel() {
    if (!el('lastSavedLabel')) return;
    el('lastSavedLabel').textContent = state.lastSavedAt ? `Dernière sauvegarde : ${new Date(state.lastSavedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Jamais sauvegardée';
  }

  function exportSave() {
    saveState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comptoir-des-mondes-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Sauvegarde exportée.');
  }

  async function importSave(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') throw new Error('Format invalide');
      state = migrateSave(parsed);
      movementTarget = { x: state.player.x, y: state.player.y };
      saveState();
      renderAll();
      toast('Sauvegarde importée.');
    } catch (error) {
      showModal('Import impossible', `<p>Le fichier ne contient pas une sauvegarde valide.</p><small>${String(error.message || error)}</small>`, [{ label: 'Fermer' }]);
    }
  }

  function resetGame() {
    showModal('Réinitialiser la partie ?', '<p>Toute la progression locale sera effacée. Exporte ta sauvegarde avant si tu veux la conserver.</p>', [
      { label: 'Annuler', className: 'secondary-button' },
      { label: 'Tout effacer', className: 'danger-button', action: () => {
        localStorage.removeItem(SAVE_KEY);
        state = defaultState();
        movementTarget = { x: state.player.x, y: state.player.y };
        mini = null;
        saveState();
        renderAll();
        toast('Nouvelle partie créée.');
      }}
    ]);
  }

  function moveTo(x, y, action = null, showMarker = true) {
    movementTarget.x = clamp(x, .04, .96);
    movementTarget.y = clamp(y, .08, .92);
    pendingWorldAction = action;
    if (showMarker && state.settings.showMoveMarker) {
      const marker = el('moveMarker');
      marker.hidden = false;
      marker.style.left = `${movementTarget.x * 100}%`;
      marker.style.top = `${movementTarget.y * 100}%`;
      marker.style.animation = 'none';
      marker.offsetHeight;
      marker.style.animation = '';
      setTimeout(() => marker.hidden = true, 750);
    }
  }

  function pointFromEvent(event) {
    const rect = el('restaurantWorld').getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
  }

  function updateMovement(dt) {
    const dx = movementTarget.x - state.player.x;
    const dy = movementTarget.y - state.player.y;
    const distance = Math.hypot(dx, dy);
    const speed = 0.32 * getEffects().serviceSpeed;
    if (distance > .006) {
      const step = Math.min(distance, speed * dt);
      state.player.x += dx / distance * step;
      state.player.y += dy / distance * step;
      el('player').classList.add('walking');
      renderPlayer();
    } else {
      el('player').classList.remove('walking');
      if (pendingWorldAction) {
        const action = pendingWorldAction;
        pendingWorldAction = null;
        if (action.type === 'serve') serveCustomer(action.customerId);
        if (action.type === 'tab') switchTab(action.tab);
      }
    }
  }

  function setupWorldControls() {
    const world = el('restaurantWorld');
    world.addEventListener('pointerdown', event => {
      if (layoutEditing) return;
      if (event.target.closest('.customer-avatar') || event.target.closest('.station') || event.target.closest('.furniture-item') || event.target.closest('.layout-slot')) return;
      world.setPointerCapture?.(event.pointerId);
      const point = pointFromEvent(event);
      followPointerActive = state.settings.movementMode === 'follow';
      moveTo(point.x, point.y);
    });
    world.addEventListener('pointermove', event => {
      if (layoutEditing) return;
      if (state.settings.movementMode !== 'follow' || !followPointerActive) return;
      const point = pointFromEvent(event);
      moveTo(point.x, point.y, null, false);
    });
    const endFollow = () => { followPointerActive = false; };
    world.addEventListener('pointerup', endFollow);
    world.addEventListener('pointercancel', endFollow);
    document.querySelectorAll('.station').forEach(station => {
      station.addEventListener('pointerdown', event => {
        if (layoutEditing) return;
        event.stopPropagation();
        const map = {
          kitchen: { x: .58, y: .30, tab: 'kitchen' },
          storage: { x: .88, y: .47, tab: 'zones' },
          register: { x: .73, y: .78, tab: 'upgrades' }
        };
        const target = map[station.dataset.station];
        moveTo(target.x, target.y, { type: 'tab', tab: target.tab });
      });
    });
  }

  function buildMiniLevel(level) {
    const l = clamp(level, 1, 30);
    let objectiveType = 'bubbles';
    if (l >= 4 && l % 3 === 1) objectiveType = 'crates';
    if (l >= 7 && l % 3 === 2) objectiveType = 'mixed';
    if (l >= 10 && l % 5 === 0) objectiveType = 'colors';
    const colorCount = l >= 18 ? 6 : 5;
    const bubbles = objectiveType === 'bubbles' ? 8 + Math.floor(l * .7) : objectiveType === 'mixed' ? 6 + Math.floor(l * .45) : 0;
    const crates = objectiveType === 'crates' ? 4 + Math.floor(l * .35) : objectiveType === 'mixed' ? 3 + Math.floor(l * .25) : 0;
    const colorTarget = objectiveType === 'colors' ? 18 + l : 0;
    const moves = Math.max(16, 24 - Math.floor(l / 4) + (objectiveType === 'mixed' ? 3 : 0));
    const board = Array.from({ length: 49 }, () => ({ tile: MINI_TILES[randomInt(0, colorCount - 1)].id, bubble: false, crate: 0 }));
    const indices = Array.from({ length: 49 }, (_, i) => i).sort(() => Math.random() - .5);
    for (let i = 0; i < crates; i++) board[indices[i]].crate = l >= 15 && i % 3 === 0 ? 2 : 1;
    let placedBubbles = 0;
    for (let i = crates; i < indices.length && placedBubbles < bubbles; i++) {
      if (!board[indices[i]].crate) {
        board[indices[i]].bubble = true;
        placedBubbles++;
      }
    }
    return {
      level: l,
      board,
      movesLeft: moves,
      score: 0,
      objectiveType,
      colorTarget,
      colorId: MINI_TILES[(l * 3) % colorCount].id,
      colorsRemoved: 0,
      reward: 110 + l * 38,
      won: false,
      lost: false,
      shuffles: 1
    };
  }

  function initMiniLevel() {
    mini = buildMiniLevel(state.minigame.level);
    renderMini();
  }

  function miniTile(id) { return MINI_TILES.find(t => t.id === id) || MINI_TILES[0]; }

  function getMiniRemaining() {
    return {
      bubbles: mini.board.filter(c => c.bubble).length,
      crates: mini.board.reduce((sum, c) => sum + (c.crate > 0 ? 1 : 0), 0),
      colors: Math.max(0, mini.colorTarget - mini.colorsRemoved)
    };
  }

  function renderMini() {
    if (!mini) return;
    el('minigameLevelBadge').textContent = `Niveau ${mini.level}/30`;
    el('movesLeft').textContent = mini.movesLeft;
    el('miniScore').textContent = fmt(mini.score);
    el('miniReward').textContent = `${fmt(mini.reward)} 🪙`;
    const remaining = getMiniRemaining();
    const objectiveNames = {
      bubbles: 'Retirer toutes les bulles',
      crates: 'Casser toutes les caisses',
      mixed: 'Retirer les bulles et casser les caisses',
      colors: `Retirer ${mini.colorTarget} ingrédients identiques`
    };
    el('minigameObjective').textContent = objectiveNames[mini.objectiveType];
    const details = [];
    if (['bubbles', 'mixed'].includes(mini.objectiveType)) details.push(`<span class="objective-detail">🫧 ${remaining.bubbles}</span>`);
    if (['crates', 'mixed'].includes(mini.objectiveType)) details.push(`<span class="objective-detail">📦 ${remaining.crates}</span>`);
    if (mini.objectiveType === 'colors') details.push(`<span class="objective-detail">${pixelImg(miniTile(mini.colorId).asset, mini.colorId, 'pixel-small')} ${remaining.colors}</span>`);
    el('miniObjectiveDetails').innerHTML = details.join('');
    el('shuffleMini').disabled = mini.shuffles <= 0 || mini.won || mini.lost;
    el('shuffleMini').textContent = `Mélanger (${mini.shuffles})`;

    const board = el('miniBoard');
    board.innerHTML = '';
    mini.board.forEach((cell, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `mini-cell${cell.bubble ? ' bubble' : ''}${cell.crate ? ' crate' : ''}`;
      button.dataset.index = index;
      if (cell.crate) button.dataset.hp = cell.crate;
      button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', cell.crate ? `Caisse, résistance ${cell.crate}` : `${miniTile(cell.tile).id}${cell.bubble ? ', bulle' : ''}`);
      button.innerHTML = cell.crate ? pixelImg('crate', 'Caisse', 'pixel-card-icon') : pixelImg(miniTile(cell.tile).asset, miniTile(cell.tile).id, 'pixel-card-icon');
      if (!cell.crate && !mini.won && !mini.lost) button.addEventListener('click', () => miniClick(index));
      board.appendChild(button);
    });
  }

  function connectedGroup(startIndex) {
    const start = mini.board[startIndex];
    if (!start || start.crate) return [];
    const target = start.tile;
    const visited = new Set([startIndex]);
    const queue = [startIndex];
    while (queue.length) {
      const index = queue.shift();
      const row = Math.floor(index / 7);
      const col = index % 7;
      [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]].forEach(([r, c]) => {
        if (r < 0 || r >= 7 || c < 0 || c >= 7) return;
        const next = r * 7 + c;
        if (!visited.has(next) && !mini.board[next].crate && mini.board[next].tile === target) {
          visited.add(next);
          queue.push(next);
        }
      });
    }
    return [...visited];
  }

  function miniClick(index) {
    if (mini.won || mini.lost || mini.movesLeft <= 0) return;
    const group = connectedGroup(index);
    if (group.length < 2) {
      el('miniMessage').textContent = 'Il faut un groupe d’au moins 2 cases identiques.';
      vibrate(35);
      return;
    }
    const removedTile = mini.board[index].tile;
    const groupSet = new Set(group);
    const damagedCrates = new Set();
    group.forEach(i => {
      const row = Math.floor(i / 7);
      const col = i % 7;
      [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]].forEach(([r, c]) => {
        if (r < 0 || r >= 7 || c < 0 || c >= 7) return;
        const n = r * 7 + c;
        if (mini.board[n].crate) damagedCrates.add(n);
      });
      if (mini.board[i].bubble) mini.board[i].bubble = false;
    });
    damagedCrates.forEach(i => mini.board[i].crate = Math.max(0, mini.board[i].crate - 1));
    if (mini.objectiveType === 'colors' && removedTile === mini.colorId) mini.colorsRemoved += group.length;
    mini.score += group.length * group.length * 12 + damagedCrates.size * 55;
    mini.movesLeft -= 1;
    collapseMiniBoard(groupSet);
    el('miniMessage').textContent = group.length >= 7 ? `Gros groupe : ${group.length} cases !` : `${group.length} cases retirées.`;
    vibrate(group.length >= 7 ? [20, 30, 20] : 15);
    checkMiniEnd();
    renderMini();
  }

  function collapseMiniBoard(removedSet) {
    const colorCount = mini.level >= 18 ? 6 : 5;
    for (let col = 0; col < 7; col++) {
      const survivors = [];
      for (let row = 6; row >= 0; row--) {
        const i = row * 7 + col;
        const cell = mini.board[i];
        if (cell.crate > 0 || !removedSet.has(i)) survivors.push({ ...cell });
      }
      while (survivors.length < 7) survivors.push({ tile: MINI_TILES[randomInt(0, colorCount - 1)].id, bubble: false, crate: 0 });
      for (let row = 6, s = 0; row >= 0; row--, s++) mini.board[row * 7 + col] = survivors[s];
    }
  }

  function miniObjectiveComplete() {
    const remaining = getMiniRemaining();
    if (mini.objectiveType === 'bubbles') return remaining.bubbles === 0;
    if (mini.objectiveType === 'crates') return remaining.crates === 0;
    if (mini.objectiveType === 'mixed') return remaining.bubbles === 0 && remaining.crates === 0;
    if (mini.objectiveType === 'colors') return remaining.colors === 0;
    return false;
  }

  function checkMiniEnd() {
    if (miniObjectiveComplete()) {
      mini.won = true;
      const reward = { coins: mini.reward };
      if (mini.level % 5 === 0) reward.diamonds = 1;
      const bonusItems = state.unlockedZones.includes('mine') ? ['wood', 'stone', 'metal', 'glass'] : ['bread', 'vegetables', 'fruits', 'wood'];
      reward[choice(bonusItems)] = randomInt(1, 3);
      grantReward(reward);
      state.stats.miniWins += 1;
      const finishedLevel = mini.level;
      if (finishedLevel < 30) state.minigame.level = finishedLevel + 1;
      state.minigame.bestLevel = Math.max(state.minigame.bestLevel, state.minigame.level);
      if (Math.random() < .06) maybeFindCollectible(choice(state.unlockedZones), .12);
      saveState();
      setTimeout(() => showModal('Niveau réussi !', `<p>Objectif terminé en ${mini.movesLeft} coup(s) restant(s).</p><div class="reward-row">${rewardHtml(reward)}</div>`, [
        { label: finishedLevel < 30 ? 'Niveau suivant' : 'Rejouer le niveau 30', className: 'primary-button', action: () => { initMiniLevel(); renderAll(); } },
        { label: 'Retour au comptoir', className: 'secondary-button', action: () => switchTab('counter') }
      ]), 180);
    } else if (mini.movesLeft <= 0) {
      mini.lost = true;
      const consolation = Math.max(12, Math.floor(mini.reward * .08));
      state.coins += consolation;
      state.stats.coinsEarned += consolation;
      saveState();
      setTimeout(() => showModal('Presque !', `<p>Il restait encore un objectif. Tu gardes une petite récompense de consolation : <b>${consolation} 🪙</b>.</p>`, [
        { label: 'Recommencer', className: 'primary-button', action: () => initMiniLevel() },
        { label: 'Retour', className: 'secondary-button', action: () => switchTab('counter') }
      ]), 180);
    }
  }

  function shuffleMini() {
    if (!mini || mini.shuffles <= 0 || mini.won || mini.lost) return;
    const movable = mini.board.filter(c => !c.crate).map(c => c.tile).sort(() => Math.random() - .5);
    let cursor = 0;
    mini.board.forEach(cell => { if (!cell.crate) cell.tile = movable[cursor++]; });
    mini.shuffles -= 1;
    el('miniMessage').textContent = 'Grille mélangée sans dépenser de coup.';
    renderMini();
  }

  function processAutomation() {
    const now = Date.now();
    if (hasUpgrade(state, 'ingredient_delivery') && now - automationTimers.delivery >= 45000) {
      state.inventory.bread += 2;
      state.inventory.vegetables += 2;
      automationTimers.delivery = now;
      toast('🚲 Livraison : +2 pain, +2 légumes.');
    }
    if (hasUpgrade(state, 'wood_collector') && now - automationTimers.wood >= 65000) {
      state.inventory.wood += 2;
      automationTimers.wood = now;
      toast('🪓 Collecteur : +2 bois.');
    }
    if (hasUpgrade(state, 'helper_counter') && now - automationTimers.helper >= 24000) {
      const simple = state.customers.find(c => ['toast', 'cheese_sandwich', 'sweet_coffee'].includes(c.recipeId) && state.tray.includes(c.recipeId));
      if (simple) serveCustomer(simple.id, true);
      automationTimers.helper = now;
    }
    if (hasUpgrade(state, 'helper_kitchen') && now - automationTimers.kitchen >= 52000) {
      if (canCookRecipe(getRecipe('toast')) && state.cooking.length < getEffects().cookingSlots) startCooking('toast', true);
      automationTimers.kitchen = now;
    }
  }

  function tickSecond() {
    if (state.restaurantOpen && Date.now() >= state.nextCustomerAt) spawnCustomer();
    if (state.restaurantOpen) {
      const expired = [];
      state.customers.forEach(customer => {
        customer.patience -= 1;
        if (customer.patience <= 0) expired.push(customer);
      });
      expired.forEach(loseCustomer);
    }
    processAutomation();
    processCooking();
    renderHUD();
    renderActiveGoal();
    renderCustomers();
    renderTray();
    if (currentTab === 'kitchen') renderKitchen();
    if (currentTab === 'settings') renderChest();
  }

  function gameLoop(now) {
    const dt = Math.min((now - lastFrame) / 1000, .05);
    lastFrame = now;
    updateMovement(dt);
    if (now - lastSecondTick > 1000) {
      lastSecondTick = now;
      tickSecond();
    }
    requestAnimationFrame(gameLoop);
  }

  function renderAll() {
    renderHUD();
    renderActiveGoal();
    renderRestaurantState();
    renderFurnitureLayer();
    renderLayoutEditor();
    renderPlayer();
    renderCustomers();
    renderTray();
    renderKitchen();
    renderZones();
    renderUpgrades();
    renderCollections();
    renderObjectives();
    renderSettings();
    if (mini) renderMini();
  }

  function attachEvents() {
    document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
    document.querySelectorAll('[data-open-tab]').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.openTab)));
    el('goalShortcut').addEventListener('click', () => switchTab('objectives'));
    el('contextAction').addEventListener('click', () => switchTab('kitchen'));
    el('toggleRestaurant').addEventListener('click', toggleRestaurant);
    el('toggleLayoutEditor').addEventListener('click', toggleLayoutEditor);
    document.querySelectorAll('[data-upgrade-filter]').forEach(button => button.addEventListener('click', () => {
      upgradeFilter = button.dataset.upgradeFilter;
      document.querySelectorAll('[data-upgrade-filter]').forEach(b => b.classList.toggle('active', b === button));
      renderUpgrades();
    }));
    el('restartMini').addEventListener('click', () => {
      showModal('Recommencer le niveau ?', '<p>La grille actuelle sera remplacée, sans pénalité.</p>', [
        { label: 'Annuler' },
        { label: 'Recommencer', className: 'primary-button', action: () => initMiniLevel() }
      ]);
    });
    el('shuffleMini').addEventListener('click', shuffleMini);
    el('claimFreeChest').addEventListener('click', claimChest);
    el('saveNow').addEventListener('click', () => saveState(true));
    el('exportSave').addEventListener('click', exportSave);
    el('importSave').addEventListener('change', event => { if (event.target.files?.[0]) importSave(event.target.files[0]); event.target.value = ''; });
    el('resetGame').addEventListener('click', resetGame);
    el('movementMode').addEventListener('change', event => { state.settings.movementMode = event.target.value; saveState(); toast(event.target.value === 'follow' ? 'Mode suivi du doigt activé.' : 'Mode destination activé.'); });
    el('showMoveMarker').addEventListener('change', event => { state.settings.showMoveMarker = event.target.checked; saveState(); });
    el('soundToggle').addEventListener('change', event => { state.settings.sound = event.target.checked; saveState(); });
    el('reducedMotionToggle').addEventListener('change', event => { state.settings.reducedMotion = event.target.checked; document.documentElement.classList.toggle('reduced-motion', event.target.checked); saveState(); });
    el('vibrationToggle').addEventListener('change', event => { state.settings.vibration = event.target.checked; saveState(); });
    el('openTutorial').addEventListener('click', () => showTutorial(true));
    el('modalLayer').addEventListener('click', event => { if (event.target === el('modalLayer')) closeModal(); });
    window.addEventListener('beforeunload', () => saveState());
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveState(); });
    setupWorldControls();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(error => console.warn('Service worker non enregistré', error));
    }
  }

  attachEvents();
  renderAll();
  registerServiceWorker();
  setInterval(() => saveState(), 8000);
  if (!state.tutorialSeen) setTimeout(() => showTutorial(false), 250);
  requestAnimationFrame(gameLoop);
})();
