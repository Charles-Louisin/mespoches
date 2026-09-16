# 02 — Architecture actuelle et architecture cible Expo

## 1. Flux HTTP aujourd’hui (web)

### 1.1 Appels métier (wallets, transactions, etc.)

Le navigateur appelle `GET /api/wallets` (même origine que le site).

Next.js **rewrite** (`next.config.js`) vers :

```
https://mespochesbackend-production-9bfe.up.railway.app/api/wallets
```

Le client (`lib/api.ts`) ajoute :

```
Authorization: Bearer <jwt en mémoire>
Content-Type: application/json
```

Le JWT n’est **pas** dans `document.cookie`. Il est :

1. Posé en cookie **HttpOnly** `auth_token` par les routes Next `/api/auth/login` etc.
2. Lu par `GET /api/auth/token` (same-origin) et stocké en **mémoire JS** (`memoryToken` dans `lib/auth.ts`).

### 1.2 Auth (login, register, verify, Google)

Ces routes **ne sont pas rewrite** vers Express. Next.js les implémente et **proxy** vers Express (`lib/server/verification-email.ts` → `getServerBackendApiUrl()`), puis pose les cookies HttpOnly.

Routes Next (BFF) :

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-code`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`
- `GET  /api/auth/token`
- `GET  /api/auth/google` (redirige vers Google)
- `GET  /api/auth/google/callback`
- `POST /api/auth/google/mobile-complete`

Rewrite Next → Express (auth) :

- `/api/auth/me`
- `/api/auth/check-availability`
- `/api/auth/google/exchange`
- `/api/auth/google/handoff`
- `/api/auth/google/client`

### 1.3 Uploads

`/api/uploadthing` reste sur Next.js (UploadThing). Endpoints :

- `categoryImage` — image max 4 Mo
- `walletImage` — image max 4 Mo

Auth : cookie `auth_token` vérifié avec `JWT_SECRET`.

### 1.4 Prefixes rewrite vers Express

`wallets`, `transactions`, `categories`, `analytics`, `admin`, `budgets`, `savings-goals`, `recurring`, `export`, `subscription`, `webhooks`, `planned-expenses`, `pending-transactions`, `health`, `cinetpay-setup`.

## 2. Flux Android Capacitor actuel

L’APK charge `CAPACITOR_SERVER_URL` (le site Vercel) dans une WebView.

En plus, du Java natif :

1. `SmsReceiver` lit les SMS Mobile Money
2. `MoneyNotificationListener` lit les notifications Orange/MTN
3. `PendingApiPoster` POST **directement** vers Express :

```
POST {apiBase}/pending-transactions/parse-sms
POST {apiBase}/pending-transactions/parse-notification
Header: Authorization: Bearer {token}
```

Le token + `apiUrl` sont injectés par le plugin Capacitor `SmsMonitor.storeAuthToken` depuis le JS (`lib/capacitor/app-notifications.ts`).

**Conséquence Expo :** cette couche Java n’existe pas dans Expo Go. Il faudra un **development build** + **config plugin / module natif** pour RECEIVE_SMS et NotificationListenerService.

## 3. Middleware de routes (web)

`middleware.ts` protège presque toutes les pages.

**Public :** `/legal`, `/login`, `/onboarding`, `/verify-email`, `/forgot-password`, `/auth`, `/download`.

Sinon : JWT cookie valide + email vérifié, sinon redirect `/login` ou `/verify-email`.

Utilisateur connecté + vérifié qui va sur `/login` ou `/onboarding` → redirect `/`.

Sans token sur `/` et sans cookie `onboarding_seen` → `/onboarding`.

## 4. État client

| Mécanisme | Rôle | Migration Expo |
|---|---|---|
| JWT mémoire + cookie HttpOnly | Session | `expo-secure-store` + état React (pas de cookie Next) |
| `localStorage.user_data` | Cache profil | AsyncStorage / SecureStore |
| `localStorage.onboarding_seen` | Onboarding | AsyncStorage |
| `localStorage.mp_setup_guide` | Coach 1ère poche / catégorie | AsyncStorage |
| `localStorage.app_currency` | Devise affichage | AsyncStorage + `PATCH /auth/me` |
| Cache mémoire `lib/cache.ts` | Listes home/tx/wallets | React Query / SWR / Zustand |
| Dexie IndexedDB | Offline wallets/tx/categories | SQLite (`expo-sqlite`) **optionnel** (v1 peut être online-only) |
| Contexts React | Subscription, Currency, ReceiptScan | Recréer |

