package com.perfumetreasure.email;

/**
 * WelcomeEmailTemplate
 * Builds the HTML and plain-text body for the Perfume Treasure welcome email.
 */
public class WelcomeEmailTemplate {

    private static final String APP_NAME = "Perfume Treasure";
    private static final String BRAND_COLOR = "#C8A97E"; // Gold/amber perfume brand color
    private static final String SUPPORT_EMAIL = "support@perfumetreasure.com";

    public static final String SUBJECT = "Welcome to Perfume Treasure 🌹 – Your Scent Journey Begins!";

    /**
     * Returns an HTML-formatted welcome email body.
     *
     * @param userName The display name of the new user.
     * @return HTML string.
     */
    public static String buildHtmlBody(String userName) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "<title>Welcome to Perfume Treasure</title>" +
                "</head>" +
                "<body style=\"margin:0;padding:0;background-color:#fdf6ef;font-family:Georgia,serif;\">" +
                "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">" +
                "<tr><td align=\"center\" style=\"padding:40px 16px;\">" +
                "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff;border-radius:12px;" +
                "box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;max-width:600px;width:100%;\">" +

                // Header
                "<tr><td style=\"background:" + BRAND_COLOR + ";padding:40px 32px;text-align:center;\">" +
                "<h1 style=\"margin:0;color:#ffffff;font-size:28px;letter-spacing:2px;\">✦ PERFUME TREASURE ✦</h1>" +
                "<p style=\"margin:8px 0 0;color:#fff8f0;font-size:14px;letter-spacing:1px;\">YOUR PERSONAL SCENT COLLECTION</p>" +
                "</td></tr>" +

                // Body
                "<tr><td style=\"padding:40px 32px;\">" +
                "<h2 style=\"color:#3a2a1a;font-size:22px;margin:0 0 16px;\">Welcome, " + escapeHtml(userName) + "! 🌹</h2>" +
                "<p style=\"color:#5a4a3a;font-size:16px;line-height:1.7;margin:0 0 16px;\">" +
                "Thank you for joining <strong>Perfume Treasure</strong> – your personal vault for discovering, " +
                "collecting, and tracking the world's most exquisite fragrances." +
                "</p>" +
                "<p style=\"color:#5a4a3a;font-size:16px;line-height:1.7;margin:0 0 24px;\">" +
                "Here's what you can explore right now:" +
                "</p>" +

                // Feature list
                "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">" +
                featureRow("🔍", "Discover", "Browse thousands of fragrances by house, note, and season.") +
                featureRow("💎", "Collect", "Build and showcase your personal perfume collection.") +
                featureRow("⭐", "Review", "Rate and review scents to guide the community.") +
                featureRow("🛎️", "Get Notified", "Receive alerts for new releases and exclusive drops.") +
                "</table>" +

                "<div style=\"text-align:center;margin:36px 0;\">" +
                "<a href=\"perfumetreasure://home\" style=\"background:" + BRAND_COLOR + ";color:#ffffff;" +
                "text-decoration:none;padding:14px 36px;border-radius:50px;font-size:16px;" +
                "letter-spacing:1px;display:inline-block;\">✦ Start Exploring</a>" +
                "</div>" +

                "<p style=\"color:#8a7a6a;font-size:13px;line-height:1.6;border-top:1px solid #f0e8de;" +
                "padding-top:20px;margin:0;\">" +
                "Need help? Reach us anytime at " +
                "<a href=\"mailto:" + SUPPORT_EMAIL + "\" style=\"color:" + BRAND_COLOR + ";\">" + SUPPORT_EMAIL + "</a>." +
                "</p>" +
                "</td></tr>" +

                // Footer
                "<tr><td style=\"background:#fdf6ef;padding:24px 32px;text-align:center;" +
                "border-top:1px solid #f0e8de;\">" +
                "<p style=\"color:#b09a80;font-size:12px;margin:0;\">" +
                "© 2025 Perfume Treasure · " +
                "<a href=\"perfumetreasure://privacy\" style=\"color:#b09a80;\">Privacy Policy</a> · " +
                "<a href=\"perfumetreasure://unsubscribe\" style=\"color:#b09a80;\">Unsubscribe</a>" +
                "</p>" +
                "</td></tr>" +

                "</table>" +
                "</td></tr>" +
                "</table>" +
                "</body></html>";
    }

    /**
     * Returns a plain-text fallback welcome email.
     */
    public static String buildPlainTextBody(String userName) {
        return "Welcome to Perfume Treasure, " + userName + "!\n\n" +
                "Thank you for joining Perfume Treasure – your personal vault for discovering,\n" +
                "collecting, and tracking the world's most exquisite fragrances.\n\n" +
                "What you can do:\n" +
                "  • Discover – Browse thousands of fragrances\n" +
                "  • Collect   – Build your personal collection\n" +
                "  • Review    – Rate and review scents\n" +
                "  • Notify    – Get alerts for new releases\n\n" +
                "Open the app to start exploring!\n\n" +
                "Need help? Email us: " + SUPPORT_EMAIL + "\n\n" +
                "– The Perfume Treasure Team";
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private static String featureRow(String icon, String title, String description) {
        return "<tr><td style=\"padding:10px 0;vertical-align:top;width:40px;font-size:22px;\">" + icon + "</td>" +
                "<td style=\"padding:10px 0 10px 12px;\">" +
                "<strong style=\"color:#3a2a1a;font-size:15px;\">" + title + "</strong>" +
                "<p style=\"color:#5a4a3a;font-size:14px;margin:4px 0 0;line-height:1.5;\">" + description + "</p>" +
                "</td></tr>";
    }

    /** Basic HTML entity escaping to prevent injection in the user name. */
    private static String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
