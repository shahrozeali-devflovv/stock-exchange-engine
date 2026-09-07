from pydantic import BaseModel


class PortfolioResponse(BaseModel):
    stock_id: int
    symbol: str
    name: str
    quantity: int
    current_price: float
    market_value: float