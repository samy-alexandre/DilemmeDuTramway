# Le Dilemme — V3

Jeu multijoueur de dilemmes moraux. **60 dilemmes, 13 catégories, chacune avec sa scène SVG dédiée**, profils psychologiques, contradictions, timer, son Web Audio, analyse finale. Thème sombre, identité « jeu social psychologique ».

---

## A. AUDIT — ce qui était cassé / fragile en V2, et corrigé en V3

### Bugs corrigés
1. **Détection du « loup solitaire » cassée** : l'ancien code cherchait le joueur isolé en comparant l'`id` à la chaîne `"abstention"`, ce qui n'avait aucun sens — la phrase « X seul contre le groupe » ne se déclenchait jamais. Corrigé : on compare désormais le *choix*, pas l'id.
2. **Phrases de phase mélangeant fonctions et chaînes** : `PHASE_PHRASES.lone_wolf` contient des fonctions `(name) => ...`, mais le code les traitait comme des chaînes. Corrigé avec un test `typeof item === "function"`.
3. **Double abstention** : si le timer expirait pendant qu'un joueur votait, le client pouvait envoyer `vote` puis `vote abstention`. Corrigé avec un drapeau `abstentionSent`.
4. **Code mort** : `heartbeatInterval` déclaré, jamais utilisé. Supprimé.
5. **Animations bloquées** : les `setTimeout` d'animation n'étaient pas nettoyés si la connexion tombait. Corrigé : `Scenes.clear()` purge tous les timeouts à chaque nouveau tour et à la déconnexion.
6. **`window.Audio` écrasait le constructeur natif du navigateur** (`new Audio()`) — risque de casse silencieuse. Renommé en `window.Sfx`.
7. **Mode « Pression » sans effet** : ce n'était qu'un label. Désormais il réduit le délai avant l'affichage des résultats (1,6 s au lieu de 2,4 s) pour renforcer la tension.
8. **Déconnexion en cours de vote** : le vote du partant restait dans le décompte. Corrigé côté serveur : suppression immédiate du vote + rebroadcast.

