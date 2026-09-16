# 05 — Pages et écrans (cartographie complète)

Source : `app/**/page.tsx`. Layout commun authentifié : `PageShell` (bottom nav + pull-to-refresh + offline banner).

Colonne **Expo Router** = fichier recommandé dans `mes-poches-mobile/src/app/`.

Légende auth : **Publique** / **Privée** (JWT + email vérifié) / **Admin**.

---

## A. Navigation globale

### Bottom nav (`components/BottomNav.tsx`) — privée

| Tab | Route actuelle | Expo |
|---|---|---|
| Accueil | `/` | `app/(tabs)/index.tsx` |
| Historique | `/transactions` | `app/(tabs)/transactions/index.tsx` |
| Objectifs (Pro) | `/objectifs` | `app/(tabs)/objectifs.tsx` |
| FAB + | sheet 3 choix | modal / action sheet |
| Poches | `/wallets` | `app/(tabs)/wallets/index.tsx` |
| Catégories | `/categories` | `app/(tabs)/categories.tsx` |
| Analyse | `/analytics` | `app/(tabs)/analytics.tsx` |

FAB sheet :

| Action | Comportement | Premium ? |
|---|---|---|
| Texte | → `/transactions/new` | non |
| Image | `startScan()` ReceiptScanContext | oui |
| Audio | `VoiceNoteOverlay` | oui |

Objectifs affiche un badge **Pro** si `showProBadge`.

### Header

- Accueil : `HomeHeader` (logo, nom, accès settings)
- Autres : `Header` titre + back optionnel + action droite
- Settings : icône depuis le header accueil (`HeaderActions`)

### Guard

Web : `middleware.ts`.  
Expo : layout `(auth)` vs `(tabs)` + splash qui lit SecureStore.

---

## B. Parcours non authentifié

### 1. Onboarding — `/onboarding` — Publique

Fichier : `app/onboarding/page.tsx`

- 4 slides Framer Motion (finances / mouvements auto / analytics / 1 mois Premium offert)
- `setOnboardingSeen()` puis → `/login`
- Aucun appel API

Expo : `app/onboarding.tsx` (PagerView).

### 2. Login / Inscription — `/login` — Publique

Fichier : `app/login/page.tsx`

UI :

- Logo
- Bouton **Continuer avec Google**
- Toggle email/password (login vs register)
- Register : nom, email (check availability), password, confirm
- Query `?error=` codes Google (`google_config`, `google_denied`, `google_token`, `google_session`, `google_state`, `google_nonce`, `google_failed`, `access_denied`)

API :

- `POST /api/auth/login` ou `register`
- `GET /auth/check-availability`
- Google : `{origin}/api/auth/google` (+ `?mobile=1&client_nonce=` si Capacitor)

Succès login → `/`.  
Register needsVerification → `/verify-email`.  
`EMAIL_NOT_VERIFIED` → `redirectToVerification`.

Expo : `app/(auth)/login.tsx`.

### 3. Vérification email — `/verify-email` — Publique

- Input code 6 chiffres
- `verifyEmail` / `resendVerificationCode` (cooldown)
- Succès → `startSetupGuide()` + `/`

### 4. Mot de passe oublié — `/forgot-password` — Publique

Étapes : email → code + nouveau mot de passe.

- `forgotPassword` / `resetPassword`
- Succès reset → session ouverte → `/`

### 5. OAuth Google retour mobile — `/auth/google/mobile-return` — Publique

Client `GoogleMobileReturnClient.tsx` : `POST /api/auth/google/mobile-complete` `{ code, clientNonce }` puis `/auth/complete`.

### 6. Finalisation session OAuth — `/auth/complete` — cookies déjà posés

- `hydrateAuthSession`
- `authApi.me()`
- `walletApi.getAll()` → si 0 poche : `startSetupGuide()`
- sync token SMS Android
- redirect `/`

Expo : après AuthSession, écrire le token puis même logique `me` + setup guide.

---

## C. Parcours authentifié — métier

### 7. Accueil — `/` — Privée

Fichier : `app/page.tsx`

UI :

- `BalanceCard` : solde total, épargne (Premium), revenus/dépenses du mois
- `PendingTransactionsBanner` si count > 0 → `/pending`
- `TrialBanner` si essai
- Liste « Mes poches » (cartes, lien tout → `/wallets`)
- Budgets / Objectifs (composants, Premium)
- 5 dernières transactions

API parallèle :

