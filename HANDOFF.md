# Perfume Treasure Handoff

## Current State

This repo contains:

- React Native mobile frontend
- Flask backend
- MySQL database integration
- browser admin portal
- cart / checkout / orders flow
- favorites
- best sellers from backend
- reviews connected to backend

## Local Access Summary

### Frontend

```bash
cd /Users/vrajpatel/PERFUME_TREASURE
npm install
npm start -- --reset-cache
npm run ios
```

### Backend

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install cryptography
python seed.py
python run.py
```

### Database

- MySQL database name: `perfume_treasure`
- credentials come from `backend/.env`

### Admin

- [http://127.0.0.1:5001/admin/login](http://127.0.0.1:5001/admin/login)

## Important Local Config

The app currently expects:

- iOS simulator backend host: `127.0.0.1:5001`
- Android emulator backend host: `10.0.2.2:5001`

Configured in:

- [src/services/api.js](/Users/vrajpatel/PERFUME_TREASURE/src/services/api.js)

## Main Functional Areas To Test

1. Signup / login / reset password
2. Home categories / featured / best sellers
3. Product list and product detail
4. Favorites
5. Cart
6. Checkout
7. Order history
8. Product reviews
9. Admin login and catalog management

## Common Issues Teammates May Hit

### Frontend

- `react-native: command not found`
  - run `npm install`

- AsyncStorage missing
  - run `npm install @react-native-async-storage/async-storage`
  - run `bundle exec pod install`

- iOS pod errors
  - run `cd ios && bundle exec pod install`

### Backend

- `source: no such file or directory: .venv/bin/activate`
  - create the venv first with `python3 -m venv .venv`

- `python: command not found`
  - use `python3`

- MySQL access denied
  - fix `MYSQL_PASSWORD` in `backend/.env`

- `cryptography package is required`
  - `pip install cryptography`

- Admin returns `Internal server error`
  - check Flask terminal traceback

## Recommended Docs For Teammates

- main setup guide: [README.md](/Users/vrajpatel/PERFUME_TREASURE/README.md)
- backend details: [backend/README.md](/Users/vrajpatel/PERFUME_TREASURE/backend/README.md)
