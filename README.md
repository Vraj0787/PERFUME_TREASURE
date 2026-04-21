# 📦 Perfume Treasure – Welcome Email Feature

> Drop-in welcome email system for the **Perfume Treasure** Android app.  
> Sends a branded HTML email to every new user immediately after sign-up.

---

## 📁 Files Added

```
PerfumeTreasure/
├── app/
│   ├── build.gradle                              ← Add dependencies here
│   └── src/
│       ├── main/
│       │   ├── java/com/perfumetreasure/
│       │   │   ├── email/
│       │   │   │   ├── EmailService.java          ← Interface (swap provider easily)
│       │   │   │   ├── FirebaseEmailService.java  ← Firebase Cloud Function caller
│       │   │   │   └── WelcomeEmailTemplate.java  ← HTML + plain-text email builder
│       │   │   └── ui/auth/
│       │   │       └── SignUpActivity.java         ← Registration screen
│       │   └── res/layout/
│       │       └── activity_sign_up.xml           ← Sign-up UI layout
│       └── test/java/com/perfumetreasure/email/
│           └── WelcomeEmailTemplateTest.java      ← Unit tests
└── functions/
    ├── index.js                                   ← Firebase Cloud Function (Node.js)
    └── package.json
```

---

## 🚀 Integration Steps

### 1. Android – Add Firebase to your project
1. Go to [Firebase Console](https://console.firebase.google.com) → your project.
2. Download `google-services.json` → place in `app/`.
3. In your **root** `build.gradle`, confirm:
   ```groovy
   classpath 'com.google.gms:google-services:4.4.2'
   ```
4. Merge the `dependencies {}` block from `app/build.gradle` into your existing file.

### 2. Android – Copy Java source files
Copy these packages into your existing source tree (adjust the root package if yours differs from `com.perfumetreasure`):

- `email/EmailService.java`
- `email/FirebaseEmailService.java`
- `email/WelcomeEmailTemplate.java`
- `ui/auth/SignUpActivity.java`

If you already have a `SignUpActivity`, integrate the email trigger from the **"Sign-up flow"** section (lines ~60–100 of `SignUpActivity.java`).

### 3. Android – Register activity in AndroidManifest.xml
```xml
<activity android:name=".ui.auth.SignUpActivity" />
```

### 4. Deploy the Cloud Function
```bash
cd functions
npm install
firebase login
firebase use --add          # select your Firebase project

# Set SMTP credentials (example: SendGrid)
firebase functions:config:set \
  email.host="smtp.sendgrid.net" \
  email.port="587" \
  email.user="apikey" \
  email.pass="SG.YOUR_KEY_HERE" \
  email.from="Perfume Treasure <noreply@perfumetreasure.com>"

firebase deploy --only functions
```

### 5. Verify
1. Run the Android app → create a new account.
2. Check **Firebase Console → Functions → Logs** for `Welcome email sent to …`.
3. Check the inbox of the test email address.

---

## 🔌 Swapping the Email Provider

The `EmailService` interface lets you swap delivery backends without touching `SignUpActivity`:

```java
// Current: Firebase Cloud Function
EmailService emailService = new FirebaseEmailService();

// Future: direct SMTP, AWS SES, Mailgun, etc.
// EmailService emailService = new AwsSesEmailService();
```

---

## 🧪 Running Unit Tests

```bash
./gradlew test
```

---

## 🛠 Customization

| What to change | Where |
|---|---|
| Email subject | `WelcomeEmailTemplate.SUBJECT` |
| Brand color | `WelcomeEmailTemplate.BRAND_COLOR` |
| Email HTML content | `WelcomeEmailTemplate.buildHtmlBody()` |
| Support email address | `WelcomeEmailTemplate.SUPPORT_EMAIL` |
| SMTP provider | `functions/index.js` + Firebase config |

---

## 📋 Requirements

- Android minSdk 24+
- Firebase project with Authentication + Cloud Functions enabled
- SMTP provider account (SendGrid recommended for production)
