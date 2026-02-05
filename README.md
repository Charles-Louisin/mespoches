# 💰 MES POCHES - Application de Gestion Financière

Une application web Progressive (PWA) moderne de gestion financière personnelle, construite avec Next.js et MongoDB, déployable sur Vercel.

## ✨ Fonctionnalités

- 💼 **Gestion multi-portefeuilles** - Créez et gérez plusieurs portefeuilles
- 💸 **Transactions complètes** - Revenus, dépenses et transferts entre portefeuilles
- 🏷️ **Catégories personnalisables** - Organisez vos transactions
- 📊 **Analytics en temps réel** - Statistiques mensuelles et visualisations
- 🔐 **Authentification sécurisée** - JWT avec bcrypt
- 📱 **PWA installable** - Fonctionne comme une app native
- 🌐 **Mode offline** - Utilisez l'app sans connexion internet
- 🔄 **Synchronisation automatique** - Sync des données au retour en ligne
- 🎨 **Interface moderne** - UI responsive et intuitive

## 🏗️ Architecture

- **Frontend** : Next.js 14, React, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes (Serverless)
- **Base de données** : MongoDB (Atlas)
- **Authentification** : JWT avec bcrypt
- **Cache local** : IndexedDB avec Dexie
- **Déploiement** : Vercel

## 🚀 Démarrage rapide

### 1. Prérequis

- Node.js 18+
- MongoDB (local ou Atlas)
- npm ou yarn

### 2. Installation

```bash
# Cloner le repo
git clone https://github.com/votre-username/mes-poches.git
cd mes-poches

# Installer les dépendances
npm install
```

### 3. Configuration

Créez un fichier `.env.local` à la racine :

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/mes-poches

# JWT Secret (changez en production!)
JWT_SECRET=votre-secret-tres-long-et-secure

# API URL
NEXT_PUBLIC_API_URL=/api
```

### 4. Lancement

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start
```

L'application sera accessible sur http://localhost:3000

## 🌐 Déploiement sur Vercel

### Étape 1 : MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (M0)
3. Créez un utilisateur de base de données
4. Autorisez les connexions : `0.0.0.0/0`
5. Copiez l'URL de connexion

### Étape 2 : Déployer

1. Pushez votre code sur GitHub
2. Importez le repo sur [Vercel](https://vercel.com)
3. Ajoutez les variables d'environnement :
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=votre-secret-production
   NEXT_PUBLIC_API_URL=/api
   ```
4. Déployez !

Pour plus de détails, consultez `VERCEL-READY.md` et `MIGRATION-API-VERCEL.md`.

## 📚 Documentation

- **[VERCEL-READY.md](./VERCEL-READY.md)** - Guide de déploiement rapide
- **[MIGRATION-API-VERCEL.md](./MIGRATION-API-VERCEL.md)** - Documentation technique complète
- **[DEPLOIEMENT-VERCEL.md](./DEPLOIEMENT-VERCEL.md)** - Instructions détaillées de déploiement

## 🛠️ Technologies utilisées

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Sonner (notifications)

### Backend
- Next.js API Routes
- MongoDB avec Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Joi (validation)

### PWA & Offline
- next-pwa
- IndexedDB (Dexie)
- Service Workers
- Cache API

## 📱 Installer la PWA

### Sur mobile
1. Ouvrez l'app dans le navigateur
2. Cliquez sur "Ajouter à l'écran d'accueil"
3. L'app s'installe comme une app native

### Sur desktop
1. Cliquez sur l'icône d'installation dans la barre d'adresse
2. Suivez les instructions
3. L'app s'ouvre dans sa propre fenêtre

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ Authentification JWT avec expiration
- ✅ Validation des données avec Joi
- ✅ Protection des routes API
- ✅ Variables d'environnement sécurisées

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 🎯 Roadmap

- [ ] Export des données (CSV, PDF)
- [ ] Graphiques avancés
- [ ] Budget mensuel
- [ ] Rappels et notifications
- [ ] Multi-devises
- [ ] Mode sombre
- [ ] Support multi-langues

## 💡 Support

Pour toute question ou problème :
- Consultez la documentation dans `/docs`
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour une meilleure gestion financière personnelle**
