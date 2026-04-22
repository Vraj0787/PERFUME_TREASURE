# Perfume Treasure

Perfume Treasure is a React Native mobile storefront backed by a Flask + MySQL API and admin portal.

This README is the main setup and testing guide for teammates. It explains how to run:

- the mobile app
- the backend API
- the MySQL database
- the admin portal
- the main test flows
- the common errors you may hit locally

## Repo Structure

```text
PERFUME_TREASURE/
├── App.js
├── App.tsx
├── src/
│   ├── screens/
│   ├── services/
│   └── theme.js
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── run.py
│   ├── schema.sql
│   ├── seed.py
│   └── README.md
├── ios/
├── android/
├── package.json
└── HANDOFF.md
```

## Main Parts Of The Project

- Mobile app: React Native frontend in the repo root
- Backend API: Flask app in [backend](/Users/vrajpatel/PERFUME_TREASURE/backend)
- Database: MySQL database named `perfume_treasure`
- Admin portal: browser-based admin served by Flask at `/admin`

## What Is Already Built

- signup, login, and password reset flow
- home screen with categories, featured products, and best sellers
- product list and product detail flow
- favorites
- cart
- checkout
- order history
- browser admin portal
- backend-connected reviews

## Prerequisites

Install these on your machine first:

- Node.js and npm
- Python 3
- MySQL
- Xcode for iOS work
- CocoaPods for iOS native dependencies
- Android Studio if you want Android testing

Helpful official guide:

