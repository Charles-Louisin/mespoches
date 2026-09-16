# 03 — Catalogue API backend (Express Railway)

**Base URL production :** `https://mespochesbackend-production-9bfe.up.railway.app/api`  
**Base URL local :** `http://localhost:5000/api`

**Code source :** `C:\realProject\note\backend\` (Express + TypeScript).  
Montage des routes : `backend/src/server.ts`.  
Le contrat ci-dessous est lu **dans ce code**, pas seulement depuis le client frontend.

Scripts : `cd backend && npm run dev` (nodemon, port 5000), `npm run build`, `npm start`.

## Découvertes importantes vs le BFF Next

| Sujet | Réalité Express (`backend/src`) |
|---|---|
| Inscription | `POST /auth/register` **ne renvoie jamais de JWT**. Toujours `needsVerification: true` + `{ email }`. Le token arrive à `POST /auth/verify-email`. |
| JWT | `jwt.sign({ id, role, emailVerified, tv })`. `tv` = `user.tokenVersion`. Défaut `JWT_EXPIRES_IN` = **`12h`** (`.env.example` propose `7d` si défini). |
| Logout | `POST /auth/logout` exige **Bearer**. Incrémente `tokenVersion` → tous les JWT existants deviennent `SESSION_REVOKED`. |
| Compte Google sans password | `POST /auth/login` → `401` `NEED_PASSWORD` (utiliser mot de passe oublié). |
| CORS app native | `origin` absent → autorisé (`server.ts`). |
| Body JSON | limite **8 Mo** (`express.json({ limit: '8mb' })`). |
| Rate limit global | 400 req / 15 min / IP (`apiLimiter`). Health + webhooks exclus. |

## Convention de réponse JSON

```ts
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  count?: number
  code?: string  // PREMIUM_REQUIRED | EMAIL_NOT_VERIFIED | RATE_LIMITED | RESEND_COOLDOWN | JWT_MISMATCH | …
}
```

- Succès HTTP 2xx **et** `success === true` → utiliser `data`.
- Erreur : `message` affiché à l’utilisateur.
- `code === 'PREMIUM_REQUIRED'` → ouvrir l’écran abonnement.
- `code === 'SESSION_REVOKED'` → déconnexion forcée (logout / reset password).
- `code === 'EMAIL_NOT_VERIFIED'` → écran code 6 chiffres (`data.email`).
- `code === 'NEED_PASSWORD'` → compte Google, pas encore de mot de passe.
- `code === 'OTP_LOCKED'` / `ALREADY_VERIFIED` / `RESEND_COOLDOWN` / `RATE_LIMITED` / `LIMIT_REACHED`.
- Upload / payload trop gros : HTTP **413** (parfois sans JSON).
- SMS / notif déjà connu : HTTP **200** + éventuellement `"duplicate": true`.
- SMS / notif créé : HTTP **201**.
- Contenu non reconnu (SMS) : HTTP **422**.

## Auth HTTP métier

Toutes les routes ci-dessous (sauf auth publiques et health) exigent :

```
Authorization: Bearer <jwt>
Content-Type: application/json
```

JWT durée : **`process.env.JWT_EXPIRES_IN` ou `12h`**. Payload : `{ id, role, emailVerified, tv }`.  
Si `tv` ≠ `user.tokenVersion` → `401` `SESSION_REVOKED`.

Middleware `protect` (`backend/src/middleware/auth.ts`) : Bearer obligatoire, user existant, email vérifié, sync premium expiré.

`premiumOnly` → 403 `PREMIUM_REQUIRED`.

---

## Rate limits (`backend/src/utils/security.ts`)

| Limiter | Fenêtre | Max | Où |
|---|---|---|---|
| `apiLimiter` | 15 min | 400 / IP | tout sauf health/webhooks |
| `authIpLimiter` | 15 min | 40 / IP | toutes les routes `/auth` |
| `loginLimiter` | 15 min | 15 / IP+email | login, register, google |
| `otpLimiter` | 15 min | 20 / IP+email | verify, resend, forgot, reset |
| `availabilityLimiter` | 15 min | 60 / IP | check-availability |
| `aiScanLimiter` | 1 h | 30 / user | `ai-scan`, `voice-note` |
| `parseIngestLimiter` | 1 h | 60 / user | parse-sms, parse-notification |
| `exportLimiter` | 15 min | 8 / user | exports |
| `webhookLimiter` | 1 min | 60 / IP | CinetPay |

SMS / notif : texte max **4000** caractères (`MAX_PARSE_TEXT_CHARS`).

---

## Auth publique (sans Bearer)

Ces chemins existent **sur Express**. Le web les appelle via le BFF Next ; Expo doit les appeler **directement** sur Railway.

### `POST /auth/login`

Body :

```json
{ "email": "string", "password": "string" }
```

Succès :

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "user", "plan": "free", "emailVerified": true, "..." : "..." },
    "token": "<jwt>"
  }
}
```

