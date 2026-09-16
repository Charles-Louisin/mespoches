# 06 — Fonctionnalités implémentées

Inventaire produit. Chaque item indique le plan, les écrans, les APIs, et la priorité Expo (`P0` = indispensable v1, `P1` = v1.1, `P2` = plus tard / natif lourd).

---

## 1. Compte et sécurité — P0

| Fonction | Détail | Plan |
|---|---|---|
| Inscription email | nom + email unique + password ≥ 10 | tous |
| Vérification email | code 6 chiffres, resend cooldown 60s | tous |
| Login email | | tous |
| Mot de passe oublié | code email + reset + auto-login | tous |
| Google OAuth | web + flux mobile Capacitor (nonce + handoff) | tous |
| Session JWT 12 h | Bearer | tous |
| Logout | clear token (+ clear plugin SMS) | tous |
| Suppression compte | `DELETE /auth/me` irréversible | tous |
| Rate limit login | 20 / 15 min (BFF Next) | web |
| Onboarding 4 slides | local, pas d’API | tous |
| Coach 1ère poche / catégorie | `setupGuide` localStorage | tous |

---

## 2. Multi-poches — P0

- Créer / renommer / supprimer une poche
- Solde courant, solde initial à la création
- Totaux globaux `total-balance` (dont `totalSavings` Premium)
- Image / icône (UploadThing) — **Premium**
- Historique par poche + dépenses prévues liées
- Devise affichée au niveau **utilisateur** (pas par poche dans l’UI actuelle, champ `Wallet.currency` existe en base, défaut XAF)

Devises UI : XAF, XOF, EURO, DOLLARS — détection locale à la 1ère visite.

---

## 3. Transactions — P0

| Type | Effet | Plan |
|---|---|---|
| Revenu | + solde poche | tous |
| Dépense | − solde (refus si insuffisant) | tous |
| Transfert poche → poche | débit + crédit liés | **Premium** |
| Transfert / revenu → objectif épargne | `savings_goal_id` | **Premium** |
| Lignes (`line_items`) | détail ticket (qty, unit) | tous |
| Date future dépense | crée `planned-expense` au lieu de tx | tous |
| Édition / suppression | recalcul soldes côté serveur | tous |
| Filtres historique | q, type, poche, catégorie, mois | tous |
| Historique > 3 mois | | **Premium** |

---

## 4. Catégories — P0

- CRUD income / expense
- Image Premium
- Max 10 par type en free
- Utilisées dans tx, budgets, pending, analytics

---

## 5. Dépenses prévues — P0

- Planification date future
- Liste (historique + détail poche)
- Édition / annulation
- Exécution auto backend (solde insuffisant → `cancelled_reason`)
- Modal d’aide masquable (`hidePlannedExpensesHelp`)

---

## 6. File de validation (pending) — P0 (manuel) / P2 (SMS auto)

Sources :

| Source | Comment ça arrive | Plan |
|---|---|---|
| Manuel | (peu utilisé) | tous |
| SMS | BroadcastReceiver Android → `parse-sms` | tous (natif) |
| Notification | NotificationListener Orange/MTN → `parse-notification` | tous (natif) |
| Scan reçu IA | caméra → `ai-scan` | **Premium** |
| Voix | STT → `voice-note` | **Premium** |

L’utilisateur corrige montant / poche / catégorie / lignes puis **valide** (crée la tx) ou **rejette**.

Habitudes : `GET /pending-transactions/habits/summary` (utilisé côté serveur pour suggestions ; peu exposé UI).

Bannière accueil + notif locale Android « Transaction prête ».

---

## 7. Analytics — P0 (mois courant) / P1 (premium)

- Free : totaux mois en cours (accueil + écran analyse)
- Premium : n’importe quel mois depuis l’inscription, comparaison mois N vs N-1, répartition dépenses et revenus par catégorie

---

## 8. Budgets mensuels — P1

Premium. Par catégorie de dépense, mois donné. Affiche `spent` et `percent`. CRUD. Accueil + page Objectifs.

---

## 9. Objectifs d’épargne — P1

