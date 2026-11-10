# Landing MES POCHES — démarche de design

## 1. Empathie — pour qui ?
- Salarié·e, commerçant·e, étudiant·e en Afrique de l'Ouest et du Centre qui jongle entre **cash, mobile money (Orange, MTN, Wave…) et banque**.
- Les SMS de transaction s'empilent, les tickets se perdent, et noter chaque dépense à la main lasse au bout de trois jours.
- Arrive en majorité **sur mobile, depuis un lien partagé** (WhatsApp, statut), souvent avec une connexion moyenne.
- Méfiance légitime : « une app qui lit mes SMS ? », « un APK hors Play Store, c'est sûr ? », « combien ça coûte vraiment ? ».

## 2. Définition — le problème à résoudre
> « Je gagne de l'argent, je le dépense, et je ne sais jamais où il est passé — parce que le noter prend trop d'effort. »

La page doit prouver en moins de 10 secondes que **l'app fait la saisie à votre place** (SMS, photo, voix), et lever les trois objections (confiance, installation APK, prix) avant le bouton de téléchargement.

## 3. Idéation — décisions retenues
| Besoin | Réponse sur la page |
| - | - |
| Comprendre en 10 s | Titre-promesse « Chaque franc retrouve sa poche » + téléphone qui reçoit un SMS et propose la ligne |
| Croire que c'est sans effort | Section « Comment ça marche » en 3 temps (Capturer → Valider → Comprendre) avec l'écran qui change au scroll |
| Se reconnaître | Rangée d'opérateurs (Orange Money, MTN MoMo, Wave, Moov, Airtel, M-Pesa…) et poches Cash / MoMo / Banque |
| Confiance | Micro-preuves sous chaque CTA : « 1 mois Pro offert · sans carte · gratuit pour toujours en version de base » ; FAQ SMS/données |
| Peur de l'APK | Le bouton ouvre le guide Play Protect (déjà éprouvé) au lieu de télécharger à l'aveugle |
| Prix clairs | 4 forfaits réels (Gratuit, Pro, Pro+, Business), bascule mensuel/annuel −20 %, paiement mobile money 21 pays ou carte |
| Toujours un CTA à portée | Barre de téléchargement collante sur mobile dès que le hero sort de l'écran |

## 4. Prototype — principes d'interface
- Couleurs de l'app (tokens `mes-poches-mobile/src/theme/tokens.ts`) : bleu `#2563EB` / `#1D4ED8`, fond blanc, surfaces `#F8F9FA`, texte `#111111`, succès `#12B76A`, danger `#F04438`.
- Police de l'app : **Outfit**.
- Mouvement au service de la compréhension : loader court (< 1,2 s, une seule fois par session), révélations au scroll, téléphone collant qui illustre l'étape lue. Tout est désactivé avec `prefers-reduced-motion`.
- Aucune dépendance d'animation ajoutée : IntersectionObserver + CSS (composite-only : `transform`, `opacity`).

## 5. Test — ce qu'on vérifie
- Mobile 375 px : aucun défilement horizontal, CTA visible au premier écran, barre collante.
- Desktop : téléphone collant synchronisé avec les étapes.
- Chaque CTA mène à une action précise : guide d'installation, section tarifs, FAQ.