Échec email non vérifié : `success: false`, `code: "EMAIL_NOT_VERIFIED"`.

Rate limit côté BFF Next : 20 / 15 min / IP (Expo : se fier au rate limit Express s’il existe).

### `POST /auth/register`

Body Joi : `{ email, password (10–128), name? (allow ''), currency? }`.

**Toujours** `201` :

```json
{
  "success": true,
  "needsVerification": true,
  "message": "Compte créé. Vérifiez votre email avec le code reçu.",
  "data": { "email": "..." }
}
```

Pas de token. L’essai Premium est appliqué **uniquement** à `verify-email` (`getNewUserTrialFields()`).

### `POST /auth/verify-email`

```json
{ "email": "string", "code": "123456" }
```

Succès : même forme que login (`user` + `token`). Code à **6 chiffres**.

### `POST /auth/resend-code`

```json
{ "email": "string" }
```

Cooldown : `code: "RESEND_COOLDOWN"`, `data.cooldownSeconds` (défaut 60).

### `POST /auth/forgot-password`

```json
{ "email": "string" }
```

Message volontairement vague (« Si un compte existe… »). Même cooldown `RESEND_COOLDOWN`.

### `POST /auth/reset-password`

```json
{ "email": "string", "code": "123456", "password": "string" }
```

Succès : `user` + `token` (connexion automatique).

### `GET /auth/check-availability?email=&name=`

Sans Bearer. Réponse :

```json
{
  "success": true,
  "data": {
    "email": { "available": true },
    "name": { "available": false }
  }
}
```

Utilisé en live pendant l’inscription.

### `POST /auth/logout`

Express : invalidation éventuelle. Le BFF Next l’appelle aussi. Côté Expo : supprimer le JWT local suffit ; appeler l’endpoint si le backend blacklist les tokens.

### `POST /auth/logout`

**Protégé (Bearer).** Incrémente `tokenVersion` → révoque toutes les sessions. Expo doit l’appeler, pas seulement vider SecureStore.

### Google (`backend/src/routes/authRoutes.ts`)

| Méthode | Path | Body / rôle |
|---|---|---|
| GET | `/auth/google/client` | `{ clientId }` — 503 si non configuré |
| POST | `/auth/google` | `{ idToken, mobile?, clientNonce? }` — vérifie l’id_token Google |
| POST | `/auth/google/exchange` | `{ code, redirectUri, mobile?, clientNonce? }` — échange code OAuth (secret serveur) |
| POST | `/auth/google/handoff` | `{ code, clientNonce }` — usage unique, 5 min |

Web (mobile=false) → `{ user, token }`.  
Mobile (`mobile: true` + nonce) → `{ handoffCode }` puis handoff → `{ token, user: { emailVerified } }`.

`redirectUri` doit finir par `/api/auth/google/callback` et être localhost, `*.mespoches.store`, `*.vercel.app`, ou une origine `CORS_ORIGIN` / `APP_URL`.

Nouveau compte Google : email déjà vérifié + essai Premium immédiat. Liaison si email déjà existant (`authProvider: both` si password présent).

---

## Auth authentifiée

### `GET /auth/me`

→ `MeUser`

