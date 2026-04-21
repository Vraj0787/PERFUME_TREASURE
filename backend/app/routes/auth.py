from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required

from ..extensions import db
from ..models.profile import Profile
from ..models.user import User
from ..serializers import serialize_user
from ..utils.auth import get_current_user
from ..utils.responses import error_response, success_response

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/signup")
def signup():
    payload = request.get_json() or {}

    full_name = (payload.get("full_name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    phone = (payload.get("phone") or "").strip() or None

    if not full_name or not email or not password:
        return error_response("full_name, email, and password are required")

    if User.query.filter_by(email=email).first():
        return error_response("A user with this email already exists", 409)

    user = User(email=email)
    user.set_password(password)
    user.profile = Profile(full_name=full_name, phone=phone)

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    return success_response(
        {
          "token": access_token,
          "user": serialize_user(user),
        },
        "Account created successfully",
        201,
    )


@auth_bp.post("/login")
def login():
    payload = request.get_json() or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return error_response("email and password are required")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return error_response("Invalid credentials", 401)

    access_token = create_access_token(identity=user.id)
    return success_response(
        {
            "token": access_token,
            "user": serialize_user(user),
        },
        "Logged in successfully",
    )


@auth_bp.get("/me")
@jwt_required()
def me():
    user = get_current_user()
    if not user:
        return error_response("User not found", 404)
    return success_response(serialize_user(user))
