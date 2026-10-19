package com.zuzumik.app;

import android.app.Activity;
import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Drives Android system-bar icon appearance from the web app's theme state.
 *
 * <p>Nothing in the Capacitor runtime touches {@code isAppearanceLight*Bars}, so
 * on an edge-to-edge build the OS default (light/white icons) persists. That is
 * correct for the dark theme but leaves the time, battery and Wi-Fi glyphs white
 * on the light surface. The web layer owns theme state, so it owns this too --
 * the colour is never hardcoded here, it is passed in per toggle.
 */
@CapacitorPlugin(name = "SystemBars")
public class SystemBarsPlugin extends Plugin {

    /**
     * @param call expects {@code mode}: {@code "light"} for a light app surface
     *             (dark icons), {@code "dark"} for a dark surface (light icons).
     */
    @PluginMethod
    public void setAppearance(PluginCall call) {
        String mode = call.getString("mode", "dark");
        final boolean lightSurface = "light".equals(mode);

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("No activity available");
            return;
        }

        // Plugin methods run on Capacitor's task thread, not the UI thread.
        activity.runOnUiThread(() -> {
            try {
                Window window = activity.getWindow();

                // Opt in to edge-to-edge explicitly on every API level. From
                // API 35 this is enforced for targetSdk 35+ regardless, but doing
                // it lower down as well keeps the window insets -- and therefore
                // env(safe-area-inset-*) inside the WebView -- identical on every
                // device, instead of only on Android 15+.
                WindowCompat.setDecorFitsSystemWindows(window, false);

                WindowInsetsControllerCompat controller =
                        WindowCompat.getInsetsController(window, window.getDecorView());
                // Status bar and navigation bar are set together: they sit on the
                // same app surface, so splitting them would let one of them drift
                // out of sync with the theme.
                controller.setAppearanceLightStatusBars(lightSurface);
                controller.setAppearanceLightNavigationBars(lightSurface);

                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to set system bar appearance: " + e.getMessage(), e);
            }
        });
    }
}