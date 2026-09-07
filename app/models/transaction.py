from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from app.database.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    stock_id = Column(
        Integer,
        ForeignKey("stocks.id"),
        nullable=False
    )

    transaction_type = Column(
        String,
        nullable=False
    )  # BUY or SELL

    quantity = Column(
        Integer,
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )