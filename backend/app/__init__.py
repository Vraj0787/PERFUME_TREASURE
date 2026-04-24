import os

from flask import Flask, jsonify, send_from_directory
from sqlalchemy import inspect, text

from . import models  # noqa: F401
from .config import Config
from .extensions import cors, db, jwt, migrate
from .routes.addresses import addresses_bp
from .routes.admin import admin_bp
from .routes.auth import auth_bp
from .routes.cart import cart_bp
from .routes.categories import categories_bp
from .routes.checkout import checkout_bp
from .routes.orders import orders_bp
from .routes.payments import payments_bp
from .routes.products import products_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    register_extensions(app)
    with app.app_context():
        db.create_all()
        ensure_schema_columns()
    register_blueprints(app)
    register_error_handlers(app)

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.get("/media/<path:filename>")
    def media_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    return app


def register_extensions(app):
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)


def ensure_schema_columns():
    def _has_column(table_name, column_name):
        inspector = inspect(db.engine)
        return any(column["name"] == column_name for column in inspector.get_columns(table_name))

    statements = []

    if not _has_column("users", "loyalty_points_balance"):
        statements.append(
            "ALTER TABLE users ADD COLUMN loyalty_points_balance INT NOT NULL DEFAULT 0"
        )

    if not _has_column("products", "how_to_apply"):
        statements.append("ALTER TABLE products ADD COLUMN how_to_apply TEXT NULL")

    if not _has_column("products", "size_label"):
        statements.append("ALTER TABLE products ADD COLUMN size_label VARCHAR(120) NULL")

    if not _has_column("products", "collection_id"):
        statements.append(
            "ALTER TABLE products ADD COLUMN collection_id CHAR(36) NULL"
        )

    if not _has_column("products", "subtitle"):
        statements.append("ALTER TABLE products ADD COLUMN subtitle VARCHAR(255) NULL")

    if not _has_column("orders", "points_earned"):
        statements.append(
            "ALTER TABLE orders ADD COLUMN points_earned INT NOT NULL DEFAULT 0"
        )

    if not _has_column("orders", "notes"):
        statements.append("ALTER TABLE orders ADD COLUMN notes TEXT NULL")

    if not _has_column("orders", "discount_amount"):
        statements.append(
            "ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0"
        )

    if not _has_column("orders", "discount_code"):
        statements.append("ALTER TABLE orders ADD COLUMN discount_code VARCHAR(64) NULL")

    if not _has_column("profiles", "notes"):
        statements.append("ALTER TABLE profiles ADD COLUMN notes TEXT NULL")

    if _has_column("discount_codes", "code") and not _has_column("discount_codes", "usage_count"):
        statements.append(
            "ALTER TABLE discount_codes ADD COLUMN usage_count INT NOT NULL DEFAULT 0"
        )

    for statement in statements:
        db.session.execute(text(statement))

    if statements:
        db.session.commit()


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(cart_bp, url_prefix="/api/cart")
    app.register_blueprint(addresses_bp, url_prefix="/api/addresses")
    app.register_blueprint(checkout_bp, url_prefix="/api/checkout")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")


def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"message": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(_error):
        return jsonify({"message": "Internal server error"}), 500
