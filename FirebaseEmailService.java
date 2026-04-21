package com.perfumetreasure.email;

import android.util.Log;

import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.HttpsCallableResult;

import java.util.HashMap;
import java.util.Map;

/**
 * FirebaseEmailService
 *
 * Sends transactional emails by calling a Firebase Cloud Function ("sendWelcomeEmail").
 * The Cloud Function (Node.js) handles the actual SMTP delivery via SendGrid / Nodemailer.
 *
 * Drop-in replacement: swap this class for any other EmailService implementation
 * without touching SignUpActivity.
 */
public class FirebaseEmailService implements EmailService {

    private static final String TAG = "FirebaseEmailService";
    private static final String CLOUD_FUNCTION_NAME = "sendWelcomeEmail";

    private final FirebaseFunctions functions;

    public FirebaseEmailService() {
        this.functions = FirebaseFunctions.getInstance();
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String userName, EmailCallback callback) {
        if (toEmail == null || toEmail.isEmpty()) {
            callback.onFailure("Email address is required.");
            return;
        }
        if (userName == null || userName.isEmpty()) {
            userName = "Perfume Enthusiast";
        }

        Map<String, Object> data = new HashMap<>();
        data.put("toEmail", toEmail);
        data.put("userName", userName);
        data.put("subject", WelcomeEmailTemplate.SUBJECT);
        data.put("htmlBody", WelcomeEmailTemplate.buildHtmlBody(userName));
        data.put("textBody", WelcomeEmailTemplate.buildPlainTextBody(userName));

        final String finalUserName = userName;
        functions
                .getHttpsCallable(CLOUD_FUNCTION_NAME)
                .call(data)
                .addOnSuccessListener((HttpsCallableResult result) -> {
                    Log.d(TAG, "Welcome email sent to " + toEmail + " for user: " + finalUserName);
                    callback.onSuccess();
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Failed to send welcome email to " + toEmail, e);
                    callback.onFailure(e.getMessage());
                });
    }
}
