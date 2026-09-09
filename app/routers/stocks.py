from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.stock import Stock
from app.schemas.stock import StockResponse


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
    stocks = db.query(Stock).all()

    return stocks


@router.get(
    "/{stock_id}",
    response_model=StockResponse
)
def get_stock(
    stock_id: int,
    db: Session = Depends(get_db)
):
    stock = (
        db.query(Stock)
        .filter(Stock.id == stock_id)
        .first()
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )

    return stock