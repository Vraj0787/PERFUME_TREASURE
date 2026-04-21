package com.perfumetreasure.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.UserProfileChangeRequest;
import com.perfumetreasure.R;
import com.perfumetreasure.email.EmailService;
import com.perfumetreasure.email.FirebaseEmailService;

/**
 * SignUpActivity
 *
 * Handles new user registration for Perfume Treasure.
 * After a successful Firebase Auth account creation:
 *   1. Sets the user's display name.
 *   2. Sends a welcome email via FirebaseEmailService.
 *   3. Navigates to HomeActivity.
 *
 * Layout: activity_sign_up.xml  (see res/layout/)
 */
public class SignUpActivity extends AppCompatActivity {

    private static final String TAG = "SignUpActivity";

    // UI
    private EditText etName, etEmail, etPassword, etConfirmPassword;
    private Button btnSignUp;
    private ProgressBar progressBar;

    // Firebase & Email
    private FirebaseAuth mAuth;
    private EmailService emailService;

    // -----------------------------------------------------------------------
    // Lifecycle
    // -----------------------------------------------------------------------

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sign_up);

        mAuth = FirebaseAuth.getInstance();
        emailService = new FirebaseEmailService();

        bindViews();
        setClickListeners();
    }

    // -----------------------------------------------------------------------
    // UI wiring
    // -----------------------------------------------------------------------

    private void bindViews() {
        etName            = findViewById(R.id.etName);
        etEmail           = findViewById(R.id.etEmail);
        etPassword        = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnSignUp         = findViewById(R.id.btnSignUp);
        progressBar       = findViewById(R.id.progressBar);
    }

    private void setClickListeners() {
        btnSignUp.setOnClickListener(v -> attemptSignUp());
    }

    // -----------------------------------------------------------------------
    // Sign-up flow
    // -----------------------------------------------------------------------

    private void attemptSignUp() {
        String name     = etName.getText().toString().trim();
        String email    = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString();
        String confirm  = etConfirmPassword.getText().toString();

        if (!validateInputs(name, email, password, confirm)) return;

        setLoading(true);

        mAuth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(this, task -> {
                    if (task.isSuccessful()) {
                        FirebaseUser user = mAuth.getCurrentUser();
                        if (user != null) {
                            updateDisplayNameAndSendEmail(user, name, email);
                        }
                    } else {
                        setLoading(false);
                        String error = task.getException() != null
                                ? task.getException().getMessage()
                                : "Sign-up failed. Please try again.";
                        showToast(error);
                        Log.e(TAG, "createUserWithEmailAndPassword failed", task.getException());
                    }
                });
    }

    /**
     * Sets the Firebase display name, then triggers the welcome email.
     */
    private void updateDisplayNameAndSendEmail(FirebaseUser user, String name, String email) {
        UserProfileChangeRequest profileUpdate = new UserProfileChangeRequest.Builder()
                .setDisplayName(name)
                .build();

        user.updateProfile(profileUpdate)
                .addOnCompleteListener(profileTask -> {
                    // Profile update result is non-critical; proceed regardless.
                    if (!profileTask.isSuccessful()) {
                        Log.w(TAG, "Display name update failed (non-fatal)", profileTask.getException());
                    }
                    sendWelcomeEmail(email, name);
                });
    }

    /**
     * Sends the welcome email. Navigation to home happens regardless of email outcome.
     */
    private void sendWelcomeEmail(String email, String userName) {
        emailService.sendWelcomeEmail(email, userName, new EmailService.EmailCallback() {
            @Override
            public void onSuccess() {
                Log.d(TAG, "Welcome email successfully queued for " + email);
                proceedToHome();
            }

            @Override
            public void onFailure(String errorMessage) {
                // Email failure is non-blocking; user is still registered.
                Log.w(TAG, "Welcome email failed (non-fatal): " + errorMessage);
                proceedToHome();
            }
        });
    }

    // -----------------------------------------------------------------------
    // Navigation
    // -----------------------------------------------------------------------

    private void proceedToHome() {
        setLoading(false);
        showToast("Welcome to Perfume Treasure! 🌹");
        Intent intent = new Intent(SignUpActivity.this, HomeActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    // -----------------------------------------------------------------------
    // Validation
    // -----------------------------------------------------------------------

    private boolean validateInputs(String name, String email, String password, String confirm) {
        if (TextUtils.isEmpty(name)) {
            etName.setError("Name is required.");
            etName.requestFocus();
            return false;
        }
        if (TextUtils.isEmpty(email)) {
            etEmail.setError("Email is required.");
            etEmail.requestFocus();
            return false;
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.setError("Please enter a valid email address.");
            etEmail.requestFocus();
            return false;
        }
        if (password.length() < 8) {
            etPassword.setError("Password must be at least 8 characters.");
            etPassword.requestFocus();
            return false;
        }
        if (!password.equals(confirm)) {
            etConfirmPassword.setError("Passwords do not match.");
            etConfirmPassword.requestFocus();
            return false;
        }
        return true;
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private void setLoading(boolean isLoading) {
        progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        btnSignUp.setEnabled(!isLoading);
    }

    private void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }
}
