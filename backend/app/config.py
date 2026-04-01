import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()


class Config:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
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
