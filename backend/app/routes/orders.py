from flask import Blueprint
from flask_jwt_extended import jwt_required

from ..models.order import Order
from ..serializers import serialize_order
from ..utils.auth import get_current_user
from ..utils.responses import error_response, success_response

orders_bp = Blueprint("orders", __name__)


@orders_bp.get("")
@jwt_required()
def list_orders():
    user = get_current_user()
    orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
    return success_response([serialize_order(order) for order in orders])


@orders_bp.get("/<order_id>")
@jwt_required()
def get_order(order_id):
    user = get_current_user()
    order = Order.query.filter_by(id=order_id, user_id=user.id).first()
    if not order:
        return error_response("Order not found", 404)
    return success_response(serialize_order(order))
