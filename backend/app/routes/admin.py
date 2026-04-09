import os
import uuid

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from sqlalchemy.orm import joinedload
from werkzeug.utils import secure_filename

from ..extensions import db
from ..models.address import Address
from ..models.category import Category
from ..models.order import Order
from ..models.product import Product
from ..models.product_image import ProductImage
from ..models.user import User
from ..utils.admin import admin_required

admin_bp = Blueprint("admin", __name__)


def _slugify(value):
    return "-".join(value.strip().lower().split())


def _save_uploaded_image(upload):
    if not upload or not upload.filename:
        return None

    filename = secure_filename(upload.filename)
    if not filename:
        return None

    _, extension = os.path.splitext(filename)
    generated_name = f"{uuid.uuid4().hex}{extension.lower()}"
    upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], generated_name)
    upload.save(upload_path)
    return f"/media/{generated_name}"


@admin_bp.get("/login")
def login():
    return render_template("admin/login.html")


@admin_bp.post("/login")
def login_submit():
    username = (request.form.get("username") or "").strip()
    password = request.form.get("password") or ""

    if (
        username == current_app.config["ADMIN_USERNAME"]
        and password == current_app.config["ADMIN_PASSWORD"]
    ):
        session["is_admin"] = True
        flash("Welcome back.", "success")
        return redirect(url_for("admin.dashboard"))

    flash("Invalid admin credentials.", "error")
    return redirect(url_for("admin.login"))


@admin_bp.post("/logout")
def logout():
    session.clear()
    flash("Signed out of admin.", "success")
    return redirect(url_for("admin.login"))


@admin_bp.get("")
@admin_required
def dashboard():
    search = (request.args.get("search") or "").strip()
    category_filter = (request.args.get("category_id") or "").strip()
    status_filter = (request.args.get("status") or "").strip()

    categories = Category.query.order_by(Category.name.asc()).all()
    products_query = Product.query

    if search:
        products_query = products_query.filter(Product.name.ilike(f"%{search}%"))

    if category_filter:
        products_query = products_query.filter(Product.category_id == category_filter)

    if status_filter == "active":
        products_query = products_query.filter(Product.is_active.is_(True))
    elif status_filter == "draft":
        products_query = products_query.filter(Product.is_active.is_(False))
    elif status_filter == "featured":
        products_query = products_query.filter(Product.is_featured.is_(True))
    elif status_filter == "low_stock":
        products_query = products_query.filter(Product.stock_quantity <= 5)

    products = products_query.order_by(Product.created_at.desc()).all()
    metrics = {
        "products_count": Product.query.count(),
        "categories_count": Category.query.count(),
        "featured_count": Product.query.filter_by(is_featured=True).count(),
        "low_stock_count": Product.query.filter(Product.stock_quantity <= 5).count(),
        "customers_count": User.query.count(),
        "orders_count": Order.query.count(),
    }
    return render_template(
        "admin/dashboard.html",
        categories=categories,
        products=products,
        metrics=metrics,
        search=search,
        category_filter=category_filter,
        status_filter=status_filter,
        media_prefix="",
    )


@admin_bp.get("/customers")
@admin_required
def customers():
    search = (request.args.get("search") or "").strip()
    customers_query = User.query.options(
        joinedload(User.profile),
        joinedload(User.addresses),
        joinedload(User.orders),
    )

    if search:
        search_like = f"%{search}%"
        customers_query = customers_query.outerjoin(User.profile).filter(
            (User.email.ilike(search_like)) | (Address.full_name.ilike(search_like))
        )

    customer_items = customers_query.order_by(User.created_at.desc()).all()
    return render_template(
        "admin/customers.html",
        title="Customers",
        customers=customer_items,
        search=search,
    )


