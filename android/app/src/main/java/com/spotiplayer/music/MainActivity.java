package com.spotiplayer.music;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

/**
 * SpotiPlayer - Native Android Bridge Activity
 * Configures WebView media playback capabilities, manages CPU partial wake locks,
 * and launches the continuous background audio playback foreground service.
 */
public class MainActivity extends BridgeActivity {
    private PowerManager.WakeLock wakeLock;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep CPU active during high-fidelity audio playback
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "SpotiPlayer::AudioActivityWakeLock"
            );
            wakeLock.setReferenceCounted(false);
            if (!wakeLock.isHeld()) {
                wakeLock.acquire(12 * 60 * 60 * 1000L); // 12-hour safe cap
            }
        }

        // Configure Android WebView for continuous background media playback
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            WebSettings settings = webView.getSettings();

            // Allow automatic playback and uninterrupted transitions between songs without physical touch
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
        }

        // Start Foreground Service with FOREGROUND_SERVICE_MEDIA_PLAYBACK to guarantee
        // the Android OS does not kill or throttle the audio playback thread when screen is locked
        startPlaybackService();

        // Prompt for battery optimization exemption on Android 6+ if necessary
        requestBatteryOptimizationExemption();
    }

    private void startPlaybackService() {
        try {
            Intent serviceIntent = new Intent(this, AudioNotificationService.class);
            serviceIntent.setAction(AudioNotificationService.ACTION_START_FOREGROUND);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(intent);
                }
            } catch (Exception ignored) {
                // Ignore if restricted by corporate or system device policies
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (wakeLock != null && !wakeLock.isHeld()) {
            wakeLock.acquire(12 * 60 * 60 * 1000L);
        }
    }

    @Override
    protected void onDestroy() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        super.onDestroy();
    }
}
