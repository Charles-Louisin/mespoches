# MES POCHES - Backend API

API REST pour l'application de gestion financière personnelle MES POCHES.

## Installation

```bash
cd backend
npm install
```

## Configuration

Créer un fichier `.env` à la racine du dossier backend :

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mes-poches
NODE_ENV=development
```

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## Seed de la base de données

Pour créer les portefeuilles et catégories par défaut :

```bash
npm run seed
```

## Endpoints API

### Portefeuilles
- `GET /api/wallets` - Liste tous les portefeuilles
- `GET /api/wallets/total-balance` - Solde total de tous les portefeuilles
- `GET /api/wallets/:id` - Détails d'un portefeuille
- `GET /api/wallets/:id/history` - Historique d'un portefeuille
- `POST /api/wallets` - Créer un portefeuille
- `PUT /api/wallets/:id` - Modifier un portefeuille
- `DELETE /api/wallets/:id` - Supprimer un portefeuille

### Transactions
- `GET /api/transactions` - Liste toutes les transactions
- `GET /api/transactions/:id` - Détails d'une transaction
- `POST /api/transactions/income` - Créer un revenu
- `POST /api/transactions/expense` - Créer une dépense
- `POST /api/transactions/transfer` - Créer un transfert

### Catégories
- `GET /api/categories` - Liste toutes les catégories
- `GET /api/categories/:id` - Détails d'une catégorie
- `POST /api/categories` - Créer une catégorie
- `PUT /api/categories/:id` - Modifier une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie

### Analytiques
- `GET /api/analytics/current-month` - Statistiques du mois en cours
- `GET /api/analytics/expenses-by-category` - Dépenses par catégorie
- `GET /api/analytics/incomes-by-category` - Revenus par catégorie

## Architecture

```
backend/
├── src/
│   ├── config/          # Configuration (DB)
│   ├── models/          # Modèles Mongoose
│   ├── controllers/     # Contrôleurs
│   ├── services/        # Logique métier
│   ├── routes/          # Routes API
│   ├── validators/      # Validation des données
│   ├── middleware/      # Middleware Express
│   ├── scripts/         # Scripts utilitaires
│   └── server.js        # Point d'entrée
├── package.json
└── .env
```

## Règles Métier

1. Les soldes sont **toujours** calculés par le système
2. Chaque transaction stocke `balance_before` et `balance_after`
3. Les dépenses ne peuvent pas excéder le solde disponible
4. Les transferts affectent deux portefeuilles de manière atomique
5. Les données historiques restent cohérentes
