from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models.cart_item import CartItem
from ..models.product import Product
from ..serializers import serialize_cart_item
from ..services.cart_service import get_cart_snapshot
from ..utils.auth import get_current_user
from ..utils.responses import error_response, success_response

cart_bp = Blueprint("cart", __name__)


@cart_bp.get("")
@jwt_required()
def get_cart():
    user = get_current_user()
    cart_items, totals = get_cart_snapshot(user)

    return success_response(
        {
            "items": [serialize_cart_item(item) for item in cart_items],
            "totals": totals,
        }
    )


@cart_bp.post("/items")
@jwt_required()
def add_cart_item():
    user = get_current_user()
    payload = request.get_json() or {}
    product_id = payload.get("product_id")
    quantity = int(payload.get("quantity", 1))

    if not product_id:
        return error_response("product_id is required")

    if quantity < 1:
        return error_response("quantity must be at least 1")

    product = Product.query.filter_by(id=product_id, is_active=True).first()
    if not product:
        return error_response("Product not found", 404)

    if product.stock_quantity < quantity:
        return error_response("Requested quantity exceeds available stock", 400)

    cart_item = CartItem.query.filter_by(user_id=user.id, product_id=product_id).first()

    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(user_id=user.id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)

    db.session.commit()
    return success_response(serialize_cart_item(cart_item), "Item added to cart", 201)


@cart_bp.patch("/items/<item_id>")
@jwt_required()
def update_cart_item(item_id):
    user = get_current_user()
    payload = request.get_json() or {}
    quantity = int(payload.get("quantity", 1))

    cart_item = CartItem.query.filter_by(id=item_id, user_id=user.id).first()
    if not cart_item:
        return error_response("Cart item not found", 404)

    if quantity <= 0:
        db.session.delete(cart_item)
        db.session.commit()
        return success_response(message="Cart item removed")

    if cart_item.product.stock_quantity < quantity:
        return error_response("Requested quantity exceeds available stock", 400)

    cart_item.quantity = quantity
    db.session.commit()
    return success_response(serialize_cart_item(cart_item), "Cart item updated")



@cart_bp.delete("/items/<item_id>")
@jwt_required()
def delete_cart_item(item_id):
    user = get_current_user()
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user.id).first()
    if not cart_item:
        return error_response("Cart item not found", 404)

    db.session.delete(cart_item)
    db.session.commit()
    return success_response(message="Cart item removed")


@cart_bp.delete("")
@jwt_required()
def clear_cart():
    user = get_current_user()
    CartItem.query.filter_by(user_id=user.id).delete()
    db.session.commit()
    return success_response(message="Cart cleared")
