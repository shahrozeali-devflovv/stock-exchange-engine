from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.stock import Stock
from app.models.wallet import Wallet
from app.models.portfolio import Portfolio
from app.models.transaction import Transaction
from app.models.user import User
from app.routers.users import get_current_user
from app.schemas.trade import BuyStockRequest

router = APIRouter(
    prefix="/trade",
    tags=["Trading"],
)


# -------------------------
# BUY STOCK
# -------------------------
@router.post("/buy")
def buy_stock(
    request: BuyStockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Check quantity
    if request.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0",
        )

    # 2. Find stock
    stock = (
        db.query(Stock)
        .filter(Stock.id == request.stock_id)
        .first()
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found",
        )

    # 3. Find user's wallet
    wallet = (
        db.query(Wallet)
        .filter(Wallet.user_id == current_user.id)
        .first()
    )

    if not wallet:
        raise HTTPException(
            status_code=404,
            detail="Wallet not found",
        )

    # 4. Calculate cost
    total_cost = stock.current_price * request.quantity

    # 5. Check balance
    if wallet.balance < total_cost:
        raise HTTPException(
            status_code=400,
            detail="Insufficient wallet balance",
        )

    try:
        # 6. Deduct money
        wallet.balance -= total_cost

        # 7. Check if user already owns this stock
        portfolio_item = (
            db.query(Portfolio)
            .filter(
                Portfolio.user_id == current_user.id,
                Portfolio.stock_id == stock.id,
            )
            .first()
        )

        # 8. Update portfolio
        if portfolio_item:
            portfolio_item.quantity += request.quantity

        else:
            portfolio_item = Portfolio(
                user_id=current_user.id,
                stock_id=stock.id,
                quantity=request.quantity,
            )

            db.add(portfolio_item)

        # 9. Save BUY transaction
        transaction = Transaction(
            user_id=current_user.id,
            stock_id=stock.id,
            transaction_type="BUY",
            quantity=request.quantity,
            price=stock.current_price,
        )

        db.add(transaction)

        # 10. Save everything together
        db.commit()

        db.refresh(wallet)
        db.refresh(portfolio_item)
        db.refresh(transaction)

        return {
            "message": "Stock purchased successfully",
            "stock": stock.symbol,
            "quantity": request.quantity,
            "price": stock.current_price,
            "total_cost": total_cost,
            "remaining_balance": wallet.balance,
            "portfolio_quantity": portfolio_item.quantity,
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to complete buy transaction",
        )


# -------------------------
# SELL STOCK
# -------------------------
@router.post("/sell")
def sell_stock(
    request: BuyStockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Check quantity
    if request.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0",
        )

    # 2. Find stock
    stock = (
        db.query(Stock)
        .filter(Stock.id == request.stock_id)
        .first()
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found",
        )

    # 3. Find user's portfolio holding
    portfolio_item = (
        db.query(Portfolio)
        .filter(
            Portfolio.user_id == current_user.id,
            Portfolio.stock_id == stock.id,
        )
        .first()
    )

    if not portfolio_item:
        raise HTTPException(
            status_code=400,
            detail="You do not own this stock",
        )

    # 4. Check available quantity
    if portfolio_item.quantity < request.quantity:
        raise HTTPException(
            status_code=400,
            detail="You do not own enough shares",
        )

    # 5. Find wallet
    wallet = (
        db.query(Wallet)
        .filter(Wallet.user_id == current_user.id)
        .first()
    )

    if not wallet:
        raise HTTPException(
            status_code=404,
            detail="Wallet not found",
        )

    # 6. Calculate money received
    total_value = stock.current_price * request.quantity

    try:
        # 7. Add money to wallet
        wallet.balance += total_value

        # 8. Reduce portfolio quantity
        portfolio_item.quantity -= request.quantity

        # If user sold all shares, remove holding
        remaining_quantity = portfolio_item.quantity

        if portfolio_item.quantity == 0:
            db.delete(portfolio_item)

        # 9. Save SELL transaction
        transaction = Transaction(
            user_id=current_user.id,
            stock_id=stock.id,
            transaction_type="SELL",
            quantity=request.quantity,
            price=stock.current_price,
        )

        db.add(transaction)

        # 10. Save everything
        db.commit()

        db.refresh(wallet)
        db.refresh(transaction)

        return {
            "message": "Stock sold successfully",
            "stock": stock.symbol,
            "quantity": request.quantity,
            "price": stock.current_price,
            "total_value": total_value,
            "remaining_balance": wallet.balance,
            "portfolio_quantity": remaining_quantity,
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to complete sell transaction",
        )