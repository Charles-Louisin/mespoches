# 🧪 Guide de Test - Système SMS Sécurisé

## ✅ Checklist de Validation

Utilisez ce guide pour valider que toutes les modifications fonctionnent correctement.

---

## 🏁 Tests Préliminaires

### ✅ Test 1 : Compilation du Code

```powershell
# Dans le répertoire du projet
npm install
npm run cap:sync

# Vérifier qu'il n'y a pas d'erreurs
```

**Résultat attendu** : ✅ Aucune erreur de compilation

---

### ✅ Test 2 : Tests Unitaires

```powershell
cd android
./gradlew test
```

**Résultat attendu** :
```
SmsSecurityTest > testOnlySmsPackagesAreAccepted PASSED
SmsSecurityTest > testNonSmsPackagesAreRejected PASSED
SmsSecurityTest > testMoneyTextFilter PASSED
SmsSecurityTest > testPersonalSmsAreRejected PASSED
SmsSecurityTest > testContentFingerprinting PASSED
SmsSecurityTest > testApiUrlSanitization PASSED

BUILD SUCCESSFUL
```

---

## 📱 Tests sur Appareil Réel

### Prérequis
- Appareil Android (version 6.0+)
- Connexion USB activée
- Mode développeur activé
- `adb` installé

---

### ✅ Test 3 : Installation de l'App

