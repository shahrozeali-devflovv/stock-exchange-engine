from pydantic import BaseModel, Field


class BuyStockRequest(BaseModel):
    stock_id: int
    quantity: int = Field(gt=0)


class SellStockRequest(BaseModel):
    stock_id: int
    quantity: int = Field(gt=0)