```ts
{
  id: string
  email: string
  name?: string
  role?: 'user' | 'admin'
  plan?: 'free' | 'premium'
  premiumUntil?: string | null
  premiumSource?: 'trial' | 'paid' | null
  isPremium?: boolean
  isOnTrial?: boolean
  currency?: string
  hidePlannedExpensesHelp?: boolean
  created_at: string
  lastLoginAt?: string | null
}
```

### `PATCH /auth/me`

Body (partiel) :

```json
{ "currency": "XAF", "hidePlannedExpensesHelp": true }
```

Devises valides : `XAF` | `XOF` | `EURO` | `DOLLARS`.

### `DELETE /auth/me`

Suppression définitive du compte et des données. Réponse `{ message: string }`.

---

## Wallets (poches)

| Méthode | Path | Body / query | Réponse |
|---|---|---|---|
| GET | `/wallets` | — | `Wallet[]` |
| GET | `/wallets/:id` | — | `Wallet` |
| GET | `/wallets/total-balance` | — | `{ total, totalSavings?, wallets }` |
| POST | `/wallets` | `{ name, image_url?, initial_balance? }` | `Wallet` |
| PUT | `/wallets/:id` | `{ name?, image_url? }` | `Wallet` |
| DELETE | `/wallets/:id` | — | ok |
| GET | `/wallets/:id/history` | — | `{ wallet, transactions, planned_expenses? }` |

`Wallet` :

```ts
{
  _id: string
  name: string
  currency: string
  current_balance: number
  image_url?: string | null
  created_at: string
  month_income?: number
  month_expense?: number
}
```

Notes :

- `initial_balance` crée implicitement un revenu / solde de départ.
- Image : URL UploadThing (Premium).
- Solde ne peut pas être négatif (modèle).

---

## Transactions

| Méthode | Path | Détail |
|---|---|---|
| GET | `/transactions` | Query : `wallet_id`, `type`, `startDate`, `endDate`, `limit` |
| GET | `/transactions/:id` | Une transaction |
| GET | `/transactions/:id/transfer-pair` | `{ debit, credit }` pour un transfert |
| POST | `/transactions/income` | Créer un revenu |
| POST | `/transactions/expense` | Créer une dépense |
| POST | `/transactions/transfer` | Créer un transfert (Premium) |
| PUT | `/transactions/:id` | Modifier description, amount, wallet, category, date, line_items |
| DELETE | `/transactions/:id` | Supprimer |

**Query GET list** (le home utilise `limit=40`, l’historique `limit=200`, le sync `limit=500`) :

```
/transactions?wallet_id=&type=&startDate=&endDate=&limit=200
```

**TransactionInput** (income / expense) :

```ts
{
  amount: number
  wallet_id?: string
  category_id?: string
  description?: string
  date?: string           // ISO
  savings_goal_id?: string // revenu vers objectif (Premium)
  line_items?: TransactionLineItem[]
}
```

**TransferInput** :

```ts
{
  amount: number
  wallet_id: string              // source
  destination_wallet_id?: string // autre poche
  savings_goal_id?: string       // vers objectif d’épargne
  description?: string
  date?: string
}
```

**TransactionLineItem** (ne pas envoyer `_id` Mongo) :

```ts
{
  description: string
  amount: number
  quantity?: number
  unit_amount?: number
  type?: 'income' | 'expense'
}
```

**Transaction** :

```ts
{
  _id: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  wallet_id: Wallet | string | null
  destination_wallet_id?: Wallet | string
  category_id?: Category | string
  description: string
  line_items?: TransactionLineItem[]
  date: string
  balance_before: number
  balance_after: number
  transfer_group_id?: string | null
  is_transfer_mirror?: boolean
  savings_goal_id?: SavingsGoal | string | null
  created_at: string
  updated_at?: string
}
```

Populate : `wallet_id` / `category_id` sont souvent des **objets** dans les GET, et des **ids** dans les POST.

Date future : autorisée **uniquement pour les dépenses** → crée une **dépense prévue** (`planned-expenses`) au lieu d’une transaction immédiate.

---

