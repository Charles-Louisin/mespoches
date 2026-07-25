package com.mespoches.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import java.util.regex.Pattern;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MesPochesAuth";
    private static final Pattern HANDOFF_CODE =
        Pattern.compile("^[A-Za-z0-9_-]{32,128}$");

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SmsMonitorPlugin.class);
        super.onCreate(savedInstanceState);
        handleDeepLink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLink(intent);
    }

    private void handleDeepLink(Intent intent) {
        handlePendingDeepLink(intent);
        handleGoogleDeepLink(intent);
    }

    private void handlePendingDeepLink(Intent intent) {
        if (intent == null || !intent.getBooleanExtra("openPending", false)) return;
        // Ne traite openPending que s'il n'y a pas de data URI hostile
        if (intent.getData() != null) return;
        navigateInWebView("/pending");
        intent.removeExtra("openPending");
    }

    /** Retour de Chrome après OAuth Google → pont WebView (code + nonce local). */
    private void handleGoogleDeepLink(Intent intent) {
        if (intent == null || intent.getData() == null) return;
        Uri data = intent.getData();
        if (!"mespoches".equalsIgnoreCase(data.getScheme())) return;
        if (!"auth".equalsIgnoreCase(data.getHost())) return;
        if (!"/google".equals(data.getPath())) return;

        String code = data.getQueryParameter("code");
        // Efface immédiatement l'URI pour éviter rejeu / fuite via getIntent()
        intent.setData(null);

        if (code == null || !HANDOFF_CODE.matcher(code).matches()) {
            Log.w(TAG, "Deep link Google: code manquant ou format invalide");
            navigateInWebView("/login?error=google_session");
            return;
        }

        navigateInWebView(
            "/auth/google/mobile-return?code=" + Uri.encode(code)
        );
    }

    private void navigateInWebView(String relativePath) {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        String base = getBridge().getServerUrl();
        if (base == null || base.isEmpty()) return;

        // Refuse les bases non HTTPS (sauf localhost / émulateur en debug)
        Uri baseUri = Uri.parse(base);
        String scheme = baseUri.getScheme();
        String host = baseUri.getHost() != null ? baseUri.getHost() : "";
        boolean isLocalDev =
            host.equals("localhost")
                || host.equals("127.0.0.1")
                || host.equals("10.0.2.2");
        boolean httpsOk = scheme != null && scheme.equalsIgnoreCase("https");
        boolean httpLocal =
            scheme != null && scheme.equalsIgnoreCase("http") && isLocalDev;
        if (!httpsOk && !httpLocal) {
            Log.e(TAG, "ServerUrl non HTTPS — navigation OAuth refusée");
            return;
        }

        if (relativePath.startsWith("http://")
            || relativePath.startsWith("https://")
            || relativePath.startsWith("javascript:")
            || relativePath.startsWith("file:")
            || relativePath.startsWith("data:")) {
            Log.e(TAG, "Chemin de navigation refusé");
            return;
        }

        String path = relativePath.startsWith("/") ? relativePath : "/" + relativePath;
        String prefix = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
        getBridge().getWebView().loadUrl(prefix + path);
    }
}
