from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from ..models.category import Category
from ..models.order_item import OrderItem
from ..models.product import Product
from ..models.review import Review
from ..models.user import User
from ..extensions import db
from ..serializers import serialize_product, serialize_review
from ..utils.responses import error_response, success_response

products_bp = Blueprint("products", __name__)


@products_bp.get("/best-sellers")
def get_best_sellers():
    try:
        products = Product.query.filter_by(is_best_seller=True).limit(5).all()

        return jsonify([{
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "image": p.image,
            "description": p.description,
            "category": p.category
        } for p in products])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return success_response([serialize_product(product) for product, _units_sold in top_products])

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


@products_bp.get("/<slug>/reviews")
def get_product_reviews(slug):
    product = Product.query.filter_by(slug=slug, is_active=True).first()
    if not product:
        return error_response("Product not found", 404)

    return success_response(
        {
            "product": serialize_product(product),
            "reviews": [serialize_review(review) for review in product.reviews],
        }
    )


@products_bp.get("/reviews/recent")
def get_recent_reviews():
    recent_reviews = (
        Review.query.join(Product, Review.product_id == Product.id)
        .filter(Product.is_active.is_(True))
        .order_by(Review.created_at.desc())
        .limit(20)
        .all()
    )
    return success_response([serialize_review(review) for review in recent_reviews])


@products_bp.post("/<slug>/reviews")
@jwt_required()
def create_product_review(slug):
    product = Product.query.filter_by(slug=slug, is_active=True).first()
    if not product:
        return error_response("Product not found", 404)

    payload = request.get_json() or {}
    try:
        rating = int(payload.get("rating", 0))
    except (TypeError, ValueError):
        rating = 0

    title = (payload.get("title") or "").strip()
    content = (payload.get("content") or "").strip()
    display_name = (payload.get("display_name") or "").strip()

    if rating < 1 or rating > 5:
        return error_response("Please provide a rating between 1 and 5", 400)
    if not title:
        return error_response("Review title is required", 400)
    if not content:
        return error_response("Review content is required", 400)

    current_user = User.query.filter_by(id=get_jwt_identity()).first()
    if not current_user:
        return error_response("User not found", 404)

    fallback_name = (
        display_name
        or (current_user.profile.full_name if current_user.profile else "")
        or current_user.email.split("@")[0]
    )

    review = Review.query.filter_by(user_id=current_user.id, product_id=product.id).first()
    if review:
        review.rating = rating
        review.title = title
        review.content = content
        review.display_name = fallback_name
    else:
        review = Review(
            user_id=current_user.id,
            product_id=product.id,
            rating=rating,
            title=title,
            content=content,
            display_name=fallback_name,
        )
        db.session.add(review)

    db.session.commit()
    return success_response(serialize_review(review), "Review saved", 201)
