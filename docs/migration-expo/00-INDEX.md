# MES POCHES — Dossier de migration Expo

Documentation extraite du projet **note** (`C:\realProject\note`) pour migrer le frontend vers **Expo** (`mes-poches-mobile`).

**Le backend Express est dans `note/backend/`.** Il ne change pas à la migration : l’app mobile appellera la même API (local `:5000` ou Railway).

## Comment utiliser ce dossier

| Fichier | Contenu |
|---|---|
| [01-VUE-ENSEMBLE.md](./01-VUE-ENSEMBLE.md) | Qu’est-ce que MES POCHES, stack, déploiements, ce qui reste / ce qui bouge |
| [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) | Architecture actuelle (Next.js + Express + Capacitor) et cible Expo |
| [03-API-BACKEND.md](./03-API-BACKEND.md) | Catalogue complet des endpoints Express (contrat à réutiliser tel quel) |
| [04-API-FRONTEND-ET-AUTH.md](./04-API-FRONTEND-ET-AUTH.md) | Client actuel, cookies, JWT, proxies Next, UploadThing, SMS natif |
| [05-PAGES-ET-ECRANS.md](./05-PAGES-ET-ECRANS.md) | Toutes les pages / écrans, navigation, APIs appelées, équivalent Expo Router |
| [06-FONCTIONNALITES.md](./06-FONCTIONNALITES.md) | Toutes les fonctionnalités (gratuit / premium / natif Android) |
| [07-MODELES-ET-TYPES.md](./07-MODELES-ET-TYPES.md) | Types TypeScript, modèles Mongo, devises, plans, codes d’erreur |
| [08-PLAN-MIGRATION-EXPO.md](./08-PLAN-MIGRATION-EXPO.md) | Plan de migration par lots, pièges, mapping Capacitor → Expo |
| [09-COMPOSANTS-HOOKS-ETAT.md](./09-COMPOSANTS-HOOKS-ETAT.md) | Composants, contexts, hooks, cache, offline, à recréer côté mobile |
| [10-BACKEND-SOURCE.md](./10-BACKEND-SOURCE.md) | Carte du code Express (`note/backend/src`) : models, routes, jobs, IA |

## Principe de migration

```
[App Expo]  --Bearer JWT-->  [Express Railway /api]  -->  [MongoDB Atlas]
                 \
                  \-- uploads images --> [UploadThing via Next.js existant]
                  \-- OAuth Google   --> [Next.js BFF existant OU Express /auth/google/*]
```

- **Ne pas réécrire** les routes Express (`/wallets`, `/transactions`, `/auth/me`, etc.).
- **Réécrire** uniquement l’UI (React Native) + le client HTTP + le stockage du JWT (`expo-secure-store` au lieu des cookies HttpOnly Next.js).
- **Réimplémenter** les capacités natives (SMS, notifications, caméra, micro) avec des modules Expo / config plugins.

## Source de vérité dans le code note

| Sujet | Fichier |
|---|---|
| **Backend Express (contrat API)** | `backend/src/` |
| Montage des routes | `backend/src/server.ts` |
| Auth / JWT | `backend/src/routes/authRoutes.ts` |
| Modèles Mongo | `backend/src/models/` |
| Client API frontend | `lib/api.ts` |
| Auth web (cookies Next) | `lib/auth.ts` |
| URL API | `lib/api-config.ts` |
| Rewrites Next → Express | `next.config.js` |
| Pages | `app/**/page.tsx` |
| Navigation | `components/BottomNav.tsx` + `middleware.ts` |
| SMS Android | `android/app/src/main/java/com/mespoches/app/` |
