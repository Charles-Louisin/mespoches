# MES POCHES — Application Android (Capacitor) et Google Play Store

Ce guide suppose que votre **frontend Next.js** et votre **API backend** sont déjà en **HTTPS** (ex. Vercel + Railway).

L’app Android est une **coquille native** (Capacitor) qui affiche votre site en plein écran, comme un navigateur dédié.

---

## 1. Prérequis (à installer une fois)

| Outil | Rôle |
|--------|------|
| **Node.js** 18+ | Déjà utilisé pour le projet |
| **Android Studio** | Compiler, émulateur, générer le fichier AAB |
| **JDK 17** | Souvent inclus avec Android Studio |

Dans Android Studio, au premier lancement :
- **More Actions** → **SDK Manager** → installez **Android SDK Platform 34** (ou plus récent) et **Android SDK Build-Tools**.

---

## 2. Variables à configurer

### 2.1 Fichier `.env.local` (frontend, pour le site web)

```env
NEXT_PUBLIC_API_URL=https://VOTRE-BACKEND.up.railway.app/api
NEXT_PUBLIC_APP_URL=https://VOTRE-FRONTEND.vercel.app
NEXT_PUBLIC_CONTACT_EMAIL=votre-email@domaine.com
```

Déployez le frontend après modification pour que les pages légales et l’API soient accessibles en ligne.

### 2.2 URL Capacitor (à chaque `cap sync`)

L’app Android charge cette URL. **Remplacez** par votre vrai frontend HTTPS :

**PowerShell (Windows) :**

```powershell
cd C:\realProject\note
$env:CAPACITOR_SERVER_URL="https://VOTRE-FRONTEND.vercel.app"
npm run cap:sync
```

**Invite de commandes (cmd) :**

```cmd
set CAPACITOR_SERVER_URL=https://VOTRE-FRONTEND.vercel.app
npm run cap:sync
```

Vérifiez dans `android/app/src/main/assets/capacitor.config.json` que `"url"` pointe bien vers votre domaine.

### 2.3 Backend Railway

```env
CORS_ORIGIN=https://VOTRE-FRONTEND.vercel.app
APP_URL=https://VOTRE-FRONTEND.vercel.app
API_PUBLIC_URL=https://VOTRE-BACKEND.up.railway.app
```

---

## 3. Pages légales (Play Store)

URLs publiques à utiliser dans la fiche Google Play :

| Document | URL |
|----------|-----|
| Politique de confidentialité | `https://VOTRE-FRONTEND/legal/privacy` |
| Conditions d’utilisation | `https://VOTRE-FRONTEND/legal/terms` |
| Mentions légales | `https://VOTRE-FRONTEND/legal/mentions` |
| Suppression de compte | Depuis l’app : **Profil** → supprimer le compte |

Accessible aussi dans l’app : **Paramètres** → **Informations légales**.

---

## 4. Ouvrir le projet dans Android Studio (1ère fois)

1. Ouvrez **Android Studio**.
2. **File** → **Open**.
3. Choisissez le dossier :  
   `C:\realProject\note\android`  
   (pas la racine `note`, bien le sous-dossier **`android`**).
4. Attendez la fin de **Gradle Sync** (barre en bas). En cas d’erreur :
   - **File** → **Sync Project with Gradle Files**
   - Ou cliquez sur **Trust Project** si demandé.

---

## 5. Tester sur un téléphone Android (USB)

1. Sur le téléphone : **Paramètres** → **Options développeur** → activez **Débogage USB**.
2. Branchez le téléphone en USB.
3. Dans Android Studio, en haut, liste des appareils : sélectionnez votre téléphone.
4. Cliquez sur le bouton vert **Run (▶)**.
5. L’app **MES POCHES** s’installe et ouvre votre site HTTPS.

**Tests à faire :**
- Connexion / inscription
- Création d’une transaction
- Abonnement Premium (sandbox CinetPay si configuré)
- Retour après paiement
- Pages **Paramètres** → **Informations légales**

---

## 6. Tester sur un émulateur Android

