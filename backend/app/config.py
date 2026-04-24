import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()


class Config:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    APP_ENV = os.getenv("APP_ENV", "development")
    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5001")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    STRIPE_MERCHANT_IDENTIFIER = os.getenv(
        "STRIPE_MERCHANT_IDENTIFIER",
        "merchant.net.perfumetreasure",
    )
    STRIPE_MERCHANT_DISPLAY_NAME = os.getenv(
        "STRIPE_MERCHANT_DISPLAY_NAME",
        "Perfume Treasure",
    )
    STRIPE_CURRENCY = os.getenv("STRIPE_CURRENCY", "usd")
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    _mysql_password = quote_plus(os.getenv("MYSQL_PASSWORD", "password"))
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('MYSQL_USER', 'root')}:"
        f"{_mysql_password}@"
        f"{os.getenv('MYSQL_HOST', '127.0.0.1')}:"
        f"{os.getenv('MYSQL_PORT', '3306')}/"
        f"{os.getenv('MYSQL_DB', 'perfume_treasure')}"
    )
