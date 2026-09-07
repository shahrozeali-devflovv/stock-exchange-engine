from pydantic import BaseModel


class WalletResponse(BaseModel):
    balance: float

    class Config:
        from_attributes = True