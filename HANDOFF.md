# Perfume Treasure Handoff

## Scope Completed

This handoff covers the parts already completed for:

- auth UI flow
- home screen
- product browsing flow
- backend-driven category and product viewing

## Screens Already Built

- `src/screens/LoginScreen.js`
- `src/screens/SignupScreen.js`
- `src/screens/ForgotPasswordScreen.js`
- `src/screens/ResetPasswordScreen.js`
- `src/screens/HomeScreen.js`
- `src/screens/ProductListScreen.js`
- `src/screens/ProductDetailScreen.js`

## Frontend API Layer

- `src/services/api.js`

This file is currently responsible for:

- loading categories from the backend
- loading featured products from the backend
- loading products by category
- applying backend search and sorting

## Backend Location

- `backend/`

## Backend Endpoints Ready To Use

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Categories

- `GET /api/categories`
- `GET /api/categories/<slug>`

### Products

- `GET /api/products`
- `GET /api/products/<slug>`

Supported query params for `/api/products`:

- `category`
- `search`
- `sort`
- `featured`

Examples:

- `GET /api/products?category=men`
- `GET /api/products?search=oud`
- `GET /api/products?sort=price_asc`
- `GET /api/products?featured=true`

### Cart

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/<item_id>`
- `DELETE /api/cart/items/<item_id>`
- `DELETE /api/cart`

### Addresses

- `GET /api/addresses`
- `POST /api/addresses`
- `PATCH /api/addresses/<address_id>`
- `DELETE /api/addresses/<address_id>`

### Checkout / Orders

- `POST /api/checkout`
- `GET /api/orders`
- `GET /api/orders/<order_id>`

## What Is Already Connected In The App

- home categories come from the backend
- featured product comes from the backend
- product list comes from the backend
- search uses backend data
- sort uses backend data
- product detail screen receives backend product data

## What Still Needs Integration

- cart screen to backend cart endpoints
- checkout screen to backend address and checkout endpoints
- order confirmation / order history to orders endpoints
- optional switch from local demo auth to backend auth

## Local Backend Run Notes

The backend currently runs from:

- `backend/run.py`

Current local API base behavior in:

- `src/services/api.js`

Configured hosts:

- iOS simulator uses `127.0.0.1:5001`
- Android emulator uses `10.0.2.2:5001`

## Recommended Next Work For Teammates

1. Build `CartScreen`
2. Connect cart actions to `/api/cart`
3. Build `CheckoutScreen`
4. Connect address form to `/api/addresses`
5. Connect place-order action to `/api/checkout`
6. Build `OrderConfirmationScreen`
7. Optionally connect login/signup to backend auth after cart and checkout are stable

## Current Product Categories

- `Men`
- `Women`
- `Sets`
- `Shop All`

## Notes

- Product browsing on Home and Product List is no longer using local mock arrays.
- The backend has seed data ready for milestone work.
- Backend setup instructions are documented in:
  - `backend/README.md`