- [React Native environment setup](https://reactnative.dev/docs/environment-setup)

## 1. Clone And Install Frontend Dependencies

```bash
git clone https://github.com/Vraj0787/PERFUME_TREASURE.git
cd /Users/vrajpatel/PERFUME_TREASURE
npm install
```

If the app says `react-native: command not found`, it usually means `npm install` has not been run in the project root yet.

## 2. iOS Native Setup

Run this after cloning, and again any time native dependencies change:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/ios
bundle install
bundle exec pod install
```

If `bundle exec pod install` fails, try:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/ios
pod install
```

If iOS build errors mention:

- `Pods-Perfume_App.debug.xcconfig`
- `Pods-Perfume_App-frameworks-*.xcfilelist`
- `Pods-Perfume_App-resources-*.xcfilelist`

then pods are out of sync and `pod install` needs to be rerun.

## 3. Backend Setup

### Create And Activate The Python Virtual Environment

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install cryptography
```

Why `cryptography` is needed:

- local MySQL auth may use `caching_sha2_password`
- PyMySQL needs `cryptography` for that auth method

### Database Requirements

Create a local MySQL database named:

```text
perfume_treasure
```

You can check whether it exists with:

```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'perfume_treasure';"
```

If it does not exist:

```bash
mysql -u root -p -e "CREATE DATABASE perfume_treasure;"
```

### Backend Environment File

Set up [backend/.env](/Users/vrajpatel/PERFUME_TREASURE/backend/.env) with your local values:

```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
ADMIN_USERNAME=perfume_treasure
ADMIN_PASSWORD=pt_123
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DB=perfume_treasure
```

Important:

- `MYSQL_PASSWORD` must match your real local MySQL password
- `SECRET_KEY` and `JWT_SECRET_KEY` should avoid spaces

### Seed Starter Data

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/backend
source .venv/bin/activate
python seed.py
```

### Run The Backend

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/backend
source .venv/bin/activate
python run.py
```

Local backend URLs:

- API health: [http://127.0.0.1:5001/api/health](http://127.0.0.1:5001/api/health)
- Admin login: [http://127.0.0.1:5001/admin/login](http://127.0.0.1:5001/admin/login)

## 4. Start Metro And Run The App

Start Metro in one terminal:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE
npm start -- --reset-cache
```

Keep that terminal open.

### Run iOS

```bash
cd /Users/vrajpatel/PERFUME_TREASURE
npm run ios
```

### Run Android

```bash
cd /Users/vrajpatel/PERFUME_TREASURE
npm run android
```

API host behavior in the app:

- iOS simulator uses `127.0.0.1:5001`
- Android emulator uses `10.0.2.2:5001`

This is configured in [src/services/api.js](/Users/vrajpatel/PERFUME_TREASURE/src/services/api.js).

## 5. How To Access Everything

### Frontend

- run Metro from the repo root
- run `npm run ios` or `npm run android`

### Backend

Open these in a browser:

- [http://127.0.0.1:5001/api/health](http://127.0.0.1:5001/api/health)
- [http://127.0.0.1:5001/api/categories](http://127.0.0.1:5001/api/categories)
- [http://127.0.0.1:5001/api/products](http://127.0.0.1:5001/api/products)
- [http://127.0.0.1:5001/api/products/best-sellers](http://127.0.0.1:5001/api/products/best-sellers)
- [http://127.0.0.1:5001/api/products/reviews/recent](http://127.0.0.1:5001/api/products/reviews/recent)

### Admin Portal

- [http://127.0.0.1:5001/admin/login](http://127.0.0.1:5001/admin/login)

Login with the values from `backend/.env`:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### Database

Direct local MySQL access:

```bash
mysql -u root -p
```

Then:

```sql
USE perfume_treasure;
SHOW TABLES;
```

## 6. Main Test Flow

Use this order so teammates test the whole system consistently.

### Auth

1. Open the app
2. Sign up with a new account
3. Confirm Home loads
4. Close and reopen the app
5. Confirm login persists
6. Log out
7. Log back in
8. Test forgot/reset password

### Home And Products

1. Confirm categories load
2. Confirm featured products load
3. Confirm best sellers load
4. Open category pages
5. Search and sort products
6. Open a product
7. Confirm image, description, how to apply, and reviews access are working

### Cart And Checkout

1. Add a product to cart
2. Open cart
3. Increase and decrease quantity
4. Remove an item
5. Add again
6. Proceed to checkout
7. Add/select address
8. Place order

### Orders

1. Open order history
2. Open order details
3. Confirm totals and address are correct

### Reviews

1. Open a product
2. Tap `View Reviews`
3. Submit a review
4. Confirm it appears on the product
5. Open the home menu `Reviews`
6. Confirm it appears in the recent reviews list

### Admin

1. Open admin login
2. Log in
3. Confirm dashboard loads
4. Open products
5. Open categories
6. Open settings/orders/customers if available in this version

## 7. Common Problems And Fixes

### `Port 5000 is in use`

macOS often reserves `5000` through Control Center / AirPlay Receiver.

This project should run on `5001`.

Check [backend/run.py](/Users/vrajpatel/PERFUME_TREASURE/backend/run.py) if needed.

### `Access denied for user 'root'@'localhost'`

Your MySQL password in `backend/.env` is wrong.

Update:

```env
MYSQL_PASSWORD=your_real_password
```

### `cryptography package is required`

Run:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/backend
source .venv/bin/activate
pip install cryptography
```

### `react-native: command not found`

Frontend packages are not installed yet:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE
npm install
```

### `Unable to resolve module @react-native-async-storage/async-storage`

Install the missing package:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE
npm install @react-native-async-storage/async-storage
cd ios
bundle exec pod install
```

### `AsyncStorage is null`

The JS package may be installed, but iOS pods were not rebuilt.

Run:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/ios
bundle exec pod install
```

Then restart Metro and rerun iOS.

### `The sandbox is not in sync with the Podfile.lock`

Run:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/ios
bundle exec pod install
```

### Missing `Pods-Perfume_App.debug.xcconfig`

Run:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/ios
bundle exec pod install
```

### Cart keeps flashing

This usually means a state/update loop or stale Metro cache.

Try:

```bash
cd /Users/vrajpatel/PERFUME_TREASURE
npm start -- --reset-cache
```

Then rerun the app.

### Admin portal shows `{"message":"Internal server error"}`

Check the backend terminal for the Flask traceback.

The browser only shows the generic 500 response; the actual cause will be in the backend terminal.

### Product images do not load

Check:

- backend is running
- seeded product image URLs are valid
- `/media/...` URLs open in the browser

### Backend starts but frontend cannot reach it

Check:

- backend is running on `5001`
- Metro was restarted after code changes
- iOS simulator uses `127.0.0.1`
- Android emulator uses `10.0.2.2`

## 8. Notes For Teammates

- Do not commit `.venv/`
- Do not commit `node_modules/`
- Do not commit local secrets from `backend/.env`
- Keep `package-lock.json` committed
- Rerun `npm install` after pulling JS dependency changes
- Rerun `bundle exec pod install` after pulling iOS/native dependency changes
- Rerun `pip install -r backend/requirements.txt` after backend dependency changes

## 9. Additional Docs

- Backend setup and endpoint summary: [backend/README.md](/Users/vrajpatel/PERFUME_TREASURE/backend/README.md)
- Project handoff notes: [HANDOFF.md](/Users/vrajpatel/PERFUME_TREASURE/HANDOFF.md)
