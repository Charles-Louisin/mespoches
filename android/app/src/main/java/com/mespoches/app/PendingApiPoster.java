package com.mespoches.app;

import android.content.Context;
import android.util.Log;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** POST vers l'API pending-transactions (SMS / notifications). */
public final class PendingApiPoster {
    private static final String TAG = "MesPochesPending";

    private PendingApiPoster() {}

    public static void postSms(Context ctx, String apiBase, String token, String text) {
        postSms(ctx, apiBase, token, text, MoneyNotificationListener.contentFingerprint(text));
    }

    public static void postSms(Context ctx, String apiBase, String token, String text, String fingerprint) {
        MesPochesNotifier.showProcessing(ctx);
        String json = "{\"text\":" + jsonEscape(text) + "}";
        post(ctx, apiBase + "/pending-transactions/parse-sms", token, json, fingerprint);
    }

    public static void postNotification(Context ctx, String apiBase, String token, String title, String body) {
        postNotification(ctx, apiBase, token, title, body, null, null);
    }

    public static void postNotification(
            Context ctx, String apiBase, String token, String title, String body, String packageName) {
        postNotification(ctx, apiBase, token, title, body, packageName, null);
    }

    public static void postNotification(
            Context ctx,
            String apiBase,
            String token,
            String title,
            String body,
            String packageName,
            String fingerprint) {
        MesPochesNotifier.showProcessing(ctx);
        StringBuilder sb = new StringBuilder();
        sb.append("{\"title\":").append(jsonEscape(title));
        sb.append(",\"body\":").append(jsonEscape(body));
        if (packageName != null && !packageName.isEmpty()) {
            sb.append(",\"packageName\":").append(jsonEscape(packageName));
        }
        sb.append("}");
        String fp = fingerprint;
        if (fp == null || fp.isEmpty()) {
            fp = MoneyNotificationListener.contentFingerprint(title + "\n" + body);
        }
        post(ctx, apiBase + "/pending-transactions/parse-notification", token, sb.toString(), fp);
    }

    /**
     * 201 = nouvelle transaction → notif « prête ».
     * 200 = doublon déjà connu → pas de 2ᵉ notif.
     * Autre = échec → annule « en cours » et libère le debounce.
     */
    private static void handleResult(Context ctx, int code, String responseBody, String fingerprint) {
        if (code == 201) {
            String message = formatReadyMessage(responseBody);
            MesPochesNotifier.showReady(ctx, message);
            return;
        }
        MesPochesNotifier.cancelProcessing(ctx);
        if (code == 200) {
            Log.d(TAG, "Doublon ignoré (déjà en attente)");
            return;
        }
        // Échec / non reconnu → autoriser une nouvelle tentative (notif MM mise à jour)
        MoneyNotificationListener.releaseFingerprint(fingerprint);
        if (code == 422) {
            Log.d(TAG, "Contenu non reconnu (HTTP 422)");
        } else if (code > 0) {
            Log.w(TAG, "Échec API pending HTTP " + code);
        }
    }

    private static void post(
            Context ctx, String urlString, String token, String json, String fingerprint) {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(urlString);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + token);
            conn.setDoOutput(true);
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(45000);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(json.getBytes(StandardCharsets.UTF_8));
            }

            int code = conn.getResponseCode();
            String body = readBody(conn, code >= 200 && code < 300);
            if (Log.isLoggable(TAG, Log.DEBUG)) {
                Log.d(TAG, "POST pending → " + code);
            }
            if (code == 201 || code == 200) {
                boolean duplicate = code == 200 || bodyContainsDuplicate(body);
                handleResult(ctx, duplicate ? 200 : 201, body, fingerprint);
            } else {
                handleResult(ctx, code, null, fingerprint);
            }
        } catch (Exception e) {
            Log.e(TAG, "POST failed", e);
            MesPochesNotifier.cancelProcessing(ctx);
            MoneyNotificationListener.releaseFingerprint(fingerprint);
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private static boolean bodyContainsDuplicate(String json) {
        if (json == null) return false;
        return json.contains("\"duplicate\":true") || json.contains("\"duplicate\": true");
    }

    private static String readBody(HttpURLConnection conn, boolean success) {
        try {
            InputStream is = success ? conn.getInputStream() : conn.getErrorStream();
            if (is == null) return "";
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private static String formatReadyMessage(String json) {
        if (json == null || json.isEmpty()) {
            return "Transaction prête à valider";
        }
        String description = "Transaction Mobile Money";
        Matcher desc = Pattern.compile("\"description\"\\s*:\\s*\"([^\"]+)\"").matcher(json);
        if (desc.find()) {
            description = desc.group(1);
        }
        Matcher amount = Pattern.compile("\"amount\"\\s*:\\s*(\\d+)").matcher(json);
        if (amount.find()) {
            return description + " — " + amount.group(1) + " FCFA";
        }
        return description + " — prête à valider";
    }

    private static String jsonEscape(String s) {
        return "\""
            + s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "")
            + "\"";
    }
}
