import os

from app import create_app
from app.extensions import db
from app.models.category import Category
from app.models.collection import Collection
from app.models.discount_code import DiscountCode
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.product_variant import ProductVariant
from app.models.shipping_setting import ShippingSetting
from app.models.store_setting import StoreSetting
from app.models.tax_setting import TaxSetting

app = create_app()


def _local_seed_image_paths():
    preferred_files = [
        "4b2d228c66314b6c8e1ecae6051ec9e6.jpg",
        "bb611373e347450e864aa45e37a7eca2.jpg",
    ]
    available = []

    for filename in preferred_files:
        if os.path.exists(os.path.join(app.config["UPLOAD_FOLDER"], filename)):
            available.append(f"/media/{filename}")

    if len(available) < 3:
        for filename in sorted(os.listdir(app.config["UPLOAD_FOLDER"])):
            if filename.startswith("."):
                continue
            candidate = f"/media/{filename}"
            if candidate not in available:
                available.append(candidate)
            if len(available) == 3:
                break

    fallback = "https://placehold.co/600x600/png?text=Perfume+Treasure"
    while len(available) < 3:
        available.append(fallback)

    return available[:3]


def seed():
    with app.app_context():
        db.create_all()
        image_paths = _local_seed_image_paths()

        category_definitions = [
            {"name": "Men", "slug": "men", "description": "Woody and bold fragrances."},
            {"name": "Women", "slug": "women", "description": "Floral and elegant fragrances."},
            {"name": "Sets", "slug": "sets", "description": "Gift-ready fragrance sets."},
            {
                "name": "Shop All",
                "slug": "shop-all",
                "description": "Browse the full fragrance collection.",
            },
        ]

        category_map = {}
        for category_definition in category_definitions:
            category = Category.query.filter_by(slug=category_definition["slug"]).first()
            if not category:
                category = Category(**category_definition)
                db.session.add(category)
                db.session.flush()
            category_map[category.slug] = category

        collection_definitions = [
            {
                "name": "Bestsellers",
                "slug": "bestsellers",
                "description": "Top-performing fragrances shoppers come back for.",
            },
            {
                "name": "Luxury Gifting",
                "slug": "luxury-gifting",
                "description": "Curated gift-ready sets and signature picks.",
            },
        ]

        collection_map = {}
        for collection_definition in collection_definitions:
            collection = Collection.query.filter_by(slug=collection_definition["slug"]).first()
            if not collection:
                collection = Collection(**collection_definition)
                db.session.add(collection)
                db.session.flush()
            collection_map[collection.slug] = collection

        if Product.query.count() == 0:
            products = [
                Product(
                    category_id=category_map["men"].id,
                    collection_id=collection_map["bestsellers"].id,
                    name="Midnight Oud",
                    slug="midnight-oud",
                    subtitle="Smoky oud with amber depth",
                    description="A deep woody fragrance layered with oud, amber, and smoked spice.",
                    how_to_apply="Wrist (don't rub)\nNeck & collarbone\nBehind ears\nInside elbows",
                    size_label="100ml (3.4oz)",
                    price=96,
                    is_featured=True,
                    stock_quantity=18,
                ),
                Product(
                    category_id=category_map["women"].id,
                    collection_id=collection_map["bestsellers"].id,
                    name="Rose Elixir",
                    slug="rose-elixir",
                    subtitle="Velvet florals with soft musk",
                    description="Bulgarian rose and jasmine over soft vanilla and white musk.",
                    how_to_apply="Wrist (don't rub)\nNeck & collarbone\nHair mist from a distance",
                    size_label="90ml (3.0oz)",
                    price=89,
                    is_featured=True,
                    stock_quantity=20,
                ),
                Product(
                    category_id=category_map["sets"].id,
                    collection_id=collection_map["luxury-gifting"].id,
                    name="Signature Gift Set",
                    slug="signature-gift-set",
                    subtitle="An elevated three-piece fragrance ritual",
                    description="A full-size perfume, travel spray, and body mist in one polished box.",
                    how_to_apply="Apply perfume to pulse points\nLayer with body mist\nRefresh with travel spray",
                    size_label="Gift Set",
                    price=148,
                    stock_quantity=12,
                ),
            ]

            for product in products:
                db.session.add(product)
            db.session.flush()

            images = [
                ProductImage(
                    product_id=products[0].id,
                    image_url=image_paths[0],
                    alt_text="Midnight Oud perfume bottle",
                    sort_order=0,
                ),
                ProductImage(
                    product_id=products[1].id,
                    image_url=image_paths[1],
                    alt_text="Rose Elixir perfume bottle",
                    sort_order=0,
                ),
                ProductImage(
                    product_id=products[2].id,
                    image_url=image_paths[2],
                    alt_text="Signature Gift Set",
                    sort_order=0,
                ),
            ]

            for image in images:
                db.session.add(image)

            variant_definitions = [
                (products[0], "100ml (3.4oz)", "MOU-100", "100ml (3.4oz)", 96, 18, True),
                (products[0], "50ml (1.7oz)", "MOU-050", "50ml (1.7oz)", 64, 12, False),
                (products[1], "90ml (3.0oz)", "REL-090", "90ml (3.0oz)", 89, 20, True),
                (products[1], "Travel Spray", "REL-015", "15ml", 28, 24, False),
                (products[2], "Gift Set", "SGS-SET", "Gift Set", 148, 12, True),
            ]
            for product, title, sku, size_label, price, stock, is_default in variant_definitions:
                db.session.add(
                    ProductVariant(
                        product_id=product.id,
                        title=title,
                        sku=sku,
                        size_label=size_label,
                        price=price,
                        stock_quantity=stock,
                        is_default=is_default,
                    )
                )
        else:
            products = Product.query.order_by(Product.created_at.asc()).all()
            for index, product in enumerate(products[:3]):
                if not product.collection_id:
                    collection_slug = (
                        "luxury-gifting" if product.category and product.category.slug == "sets" else "bestsellers"
                    )
                    product.collection_id = collection_map[collection_slug].id
                if not product.subtitle:
                    product.subtitle = (
                        "An elevated three-piece fragrance ritual"
                        if product.category and product.category.slug == "sets"
                        else "Signature scent for everyday wear"
                    )
                if not product.how_to_apply:
                    product.how_to_apply = (
                        "Wrist (don't rub)\nNeck & collarbone\nBehind ears\nInside elbows"
                    )
                if not product.size_label:
                    product.size_label = "100ml (3.4oz)"
                if not product.images:
                    db.session.add(
                        ProductImage(
                            product_id=product.id,
                            image_url=image_paths[index],
                            alt_text=product.name,
                            sort_order=0,
                        )
                    )
                elif (
                    product.images[0].image_url.startswith("http://via.placeholder.com")
                    or product.images[0].image_url.startswith("https://via.placeholder.com")
                ):
                    product.images[0].image_url = image_paths[index]
                    product.images[0].alt_text = product.name
                if not product.variants:
                    db.session.add(
                        ProductVariant(
                            product_id=product.id,
                            title=product.size_label or "Default",
                            sku=f"{product.slug[:8].upper()}-001",
                            size_label=product.size_label,
                            price=float(product.price),
                            stock_quantity=product.stock_quantity,
                            is_default=True,
                        )
                    )

        if not DiscountCode.query.filter_by(code="WELCOME10").first():
            db.session.add(
                DiscountCode(
                    code="WELCOME10",
                    discount_type="percentage",
                    value=10,
                    minimum_order_amount=50,
                    is_active=True,
                )
            )

        if not ShippingSetting.query.filter_by(zone_name="United States").first():
            db.session.add(
                ShippingSetting(
                    zone_name="United States",
                    rate_name="Standard Shipping",
                    flat_rate=9.99,
                    free_shipping_threshold=100,
                    is_active=True,
                )
            )

        if not TaxSetting.query.filter_by(region_name="United States").first():
            db.session.add(
                TaxSetting(
                    region_name="United States",
                    rate_percent=8.00,
                    is_active=True,
                )
            )

        for setting_key, setting_value in {
            "store_name": "Perfume Treasure",
            "support_email": "support@perfumetreasure.com",
            "currency_code": "USD",
        }.items():
            setting = StoreSetting.query.filter_by(setting_key=setting_key).first()
            if not setting:
                db.session.add(
                    StoreSetting(setting_key=setting_key, setting_value=setting_value)
                )
            elif not setting.setting_value:
                setting.setting_value = setting_value

        db.session.commit()
        print("Database seeded successfully.")


if __name__ == "__main__":
    seed()
