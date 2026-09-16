# 07 — Modèles de données et types

Les modèles Mongoose **réels** sont dans `note/backend/src/models/`.  
`note/lib/models/` est une copie partielle / obsolète (frontend). Porter les types de `lib/api.ts` **et** croiser avec `backend/src/models/`.

---

## User / MeUser

```ts
interface MeUser {
  id: string
  email: string
  name?: string
  role?: 'user' | 'admin'
  plan?: 'free' | 'premium'
  premiumUntil?: string | null
  premiumSource?: 'trial' | 'paid' | null
  isPremium?: boolean
  isOnTrial?: boolean
  currency?: 'XAF' | 'XOF' | 'EURO' | 'DOLLARS'
  hidePlannedExpensesHelp?: boolean
  created_at: string
  lastLoginAt?: string | null
  emailVerified?: boolean  // présent sur User auth, pas toujours sur MeUser
}
```

Source : `backend/src/models/User.ts` + `backend/src/utils/userPayload.ts` (`toPublicUser`).

Champs internes (non exposés au client) : `googleId`, `authProvider` (`email` | `google` | `both`), `tokenVersion`, `loginHistory` (20 max), codes OTP hashés (`select: false`).

Helpers `backend/src/utils/subscription.ts` (et miroir frontend `lib/subscription.ts`) :

- `isPremiumUser` : admin **ou** `isPremium` **ou** `plan==='premium'` avec date valide
- `isOnTrial` : `isOnTrial===true` ou `premiumSource==='trial'` et encore premium
- `getTrialDaysLeft` : ceil jours restants, min 1 si encore actif

---

## Wallet

```ts
interface Wallet {
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

Mongo (copie locale) : `user_id`, solde ≥ 0, index `{ user_id, created_at }`.

Populate fréquent : les transactions embarquent `wallet_id` comme objet Wallet.

---

## Category

```ts
interface Category {
  _id: string
  name: string
  type: 'income' | 'expense'
  image_url?: string | null
  created_at: string
}
```

Index `{ user_id, type }`.

---

## Transaction

```ts
interface Transaction {
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
  updatedAt?: string
}

interface TransactionLineItem {
  description: string
  amount: number
  quantity?: number
  unit_amount?: number
  type?: 'income' | 'expense'
}
```

Toujours `sanitizeLineItems()` avant PUT/POST (strip `_id`).

Montant min modèle local : 0.01.

Helpers `lib/utils.ts` : `sortTransactionsByDateDesc`, `groupTransactionsByDate`, `formatDate`, `formatCurrency`, `getTransactionTypeLabel`.

`lib/normalizeData.ts` : normalise `wallet_id` objet → id pour Dexie.

---

## PlannedExpense

```ts
interface PlannedExpense {
  _id: string
  wallet_id: Wallet | string
  category_id?: Category | string | null
  amount: number
  description: string
  scheduled_date: string
  status: 'scheduled' | 'executed' | 'cancelled'
  cancelled_reason?: 'user' | 'insufficient_balance' | null
  executed_transaction_id?: string | null
  created_at: string
}
```

Dates : `lib/plannedExpenseDates.ts` (`isFutureUtcDay`, `getTodayUtcDateInputValue`) — **comparer en UTC jour**, pas timezone locale seule.

---

## PendingTransaction

```ts
interface PendingTransaction {
  _id: string
  status: 'pending' | 'validated' | 'rejected'
  source: 'sms' | 'notification' | 'ai_scan' | 'manual' | 'voice'
  source_type?: 'image' | 'parser' | 'ai' | 'sms' | 'manual' | 'voice'
  document_type?: string
  type: 'income' | 'expense'
  amount: number
  operator: 'orange' | 'mtn' | 'unknown'
  counterparty: string
  description: string
  date: string
  raw_text: string
  wallet_id?: Wallet | string | null
  category_id?: Category | string | null
  confidence: number
  pattern?: 'transfer_out' | 'transfer_in' | 'payment' | 'withdrawal' | 'unknown'
  transaction_id?: string
  ai_enriched?: boolean
  low_confidence_warning?: string
  ai_items?: TransactionLineItem[]
  validated_transaction_id?: string | null
  created_at: string
}
```

---

## Budget / SavingsGoal / Recurring

Voir `03-API-BACKEND.md`. IDs Mongo `_id`.

Recurring `frequency`: `weekly` | `monthly`.  
`status`: `suggested` | `active` | `dismissed`.  
`source`: `user` | `ai`.

---

## Analytics

```ts
interface MonthStats {
  month: number  // 1-12
  year: number
  totalIncome: number
  totalExpense: number
  balance: number
  incomeCount: number
  expenseCount: number
}

interface MonthComparison {
  selected: MonthStats
  previous: MonthStats
  delta: { totalIncome: number; totalExpense: number; balance: number; incomeCount: number; expenseCount: number }
  percent: { totalIncome: number | null; totalExpense: number | null; balance: number | null }
}

interface CategoryStat {
  category: string
  total: number
  count: number
}
```

---

## Subscription plans (frontend constants)

`lib/planLimits.ts` — dupliquer dans Expo :

```ts
PLAN_LIMITS = {
  FREE_MAX_CATEGORIES_PER_TYPE: 10,
  FREE_HISTORY_MONTHS: 3,
}
TRIAL_MONTHS = 1
PREMIUM_REQUIRED_CODE = 'PREMIUM_REQUIRED'
SUBSCRIPTION_PLANS = {
  monthly: { id: 'monthly', label: 'Mensuel', priceXaf: 2500, periodLabel: '/ mois' },
  yearly:  { id: 'yearly', label: 'Annuel', priceXaf: 24000, periodLabel: '/ an', savingsLabel: 'Économisez 20 %' },
}
```

---

## Admin types

`AdminUserSummary`, `AdminUserDetail`, `AdminOverviewStats`, `DailyActiveUsersStat` — voir `lib/api.ts`. Inutile en app grand public.

---

## IDs et populate — piège migration

Beaucoup de champs sont `T | string` :

```ts
typeof t.wallet_id === 'object' ? t.wallet_id._id : String(t.wallet_id)
```

Helpers déjà écrits : `getWalletId`, `getCategoryId`, `getWalletName`, `getCategoryName` dans `lib/filterTransactions.ts`. **Les copier.**

---

## Constantes UI / storage keys à reprendre

| Clé | Valeur |
|---|---|
| User local | `user_data` |
| Onboarding | `onboarding_seen` |
| Setup coach | `mp_setup_guide` |
| Devise | `app_currency` |
| Pending email | `pending_verification_email` (session) |
| Rappel quotidien | `mes_poches_daily_reminder_v2` |
| Last sync | `lastSync` |

---

## Fichiers à copier quasi tels quels (logique pure TS)

Ces fichiers n’ont pas de dépendance React DOM / Next :

- `lib/api.ts` (types + objets api ; adapter fetch)
- `lib/planLimits.ts`
- `lib/subscription.ts` (retirer `window.location` dans `isSubscriptionPaymentEnabled`)
- `lib/currencies.ts` (remplacer `navigator` par `expo-localization`)
- `lib/filterTransactions.ts`
- `lib/plannedExpenseDates.ts`
- `lib/loginValidation.ts`
- `lib/payment-url.ts`
- `lib/normalizeData.ts`
- `lib/utils.ts` (vérifier `formatCurrency` vs CurrencyContext)
- `lib/setupGuide.ts` (remplacer localStorage par AsyncStorage)
