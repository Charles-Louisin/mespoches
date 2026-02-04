# 🚀 Guide de Démarrage Rapide - MES POCHES

## Étape 1 : Configuration du Backend

### 1.1 Installer les dépendances
```bash
cd backend
npm install
```

### 1.2 Configurer l'environnement
Créer un fichier `.env` dans le dossier `backend` :
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mes-poches
NODE_ENV=development
```

### 1.3 Démarrer MongoDB
Assurez-vous que MongoDB est installé et en cours d'exécution :
```bash
# Sur Windows avec MongoDB installé
net start MongoDB

# Sur macOS/Linux
sudo systemctl start mongod
# ou
brew services start mongodb-community
```

### 1.4 Initialiser la base de données
```bash
npm run seed
```
Cette commande va créer :
- 4 portefeuilles par défaut (Espèces, Mobile Money, Compte Bancaire, Carte)
- 5 catégories de revenus
- 10 catégories de dépenses

### 1.5 Démarrer le serveur backend
```bash
npm run dev
```
Le backend sera accessible sur http://localhost:5000

## Étape 2 : Configuration du Frontend

### 2.1 Installer les dépendances
À la racine du projet :
```bash
npm install
```

### 2.2 Configurer l'environnement
Créer un fichier `.env.local` à la racine du projet :
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2.3 Démarrer le serveur Next.js
```bash
npm run dev
```
Le frontend sera accessible sur http://localhost:3000

## ✅ Vérification

Ouvrez votre navigateur et accédez à http://localhost:3000

Vous devriez voir :
- Le dashboard avec le solde total
- Les portefeuilles créés par le seed
- Des boutons pour ajouter des revenus et dépenses

## 🎯 Premiers pas

### Ajouter votre premier revenu
1. Cliquez sur le bouton "Revenu" sur le dashboard
2. Entrez un montant (ex: 100000)
3. Sélectionnez un portefeuille (ex: Espèces)
4. Choisissez une catégorie (ex: Salaire)
5. Cliquez sur "Enregistrer"

### Ajouter votre première dépense
1. Cliquez sur le bouton "Dépense" sur le dashboard
2. Entrez un montant (ex: 5000)
3. Sélectionnez un portefeuille
4. Choisissez une catégorie (ex: Alimentation)
5. Cliquez sur "Enregistrer"

### Faire un transfert
1. Allez dans "Transactions" (icône Historique en bas)
2. Cliquez sur le bouton "+"
3. Sélectionnez "Transfert"
4. Entrez le montant
5. Choisissez le portefeuille source et destination
6. Cliquez sur "Enregistrer"

## 📱 Navigation

L'application utilise une barre de navigation en bas avec 4 sections :

1. **Accueil** : Vue d'ensemble, soldes, actions rapides
2. **Historique** : Liste de toutes les transactions
3. **Portefeuilles** : Gestion des portefeuilles
4. **Analyses** : Statistiques et graphiques

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez que MongoDB est bien démarré
- Vérifiez que le port 5000 n'est pas déjà utilisé
- Vérifiez le fichier `.env` dans le dossier backend

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend est bien démarré sur le port 5000
- Vérifiez le fichier `.env.local` à la racine du projet
- Vérifiez la console du navigateur pour les erreurs CORS

### Erreur "Solde insuffisant"
C'est normal ! Le système empêche les dépenses qui dépassent le solde disponible.
Ajoutez d'abord un revenu avant de faire une dépense.

## 📞 Support

Pour toute question ou problème, consultez le README.md principal ou ouvrez une issue.

Bon développement ! 🎉
