from sqlalchemy import Boolean, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import BaseModel


class ShippingSetting(BaseModel):
    __tablename__ = "shipping_settings"

    zone_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    rate_name: Mapped[str] = mapped_column(String(255), nullable=False)
    flat_rate: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    free_shipping_threshold: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
