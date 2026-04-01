def serialize_profile(profile):
    return {
        "id": profile.id,
        "full_name": profile.full_name,
        "phone": profile.phone,
    }


def serialize_user(user):
    return {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active,
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
        "description": product.description,
        "price": float(product.price),
        "compare_at_price": float(product.compare_at_price) if product.compare_at_price is not None else None,
        "is_active": product.is_active,
        "is_featured": product.is_featured,
        "stock_quantity": product.stock_quantity,
        "category": serialize_category(product.category) if product.category else None,
        "images": [
            {
                "id": image.id,
                "image_url": image.image_url,
                "alt_text": image.alt_text,
                "sort_order": image.sort_order,
            }
            for image in sorted(product.images, key=lambda image: image.sort_order)
        ],
        "image": primary_image.image_url if primary_image else None,
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
        "shipping_amount": float(order.shipping_amount),
        "tax_amount": float(order.tax_amount),
        "total_amount": float(order.total_amount),
        "payment_method": order.payment_method,
        "transaction_reference": order.transaction_reference,
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
