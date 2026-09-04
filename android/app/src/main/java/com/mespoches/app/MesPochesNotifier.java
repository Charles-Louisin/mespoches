package com.mespoches.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

/** Notifications locales MES POCHES (analyse en cours / transaction prête). */
public final class MesPochesNotifier {
    private static final String CHANNEL_ID = "mes_poches_transactions";
    private static final int ID_PROCESSING = 8001;
    private static final int ID_READY = 8002;

    private MesPochesNotifier() {}

    public static void showProcessing(Context ctx) {
        ensureChannel(ctx);
        NotificationManager nm = notificationManager(ctx);
        NotificationCompat.Builder builder = baseBuilder(ctx)
            .setContentTitle("MES POCHES")
            .setContentText("Analyse de la transaction en cours…")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setAutoCancel(false);
        nm.notify(ID_PROCESSING, builder.build());
    }

    public static void showReady(Context ctx, String message) {
        ensureChannel(ctx);
        NotificationManager nm = notificationManager(ctx);
        nm.cancel(ID_PROCESSING);

        Intent intent = new Intent(ctx, MainActivity.class);
        intent.putExtra("openPending", true);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(ctx, 0, intent, flags);

        NotificationCompat.Builder builder = baseBuilder(ctx)
            .setContentTitle("Transaction prête")
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOnlyAlertOnce(true)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);
        nm.notify(ID_READY, builder.build());
    }

    public static void cancelProcessing(Context ctx) {
        notificationManager(ctx).cancel(ID_PROCESSING);
    }

    /**
     * smallIcon = silhouette blanche (barre de statut).
     * largeIcon = logo couleur (panneau de notifications).
     */
    private static NotificationCompat.Builder baseBuilder(Context ctx) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_mes_poches)
            .setColor(ContextCompat.getColor(ctx, R.color.colorPrimary));

        Bitmap large = BitmapFactory.decodeResource(ctx.getResources(), R.mipmap.ic_launcher);
        if (large != null) {
            builder.setLargeIcon(large);
        }
        return builder;
    }

    private static NotificationManager notificationManager(Context ctx) {
        return (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
    }

    private static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = notificationManager(ctx);
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Transactions détectées",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Alertes lors de la détection Mobile Money");
        nm.createNotificationChannel(channel);
    }
}
