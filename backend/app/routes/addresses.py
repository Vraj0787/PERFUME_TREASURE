from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models.address import Address
from ..serializers import serialize_address
from ..utils.auth import get_current_user
from ..utils.responses import error_response, success_response

addresses_bp = Blueprint("addresses", __name__)


def _set_default_address(user_id, address):
    Address.query.filter_by(user_id=user_id, is_default=True).update({"is_default": False})
    address.is_default = True


@addresses_bp.get("")
@jwt_required()
def list_addresses():
    user = get_current_user()
    addresses = Address.query.filter_by(user_id=user.id).order_by(Address.created_at.desc()).all()
    return success_response([serialize_address(address) for address in addresses])


@addresses_bp.post("")
@jwt_required()
def create_address():
    user = get_current_user()
    payload = request.get_json() or {}

    required_fields = ["full_name", "line1", "city", "postal_code", "country"]
    missing = [field for field in required_fields if not (payload.get(field) or "").strip()]

    if missing:
        return error_response("Missing required address fields", errors=missing)

    address = Address(
        user_id=user.id,
        full_name=payload["full_name"].strip(),
        line1=payload["line1"].strip(),
        line2=(payload.get("line2") or "").strip() or None,
        city=payload["city"].strip(),
        state=(payload.get("state") or "").strip() or None,
        postal_code=payload["postal_code"].strip(),
        country=payload["country"].strip(),
        phone=(payload.get("phone") or "").strip() or None,
        is_default=bool(payload.get("is_default", False)),
    )

    if address.is_default or not user.addresses:
        _set_default_address(user.id, address)

    db.session.add(address)
    db.session.commit()
    return success_response(serialize_address(address), "Address created", 201)


@addresses_bp.patch("/<address_id>")
@jwt_required()
def update_address(address_id):
    user = get_current_user()
    address = Address.query.filter_by(id=address_id, user_id=user.id).first()

    if not address:
        return error_response("Address not found", 404)

    payload = request.get_json() or {}

    for field in ["full_name", "line1", "line2", "city", "state", "postal_code", "country", "phone"]:
        if field in payload:
            value = payload.get(field)
            setattr(address, field, value.strip() if isinstance(value, str) else value)

    if payload.get("is_default") is True:
        _set_default_address(user.id, address)

    db.session.commit()
    return success_response(serialize_address(address), "Address updated")


@addresses_bp.delete("/<address_id>")
@jwt_required()
def delete_address(address_id):
    user = get_current_user()
    address = Address.query.filter_by(id=address_id, user_id=user.id).first()
    if not address:
        return error_response("Address not found", 404)

    db.session.delete(address)
    db.session.commit()
    return success_response(message="Address removed")
