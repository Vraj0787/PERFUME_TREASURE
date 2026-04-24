package com.perfumetreasure.app.feedback;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.widget.Toast;

/**
 * RateAppEmailSender
 *
 * Composes and fires a pre-filled feedback / rating e-mail Intent for
 * the Perfume Treasure app.
 *
 * The Intent opens whatever e-mail client the user has installed
 * (Gmail, Outlook, etc.).  No external libraries required.
 */
public final class RateAppEmailSender {

    // -------------------------------------------------------------------------
    // Configuration — update these values before publishing
    // -------------------------------------------------------------------------

    /** Destination address that receives the feedback. */
    public static final String FEEDBACK_EMAIL = "support@perfumetreasure.com";

    /** Subject line shown in the e-mail compose window. */
    public static final String EMAIL_SUBJECT  = "Rate / Feedback — Perfume Treasure App";

    // -------------------------------------------------------------------------
    // Constructor blocked — static utility class
    // -------------------------------------------------------------------------
    private RateAppEmailSender() { /* no instances */ }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Opens the device e-mail client with a pre-filled message.
     *
     * @param activity  The calling Activity used to start the Intent.
     */
    public static void sendFeedbackEmail(Activity activity) {
        String body = buildEmailBody(activity);

        // Use mailto: URI so any e-mail app can handle it
        Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
        emailIntent.setData(Uri.parse("mailto:"));          // Only e-mail apps respond
        emailIntent.putExtra(Intent.EXTRA_EMAIL,   new String[]{FEEDBACK_EMAIL});
        emailIntent.putExtra(Intent.EXTRA_SUBJECT, EMAIL_SUBJECT);
        emailIntent.putExtra(Intent.EXTRA_TEXT,    body);

        if (emailIntent.resolveActivity(activity.getPackageManager()) != null) {
            activity.startActivity(Intent.createChooser(emailIntent,
                    activity.getString(R.string.rate_chooser_title)));
        } else {
            // No e-mail app installed — show a friendly toast
            Toast.makeText(
                    activity,
                    activity.getString(R.string.rate_no_email_client),
                    Toast.LENGTH_LONG
            ).show();
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Builds a localised e-mail body that includes device/app metadata
     * so the support team can triage issues quickly.
     */
    private static String buildEmailBody(Activity activity) {
        StringBuilder sb = new StringBuilder();

        sb.append(activity.getString(R.string.rate_email_greeting)).append("\n\n");
        sb.append(activity.getString(R.string.rate_email_body_placeholder)).append("\n\n");

        // ── App & device metadata ──────────────────────────────────────────
        sb.append("─────────────────────────────\n");
        sb.append(activity.getString(R.string.rate_email_device_info)).append("\n");
        sb.append("App Version : ").append(getAppVersion(activity)).append("\n");
        sb.append("Android     : ").append(Build.VERSION.RELEASE)
          .append(" (API ").append(Build.VERSION.SDK_INT).append(")\n");
        sb.append("Device      : ").append(Build.MANUFACTURER).append(" ").append(Build.MODEL).append("\n");
        sb.append("─────────────────────────────\n");

        return sb.toString();
    }

    /** Returns the human-readable version name from the manifest (e.g. "1.2.3"). */
    private static String getAppVersion(Activity activity) {
        try {
            PackageInfo info = activity.getPackageManager()
                    .getPackageInfo(activity.getPackageName(), 0);
            return info.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            return "N/A";
        }
    }
}
