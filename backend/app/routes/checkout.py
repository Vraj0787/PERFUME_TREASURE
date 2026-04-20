from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models.address import Address
from ..models.cart_item import CartItem
from ..models.order import Order
from ..models.order_item import OrderItem
from ..serializers import serialize_order
from ..services.cart_service import get_cart_snapshot
from ..utils.auth import get_current_user
from ..utils.responses import error_response, success_response

checkout_bp = Blueprint("checkout", __name__)


@checkout_bp.post("")
@jwt_required()
def create_checkout():
    user = get_current_user()
    payload = request.get_json() or {}

    address_id = payload.get("address_id")
    payment_method = (payload.get("payment_method") or "cash_on_delivery").strip()

    address = Address.query.filter_by(id=address_id, user_id=user.id).first() if address_id else None
    if not address:
        return error_response("Valid address_id is required", 400)

    cart_items, totals = get_cart_snapshot(user)
    if not cart_items:
        return error_response("Cart is empty", 400)

    for cart_item in cart_items:
        if cart_item.product.stock_quantity < cart_item.quantity:
            return error_response(
                f"Not enough stock for {cart_item.product.name}",
                400,
            )

    order = Order(
        user_id=user.id,
        address_id=address.id,
        status="confirmed",
        payment_status="pending",
        subtotal=totals["subtotal"],
        shipping_amount=totals["shipping_amount"],
        tax_amount=totals["tax_amount"],
        total_amount=totals["total_amount"],
        payment_method=payment_method,
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
    db.session.commit()

    return success_response(
        serialize_order(order),
        "Order placed successfully",
        201,
    )
