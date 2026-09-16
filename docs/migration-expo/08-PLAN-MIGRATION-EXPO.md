# 08 — Plan de migration Expo (backend inchangé)

Cible : repo `C:\realProject\mes-poches-mobile` (starter Expo Router déjà là).

## Règle d’or

1. **Aucun nouveau endpoint Express.** Réutiliser le catalogue `03-API-BACKEND.md`.
2. **Auth mobile = JWT Bearer dans SecureStore**, pas les cookies Next.
3. **Parité écran par écran** via `05-PAGES-ET-ECRANS.md`.
4. Les pages marketing / admin / PWA restent sur le site `mespoches.store`.

## Variables d’environnement Expo

```
EXPO_PUBLIC_API_URL=https://mespochesbackend-production-9bfe.up.railway.app/api
EXPO_PUBLIC_WEB_URL=https://www.mespoches.store
EXPO_PUBLIC_PRIVACY_URL=https://www.mespoches.store/legal/privacy
EXPO_PUBLIC_PAYMENTS_ENABLED=false
```

Dev :

```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

Android emulator : `http://10.0.2.2:5000/api`.

## Étape 0 — Vérifier le contrat Express (1/2 journée)

Le code est dans `note/backend/`. En local : `cd backend && npm run dev` (port 5000).

Depuis un client HTTP :

1. `POST /api/auth/register` → **pas de token**, `needsVerification`
2. `POST /api/auth/verify-email` → `data.token`
3. `GET /api/auth/me` avec Bearer
4. `GET /api/wallets`, `GET /api/transactions?limit=5`
5. Confirmer CORS : sans header Origin (app native) c’est **déjà autorisé** dans `server.ts`

**Aucun changement backend n’est requis pour Expo** si on utilise Bearer.

Si login depuis Expo Go web (`Origin: http://localhost:8081`) est refusé en prod : ajouter cette origine à `CORS_ORIGIN` **uniquement en dev**, pas en production.

## Étape 1 — Socle client (Lot A)

Dans `mes-poches-mobile` :

```
src/lib/api-client.ts     # fetch + Bearer + ApiResponse
src/lib/api.ts            # copier objets walletApi, etc.
src/lib/auth.ts           # login/register/verify vers Express
src/lib/secure-token.ts   # expo-secure-store
src/contexts/auth.tsx
src/contexts/subscription.tsx
src/contexts/currency.tsx
```

Dépendances utiles :

- `expo-secure-store`
- `expo-localization`
- `@tanstack/react-query`
- `zod` (optionnel, Joi est côté serveur)
- `date-fns` (déjà connu de l’équipe)

**Ne pas** installer Capacitor.

## Étape 2 — Navigation

Expo Router tabs + stack selon arborescence `05-PAGES-ET-ECRANS.md` section G.

Auth gate dans `app/_layout.tsx` :

- pas de token → `(auth)`
- token mais besoin verify → `verify-email` (cas rare si register renvoie needsVerification)
- token ok → `(tabs)`
- jamais vu onboarding → `onboarding`

## Étape 3 — Écrans Lot A (ordre)

1. Onboarding
2. Login / Register / Verify / Forgot
3. Home (BalanceCard, liste poches, 5 tx, banner pending)
4. Wallets liste / new / détail (sans image d’abord)
5. Categories CRUD (sans image)
6. Transaction new (income/expense, pas transfer)
7. Historique + filtres + détail
8. Pending validate/reject (saisie manuelle : on peut créer via new puis plus tard SMS)
9. Settings + Profile + logout + devise
10. About + liens légaux WebBrowser

À chaque écran : coller les **mêmes appels API** que la colonne API de `05-PAGES-ET-ECRANS.md`.

## Étape 4 — Lot B Premium

- `PremiumRequiredError` + `requirePremium()` → push `/subscription`
- Transfert
- Objectifs (3 sections)
- Analytics premium
- Export (file-system + share)
- Images UploadThing **ou** skip v1.1
- Limite 10 catégories / 3 mois historique (le **backend** refuse déjà ; l’UI affiche UpgradeBanner)

## Étape 5 — Lot C capture & OAuth

- `expo-image-picker` → compress → `ai-scan`
- Speech → `voice-note`
- Google : `expo-auth-session` + `/auth/google/exchange` **ou** browser vers le site existant
- Paiement : WebBrowser CinetPay + deep link verify

