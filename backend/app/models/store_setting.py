from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import BaseModel


class StoreSetting(BaseModel):
    __tablename__ = "store_settings"

    setting_key: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    setting_value: Mapped[str | None] = mapped_column(Text, nullable=True)
