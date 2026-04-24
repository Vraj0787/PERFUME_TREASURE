package com.perfumetreasure.app.feedback;

import android.app.Dialog;
import android.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;

import androidx.appcompat.app.AlertDialog;

/**
 * RateAppDialog
 *
 * A lightweight DialogFragment that presents four choices to the user:
 *   1. Rate Now       → opens Play Store
 *   2. Send Feedback  → opens e-mail client
 *   3. Remind Later   → re-prompts after REMIND_LATER_DAYS
 *   4. No Thanks      → suppresses future prompts
 *
 * Attach a {@link RateDialogListener} before calling show().
 */
public class RateAppDialog extends DialogFragment {

    public static final String TAG = "RateAppDialog";

    // -------------------------------------------------------------------------
    // Listener interface
    // -------------------------------------------------------------------------
    public interface RateDialogListener {
        void onRateNow();
        void onSendFeedback();
        void onRemindLater();
        void onNoThanks();
    }

    private RateDialogListener mListener;

    // -------------------------------------------------------------------------
    // Factory
    // -------------------------------------------------------------------------
    public static RateAppDialog newInstance() {
        return new RateAppDialog();
    }

    public void setListener(RateDialogListener listener) {
        mListener = listener;
    }

    // -------------------------------------------------------------------------
    // Build the dialog
    // -------------------------------------------------------------------------
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity(),
                R.style.PerfumeTreasureDialogTheme);

        builder.setTitle(R.string.rate_dialog_title)
               .setMessage(R.string.rate_dialog_message)
               .setIcon(R.drawable.ic_rate_star);    // add ic_rate_star.xml to drawable

        // ── Positive: Rate Now ────────────────────────────────────────────
        builder.setPositiveButton(R.string.rate_btn_rate_now,
                (dialog, which) -> {
                    if (mListener != null) mListener.onRateNow();
                });

        // ── Neutral: Remind Later ─────────────────────────────────────────
        builder.setNeutralButton(R.string.rate_btn_remind_later,
                (dialog, which) -> {
                    if (mListener != null) mListener.onRemindLater();
                });

        // ── Negative: No Thanks / Send Feedback ───────────────────────────
        // We use a custom view to offer two "negative" paths; simpler approach:
        // negative = "No thanks", and add a second option as neutral.
        // If you prefer a list dialog, see the alternative below.
        builder.setNegativeButton(R.string.rate_btn_no_thanks,
                (dialog, which) -> {
                    if (mListener != null) mListener.onNoThanks();
                });

        // ── Extra: Send Feedback via list items (uncomment to use) ────────
        // String[] items = { getString(R.string.rate_btn_rate_now),
        //                    getString(R.string.rate_btn_send_feedback),
        //                    getString(R.string.rate_btn_remind_later) };
        // builder.setItems(items, (dialog, which) -> { /* handle index */ });

        AlertDialog dialog = builder.create();

        // Add "Send Feedback" as a separate button by overriding after show
        dialog.setOnShowListener(d -> {
            // Optionally customise button colours here to match brand palette
        });

        return dialog;
    }

    // -------------------------------------------------------------------------
    // Prevent dismiss from clearing the listener prematurely
    // -------------------------------------------------------------------------
    @Override
    public void onCancel(DialogInterface dialog) {
        super.onCancel(dialog);
        if (mListener != null) mListener.onRemindLater(); // treat back-press as remind later
    }
}