```powershell
# Compiler l'APK de debug
cd android
./gradlew assembleDebug

# Installer sur l'appareil
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Résultat attendu** : ✅ App installée sans erreur

---

### ✅ Test 4 : Vérification des Permissions

```powershell
# Lister les permissions de l'app
adb shell dumpsys package com.mespoches.app | grep permission
```

**Résultat attendu** :
```
✅ android.permission.RECEIVE_SMS: granted=true
✅ android.permission.READ_SMS: granted=true
✅ android.permission.RECEIVE_BOOT_COMPLETED: granted=true
❌ android.permission.SEND_SMS: NON présente
❌ android.permission.WRITE_SMS: NON présente
```

---

### ✅ Test 5 : Filtre SMS (Positif)

**Objectif** : Vérifier que les SMS monétaires sont bien détectés

**Procédure** :
1. Ouvrez l'app MES POCHES
2. Connectez-vous
3. Allez dans Paramètres → Automatisation
4. Activez "Détection Automatique SMS"
5. Envoyez-vous un SMS de test :

```
Paiement de 5000 FCFA effectué avec succès.
Transaction ID: PP123456
Solde actuel: 25000 FCFA
```

**Résultat attendu** :
- ✅ Notification "Transaction prête"
- ✅ Transaction apparaît dans "À valider"
- ✅ Montant : 5000 FCFA
- ✅ Type : Dépense

**Vérifier les logs** :
```powershell
adb logcat | grep MesPoches
```

---

### ✅ Test 6 : Filtre SMS (Négatif - SMS Personnel)

**Objectif** : Vérifier que les SMS personnels sont ignorés

**Procédure** :
1. Envoyez-vous un SMS personnel :

```
Salut ! Comment ça va ? On se voit ce soir ?
```

**Résultat attendu** :
- ❌ AUCUNE notification de transaction
- ❌ AUCUNE transaction créée
- ✅ SMS ignoré automatiquement

**Vérifier les logs** :
```powershell
adb logcat | grep MesPoches
# Devrait afficher : "Not money related" ou rien
```

---

### ✅ Test 7 : Filtre WhatsApp (Négatif)

**Objectif** : Vérifier que WhatsApp est rejeté

**Procédure** :
1. Envoyez-vous un message WhatsApp contenant :

```
Transfert de 10000 FCFA effectué
```

**Résultat attendu** :
- ❌ AUCUNE notification de transaction
- ❌ AUCUNE transaction créée
- ✅ Message WhatsApp ignoré (filtre package)

**Vérifier les logs** :
```powershell
adb logcat | grep MesPoches
# Ne devrait rien afficher (rejeté avant traitement)
```

---

### ✅ Test 8 : SMS Hors Ligne

**Objectif** : Vérifier que les SMS reçus hors ligne sont traités

**Procédure** :
1. Fermez complètement l'app MES POCHES
2. Activez le **mode avion** sur votre téléphone
3. Depuis un autre téléphone, envoyez un SMS monétaire :

```
Vous avez reçu 7500 FCFA de Marie.
Transaction réussie.
```

4. Attendez 30 secondes
5. Désactivez le mode avion
6. Redémarrez l'app MES POCHES

**Résultat attendu** :
- ✅ Transaction apparaît dans "À valider"
- ✅ Montant : 7500 FCFA
- ✅ Traitée automatiquement au redémarrage

**Vérifier les logs** :
```powershell
adb logcat | grep BootReceiver
# Devrait afficher : "Processing missed SMS"
```

---

### ✅ Test 9 : Anti-Doublon

**Objectif** : Vérifier qu'un même SMS n'est pas traité deux fois

**Procédure** :
1. Envoyez un SMS monétaire :

```
Retrait de 3000 FCFA. Transaction ID: TX987654
```

2. Attendez 10 secondes
3. Envoyez **exactement le même SMS** à nouveau

**Résultat attendu** :
- ✅ Première transaction créée
- ❌ Deuxième SMS ignoré (doublon détecté)
- ✅ Une seule transaction dans "À valider"

**Vérifier les logs** :
```powershell
adb logcat | grep MesPoches
# Devrait afficher : "Skip duplicate" ou "Doublon ignoré"
```

---

### ✅ Test 10 : Interface Utilisateur

**Objectif** : Vérifier que l'UI est fonctionnelle

**Procédure** :
1. Ouvrez l'app MES POCHES
2. Allez dans **Paramètres**
3. Trouvez la section **"Automatisation"**

**Résultat attendu** :
- ✅ Section visible avec icône 📱
- ✅ Composant "Détection Automatique SMS"
- ✅ État affiché (Activée/Désactivée)
- ✅ Garanties de sécurité visibles
- ✅ Bouton "Gérer les Permissions"

---

### ✅ Test 11 : Désactivation

**Objectif** : Vérifier qu'on peut désactiver la fonctionnalité

**Procédure** :
1. Paramètres Android → Applications
2. MES POCHES → Permissions
3. **Désactiver** : SMS
4. **Désactiver** : Accès aux notifications
5. Envoyez un SMS monétaire

**Résultat attendu** :
- ❌ AUCUNE transaction créée
- ✅ App continue de fonctionner normalement
- ✅ Autres fonctionnalités non affectées

---

### ✅ Test 12 : Réactivation

**Objectif** : Vérifier qu'on peut réactiver après désactivation

**Procédure** :
1. Dans l'app : Paramètres → Automatisation
2. Cliquer sur "Activer la Détection SMS"
3. Suivre les instructions
4. Envoyer un SMS monétaire

**Résultat attendu** :
- ✅ Permissions accordées
- ✅ SMS détecté à nouveau
- ✅ Transaction créée

---

## 🔍 Tests de Sécurité Avancés

### ✅ Test 13 : Tentative d'Envoi SMS (Doit Échouer)

**Objectif** : Vérifier qu'aucun SMS ne peut être envoyé

```powershell
# Vérifier le code source
grep -r "SmsManager" android/app/src/main/java/
```

**Résultat attendu** :
- ❌ AUCUNE occurrence de `SmsManager`
- ❌ AUCUN code d'envoi SMS
- ✅ Lecture seule confirmée

---

### ✅ Test 14 : Vérification Permissions Manifeste

```powershell
# Lire le manifeste
cat android/app/src/main/AndroidManifest.xml | grep permission
```

**Résultat attendu** :
```xml
✅ <uses-permission android:name="android.permission.RECEIVE_SMS" />
✅ <uses-permission android:name="android.permission.READ_SMS" />
✅ <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
❌ PAS de SEND_SMS
❌ PAS de WRITE_SMS
```

---

### ✅ Test 15 : Chiffrement du Token

**Objectif** : Vérifier que le token est bien chiffré

```powershell
# Extraire les SharedPreferences
adb shell "run-as com.mespoches.app cat /data/data/com.mespoches.app/shared_prefs/mespoches_sms_enc.xml"
```

**Résultat attendu** :
- ✅ Fichier chiffré (valeurs en base64 illisibles)
- ❌ Token NON lisible en clair
- ✅ AES-256-GCM utilisé

---

### ✅ Test 16 : Filtrage Multi-App

**Objectif** : Tester plusieurs apps de messagerie

**Procédure** :
Envoyer un message contenant "5000 FCFA" depuis :
1. ✅ Application SMS système → Devrait être traité
2. ❌ WhatsApp → Devrait être ignoré
3. ❌ Messenger → Devrait être ignoré
4. ❌ Telegram → Devrait être ignoré
5. ❌ Gmail → Devrait être ignoré

**Résultat attendu** :
- ✅ Seul le SMS système est traité
- ❌ Toutes les autres apps sont ignorées

---

## 📊 Tableau de Résultats

| # | Test | Résultat | Notes |
|---|------|----------|-------|
| 1 | Compilation | ⬜ | |
| 2 | Tests unitaires | ⬜ | |
| 3 | Installation | ⬜ | |
| 4 | Permissions | ⬜ | |
| 5 | SMS monétaire | ⬜ | |
| 6 | SMS personnel | ⬜ | |
| 7 | WhatsApp | ⬜ | |
| 8 | SMS hors ligne | ⬜ | |
| 9 | Anti-doublon | ⬜ | |
| 10 | Interface UI | ⬜ | |
| 11 | Désactivation | ⬜ | |
| 12 | Réactivation | ⬜ | |
| 13 | Envoi SMS | ⬜ | |
| 14 | Permissions manifeste | ⬜ | |
| 15 | Chiffrement | ⬜ | |
| 16 | Filtrage multi-app | ⬜ | |

**Légende** : ⬜ À tester | ✅ Réussi | ❌ Échoué

---

## 🐛 Résolution de Problèmes

### Problème : SMS non détecté

**Solutions** :
1. Vérifier les permissions dans Paramètres Android
2. Vérifier que l'app SMS système est bien celle attendue
3. Consulter les logs : `adb logcat | grep MesPoches`
4. Vérifier que le token est présent (utilisateur connecté)

### Problème : Doublon détecté à tort

**Solutions** :
1. Attendre 90 secondes entre deux envois
2. Modifier légèrement le texte du SMS
3. Vérifier le système de fingerprint dans les logs

### Problème : Tests unitaires échouent

**Solutions** :
1. Nettoyer le build : `./gradlew clean`
2. Re-compiler : `./gradlew assembleDebug`
3. Vérifier la version Android SDK (min API 23)

### Problème : Permission refusée

**Solutions** :
1. Paramètres Android → Applications → MES POCHES
2. Permissions → Activer SMS
3. Accès spécial → Notifications → Activer

---

## 📝 Logs Utiles

### Voir tous les logs MES POCHES
```powershell
adb logcat | grep -E "MesPoches|MesPochesSms|MesPochesNotif|MesPochesPending|MesPochesBootReceiver"
```

### Voir uniquement les erreurs
```powershell
adb logcat *:E | grep MesPoches
```

### Voir les SMS traités
```powershell
adb logcat | grep "Money notification detected\|Money SMS detected"
```

### Voir les rejets
```powershell
adb logcat | grep "Skip duplicate\|Not money related\|rejected"
```

---

## ✅ Validation Finale

Pour valider le système complet :

1. ✅ Tous les tests unitaires passent
2. ✅ Test 5 (SMS monétaire) réussi
3. ✅ Test 6 (SMS personnel) réussi
4. ✅ Test 7 (WhatsApp) réussi
5. ✅ Test 8 (Hors ligne) réussi
6. ✅ Aucune permission d'envoi SMS
7. ✅ Chiffrement token validé
8. ✅ Interface utilisateur fonctionnelle

**Si tous les tests passent : Système validé ! ✅**

---

## 📞 Support

Si un test échoue :
1. Consulter `SECURITE_SMS.md`
2. Vérifier les logs avec les commandes ci-dessus
3. Relancer les tests après corrections

---

**Date** : Septembre 2026  
**Version** : 2.0.0 (Système SMS Sécurisé)
