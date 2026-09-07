from pydantic import BaseModel


class StockResponse(BaseModel):
    id: int
    symbol: str
    name: str
    current_price: float


class StockSyncRequest(BaseModel):
    symbol: str
    name: str