Scheme app actuel Android Capacitor : `com.mespoches.app`. Pour Expo, définir un scheme `mespoches` cohérent avec les redirect Google déjà enregistrés. **Attention :** changer le redirect Google OAuth implique la console Google, pas Express. Préférer réutiliser le redirect **web** `https://www.mespoches.store/api/auth/google/callback` (flux BFF) pour ne rien casser.

## Étape 6 — Lot D SMS (Android development build)

Le Java existant est déjà un client HTTP correct (`PendingApiPoster`). Options :

**D1 — Config plugin Expo** qui compile les classes `com.mespoches.app.*` (SmsReceiver, MoneyNotificationListener, PendingApiPoster, SmsMonitorPlugin) et expose un module JS `SmsMonitor.storeAuthToken`. C’est le chemin le plus fidèle, le backend ne bouge pas.

**D2 — Réécrire en Kotlin** un Expo Module avec le même contrat POST.

Expo Go **ne suffira pas** (permissions SMS + NotificationListener).

iOS : documenter clairement l’absence d’import SMS ; scan + voix + saisie.

## Mapping Capacitor → Expo

| Capacitor actuel | Expo |
|---|---|
| `@capacitor/camera` | `expo-image-picker` / `expo-camera` |
| `@capacitor-community/speech-recognition` | `expo-speech-recognition` |
| `@capacitor/local-notifications` | `expo-notifications` |
| `@capacitor/browser` | `expo-web-browser` / `expo-auth-session` |
| `@capacitor/share` + filesystem | `expo-sharing` + `expo-file-system` |
| `@capacitor/splash-screen` | `expo-splash-screen` |
| `@capacitor/status-bar` | `expo-status-bar` |
| Plugin Java `SmsMonitor` | Expo native module / config plugin |
| WebView `server.url` | **supprimé** (app native) |

## Ce qu’il ne faut PAS recopier

- `app/api/**` Next BFF (sauf si on s’en sert comme proxy OAuth web)
- `middleware.ts`
- `next-pwa`, Dexie (v1)
- `lib/mongodb.ts`, `lib/models/*` côté Next (les vrais modèles sont `backend/src/models/`)
- Pages `/premium/*` (redirects morts)
- Dashboard admin
- `js-cookie` pour le JWT

## Tests de recette (parité)

Compte de test sur le **même** Mongo/Railway que la prod/staging.

1. Inscription → mail code → home + coach poche
2. Créer poche « Cash » solde 10 000
3. Dépense 2 000 catégorie Transport → solde 8 000
4. Revenu 5 000 → 13 000
5. Historique filtre mois
6. Dépense date J+3 → apparaît en prévue, pas dans le solde
7. Pending : poster manuellement `parse-sms` avec un vrai texte Orange/MTN de test → valider
8. Compte free : 11e catégorie → `PREMIUM_REQUIRED`
9. Transfert en free → `PREMIUM_REQUIRED`
10. Login Google (Lot C)
11. Export (Lot B)
12. Kill app, relance → session SecureStore encore là (tant que JWT < 12 h)

## Risques

| Risque | Mitigation |
|---|---|
| CORS Railway | App native sans Origin déjà OK ; tester Expo Go web |
| JWT 12 h (ou `JWT_EXPIRES_IN`) | Pas de refresh token — relogin. `tokenVersion` révoque au logout |
| Register sans JWT | Enchaîner verify-email avant d’entrer dans l’app |
| Populate `wallet_id` objet vs string | Copier helpers filterTransactions |
| Dates UTC vs locale | Copier `plannedExpenseDates.ts` |
| OAuth redirect mismatch | Réutiliser le BFF web |
| UploadThing cookie-only | Skip images v1 ou endpoint token Bearer (serait un changement Next, pas Express) |
| SMS Play Store policy | Déjà géré dans note (`SECURITE_SMS.md`) — reprendre les justifications |

## Ordre des fichiers à ouvrir pendant le code

1. `lib/api.ts`
2. `app/<page>/page.tsx` de l’écran en cours
3. Ce dossier, fichier 05 (API de l’écran) + 03 (contrat)
4. Composants listés dans `09-COMPOSANTS-HOOKS-ETAT.md`
