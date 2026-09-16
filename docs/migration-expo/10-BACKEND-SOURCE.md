# 10 — Carte du backend Express (`note/backend`)

Le backend n’est pas un repo séparé. Il vit dans :

```
C:\realProject\note\backend\
```

Package : `mes-poches-backend`. Entrée : `src/server.ts` → compilé `dist/server.js`.

## Démarrage

```bash
cd C:\realProject\note\backend
cp .env.example .env   # renseigner MONGODB_URI, JWT_SECRET, etc.
npm install
npm run dev            # nodemon, PORT=5000
```

Health : `GET http://localhost:5000/api/health`

**Ne pas committer `backend/.env`** (déjà dans `backend/.gitignore`).

## Arborescence utile

```
backend/
  .env.example
  package.json
  src/
    server.ts                 # helmet, CORS, JSON 8mb, montage /api/*
    loadEnv.ts
    middleware/
      auth.ts                 # protect, adminOnly, premiumOnly, sendLimitError
      sanitize.ts             # anti injection clés Mongo
    models/                   # schémas Mongoose (source de vérité)
    routes/                   # un fichier = un préfixe /api/...
    services/
      walletTransaction.ts    # débit / crédit soldes
      pendingTransactionService.ts
      plannedExpenseService.ts
      smsHabitService.ts
      recurrenceSuggestionService.ts
      ai/                     # OpenRouter, parse SMS/notif, scan image, voix
    jobs/
      plannedExpenseScheduler.ts  # cron exécution + emails rappel
    utils/
      security.ts             # rate limits
      userPayload.ts          # toPublicUser
      subscription.ts
      cinetpay.ts
      email.ts                # Resend
      verification.ts         # OTP
      transactionExport.ts    # csv/pdf/xlsx
    tests/
```

## Montage HTTP (`server.ts`)

| Préfixe | Fichier |
|---|---|
| `GET /api/health` | inline |
| `GET /api/cinetpay-setup` | inline (secret header) |
| `/api/auth` | `routes/authRoutes.ts` |
| `/api/wallets` | `routes/walletRoutes.ts` |
| `/api/transactions` | `routes/transactionRoutes.ts` |
| `/api/categories` | `routes/categoryRoutes.ts` |
| `/api/analytics` | `routes/analyticsRoutes.ts` |
| `/api/admin` | `routes/adminRoutes.ts` |
| `/api/budgets` | `routes/budgetRoutes.ts` |
| `/api/savings-goals` | `routes/savingsGoalRoutes.ts` |
| `/api/recurring` | `routes/recurringRoutes.ts` |
| `/api/export` | `routes/exportRoutes.ts` |
| `/api/subscription` | `routes/subscriptionRoutes.ts` |
| `/api/webhooks` | `routes/webhookRoutes.ts` |
| `/api/planned-expenses` | `routes/plannedExpenseRoutes.ts` |
| `/api/pending-transactions` | `routes/pendingTransactionRoutes.ts` |

Le détail request/response est dans [03-API-BACKEND.md](./03-API-BACKEND.md).

## Modèles Mongo (`src/models/`)

| Fichier | Collection métier |
|---|---|
| `User.ts` | comptes, plan, OTP, Google, `tokenVersion` |
| `Wallet.ts` | poches (`is_deleted` soft delete) |
| `Transaction.ts` | mouvements |
| `Category.ts` | catégories |
| `Budget.ts` | budgets Premium |
| `SavingsGoal.ts` | objectifs d’épargne |
| `RecurringTransaction.ts` | récurrences |
| `PlannedExpense.ts` | dépenses futures + `reminder_sent_at` |
| `PendingTransaction.ts` | file SMS / IA / voix |
| `SmsHabit.ts` | habitudes après validation |
| `NotificationPattern.ts` | patterns notif MM |
| `SubscriptionPayment.ts` | paiements CinetPay |
| `AuthHandoff.ts` | codes OAuth mobile (TTL 5 min) |
| `JobLock.ts` | verrou cron multi-instance |

## Jobs

`plannedExpenseScheduler.ts` (lancé au `listen`) :

- **Exécution** des dépenses `scheduled` dues — défaut 00:05 UTC (`PLANNED_EXPENSE_EXECUTE_*`)
- **Email rappel** J-1 — défaut 08:00 UTC (`PLANNED_EXPENSE_REMINDER_HOUR_UTC`)
- Lock Mongo `JobLock` pour ne pas double-exécuter

## IA (`src/services/ai/`)

| Fichier | Rôle |
|---|---|
| `OpenRouterService.ts` | appels OpenRouter |
| `ImageAnalysisService.ts` | scan reçu → pending[] |
| `NotificationParserService.ts` + `NotificationAnalysisService.ts` | SMS / notifs |
| `MoneyTextFilterService.ts` | filtre texte monétaire |
| `TransactionDraftService.ts` | brouillon structuré |
| `config/aiModels.ts` | ordre de fallback modèles |

Env : `OPENROUTER_API_KEY`. `GEMINI_API_KEY` marqué déprécié dans `.env.example`.

Limites : 30 scans/voix par heure / user ; 60 parse SMS-notif / heure / user.

## Auth interne (à respecter côté Expo)

1. Register → email OTP (Resend) → verify → JWT + essai Premium 1 mois
2. JWT contient `tv` (tokenVersion). Logout / reset password incrémente `tv`
3. `protect` refuse email non vérifié (`EMAIL_NOT_VERIFIED`)
4. Compte Google-only : login password → `NEED_PASSWORD`

## CORS (Expo)

Dans `server.ts`, si `Origin` est absent → `callback(null, true)`.  
Les `fetch` React Native n’envoient souvent **pas** d’Origin : **ça passe déjà**.

Production exige `CORS_ORIGIN` non vide (origines web). Les wildcards `*.mespoches.store` et `*.vercel.app` sont hardcodés.

## Variables d’environnement (backend)

Voir `backend/.env.example`. Les plus importantes pour Expo :

| Variable | Rôle |
|---|---|
| `MONGODB_URI` | Atlas |
| `JWT_SECRET` | **identique** au frontend Next si le BFF vérifie encore les JWT |
| `JWT_EXPIRES_IN` | défaut code `12h` ; example fichier `7d` |
| `CORS_ORIGIN` | origines web |
| `APP_URL` | retours CinetPay / emails |
| `API_PUBLIC_URL` | webhook CinetPay |
| `GOOGLE_CLIENT_ID` / `SECRET` | OAuth |
| `RESEND_*` | emails OTP |
| `OPENROUTER_API_KEY` | IA |
| `CINETPAY_*` | paiements |

## Tests existants

```
backend/src/tests/ai-pipeline.test.ts
backend/src/tests/real-sms-parser.test.ts
```

`npm test` dans `backend/` (`tsx --test`).

## Ce que la migration Expo ne doit PAS faire

- Dupliquer la logique de solde (`walletTransaction.ts`) côté client
- Recalculer Premium (le serveur synce `syncExpiredPremium` à chaque `protect`)
- Appeler Gemini / OpenRouter depuis le mobile — toujours passer par `/pending-transactions/*`
- Inventer un refresh token (n’existe pas)
- Poster un webhook CinetPay depuis l’app
