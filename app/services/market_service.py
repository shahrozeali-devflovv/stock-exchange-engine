from app.database.session import SessionLocal
from app.models.stock import Stock
from app.core.redis import redis_client
from app.core.logging import logger

def update_stock_price(symbol: str, price: float):
    db = SessionLocal()

    try:
        stock = (
            db.query(Stock)
            .filter(Stock.symbol == symbol)
            .first()
        )

        if not stock:
            stock = Stock(
                symbol=symbol,
                name=symbol,
                current_price=price,
            )

            db.add(stock)

        else:
            stock.current_price = price

        db.commit()
        db.refresh(stock)

        return stock.id

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

def cache_stock_price(symbol: str, price: float):
    redis_client.set(
        f"price:{symbol}",
        price
    )
    