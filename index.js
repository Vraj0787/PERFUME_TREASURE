/**
 * functions/index.js
 * Firebase Cloud Functions – Perfume Treasure
 *
 * sendWelcomeEmail: HTTPS Callable function triggered by SignUpActivity.
 * Uses Nodemailer with an SMTP provider (SendGrid, Gmail, etc.).
 *
 * Setup:
 *   1. cd functions && npm install
 *   2. firebase functions:config:set \
 *        email.host="smtp.sendgrid.net" \
 *        email.port="587" \
 *        email.user="apikey" \
 *        email.pass="YOUR_SENDGRID_API_KEY" \
 *        email.from="Perfume Treasure <noreply@perfumetreasure.com>"
 *   3. firebase deploy --only functions
 */

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// ── Transporter (configured via Firebase env) ──────────────────────────────
function createTransporter() {
  const cfg = functions.config().email;
  return nodemailer.createTransport({
    host: cfg.host,
    port: parseInt(cfg.port, 10),
    secure: parseInt(cfg.port, 10) === 465,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });
}

// ── Cloud Function ─────────────────────────────────────────────────────────
exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  // Optional: require auth
  // if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Sign in required.");

  const { toEmail, userName, subject, htmlBody, textBody } = data;

  if (!toEmail || !userName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "toEmail and userName are required."
    );
  }

  const transporter = createTransporter();
  const fromAddress = functions.config().email.from ||
    "Perfume Treasure <noreply@perfumetreasure.com>";

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: subject || "Welcome to Perfume Treasure!",
    html: htmlBody,
    text: textBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    functions.logger.info(`Welcome email sent to ${toEmail}`);
    return { success: true };
  } catch (error) {
    functions.logger.error("Failed to send welcome email:", error);
    throw new functions.https.HttpsError("internal", "Email delivery failed.");
  }
});
