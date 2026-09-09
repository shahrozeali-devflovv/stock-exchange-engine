from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.transaction import Transaction
from app.models.stock import Stock
from app.models.user import User
from app.routers.users import get_current_user
from app.schemas.transaction import TransactionResponse


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.get(
    "",
    response_model=list[TransactionResponse]
)
def get_transactions(
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit

    transactions = db.query(
        Transaction,
        Stock
    ).join(
        Stock,
        Transaction.stock_id == Stock.id
    ).filter(
        Transaction.user_id == current_user.id
    ).order_by(
        Transaction.id.desc()
    ).offset(
        offset
    ).limit(
        limit
    ).all()

    result = []

    for transaction, stock in transactions:
        result.append({
            "id": transaction.id,
            "stock_id": stock.id,
            "symbol": stock.symbol,
            "transaction_type": transaction.transaction_type,
            "quantity": transaction.quantity,
            "price": transaction.price
        })

    return result