```
walletApi.getAll()
walletApi.getTotalBalance()
transactionApi.getAll({ limit: 40 })
analyticsApi.getCurrentMonth()
budgetApi.getAll(year, month)          // si Premium
savingsGoalApi.getAll()                // si Premium
pendingTransactionApi.getCount()       // banner
```

Cache : `CACHE_KEYS.home`. Pull-to-refresh.

Coach setup (`SetupCoach`) : après inscription, guide vers création 1ère poche puis 1ère catégorie.

### 8. Historique — `/transactions` — Privée

- Filtres : recherche, type, poche, catégorie, mois (`TransactionHistoryFilters`)
- Groupement par jour (accordéons)
- Section dépenses prévues `status=scheduled` + édition / annulation
- Free : bandeau historique limité 3 mois (`UpgradeBanner`, `PLAN_LIMITS.FREE_HISTORY_MONTHS`)

API :

```
transactionApi.getAll({ limit: 200 })
walletApi.getAll()
categoryApi.getAll()
plannedExpenseApi.getAll({ status: 'scheduled' })
plannedExpenseApi.cancel(id)
plannedExpenseApi.update via EditPlannedExpenseModal
authApi.updateMe({ hidePlannedExpensesHelp }) via PlannedExpensesInfoModal
```

### 9. Nouvelle transaction — `/transactions/new?type=income|expense` — Privée

Formulaire :

- Type : dépense / revenu / transfert
- Lignes multiples (sauf transfert et « vers épargne »)
- Poche source, poche dest (transfert), catégorie
- Date (future = dépense prévue)
- Toggle « vers objectif d’épargne » (Premium, income/transfer)
- Modal info dépenses prévues

API :

```
walletApi.getAll()
categoryApi.getAll(type)
savingsGoalApi.getAll()                 // Premium
transactionApi.createIncome | createExpense | createTransfer
plannedExpenseApi.create                // si date future dépense
```

Transfert = Premium (`PREMIUM_REQUIRED` si free).

### 10. Détail transaction — `/transactions/[id]` — Privée

- Affichage type, montants, soldes before/after, lignes, paire de transfert
- Édition (description, amount, wallet, category, date, line_items)
- Suppression (confirm)
- Export unitaire Premium (`exportApi.downloadTransaction`)

API :

```
transactionApi.getById
transactionApi.getTransferPair          // si transfer
walletApi.getAll
categoryApi.getAll(type)
transactionApi.update
transactionApi.delete
```

### 11. Poches liste — `/wallets` — Privée

```
walletApi.getAll()
```

Empty state + bouton créer. Lien détail `/wallets/[id]`. Header + → `/wallets/new`.

### 12. Nouvelle poche — `/wallets/new` — Privée

Champs : icône UploadThing (Premium), nom, solde actuel (`initial_balance`).

```
walletApi.create({ name, image_url, initial_balance })
```

Si setup guide actif → après création `setSetupStep('nav-categories')` puis `/`.

### 13. Détail poche — `/wallets/[id]` — Privée

- Hero solde + revenus/dépenses mois
- Édition nom / image
- Historique groupé + dépenses prévues de cette poche
- Suppression poche (confirm)

API :

```
walletApi.getHistory(id)
walletApi.update
walletApi.delete
plannedExpenseApi.cancel / update
```

### 14. Catégories — `/categories` — Privée

- Liste income / expense
- CRUD inline (form nom, type, image Premium)
- Limite 10/type en free
- Mode setup `?setup=1`

```
categoryApi.getAll / create / update / delete
```

### 15. Analyse — `/analytics` — Privée

**Free :** uniquement `analyticsApi.getCurrentMonth()` (totaux).

**Premium :** sélecteur de mois (depuis `user.created_at`) +

```
analyticsApi.getMonth(y, m)
analyticsApi.getMonthComparison(y, m)
analyticsApi.getExpensesByCategory(start, end)
analyticsApi.getIncomesByCategory(start, end)
```

UI : totaux, deltas %, barres par catégorie. `ProFeature` wrappe le reste.

### 16. Objectifs — `/objectifs` — Privée (contenu Premium)

Trois sections :

1. `BudgetsSection` — CRUD budgets mois courant, catégories expense
2. `SavingsGoalsSection` — CRUD objectifs
3. `RecurringSection` — actives + suggestions IA, accept / dismiss / run

API : `budgetApi`, `categoryApi.getAll('expense')`, `savingsGoalApi`, `recurringApi`.

