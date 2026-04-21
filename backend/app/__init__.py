import os

from flask import Flask, jsonify, send_from_directory

from .config import Config
from .extensions import cors, db, jwt, migrate
from .routes.addresses import addresses_bp
from .routes.admin import admin_bp
from .routes.auth import auth_bp
from .routes.cart import cart_bp
from .routes.categories import categories_bp
from .routes.checkout import checkout_bp
from .routes.orders import orders_bp
from .routes.products import products_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    register_extensions(app)
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


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(cart_bp, url_prefix="/api/cart")
    app.register_blueprint(addresses_bp, url_prefix="/api/addresses")
    app.register_blueprint(checkout_bp, url_prefix="/api/checkout")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")


def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"message": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(_error):
        return jsonify({"message": "Internal server error"}), 500
