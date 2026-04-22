import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

/**
 * PerfumeTreasureWelcomeSMS.java
 * 
 * Sends a welcome SMS to a newly registered user of the "Perfume Treasure" mobile app.
 * 
 * DEPENDENCIES (add to pom.xml or build.gradle):
 * --------------------------------------------------
 * Maven:
 *   <dependency>
 *     <groupId>com.twilio.sdk</groupId>
 *     <artifactId>twilio</artifactId>
 *     <version>9.14.0</version>
 *   </dependency>
 *
 * Gradle:
 *   implementation 'com.twilio.sdk:twilio:9.14.0'
 *
 * SETUP:
 * --------------------------------------------------
 * 1. Sign up at https://www.twilio.com and get your:
 *    - ACCOUNT_SID
 *    - AUTH_TOKEN
 *    - A Twilio phone number (FROM_NUMBER)
 * 2. Replace the placeholder values below with your credentials.
 *    *** NEVER hardcode credentials in production — use environment variables. ***
 *
 * USAGE:
 * --------------------------------------------------
 *   WelcomeSMSSender sender = new WelcomeSMSSender();
 *   sender.sendWelcome("John", "+19735550100");
 */
public class PerfumeTreasureWelcomeSMS {

    // -----------------------------------------------------------------------
    // ⚠️  REPLACE with your actual Twilio credentials
    //     For production, load from environment variables (shown below)
    // -----------------------------------------------------------------------
    private static final String ACCOUNT_SID = System.getenv("TWILIO_ACCOUNT_SID");   // e.g. "ACxxxxxxxxxxxxxxxx"
    private static final String AUTH_TOKEN  = System.getenv("TWILIO_AUTH_TOKEN");    // e.g. "your_auth_token"
    private static final String FROM_NUMBER = System.getenv("TWILIO_PHONE_NUMBER");  // e.g. "+12015550123"

    /**
     * Sends a personalized welcome SMS to a newly signed-up user.
     *
     * @param userName       The display name of the new user (e.g. "Emma").
     * @param toPhoneNumber  The recipient's phone number in E.164 format (e.g. "+19735550100").
     */
    public void sendWelcome(String userName, String toPhoneNumber) {
        // Validate inputs before attempting to send
        if (userName == null || userName.isBlank()) {
            throw new IllegalArgumentException("User name must not be null or empty.");
        }
        if (toPhoneNumber == null || !toPhoneNumber.matches("^\\+[1-9]\\d{7,14}$")) {
            throw new IllegalArgumentException(
                "Phone number must be in E.164 format (e.g. +19735550100). Got: " + toPhoneNumber);
        }

        // Initialize the Twilio client
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);

        // Build the welcome message
        String messageBody = buildWelcomeMessage(userName);

        // Send the SMS via Twilio
        Message message = Message.creator(
                new PhoneNumber(toPhoneNumber),   // To
                new PhoneNumber(FROM_NUMBER),     // From
                messageBody
        ).create();

        System.out.println("✅ Welcome SMS sent to " + toPhoneNumber);
        System.out.println("   Message SID : " + message.getSid());
        System.out.println("   Status      : " + message.getStatus());
    }

    /**
     * Builds the welcome message body for a new Perfume Treasure user.
     *
     * @param userName  The first name of the new user.
     * @return          The formatted welcome message string.
     */
    private String buildWelcomeMessage(String userName) {
        return String.format(
            "Welcome to Perfume Treasure, %s! 🌸✨\n\n" +
            "We're thrilled to have you join our fragrance community. " +
            "Discover your signature scent from hundreds of luxury perfumes, " +
            "exclusive deals, and personalized recommendations — all in one place.\n\n" +
            "👉 Open the app and start exploring your treasure today!\n\n" +
            "Need help? Reply HELP or visit support.perfumetreasure.com\n" +
            "Reply STOP to unsubscribe.",
            userName
        );
    }

    // -----------------------------------------------------------------------
    // Quick demo — remove or replace with your actual signup integration
    // -----------------------------------------------------------------------
    public static void main(String[] args) {
        // Example: called from your signup service after a new user registers
        String newUserName   = "Emma";
        String newUserPhone  = "+19735550100"; // Replace with a real test number

        PerfumeTreasureWelcomeSMS smsService = new PerfumeTreasureWelcomeSMS();

        try {
            smsService.sendWelcome(newUserName, newUserPhone);
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Validation error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
