from sqlalchemy import Column, Integer, ForeignKey

from app.database.base import Base


class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)

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

    quantity = Column(
        Integer,
        nullable=False,
        default=0
    )