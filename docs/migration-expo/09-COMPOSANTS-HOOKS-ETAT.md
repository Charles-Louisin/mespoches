# 09 — Composants, hooks, contexts, état

À recréer en React Native. Ne pas viser un port 1:1 du JSX Tailwind : viser **le même comportement et les mêmes appels API**.

---

## Contexts (`contexts/`)

| Context | Rôle | Dépendances API | Expo |
|---|---|---|---|
| `SubscriptionContext` | `authApi.me()`, `isPremium`, `isOnTrial`, `requirePremium()`, `handleApiError()` | GET `/auth/me` | **Oui P0** |
| `CurrencyContext` | devise, `formatAmount`, `setCurrency` → PATCH `/auth/me` | PATCH `/auth/me` | **Oui P0** |
| `ReceiptScanContext` | caméra + `aiScan` + overlay | POST `/pending-transactions/ai-scan` | Lot C |

`hooks/useSubscription.ts` réexporte le context.

---

## Hooks

| Hook | Rôle | Expo |
|---|---|---|
| `useCachedData` | cache mémoire + fetch | Remplacer par React Query |
| `useConfirm` | dialog confirm | Modal RN |
| `useOnlineStatus` | `navigator.onLine` | `@react-native-community/netinfo` |
| `usePwaInstall` | beforeinstallprompt | **Skip** |

---

## Layout / chrome

| Composant | Rôle |
|---|---|
| `PageShell` | fond, pb pour nav, PTR, OfflineIndicator, BottomNav |
| `BottomNav` | 6 tabs + FAB + sheet Texte/Image/Audio |
| `Header` | titre, back, action |
| `HomeHeader` | accueil perso |
| `HeaderActions` | cloche / settings |
| `AuthGuard` | wrap admin |
| `Providers` | compose contexts |
| `AppBootLoader` | splash hydratation token |
| `ClientSideInit` | suppress network errors |
| `CapacitorBridge` | status bar / splash native |
| `AutomationBridge` | token SMS + rappel 20h |
| `NativePermissionsOnLaunch` | SMS / notif listener |
| `NetworkErrorBoundary` | catch fetch |
| `SetupCoach` | spotlight 1ère poche / catégorie |

Expo : le chrome = `_layout` tabs + stack headers. Bridges Capacitor → modules Expo.

---

## Design system actuel (à styler en RN)

| Composant | Notes |
|---|---|
| `Button` | primary, loading, fullWidth, sizes |
| `Input` | label, password eye |
| `Select` / `SelectModal` | bottom sheet choix unique — **important** (poches, catégories) |
| `EmptyState` | icon + titre + CTA |
| `LoadingSpinner` / `LoadingBar` | |
| `ConfirmModal` | variants danger / warning |
| `AppLogo` | asset `public/logo.png` |
| `EntityAvatar` | image_url ou initiale |
| `ProBadge` / `ProFeature` / `PremiumGate` | lock Premium |
| `UpgradeBanner` | CTA abonnement |
| `TrialBanner` | jours restants, dismissible |
| `Reveal` | animation apparition |

Couleurs : primaire `#2563EB`, surface claire `#F8FAFC`, nav sombre `nav-surface`. Max width 448 px centrée — en RN c’est full screen phone.

Assets à copier : `note/public/logo.png`, icons PWA, splash Android.

---

## Métier UI

| Composant | Écrans | API |
|---|---|---|
| `BalanceCard` | Home | données parent |
| `WalletCard` | Home, liste poches | — |
| `WalletHeroCard` | Détail poche | — |
| `TransactionItem` | Home, historique, poche | lien `/transactions/[id]` |
| `TransactionHistoryFilters` | Historique | client-side `filterTransactions` |
| `LineItemsCollapse` | Détail tx, pending | — |
| `PlannedExpenseItem` | Historique, poche | cancel |
| `EditPlannedExpenseModal` | | `plannedExpenseApi.update`, wallets, categories |
| `PlannedExpensesInfoModal` | | `authApi.updateMe` |
| `PendingTransactionsBanner` | Home | `getCount` |
| `BudgetsSection` | Home, Objectifs | `budgetApi` + categories expense |
| `SavingsGoalsSection` | Home, Objectifs | `savingsGoalApi` |
| `RecurringSection` | Objectifs | `recurringApi` |
| `MonthPickerModal` | Analytics | — |
| `ExportAllModal` | Settings | `exportApi.downloadTransactions` |
| `TransactionExportActions` / `Buttons` | Détail tx | `downloadTransaction` |
| `ImageUpload` | Poche / catégorie | UploadThing |
| `VoiceNoteOverlay` | FAB | `voiceNote` |
| `ReceiptScanOverlay` + `ReceiptSourceSheet` | FAB | `aiScan` |
| `SmsPermissionSettings` | Settings | plugin natif |
| `SmsPermissionExplainer` | | — |
| `OfflineIndicator` / `SyncIndicator` | global | — |
| `PullToRefresh` | PageShell | — |
| `LegalPageLayout` / `LegalBackLink` | légal web | skip |
| `LandingHomePreview` | `/download` | skip |
| `onboarding/OnboardingPreviews` | onboarding | recréer visuels simples |

---

## Lib utilitaires (copier)

Voir liste dans `07-MODELES-ET-TYPES.md`.

Autres :

| Fichier | Rôle |
|---|---|
| `lib/imageCompress.ts` | compress avant ai-scan |
| `lib/download.ts` | blob → fichier web ; remplacer Share |
| `lib/google-oauth-origin.ts` | origine OAuth web |
| `lib/suppressNetworkErrors.ts` | filtre console |
| `lib/cache.ts` | skip si React Query |

---

## État global recommandé Expo

```
AuthProvider          token, user, login, logout, hydrate
SubscriptionProvider  me, isPremium, requirePremium  (peut fusionner Auth)
CurrencyProvider      currency, formatAmount
QueryClient           toutes les listes
```

Invalidation après mutation : équivalent `invalidateFinancialCaches()` =

```
queryClient.invalidateQueries({ queryKey: ['home'] })
queryClient.invalidateQueries({ queryKey: ['wallets'] })
queryClient.invalidateQueries({ queryKey: ['transactions'] })
queryClient.invalidateQueries({ queryKey: ['categories'] })
queryClient.invalidateQueries({ queryKey: ['analytics'] })
queryClient.invalidateQueries({ queryKey: ['pending'] })
```

---

## Checklist fichier par écran (implémentation)

Pour chaque écran Expo, avant de coder l’UI :

1. Ouvrir la page note correspondante (`app/.../page.tsx`)
2. Lister les `*Api.*` et hooks
3. Recopier la validation (toasts, confirms)
4. Brancher `PremiumRequiredError`
5. Tester contre Railway avec un vrai compte

Le détail API par écran est dans `05-PAGES-ET-ECRANS.md`.
