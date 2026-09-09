from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.wallet import Wallet
from app.core.security import hash_password
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from fastapi import HTTPException
from app.core.security import (
    verify_password,
    create_access_token
)
from app.schemas.user import UserLogin
from app.core.rate_limiter import login_rate_limiter
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
    _: None = Depends(login_rate_limiter)
):
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        user.password,
        db_user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    access_token = create_access_token(
        data={
            "sub": str(db_user.id)
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_email = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_username = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    wallet = Wallet(
        user_id=db_user.id,
        balance=10000000
    )

    db.add(wallet)
    db.commit()

    return db_user