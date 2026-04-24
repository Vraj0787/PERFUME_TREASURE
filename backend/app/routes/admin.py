import os
import uuid
from datetime import datetime

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
from sqlalchemy import func
from werkzeug.utils import secure_filename

from ..extensions import db
from ..models.category import Category
from ..models.collection import Collection
from ..models.discount_code import DiscountCode
from ..models.order import Order
from ..models.order_item import OrderItem
from ..models.product import Product
from ..models.product_image import ProductImage
from ..models.product_variant import ProductVariant
from ..models.profile import Profile
from ..models.shipping_setting import ShippingSetting
from ..models.store_setting import StoreSetting
from ..models.tax_setting import TaxSetting
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


def _parse_decimal(value):
    return float(value) if value not in (None, "") else None


def _parse_datetime(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _upsert_store_setting(setting_key, setting_value):
    setting = StoreSetting.query.filter_by(setting_key=setting_key).first()
    if not setting:
        setting = StoreSetting(setting_key=setting_key)
        db.session.add(setting)
    setting.setting_value = setting_value
    return setting


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
    collection_filter = (request.args.get("collection_id") or "").strip()

    categories = Category.query.order_by(Category.name.asc()).all()
    collections = Collection.query.order_by(Collection.name.asc()).all()
    products_query = Product.query

    if search:
        products_query = products_query.filter(Product.name.ilike(f"%{search}%"))

    if category_filter:
        products_query = products_query.filter(Product.category_id == category_filter)

    if collection_filter:
        products_query = products_query.filter(Product.collection_id == collection_filter)

    if status_filter == "active":
        products_query = products_query.filter(Product.is_active.is_(True))
    elif status_filter == "draft":
        products_query = products_query.filter(Product.is_active.is_(False))
    elif status_filter == "featured":
        products_query = products_query.filter(Product.is_featured.is_(True))
    elif status_filter == "low_stock":
        products_query = products_query.filter(Product.stock_quantity <= 5)

    products = products_query.order_by(Product.created_at.desc()).all()
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    top_products = (
        db.session.query(
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("units_sold"),
        )
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    metrics = {
        "products_count": Product.query.count(),
        "categories_count": Category.query.count(),
        "collections_count": Collection.query.count(),
        "featured_count": Product.query.filter_by(is_featured=True).count(),
        "low_stock_count": Product.query.filter(Product.stock_quantity <= 5).count(),
        "customers_count": User.query.count(),
        "orders_count": Order.query.count(),
        "sales_total": float(
            db.session.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar() or 0
        ),
    }
    return render_template(
        "admin/dashboard.html",
        categories=categories,
        collections=collections,
        products=products,
        metrics=metrics,
        search=search,
        category_filter=category_filter,
        collection_filter=collection_filter,
        status_filter=status_filter,
        recent_orders=recent_orders,
        top_products=top_products,
        media_prefix="",
    )


@admin_bp.get("/analytics")
@admin_required
def analytics():
    total_sales = float(
        db.session.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar() or 0
    )
    total_orders = Order.query.count()
    average_order_value = total_sales / total_orders if total_orders else 0
    total_customers = User.query.count()
    total_products = Product.query.count()
    top_products = (
        db.session.query(
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.unit_price * OrderItem.quantity).label("revenue"),
        )
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(10)
        .all()
    )
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()

    return render_template(
        "admin/analytics.html",
        total_sales=total_sales,
        total_orders=total_orders,
        average_order_value=average_order_value,
        total_customers=total_customers,
        total_products=total_products,
        top_products=top_products,
        recent_orders=recent_orders,
    )


@admin_bp.get("/customers")
@admin_required
def customers():
    search = (request.args.get("search") or "").strip()
    customers_query = User.query

    if search:
        customers_query = customers_query.filter(User.email.ilike(f"%{search}%"))

    customers_list = customers_query.order_by(User.created_at.desc()).all()
    return render_template(
        "admin/customers.html",
        customers=customers_list,
        search=search,
    )


@admin_bp.get("/customers/<customer_id>")
@admin_required
def customer_detail(customer_id):
    customer = User.query.get_or_404(customer_id)
    return render_template(
        "admin/customer_detail.html",
        customer=customer,
    )


@admin_bp.post("/customers/<customer_id>/notes")
@admin_required
def update_customer_notes(customer_id):
    customer = User.query.get_or_404(customer_id)
    if not customer.profile:
        customer.profile = Profile(full_name=customer.email)
    customer.profile.notes = (request.form.get("notes") or "").strip() or None
    db.session.commit()
    flash("Customer notes updated.", "success")
    return redirect(url_for("admin.customer_detail", customer_id=customer.id))


@admin_bp.post("/customers/<customer_id>/delete")
@admin_required
def delete_customer(customer_id):
    customer = User.query.get_or_404(customer_id)

    for order in list(customer.orders):
        db.session.delete(order)

    db.session.delete(customer)
    db.session.commit()
    flash("Customer account and related records deleted.", "success")
    return redirect(url_for("admin.customers"))


@admin_bp.get("/orders")
@admin_required
def orders():
    search = (request.args.get("search") or "").strip()
    status_filter = (request.args.get("status") or "").strip()

    orders_query = Order.query

    if search:
        orders_query = orders_query.join(User).filter(User.email.ilike(f"%{search}%"))

    if status_filter:
        orders_query = orders_query.filter(Order.status == status_filter)

    orders_list = orders_query.order_by(Order.created_at.desc()).all()
    return render_template(
        "admin/orders.html",
        orders=orders_list,
        search=search,
        status_filter=status_filter,
    )


@admin_bp.get("/orders/<order_id>")
@admin_required
def order_detail(order_id):
    order = Order.query.get_or_404(order_id)
    return render_template(
        "admin/order_detail.html",
        order=order,
    )


@admin_bp.post("/orders/<order_id>/update")
@admin_required
def update_order(order_id):
    order = Order.query.get_or_404(order_id)
    status = (request.form.get("status") or "").strip() or order.status
    payment_status = (request.form.get("payment_status") or "").strip() or order.payment_status
    notes = (request.form.get("notes") or "").strip() or None

    order.status = status
    order.payment_status = payment_status
    order.notes = notes
    db.session.commit()
    flash("Order updated.", "success")
    return redirect(url_for("admin.order_detail", order_id=order.id))


@admin_bp.get("/collections")
@admin_required
def collections():
    collection_list = Collection.query.order_by(Collection.created_at.desc()).all()
    return render_template(
        "admin/collections.html",
        collections=collection_list,
    )


@admin_bp.post("/collections")
@admin_required
def create_collection():
    name = (request.form.get("name") or "").strip()
    slug = (request.form.get("slug") or "").strip() or _slugify(name)
    description = (request.form.get("description") or "").strip() or None

    if not name:
        flash("Collection name is required.", "error")
        return redirect(url_for("admin.collections"))

    existing = Collection.query.filter(
        (Collection.name == name) | (Collection.slug == slug)
    ).first()
    if existing:
        flash("Collection name or slug already exists.", "error")
        return redirect(url_for("admin.collections"))

    db.session.add(Collection(name=name, slug=slug, description=description))
    db.session.commit()
    flash("Collection created.", "success")
    return redirect(url_for("admin.collections"))


@admin_bp.post("/collections/<collection_id>/delete")
@admin_required
def delete_collection(collection_id):
    collection = Collection.query.get_or_404(collection_id)
    db.session.delete(collection)
    db.session.commit()
    flash("Collection deleted.", "success")
    return redirect(url_for("admin.collections"))


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
    collections = Collection.query.order_by(Collection.name.asc()).all()
    return render_template(
        "admin/product_form.html",
        title="New Product",
        action_url=url_for("admin.create_product"),
        categories=categories,
        collections=collections,
        product=None,
        image_url="",
        image_preview_url="",
        image_gallery_text="",
        variant_lines="",
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
    collections = Collection.query.order_by(Collection.name.asc()).all()
    image_url = product.images[0].image_url if product.images else ""
    image_preview_url = (
        image_url
        if image_url.startswith("http://") or image_url.startswith("https://")
        else url_for("media_file", filename=image_url.replace("/media/", ""))
        if image_url.startswith("/media/")
        else image_url
    )
    image_gallery_text = "\n".join(image.image_url for image in product.images)
    variant_lines = "\n".join(
        "|".join(
            [
                variant.title or "",
                variant.sku or "",
                variant.size_label or "",
                str(float(variant.price)) if variant.price is not None else "",
                str(variant.stock_quantity),
                "default" if variant.is_default else "",
            ]
        )
        for variant in product.variants
    )
    return render_template(
        "admin/product_form.html",
        title="Edit Product",
        action_url=url_for("admin.update_product", product_id=product.id),
        categories=categories,
        collections=collections,
        product=product,
        image_url=image_url,
        image_preview_url=image_preview_url,
        image_gallery_text=image_gallery_text,
        variant_lines=variant_lines,
    )


@admin_bp.post("/products/<product_id>")
@admin_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    return _save_product(product)


def _save_product(product=None):
    category_id = (request.form.get("category_id") or "").strip() or None
    collection_id = (request.form.get("collection_id") or "").strip() or None
    name = (request.form.get("name") or "").strip()
    slug = (request.form.get("slug") or "").strip() or _slugify(name)
    subtitle = (request.form.get("subtitle") or "").strip() or None
    description = (request.form.get("description") or "").strip()
    price = request.form.get("price")
    compare_at_price = (request.form.get("compare_at_price") or "").strip() or None
    stock_quantity = request.form.get("stock_quantity")
    image_url = (request.form.get("image_url") or "").strip()
    image_gallery_text = (request.form.get("image_gallery") or "").strip()
    image_files = request.files.getlist("image_files")
    size_label = (request.form.get("size_label") or "").strip() or None
    how_to_apply = (request.form.get("how_to_apply") or "").strip() or None
    variant_lines = (request.form.get("variant_lines") or "").strip()
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
    product.collection_id = collection_id
    product.name = name
    product.slug = slug
    product.subtitle = subtitle
    product.description = description
    product.how_to_apply = how_to_apply
    product.size_label = size_label
    product.price = price
    product.compare_at_price = compare_at_price
    product.stock_quantity = int(stock_quantity)
    product.is_featured = is_featured
    product.is_active = is_active

    gallery_urls = []
    if image_url:
        gallery_urls.append(image_url)

    if image_gallery_text:
        gallery_urls.extend(
            [line.strip() for line in image_gallery_text.splitlines() if line.strip()]
        )

    for image_file in image_files:
        uploaded_image_path = _save_uploaded_image(image_file)
        if uploaded_image_path:
            gallery_urls.append(uploaded_image_path)

    deduped_gallery_urls = []
    for gallery_url in gallery_urls:
        if gallery_url not in deduped_gallery_urls:
            deduped_gallery_urls.append(gallery_url)

    product.images.clear()
    for sort_order, gallery_url in enumerate(deduped_gallery_urls):
        product.images.append(
            ProductImage(image_url=gallery_url, alt_text=name, sort_order=sort_order)
        )

    product.variants.clear()
    parsed_variants = []
    for line in variant_lines.splitlines():
        if not line.strip():
            continue
        parts = [part.strip() for part in line.split("|")]
        title_part = parts[0] if len(parts) > 0 else ""
        sku_part = parts[1] if len(parts) > 1 else None
        size_part = parts[2] if len(parts) > 2 else None
        price_part = _parse_decimal(parts[3]) if len(parts) > 3 else None
        stock_part = int(parts[4]) if len(parts) > 4 and parts[4] else 0
        is_default_part = len(parts) > 5 and parts[5].lower() == "default"
        if title_part:
            parsed_variants.append(
                ProductVariant(
                    title=title_part,
                    sku=sku_part or None,
                    size_label=size_part or None,
                    price=price_part,
                    stock_quantity=stock_part,
                    is_default=is_default_part,
                )
            )

    if not parsed_variants and size_label:
        parsed_variants.append(
            ProductVariant(
                title=size_label,
                sku=None,
                size_label=size_label,
                price=float(price),
                stock_quantity=int(stock_quantity),
                is_default=True,
            )
        )

    if parsed_variants and not any(variant.is_default for variant in parsed_variants):
        parsed_variants[0].is_default = True

    for variant in parsed_variants:
        product.variants.append(variant)

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


@admin_bp.get("/discounts")
@admin_required
def discounts():
    discount_list = DiscountCode.query.order_by(DiscountCode.created_at.desc()).all()
    return render_template("admin/discounts.html", discounts=discount_list)


@admin_bp.post("/discounts")
@admin_required
def create_discount():
    code = (request.form.get("code") or "").strip().upper()
    discount_type = (request.form.get("discount_type") or "percentage").strip()
    value = request.form.get("value")

    if not code or not value:
        flash("Code and value are required.", "error")
        return redirect(url_for("admin.discounts"))

    discount = DiscountCode(
        code=code,
        discount_type=discount_type,
        value=float(value),
        minimum_order_amount=_parse_decimal(request.form.get("minimum_order_amount")),
        usage_limit=int(request.form["usage_limit"]) if request.form.get("usage_limit") else None,
        is_active=request.form.get("is_active") == "on",
        starts_at=_parse_datetime(request.form.get("starts_at")),
        ends_at=_parse_datetime(request.form.get("ends_at")),
    )
    db.session.add(discount)
    db.session.commit()
    flash("Discount code created.", "success")
    return redirect(url_for("admin.discounts"))


@admin_bp.post("/discounts/<discount_id>/toggle")
@admin_required
def toggle_discount(discount_id):
    discount = DiscountCode.query.get_or_404(discount_id)
    discount.is_active = not discount.is_active
    db.session.commit()
    flash("Discount updated.", "success")
    return redirect(url_for("admin.discounts"))


@admin_bp.post("/discounts/<discount_id>/delete")
@admin_required
def delete_discount(discount_id):
    discount = DiscountCode.query.get_or_404(discount_id)
    db.session.delete(discount)
    db.session.commit()
    flash("Discount deleted.", "success")
    return redirect(url_for("admin.discounts"))


@admin_bp.get("/settings")
@admin_required
def settings():
    shipping_settings = ShippingSetting.query.order_by(ShippingSetting.created_at.desc()).all()
    tax_settings = TaxSetting.query.order_by(TaxSetting.created_at.desc()).all()
    store_settings = {
        setting.setting_key: setting.setting_value
        for setting in StoreSetting.query.order_by(StoreSetting.setting_key.asc()).all()
    }
    return render_template(
        "admin/settings.html",
        shipping_settings=shipping_settings,
        tax_settings=tax_settings,
        store_settings=store_settings,
    )


@admin_bp.post("/settings/store")
@admin_required
def update_store_settings():
    _upsert_store_setting("store_name", (request.form.get("store_name") or "").strip())
    _upsert_store_setting("support_email", (request.form.get("support_email") or "").strip())
    _upsert_store_setting("currency_code", (request.form.get("currency_code") or "").strip())
    db.session.commit()
    flash("Store settings updated.", "success")
    return redirect(url_for("admin.settings"))


@admin_bp.post("/settings/shipping")
@admin_required
def create_shipping_setting():
    zone_name = (request.form.get("zone_name") or "").strip()
    rate_name = (request.form.get("rate_name") or "").strip()
    flat_rate = request.form.get("flat_rate")

    if not zone_name or not rate_name or flat_rate in (None, ""):
        flash("Shipping zone, rate name, and flat rate are required.", "error")
        return redirect(url_for("admin.settings"))

    db.session.add(
        ShippingSetting(
            zone_name=zone_name,
            rate_name=rate_name,
            flat_rate=float(flat_rate),
            free_shipping_threshold=_parse_decimal(request.form.get("free_shipping_threshold")),
            is_active=request.form.get("is_active") == "on",
        )
    )
    db.session.commit()
    flash("Shipping rule created.", "success")
    return redirect(url_for("admin.settings"))


@admin_bp.post("/settings/shipping/<shipping_id>/delete")
@admin_required
def delete_shipping_setting(shipping_id):
    shipping_setting = ShippingSetting.query.get_or_404(shipping_id)
    db.session.delete(shipping_setting)
    db.session.commit()
    flash("Shipping rule deleted.", "success")
    return redirect(url_for("admin.settings"))


@admin_bp.post("/settings/tax")
@admin_required
def create_tax_setting():
    region_name = (request.form.get("region_name") or "").strip()
    rate_percent = request.form.get("rate_percent")

    if not region_name or rate_percent in (None, ""):
        flash("Region name and tax rate are required.", "error")
        return redirect(url_for("admin.settings"))

    db.session.add(
        TaxSetting(
            region_name=region_name,
            rate_percent=float(rate_percent),
            is_active=request.form.get("is_active") == "on",
        )
    )
    db.session.commit()
    flash("Tax rule created.", "success")
    return redirect(url_for("admin.settings"))


@admin_bp.post("/settings/tax/<tax_id>/delete")
@admin_required
def delete_tax_setting(tax_id):
    tax_setting = TaxSetting.query.get_or_404(tax_id)
    db.session.delete(tax_setting)
    db.session.commit()
    flash("Tax rule deleted.", "success")
    return redirect(url_for("admin.settings"))
