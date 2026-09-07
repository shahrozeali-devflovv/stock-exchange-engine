from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.stock import Stock
from app.models.wallet import Wallet
from app.models.portfolio import Portfolio
from app.models.transaction import Transaction
from app.models.user import User
from app.routers.users import get_current_user
from app.schemas.trade import BuyStockRequest, SellStockRequest

router = APIRouter(
    prefix="/trade",
    tags=["Trading"]
)


@router.post("/buy")
def buy_stock(
    request: BuyStockRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stock = db.query(Stock).filter(
        Stock.id == request.stock_id
    ).first()

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )

    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()

    total_cost = stock.current_price * request.quantity

    if wallet.balance < total_cost:
        raise HTTPException(
            status_code=400,
            detail="Insufficient balance"
        )

    wallet.balance -= total_cost

    position = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id,
        Portfolio.stock_id == stock.id
    ).first()

    if position:
        position.quantity += request.quantity
    else:
        position = Portfolio(
            user_id=current_user.id,
            stock_id=stock.id,
            quantity=request.quantity
        )
        db.add(position)

    transaction = Transaction(
        user_id=current_user.id,
        stock_id=stock.id,
        transaction_type="BUY",
        quantity=request.quantity,
        price=stock.current_price
    )

    db.add(transaction)

    db.commit()

    return {
        "message": "Stock purchased successfully",
        "stock": stock.symbol,
        "quantity": request.quantity,
        "cost": total_cost,
        "remaining_balance": wallet.balance
    }


@router.post("/sell")
def sell_stock(
    request: SellStockRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stock = db.query(Stock).filter(
        Stock.id == request.stock_id
    ).first()

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )

    position = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id,
        Portfolio.stock_id == stock.id
    ).first()

    if not position:
        raise HTTPException(
            status_code=400,
            detail="You do not own this stock"
        )

    if position.quantity < request.quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient shares"
        )

    total_value = stock.current_price * request.quantity

    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()

    position.quantity -= request.quantity

    wallet.balance += total_value

    if position.quantity == 0:
        db.delete(position)

    transaction = Transaction(
        user_id=current_user.id,
        stock_id=stock.id,
        transaction_type="SELL",
        quantity=request.quantity,
        price=stock.current_price
    )

    db.add(transaction)

    db.commit()

    return {
        "message": "Stock sold successfully",
        "stock": stock.symbol,
        "quantity": request.quantity,
        "value": total_value,
        "new_balance": wallet.balance
    }