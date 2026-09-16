# Architecture de Sécurité SMS

## 🏗️ Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTÈME ANDROID                               │
│                                                                  │
│  📱 SMS Reçu                                                     │
│      │                                                           │
│      ├─────────────────────────────────────────────┐            │
│      │                                              │            │
│      ▼                                              ▼            │
│  ┌─────────────────┐                    ┌──────────────────┐   │
│  │  SmsReceiver    │                    │  NotificationBar │   │
│  │  (Temps Réel)   │                    │  (App SMS)       │   │
│  └─────────────────┘                    └──────────────────┘   │
│      │                                              │            │
│      │                                              ▼            │
│      │                          ┌────────────────────────────┐  │
│      │                          │ MoneyNotificationListener  │  │
│      │                          │ (Écoute Notifications)     │  │
│      │                          └────────────────────────────┘  │
│      │                                              │            │
│      └──────────────────┬───────────────────────────┘            │
│                         ▼                                        │
│              ┌─────────────────────┐                            │
│              │  🔍 FILTRE 1        │                            │
│              │  isSmsPackage()     │                            │
│              │  ✅ SMS uniquement  │                            │
│              │  ❌ WhatsApp rejeté │                            │
│              └─────────────────────┘                            │
│                         │                                        │
│                         ▼                                        │
│              ┌─────────────────────┐                            │
│              │  🔍 FILTRE 2        │                            │
│              │  MoneyTextFilter    │                            │
│              │  ✅ Mots-clés $     │                            │
│              │  ❌ SMS perso rejeté│                            │
│              └─────────────────────┘                            │
│                         │                                        │
│                         ▼                                        │
│              ┌─────────────────────┐                            │
│              │  🔍 FILTRE 3        │                            │
│              │  claimEvent()       │                            │
│              │  Anti-doublon       │                            │
│              │  (90 secondes)      │                            │
│              └─────────────────────┘                            │
│                         │                                        │
│                         ▼                                        │
│              ┌─────────────────────┐                            │
│              │  PendingApiPoster   │                            │
│              │  POST → API         │                            │
│              │  (Token chiffré)    │                            │
│              └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   API Backend           │
            │   /parse-sms            │
            │   Extraction IA         │
            └────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Transaction Pending    │
            │  (En attente)           │
            └────────────────────────┘
```

---

## 🔄 Flux SMS Hors Ligne

```
┌─────────────────────────────────────────────────────────────────┐
│                    DÉMARRAGE SYSTÈME                             │
│                                                                  │
│  🔌 Téléphone redémarre                                          │
│      │                                                           │
│      ▼                                                           │
│  ┌─────────────────────┐                                        │
│  │   BootReceiver      │                                        │
│  │   (Déclenché)       │                                        │
│  └─────────────────────┘                                        │
│      │                                                           │
│      ▼                                                           │
│  ┌─────────────────────┐                                        │
│  │  Token présent ?    │                                        │
│  └─────────────────────┘                                        │
│      │                                                           │
│      │ ✅ Oui                                                    │
│      ▼                                                           │
│  ┌────────────────────────────┐                                 │
│  │  Lecture SMS               │                                 │
│  │  (Dernières 24h)           │                                 │
│  │  content://sms/inbox       │                                 │
│  │  LECTURE SEULE             │                                 │
│  └────────────────────────────┘                                 │
│      │                                                           │
│      ▼                                                           │
│  ┌────────────────────────────┐                                 │
│  │  Pour chaque SMS :         │                                 │
│  │  1. MoneyTextFilter        │ ← Filtre 1                     │
│  │  2. contentFingerprint     │ ← Filtre 2                     │
│  │  3. claimEvent (debounce)  │ ← Filtre 3                     │
│  │  4. POST API (si valide)   │                                 │
│  └────────────────────────────┘                                 │
│      │                                                           │
│      ▼                                                           │
│  ⏹️  Limite : 10 SMS max                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Couches de Sécurité

