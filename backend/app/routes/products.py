from flask import Blueprint, request

from ..models.category import Category
from ..models.product import Product
from ..serializers import serialize_product
from ..utils.responses import error_response, success_response

products_bp = Blueprint("products", __name__)


@products_bp.get("")
def list_products():
    query = Product.query.filter_by(is_active=True)

    category_slug = request.args.get("category")
    search = (request.args.get("search") or "").strip().lower()
    sort_by = request.args.get("sort", "featured")
    featured_only = request.args.get("featured")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)

    if category_slug and category_slug != "shop-all":
        category = Category.query.filter_by(slug=category_slug).first()
        if not category:
            return success_response([])
        query = query.filter_by(category_id=category.id)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    if featured_only == "true":
        query = query.filter_by(is_featured=True)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "name_asc":
        query = query.order_by(Product.name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Product.name.desc())
    elif sort_by == "date_asc":
        query = query.order_by(Product.created_at.asc())
    elif sort_by == "date_desc":
        query = query.order_by(Product.created_at.desc())
    elif sort_by == "relevance":
        query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())
    elif sort_by == "best_selling":
        query = query.order_by(Product.is_featured.desc(), Product.stock_quantity.asc())
    else:
        query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())

    products = query.all()
    return success_response([serialize_product(product) for product in products])


@products_bp.get("/<slug>")
def get_product(slug):
    product = Product.query.filter_by(slug=slug, is_active=True).first()
    if not product:
        return error_response("Product not found", 404)
    return success_response(serialize_product(product))
