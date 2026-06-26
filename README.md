# 🌍 X World Travel Hub

> La super app de voyage mondiale — 20+ services, 9 régions, IA intégrée.

---

## 📦 Contenu de l'application

| Module            | Description                                      |
|-------------------|--------------------------------------------------|
| ✈️ Vols            | Recherche + réservation, Air France, Iberia...   |
| 🏨 Hôtels          | Booking.com, filtres budget, tunnel paiement     |
| 🚖 Transport / VTC | Uber, Yandex, Grab, DiDi, InDriver par région   |
| ⛅ Météo           | Prévisions IA + 7 jours par ville               |
| 🗺️ Navigation      | Google Maps + Waze intégrés                     |
| 📍 Localisation    | GPS temps réel, partage position, IA locale     |
| 🌐 Traducteur      | 12 langues, vocal, phrasebook voyage            |
| 💳 Finance         | Convertisseur devises, conseils Revolut         |
| 🛒 Amazon          | Shopping 8 boutiques, IA produits, Prime        |
| 🧭 Guide Tourisme  | Guide IA par destination et style voyage        |
| 🏥 Santé           | Vaccins, Helsana, conseils médicaux voyage      |
| 💬 Messages        | WeChat-style : chats, Moments, Wallet           |
| 🤖 Assistant IA    | Claude AI — planification complète              |
| ✅ To-Do           | Liste tâches voyage avec catégories             |
| 📦 Réservations    | Toutes vos réservations centralisées            |
| 🎤 Siri            | Commandes vocales pour naviguer dans l'app      |

---

## 🚀 Déploiement en 5 minutes

### Option A — Vercel (Recommandé ✅)

```bash
# 1. Cloner / télécharger ce dossier
cd xworld-deploy

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# → Éditez .env.local avec vos clés API

# 4. Tester en local
npm start
# → Ouvre http://localhost:3000

# 5. Déployer sur Vercel
npx vercel deploy --prod
# → Obtenez votre URL : https://xworld-hub.vercel.app
```

**OU via l'interface Vercel :**
1. Allez sur [vercel.com](https://vercel.com) → New Project
2. Importez depuis GitHub (uploadez ce dossier)
3. Framework Preset → **Create React App**
4. Ajoutez vos variables d'environnement
5. Cliquez **Deploy** → URL en 2 minutes !

---

### Option B — Netlify

```bash
# 1. Installer Netlify CLI
npm install -g netlify-cli

# 2. Build de production
npm run build

# 3. Déployer
netlify deploy --prod --dir=build
# → Obtenez votre URL : https://xworld-hub.netlify.app
```

**OU drag & drop :**
1. `npm run build` → génère le dossier `build/`
2. Allez sur [netlify.com](https://netlify.com) → Sites
3. Glissez-déposez le dossier `build/` sur la page
4. URL générée instantanément !

---

### Option C — GitHub Pages (Gratuit)

```bash
# 1. Installer gh-pages
npm install --save-dev gh-pages

# 2. Ajouter dans package.json :
# "homepage": "https://VOTRE_USERNAME.github.io/xworld-hub"
# "predeploy": "npm run build"
# "deploy": "gh-pages -d build"

# 3. Déployer
npm run deploy
```

---

## ⚙️ Variables d'environnement requises

| Variable                          | Gratuit ? | Où l'obtenir                          |
|-----------------------------------|-----------|---------------------------------------|
| `REACT_APP_ANTHROPIC_API_KEY`     | Payant    | [console.anthropic.com](https://console.anthropic.com) |
| `REACT_APP_OPENWEATHER_API_KEY`   | ✅ Gratuit | [openweathermap.org/api](https://openweathermap.org/api) |
| `REACT_APP_GOOGLE_MAPS_API_KEY`   | ✅ Gratuit | [console.cloud.google.com](https://console.cloud.google.com) |
| `REACT_APP_AMADEUS_CLIENT_ID`     | ✅ Gratuit (test) | [developers.amadeus.com](https://developers.amadeus.com) |
| `REACT_APP_STRIPE_PUBLIC_KEY`     | ✅ Gratuit (test) | [dashboard.stripe.com](https://dashboard.stripe.com) |

---

## 🌍 Régions couvertes

🇪🇺 Europe · 🇨🇭 Suisse · 🇷🇺 Russie · 🇺🇸 USA · 🇮🇳 Inde · 🌏 Asie · 🇨🇳 Chine · 🌎 Am. Sud · 🇦🇺 Australie

---

## 🏗️ Structure du projet

```
xworld-deploy/
├── public/
│   ├── index.html          ← Page HTML avec splash screen
│   └── manifest.json       ← Config PWA (installable sur mobile)
├── src/
│   ├── index.js            ← Point d'entrée React
│   └── App.jsx             ← Application complète (2200+ lignes)
├── .env.example            ← Template variables d'environnement
├── .gitignore              ← Fichiers à ignorer
├── package.json            ← Dépendances
├── vercel.json             ← Config Vercel (multi-région)
├── netlify.toml            ← Config Netlify
└── README.md               ← Ce guide
```

---

## 📱 PWA — Installation sur mobile

Une fois déployée, l'application peut s'installer comme une vraie app mobile :

**iPhone (Safari) :** Partager → Ajouter à l'écran d'accueil  
**Android (Chrome) :** Menu → Installer l'application  

→ Icône X World sur votre écran, plein écran, sans barre de navigateur !

---

## 🔐 Sécurité

- ⚠️ **Ne committez jamais** votre fichier `.env.local` sur GitHub
- Utilisez les **variables d'environnement** de Vercel/Netlify pour les clés de production
- Les clés Anthropic côté frontend sont exposées — pour production, créez un **proxy backend** (Vercel Edge Functions)

---

## 📞 Support

Application développée avec **Claude AI (Anthropic)** et **React 18**.

© 2026 X World Sàrl — Suisse 🇨🇭
