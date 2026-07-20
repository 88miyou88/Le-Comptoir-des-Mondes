# Le Comptoir des Mondes — V1

Jeu mobile/PWA de gestion cosy, cuisine, exploration, collections et mini-jeu 7×7.

## Lancer localement

Un serveur local est préférable car les service workers ne fonctionnent pas en ouvrant directement `index.html`.

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Publier sur GitHub Pages

1. Créer un dépôt GitHub.
2. Envoyer tous les fichiers de ce dossier à la racine du dépôt.
3. Dans **Settings > Pages**, sélectionner la branche principale et le dossier `/root`.
4. Ouvrir l’URL GitHub Pages obtenue dans Chrome Android.
5. Menu Chrome > **Ajouter à l’écran d’accueil** ou **Installer l’application**.

## Sauvegarde et mises à jour

- La sauvegarde locale utilise la clé stable `comptoir_des_mondes_save`.
- Les mises à jour conservent normalement la progression tant que l’URL GitHub Pages reste identique.
- Le champ `saveVersion` permet de migrer les anciennes sauvegardes.
- Toujours exporter la sauvegarde depuis les paramètres avant une grosse modification.
- Ne pas renommer la clé de sauvegarde dans `app.js`.

## Contenu V1

- Déplacement au toucher avec deux modes : destination ou suivi du doigt.
- 4 zones, 10 recettes, 7 types de clients.
- 20 améliorations et automatisations progressives.
- 5 collections, 25 collectibles, bonus permanents.
- 40 objectifs.
- Mini-jeu 7×7, 30 niveaux, bulles, caisses et objectifs en nombre de coups.
- Coffre gratuit toutes les 12 heures.
- Sauvegarde automatique, export et import JSON.
- PWA légère et jouable hors ligne après le premier chargement.

## Point important pour les futures versions

Le service worker utilise un nom de cache versionné. À chaque mise à jour importante, modifier :

```js
const CACHE_NAME = 'comptoir-des-mondes-v1.0.1';
```

Cela force le navigateur à remplacer les anciens fichiers mis en cache sans toucher à la sauvegarde locale.
