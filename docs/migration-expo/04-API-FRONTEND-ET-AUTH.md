# 04 — API frontend actuelle, auth, uploads, natif

Ce fichier décrit **comment le frontend note parle au backend**, pour ne pas recopier les mauvaises abstractions (cookies Next) dans Expo.

## 1. Client unique `lib/api.ts`

### `fetchApi<T>(endpoint, options)`

1. `getToken()` — si absent → throw `Session expirée. Reconnectez-vous.`
2. `fetch(API_URL + endpoint)` avec JSON + Bearer
3. Si Content-Type ≠ JSON :
   - 413 → image trop volumineuse
   - 404 → Route API introuvable
   - sinon Erreur serveur (status)
4. Parse `ApiResponse<T>`
5. Si `!ok || !success` :
   - `code === PREMIUM_REQUIRED` → `PremiumRequiredError`
   - sinon `Error(message)`
6. Return `data`

### `fetchApiBlob` — exports fichiers

Même Bearer, retourne `Blob`. Gère aussi `PremiumRequiredError`.

### URL `getClientApiUrl()` (`lib/api-config.ts`)

| Contexte | URL |
|---|---|
| Host prod `mespoches.store` / `*.vercel.app` | `/api` (rewrite Vercel → Railway, évite CORS) |
| `NEXT_PUBLIC_API_URL` défini | cette valeur |
| Dev | `/api` |

**Expo ne doit jamais utiliser `/api` relatif.** Utiliser l’URL Railway absolue.

### URL native Android `getNativeApiUrl()`

Le Java ne comprend pas `/api` relatif. Construction :

1. Si `NEXT_PUBLIC_API_URL` commence par `http` → l’utiliser
2. Sinon `window.location.origin + /api` (en WebView = domaine Vercel, puis rewrite)
3. Fallback `http://localhost:5000/api`

Expo SMS/notif devra poster vers **Railway en absolu**, comme le Java le fait déjà quand `NEXT_PUBLIC_API_URL` est absolu.

## 2. Auth web `lib/auth.ts`

### Stockage

| Donnée | Où |
|---|---|
| JWT | mémoire `memoryToken` uniquement |
| emailVerified | mémoire `memoryEmailVerified` |
| user | `localStorage.user_data` |
| onboarding | `localStorage.onboarding_seen` + cookie `onboarding_seen` |
| email en attente de vérif | `sessionStorage.pending_verification_email` |

Hydratation au boot : `GET /api/auth/token` (Next, cookie HttpOnly) → remplit `memoryToken`.

### Appels auth (vers Next BFF, pas Express direct)

Tous en `credentials: 'same-origin'` :

| Fonction | Endpoint Next |
|---|---|
| `login` | `POST /api/auth/login` |
| `register` | `POST /api/auth/register` |
| `verifyEmail` | `POST /api/auth/verify-email` |
| `resendVerificationCode` | `POST /api/auth/resend-code` |
| `forgotPassword` | `POST /api/auth/forgot-password` |
| `resetPassword` | `POST /api/auth/reset-password` |
| `logout` | `POST /api/auth/logout` puis `window.location = '/'` |
| `checkRegisterAvailability` | `GET {API_URL}/auth/check-availability` (rewrite Express) |

Côté **Express**, `POST /auth/logout` exige un Bearer et révoque les JWT (`tokenVersion`). Le BFF Next peut appeler Express sans toujours propager le token : **Expo doit appeler Express `/auth/logout` avec le JWT** avant de vider SecureStore.

### Cookies posés par le BFF Next (`lib/server/session-cookies.ts`)

| Cookie | HttpOnly | Durée | Rôle |
|---|---|---|---|
| `auth_token` | oui | 12 h | JWT |
| `email_verified` | oui | 12 h | `"true"` |
| `pending_email` | oui | 24 h | avant vérif |

`SameSite=lax`, `Secure` en prod, `path=/`. Domain optionnel `COOKIE_DOMAIN`.

**Expo : ignorer tout ce mécanisme.** Appeler Express, stocker le JWT dans SecureStore.

### Validation inscription `lib/loginValidation.ts`

- Email regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Mot de passe register ≥ 10
- Nom ≥ 2
- Confirm password identique
- Disponibilité email + name **obligatoire** (`available`) avant submit register

## 3. Mapping BFF Next → Express (pour debug)

| Next | Express | Extra Next |
|---|---|---|
| POST `/api/auth/login` | POST `/auth/login` | rate limit IP, pose cookies, vérifie JWT_SECRET |
| POST `/api/auth/register` | POST `/auth/register` | sanitise codes email |
| POST `/api/auth/verify-email` | POST `/auth/verify-email` | cookies |
| POST `/api/auth/resend-code` | POST `/auth/resend-code` | |
| POST `/api/auth/forgot-password` | POST `/auth/forgot-password` | |
| POST `/api/auth/reset-password` | POST `/auth/reset-password` | cookies |
| POST `/api/auth/logout` | POST `/auth/logout` | clear cookies |
| GET `/api/auth/token` | — | lit cookie, ne parle pas à Express |
| GET `/api/auth/google` | — | redirige Google, cookies state/nonce |
| POST `/api/auth/google/mobile-complete` | POST `/auth/google/handoff` | pose cookies, JSON `{ redirect }` |

