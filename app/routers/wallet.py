from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.wallet import Wallet
from app.models.user import User
from app.routers.users import get_current_user
from app.schemas.wallet import WalletResponse
router = APIRouter(
    prefix="/wallet",
    tags=["Wallet"]
)
@router.get(
    "",
    response_model=WalletResponse
)
def get_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()

    return wallet