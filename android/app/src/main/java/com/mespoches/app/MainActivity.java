package com.mespoches.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.util.Locale;
import java.util.regex.Pattern;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MesPochesAuth";
    private static final Pattern HANDOFF_CODE =
        Pattern.compile("^[A-Za-z0-9_-]{32,128}$");

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SmsMonitorPlugin.class);
        super.onCreate(savedInstanceState);
        keepAppInWebView();
        handleDeepLink(getIntent());
    }

    /**
     * L'app reste une application : plus d'ouverture Chrome sur les
     * navigations internes (login, redirects, Vercel, Railway).
     * Seuls les liens vraiment externes (maps, mailto, http hors app)
     * peuvent sortir — et encore, uniquement si ce n'est pas notre domaine.
     */
    private void keepAppInWebView() {
        if (getBridge() == null || getBridge().getWebView() == null) return;

        getBridge()
            .getWebView()
            .setWebViewClient(
                new BridgeWebViewClient(getBridge()) {
                    @Override
                    public boolean shouldOverrideUrlLoading(
                        WebView view,
                        WebResourceRequest request
                    ) {
                        Uri url = request.getUrl();
                        if (url == null) return false;

                        String scheme =
                            url.getScheme() != null
                                ? url.getScheme().toLowerCase(Locale.ROOT)
                                : "";
                        String host =
                            url.getHost() != null
                                ? url.getHost().toLowerCase(Locale.ROOT)
                                : "";

                        // Deep link interne
                        if ("mespoches".equals(scheme)) {
                            return false;
                        }

                        // Tout http(s) de l'app reste dans la WebView
                        if (("http".equals(scheme) || "https".equals(scheme))
                            && isAppHost(host)) {
                            return false;
                        }

                        // Autres http(s) : aussi dans la WebView (pas Chrome)
                        if ("http".equals(scheme) || "https".equals(scheme)) {
                            return false;
                        }

                        // mailto / tel / etc. : laisser le système
                        return super.shouldOverrideUrlLoading(view, request);
                    }
                }
            );
    }

    private static boolean isAppHost(String host) {
        if (host == null || host.isEmpty()) return false;
        if (host.equals("localhost") || host.equals("127.0.0.1") || host.equals("10.0.2.2")) {
            return true;
        }
        if (host.equals("mespoches.vercel.app") || host.endsWith(".vercel.app")) {
            return true;
        }
        if (host.equals("mespochesbackend-production.up.railway.app")
            || host.endsWith(".up.railway.app")) {
            return true;
        }
        if (host.endsWith(".ngrok-free.app")
            || host.endsWith(".ngrok-free.dev")
            || host.endsWith(".ngrok.io")) {
            return true;
        }
        return host.contains("google") || host.contains("gstatic") || host.contains("googleapis");
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
        if (intent.getData() != null) return;
        navigateInWebView("/pending");
        intent.removeExtra("openPending");
    }

    private void handleGoogleDeepLink(Intent intent) {
        if (intent == null || intent.getData() == null) return;
        Uri data = intent.getData();
        if (!"mespoches".equalsIgnoreCase(data.getScheme())) return;
        if (!"auth".equalsIgnoreCase(data.getHost())) return;
        if (!"/google".equals(data.getPath())) return;

        String code = data.getQueryParameter("code");
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
            Log.e(TAG, "ServerUrl non HTTPS — navigation refusée");
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
