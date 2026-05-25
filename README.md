# Le Dilemme — V2 (V5 du repo)

Jeu multijoueur de dilemmes moraux. **60 dilemmes en 13 catégories**, système de profils psychologiques, détection de contradictions, timer, 3 modes de jeu, son optionnel.

## Le concept

L'hôte crée une partie, partage un code à 4 caractères, les invités rejoignent. À chaque tour : l'hôte choisit un dilemme, tout le monde vote en secret, l'hôte révèle, les votes individuels + lectures philosophiques + phrase sarcastique s'affichent. À la fin de la partie, un bouton « Terminer et analyser » génère un profil moral par joueur.

## Nouveautés V2

- **60 dilemmes** dans 13 catégories (vs 25 auparavant)
- **5 nouvelles catégories** : justice, IA, survie, mensonge, punition collective, animaux, absurde existentiel
- **5 dilemmes obligatoires** intégrés : IA juge (Minority Report), vaccin imparfait, bunker nucléaire, faux coupable (Karamazov), simulation
- **Système de traits psychologiques** : chaque vote alimente 10 dimensions (utilitarisme, empathie, loyauté, logique, émotion, autorité, égoïsme, protection, conformisme, rébellion, courage)
- **8 profils détectables** : Monstre logique, Protecteur émotionnel, Loyaliste, Rebelle moral, Humaniste instable, Calculateur froid, Chaotique empathique, Soumis à la majorité
- **Détection de contradictions** : ~12 règles qui repèrent les incohérences entre choix (ex : « vous tirez le levier mais refusez de pousser » → doctrine du double effet)
- **Timer configurable** : aucun / 3 / 10 / 20 secondes, avec barre de temps colorée et abstention auto à l'expiration
- **3 modes** : Classique, Psychologique (alertes de contradiction en cours de partie), Pression (ambiance stressante)
- **Son Web Audio** : généré en oscillateurs (pas de fichiers à charger), toggle propre ON/OFF, battement de cœur dans la dernière zone du timer
- **Analyse finale** par joueur : profil moral, score logique/empathie, cohérence, contradictions, bilan morts/sauvés cumulés, phrase finale personnalisée
- **Effets visuels** : glitch sur les dilemmes IA, tremor sur les dilemmes intenses, phrases sarcastiques après révélation, étiquettes d'intensité (doux/moral/intense)
- **Architecture splittée** : `index.html` / `styles.css` / `client.js` / `data/scenarios.js` / `data/profileRules.js`

## Les 13 catégories, 60 variantes

| Catégorie | Variantes | Exemples |
|---|---|---|
| Le levier | 5 | Test classique, votre enfant, le tyran déchu |
| Le pont | 4 | Pousseur, meurtrier, sauveur, consentement retiré |
| Le médecin | 5 | Cinq organes, détenu, **vaccin imparfait** |
| L'argent | 4 | Héritage vs ONG, sac de billets, pot-de-vin |
| La famille | 4 | Infidélité, diagnostic, désaccord parental |
| La guerre | 4 | Interrogatoire, déserteur, sabotage |
| **La justice** | 5 | **Faux coupable**, peine de mort, dénonciation |
| **L'IA** | 6 | **IA juge**, voiture autonome, surveillance de masse |
| **La survie** | 5 | **Bunker**, canot, cannibalisme |
| **Le mensonge** | 5 | Témoignage, infidélité passée, père mourant |
| **La punition collective** | 4 | Punir la classe, famille du terroriste |
| **Les animaux** | 4 | Votre chien vs 5 inconnus, expérimentation |
| **L'absurde** | 5 | **Simulation**, bouton du million, immortalité |

## Architecture

```
le-dilemme-v5/
├── server.js              # Express + Socket.IO, état serveur (mode, timer, salles)
├── package.json
├── README.md
└── public/
    ├── index.html         # Squelette HTML + scènes SVG
    ├── styles.css         # Tout le CSS
    ├── client.js          # Logique de jeu (multijoueur, animations, son, timer, analyse)
    └── data/
        ├── scenarios.js   # 60 dilemmes (CATEGORIES global)
        └── profileRules.js # Profils + règles de contradiction
```

## Tester en local

```bash
npm install
npm start
```

Ouvrir <http://localhost:3000> dans deux fenêtres (normale + navigation privée) pour simuler deux joueurs.

## Déployer sur Render

