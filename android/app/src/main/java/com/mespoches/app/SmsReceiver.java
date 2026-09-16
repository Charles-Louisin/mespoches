package com.mespoches.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;

/**
 * RÉCEPTEUR SMS - LECTURE SEULE
 * 
 * SÉCURITÉ & CONFIDENTIALITÉ :
 * - Lit UNIQUEMENT les SMS entrants (RECEIVE_SMS)
 * - NE PEUT PAS répondre aux SMS
 * - NE PEUT PAS envoyer de SMS  
 * - NE PEUT PAS modifier ou supprimer des SMS
 * - NE PEUT PAS accéder aux SMS existants (sauf via BootReceiver avec READ_SMS)
 * - Filtre automatique : seuls les SMS monétaires sont traités
 * - Ne collecte AUCUNE donnée personnelle (numéro, contacts, etc.)
 * 
 * Permission requise : android.permission.RECEIVE_SMS (lecture uniquement)
 */
public class SmsReceiver extends BroadcastReceiver {
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

        if (!MoneyTextFilter.isMoneyRelated(text)) return;

        // Même événement souvent reçu aussi via notification app MM
        String fp = MoneyNotificationListener.contentFingerprint(text);
        if (MoneyNotificationListener.claimEvent("sms|" + fp, fp)) return;

        final String smsText = text;
        final String fingerprint = fp;
        final String authToken = token;
        final String apiBase = SmsMonitorPlugin.getApiBase(context);

        new Thread(() ->
            PendingApiPoster.postSms(
                context.getApplicationContext(), apiBase, authToken, smsText, fingerprint))
            .start();
    }
}