## Catégories

| Méthode | Path | Détail |
|---|---|---|
| GET | `/categories` | Query optionnelle `?type=income` ou `expense` |
| GET | `/categories/:id` | |
| POST | `/categories` | `{ name, type, image_url? }` |
| PUT | `/categories/:id` | `{ name?, type?, image_url? }` |
| DELETE | `/categories/:id` | |

```ts
{ _id, name, type: 'income' | 'expense', image_url?, created_at }
```

Limite free : 10 catégories par type (`FREE_MAX_CATEGORIES_PER_TYPE`).

---

## Analytics

| Méthode | Path | Accès |
|---|---|---|
| GET | `/analytics/current-month` | Gratuit |
| GET | `/analytics/month?year=&month=` | Premium |
| GET | `/analytics/month-comparison?year=&month=` | Premium |
| GET | `/analytics/expenses-by-category?startDate=&endDate=` | Premium |
| GET | `/analytics/incomes-by-category?startDate=&endDate=` | Premium |

`MonthStats` : `{ month, year, totalIncome, totalExpense, balance, incomeCount, expenseCount }`

`MonthComparison` : `{ selected, previous, delta, percent }`

`CategoryStat` : `{ category, total, count }`

---

## Abonnement

| Méthode | Path | Détail |
|---|---|---|
| GET | `/subscription/plans` | Plans + `paymentAvailable` + `sandbox` + `paymentMethods` |
| GET | `/subscription/status` | `{ user, isPremium, paymentAvailable }` |
| POST | `/subscription/checkout` | Body `{ period: 'monthly' \| 'yearly', payment_method: 'all' \| 'orange' \| 'mtn' }` → `{ paymentUrl, transactionId }` |
| GET | `/subscription/verify?transaction_id=` | Après retour CinetPay |

`paymentUrl` doit être un host `*.cinetpay.com` / `cinetpay.net` (whitelist frontend `lib/payment-url.ts`).

Côté produit actuel : paiement **désactivé en production web** (`isSubscriptionPaymentEnabled()` = localhost only). L’API peut quand même exister.

Webhooks CinetPay : `/webhooks/...` (serveur only, pas d’appel app).

---

## Budgets (Premium)

| Méthode | Path |
|---|---|
| GET | `/budgets?year=&month=` |
| POST | `/budgets` body `{ category_id, year, month, limit_amount }` |
| PUT | `/budgets/:id` body `{ limit_amount }` |
| DELETE | `/budgets/:id` |

```ts
{ _id, category_id, year, month, limit_amount, spent?, percent? }
```

---

## Objectifs d’épargne (Premium)

| Méthode | Path |
|---|---|
| GET | `/savings-goals` |
| GET | `/savings-goals/total` → `{ total }` |
| POST | `/savings-goals` `{ title, target_amount, deadline? }` |
| PUT | `/savings-goals/:id` |
| DELETE | `/savings-goals/:id` |

```ts
{ _id, title, target_amount, saved_amount?, deadline?, current_amount?, progress_percent? }
```

Un revenu ou un transfert peut cibler `savings_goal_id`.

---

## Dépenses prévues (base, pas Premium)

Créées quand l’utilisateur saisit une **dépense à une date future**.

| Méthode | Path |
|---|---|
| GET | `/planned-expenses?wallet_id=&status=` |
| POST | `/planned-expenses` `{ amount, wallet_id, category_id?, description?, scheduled_date }` |
| PUT | `/planned-expenses/:id` |
| DELETE | `/planned-expenses/:id` | Annule (`status: cancelled`) |

`status` : `scheduled` | `executed` | `cancelled`  
`cancelled_reason` : `user` | `insufficient_balance`

L’exécution automatique à la date est **côté backend** (cron). Le frontend liste et permet d’éditer / annuler.

---

## Transactions en attente (SMS, notif, IA, voix)

Cœur de l’automatisation. L’utilisateur **valide** avant que ça devienne une vraie transaction.

