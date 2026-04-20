# Perfume Treasure

React Native mobile app for the `Perfume Treasure` storefront and account flow.

## What Is Included

- Login screen
- Signup screen
- Backend-connected login, signup, and password reset flow
- Home screen
- Product browsing and detail flow
- React Navigation screen flow
- Black, gold, and ivory perfume-themed UI

## Tech Stack

- React Native
- JavaScript
- React Navigation
- React Native Safe Area Context

## Project Structure

```text
Perfume_App/
├── App.js
├── index.js
├── src/
│   ├── assets/
│   ├── screens/
│   └── theme.js
├── android/
├── ios/
├── package.json
└── README.md
```

## Prerequisites

Each teammate should install these first:

- Node.js
- npm
- Xcode for iOS development
- Android Studio for Android development
- CocoaPods for iOS dependencies
- A running iOS Simulator or Android Emulator, or a physical device

Helpful official setup guide:

- [React Native environment setup](https://reactnative.dev/docs/environment-setup)

## Clone And Install

```bash
git clone <your-repo-url>
cd Perfume_App
npm install
```

## iOS Setup

Run this after cloning the project, and any time native dependencies change:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

If `bundle install` is not needed on your machine, you can usually run:

```bash
cd ios
bundle exec pod install
cd ..
```

## Start The App

Start Metro in one terminal:

```bash
npm start
```

Keep that terminal open.

### Run On Android

1. Open Android Studio.
2. Start an emulator from Device Manager, or connect an Android phone with USB debugging enabled.
3. In a new terminal:

```bash
cd Perfume_App
npm run android
```

### Run On iOS

1. Open Xcode if needed and make sure a simulator is available.
2. In a new terminal:

```bash
cd Perfume_App
npm run ios
```

## Basic Test Flow

Use this to quickly verify the app after setup:

1. Open the app on iOS or Android.
2. On the Login screen, tap `Log In` with empty fields and confirm an alert appears.
3. Tap `Sign Up`.
4. Create an account with name, email, password, and confirm password.
5. Confirm the app opens the Home screen.
6. Tap `Log Out` and sign back in with the same credentials.
7. Confirm the app opens the Home screen again.
8. Tap `Forgot Password?` and reset the password for that email.
9. Sign in with the new password.

## Useful Commands

```bash
npm start
npm run android
npm run ios
npm test -- --runInBand
npm run lint
```

## Troubleshooting

### iOS build issues

Try:

```bash
cd ios
bundle exec pod install
cd ..
npm run ios
```

### Android build issues

Check:

- Android Studio is installed
- An emulator is already running
- Android SDK is configured correctly

Then rerun:

```bash
npm run android
```

### Metro cache issues

If Metro gets stuck, stop it and restart:

```bash
npm start -- --reset-cache
```

## Notes For The Team

- Do not commit `node_modules/`
- Keep `package-lock.json` checked in
- After dependency changes, run `npm install`
- After native iOS dependency changes, run `bundle exec pod install` inside `ios/`

## Current Auth State

The mobile auth screens are connected to the Flask backend in `backend/`. Product browsing is already backend-driven, and cart/checkout/order endpoints are ready for the next phase of UI integration.