### Fragilités durcies
- **Accessibilité** : ajout de `prefers-reduced-motion` (les animations se réduisent à un simple changement d'état), `:focus-visible`, `aria-label`/`aria-pressed`/`aria-live`, labels `<label>` sur les inputs.
- **Migration de l'hôte** : si l'hôte se déconnecte, le premier joueur restant devient hôte (déjà présent, désormais testé).
- **Validation serveur renforcée** : seuls les joueurs enregistrés peuvent voter, callbacks vérifiés, clés de scénario validées par regex.
- **Nouveau joueur en cours de tour** : message clair (« L'hôte choisit le prochain dilemme… Vous voterez dans un instant »).

### Le vrai changement : identité graphique
- **Avant** : 3 scènes (tramway, hôpital, abstrait) pour 13 catégories → 10 catégories partageaient le même visuel abstrait.
- **Maintenant** : **12 scènes SVG distinctes**, une par catégorie, chacune avec sa direction artistique, ses couleurs et son animation propre.
- **Thème** : refonte complète en sombre/dramatique/élégant (vs crème/papier).

---

## B. STRUCTURE DU CODE

Architecture modulaire (vs monolithe client.js en V2) :

```
le-dilemme-v3/
├── server.js              # Express + Socket.IO — robuste, simple
├── package.json
├── README.md
└── public/
    ├── index.html         # Squelette minimal (scene-container vide)
    ├── styles.css         # Thème sombre, responsive, prefers-reduced-motion
    ├── audio.js           # window.Sfx — sound design Web Audio par catégorie
    ├── scenes.js          # window.Scenes — 12 scènes SVG + animations
    ├── client.js          # Orchestration : socket, état, rendu, analyse
    └── data/
        ├── scenarios.js   # 60 dilemmes (window.CATEGORIES)
        └── profileRules.js # 8 profils + 12 règles de contradiction
```

**Séparation des responsabilités :**
- `audio.js` ne connaît que le son. API : `Sfx.enable()` / `disable()` / `isEnabled()` / `play(name)`.
- `scenes.js` ne connaît que le visuel. API : `Scenes.build(cat, scenario)` / `animate(cat, choice)` / `reset()` / `clear()`.
- `client.js` orchestre : reçoit l'état serveur, appelle les bons modules, gère le DOM et l'analyse.

---

## C. IDENTITÉ PAR CATÉGORIE

| Catégorie | Direction artistique | Animation à la révélation |
|---|---|---|
| Levier | Rails, jonction, danger mécanique froid | Levier bascule, tram dévie ou fonce, impact |
| Pont | Hauteur, vide, silhouette | Chute de l'homme, tram s'arrête (ou fonce sur les 5) |
| Médecin | Moniteur cardiaque, vert clinique sur noir | ECG passe en ligne plate selon le choix |
| Justice | Tribunal, balance dorée, marteau | Marteau frappe, balance penche |
| IA | Œil numérique, grille algorithmique, scanlines bleues | Pupille rouge/verte, glitch, verdict |
| Argent | Balance luxe sale, billets vs cœur | Balance penche d'un côté |
| Famille | Cadre photo, lumière chaude étouffante | Cadre se fissure ou lumière baisse |
| Guerre | Carte tactique, radio, marqueurs | Cible pulse puis disparaît, statique radio |
| Survie | Porte de bunker, jauge d'oxygène | Portes se ferment, O2 chute |
| Mensonge | Miroir, visage coupé en deux (vérité/mensonge) | Fêlure centrale, un côté domine |
| Punition | Foule de silhouettes, culpabilité diffuse | Toute la foule s'efface, ou spotlight sur un seul |
| Animaux | Lien affectif, silhouette de chien, humains | L'un s'efface, le cœur grandit/rétrécit |
| Absurde | Cosmos, étoiles, bouton interdit | Étoiles s'éteignent, bouton s'embrase |

Chaque scène utilise du SVG inline + gradients + animations CSS/SVG. **Aucun asset externe, aucune image lourde.**

---

## SON — signatures par catégorie

Tout est généré en Web Audio (oscillateurs + bruit filtré), aucun fichier :
- **IA** : séquence glitch numérique courte
- **Justice** : coup sourd type marteau
- **Médecin** : bips cardiaques puis flatline
- **Survie** : souffle grave + porte métallique
- **Famille** : accord chaud qui se refroidit
- **Absurde** : drone cosmique
- **Argent** : tintement métallique
- **Guerre** : statique radio + basse lointaine
- **Levier/Pont** : crissement métallique + impact

Plus les sons système : clic, vote, révélation, tick du timer, battement de cœur (dernière zone), contradiction détectée, profil révélé. **Son coupé par défaut**, bouton clair ON/OFF, `AudioContext` créé seulement au premier clic (politique autoplay navigateur), tous les sons s'arrêtent proprement quand on coupe.

---

## ANALYSE FINALE

Par joueur :
- **Profil moral dominant** (parmi 8 : Monstre logique, Protecteur émotionnel, Loyaliste, Rebelle moral, Humaniste instable, Calculateur froid, Chaotique empathique, Soumis à la majorité)
- **Barres de score** (utilitarisme, empathie, loyauté, logique, etc.)
- **Cohérence** en %, **équilibre logique/empathie**, ratio agir/attendre
- **Bilan cumulé** morts/sauvés
- **Comparaison au groupe** (« vous agissez plus que la moyenne »)
- **Contradictions détectées** sur l'ensemble de la partie
- **Phrase finale personnalisée**

---

## Lancer en local

```bash
npm install
npm start
```

Ouvrir <http://localhost:3000> dans deux fenêtres (normale + navigation privée) pour simuler deux joueurs.

## Déployer sur Render

Repo GitHub → Render **New Web Service** → Build `npm install` → Start `npm start` → plan **Free**. Premier accès après veille : 30-60 s.

## Ajouter un dilemme

Éditer `public/data/scenarios.js` (objet `CATEGORIES`). Schéma d'une variante : `name`, `tagline`, `intensity` (soft/moral/dark), `intro`, `labels {act, wait}`, `outcomes {act, wait}` avec `tag`, `title`, `text`, `traits`, `contradictionTags`, et `deaths`/`saved` optionnels. Le serveur valide seulement le format `categorie:variante` — aucun changement serveur nécessaire.

## Ajouter une scène à une catégorie

Dans `public/scenes.js` : ajouter `buildXxx(scenario)` (retourne du SVG) et `animateXxx(svg, choice)`, puis enregistrer dans `registry`. Le système appelle automatiquement la bonne scène selon la catégorie. Fallback intégré si une catégorie n'a pas de scène.

---

## Tests effectués

- **Serveur (end-to-end Socket.IO)** : 3 joueurs, 60 variantes lancées/votées/révélées, abstentions, déconnexion en cours de tour (vote nettoyé), migration de l'hôte, end-game/restart, rejet des clés invalides, rejet des doublons de pseudo, blocage des actions non-hôte. ✅
- **Intégration modules** : les 13 catégories buildent un SVG valide, `Sfx.play()` dégrade sans erreur quand le Web Audio est absent, `Scenes.animate()` respecte `prefers-reduced-motion`, fallback catégorie inconnue. ✅
- **HTTP** : tous les fichiers servis en 200. ✅
- **Syntaxe** : tous les fichiers JS validés (`node -c`). ✅

## Limites restantes

- **Variantes visuelles intra-catégorie** : une scène par catégorie (les 5-6 variantes d'une catégorie partagent sa scène, avec le titre du dilemme affiché). Pousser jusqu'à une scène par dilemme important serait la prochaine étape.
- **Reconnexion** : si le serveur redémarre, les joueurs reviennent au lobby (pas de reprise de session — il faudrait persister l'état, donc une BDD).
- **Pas de stats mondiales** (nécessiterait une BDD — hors scope sans persistance).
