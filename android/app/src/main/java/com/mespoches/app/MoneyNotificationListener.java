package com.mespoches.app;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class MoneyNotificationListener extends NotificationListenerService {
    private static final String TAG = "MesPochesNotif";
    /** Évite re-posts Android (updates) et SMS+notif quasi simultanés. */
    private static final long DEBOUNCE_MS = 90_000L;
    private static final ConcurrentHashMap<String, Long> RECENT_KEYS = new ConcurrentHashMap<>();

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null) return;

        // Ne jamais ré-analyser nos propres notifications (boucle "transaction" / montants).
        String packageName = sbn.getPackageName();
        if (packageName != null && packageName.equals(getPackageName())) {
            return;
        }
        if (sbn.isOngoing()) return;

        String token = SmsMonitorPlugin.getStoredToken(this);
        if (token == null || token.isEmpty()) return;

        String fullText = NotificationTextExtractor.extract(sbn);
        if (fullText.isEmpty()) return;

        if (!MoneyTextFilter.isMoneyRelated(fullText, packageName)) {
            return;
        }

        String debounceKey = "txt|" + Integer.toHexString(fullText.hashCode());
        String fp = contentFingerprint(fullText);
        if (claimEvent(debounceKey, fp)) {
            if (Log.isLoggable(TAG, Log.DEBUG)) {
                Log.d(TAG, "Skip duplicate notification event");
            }
            return;
        }

        String title = NotificationTextExtractor.title(sbn);
        String body = fullText;
        if (!title.isEmpty() && body.toLowerCase().startsWith(title.toLowerCase())) {
            body = body.substring(title.length()).trim();
        }
        if (body.isEmpty()) body = fullText;

        if (Log.isLoggable(TAG, Log.DEBUG)) {
            Log.d(TAG, "Money notification detected pkg=" + packageName);
        }

        final String fTitle = title.isEmpty() ? "Notification" : title;
        final String fBody = body;
        final String fPackage = packageName == null ? "" : packageName;
        final String fFingerprint = fp;
        final String authToken = token;
        final String apiBase = SmsMonitorPlugin.getApiBase(this);

        new Thread(() ->
            PendingApiPoster.postNotification(
                MoneyNotificationListener.this, apiBase, authToken, fTitle, fBody, fPackage, fFingerprint)
        ).start();
    }

    /** Partagé avec SmsReceiver pour éviter double traitement SMS + notif. */
    static boolean claimEvent(String primaryKey, String contentFingerprint) {
        long now = System.currentTimeMillis();
        pruneOld(now);

        if (contentFingerprint != null && !contentFingerprint.isEmpty()) {
            String fpKey = "fp|" + contentFingerprint;
            Long prevFp = RECENT_KEYS.put(fpKey, now);
            if (prevFp != null && (now - prevFp) < DEBOUNCE_MS) {
                return true;
            }
        }

        if (primaryKey != null && !primaryKey.isEmpty()) {
            Long prev = RECENT_KEYS.put(primaryKey, now);
            if (prev != null && (now - prev) < DEBOUNCE_MS) {
                return true;
            }
        }
        return false;
    }

    /** Annule le claim (échec parse) pour laisser passer une mise à jour plus complète. */
    static void releaseFingerprint(String contentFingerprint) {
        if (contentFingerprint == null || contentFingerprint.isEmpty()) return;
        RECENT_KEYS.remove("fp|" + contentFingerprint);
    }

    /** Clé stable basée sur montants / ID présents dans le texte. */
    static String contentFingerprint(String text) {
        if (text == null) return "";
        String lower = text.toLowerCase().replaceAll("\\s+", " ").trim();
        StringBuilder sb = new StringBuilder();
        java.util.regex.Matcher id = java.util.regex.Pattern
            .compile("(?:id(?:\\s+de)?\\s+transaction\\s*:\\s*|transaction\\s+id\\s*:\\s*|\\b(?:pp|mp|co)\\d{6}\\.\\d{4}\\.[a-z0-9.]+)",
                java.util.regex.Pattern.CASE_INSENSITIVE)
            .matcher(lower);
        if (id.find()) {
            sb.append("id:").append(id.group().replaceAll("\\s+", "")).append('|');
        }
        java.util.regex.Matcher amounts = java.util.regex.Pattern
            .compile("(\\d{1,3}([\\s.,]\\d{3})+|\\d+)([\\s.,]\\d{1,2})?\\s*(fcfa|xaf|cfa|f\\b)")
            .matcher(lower);
        int n = 0;
        while (amounts.find() && n < 3) {
            sb.append(amounts.group().replaceAll("\\s+", "")).append('|');
            n++;
        }
        if (sb.length() == 0) {
            // Fallback : empreinte courte du texte normalisé
            sb.append(lower.replaceAll("\\d", "#").substring(0, Math.min(120, lower.length())));
        }
        return sb.toString();
    }

    private static void pruneOld(long now) {
        if (RECENT_KEYS.size() < 80) return;
        Iterator<Map.Entry<String, Long>> it = RECENT_KEYS.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, Long> e = it.next();
            if (now - e.getValue() > DEBOUNCE_MS * 2) {
                it.remove();
            }
        }
    }
}
