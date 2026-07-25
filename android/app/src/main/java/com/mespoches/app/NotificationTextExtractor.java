package com.mespoches.app;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.StatusBarNotification;

/** Extrait tout le texte visible d'une notification Android. */
public final class NotificationTextExtractor {
    private NotificationTextExtractor() {}

    public static String extract(StatusBarNotification sbn) {
        if (sbn == null || sbn.getNotification() == null) return "";
        Bundle extras = sbn.getNotification().extras;
        if (extras == null) return "";

        StringBuilder sb = new StringBuilder();
        append(sb, extras.getCharSequence(Notification.EXTRA_TITLE));
        append(sb, extras.getCharSequence(Notification.EXTRA_TEXT));
        append(sb, extras.getCharSequence(Notification.EXTRA_BIG_TEXT));
        append(sb, extras.getCharSequence(Notification.EXTRA_SUB_TEXT));
        append(sb, extras.getCharSequence(Notification.EXTRA_INFO_TEXT));
        append(sb, extras.getCharSequence(Notification.EXTRA_SUMMARY_TEXT));

        CharSequence[] lines = extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES);
        if (lines != null) {
            for (CharSequence line : lines) {
                append(sb, line);
            }
        }

        return sb.toString().trim();
    }

    public static String title(StatusBarNotification sbn) {
        if (sbn == null || sbn.getNotification() == null) return "";
        Bundle extras = sbn.getNotification().extras;
        if (extras == null) return "";
        CharSequence t = extras.getCharSequence(Notification.EXTRA_TITLE);
        return t != null ? t.toString().trim() : "";
    }

    private static void append(StringBuilder sb, CharSequence cs) {
        if (cs == null) return;
        String part = cs.toString().trim();
        if (part.isEmpty()) return;
        if (sb.length() > 0) sb.append(' ');
        sb.append(part);
    }
}