@admin_bp.get("/customers/<customer_id>")
@admin_required
def customer_detail(customer_id):
    customer = (
        User.query.options(
            joinedload(User.profile),
            joinedload(User.addresses),
            joinedload(User.orders).joinedload(Order.items),
        )
        .filter_by(id=customer_id)
        .first_or_404()
    )
    return render_template(
        "admin/customer_detail.html",
        title="Customer Detail",
        customer=customer,
    )


@admin_bp.get("/orders")
@admin_required
def orders():
    status_filter = (request.args.get("status") or "").strip()
    search = (request.args.get("search") or "").strip()

    orders_query = Order.query.options(
        joinedload(Order.user).joinedload(User.profile),
        joinedload(Order.address),
        joinedload(Order.items),
    )

    if status_filter:
        orders_query = orders_query.filter(Order.status == status_filter)

    if search:
        search_like = f"%{search}%"
        orders_query = orders_query.join(Order.user).outerjoin(User.profile).filter(
            (Order.id.ilike(search_like))
            | (User.email.ilike(search_like))
            | (Address.full_name.ilike(search_like))
        )

    order_items = orders_query.order_by(Order.created_at.desc()).all()
    return render_template(
        "admin/orders.html",
        title="Orders",
        orders=order_items,
        search=search,
        status_filter=status_filter,
    )


@admin_bp.get("/orders/<order_id>")
@admin_required
def order_detail(order_id):
    order = (
        Order.query.options(
            joinedload(Order.user).joinedload(User.profile),
            joinedload(Order.address),
            joinedload(Order.items),
        )
        .filter_by(id=order_id)
        .first_or_404()
    )
    return render_template(
        "admin/order_detail.html",
        title="Order Detail",
        order=order,
    )


@admin_bp.post("/categories")
@admin_required
def create_category():
    name = (request.form.get("name") or "").strip()
    slug = (request.form.get("slug") or "").strip() or _slugify(name)
    description = (request.form.get("description") or "").strip() or None

    if not name:
        flash("Category name is required.", "error")
        return redirect(url_for("admin.dashboard"))

    if Category.query.filter((Category.name == name) | (Category.slug == slug)).first():
        flash("Category name or slug already exists.", "error")
        return redirect(url_for("admin.dashboard"))

    db.session.add(Category(name=name, slug=slug, description=description))
    db.session.commit()
    flash("Category created.", "success")
    return redirect(url_for("admin.dashboard"))


@admin_bp.post("/categories/<category_id>/delete")
@admin_required
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    db.session.delete(category)
    db.session.commit()
    flash("Category deleted.", "success")
    return redirect(url_for("admin.dashboard"))


@admin_bp.get("/categories/<category_id>/edit")
@admin_required
def edit_category(category_id):
    category = Category.query.get_or_404(category_id)
    return render_template(
        "admin/category_form.html",
        title="Edit Category",
        action_url=url_for("admin.update_category", category_id=category.id),
        category=category,
    )


@admin_bp.post("/categories/<category_id>")
@admin_required
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    name = (request.form.get("name") or "").strip()
    slug = (request.form.get("slug") or "").strip() or _slugify(name)
    description = (request.form.get("description") or "").strip() or None

    if not name:
        flash("Category name is required.", "error")
        return redirect(request.referrer or url_for("admin.dashboard"))

    existing_category = Category.query.filter(
        ((Category.name == name) | (Category.slug == slug)) & (Category.id != category.id)
    ).first()
    if existing_category:
        flash("Category name or slug already exists.", "error")
        return redirect(request.referrer or url_for("admin.dashboard"))

    category.name = name
    category.slug = slug
    category.description = description
    db.session.commit()
    flash("Category updated.", "success")
    return redirect(url_for("admin.dashboard"))


@admin_bp.get("/products/new")
@admin_required
def new_product():
    categories = Category.query.order_by(Category.name.asc()).all()
    return render_template(
        "admin/product_form.html",
        title="New Product",
        action_url=url_for("admin.create_product"),
        categories=categories,
        product=None,
        image_url="",
        image_preview_url="",
    )


@admin_bp.post("/products")
@admin_required
def create_product():
    return _save_product()