## 5. Architecture cible Expo (recommandée)

```
mes-poches-mobile/
  src/app/                 # Expo Router (écrans = pages actuelles)
  src/lib/api.ts           # Copier le contrat de note/lib/api.ts
  src/lib/api-client.ts    # fetch + Bearer depuis SecureStore
  src/lib/auth.ts          # login/register DIRECTEMENT vers Express
  src/contexts/            # Subscription, Currency, ReceiptScan
  src/components/          # UI RN
```

### Décision clé : plus de BFF Next pour l’auth mobile

L’app Expo doit appeler **Express directement** :

```
POST https://mespochesbackend-production-9bfe.up.railway.app/api/auth/login
Body: { email, password }
Réponse: { success, data: { user, token } }
```

Puis stocker `token` dans SecureStore. Tous les autres appels : `Authorization: Bearer`.

Les routes Next `/api/auth/login` existent pour poser des cookies web. **L’app mobile n’en a pas besoin** si Express renvoie déjà `data.token` (c’est le cas : le BFF Next extrait `data.data.token` de la réponse Express).

### Google OAuth mobile

Aujourd’hui : WebView / Browser Capacitor → `/api/auth/google?mobile=1&client_nonce=...` → Google → callback Next → deep link `mespoches://` / page `/auth/google/mobile-return` → `POST /api/auth/google/mobile-complete` → cookies → `/auth/complete`.

Pour Expo, deux options :

**A (réutiliser le BFF Next, plus simple)**  
Ouvrir le navigateur système (`expo-web-browser` / `expo-auth-session`) vers `https://www.mespoches.store/api/auth/google?mobile=1&client_nonce=...` et récupérer le handoff code via deep link, puis `POST` Express `/auth/google/handoff` **ou** Next `/api/auth/google/mobile-complete` et récupérer le JWT dans le JSON (il faudra peut-être adapter le BFF pour renvoyer `data.token` au client mobile, aujourd’hui il renvoie seulement `{ redirect: '/auth/complete' }` après cookies).

**B (recommandé pour Expo natif)**  
`expo-auth-session` + Google, puis selon le flux :

- id_token : `POST {API}/auth/google` `{ idToken }` → `{ user, token }`
- code authorization : `POST {API}/auth/google/exchange` `{ code, redirectUri }` → `{ user, token }`
- deep link mobile existant : `POST {API}/auth/google/handoff` `{ code, clientNonce }` → `{ token }`

Payloads exacts : `backend/src/routes/authRoutes.ts`.

### CORS

Le backend (`backend/src/server.ts`) :

- **Pas d’header `Origin`** (cas typique d’une app React Native / Expo) → **autorisé**.
- En production : origines `CORS_ORIGIN` (virgules) + `*.mespoches.store` + `*.vercel.app`.
- `credentials: true`.

**Conséquence Expo :** un `fetch` natif sans Origin devrait déjà passer. Pas besoin de toucher au backend pour CORS. Tester quand même `POST /api/auth/login` depuis l’émulateur.

Ne pas ajouter l’origine `exp://` sauf si le fetch web d’Expo Go envoie un Origin bloqué.

## 6. Ce que Expo n’a pas besoin de porter

| Actuel | Pourquoi skip |
|---|---|
| `next-pwa` / service worker | App native |
| `middleware.ts` | Expo Router guards |
| Rewrites Next | URL Railway directe |
| Capacitor `server.url` WebView | Plus de WebView produit |
| Pages marketing `/download`, `/legal/*` | Optionnelles (liens WebBrowser vers le site) |
| Dashboard `/admin` | Peut rester web-only |
| `lib/mongodb.ts` / `lib/models/*` côté Next | Dead code / unused côté client ; le vrai schéma est sur Express |

## 7. Layout UI actuel à reproduire

- Largeur max **mobile-first** `max-w-md` (environ 448 px), fond `bg-surface`
- **Bottom nav** flottante + FAB central « + » (3 actions : Texte, Image, Audio)
- Header avec back / titre / actions
- Pull-to-refresh
- Toasts (Sonner → `toast` RN ou `sonner-native`)
- Police : Figtree + Fraunces — remplacer par des fonts Expo (`expo-font`)
- Couleur primaire : bleu `#2563EB` / `primary-950`

Tabs bottom (ordre) :

Gauche : Accueil `/` · Historique `/transactions` · Objectifs `/objectifs` (badge Pro)  
Droite : Poches `/wallets` · Catég. `/categories` · Analyse `/analytics`  
Centre FAB : nouvelle transaction
