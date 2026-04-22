from datetime import datetime, timezone

from ..models.address import Address
from ..models.cart_item import CartItem
from ..models.discount_code import DiscountCode
from ..models.shipping_setting import ShippingSetting
from ..models.tax_setting import TaxSetting


def _find_active_discount(code, subtotal):
    if not code:
        return None

    discount = DiscountCode.query.filter_by(code=code.strip().upper()).first()
    if not discount or not discount.is_active:
        return None

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if discount.starts_at and discount.starts_at > now:
        return None
    if discount.ends_at and discount.ends_at < now:
        return None
    if discount.usage_limit is not None and discount.usage_count >= discount.usage_limit:
        return None
    if (
        discount.minimum_order_amount is not None
        and subtotal < float(discount.minimum_order_amount)
    ):
        return None

    return discount


def _calculate_discount_amount(discount, subtotal):
    if not discount:
        return 0.0

    if discount.discount_type == "fixed":
        return min(float(discount.value), subtotal)

    if discount.discount_type == "percentage":
        return round(subtotal * (float(discount.value) / 100), 2)

    return 0.0


def _resolve_shipping_amount(subtotal, address=None):
    active_rules = (
        ShippingSetting.query.filter_by(is_active=True)
        .order_by(ShippingSetting.created_at.asc())
        .all()
    )
    if not active_rules:
        return 0 if subtotal >= 100 or subtotal == 0 else 12

    normalized_country = (address.country if address else "").strip().lower()
    for rule in active_rules:
        zone_name = (rule.zone_name or "").strip().lower()
        if normalized_country and zone_name not in {"all", "global", "worldwide"}:
            if zone_name not in normalized_country and normalized_country not in zone_name:
                continue
        threshold = (
            float(rule.free_shipping_threshold)
            if rule.free_shipping_threshold is not None
            else None
        )
        if threshold is not None and subtotal >= threshold:
            return 0.0
        return round(float(rule.flat_rate), 2)

    return 0 if subtotal >= 100 or subtotal == 0 else 12


def _resolve_tax_amount(taxable_subtotal, address=None):
    active_rules = (
        TaxSetting.query.filter_by(is_active=True)
        .order_by(TaxSetting.created_at.asc())
        .all()
    )
    if not active_rules:
        return round(taxable_subtotal * 0.08, 2)

    normalized_targets = []
    if address:
        normalized_targets.extend(
            [
                (address.country or "").strip().lower(),
                (address.state or "").strip().lower(),
                (address.city or "").strip().lower(),
            ]
        )

    for rule in active_rules:
        region_name = (rule.region_name or "").strip().lower()
        if normalized_targets and region_name not in {"default", "all", "global"}:
            if not any(
                target and (region_name in target or target in region_name)
                for target in normalized_targets
            ):
                continue
        return round(taxable_subtotal * (float(rule.rate_percent) / 100), 2)

    return 0.0 if normalized_targets else round(taxable_subtotal * 0.08, 2)


def calculate_cart_totals(cart_items, address=None, discount_code=None):
    subtotal = sum(float(item.product.price) * item.quantity for item in cart_items)
    discount = _find_active_discount(discount_code, subtotal)
    discount_amount = round(_calculate_discount_amount(discount, subtotal), 2)
    discounted_subtotal = max(round(subtotal - discount_amount, 2), 0)
    shipping_amount = _resolve_shipping_amount(discounted_subtotal, address)
    tax_amount = _resolve_tax_amount(discounted_subtotal, address)
    total_amount = round(discounted_subtotal + shipping_amount + tax_amount, 2)

    return {
        "subtotal": round(subtotal, 2),
        "discount_amount": discount_amount,
        "discount_code": discount.code if discount else None,
        "discounted_subtotal": discounted_subtotal,
        "shipping_amount": round(shipping_amount, 2),
        "tax_amount": tax_amount,
        "total_amount": total_amount,
    }


def get_cart_snapshot(user, address_id=None, discount_code=None):
    cart_items = (
        CartItem.query.filter_by(user_id=user.id)
        .join(CartItem.product)
        .order_by(CartItem.created_at.desc())
        .all()
    )
    address = None
    if address_id:
        address = Address.query.filter_by(id=address_id, user_id=user.id).first()
    totals = calculate_cart_totals(cart_items, address=address, discount_code=discount_code)
    return cart_items, totals
