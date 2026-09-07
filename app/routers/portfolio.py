from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.portfolio import Portfolio
from app.models.stock import Stock
from app.models.user import User
from app.routers.users import get_current_user
from app.schemas.portfolio import PortfolioResponse

router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"]
)


@router.get(
    "",
    response_model=list[PortfolioResponse]
)
def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    positions = db.query(
        Portfolio,
        Stock
    ).join(
        Stock,
        Portfolio.stock_id == Stock.id
    ).filter(
        Portfolio.user_id == current_user.id
    ).all()

    portfolio = []

    for position, stock in positions:
        market_value = position.quantity * stock.current_price

        portfolio.append({
            "stock_id": stock.id,
            "symbol": stock.symbol,
            "name": stock.name,
            "quantity": position.quantity,
            "current_price": stock.current_price,
            "market_value": market_value
        })

    return portfolio