# Le Dilemme du Tramway — multijoueur

Jeu en ligne pour 2 à 16 joueurs explorant le dilemme moral du tramway et ses variantes classiques (Foot 1967, Thomson 1976).

## Comment ça marche

- **L'hôte** crée une partie et reçoit un code à 4 caractères (ex. `K7QM`).
- Les **invités** rejoignent via le code (ou via le lien partagé `?room=K7QM`).
- À chaque tour, l'hôte choisit un dilemme parmi 4 variantes.
- Chaque joueur (hôte compris) vote en secret entre les deux options.
- Personne ne voit les votes des autres avant la **révélation**.
- Quand l'hôte révèle, l'animation joue, puis les votes individuels et les lectures philosophiques s'affichent.
- L'hôte lance le tour suivant. Pas de gagnant — juste l'historique des positions de chacun.

### Pouvoirs du host
- Lancer un tour (choisir le scénario)
- Révéler les votes
- Passer au tour suivant
- L'hôte vote aussi, comme tout le monde

### Pouvoirs des invités
- Rejoindre via code ou lien
- Voter entre les deux options du dilemme en cours

## Stack

- **Serveur** : Node.js + Express + Socket.IO (≈140 lignes)
- **Client** : HTML + SVG + CSS + JS vanilla, un seul fichier
- Aucun build, aucun framework, aucune base de données — état en mémoire serveur

## Tester en local

```bash
npm install
npm start
```

Puis ouvrir <http://localhost:3000> dans deux fenêtres (par ex. une normale + une navigation privée) pour simuler deux joueurs.

## Déployer sur Render

1. **Pousser sur GitHub** :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<toi>/<repo>.git
   git push -u origin main
   ```

2. **Créer un Web Service sur Render** :
   - [render.com](https://render.com) → **New** → **Web Service**
   - Connecter le repo
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : Free
   - Cliquer **Create Web Service**

3. **Partager le lien** — une fois déployé, l'URL ressemble à `https://ton-app.onrender.com`. Vous créez une partie, cliquez sur **"Copier le lien d'invitation"**, et votre amie n'a plus qu'à coller le lien (le code est déjà pré-rempli).

⚠️ **Plan gratuit Render** : le serveur s'endort après ~15 min d'inactivité. Le premier accès après veille prend 30-60 s à se réveiller — ensuite c'est instantané. Si vous testez, ouvrez le lien quelques secondes avant que votre amie le fasse pour amorcer.

## Limitations actuelles

- Rafraîchir la page = quitter la salle (l'état serveur est par socket, pas par session)
- Si l'hôte part, le joueur suivant devient automatiquement hôte
- Si le serveur redémarre (Render free tier), toutes les parties sont perdues — il faut recréer

## Ajouter une variante

Dans `public/index.html`, repérer l'objet `SCENARIOS` au début du `<script>`. Copier une entrée existante :

```js
ma_variante: {
  name: "Nom court",
  hint: "Référence ou contexte",
  intro: "Description du dilemme...",
  labels: { act: "Action", wait: "Inaction" },
  verbsPresent: { act: "...", wait: "..." },
  verbsAfter:   { act: "...", wait: "..." },
  scene: "trolley",        // ou "hospital"
  sceneVariant: "classic", // "classic" | "bridge" | "loop" | null
  outcomes: {
    act:  { tag, title, text, deaths, saved },
    wait: { tag, title, text, deaths, saved }
  }
}
```

Puis ajouter la clé dans `SCENARIO_KEYS` (même fichier) **et** dans `VALID_SCENARIOS` du `server.js`.

## Crédits philosophiques

- Philippa Foot, *The Problem of Abortion and the Doctrine of the Double Effect* (1967)
- Judith Jarvis Thomson, *Killing, Letting Die, and the Trolley Problem* (1976)
- Joshua Greene, travaux d'IRM sur les bases neurales des jugements moraux (2001+)