| Méthode | Path | Body |
|---|---|---|
| GET | `/pending-transactions?status=pending` | status aussi `validated` / `rejected` |
| GET | `/pending-transactions/count` | `{ count }` |
| GET | `/pending-transactions/:id` | |
| PUT | `/pending-transactions/:id` | amount, type, wallet_id, category_id, description, date, ai_items |
| POST | `/pending-transactions/:id/validate` | mêmes champs optionnels → `{ pending, transactionId }` |
| POST | `/pending-transactions/:id/reject` | |
| POST | `/pending-transactions/parse-sms` | `{ text }` — **aussi appelé par le Java Android** |
| POST | `/pending-transactions/parse-notification` | `{ title, body, packageName? }` |
| POST | `/pending-transactions/ai-scan` | `{ image: dataUrlBase64, mimeType }` → `PendingTransaction[]` |
| POST | `/pending-transactions/voice-note` | `{ text }` |
| GET | `/pending-transactions/habits/summary` | habitudes + identité extraite |

`PendingTransaction.source` : `sms` | `notification` | `ai_scan` | `manual` | `voice`

`operator` : `orange` | `mtn` | `unknown`

`pattern` : `transfer_out` | `transfer_in` | `payment` | `withdrawal` | `unknown`

`confidence` : 0–1

Codes HTTP spécifiques parse-sms / parse-notification (Android) :

- **201** nouvelle pending → notif « Transaction prête »
- **200** doublon
- **422** texte non reconnu

`ai-scan` peut durer longtemps (timeout Android read 45s). L’UI web a un `AbortSignal`.

---

## Récurrences (Premium)

| Méthode | Path |
|---|---|
| GET | `/recurring?status=suggested` ou `active` |
| POST | `/recurring` |
| POST | `/recurring/:id/accept` |
| POST | `/recurring/:id/dismiss` |
| POST | `/recurring/:id/run` | Exécute maintenant → `{ transaction, recurring }` |
| DELETE | `/recurring/:id` |

```ts
{
  _id, type, amount, wallet_id, category_id?, description,
  frequency: 'weekly' | 'monthly',
  day_of_month?, next_run_date, active,
  status?: 'suggested' | 'active' | 'dismissed',
  source?: 'user' | 'ai'
}
```

Suggestions IA (`status: suggested`) vs règles actives.

---

## Export (Premium)

Réponse **binaire** (blob), pas JSON envelope.

| Méthode | Path |
|---|---|
| GET | `/export/transactions?format=csv\|pdf\|xlsx` |
| GET | `/export/transactions/:id?format=csv\|pdf\|xlsx` |

Header : `Authorization: Bearer` uniquement (pas forcément Content-Type JSON).

---

## Admin (role === `admin`)

| Méthode | Path |
|---|---|
| GET | `/admin/users` |
| GET | `/admin/users/:id` |
| GET | `/admin/stats/overview` |
| GET | `/admin/stats/daily-active-users?days=14` |

Hors scope migration mobile grand public (garder sur le web).

---

## Santé / setup

| Méthode | Path |
|---|---|
| GET | `/health` | Rewrite présent |
| * | `/cinetpay-setup` | Setup paiement serveur |
| * | `/webhooks/*` | CinetPay → Express |

---

## Client TypeScript de référence à copier

Fichier unique : `note/lib/api.ts`

Objets à porter tels quels dans Expo :

- `walletApi`
- `transactionApi`
- `categoryApi`
- `analyticsApi`
- `subscriptionApi`
- `budgetApi`
- `savingsGoalApi`
- `plannedExpenseApi`
- `pendingTransactionApi`
- `recurringApi`
- `exportApi`
- `authApi` (`me` / `updateMe` / `deleteMe`)

Adapter uniquement `fetchApi` :

1. Base URL = `EXPO_PUBLIC_API_URL` (Railway ou `http://localhost:5000/api`)
2. Token = SecureStore
3. Pas de credentials cookies
4. Gérer `SESSION_REVOKED` → logout local
5. `POST /auth/logout` **avec Bearer** avant d’effacer le token (révocation `tokenVersion`)

Fichiers backend à ouvrir en parallèle : `backend/src/routes/*.ts`.
