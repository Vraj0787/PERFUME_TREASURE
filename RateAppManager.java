package com.perfumetreasure.app.feedback;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;

/**
 * RateAppManager
 *
 * Manages the "Rate Perfume Treasure" flow.
 * Tracks launch counts / first-install date and decides when to prompt.
 * Supports both Play Store rating and fallback e-mail feedback.
 *
 * Usage:
 *   // In your Activity / Fragment:
 *   RateAppManager.getInstance(context).onAppLaunch(this);
 *
 * Or trigger manually:
 *   RateAppManager.getInstance(context).showRateDialog(activity);
 */
public class RateAppManager {

    // -------------------------------------------------------------------------
    // Config — tweak these to suit your release cadence
    // -------------------------------------------------------------------------
    /** Minimum number of app launches before the prompt appears. */
    private static final int MIN_LAUNCH_COUNT      = 5;

    /** Minimum days since first install before the prompt appears. */
    private static final int MIN_DAYS_SINCE_INSTALL = 3;

    /** Days to wait before re-prompting after user taps "Remind me later". */
    private static final int REMIND_LATER_DAYS      = 7;

    // -------------------------------------------------------------------------
    // SharedPreferences keys
    // -------------------------------------------------------------------------
    private static final String PREFS_NAME          = "perfume_treasure_rate_prefs";
    private static final String KEY_LAUNCH_COUNT    = "launch_count";
    private static final String KEY_FIRST_LAUNCH_MS = "first_launch_ms";
    private static final String KEY_DO_NOT_SHOW     = "do_not_show";
    private static final String KEY_REMIND_AFTER_MS = "remind_after_ms";

    // -------------------------------------------------------------------------
    // Singleton
    // -------------------------------------------------------------------------
    private static RateAppManager sInstance;

    private final Context mAppContext;
    private final SharedPreferences mPrefs;

    private RateAppManager(Context context) {
        mAppContext = context.getApplicationContext();
        mPrefs      = mAppContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized RateAppManager getInstance(Context context) {
        if (sInstance == null) {
            sInstance = new RateAppManager(context);
        }
        return sInstance;
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Call once per app launch (e.g., from MainActivity.onResume).
     * Increments the counter and shows the dialog when conditions are met.
     */
    public void onAppLaunch(Activity activity) {
        if (shouldNeverShow()) return;

        incrementLaunchCount();
        ensureFirstLaunchDateSet();

        if (conditionsMet()) {
            showRateDialog(activity);
        }
    }

    /**
     * Show the rate dialog immediately (e.g., from a Settings "Rate us" button).
     */
    public void showRateDialog(Activity activity) {
        RateAppDialog dialog = RateAppDialog.newInstance();
        dialog.setListener(new RateAppDialog.RateDialogListener() {

            @Override
            public void onRateNow() {
                openPlayStore(activity);
                setDoNotShow();
            }

            @Override
            public void onSendFeedback() {
                RateAppEmailSender.sendFeedbackEmail(activity);
                setDoNotShow();
            }

            @Override
            public void onRemindLater() {
                scheduleReminder();
            }

            @Override
            public void onNoThanks() {
                setDoNotShow();
            }
        });
        dialog.show(activity.getFragmentManager(), RateAppDialog.TAG);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private boolean shouldNeverShow() {
        if (mPrefs.getBoolean(KEY_DO_NOT_SHOW, false)) return true;
        long remindAfter = mPrefs.getLong(KEY_REMIND_AFTER_MS, 0L);
        return remindAfter > 0 && System.currentTimeMillis() < remindAfter;
    }

    private boolean conditionsMet() {
        int launches = mPrefs.getInt(KEY_LAUNCH_COUNT, 0);
        if (launches < MIN_LAUNCH_COUNT) return false;

        long firstLaunch = mPrefs.getLong(KEY_FIRST_LAUNCH_MS, System.currentTimeMillis());
        long daysSince   = (System.currentTimeMillis() - firstLaunch) / (1000L * 60 * 60 * 24);
        return daysSince >= MIN_DAYS_SINCE_INSTALL;
    }

    private void incrementLaunchCount() {
        int count = mPrefs.getInt(KEY_LAUNCH_COUNT, 0);
        mPrefs.edit().putInt(KEY_LAUNCH_COUNT, count + 1).apply();
    }

    private void ensureFirstLaunchDateSet() {
        if (!mPrefs.contains(KEY_FIRST_LAUNCH_MS)) {
            mPrefs.edit().putLong(KEY_FIRST_LAUNCH_MS, System.currentTimeMillis()).apply();
        }
    }

    private void setDoNotShow() {
        mPrefs.edit().putBoolean(KEY_DO_NOT_SHOW, true).apply();
    }

    private void scheduleReminder() {
        long remindAt = System.currentTimeMillis() + (long) REMIND_LATER_DAYS * 24 * 60 * 60 * 1000;
        mPrefs.edit().putLong(KEY_REMIND_AFTER_MS, remindAt).apply();
    }

    private void openPlayStore(Activity activity) {
        String packageName = activity.getPackageName();
        try {
            activity.startActivity(new Intent(Intent.ACTION_VIEW,
                    Uri.parse("market://details?id=" + packageName)));
        } catch (android.content.ActivityNotFoundException e) {
            // Fall back to browser if Play Store app is not installed
            activity.startActivity(new Intent(Intent.ACTION_VIEW,
                    Uri.parse("https://play.google.com/store/apps/details?id=" + packageName)));
        }
    }

    // -------------------------------------------------------------------------
    // Testing / debug helpers
    // -------------------------------------------------------------------------

    /** Clears all stored state — useful during development / QA. */
    public void resetForTesting() {
        mPrefs.edit().clear().apply();
    }
}
