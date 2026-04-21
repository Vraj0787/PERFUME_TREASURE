package com.perfumetreasure.email;

/**
 * EmailService Interface
 * Defines the contract for sending emails in the Perfume Treasure app.
 */
public interface EmailService {

    /**
     * Sends a welcome email to a newly registered user.
     *
     * @param toEmail   Recipient email address
     * @param userName  Recipient display name
     * @param callback  Callback for success/failure handling
     */
    void sendWelcomeEmail(String toEmail, String userName, EmailCallback callback);

    /**
     * Callback interface for async email operations.
     */
    interface EmailCallback {
        void onSuccess();
        void onFailure(String errorMessage);
    }
}
