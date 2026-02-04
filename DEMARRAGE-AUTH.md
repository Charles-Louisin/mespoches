# 🚀 Démarrage avec authentification

## Première utilisation

### 1. Configuration Backend

```bash
cd backend
```

Vérifier que `.env` contient :
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mes-poches
NODE_ENV=development
JWT_SECRET=votre_secret_super_securise_changez_moi_en_production_12345
```

Démarrer le backend :
```bash
npm run dev
```

### 2. Configuration Frontend

Dans un autre terminal :

```bash
npm run dev
```

### 3. Tester l'application

1. Ouvrir http://localhost:3000
2. Vous serez redirigé vers `/onboarding` (première visite)
3. Voir les 3 slides, cliquer sur "Commencer"
4. Sur `/login`, cliquer sur "S'inscrire"
5. Créer un compte :
   - Nom : Test User
   - Email : test@example.com
   - Mot de passe : test123
6. Vous êtes maintenant connecté et sur le dashboard !

## Utilisation quotidienne

### Se connecter

1. Aller sur http://localhost:3000
2. Si non connecté → Redirection automatique vers `/login`
3. Entrer email et mot de passe
4. Cliquer sur "Se connecter"

### Se déconnecter

1. Cliquer sur l'icône de déconnexion (en haut à droite du header)
2. Confirmer
3. Vous êtes déconnecté et redirigé vers `/login`

## Plusieurs utilisateurs

Pour tester l'isolation des données :

### Utilisateur 1
- Email : alice@example.com
- Mot de passe : alice123

### Utilisateur 2
- Email : bob@example.com
- Mot de passe : bob123

1. Créer le compte Alice
2. Ajouter des portefeuilles et transactions
3. Se déconnecter
4. Créer le compte Bob
5. Ajouter d'autres portefeuilles et transactions
6. Se déconnecter
7. Se reconnecter avec Alice → Vous verrez uniquement les données d'Alice
8. Se déconnecter
9. Se reconnecter avec Bob → Vous verrez uniquement les données de Bob

✅ Les données sont complètement isolées !

## Problèmes courants

### Token invalide

Si vous voyez "Non autorisé, token invalide" :
1. Ouvrir DevTools (F12)
2. Application > Cookies
3. Supprimer le cookie `auth_token`
4. Recharger la page

### Pas de redirection

Si vous n'êtes pas redirigé automatiquement :
1. Effacer le cache du navigateur
2. Supprimer les cookies
3. Recharger la page

### Backend ne démarre pas

Vérifier que :
1. MongoDB est démarré
2. Le port 5000 n'est pas utilisé par une autre application
3. Toutes les dépendances sont installées (`npm install`)

---

🎉 **Profitez de MES POCHES !**
