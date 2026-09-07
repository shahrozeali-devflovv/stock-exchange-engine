from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.stock import Stock
from app.schemas.stock import StockResponse, StockSyncRequest
from app.services.market_service import get_stock_quote


router = APIRouter(
    prefix="/stocks",
    tags=["Stocks"]
)


@router.get(
    "",
    response_model=list[StockResponse]
)
def get_stocks(
    db: Session = Depends(get_db)
):
    return db.query(Stock).all()


@router.post(
    "/sync",
    response_model=StockResponse
)
def sync_stock(
    request: StockSyncRequest,
    db: Session = Depends(get_db)
):
    symbol = request.symbol.upper()

    data = get_stock_quote(symbol)

    quote = data.get("Global Quote", {})

    if not quote:
        raise HTTPException(
            status_code=404,
            detail="Stock quote not found"
        )

    price = quote.get("05. price")

    if not price:
        raise HTTPException(
            status_code=404,
            detail="Stock price not available"
        )

    stock = db.query(Stock).filter(
        Stock.symbol == symbol
    ).first()

    if stock:
        stock.name = request.name
        stock.current_price = float(price)
    else:
        stock = Stock(
            symbol=symbol,
            name=request.name,
            current_price=float(price)
        )

        db.add(stock)

    db.commit()
    db.refresh(stock)

    return stock