from sqlalchemy import Boolean, DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import BaseModel


class DiscountCode(BaseModel):
    __tablename__ = "discount_codes"

    code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    discount_type: Mapped[str] = mapped_column(String(32), nullable=False, default="percentage")
    value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    minimum_order_amount: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    usage_limit: Mapped[int | None] = mapped_column(nullable=True)
    usage_count: Mapped[int] = mapped_column(nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    starts_at: Mapped[object | None] = mapped_column(DateTime, nullable=True)
    ends_at: Mapped[object | None] = mapped_column(DateTime, nullable=True)
