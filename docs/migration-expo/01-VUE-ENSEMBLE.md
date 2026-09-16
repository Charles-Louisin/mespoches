# 01 — Vue d’ensemble : qu’est-ce que MES POCHES

## En une phrase

**MES POCHES** est une application de **gestion financière personnelle** destinée principalement à l’Afrique francophone (Mobile Money Orange / MTN, devises XAF / XOF). Elle permet de suivre plusieurs portefeuilles (« poches »), d’enregistrer revenus / dépenses / transferts, d’analyser le mois, et d’importer automatiquement des opérations depuis SMS, notifications, scan de reçus (IA) et notes vocales.

Nom npm du projet note : `mes-poches` v1.0.0.

## Produit

L’utilisateur crée des **poches** (Cash, MTN Money, Orange Money, banque…). Chaque transaction débite ou crédite une poche et met à jour le solde. Un plan **Gratuit** (avec essai Premium d’1 mois à l’inscription) coexiste avec un plan **Premium** (budgets, objectifs d’épargne, récurrences, analytics avancés, exports, images, transferts, historique illimité).

Le positionnement marketing (page `/download`) insiste sur :

1. Lecture auto des notifications Mobile Money
2. Photo de ticket / reçu analysée par IA
3. Note vocale (« Deux mille transport »)
4. Séparation claire cash / MoMo / banque

## Stack actuelle du projet `note`

Le dépôt `note` contient **les deux** : frontend Next.js **et** backend Express dans `note/backend/`.

| Couche | Technologie | Où dans le repo | Hébergement |
|---|---|---|---|
| Frontend web / PWA | Next.js 14, React 18, TypeScript, Tailwind | `app/`, `components/`, `lib/` | Vercel — `mespoches.store` |
| Backend métier | Express 4 + TypeScript | **`backend/src/`** | Railway — `https://mespochesbackend-production-9bfe.up.railway.app` |
| Base de données | MongoDB + Mongoose | `backend/src/models/` | MongoDB Atlas |
| Auth | JWT `jsonwebtoken` + bcrypt + `tokenVersion` | `backend/src/routes/authRoutes.ts` | Même `JWT_SECRET` Vercel = backend |
| Uploads images | UploadThing | Next `app/api/uploadthing` | `utfs.io` / `ufs.sh` |
| Paiements | CinetPay Orange / MTN / carte | `backend/src/utils/cinetpay.ts` | Webhook `/api/webhooks/cinetpay` |
| IA (reçus, SMS, voix) | OpenRouter (Gemini déprécié) | `backend/src/services/ai/` | Railway |
| App Android actuelle | Capacitor 8 WebView + Java SMS | `android/` | Play Store / APK |
| Offline web | Dexie / IndexedDB | `lib/db.ts` | Navigateur |

## Architecture en 3 morceaux

```
┌─────────────────────────────┐
│  Next.js (`note/` racine)   │
│  Pages, UI, PWA, BFF auth   │
│  /api/auth/* (cookies)      │
│  /api/uploadthing           │
│  rewrites /api/wallets → Express
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Express (`note/backend/`)  │
│  Port 5000 — npm run dev    │
│  CRUD, parse-sms, ai-scan,  │
│  CinetPay, cron dépenses    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  MongoDB Atlas              │
└─────────────────────────────┘

En parallèle : APK Capacitor = WebView du site
  + Java SmsReceiver / NotificationListener
  → POST directs vers Express /pending-transactions/*
```

## Ce qui reste à la migration (backend)

**Rien à modifier côté Express / MongoDB** pour que l’app Expo fonctionne, à condition que :

- l’app envoie `Authorization: Bearer <jwt>`
- le CORS Railway autorise l’origine de l’app **ou** que l’app appelle l’API sans cookie (Bearer suffit)
- `JWT_SECRET` reste le même
- les endpoints listés dans `03-API-BACKEND.md` restent stables

## Ce qui doit être réécrit (frontend)

Tout le UI Next.js (`app/`, `components/`, `contexts/`, `hooks/`, `lib/auth.ts` cookies).

L’app Capacitor actuelle n’est **pas** une app native React Native : c’est le site web dans une WebView. L’app Expo sera une **vraie app native** qui parle au même backend.

## Utilisateurs et rôles

| Rôle | Accès |
|---|---|
| `user` | App complète selon plan `free` / `premium` |
| `admin` | Même chose + dashboard `/admin` + Premium de facto |

Champs utilisateur importants : `email`, `name`, `plan`, `premiumUntil`, `premiumSource` (`trial` \| `paid`), `isPremium`, `isOnTrial`, `currency`, `emailVerified`, `hidePlannedExpensesHelp`.

## Limites plan Gratuit vs Premium

Définies dans `lib/planLimits.ts` (le backend les applique aussi, code `PREMIUM_REQUIRED`) :

| | Gratuit | Premium |
|---|---|---|
| Catégories par type | max 10 | illimité |
| Historique | 3 mois | complet |
| Transferts entre poches | non | oui |
| Images poche / catégorie | non | oui |
| Analytics | mois courant seulement | mois au choix + comparaison + par catégorie |
| Budgets | non | oui |
| Objectifs d’épargne | non | oui |
| Transactions récurrentes | non | oui |
| Export CSV / PDF / XLSX | non | oui |
| Scan reçu (IA) | Premium | oui |
| Note vocale | Premium | oui |
| Essai | 1 mois calendaire après vérif email | — |
| Prix | 0 | 2 500 XAF / mois ou 24 000 XAF / an |

## URLs de production (à configurer dans Expo)

```
API Express : https://mespochesbackend-production-9bfe.up.railway.app/api
Site web    : https://www.mespoches.store
Alias API   : https://mespochesbackend-production.up.railway.app
Dev Express : http://localhost:5000/api
```

Variable actuelle frontend : `NEXT_PUBLIC_API_URL` (prod Vercel : souvent `/api` + rewrite, ou URL Railway absolue).

Pour Expo, utiliser **l’URL absolue Railway** (pas `/api` relatif).
