# 🚀 Démarrage Rapide - MES POCHES

## ✅ Migration terminée !

Le dossier `src/` a été déplacé vers la racine du projet.

## Structure actuelle

```
note/
├── app/              ← Pages Next.js
├── components/       ← Composants réutilisables
├── lib/              ← API et utilitaires
├── backend/          ← API Express.js
├── public/           ← Assets statiques
└── [fichiers config]
```

## 🎯 Pour démarrer l'application

### 1. Backend (Terminal 1)

```bash
cd backend
npm install          # Si pas encore fait
npm run seed        # Créer les données initiales (une seule fois)
npm run dev         # Démarrer le serveur
```

Le backend sera sur **http://localhost:5000**

### 2. Frontend (Terminal 2)

```bash
# À la racine du projet
npm install         # Si pas encore fait
npm run dev        # Démarrer Next.js
```

Le frontend sera sur **http://localhost:3000**

## 🔧 Fichiers de configuration

### Backend : `backend/.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mes-poches
NODE_ENV=development
```

### Frontend : `.env.local` (à la racine)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🧪 Tester l'application

1. **Page de test simple** : http://localhost:3000/test
2. **Dashboard principal** : http://localhost:3000
3. **API Backend** : http://localhost:5000/api/wallets

## ⚠️ Dépannage

### Le frontend ne compile pas
- Arrêtez le serveur (Ctrl+C)
- Supprimez le dossier `.next` : `Remove-Item -Recurse -Force .next`
- Relancez : `npm run dev`

### Erreur "Out of Memory"
- C'est normal au premier démarrage
- Arrêtez et relancez simplement le serveur

### Le backend ne se connecte pas à MongoDB
- Vérifiez que MongoDB est démarré
- Windows : `net start MongoDB`
- Mac/Linux : `brew services start mongodb-community`

## 📚 Documentation complète

Consultez **DEMARRAGE.md** pour plus de détails.

Bon développement ! 🎉
