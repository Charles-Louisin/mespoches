# 📴 Mode Offline & Synchronisation - MES POCHES

## Fonctionnalités implémentées

### ✅ Support offline complet

L'application fonctionne maintenant **entièrement hors ligne** avec synchronisation automatique !

## Architecture

### 1. IndexedDB (Dexie.js)
Base de données locale dans le navigateur pour stocker :
- **Portefeuilles** (`wallets`)
- **Transactions** (`transactions`)
- **Catégories** (`categories`)
- **File de synchronisation** (`syncQueue`)

### 2. File de synchronisation
Toutes les actions effectuées hors ligne sont mises en file d'attente et synchronisées automatiquement quand la connexion est rétablie.

### 3. API Offline-First
- `lib/offlineApi.ts` : Versions offline des API
- Tente d'abord l'API en ligne
- Si hors ligne ou erreur → utilise IndexedDB
- Les modifications sont automatiquement synchronisées

## Fonctionnement

### Mode Online
1. ✅ Les requêtes utilisent l'API normale
2. ✅ Les données sont mises en cache dans IndexedDB
3. ✅ Synchronisation automatique toutes les minutes

### Mode Offline
1. ✅ Les données sont lues depuis IndexedDB
2. ✅ Les modifications sont enregistrées localement
3. ✅ Les actions sont ajoutées à la file de synchronisation
4. ✅ Les soldes sont calculés localement

### Retour Online
1. ✅ Détection automatique du retour de connexion
2. ✅ Synchronisation automatique des données en attente
3. ✅ Toast de confirmation
4. ✅ Mise à jour de l'indicateur de sync

## Composants

### `<SyncIndicator />`
Bouton flottant en bas à droite qui affiche :
- 🟢 **En ligne** : Nuage avec "En ligne"
- 🟠 **Hors ligne** : Nuage barré avec "Hors ligne"
- 🔄 **Synchronisation** : Icône qui tourne avec "Sync..."
- 🔴 **Badge rouge** : Nombre d'actions en attente

**Actions** :
- Clic → Synchronisation manuelle
- Synchronisation automatique toutes les minutes
- Synchronisation automatique au retour de connexion

### Hook `useOnlineStatus`
Hook personnalisé qui gère :
- État online/offline
- État de synchronisation
- Nombre d'actions en attente
- Fonction de synchronisation manuelle

```typescript
const { online, syncing, pendingSync, handleSync } = useOnlineStatus();
```

## Utilisation

### Dans les composants

**Avant (API normale)** :
```typescript
import { walletApi } from '@/lib/api';
const wallets = await walletApi.getAll();
```

**Maintenant (API offline-first)** :
```typescript
import { offlineWalletApi } from '@/lib/offlineApi';
const wallets = await offlineWalletApi.getAll();
```

L'API offline gère automatiquement :
- ✅ Tentative de récupération en ligne
- ✅ Fallback sur IndexedDB si offline
- ✅ Mise en cache des données
- ✅ File de synchronisation

### Créer une transaction hors ligne

```typescript
// L'utilisateur est hors ligne
await offlineTransactionApi.createIncome({
  amount: 5000,
  wallet_id: 'wallet123',
  category_id: 'cat456',
  description: 'Salaire',
  date: new Date().toISOString()
});

// ✅ Transaction créée localement
// ✅ Solde mis à jour localement
// ✅ Action ajoutée à la file de synchronisation
// ✅ Sera synchronisée automatiquement au retour de connexion
```

## Synchronisation

### Automatique
- ✅ Au retour de connexion (détection automatique)
- ✅ Toutes les minutes si en ligne
- ✅ Au démarrage de l'application si en ligne

### Manuelle
- ✅ Clic sur le bouton `<SyncIndicator />`
- ✅ Affiche le nombre d'éléments synchronisés
- ✅ Affiche les erreurs éventuelles

### Gestion des erreurs
- ✅ Retry automatique (max 5 tentatives)
- ✅ Suppression après 5 échecs
- ✅ Notification à l'utilisateur

## Scénarios d'utilisation

### Scénario 1 : Perte de connexion
1. L'utilisateur crée un portefeuille → ✅ Créé localement
2. L'utilisateur ajoute des transactions → ✅ Ajoutées localement
3. Les soldes sont calculés → ✅ Calculés localement
4. Badge rouge indique 3 actions en attente
5. Connexion rétablie → ✅ Synchronisation automatique
6. Badge disparaît, toast "3 élément(s) synchronisé(s)"

### Scénario 2 : Utilisation offline planifiée
1. L'utilisateur charge l'app avec connexion → ✅ Données en cache
2. L'utilisateur passe en mode avion
3. L'utilisateur continue d'utiliser l'app → ✅ Tout fonctionne
4. Toutes les données sont disponibles → ✅ Depuis IndexedDB
5. L'utilisateur désactive le mode avion → ✅ Sync automatique

### Scénario 3 : Connexion instable
1. Connexion coupée pendant une création
2. L'action est mise en file d'attente
3. Tentative de synchronisation échoue
4. Retry automatique après 1 minute
5. Synchronisation réussie au 2ème essai

## Avantages

### Pour l'utilisateur
- ✅ **Toujours disponible** : L'app fonctionne partout
- ✅ **Pas de perte de données** : Tout est sauvegardé localement
- ✅ **Expérience fluide** : Pas d'attente, pas d'erreurs
- ✅ **Transparente** : L'utilisateur ne voit pas la différence
- ✅ **Indicateur clair** : Badge pour les actions en attente

### Pour le développeur
- ✅ **Code simple** : Même API, gestion automatique
- ✅ **Robuste** : Gestion d'erreurs intégrée
- ✅ **Scalable** : IndexedDB peut stocker beaucoup de données
- ✅ **Debuggable** : Console logs et outils DevTools

## Limitations actuelles

- ❌ Pas de résolution de conflits (si modifié sur plusieurs appareils)
- ❌ Pas de synchronisation temps réel (WebSocket)
- ❌ Suppression des portefeuilles/transactions non synchronisée en offline

## Améliorations futures

- [ ] Résolution de conflits basée sur timestamp
- [ ] Synchronisation temps réel avec WebSocket
- [ ] Compression des données pour économiser l'espace
- [ ] Export/import de la base locale
- [ ] Multi-appareils avec sync cloud

## Test

### Tester le mode offline

1. **Ouvrir l'application**
2. **Créer des données** (portefeuilles, transactions)
3. **Ouvrir DevTools** (F12) → Network → "Offline"
4. **Créer de nouvelles données** → ✅ Fonctionne
5. **Vérifier le badge** → Affiche le nombre d'actions
6. **Désactiver offline** → ✅ Synchronisation automatique
7. **Vérifier le toast** → "X élément(s) synchronisé(s)"

### Vérifier IndexedDB

1. **DevTools** (F12) → Application → Storage → IndexedDB
2. Voir **MesPochesDB**
3. Tables : `wallets`, `transactions`, `categories`, `syncQueue`
4. Inspecter les données stockées

---

🎉 **L'application fonctionne maintenant entièrement hors ligne !**
