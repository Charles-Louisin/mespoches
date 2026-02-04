# MES POCHES - Application de Gestion Financière

Application mobile-first de gestion financière personnelle construite avec Next.js et Express.js.

## 🎯 Fonctionnalités

- **Gestion des Portefeuilles** : Créez et gérez plusieurs portefeuilles (Espèces, Mobile Money, Compte Bancaire, etc.)
- **Transactions** : Enregistrez vos revenus, dépenses et transferts entre portefeuilles
- **Calcul Automatique des Soldes** : Les soldes sont toujours calculés par le système
- **Historique Complet** : Consultez l'historique de toutes vos transactions avec balance_before et balance_after
- **Analyses** : Visualisez vos dépenses et revenus par catégorie
- **Interface Mobile-First** : Design optimisé pour une utilisation mobile

## 🛠 Technologies

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icônes)

### Backend
- **Node.js**
- **Express.js**
- **MongoDB** avec Mongoose
- **Joi** (validation)

## 📦 Installation

### Prérequis
- Node.js 18+
- MongoDB

### 1. Cloner le projet
```bash
git clone <url>
cd note
```

### 2. Installation du Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` dans le dossier `backend` :
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mes-poches
NODE_ENV=development
```

Démarrer MongoDB et lancer le seed :
```bash
npm run seed
npm run dev
```

Le backend sera accessible sur http://localhost:5000

### 3. Installation du Frontend

À la racine du projet :
```bash
npm install
npm run dev
```

Le frontend sera accessible sur http://localhost:3000

## 📱 Structure du Projet

```
note/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration DB
│   │   ├── models/          # Modèles Mongoose
│   │   ├── controllers/     # Contrôleurs API
│   │   ├── services/        # Logique métier
│   │   ├── routes/          # Routes Express
│   │   ├── validators/      # Validation Joi
│   │   ├── middleware/      # Middleware
│   │   ├── scripts/         # Scripts (seed)
│   │   └── server.js        # Point d'entrée
│   └── package.json
│
├── src/
│   ├── app/                 # Pages Next.js
│   │   ├── page.tsx         # Dashboard
│   │   ├── transactions/    # Transactions
│   │   ├── wallets/         # Portefeuilles
│   │   └── analytics/       # Analyses
│   ├── components/          # Composants réutilisables
│   └── lib/                 # Utilitaires et API
│
├── package.json
└── README.md
```

## 🎨 Design

- **Couleur principale** : Bleu ciel (#0ea5e9)
- **Style** : Simple, compact, moderne et professionnel
- **UX** : Navigation mobile avec bottom nav
- **Typographie** : Inter (Google Fonts)
- **Icônes** : Lucide React

## 🔐 Règles Métier

1. ✅ Les utilisateurs ne saisissent **jamais** les soldes
2. ✅ Les soldes sont **toujours** calculés par le système
3. ✅ Chaque transaction stocke `balance_before` et `balance_after`
4. ✅ Les dépenses ne peuvent pas excéder le solde disponible
5. ✅ Les transferts affectent deux portefeuilles de manière atomique
6. ✅ Les données historiques restent cohérentes

## 📚 API Endpoints

### Portefeuilles
- `GET /api/wallets` - Liste des portefeuilles
- `GET /api/wallets/total-balance` - Solde total
- `POST /api/wallets` - Créer un portefeuille
- `PUT /api/wallets/:id` - Modifier un portefeuille
- `DELETE /api/wallets/:id` - Supprimer un portefeuille

### Transactions
- `GET /api/transactions` - Liste des transactions
- `POST /api/transactions/income` - Créer un revenu
- `POST /api/transactions/expense` - Créer une dépense
- `POST /api/transactions/transfer` - Créer un transfert

### Catégories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie

### Analyses
- `GET /api/analytics/current-month` - Stats du mois
- `GET /api/analytics/expenses-by-category` - Dépenses par catégorie
- `GET /api/analytics/incomes-by-category` - Revenus par catégorie

## 🚀 Déploiement

### Backend
Le backend peut être déployé sur :
- Heroku
- Railway
- Render
- DigitalOcean

### Frontend
Le frontend peut être déployé sur :
- Vercel (recommandé pour Next.js)
- Netlify
- Railway

## 📝 Licence

MIT
