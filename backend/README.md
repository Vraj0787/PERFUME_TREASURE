# Perfume Treasure Backend

Flask + MySQL backend for the `Perfume Treasure` mobile app

## Stack

- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- MySQL

## Features Included

- User signup and login
- JWT-protected profile lookup
- Categories API
- Products API with search and sorting
- Browser-based admin dashboard
- Cart API
- Address API
- Checkout API
- Orders API
- Seed script for starter data

## Project Structure

```text
backend/
├── app/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── __init__.py
│   ├── config.py
│   ├── extensions.py
│   └── serializers.py
├── .env.example
├── README.md
├── requirements.txt
├── run.py
├── schema.sql
└── seed.py
```

## Setup

1. Create a MySQL database named `perfume_treasure`
2. Copy `.env.example` to `.env`
3. Update your MySQL credentials in `.env`
4. Create and activate a Python virtual environment
5. Install dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run The API

```bash
cd backend
source .venv/bin/activate
python run.py
```

The API will run on:

```text
http://127.0.0.1:5000
```

Admin dashboard:

```text
http://127.0.0.1:5000/admin/login
```

## Create Tables Quickly

You can either:

- import `schema.sql` into MySQL manually, or
- use the seed script, which will create tables from SQLAlchemy models

## Seed Sample Data

```bash
cd backend
source .venv/bin/activate
python seed.py
```

## Main API Endpoints

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

Sort values:

- `featured`
- `price_asc`
- `price_desc`
- `name_asc`

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

### Checkout

- `POST /api/checkout`

### Orders

- `GET /api/orders`
- `GET /api/orders/<order_id>`

## Admin Dashboard

The backend includes a simple admin management layer for:

- creating categories
- editing categories
- deleting categories
- creating products
- editing products
- deleting products
- uploading product images
- inventory updates
- product active / featured toggles
- dashboard filters and summary cards

Set these values in `.env`:

```env
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-admin-password
```

Then open:

```text
/admin/login
```

Uploaded product images are served by the backend at:

```text
/media/<filename>
```

## Example Auth Payloads

### Signup

```json
{
  "full_name": "Vraj Patel",
  "email": "vraj@example.com",
  "password": "Password123",
  "phone": "1234567890"
}
```

### Login

```json
{
  "email": "vraj@example.com",
  "password": "Password123"
}
```

## Notes

- Checkout is currently backend-managed but payment gateway integration is still open for Stripe later.
- Password reset email flow is not yet implemented in the backend.
