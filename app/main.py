from fastapi import FastAPI
from app.routers.health import router as health_router
from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
from app.routers.auth import router as auth_router
from app.models.user import User
from app.routers.users import router as users_router
from app.routers.wallet import router as wallet_router
from app.models.stock import Stock
from app.models.portfolio import Portfolio
from app.routers.trade import router as trade_router
from app.routers.stocks import router as stocks_router
from app.routers.portfolio import router as portfolio_router
from fastapi.middleware.cors import CORSMiddleware
from app.models.transaction import Transaction
from app.routers.transactions import router as transactions_router
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Create all tables

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(health_router)
app.include_router(users_router)
app.include_router(trade_router)
app.include_router(wallet_router)
app.include_router(stocks_router)
app.include_router(portfolio_router)
app.include_router(transactions_router)
print("Wallet router loaded")
@app.get("/")
def root():
    return {"message": "Welcome to the Stock Exchange Engine API!"}