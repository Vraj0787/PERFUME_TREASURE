# Perfume Treasure Backend

Flask + MySQL backend for the Perfume Treasure mobile app and admin portal.

## Run Order

1. Create the MySQL database
2. Configure `backend/.env`
3. Create Python virtual environment
4. Install requirements
5. Install `cryptography`
6. Seed data
7. Run Flask

## Setup

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install cryptography
```

## MySQL

Expected database name:

```text
perfume_treasure
```

Check:

```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'perfume_treasure';"
```

Create if missing:

```bash
mysql -u root -p -e "CREATE DATABASE perfume_treasure;"
```

## Environment File

Create [backend/.env](/Users/vrajpatel/PERFUME_TREASURE/backend/.env):

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

## Seed And Run

```bash
cd /Users/vrajpatel/PERFUME_TREASURE/backend
source .venv/bin/activate
python seed.py
python run.py
```

Backend URLs:

- API: [http://127.0.0.1:5001](http://127.0.0.1:5001)
- Health: [http://127.0.0.1:5001/api/health](http://127.0.0.1:5001/api/health)
- Admin login: [http://127.0.0.1:5001/admin/login](http://127.0.0.1:5001/admin/login)

## Key Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

### Categories

- `GET /api/categories`

### Products

- `GET /api/products`
- `GET /api/products/<slug>`
- `GET /api/products/best-sellers`
- `GET /api/products/<slug>/reviews`
- `GET /api/products/reviews/recent`
- `POST /api/products/<slug>/reviews`

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
- `POST /api/checkout/quote`
- `GET /api/orders`
- `GET /api/orders/<order_id>`

## Admin

Open:

- [http://127.0.0.1:5001/admin/login](http://127.0.0.1:5001/admin/login)

Use:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Common Backend Problems

### `Port 5000 is in use`

Use `5001`. This project is expected to run on `5001`.

### `Access denied for user 'root'@'localhost'`

Your MySQL password in `.env` is wrong.

### `cryptography package is required`

Run:

```bash
pip install cryptography
```

### `Internal server error` in browser

Check the Flask terminal output for the real traceback.

### Reviews table missing

Run the backend again after updating models/schema so `db.create_all()` can create missing tables, or rerun `seed.py`.