Identique à V1 : repo GitHub → Render Web Service → `npm install` / `npm start` → plan Free. Premier accès après veille : 30-60 s.

## Comment fonctionnent les profils

À chaque vote, les **traits** définis dans `outcomes.act.traits` ou `outcomes.wait.traits` sont accumulés pour le joueur. À la fin de la partie, le profil dominant est détecté par les `detector` de `profileRules.js`. Exemple :

```js
{
  key: "monstre_logique",
  name: "Monstre logique",
  detector: (s) => s.utilitarian >= 8 && s.logical >= 6 && s.empathic <= 4
}
```

Ajouter un profil = ajouter une entrée dans `PROFILES` avec son `detector`.

## Comment fonctionnent les contradictions

Chaque dilemme tague ses choix avec des `contradictionTags` (ex : `sacrifice_one_for_many`, `family_first`, `truth_priority`). Les règles dans `CONTRADICTION_RULES` examinent l'historique des votes et signalent les incohérences :

```js
{
  name: "sacrifice_anonyme_mais_pas_proche",
  check: (votes) => {
    if (votes["lever:base"] === "act" && votes["lever:proche"] === "wait") {
      return "Vous sacrifiez 1 pour 5 quand c'est anonyme, mais pas votre enfant...";
    }
    return null;
  }
}
```

Ajouter une règle = ajouter une entrée dans `CONTRADICTION_RULES`. Aucun changement serveur nécessaire.

## Ajouter un dilemme

Dans `public/data/scenarios.js`, ajouter une variante dans la catégorie souhaitée :

```js
ma_variante: {
  name: "Nom du dilemme",
  tagline: "Hook en ~5 mots",
  intensity: "moral",   // soft | moral | dark
  intro: "Description du scénario...",
  labels: { act: "Bouton 1", wait: "Bouton 2" },
  shortLabels: { act: "Texte\nsphère\ngauche", wait: "Texte\nsphère\ndroite" }, // pour catégories "abstract" uniquement
  outcomes: {
    act: {
      tag: "Position philosophique", title: "Titre",
      text: "Analyse de ce choix...",
      deaths: 1, saved: 5,   // optionnels
      traits: { utilitarian: 2, logical: 1 },
      contradictionTags: ["sacrifice_one_for_many"]
    },
    wait: { ... }
  }
}
```

Le serveur reste indifférent au contenu — il valide juste le format `categorie:variante`.

## Ce qui est différé (V3 propres)

- **Scènes SVG dédiées par catégorie** : pour l'instant, tout ce qui n'est pas tramway/hôpital utilise la scène abstraite avec son label de catégorie. Une vraie scène justice (balance, marteau), IA (œil numérique), survie (porte de bunker) demanderait ~9 SVG supplémentaires et des animations dédiées. La scène abstraite tient en attendant.
- **Roues du tram qui tournent** : prévu dans le brief V2, pas fait. Demanderait une animation SVG ou un sprite.
- **Mode dictateur** : noté comme TODO. Pourrait être ajouté en ~50 lignes dans `client.js` (vote unique de l'hôte qui imite la majorité).
- **Stats mondiales** : architecture prête côté client (computePlayerAnalysis fonctionne sur n'importe quelle source d'historique) mais nécessiterait une base de données pour persister les parties — V3.
- **Sons par catégorie spécifique** : pour l'instant, les sons (lever, impact, glitch, tick, heartbeat) sont génériques. Une variation par catégorie (tribunal, alarme, hôpital) serait simple à ajouter dans `playAnimation()`.

## Crédits philosophiques

Tous les commentaires sont rédigés en propres termes à partir de la littérature :
- Foot, Thomson (problème du tramway, variante du pont)
- Singer (impartialité, utilitarisme prospectif, antispécisme)
- Greene (bases neurales des jugements moraux)
- Kant, Bentham, Mill, Beccaria, Hugo, Aquinas, Cicéron, Bernard Williams, Susan Wolf, Platon, Sartre, Beauvoir, Walzer, Rawls, Heidegger, Dostoïevski, Weber, Tutu, Aristote
- Pour les nouveautés V2 : références à Snowden/Greenwald (surveillance), Goldman (tirage au sort), Gilligan (éthique du soin), groupe Nakam (vengeance post-Shoah), modèle sud-africain de Tutu (vérité et réconciliation), cas réel des Andes 1972 (cannibalisme).
