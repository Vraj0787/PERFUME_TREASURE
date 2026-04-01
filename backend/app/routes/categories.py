from flask import Blueprint

from ..models.category import Category
from ..serializers import serialize_category
from ..utils.responses import error_response, success_response

categories_bp = Blueprint("categories", __name__)


@categories_bp.get("")
def list_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return success_response([serialize_category(category) for category in categories])


@categories_bp.get("/<slug>")
def get_category(slug):
    category = Category.query.filter_by(slug=slug).first()
    if not category:
        return error_response("Category not found", 404)
    return success_response(serialize_category(category))
