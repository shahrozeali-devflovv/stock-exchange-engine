import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# CI provides DATABASE_URL.
# When running locally, this fallback expects your Docker PostgreSQL
# to be available on localhost:5432.
TEST_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:admin@localhost:5432/stock_exchange_test",
)

# Environment variables must exist before importing app.main,
# because Settings() is created during import.
os.environ.setdefault("APP_NAME", "Stock Exchange Engine Test")
os.environ.setdefault("DEBUG", "False")
os.environ.setdefault("DATABASE_URL", TEST_DATABASE_URL)
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("ALPHA_VANTAGE_API_KEY", "test-key")
os.environ.setdefault("FINNHUB_API_KEY", "test-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

from app.database.base import Base
from app.database.dependencies import get_db
from app.main import app

# Import models so SQLAlchemy knows about all tables.
from app.models import User, Wallet, Stock, Portfolio, Transaction


test_engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db():
    database = TestingSessionLocal()

    try:
        yield database
    finally:
        database.close()