Si non Premium : UI teaser + `requirePremium()`.

### 17. File d’attente validation — `/pending` — Privée

Liste des pending `status=pending`.

Par item : source (SMS / Notif / Ticket / Audio / Manuel), opérateur, montant, confiance, lignes IA, édition, **Valider** / **Rejeter**.

API :

```
pendingTransactionApi.getAll('pending')
walletApi.getAll()
categoryApi.getAll()
pendingTransactionApi.update
pendingTransactionApi.validate → crée la vraie transaction
pendingTransactionApi.reject
```

Pas dans la bottom nav : accès via bannière accueil (et notif Android).

---

## D. Compte, payant, légal

### 18. Paramètres — `/settings` — Privée

- Sélecteur devise → `authApi.updateMe({ currency })` via CurrencyContext
- Bloc automatisation SMS (`SmsPermissionSettings`) — Android
- Menu : Premium / Export tout (modal CSV PDF XLSX) / Profil / À propos
- Liens légaux
- Déconnexion (`logout`)
- Lien télécharger APK / Play (web)

```
exportApi.downloadTransactions(format)
```

### 19. Profil — `/profile` — Privée

```
authApi.me()
authApi.deleteMe()   // danger confirm
```

Affiche plan, essai restant, date d’inscription. Lien abonnement.

### 20. Abonnement — `/subscription` — Privée

```
subscriptionApi.getPlans()
```

Liste avantages Premium, prix 2500 / 24000 XAF. Si paiement désactivé : toast « À venir ». Sinon → `/subscription/payment?period=monthly|yearly`.

### 21. Paiement — `/subscription/payment` — Privée

Choix méthode `all | orange | mtn`.

```
subscriptionApi.getPlans()
subscriptionApi.createCheckout(period, method) → paymentUrl
```

### 22. Succès paiement — `/subscription/payment/success` — Privée

```
subscriptionApi.verifyPayment(transactionId)
```

### 23. À propos — `/about` — Privée

Statique (PWA, sécu, free, premium). Pas d’API.

### 24. Admin — `/admin` — Admin

```
authApi.me()                    // role check
adminApi.getOverviewStats()
adminApi.getUsers()
adminApi.getDailyActiveUsers(14)
adminApi.getUserById(id)
```

**Ne pas porter en v1 mobile.**

---

## E. Pages hors app (rester sur le web)

| Route | Rôle | Expo |
|---|---|---|
| `/download` | Landing marketing + APK | Lien WebBrowser |
| `/legal` | Index légal | Lien site |
| `/legal/privacy` | Confidentialité | Lien site |
| `/legal/terms` | CGU | Lien site |
| `/legal/mentions` | Mentions | Lien site |
| `/premium` | redirect `/settings` | ignorer |
| `/premium/budgets` | redirect `/categories` | ignorer |
| `/premium/goals` | redirect `/wallets` | ignorer |
| `/premium/recurring` | redirect `/transactions` | ignorer |
| `/premium/export` | redirect `/settings` | ignorer |

---

## F. Overlays / non-routes (à créer comme modales Expo)

| Composant | Déclencheur |
|---|---|
| `VoiceNoteOverlay` | FAB Audio |
| `ReceiptSourceSheet` + `ReceiptScanOverlay` | FAB Image |
| `SelectModal` | selects poches/catégories |
| `ConfirmModal` | delete / logout |
| `MonthPickerModal` | analytics |
| `ExportAllModal` | settings |
| `EditPlannedExpenseModal` | historique / poche |
| `PlannedExpensesInfoModal` | 1ère dépense future |
| `SetupCoach` | 1er lancement compte vide |

---

## G. Arborescence Expo Router proposée

```
app/
  _layout.tsx                 # fonts, query client, providers
  index.tsx                   # splash → onboarding | login | tabs
  onboarding.tsx
  (auth)/
    _layout.tsx
    login.tsx
    verify-email.tsx
    forgot-password.tsx
  (tabs)/
    _layout.tsx               # 6 tabs + FAB
    index.tsx                 # accueil
    transactions/index.tsx
    transactions/new.tsx
    transactions/[id].tsx
    objectifs.tsx
    wallets/index.tsx
    wallets/new.tsx
    wallets/[id].tsx
    categories.tsx
    analytics.tsx
  pending.tsx
  settings.tsx
  profile.tsx
  subscription/index.tsx
  subscription/payment.tsx
  subscription/success.tsx
  about.tsx
```
