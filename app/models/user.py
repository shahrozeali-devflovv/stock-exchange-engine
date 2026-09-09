from sqlalchemy import Column, Integer, String

from app.database.base import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)

    email = Column(String, unique=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    full_name = Column(String, nullable=True)
    
    wallet = relationship(
    "Wallet",
    back_populates="user",
    uselist=False
)