Premium. Titre, cible, deadline, progression. Alimentation via revenu ou transfert marqué `savings_goal_id`. Total épargne dans `getTotalBalance().totalSavings`.

---

## 10. Récurrences — P1

Premium.

- Suggestions IA (`status: suggested`) : accepter / ignorer
- Règles actives weekly / monthly, `day_of_month`, `next_run_date`
- Bouton **Exécuter maintenant** (`/run`)
- Cron d’exécution côté backend

---

## 11. Export — P1

Premium. CSV / PDF / XLSX :

- Toutes les transactions
- Une transaction (détail)

Téléchargement blob + `downloadBlob` (web) / Share + Filesystem (natif actuel).

Expo : `expo-file-system` + `expo-sharing`.

---

## 12. Abonnement Premium — P1

- Essai 1 mois (`TRIAL_MONTHS`) après vérif email, `premiumSource: 'trial'`
- Plans 2500 XAF / mois, 24000 / an (−20 %)
- Checkout CinetPay Orange / MTN / all
- Verify après retour
- Paiement **feature-flagué** (désactivé en prod web aujourd’hui)
- Admin = Premium automatique
- `TrialBanner` jours restants

---

## 13. UX / qualité — P0 partiel

| Fonction | Détail | Expo |
|---|---|---|
| Pull-to-refresh | PageShell | `RefreshControl` |
| Toasts | Sonner | toast RN |
| Empty states | | oui |
| Confirm modals | logout, delete | oui |
| Offline banner | `OfflineIndicator` | NetInfo |
| Sync IndexedDB | Dexie | P2 |
| PWA install | `usePwaInstall` | N/A |
| Animations | Framer Motion | Reanimated léger |
| Dark mode | **non implémenté** | optionnel |
| i18n | **français only** | garder FR v1 |

---

## 14. Natives Android actuelles (Capacitor) — P2 sauf caméra P1

| Capacité | Plugin / Java | Expo |
|---|---|---|
| Caméra / galerie scan | `@capacitor/camera` | `expo-image-picker` P1 |
| Speech-to-text | `@capacitor-community/speech-recognition` | `expo-speech-recognition` P1 |
| SMS incoming | `SmsReceiver.java` RECEIVE_SMS | module natif custom P2 |
| Notification listener MM | `MoneyNotificationListener.java` | module natif custom P2 |
| Token vers Java | `SmsMonitorPlugin` | idem P2 |
| Notif locale rappel 20h | `@capacitor/local-notifications` | `expo-notifications` P1 |
| Share / filesystem export | `@capacitor/share` + filesystem | `expo-sharing` P1 |
| Browser OAuth / paiement | `@capacitor/browser` | `expo-web-browser` P0/P1 |
| Splash / status bar | Capacitor | `expo-splash-screen` P0 |
| BootReceiver | relance lecture SMS | P2 |

Permissions demandées au launch : SMS + accès notifications système (`NativePermissionsOnLaunch`, `SmsPermissionExplainer`, settings).

---

## 15. Admin — hors mobile v1

Stats utilisateurs, DAU 14 jours, détail user (wallets + tx). Web only.

---

## 16. Légal / marketing — hors app native

Pages `/download`, `/legal/*`. L’app Expo peut ouvrir le site. Play Store exige souvent un lien confidentialité : pointer `https://www.mespoches.store/legal/privacy`.

---

## Matrice de priorité migration

### Lot A — MVP (parité cœur)

Auth email + session JWT, onboarding, home, poches CRUD, catégories CRUD, transactions income/expense + détail, historique + filtres, pending validation manuelle, settings (devise, logout, profil), about.

### Lot B — Premium UI

Transferts, budgets, épargne, récurrences, analytics avancés, export, gate Premium, écran abonnement (même si paiement « à venir »).

### Lot C — Capture riche

Caméra scan IA, note vocale, Google OAuth, paiement CinetPay in-app browser.

### Lot D — Automatisation Android

Port du Java SMS / NotificationListener (ou config plugin), notifs « transaction prête », permissions explainer.