Si `JWT_SECRET` Vercel ≠ Railway → `code: JWT_MISMATCH` (500). Expo n’a pas ce problème (un seul secret, celui d’Express).

## 4. Offline (`lib/offlineApi.ts` + `lib/sync.ts` + `lib/db.ts`)

Dexie DB `MesPochesDB` :

- `wallets`, `transactions`, `categories`, `syncQueue`

Si online : appelle l’API puis miroir IndexedDB.  
Si offline : CRUD local + file `syncQueue`, replay au retour (max 5 retries).

**Portée limitée :** seules wallets / transactions (create income, expense, transfer) / categories getAll sont vraiment wrapées. Budgets, pending, premium **ne sont pas offline**.

Pour Expo v1 : **online-only** recommandé. Porter Dexie plus tard via `expo-sqlite` si besoin.

## 5. Cache mémoire `lib/cache.ts`

Pas de TTL. Invalidation manuelle `invalidateFinancialCaches()` après create/update/delete.

Clés : `home`, `transactions`, `wallets`, `analytics`, `categories`, `transaction:{id}`, `wallet:{id}`.

Hook `useCachedData(key, fetcher)` : affiche le cache puis refresh.

Expo : remplacer par **TanStack Query** (staleTime, invalidateQueries).

## 6. UploadThing (images poche / catégorie)

Router Next `app/api/uploadthing/core.ts` :

- `categoryImage` — image ≤ 4 Mo
- `walletImage` — image ≤ 4 Mo
- Auth cookie JWT

Composant `ImageUpload` : Premium requis pour uploader. Sur natif Capacitor, peut prendre une photo (`Capacitor Camera`) puis blob.

**Expo :**

- Option A : garder l’upload vers `https://www.mespoches.store/api/uploadthing` (SDK UploadThing RN s’il existe, ou presigned).
- Option B : envoyer l’image en data URL n’est **pas** le flux poche/catégorie (seulement `ai-scan`).
- Option C v1 : skip images custom (Premium), utiliser avatars par défaut (`EntityAvatar`).

## 7. Scan reçu (IA)

`contexts/ReceiptScanContext.tsx` :

1. Premium check
2. Choix source (caméra / galerie) via bottom sheet (pas le prompt natif illisible)
3. Capacitor Camera → dataUrl
4. `compressImageForScan`
5. `pendingTransactionApi.aiScan(image, mimeType, abortSignal)`
6. Overlay progression → redirect `/pending`

Expo équivalent : `expo-image-picker` + `expo-camera` + même POST.

## 8. Note vocale

`VoiceNoteOverlay` : speech-to-text Capacitor `@capacitor-community/speech-recognition` puis `pendingTransactionApi.voiceNote(text)`.

Expo : `expo-speech-recognition` (dev build) ou saisie texte fallback.

## 9. Automatisation SMS / notifications (Android only)

JS `AutomationBridge` au launch si `Capacitor.isNativePlatform()` :

1. `hydrateAuthSession`
2. `SmsMonitor.storeAuthToken({ token, apiUrl })`
3. Rappel local quotidien 20:00 `LocalNotifications`
4. Demande RECEIVE_SMS + ouverture settings Notification Listener

Java :

- Filtre `MoneyTextFilter.isMoneyRelated`
- Debounce fingerprint (évite SMS + notif dupliqués)
- POST parse-sms / parse-notification
- Notif locale « Transaction prête » sur HTTP 201

**Expo :** c’est le plus gros écart. Expo Go **ne peut pas** recevoir les SMS. Il faut un **development build** + module natif (réécrire `SmsReceiver`, `MoneyNotificationListener`, `PendingApiPoster`) ou un config plugin qui embarque le Java actuel.

Plan réaliste :

1. v1 Expo : validation manuelle + scan + voix, **sans** SMS auto
2. v2 : config plugin Android copiant le Java `com.mespoches.app` (le contrat HTTP est déjà documenté)

iOS : pas d’équivalent SMS background. Rester manuel / scan / Siri dictée.

## 10. Paiement CinetPay

`POST /subscription/checkout` → ouvrir `paymentUrl` dans le navigateur.

Web : `window.location.href`.  
Capacitor : Browser plugin.  
Expo : `WebBrowser.openAuthSessionAsync` puis deep link `/subscription/payment/success?transaction_id=` → `GET /subscription/verify`.

Aujourd’hui le bouton payant est **bloqué hors localhost**. Prévoir le même flag `EXPO_PUBLIC_PAYMENTS_ENABLED` ou s’aligner sur `paymentAvailable` renvoyé par l’API.

## 11. Codes d’erreur à gérer dans l’UI mobile

| code | UI |
|---|---|
| `PREMIUM_REQUIRED` | Modal / redirect abonnement |
| `EMAIL_NOT_VERIFIED` | Écran code 6 chiffres |
| `NEED_PASSWORD` | Compte Google : flux mot de passe oublié |
| `SESSION_REVOKED` | Forcer logout (token invalidé) |
| `OTP_LOCKED` | Trop de codes, redemander |
| `ALREADY_VERIFIED` | Aller au login |
| `RESEND_COOLDOWN` | Timer bouton renvoyer |
| `RATE_LIMITED` | Toast + Retry-After |
| `JWT_MISMATCH` | Uniquement web BFF |
| HTTP 413 | Image trop lourde |
| HTTP 422 pending | Texte SMS non reconnu (silencieux côté Android) |