```
┌───────────────────────────────────────────────────────────────┐
│                    SÉCURITÉ MULTI-COUCHES                      │
│                                                                │
│  COUCHE 1 : Permissions Android                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ✅ RECEIVE_SMS (Lecture seule)                           │ │
│  │ ✅ READ_SMS (Lecture seule)                              │ │
│  │ ❌ SEND_SMS (NON demandée)                               │ │
│  │ ❌ WRITE_SMS (NON demandée)                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  COUCHE 2 : Filtre par Package                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ✅ com.android.messaging                                 │ │
│  │ ✅ com.google.android.apps.messaging                     │ │
│  │ ✅ *.sms, *.mms                                          │ │
│  │ ❌ WhatsApp (rejeté)                                     │ │
│  │ ❌ Messenger (rejeté)                                    │ │
│  │ ❌ Telegram (rejeté)                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  COUCHE 3 : Filtre de Contenu                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ✅ Mots-clés : montant, paiement, transfert             │ │
│  │ ✅ Montants : 5000 FCFA, 1250 XAF                        │ │
│  │ ❌ SMS personnels (rejetés)                              │ │
│  │ ❌ Conversations (rejetées)                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  COUCHE 4 : Anti-Doublon                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🔍 contentFingerprint() : empreinte unique              │ │
│  │ ⏱️  Debounce 90 secondes                                 │ │
│  │ 🗂️  Cache global partagé                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  COUCHE 5 : Chiffrement                                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🔐 Token : AES-256-GCM                                   │ │
│  │ 🔐 EncryptedSharedPreferences                            │ │
│  │ 🔐 HTTPS uniquement                                      │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

---

## 🚫 Ce Qui Est Bloqué

```
┌───────────────────────────────────────────────────────────────┐
│                    APPLICATIONS REJETÉES                       │
│                                                                │
│  ❌ WhatsApp              (com.whatsapp)                       │
│  ❌ Messenger             (com.facebook.orca)                  │
│  ❌ Telegram              (org.telegram.messenger)             │
│  ❌ Instagram             (com.instagram.android)              │
│  ❌ Twitter/X             (com.twitter.android)                │
│  ❌ Snapchat              (com.snapchat.android)               │
│  ❌ Gmail                 (com.google.android.gm)              │
│  ❌ Outlook               (com.microsoft.office.outlook)       │
│  ❌ Slack                 (com.slack)                          │
│  ❌ Discord               (com.discord)                        │
│  ❌ Signal                (org.thoughtcrime.securesms)         │
│  ❌ WeChat                (com.tencent.mm)                     │
│                                                                │
│  ✅ UNIQUEMENT : Applications SMS système Android             │
└───────────────────────────────────────────────────────────────┘
```

---

## 📊 Flux de Données

```
┌───────────────────────────────────────────────────────────────┐
│                    TRAITEMENT DES DONNÉES                      │
│                                                                │
│  📱 SMS Brut                                                   │
│  "Vous avez reçu 5000 FCFA de Jean. Solde: 15000 FCFA"       │
│                                                                │
│      │ Filtre 1 : Package SMS ?                               │
│      ▼ ✅ Oui                                                  │
│                                                                │
│      │ Filtre 2 : Contenu monétaire ?                         │
│      ▼ ✅ Oui (détecté "5000 FCFA")                           │
│                                                                │
│      │ Filtre 3 : Doublon ?                                   │
│      ▼ ✅ Non (nouveau)                                        │
│                                                                │
│  📤 Envoi API                                                  │
│  POST /parse-sms                                               │
│  {                                                             │
│    "text": "Vous avez reçu 5000 FCFA..."                      │
│  }                                                             │
│                                                                │
│      │ ❌ Pas de numéro de téléphone                          │
│      │ ❌ Pas d'expéditeur                                    │
│      │ ❌ Pas d'horodatage précis                             │
│      ▼                                                         │
│                                                                │
│  🤖 Backend : Extraction IA                                    │
│  {                                                             │
│    "amount": 5000,                                             │
│    "type": "income",                                           │
│    "description": "Reçu de Jean",                             │
│    "confidence": 0.95                                          │
│  }                                                             │
│                                                                │
│      │ ✅ Transaction uniquement                              │
│      ▼                                                         │
│                                                                │
│  💾 Base de Données                                            │
│  Transaction en attente (validation utilisateur)               │
│                                                                │
│  ❌ SMS brut NON stocké                                        │
│  ❌ Numéro téléphone NON stocké                                │
│  ❌ Métadonnées NON stockées                                   │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔧 Composants Techniques

