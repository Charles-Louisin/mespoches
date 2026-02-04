# 🔐 Système d'authentification - MES POCHES

## Fonctionnalités implémentées

### ✅ Backend

1. **Modèle User** (`backend/src/models/User.js`)
   - Email unique
   - Mot de passe hashé avec bcrypt
   - Validation Mongoose

2. **Middleware d'authentification** (`backend/src/middleware/auth.js`)
   - Vérification du token JWT
   - Protection des routes API

3. **Routes d'authentification** (`backend/src/routes/authRoutes.js`)
   - `POST /api/auth/register` - Inscription
   - `POST /api/auth/login` - Connexion
   - `GET /api/auth/me` - Récupérer l'utilisateur connecté

4. **Modèles mis à jour avec `user_id`**
   - `Wallet` - Portefeuilles par utilisateur
   - `Transaction` - Transactions par utilisateur
   - `Category` - Catégories par utilisateur

5. **Services mis à jour**
   - Tous les services filtrent maintenant par `user_id`
   - Les contrôleurs passent `req.user.id` aux services

6. **Routes protégées**
   - Toutes les routes API nécessitent maintenant l'authentification
   - Middleware `protect` appliqué à toutes les routes

### ✅ Frontend

1. **Onboarding** (`app/onboarding/page.tsx`)
   - 3 slides explicatifs
   - Animation moderne
   - N'apparaît qu'une fois par utilisateur

2. **Page de connexion/inscription** (`app/login/page.tsx`)
   - Formulaire unique pour connexion et inscription
   - Validation des champs
   - Messages d'erreur avec Sonner
   - Affichage/masquage du mot de passe

3. **Système d'authentification** (`lib/auth.ts`)
   - Gestion du token JWT (cookies)
   - Gestion des données utilisateur (localStorage)
   - Fonctions login/register/logout
   - Gestion de l'onboarding

4. **API client mis à jour** (`lib/api.ts`)
   - Toutes les requêtes incluent le token JWT
   - Header `Authorization: Bearer <token>`

5. **Middleware Next.js** (`middleware.ts`)
   - Redirection automatique vers onboarding ou login si non connecté
   - Redirection vers l'accueil si déjà connecté et sur une page publique
   - Protection de toutes les routes sauf `/login` et `/onboarding`

6. **Bouton de déconnexion** (`components/Header.tsx`)
   - Icône de déconnexion dans le header
   - Confirmation avant déconnexion
   - Toast de succès

## Configuration requise

### Backend

1. **Installer les dépendances** :
```bash
cd backend
npm install jsonwebtoken bcryptjs
```

2. **Ajouter `JWT_SECRET` dans `.env`** :
```
JWT_SECRET=votre_secret_super_securise_changez_moi_en_production_12345
```

3. **Redémarrer le serveur** :
```bash
npm run dev
```

### Frontend

1. **Installer les dépendances** :
```bash
npm install js-cookie
```

2. **Redémarrer Next.js** :
```bash
npm run dev
```

## Flux utilisateur

### Premier utilisateur

1. ✅ Arrive sur `/` → Redirigé vers `/onboarding`
2. ✅ Voit les 3 slides explicatifs
3. ✅ Clique sur "Commencer" → Redirigé vers `/login`
4. ✅ S'inscrit avec email/mot de passe
5. ✅ Redirigé vers `/` (dashboard)
6. ✅ Peut utiliser l'application normalement

### Utilisateur existant

1. ✅ Arrive sur `/` → Redirigé vers `/login`
2. ✅ Se connecte avec ses identifiants
3. ✅ Redirigé vers `/` (dashboard)
4. ✅ Voit uniquement SES données (portefeuilles, transactions, etc.)

### Déconnexion

1. ✅ Clique sur l'icône de déconnexion dans le header
2. ✅ Confirme la déconnexion
3. ✅ Token et données supprimés
4. ✅ Redirigé vers `/login`

## Isolation des données

**Chaque utilisateur a ses propres données** :
- ✅ Portefeuilles séparés par `user_id`
- ✅ Transactions séparées par `user_id`
- ✅ Catégories séparées par `user_id`
- ✅ Analytics calculées uniquement sur les données de l'utilisateur connecté

## Sécurité

- ✅ Mots de passe hashés avec bcrypt (10 rounds de salt)
- ✅ Tokens JWT avec expiration (30 jours)
- ✅ Validation des données côté backend (Joi)
- ✅ Middleware de protection sur toutes les routes API
- ✅ Vérification du `user_id` dans tous les services

## À faire (optionnel pour amélioration)

- [ ] Mot de passe oublié / Réinitialisation
- [ ] Vérification email
- [ ] Refresh token
- [ ] Limite de tentatives de connexion
- [ ] Session timeout automatique
- [ ] Avatar utilisateur
- [ ] Paramètres de compte

## Test rapide

1. Ouvrir deux navigateurs différents (Chrome et Firefox par exemple)
2. Créer un compte dans chaque navigateur avec des emails différents
3. Ajouter des portefeuilles et transactions dans chaque compte
4. Vérifier que chaque compte voit uniquement ses propres données
5. ✅ Les données sont complètement isolées !

---

🎉 **Le système d'authentification est opérationnel !**
