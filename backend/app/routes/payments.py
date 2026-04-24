import stripe
from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models.address import Address
from ..models.order import Order
from ..services.cart_service import get_cart_snapshot
from ..utils.auth import get_current_user
from ..utils.responses import error_response, success_response

payments_bp = Blueprint("payments", __name__)


def _stripe_is_configured():
    return bool(
        current_app.config.get("STRIPE_SECRET_KEY")
        and current_app.config.get("STRIPE_PUBLISHABLE_KEY")
    )


def _configure_stripe():
    stripe.api_key = current_app.config["STRIPE_SECRET_KEY"]


@payments_bp.get("/config")
def payment_config():
    if not _stripe_is_configured():
        return error_response("Stripe is not configured for this environment", 503)

    return success_response(
        {
            "publishable_key": current_app.config["STRIPE_PUBLISHABLE_KEY"],
            "merchant_identifier": current_app.config["STRIPE_MERCHANT_IDENTIFIER"],
            "merchant_display_name": current_app.config["STRIPE_MERCHANT_DISPLAY_NAME"],
            "currency": current_app.config["STRIPE_CURRENCY"],
        }
    )


@payments_bp.post("/payment-sheet")
@jwt_required()
def create_payment_sheet():
    if not _stripe_is_configured():
        return error_response("Stripe is not configured for this environment", 503)

    user = get_current_user()
    payload = request.get_json() or {}
    address_id = payload.get("address_id")
    discount_code = (payload.get("discount_code") or "").strip() or None

    address = Address.query.filter_by(id=address_id, user_id=user.id).first() if address_id else None
    if not address:
        return error_response("Valid address_id is required", 400)

    cart_items, totals = get_cart_snapshot(
        user,
        address_id=address.id,
        discount_code=discount_code,
    )
    if not cart_items:
        return error_response("Cart is empty", 400)

    amount_cents = int(round(float(totals["total_amount"]) * 100))
    if amount_cents < 50:
        return error_response("Order total must be at least $0.50 to process payment", 400)

    _configure_stripe()

    payment_intent = stripe.PaymentIntent.create(
        amount=amount_cents,
        currency=current_app.config["STRIPE_CURRENCY"],
        automatic_payment_methods={"enabled": True},
        metadata={
            "user_id": user.id,
            "address_id": address.id,
            "discount_code": totals["discount_code"] or "",
        },
        receipt_email=user.email,
    )

    return success_response(
        {
            "payment_intent_id": payment_intent["id"],
            "payment_intent_client_secret": payment_intent["client_secret"],
            "merchant_display_name": current_app.config["STRIPE_MERCHANT_DISPLAY_NAME"],
            "merchant_identifier": current_app.config["STRIPE_MERCHANT_IDENTIFIER"],
            "currency": current_app.config["STRIPE_CURRENCY"],
            "total_amount": totals["total_amount"],
        }
    )
