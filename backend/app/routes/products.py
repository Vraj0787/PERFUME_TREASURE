from flask import Blueprint, request
from flask import Blueprint, jsonify

from ..models.category import Category
from ..models.product import Product
from ..serializers import serialize_product
from ..utils.responses import error_response, success_response

products_bp = Blueprint("products", __name__)

@products_bp.route('/products/best-sellers', methods=['GET'])
def get_best_sellers():
    try:
        # get all products (adjust to your DB setup)
        products = Product.query.order_by(Product.sales.desc()).limit(5).all()

        result = []
        for p in products:
            result.append({
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "image": p.image,
                "description": p.description,
                "category": p.category
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.get("")
def list_products():
    query = Product.query.filter_by(is_active=True)

    category_slug = request.args.get("category")
    search = (request.args.get("search") or "").strip().lower()
    sort_by = request.args.get("sort", "featured")
    featured_only = request.args.get("featured")

    if category_slug and category_slug != "shop-all":
        category = Category.query.filter_by(slug=category_slug).first()
        if not category:
            return success_response([])
        query = query.filter_by(category_id=category.id)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    if featured_only == "true":
        query = query.filter_by(is_featured=True)

    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "name_asc":
        query = query.order_by(Product.name.asc())
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
