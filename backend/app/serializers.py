from flask import request


def _absolute_image_url(image_url):
    if not image_url:
        return None
    if image_url.startswith("http://") or image_url.startswith("https://"):
        return image_url
    if image_url.startswith("/"):
        return f"{request.host_url.rstrip('/')}{image_url}"
    return f"{request.host_url.rstrip('/')}/{image_url}"


def serialize_profile(profile):
    return {
        "id": profile.id,
        "full_name": profile.full_name,
        "phone": profile.phone,
        "notes": profile.notes,
    }


def serialize_user(user):
    return {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "loyalty_points_balance": user.loyalty_points_balance,
        "profile": serialize_profile(user.profile) if user.profile else None,
    }


def serialize_category(category):
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
    }


def serialize_product(product):
    primary_image = sorted(product.images, key=lambda image: image.sort_order)[0] if product.images else None
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "subtitle": product.subtitle,
        "description": product.description,
        "how_to_apply": product.how_to_apply,
        "size_label": product.size_label,
        "price": float(product.price),
        "compare_at_price": float(product.compare_at_price) if product.compare_at_price is not None else None,
        "is_active": product.is_active,
        "is_featured": product.is_featured,
        "stock_quantity": product.stock_quantity,
        "category": serialize_category(product.category) if product.category else None,
        "collection": {
            "id": product.collection.id,
            "name": product.collection.name,
            "slug": product.collection.slug,
        }
        if product.collection
        else None,
        "variants": [
            {
                "id": variant.id,
                "title": variant.title,
                "sku": variant.sku,
                "size_label": variant.size_label,
                "price": float(variant.price) if variant.price is not None else None,
                "stock_quantity": variant.stock_quantity,
                "is_default": variant.is_default,
            }
            for variant in product.variants
        ],
        "images": [
            {
                "id": image.id,
                "image_url": _absolute_image_url(image.image_url),
                "alt_text": image.alt_text,
                "sort_order": image.sort_order,
            }
            for image in sorted(product.images, key=lambda image: image.sort_order)
        ],
        "image": _absolute_image_url(primary_image.image_url) if primary_image else None,
    }


def serialize_cart_item(cart_item):
    return {
        "id": cart_item.id,
        "quantity": cart_item.quantity,
        "product": serialize_product(cart_item.product),
        "line_total": float(cart_item.product.price) * cart_item.quantity,
    }


def serialize_address(address):
    return {
        "id": address.id,
        "full_name": address.full_name,
        "line1": address.line1,
        "line2": address.line2,
        "city": address.city,
        "state": address.state,
        "postal_code": address.postal_code,
        "country": address.country,
        "phone": address.phone,
        "is_default": address.is_default,
    }


def serialize_order(order):
    return {
        "id": order.id,
        "status": order.status,
        "payment_status": order.payment_status,
        "subtotal": float(order.subtotal),
        "discount_amount": float(order.discount_amount),
        "discount_code": order.discount_code,
        "shipping_amount": float(order.shipping_amount),
        "tax_amount": float(order.tax_amount),
        "total_amount": float(order.total_amount),
        "points_earned": order.points_earned,
        "payment_method": order.payment_method,
        "transaction_reference": order.transaction_reference,
        "notes": order.notes,
        "created_at": order.created_at.isoformat(),
        "address": serialize_address(order.address) if order.address else None,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "unit_price": float(item.unit_price),
                "quantity": item.quantity,
            }
            for item in order.items
        ],
    }
