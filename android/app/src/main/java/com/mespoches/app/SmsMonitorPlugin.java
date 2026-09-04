package com.mespoches.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.provider.Settings;
import android.util.Log;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.net.URI;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@CapacitorPlugin(
    name = "SmsMonitor",
    permissions = {
        @Permission(strings = { Manifest.permission.RECEIVE_SMS }, alias = "sms"),
        @Permission(strings = { Manifest.permission.READ_SMS }, alias = "readSms")
    }
)
public class SmsMonitorPlugin extends Plugin {

    private static final String TAG = "MesPochesSms";
    public static final String PREFS = "mespoches_sms";
    public static final String KEY_TOKEN = "auth_token";
    public static final String KEY_API = "api_base_url";

    /** Hôte API par défaut — uniquement si aucune URL valide n'est fournie. */
    private static final String DEFAULT_API =
        "https://mespochesbackend-production.up.railway.app/api";

    private static final Set<String> ALLOWED_HOST_SUFFIXES = new HashSet<>(Arrays.asList(
        ".railway.app",
        ".onrender.com",
        ".ngrok-free.app",
        ".ngrok-free.dev",
        ".ngrok.io",
        ".vercel.app"
    ));

    private static final Set<String> ALLOWED_EXACT_HOSTS = new HashSet<>(Arrays.asList(
        "localhost",
        "127.0.0.1"
    ));

    @PluginMethod
    public void storeAuthToken(PluginCall call) {
        String token = call.getString("token", "");
        String apiUrl = sanitizeApiUrl(call.getString("apiUrl", ""));
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_TOKEN, token).putString(KEY_API, apiUrl).apply();
        call.resolve();
    }

    @PluginMethod
    public void clearAuthToken(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().remove(KEY_TOKEN).remove(KEY_API).apply();
        call.resolve();
    }

    @PluginMethod
    public void requestSmsPermission(PluginCall call) {
        if (getPermissionState("sms") == com.getcapacitor.PermissionState.GRANTED) {
            call.resolve();
            return;
        }
        requestPermissionForAlias("sms", call, "smsPermsCallback");
    }

    @PermissionCallback
    private void smsPermsCallback(PluginCall call) {
        if (getPermissionState("sms") == com.getcapacitor.PermissionState.GRANTED) {
            call.resolve();
        } else {
            call.reject("Permission SMS refusée");
        }
    }

    @PluginMethod
    public void openNotificationAccessSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Impossible d'ouvrir les paramètres de notifications");
        }
    }

    /**
     * Ouvre une URL HTTPS dans Chrome (navigateur système), pas dans la WebView.
     * Requis pour Google OAuth (disallowed_useragent / « Accès bloqué »).
     */
    @PluginMethod
    public void openExternalUrl(PluginCall call) {
        String url = call.getString("url", "");
        if (url == null || url.trim().isEmpty()) {
            call.reject("URL manquante");
            return;
        }
        Uri uri;
        try {
            uri = Uri.parse(url.trim());
        } catch (Exception e) {
            call.reject("URL invalide");
            return;
        }
        String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase(Locale.ROOT) : "";
        if (!scheme.equals("https") && !scheme.equals("http")) {
            call.reject("Seules les URL http(s) sont autorisées");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        try {
            // Chrome en priorité (Custom Tabs / WebView = souvent bloqués par Google)
            intent.setPackage("com.android.chrome");
            getContext().startActivity(intent);
            call.resolve();
            return;
        } catch (Exception ignored) {
            /* Chrome absent */
        }

        try {
            intent.setPackage(null);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Impossible d'ouvrir le navigateur système");
        }
    }

    public static String getStoredToken(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_TOKEN, "");
    }

    public static String getApiBase(Context context) {
        String stored = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_API, "");
        return sanitizeApiUrl(stored);
    }

    static String sanitizeApiUrl(String apiUrl) {
        if (apiUrl == null || apiUrl.trim().isEmpty()) {
            return DEFAULT_API;
        }
        try {
            URI uri = URI.create(apiUrl.trim());
            String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase(Locale.ROOT) : "";
            String host = uri.getHost() != null ? uri.getHost().toLowerCase(Locale.ROOT) : "";
            if (!scheme.equals("https") && !(scheme.equals("http") && isLocalHost(host))) {
                Log.w(TAG, "Rejected apiUrl scheme");
                return DEFAULT_API;
            }
            if (!isAllowedHost(host)) {
                Log.w(TAG, "Rejected apiUrl host");
                return DEFAULT_API;
            }
            String normalized = apiUrl.trim().replaceAll("/+$", "");
            return normalized;
        } catch (Exception e) {
            return DEFAULT_API;
        }
    }

    private static boolean isLocalHost(String host) {
        return ALLOWED_EXACT_HOSTS.contains(host);
    }

    private static boolean isAllowedHost(String host) {
        if (host == null || host.isEmpty()) return false;
        if (ALLOWED_EXACT_HOSTS.contains(host)) return true;
        for (String suffix : ALLOWED_HOST_SUFFIXES) {
            if (host.endsWith(suffix)) return true;
        }
        return false;
    }
}
