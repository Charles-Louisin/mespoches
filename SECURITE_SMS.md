# Sécurité et Confidentialité - Système de Notifications SMS

## 🔒 Garanties de Sécurité

### Limitation Stricte aux SMS
L'application respecte les principes suivants :

1. **SMS UNIQUEMENT** 
   - ✅ Ne lit QUE les notifications de l'application SMS système
   - ❌ N'accède à AUCUNE autre notification (réseaux sociaux, email, etc.)
   - ❌ Ne peut pas lire les contacts, calendrier, photos ou autres données

2. **LECTURE SEULE**
   - ✅ Lit uniquement le contenu des SMS reçus
   - ❌ Ne peut PAS répondre aux SMS
   - ❌ Ne peut PAS envoyer de SMS
   - ❌ Ne peut PAS modifier ou supprimer de SMS
   - ❌ Ne peut PAS modifier les paramètres système

3. **FILTRAGE AUTOMATIQUE**
   - Seuls les SMS contenant des informations monétaires sont traités
   - Les SMS personnels sont ignorés automatiquement
   - Filtre basé sur mots-clés : montant, transaction, paiement, etc.

4. **AUCUNE COLLECTE DE DONNÉES PERSONNELLES**
   - Ne collecte PAS les numéros de téléphone
   - Ne collecte PAS les métadonnées (heure, expéditeur complet)
   - Extrait UNIQUEMENT les informations de transaction financière
   - Ne conserve PAS l'historique complet des SMS

5. **TRAITEMENT HORS LIGNE**
   - Les SMS reçus hors connexion sont traités au redémarrage
   - Vérification sur les dernières 24 heures uniquement
   - Système anti-doublon pour éviter les traitements multiples

## 🛡️ Implémentation Technique

### Composants Sécurisés

#### 1. `SmsReceiver.java`
- Reçoit les SMS entrants en temps réel
- Filtre uniquement les SMS monétaires
- Traitement asynchrone sécurisé

#### 2. `MoneyNotificationListener.java`
- **LIMITATION STRICTE** : N'écoute QUE les packages SMS
  - `com.android.messaging`
  - `com.google.android.apps.messaging`
  - `com.samsung.android.messaging`
- Ignore toutes les autres notifications
- Système de debounce anti-doublon (90 secondes)

#### 3. `BootReceiver.java`
- Traite les SMS reçus pendant que l'app était fermée
- Lecture limitée aux dernières 24 heures
- Maximum 10 SMS traités au démarrage (protection anti-spam)

#### 4. `MoneyTextFilter.java`
- Filtre de premier niveau (rapide, sans IA)
- Détecte les mots-clés monétaires
- Rejette automatiquement les SMS non pertinents

### Permissions Android Requises

```xml
<!-- Lecture SMS uniquement (pas d'envoi) -->
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_SMS" />
```

**Note** : L'application demande `BIND_NOTIFICATION_LISTENER_SERVICE` mais est configurée pour filtrer UNIQUEMENT les notifications SMS.

## 🔐 Stockage Sécurisé

- Token d'authentification chiffré avec `EncryptedSharedPreferences`
- Algorithme : AES256-GCM
- Migration automatique depuis l'ancien stockage non chiffré
- Pas de stockage des SMS bruts

## 📊 Données Envoyées à l'API

Uniquement :
- Texte du SMS (pour extraction de la transaction)
- Aucun numéro de téléphone
- Aucune métadonnée personnelle
- Aucun horodatage précis

## ✅ Conformité

- **RGPD** : Traitement minimal des données, consentement explicite
- **Principe de minimisation** : Seules les données nécessaires sont traitées
- **Lecture seule** : Aucune modification du système ou des données
- **Transparence** : Code source documenté et auditable

## 🚫 Ce que l'Application NE FAIT PAS

- ❌ Ne lit PAS WhatsApp, Telegram, Facebook Messenger, etc.
- ❌ Ne lit PAS les emails
- ❌ Ne lit PAS les notifications bancaires natives (sauf SMS)
- ❌ N'envoie PAS de SMS
- ❌ Ne modifie PAS les SMS existants
- ❌ N'accède PAS aux contacts
- ❌ N'accède PAS à la localisation
- ❌ Ne partage PAS les données avec des tiers
- ❌ Ne stocke PAS les SMS complets

## 📝 Audit de Sécurité

Pour vérifier que l'application respecte ces garanties :

1. **Code Source** : Tous les fichiers sont documentés
2. **AndroidManifest.xml** : Liste complète des permissions
3. **Tests de Permission** : L'app refuse tout accès non autorisé
4. **Logs de Débogage** : Traçabilité de chaque action

## 🔄 Mise à Jour

Si vous souhaitez DÉSACTIVER complètement le système de notifications :

```typescript
// Dans lib/capacitor/app-notifications.ts
export async function requestAutomationPermissions(): Promise<void> {
  // Commentez cette fonction pour désactiver
  return;
}
```

---

**Dernière mise à jour** : Septembre 2026  
**Conformité** : RGPD, Privacy by Design
