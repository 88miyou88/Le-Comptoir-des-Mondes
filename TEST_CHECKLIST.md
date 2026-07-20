# Checklist de test V1 sur Android

Le nom **Le Comptoir des Mondes** est provisoire. Le changer plus tard ne cassera pas la progression tant que la clé `comptoir_des_mondes_save` reste identique.

## Installation

- La page s’ouvre depuis l’URL GitHub Pages.
- Chrome propose « Installer l’application » ou « Ajouter à l’écran d’accueil ».
- L’application s’ouvre sans barre d’adresse après installation.
- Elle se rouvre hors ligne après un premier chargement complet.

## Déplacement

- Mode « Aller au point touché » : un toucher déplace le personnage jusqu’au point.
- Toucher un client fait marcher le personnage jusqu’à lui avant de tenter le service.
- Toucher Cuisine, Réserve ou Caisse fait marcher le personnage puis ouvre l’onglet correspondant.
- Mode « Suivre le doigt » : le personnage change de destination pendant que le doigt est maintenu ou glissé.
- Le déplacement reste confortable pendant qu’une vidéo joue à côté.

## Boucle principale

- Les clients arrivent sans devenir envahissants.
- Leur patience crée un peu de tension sans rendre le jeu pénible.
- Une commande ne peut être servie que si le bon plat est prêt.
- Les ingrédients sont réellement retirés quand une recette est lancée.
- Les pièces, la réputation et les combos sont correctement ajoutés.
- Un client raté n’efface aucune progression.

## Progression

Noter le temps réel nécessaire pour :

- acheter la première amélioration ;
- atteindre 30 réputation ;
- ouvrir la Forêt Gourmande ;
- ouvrir la Petite Mine ;
- ouvrir le Bord de Mer.

Questions importantes :

- Est-ce qu’un déblocage arrive trop vite ?
- Est-ce qu’une période devient vide ou répétitive ?
- Est-ce que les prix paraissent motivants ou absurdes ?
- Est-ce qu’il y a toujours au moins un objectif atteignable ?
- Est-ce que l’automatisation arrive avant que la tâche devienne agaçante ?

## Mini-jeu 7×7

- La grille est lisible sur téléphone.
- Les groupes de 2 cases ou plus disparaissent.
- Les bulles sont retirées quand leur case est supprimée.
- Les caisses sont abîmées par les groupes adjacents.
- Les objectifs sont clairement visibles.
- Les coups diminuent correctement.
- Un échec permet de recommencer sans énergie ni attente.
- La difficulté augmente sans pic injuste.
- Les récompenses sont utiles, sans rendre le jeu principal inutile.

## Collections

- Les objets rares peuvent apparaître pendant l’exploration ou certains services.
- Les objets déjà trouvés restent visibles après fermeture de l’application.
- Une collection complète active bien son bonus.
- Les collectibles donnent envie d’explorer sans devenir obligatoires.

## Sauvegarde

À tester avant toute modification du code :

1. Jouer quelques minutes.
2. Fermer complètement l’application.
3. La rouvrir et vérifier la progression.
4. Exporter la sauvegarde JSON.
5. Réinitialiser la partie.
6. Importer le fichier JSON.
7. Vérifier que pièces, recettes, zones, collections et niveau bonus sont revenus.

## Retours utiles pour la V1.1

Noter précisément :

- ce qui est trop lent ;
- ce qui est trop rapide ;
- ce qui demande trop d’attention ;
- ce qui devient répétitif ;
- les boutons difficiles à toucher ;
- les moments où l’envie de fermer le jeu apparaît ;
- les moments qui donnent envie de faire « encore juste un truc ».
