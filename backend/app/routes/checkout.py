from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required
import stripe

from ..extensions import db
from ..models.address import Address
from ..models.cart_item import CartItem
from ..models.discount_code import DiscountCode
from ..models.order import Order
from ..models.order_item import OrderItem
from ..serializers import serialize_order
from ..services.cart_service import get_cart_snapshot
from ..utils.auth import get_current_user
from ..utils.responses import error_response, success_response

checkout_bp = Blueprint("checkout", __name__)


@checkout_bp.post("/quote")
@jwt_required()
def checkout_quote():
    user = get_current_user()
    payload = request.get_json() or {}
    address_id = payload.get("address_id")
    discount_code = (payload.get("discount_code") or "").strip() or None

    if address_id:
        address = Address.query.filter_by(id=address_id, user_id=user.id).first()
        if not address:
            return error_response("Valid address_id is required", 400)

    cart_items, totals = get_cart_snapshot(
        user,
        address_id=address_id,
        discount_code=discount_code,
    )
    if not cart_items:
        return error_response("Cart is empty", 400)

    return success_response(totals)


@checkout_bp.post("")
@jwt_required()
def create_checkout():
    user = get_current_user()
    payload = request.get_json() or {}

    address_id = payload.get("address_id")
    discount_code = (payload.get("discount_code") or "").strip() or None
    payment_method = (payload.get("payment_method") or "manual_review").strip()
    payment_intent_id = (payload.get("payment_intent_id") or "").strip() or None

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

    for cart_item in cart_items:
        if cart_item.product.stock_quantity < cart_item.quantity:
            return error_response(
                f"Not enough stock for {cart_item.product.name}",
                400,
            )

    order_status = "pending"
    payment_status = "pending"
    transaction_reference = None

    if payment_method == "stripe":
        if not payment_intent_id:
            return error_response("payment_intent_id is required for Stripe payments", 400)
        if not current_app.config.get("STRIPE_SECRET_KEY"):
            return error_response("Stripe is not configured for this environment", 503)

        stripe.api_key = current_app.config["STRIPE_SECRET_KEY"]
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        if payment_intent.get("status") != "succeeded":
            return error_response("Stripe payment has not been completed", 400)

        amount_received = int(payment_intent.get("amount_received") or payment_intent.get("amount") or 0)
        expected_amount = int(round(float(totals["total_amount"]) * 100))
        if amount_received != expected_amount:
            return error_response("Stripe payment amount does not match the order total", 400)

        existing_order = Order.query.filter_by(transaction_reference=payment_intent_id).first()
        if existing_order:
            return success_response(serialize_order(existing_order), "Order already exists")

        order_status = "confirmed"
        payment_status = "paid"
        transaction_reference = payment_intent_id

    order = Order(
        user_id=user.id,
        address_id=address.id,
        status=order_status,
        payment_status=payment_status,
        subtotal=totals["subtotal"],
        discount_amount=totals["discount_amount"],
        shipping_amount=totals["shipping_amount"],
        tax_amount=totals["tax_amount"],
        total_amount=totals["total_amount"],
        points_earned=int(totals["discounted_subtotal"]),
        payment_method=payment_method,
        transaction_reference=transaction_reference,
        discount_code=totals["discount_code"],
    )
    db.session.add(order)
    db.session.flush()

    for cart_item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product.id,
            product_name=cart_item.product.name,
            unit_price=cart_item.product.price,
            quantity=cart_item.quantity,
        )
        cart_item.product.stock_quantity -= cart_item.quantity
        db.session.add(order_item)

    CartItem.query.filter_by(user_id=user.id).delete()
    user.loyalty_points_balance += order.points_earned
    if totals["discount_code"]:
        discount = DiscountCode.query.filter_by(code=totals["discount_code"]).first()
        if discount:
            discount.usage_count += 1
    db.session.commit()

    return success_response(
        serialize_order(order),
        "Order placed successfully",
        201,
    )
