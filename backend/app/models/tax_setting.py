from sqlalchemy import Boolean, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import BaseModel


class TaxSetting(BaseModel):
    __tablename__ = "tax_settings"

    region_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    rate_percent: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
