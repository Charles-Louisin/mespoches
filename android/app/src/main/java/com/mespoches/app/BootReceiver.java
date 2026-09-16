package com.mespoches.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.util.Log;
import java.util.HashSet;
import java.util.Set;

/**
 * TRAITEMENT DES SMS HORS LIGNE
 * 
 * Traite les SMS reçus pendant que l'application était fermée ou hors ligne.
 * Garantit qu'aucun SMS monétaire n'est manqué.
 * 
 * SÉCURITÉ & CONFIDENTIALITÉ :
 * - Ne lit QUE les SMS (pas d'autres données)
 * - Filtre uniquement les SMS liés à l'argent (MoneyTextFilter)
 * - Ne peut pas répondre ni modifier les SMS
 * - Ne collecte pas les données utilisateur
 * - Respecte le système de debounce pour éviter les doublons
 */
public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "MesPochesBootReceiver";
    private static final long LOOKBACK_MS = 24 * 60 * 60 * 1000L; // 24 heures

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        
        // Déclenché au démarrage du téléphone ou de l'application
        if (!"android.intent.action.BOOT_COMPLETED".equals(action) && 
            !"android.intent.action.MY_PACKAGE_REPLACED".equals(action)) {
            return;
        }

        String token = SmsMonitorPlugin.getStoredToken(context);
        if (token == null || token.isEmpty()) {
            // Pas de connexion utilisateur, pas de traitement
            return;
        }

        // Traiter les SMS récents en arrière-plan
        new Thread(() -> processMissedSms(context)).start();
    }

    /**
     * Lit les SMS récents de la boîte de réception pour détecter
     * les transactions reçues hors ligne.
     */
    private void processMissedSms(Context context) {
        try {
            long cutoff = System.currentTimeMillis() - LOOKBACK_MS;
            Uri uri = Uri.parse("content://sms/inbox");
            
            // LECTURE SEULE : Projection limitée aux colonnes nécessaires
            String[] projection = {"_id", "address", "body", "date"};
            String selection = "date > ?";
            String[] selectionArgs = {String.valueOf(cutoff)};
            
            Cursor cursor = context.getContentResolver().query(
                uri, 
                projection, 
                selection, 
                selectionArgs, 
                "date DESC"
            );

            if (cursor == null) return;

            Set<String> processedFingerprints = new HashSet<>();
            String token = SmsMonitorPlugin.getStoredToken(context);
            String apiBase = SmsMonitorPlugin.getApiBase(context);
            
            int bodyIndex = cursor.getColumnIndex("body");
            if (bodyIndex == -1) {
                cursor.close();
                return;
            }

            while (cursor.moveToNext()) {
                String body = cursor.getString(bodyIndex);
                if (body == null || body.isEmpty()) continue;

                // Filtre : uniquement les SMS liés à l'argent
                if (!MoneyTextFilter.isMoneyRelated(body)) continue;

                // Éviter les doublons avec le système de fingerprint
                String fp = MoneyNotificationListener.contentFingerprint(body);
                if (processedFingerprints.contains(fp)) continue;
                processedFingerprints.add(fp);

                // Vérifier si déjà traité via le cache global
                if (MoneyNotificationListener.claimEvent("boot|" + fp, fp)) {
                    continue;
                }

                // Envoyer à l'API pour analyse
                if (Log.isLoggable(TAG, Log.DEBUG)) {
                    Log.d(TAG, "Processing missed SMS");
                }
                PendingApiPoster.postSms(
                    context.getApplicationContext(),
                    apiBase,
                    token,
                    body,
                    fp
                );

                // Limiter à 10 SMS pour éviter surcharge au démarrage
                if (processedFingerprints.size() >= 10) break;
            }

            cursor.close();
            
            if (!processedFingerprints.isEmpty()) {
                Log.i(TAG, "Processed " + processedFingerprints.size() + " missed SMS");
            }
            
        } catch (SecurityException e) {
            // Permission READ_SMS non accordée
            Log.w(TAG, "Cannot read SMS: permission denied");
        } catch (Exception e) {
            Log.e(TAG, "Error processing missed SMS", e);
        }
    }
}
