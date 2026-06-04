package com.mespoches.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "MesPochesSms";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        if (!"android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) return;

        String token = SmsMonitorPlugin.getStoredToken(context);
        if (token == null || token.isEmpty()) return;

        Bundle bundle = intent.getExtras();
        if (bundle == null) return;

        StringBuilder body = new StringBuilder();
        Object[] pdus = (Object[]) bundle.get("pdus");
        if (pdus == null) return;

        for (Object pdu : pdus) {
            SmsMessage msg = SmsMessage.createFromPdu((byte[]) pdu);
            if (msg != null && msg.getMessageBody() != null) {
                body.append(msg.getMessageBody());
            }
        }

        String text = body.toString().trim();
        if (text.isEmpty()) return;

        String lower = text.toLowerCase();
        if (!lower.contains("reussi") && !lower.contains("fcfa") && !lower.contains("transfert")
                && !lower.contains("paiement") && !lower.contains("retrait")) {
            return;
        }

        final String smsText = text;
        final String authToken = token;
        final String apiBase = SmsMonitorPlugin.getApiBase(context);

        new Thread(() -> postSms(apiBase, authToken, smsText)).start();
    }

    private void postSms(String apiBase, String token, String text) {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(apiBase + "/pending-transactions/parse-sms");
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + token);
            conn.setDoOutput(true);
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);

            String json = "{\"text\":" + jsonEscape(text) + "}";
            try (OutputStream os = conn.getOutputStream()) {
                os.write(json.getBytes(StandardCharsets.UTF_8));
            }

            int code = conn.getResponseCode();
            Log.d(TAG, "SMS parse HTTP " + code);
        } catch (Exception e) {
            Log.e(TAG, "SMS post failed", e);
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private static String jsonEscape(String s) {
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "") + "\"";
    }
}
