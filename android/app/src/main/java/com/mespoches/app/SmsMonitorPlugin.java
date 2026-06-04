package com.mespoches.app;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SmsMonitor")
public class SmsMonitorPlugin extends Plugin {

    public static final String PREFS = "mespoches_sms";
    public static final String KEY_TOKEN = "auth_token";
    public static final String KEY_API = "api_base_url";

    @PluginMethod
    public void storeAuthToken(PluginCall call) {
        String token = call.getString("token", "");
        String apiUrl = call.getString("apiUrl", "https://mespochesbackend-production.up.railway.app/api");
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_TOKEN, token).putString(KEY_API, apiUrl).apply();
        call.resolve();
    }

    public static String getStoredToken(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_TOKEN, "");
    }

    public static String getApiBase(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(
            KEY_API,
            "https://mespochesbackend-production.up.railway.app/api"
        );
    }
}
