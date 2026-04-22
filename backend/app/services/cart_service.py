from ..models.cart_item import CartItem


def calculate_cart_totals(cart_items):
    subtotal = sum(float(item.product.price) * item.quantity for item in cart_items)
    shipping_amount = 0 if subtotal >= 100 or subtotal == 0 else 12
    tax_amount = round(subtotal * 0.08, 2)
    total_amount = round(subtotal + shipping_amount + tax_amount, 2)

    return {
        "subtotal": round(subtotal, 2),
        "shipping_amount": round(shipping_amount, 2),
        "tax_amount": tax_amount,
        "total_amount": total_amount,
    }


def get_cart_snapshot(user):
    cart_items = (
        CartItem.query.filter_by(user_id=user.id)
        .join(CartItem.product)
        .order_by(CartItem.created_at.desc())
        .all()
    )
    totals = calculate_cart_totals(cart_items)
    return cart_items, totals