1. Android Studio → **Device Manager** (icône téléphone).
2. **Create Device** → ex. Pixel 6 → système **API 34** → Finish.
3. Lancez l’émulateur (▶ sur la ligne du device).
4. Sélectionnez l’émulateur dans la barre d’outils → **Run (▶)**.

L’émulateur a Internet : votre URL HTTPS doit être accessible publiquement.

---

## 7. Générer un AAB pour le Play Store

Google Play exige un **Android App Bundle** (`.aab`), pas seulement un APK.

1. **Build** → **Generate Signed Bundle / APK**.
2. Choisissez **Android App Bundle** → Next.
3. **Create new...** (keystore) si première publication :
   - Chemin du fichier `.jks` (gardez-le **en lieu sûr**, sauvegardez le mot de passe).
   - Alias, mots de passe, validité (ex. 25 ans).
4. **release** → Finish.
5. Le fichier est généré sous :  
   `android/app/release/app-release.aab`  
   (ou chemin indiqué à la fin du wizard).

Conservez le keystore : **obligatoire** pour toutes les mises à jour futures sur le Play Store.

---

## 8. Fiche Google Play Console (résumé)

1. Compte [Google Play Console](https://play.google.com/console) (frais d’inscription unique).
2. **Créer une application** → nom **MES POCHES**.
3. **Fiche Play Store** : description, captures d’écran (téléphone), icône 512×512.
4. **Politique de confidentialité** : URL `…/legal/privacy`.
5. **Catégorie** : Finance (ou Productivité selon votre positionnement).
6. **Données utilisateur** (formulaire Data safety) : aligné sur la politique de confidentialité (e-mail, données financiées saisies, paiement via CinetPay).
7. **Compte supprimable** : oui, dans l’application (Profil).
8. Téléversez l’**AAB** en **Production** ou **Test interne** pour essai.

---

## 9. Commandes utiles

| Commande | Action |
|----------|--------|
| `npm run cap:sync` | Copie config + plugins vers `android/` (définir `CAPACITOR_SERVER_URL` avant) |
| `npm run cap:open:android` | Ouvre le projet dans Android Studio |
| `npm run cap:copy` | Copie uniquement les assets web |

Après chaque changement de **URL de production** ou de plugin Capacitor :

```powershell
$env:CAPACITOR_SERVER_URL="https://VOTRE-FRONTEND.vercel.app"
npm run cap:sync
```

Puis rebuild dans Android Studio.

---

## 10. Identifiants de l’app

| Champ | Valeur |
|--------|--------|
| Package (applicationId) | `com.mespoches.app` |
| Nom affiché | MES POCHES |
| Version | `1.0.0` (dans `package.json`, à incrémenter à chaque publication) |

Pour changer la version Android : `android/app/build.gradle` → `versionCode` (entier, +1 à chaque upload) et `versionName`.

---

## 11. Dépannage

| Problème | Piste |
|----------|--------|
| Écran blanc au lancement | `CAPACITOR_SERVER_URL` incorrect ou site injoignable ; revérifier `cap sync`. |
| Erreur API / CORS | `CORS_ORIGIN` sur le backend = URL exacte du frontend. |
| Gradle sync failed | Android Studio → SDK Manager, installer API 34 + Build-Tools. |
| Paiement CinetPay | Les redirections externes fonctionnent dans la WebView ; tester en release, pas seulement debug. |

---

## 12. Checklist avant publication

- [ ] Frontend HTTPS déployé avec `NEXT_PUBLIC_API_URL` correct
- [ ] Pages `/legal/privacy`, `/legal/terms`, `/legal/mentions` accessibles sans login
- [ ] `NEXT_PUBLIC_CONTACT_EMAIL` renseigné (recommandé)
- [ ] `CAPACITOR_SERVER_URL` = URL frontend, puis `npm run cap:sync`
- [ ] Test login + paiement + légal sur téléphone réel
- [ ] AAB signé généré et uploadé
- [ ] Captures d’écran et politique de confidentialité dans Play Console
