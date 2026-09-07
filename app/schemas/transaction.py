from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: int
    stock_id: int
    symbol: str
    transaction_type: str
    quantity: int
    price: float

    class Config:
        from_attributes = True