@admin_bp.get("/products/<product_id>/edit")
@admin_required
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)
    categories = Category.query.order_by(Category.name.asc()).all()
    image_url = product.images[0].image_url if product.images else ""
    image_preview_url = (
        image_url
        if image_url.startswith("http://") or image_url.startswith("https://")
        else url_for("media_file", filename=image_url.replace("/media/", ""))
        if image_url.startswith("/media/")
        else image_url
    )
    return render_template(
        "admin/product_form.html",
        title="Edit Product",
        action_url=url_for("admin.update_product", product_id=product.id),
        categories=categories,
        product=product,
        image_url=image_url,
        image_preview_url=image_preview_url,
    )


@admin_bp.post("/products/<product_id>")
@admin_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    return _save_product(product)


def _save_product(product=None):
    category_id = (request.form.get("category_id") or "").strip() or None
    name = (request.form.get("name") or "").strip()
    slug = (request.form.get("slug") or "").strip() or _slugify(name)
    description = (request.form.get("description") or "").strip()
    price = request.form.get("price")
    compare_at_price = (request.form.get("compare_at_price") or "").strip() or None
    stock_quantity = request.form.get("stock_quantity")
    image_url = (request.form.get("image_url") or "").strip()
    image_file = request.files.get("image_file")
    is_featured = request.form.get("is_featured") == "on"
    is_active = request.form.get("is_active") == "on"

    if not name or not description or not price or stock_quantity is None:
        flash("Name, description, price, and stock quantity are required.", "error")
        return redirect(request.referrer or url_for("admin.dashboard"))

    existing_product = Product.query.filter_by(slug=slug).first()
    if existing_product and (product is None or existing_product.id != product.id):
        flash("Product slug already exists.", "error")
        return redirect(request.referrer or url_for("admin.dashboard"))

    if product is None:
        product = Product()
        db.session.add(product)

    product.category_id = category_id
    product.name = name
    product.slug = slug
    product.description = description
    product.price = price
    product.compare_at_price = compare_at_price
    product.stock_quantity = int(stock_quantity)
    product.is_featured = is_featured
    product.is_active = is_active

    uploaded_image_path = _save_uploaded_image(image_file)
    final_image_url = uploaded_image_path or image_url

    if final_image_url:
        if product.images:
            product.images[0].image_url = final_image_url
            product.images[0].alt_text = name
        else:
            product.images.append(
                ProductImage(image_url=final_image_url, alt_text=name, sort_order=0)
            )

    db.session.commit()
    flash("Product saved.", "success")
    return redirect(url_for("admin.dashboard"))


@admin_bp.post("/products/<product_id>/delete")
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    flash("Product deleted.", "success")
    return redirect(url_for("admin.dashboard"))


@admin_bp.post("/products/<product_id>/inventory")
@admin_required
def update_inventory(product_id):
    product = Product.query.get_or_404(product_id)
    stock_quantity = request.form.get("stock_quantity")

    if stock_quantity is None or stock_quantity == "":
        flash("Stock quantity is required.", "error")
        return redirect(url_for("admin.dashboard"))

    product.stock_quantity = int(stock_quantity)
    db.session.commit()
    flash(f"Inventory updated for {product.name}.", "success")
    return redirect(url_for("admin.dashboard"))


@admin_bp.post("/products/<product_id>/toggle-active")
@admin_required
def toggle_product_active(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = not product.is_active
    db.session.commit()
    flash(
        f"{product.name} is now {'active' if product.is_active else 'draft'}.",
        "success",
    )
    return redirect(url_for("admin.dashboard"))


@admin_bp.post("/products/<product_id>/toggle-featured")
@admin_required
def toggle_product_featured(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_featured = not product.is_featured
    db.session.commit()
    flash(
        f"{product.name} is now {'featured' if product.is_featured else 'not featured'}.",
        "success",
    )
    return redirect(url_for("admin.dashboard"))