### 1. SmsReceiver
```java
// TEMPS RÉEL : Reçoit SMS instantanément
android.provider.Telephony.SMS_RECEIVED

Fonctionnalités :
✅ Lecture du SMS brut
✅ Filtre monétaire
✅ Envoi async à l'API
❌ Pas d'envoi de SMS
❌ Pas de modification
```

### 2. MoneyNotificationListener
```java
// NOTIFICATIONS : Écoute notifications SMS uniquement
NotificationListenerService

Fonctionnalités :
✅ Filtre par package (SMS uniquement)
✅ Extraction texte notification
✅ Système anti-doublon
❌ Rejette toutes les autres apps
```

### 3. BootReceiver
```java
// DÉMARRAGE : Traite SMS manqués
BOOT_COMPLETED, MY_PACKAGE_REPLACED

Fonctionnalités :
✅ Lecture SMS dernières 24h
✅ Filtre monétaire
✅ Limite 10 SMS max
❌ Pas de modification BD SMS
```

### 4. MoneyTextFilter
```java
// FILTRE : Détecte SMS monétaires
Mots-clés + Regex montants

Fonctionnalités :
✅ Détection rapide (pas d'IA)
✅ Support multi-devises
✅ Packages Mobile Money
❌ Pas de faux positifs SMS perso
```

---

## 🧪 Tests de Sécurité

```
┌───────────────────────────────────────────────────────────────┐
│                    TESTS AUTOMATISÉS                           │
│                                                                │
│  Test 1 : Filtre Package                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ✅ com.android.messaging → ACCEPTÉ                       │ │
│  │ ❌ com.whatsapp → REJETÉ                                 │ │
│  │ ❌ com.facebook.orca → REJETÉ                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Test 2 : Filtre Contenu                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ✅ "Paiement 5000 FCFA" → ACCEPTÉ                        │ │
│  │ ❌ "Salut comment ça va ?" → REJETÉ                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Test 3 : Sécurité URL                                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ✅ https://railway.app → ACCEPTÉ                         │ │
│  │ ❌ http://malicious.com → REJETÉ                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Exécution :                                                   │
│  $ ./gradlew test                                              │
│  $ 8/8 tests passed ✅                                         │
└───────────────────────────────────────────────────────────────┘
```

---

## 📱 Interface Utilisateur

```
┌───────────────────────────────────────────────────────────────┐
│                    PAGE PARAMÈTRES                             │
│                                                                │
│  ⚙️  Devise                                                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ FCFA (XAF)                                            ▼  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  📱 Automatisation                                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 📱 Détection Automatique SMS                             │ │
│  │                                             ✅ Activée    │ │
│  │                                                          │ │
│  │ 🛡️  Garanties de Sécurité                               │ │
│  │ ✓ Lit uniquement les SMS de transactions                │ │
│  │ ✓ Ne peut ni répondre, ni modifier                      │ │
│  │ ✓ N'accède à aucune autre notification                  │ │
│  │                                                          │ │
│  │ [Gérer les Permissions]                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  👤 Mon profil                                                 │
│  ℹ️  À propos                                                  │
│  📥 Exporter tout                                              │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔐 Garanties Finales

### ✅ Ce que le système FAIT
1. Lit les SMS de l'app SMS système Android
2. Extrait les informations de transaction
3. Filtre automatiquement les SMS non pertinents
4. Traite les SMS reçus hors ligne
5. Chiffre le token d'authentification

### ❌ Ce que le système NE FAIT PAS
1. Ne lit PAS WhatsApp, Messenger, Telegram, etc.
2. Ne peut PAS répondre aux SMS
3. Ne peut PAS envoyer de SMS
4. Ne peut PAS modifier les SMS
5. Ne collecte PAS les numéros de téléphone
6. Ne collecte PAS les métadonnées personnelles
7. Ne stocke PAS les SMS bruts
8. Ne partage PAS les données avec des tiers

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

1. **`SECURITE_SMS.md`** - Garanties de sécurité complètes
2. **`MODIFICATIONS_SMS.md`** - Guide technique et tests
3. **`CHANGELOG_SMS_SECURITY.md`** - Historique des changements
4. **`RESUME_MODIFICATIONS_SMS.md`** - Résumé exécutif

---

**Architecture conçue pour la sécurité et la confidentialité maximales** 🔒
