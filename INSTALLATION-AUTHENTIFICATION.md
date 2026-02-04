# 🔧 Installation du système d'authentification

## ⚠️ ACTION REQUISE : Configurer le JWT_SECRET

### Backend

**IMPORTANT** : Ajouter cette ligne dans `backend/.env` :

```bash
JWT_SECRET=votre_secret_super_securise_changez_moi_en_production_12345
```

Le fichier `backend/.env` doit maintenant contenir :

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mes-poches
NODE_ENV=development
JWT_SECRET=votre_secret_super_securise_changez_moi_en_production_12345
```

### Redémarrer les serveurs

Après avoir ajouté `JWT_SECRET` :

#### Terminal Backend (Terminal 3)
```bash
Ctrl+C  # Arrêter le serveur
npm run dev  # Redémarrer
```

#### Terminal Frontend (Terminal 2)
```bash
Ctrl+C  # Arrêter le serveur
npm run dev  # Redémarrer
```

## ✅ Ce qui a été installé

### Backend
- ✅ `jsonwebtoken` - Génération et vérification des tokens JWT
- ✅ `bcryptjs` - Hashage sécurisé des mots de passe

### Frontend
- ✅ `js-cookie` - Gestion des cookies côté client
- ✅ `@types/js-cookie` - Types TypeScript pour js-cookie

## 📝 Fichiers créés

### Backend
- `backend/src/models/User.js` - Modèle utilisateur
- `backend/src/middleware/auth.js` - Middleware d'authentification
- `backend/src/controllers/authController.js` - Contrôleur d'authentification
- `backend/src/routes/authRoutes.js` - Routes d'authentification

### Frontend
- `lib/auth.ts` - Fonctions d'authentification
- `app/onboarding/page.tsx` - Page d'onboarding
- `app/login/page.tsx` - Page de connexion/inscription
- `middleware.ts` - Middleware Next.js pour la protection des routes
- `components/AuthGuard.tsx` - Composant de garde pour l'authentification

### Documentation
- `README-AUTH.md` - Documentation complète du système d'authentification
- `DEMARRAGE-AUTH.md` - Guide de démarrage rapide
- `INSTALLATION-AUTHENTIFICATION.md` - Ce fichier

## 🧪 Test rapide

1. **Ajouter JWT_SECRET dans backend/.env**
2. **Redémarrer les deux serveurs**
3. **Ouvrir http://localhost:3000**
4. **Vous devriez voir la page d'onboarding !**

### Premier test

1. Passer les 3 slides d'onboarding
2. Cliquer sur "S'inscrire"
3. Créer un compte :
   - Nom : Test
   - Email : test@example.com
   - Mot de passe : test123
4. Vous êtes maintenant sur le dashboard !
5. Le bouton de déconnexion est en haut à droite

### Deuxième test (isolation des données)

1. Se déconnecter (icône en haut à droite)
2. Créer un autre compte (email différent)
3. Ajouter des portefeuilles et transactions
4. Se déconnecter et se reconnecter avec le premier compte
5. ✅ Les données sont complètement séparées !

## 🐛 Problèmes possibles

### Erreur : "JWT_SECRET is not defined"
- ➡️ Ajouter `JWT_SECRET` dans `backend/.env`
- ➡️ Redémarrer le serveur backend

### Erreur : "Cannot read properties of undefined"
- ➡️ Vérifier que tous les packages sont installés
- ➡️ Redémarrer les deux serveurs

### Pas de redirection automatique
- ➡️ Effacer le cache du navigateur
- ➡️ Supprimer les cookies
- ➡️ Recharger la page

---

## 📚 Prochaines étapes

1. ✅ Ajouter JWT_SECRET dans backend/.env
2. ✅ Redémarrer les serveurs
3. ✅ Tester l'authentification
4. ✅ Créer plusieurs comptes pour vérifier l'isolation des données

---

🎉 **Système d'authentification prêt à l'emploi !**
