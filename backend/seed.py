from app import create_app
from app.extensions import db
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage

app = create_app()


def seed():
    with app.app_context():
        db.create_all()

        if Category.query.count() > 0:
            print("Seed data already exists.")
            return

        categories = [
            Category(name="Men", slug="men", description="Woody and bold fragrances."),
            Category(name="Women", slug="women", description="Floral and elegant fragrances."),
            Category(name="Sets", slug="sets", description="Gift-ready fragrance sets."),
        ]

        for category in categories:
            db.session.add(category)
        db.session.flush()

        products = [
            Product(
                category_id=categories[0].id,
                name="Midnight Oud",
                slug="midnight-oud",
                description="A deep woody fragrance layered with oud, amber, and smoked spice.",
                price=96,
                is_featured=True,
                stock_quantity=18,
            ),
            Product(
                category_id=categories[1].id,
                name="Rose Elixir",
                slug="rose-elixir",
                description="Bulgarian rose and jasmine over soft vanilla and white musk.",
                price=89,
                is_featured=True,
                stock_quantity=20,
            ),
            Product(
                category_id=categories[2].id,
                name="Signature Gift Set",
                slug="signature-gift-set",
                description="A full-size perfume, travel spray, and body mist in one polished box.",
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
                image_url="https://via.placeholder.com/600x600.png?text=Midnight+Oud",
                alt_text="Midnight Oud perfume bottle",
                sort_order=0,
            ),
            ProductImage(
                product_id=products[1].id,
                image_url="https://via.placeholder.com/600x600.png?text=Rose+Elixir",
                alt_text="Rose Elixir perfume bottle",
                sort_order=0,
            ),
            ProductImage(
                product_id=products[2].id,
                image_url="https://via.placeholder.com/600x600.png?text=Signature+Gift+Set",
                alt_text="Signature Gift Set",
                sort_order=0,
            ),
        ]

        for image in images:
            db.session.add(image)

        db.session.commit()
        print("Database seeded successfully.")


if __name__ == "__main__":
    seed()
