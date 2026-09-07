from sqlalchemy import Column, Integer, String, Float

from app.database.base import Base


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)

    symbol = Column(String, unique=True, nullable=False)

    name = Column(String, nullable=False)

    current_price = Column(Float, nullable=False)